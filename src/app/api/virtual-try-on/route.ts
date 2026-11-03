import { Client, handle_file } from "@gradio/client";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";

export const runtime = "nodejs";
// The public Gradio Space can spend several minutes waking up and processing
// a queued request. Keep this above the application timeout so the route does
// not cancel a job while the configured hosting platform still allows it.
export const maxDuration = 300;

const DEFAULT_VTON_SPACE = "https://yisol-idm-vton.hf.space";
const MAX_PERSON_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_PRODUCT_IMAGE_BYTES = 8 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = Math.max(
  60_000,
  Number(process.env.VTON_TIMEOUT_MS) || 240_000,
);
const DENOISE_STEPS = Math.max(
  10,
  Math.min(30, Number(process.env.VTON_DENOISE_STEPS) || 20),
);

type GarmentCategory = "upper_body" | "lower_body" | "dresses";

type RateBucket = { count: number; resetAt: number };
type JsonObject = Record<string, unknown>;

const rateBuckets = new Map<string, RateBucket>();
let clientPromise: Promise<Client> | null = null;

const consumeRateLimit = (key: string) => {
  const now = Date.now();
  const current = rateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    if (rateBuckets.size > 1_000) rateBuckets.clear();
    rateBuckets.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (current.count >= 3) return false;
  current.count += 1;
  return true;
};

const getClientKey = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  request.headers.get("x-real-ip") ||
  "unknown";

const supportedMimeTypes = new Set(["image/jpeg", "image/png"]);

const jpegProductUrl = (url: string) =>
  url.includes("/upload/")
    ? url.replace("/upload/", "/upload/f_jpg,q_auto/")
    : url;

const getVtonClient = () => {
  if (!clientPromise) {
    const space = process.env.VTON_SPACE_ID?.trim() || DEFAULT_VTON_SPACE;
    clientPromise = Client.connect(space).catch((error) => {
      clientPromise = null;
      throw error;
    });
  }
  return clientPromise;
};

// The public IDM-VTON Space only exposes the original upper-body schema.
// A category field must only be sent to an explicitly configured multi-category Space.
const isCategoryAwareSpace = (space: string) =>
  space !== DEFAULT_VTON_SPACE && process.env.VTON_CATEGORY_MODE === "true";

const isMiragicSpace = (space: string) =>
  space.toLowerCase().includes("miragic-ai/miragic-virtual-try-on") ||
  space.toLowerCase().includes("miragic-ai-miragic-virtual-try-on");

const miragicGarmentType: Record<GarmentCategory, string> = {
  upper_body: "Top",
  lower_body: "Bottom",
  dresses: "Dress/Suit",
};

const garmentCategoryLabel: Record<GarmentCategory, string> = {
  upper_body: "áo",
  lower_body: "quần hoặc chân váy",
  dresses: "đầm hoặc váy liền",
};

const isObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null;

const getOutputUrl = (value: unknown): string | null => {
  if (typeof value === "string") {
    return value.startsWith("http") || value.startsWith("data:")
      ? value
      : null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const url = getOutputUrl(item);
      if (url) return url;
    }
    return null;
  }
  if (!isObject(value)) return null;
  for (const key of ["url", "data", "path"]) {
    const url = getOutputUrl(value[key]);
    if (url) return url;
  }
  return null;
};

const isTimeoutError = (error: unknown) =>
  error instanceof Error &&
  (error.name === "AbortError" ||
    error.message.toLowerCase().includes("timeout"));

const isSpaceBusyError = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return ["queue", "overloaded", "loading", "sleeping", "unavailable"].some(
    (term) => message.includes(term),
  );
};

const isSpaceInferenceError = (error: unknown) =>
  error instanceof Error &&
  error.message.toLowerCase().includes("an error occurred");

export async function POST(request: Request) {
  if (!consumeRateLimit(getClientKey(request))) {
    return NextResponse.json(
      { message: "Bạn đã thử quá nhiều lần. Vui lòng chờ một phút." },
      { status: 429 },
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const productId = Number(formData?.get("productId"));

  if (!(file instanceof File)) {
    return NextResponse.json(
      { message: "Vui lòng tải lên một ảnh toàn thân." },
      { status: 400 },
    );
  }
  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json(
      { message: "Sản phẩm được chọn không hợp lệ." },
      { status: 400 },
    );
  }
  if (!supportedMimeTypes.has(file.type)) {
    return NextResponse.json(
      { message: "Chỉ hỗ trợ ảnh JPG hoặc PNG." },
      { status: 400 },
    );
  }
  if (file.size === 0 || file.size > MAX_PERSON_IMAGE_BYTES) {
    return NextResponse.json(
      { message: "Ảnh khách hàng phải có dung lượng tối đa 8MB." },
      { status: 413 },
    );
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, status: "PUBLIC" },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      category: {
        select: {
          name: true,
          tryOnCategory: true,
          parent: { select: { name: true } },
        },
      },
      images: {
        where: { variantId: null },
        orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
        take: 1,
        select: { url: true },
      },
    },
  });

  const productImageUrl = product?.images[0]?.url || product?.imageUrl;
  if (!product || !productImageUrl) {
    return NextResponse.json(
      { message: "Sản phẩm này chưa có ảnh để thử đồ." },
      { status: 404 },
    );
  }

  const garmentCategoryMap: Record<typeof product.category.tryOnCategory, GarmentCategory | null> = {
    UPPER_BODY: "upper_body",
    LOWER_BODY: "lower_body",
    DRESSES: "dresses",
    SHOES: null,
    ACCESSORIES: null,
    NOT_SUPPORTED: null,
  };
  const garmentCategory = garmentCategoryMap[product.category.tryOnCategory];
  const configuredSpace = process.env.VTON_SPACE_ID?.trim() || DEFAULT_VTON_SPACE;
  const categoryAwareVton = isCategoryAwareSpace(configuredSpace);
  const miragicSpace = isMiragicSpace(configuredSpace);

  if (!garmentCategory) {
    return NextResponse.json(
      {
        message: "Loại sản phẩm này chưa được AI thử đồ hỗ trợ.",
        garmentCategory: product.category.tryOnCategory,
      },
      { status: 422 },
    );
  }
  if (garmentCategory !== "upper_body" && !categoryAwareVton) {
    return NextResponse.json(
      {
        message:
          `Sản phẩm này thuộc nhóm ${garmentCategoryLabel[garmentCategory]}. ` +
          "Backend AI hiện tại mới hỗ trợ áo; hãy cấu hình VTON_SPACE_ID tới Space đa danh mục để thử sản phẩm này.",
        garmentCategory,
      },
      { status: 422 },
    );
  }

  const productController = new AbortController();
  const productTimeoutId = setTimeout(
    () => productController.abort(),
    20_000,
  );
  let predictionTimeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    const productImageResponse = await fetch(jpegProductUrl(productImageUrl), {
      signal: productController.signal,
    });
    if (!productImageResponse.ok) {
      return NextResponse.json(
        { message: "Không thể tải ảnh sản phẩm." },
        { status: 502 },
      );
    }

    const productContentType =
      productImageResponse.headers.get("content-type")?.split(";")[0] ||
      "image/jpeg";
    if (!supportedMimeTypes.has(productContentType)) {
      return NextResponse.json(
        { message: "Ảnh sản phẩm chưa ở định dạng JPG hoặc PNG." },
        { status: 422 },
      );
    }
    const productBytes = await productImageResponse.arrayBuffer();
    if (productBytes.byteLength > MAX_PRODUCT_IMAGE_BYTES) {
      return NextResponse.json(
        { message: "Ảnh sản phẩm quá lớn để xử lý." },
        { status: 413 },
      );
    }

    const personBlob = new Blob([await file.arrayBuffer()], {
      type: file.type,
    });
    const garmentBlob = new Blob([productBytes], {
      type: productContentType,
    });
    const personImage = handle_file(personBlob);
    const garmentImage = handle_file(garmentBlob);

    const prediction = await Promise.race([
      (async () => {
        const client = await getVtonClient();
        // Keep the ImageEditor input in the shape expected by the public
        // yisol Space. Its composite layer is optional; sending the person
        // image there as well causes some Gradio versions to reject the job.
        if (miragicSpace) {
          return client.predict("/virtual_tryon", {
            human_img: personImage,
            garment_img: garmentImage,
            garment_type: miragicGarmentType[garmentCategory],
          });
        }

        const inputs: Record<string, unknown> = {
          dict: {
            background: personImage,
            layers: [],
            composite: null,
          },
          garm_img: garmentImage,
          garment_des: product.title,
          is_checked: true,
          is_checked_crop: false,
          denoise_steps: DENOISE_STEPS,
          seed: 42,
        };
        // Only add this field when a custom Space explicitly supports it.
        if (categoryAwareVton) inputs.category = garmentCategory;
        return client.predict("/tryon", inputs);
      })(),
      new Promise<never>((_, reject) => {
        predictionTimeoutId = setTimeout(
          () => reject(new Error("Virtual try-on request timeout")),
          REQUEST_TIMEOUT_MS,
        );
      }),
    ]);

    const imageUrl = getOutputUrl(prediction.data);
    if (!imageUrl) {
      return NextResponse.json(
        { message: "AI không trả về được ảnh thử đồ." },
        { status: 502 },
      );
    }

    let persistedImageUrl = imageUrl;
    if (!imageUrl.startsWith("data:")) {
      const outputResponse = await fetch(imageUrl);
      if (!outputResponse.ok) {
        return NextResponse.json(
          { message: "Không thể tải ảnh thử đồ từ AI." },
          { status: 502 },
        );
      }
      const outputType =
        outputResponse.headers.get("content-type")?.split(";")[0] ||
        "image/png";
      const outputBytes = await outputResponse.arrayBuffer();
      const outputFile = new File([outputBytes], `try-on-${product.id}.png`, {
        type: outputType,
      });
      try {
        const uploaded = await uploadImageToCloudinary(
          outputFile,
          "finance-app/try-on",
        );
        persistedImageUrl = uploaded.url;
      } catch (error) {
        console.warn("Could not persist try-on image to Cloudinary", error);
      }
    }

    return NextResponse.json({
      imageUrl: persistedImageUrl,
      product: { id: product.id, title: product.title, garmentCategory },
    });
  } catch (error) {
    if (isTimeoutError(error)) {
      return NextResponse.json(
        { message: "AI đang xử lý quá lâu. Vui lòng thử lại sau ít phút." },
        { status: 504 },
      );
    }
    if (isSpaceBusyError(error)) {
      return NextResponse.json(
        {
          message:
            "AI miễn phí đang bận hoặc đang khởi động. Vui lòng thử lại sau ít phút.",
        },
        { status: 503 },
      );
    }
    if (isSpaceInferenceError(error)) {
      return NextResponse.json(
        {
          message:
            "AI provider hiện đang lỗi khi tạo ảnh. Vui lòng thử lại sau hoặc liên hệ quản trị viên để đổi provider.",
        },
        { status: 503 },
      );
    }
    console.error("Free virtual try-on request failed", error);
    return NextResponse.json(
      { message: "Không thể tạo ảnh thử đồ lúc này. Vui lòng thử lại." },
      { status: 502 },
    );
  } finally {
    clearTimeout(productTimeoutId);
    if (predictionTimeoutId) clearTimeout(predictionTimeoutId);
  }
}

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
const DEFAULT_FASHN_SPACE = "merve/fashn-vton-1.5";
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
const boundedNumber = (
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
) => {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? Math.max(minimum, Math.min(maximum, parsed))
    : fallback;
};

type GarmentCategory =
  | "upper_body"
  | "lower_body"
  | "dresses"
  | "accessory";

type RateBucket = { count: number; resetAt: number };
type JsonObject = Record<string, unknown>;

const rateBuckets = new Map<string, RateBucket>();
let clientPromise: Promise<Client> | null = null;
let fashnClientPromise: Promise<Client> | null = null;

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

const supportedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

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

const getFashnClient = () => {
  if (!fashnClientPromise) {
    const space =
      process.env.FASHN_VTON_SPACE_ID?.trim() || DEFAULT_FASHN_SPACE;
    fashnClientPromise = Client.connect(space).catch((error) => {
      fashnClientPromise = null;
      throw error;
    });
  }
  return fashnClientPromise;
};

const isMiragicSpace = (space: string) =>
  space.toLowerCase().includes("miragic-ai/miragic-virtual-try-on") ||
  space.toLowerCase().includes("miragic-ai-miragic-virtual-try-on");

// The public IDM-VTON Space only exposes the original upper-body schema.
// Miragic's known Space is category-aware; accept it automatically so a
// missing/quoted environment flag cannot silently downgrade the provider to
// upper-body-only mode.
const isCategoryAwareSpace = (space: string) =>
  space !== DEFAULT_VTON_SPACE &&
  (process.env.VTON_CATEGORY_MODE?.trim().toLowerCase() === "true" ||
    isMiragicSpace(space));

const miragicGarmentType: Record<GarmentCategory, string> = {
  upper_body: "Top",
  lower_body: "Bottom",
  dresses: "Dress/Suit",
  accessory: "Accessory",
};

const fashnGarmentCategory: Record<GarmentCategory, string | null> = {
  upper_body: "tops",
  lower_body: "bottoms",
  dresses: "one-pieces",
  accessory: null,
};

const garmentCategoryLabel: Record<GarmentCategory, string> = {
  upper_body: "áo",
  lower_body: "quần hoặc chân váy",
  dresses: "đầm hoặc váy liền",
  accessory: "nón hoặc phụ kiện",
};

const GEMINI_IMAGE_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_GEMINI_IMAGE_MODEL = "gemini-3.1-flash-image";

const getGeminiImageModel = () => {
  const configured = process.env.GEMINI_IMAGE_MODEL?.trim();
  // Do not accidentally use the text-only GEMINI_MODEL in Production.
  return configured &&
    configured.toLowerCase().includes("image") &&
    !configured.toLowerCase().includes("gemini-2.5-flash-image")
    ? configured
    : DEFAULT_GEMINI_IMAGE_MODEL;
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

const getInlineImage = (value: unknown): { data: string; mimeType: string } | null => {
  if (!isObject(value)) return null;
  const inlineData = value.inlineData;
  if (!isObject(inlineData) || typeof inlineData.data !== "string") return null;
  return {
    data: inlineData.data,
    mimeType:
      typeof inlineData.mimeType === "string"
        ? inlineData.mimeType
        : "image/png",
  };
};

const generateWithGemini = async ({
  personBytes,
  personMimeType,
  productBytes,
  productMimeType,
  productTitle,
  garmentCategory,
}: {
  personBytes: ArrayBuffer;
  personMimeType: string;
  productBytes: ArrayBuffer;
  productMimeType: string;
  productTitle: string;
  garmentCategory: GarmentCategory;
}) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Gemini image provider is not configured");
  }

  const model = getGeminiImageModel();
  const itemKind =
    garmentCategory === "accessory"
      ? "fashion accessory or hat"
      : "garment or clothing item";
  const prompt = `
Edit the provided full-body person photo to show the person wearing the exact
${itemKind} shown in the second reference image. The product is:
"${productTitle}".

This is a virtual try-on preview for an online fashion store.
- Preserve the person's face, identity, body, pose, skin tone, hair, hands,
  clothing, lighting, camera angle, background, and image framing.
- Add or replace only the clothing/accessory from the product reference. If it
  is a hat, cap, or headwear, place it naturally on the person's head with
  correct perspective, scale, shadows, and hair occlusion. If it is a top,
  bottom, skirt, dress, or one-piece garment, fit it naturally to the person's
  body while preserving the person's pose and proportions.
- Reproduce the product's real color, material, shape, logo placement, and
  details. Do not invent a different product.
- Do not add text, watermark, extra people, extra accessories, or change the
  background. Return one photorealistic edited image only.
`;
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    Math.max(60_000, Number(process.env.VTON_GEMINI_TIMEOUT_MS) || 180_000),
  );

  try {
    const response = await fetch(
      `${GEMINI_IMAGE_ENDPOINT}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: personMimeType,
                    data: Buffer.from(personBytes).toString("base64"),
                  },
                },
                {
                  inlineData: {
                    mimeType: productMimeType,
                    data: Buffer.from(productBytes).toString("base64"),
                  },
                },
              ],
            },
          ],
          generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
            imageConfig: { aspectRatio: "3:4" },
          },
        }),
        signal: controller.signal,
      },
    );
    const payload = (await response.json().catch(() => null)) as JsonObject | null;
    if (!response.ok) {
      const providerMessage =
        isObject(payload?.error) && typeof payload.error.message === "string"
          ? payload.error.message
          : `Gemini image request failed with ${response.status}`;
      const providerError = new Error(providerMessage) as Error & {
        providerStatus?: number;
      };
      providerError.name = "GeminiProviderError";
      providerError.providerStatus = response.status;
      throw providerError;
    }
    const candidates = Array.isArray(payload?.candidates)
      ? payload.candidates
      : [];
    const parts = isObject(candidates[0])
      ? (candidates[0] as JsonObject).content
      : null;
    const responseParts = isObject(parts) ? parts.parts : null;
    if (!Array.isArray(responseParts)) {
      throw new Error("Gemini did not return an image");
    }
    for (const part of responseParts) {
      const image = getInlineImage(part);
      if (image) return image;
    }
    throw new Error("Gemini did not return an image");
  } finally {
    clearTimeout(timeoutId);
  }
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
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  let stage = "validate-request";
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
    ACCESSORIES: "accessory",
    NOT_SUPPORTED: null,
  };
  const garmentCategory = garmentCategoryMap[product.category.tryOnCategory];
  const configuredSpace = process.env.VTON_SPACE_ID?.trim() || DEFAULT_VTON_SPACE;
  const provider = process.env.VTON_PROVIDER?.trim().toLowerCase() || "vton";
  const useFashn = provider === "fashn";
  // Gemini is opt-in for accessories; FASHN handles clothing categories.
  const useGemini = provider === "gemini" && garmentCategory === "accessory";
  const categoryAwareVton = useFashn || isCategoryAwareSpace(configuredSpace);
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
  if (useFashn && !fashnGarmentCategory[garmentCategory]) {
    return NextResponse.json(
      {
        message:
          "FASHN hiện hỗ trợ áo, quần/chân váy và đầm/váy liền; chưa hỗ trợ nón hoặc phụ kiện.",
        garmentCategory,
      },
      { status: 422 },
    );
  }
  if (!useGemini && garmentCategory !== "upper_body" && !categoryAwareVton) {
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

  if (useGemini && !process.env.GEMINI_API_KEY?.trim()) {
    return NextResponse.json(
      {
        message:
          "Để thử đồ bằng Gemini, quản trị viên cần cấu hình GEMINI_API_KEY và GEMINI_IMAGE_MODEL ở server.",
        garmentCategory,
      },
      { status: 503 },
    );
  }

  const productController = new AbortController();
  stage = "download-product-image";
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

    const personBytes = await file.arrayBuffer();
    const personBlob = new Blob([personBytes], {
      type: file.type,
    });
    const garmentBlob = new Blob([productBytes], {
      type: productContentType,
    });
    const personImage = handle_file(personBlob);
    const garmentImage = handle_file(garmentBlob);

    let imageUrl: string | null = null;
    let outputBytes: ArrayBuffer | null = null;
    let outputType = "image/png";
    if (useGemini) {
      stage = "gemini-image-generation";
      const prediction = await generateWithGemini({
        personBytes,
        personMimeType: file.type,
        productBytes,
        productMimeType: productContentType,
        productTitle: product.title,
        garmentCategory,
      });
      imageUrl = `data:${prediction.mimeType};base64,${prediction.data}`;
      outputType = prediction.mimeType;
      const decoded = Buffer.from(prediction.data, "base64");
      outputBytes = decoded.buffer.slice(
        decoded.byteOffset,
        decoded.byteOffset + decoded.byteLength,
      ) as ArrayBuffer;
    } else {
      stage = "vton-image-generation";
      const prediction = await Promise.race([
        (async () => {
          if (useFashn) {
            const client = await getFashnClient();
            return client.predict("/try_on", {
              person_image: personImage,
              garment_image: garmentImage,
              category: fashnGarmentCategory[garmentCategory],
              garment_photo_type: "flat-lay",
              num_timesteps: boundedNumber(
                process.env.FASHN_NUM_TIMESTEPS,
                20,
                10,
                50,
              ),
              guidance_scale: boundedNumber(
                process.env.FASHN_GUIDANCE_SCALE,
                2,
                1,
                3,
              ),
              seed: 42,
              segmentation_free: true,
            });
          }
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
      imageUrl = getOutputUrl(prediction.data);
    }
    if (!imageUrl) {
      return NextResponse.json(
        { message: "AI không trả về được ảnh thử đồ." },
        { status: 502 },
      );
    }

    let persistedImageUrl = imageUrl;
    stage = "download-ai-result";
    if (!outputBytes) {
      const outputResponse = await fetch(imageUrl);
      if (!outputResponse.ok) {
        return NextResponse.json(
          { message: "Không thể tải ảnh thử đồ từ AI." },
          { status: 502 },
        );
      }
      outputType =
        outputResponse.headers.get("content-type")?.split(";")[0] ||
        "image/png";
      outputBytes = await outputResponse.arrayBuffer();
    }
    stage = "persist-ai-result";
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
    console.error("Virtual try-on request failed", {
      requestId,
      stage,
      provider: useGemini ? "gemini" : "vton",
      error,
    });
    if (stage === "gemini-image-generation") {
      const providerStatus =
        error instanceof Error &&
        typeof (error as Error & { providerStatus?: unknown }).providerStatus ===
          "number"
          ? (error as Error & { providerStatus: number }).providerStatus
          : undefined;
      return NextResponse.json(
        {
          code: "GEMINI_IMAGE_GENERATION_FAILED",
          message:
            "Gemini không tạo được ảnh thử đồ. Vui lòng kiểm tra Gemini API key/model trong môi trường Production.",
          requestId,
          ...(providerStatus ? { providerStatus } : {}),
        },
        { status: 502 },
      );
    }
    return NextResponse.json(
      {
        code: "VIRTUAL_TRY_ON_FAILED",
        message: "Không thể tạo ảnh thử đồ lúc này. Vui lòng thử lại.",
        requestId,
      },
      { status: 502 },
    );
  } finally {
    clearTimeout(productTimeoutId);
    if (predictionTimeoutId) clearTimeout(predictionTimeoutId);
  }
}

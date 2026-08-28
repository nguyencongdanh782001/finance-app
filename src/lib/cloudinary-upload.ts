import cloudinary from "@/lib/cloudinary";
import { isHeicLikeFile } from "@/lib/image-file";
import { randomUUID } from "node:crypto";

export type UploadedImage = {
  url: string;
  publicId: string;
};

const PRODUCT_IMAGE_FOLDER = "finance-app/products";
const RECOVERY_LOOKUP_DELAY_MS = 10_000;
const UPLOAD_TIMEOUT_MS = 45_000;
const RESOURCE_LOOKUP_TIMEOUT_MS = 8_000;

const getOutputFormat = (file: File) => {
  if (isHeicLikeFile(file)) {
    return "jpg";
  }

  return "webp";
};

const lookupUploadedImage = (publicId: string) =>
  new Promise<UploadedImage>((resolve, reject) => {
    const lookupTimeout = setTimeout(
      () => reject(new Error("Cloudinary lookup timed out")),
      RESOURCE_LOOKUP_TIMEOUT_MS,
    );

    void cloudinary.api
      .resource(publicId, { resource_type: "image" })
      .then((result) => {
        clearTimeout(lookupTimeout);
        resolve({ url: result.secure_url, publicId: result.public_id });
      })
      .catch((error) => {
        clearTimeout(lookupTimeout);
        reject(error);
      });
  });

export async function uploadImageToCloudinary(
  file: File,
  folder = PRODUCT_IMAGE_FOLDER,
): Promise<UploadedImage> {
  const bytes = await file.arrayBuffer();

  if (bytes.byteLength === 0) {
    throw new Error("Image file is empty");
  }

  const buffer = Buffer.from(bytes);
  const format = getOutputFormat(file);
  const assetId = randomUUID();
  const publicId = `${folder}/${assetId}`;

  return new Promise<UploadedImage>((resolve, reject) => {
    let settled = false;
    const finish = (result: UploadedImage) => {
      if (settled) return;
      settled = true;
      clearTimeout(recoveryTimeout);
      clearTimeout(timeout);
      resolve(result);
    };
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(recoveryTimeout);
      clearTimeout(timeout);
      reject(error);
    };
    const recoveryTimeout = setTimeout(() => {
      void lookupUploadedImage(publicId)
        .then(finish)
        .catch(() => undefined);
    }, RECOVERY_LOOKUP_DELAY_MS);
    const timeout = setTimeout(async () => {
      try {
        finish(await lookupUploadedImage(publicId));
      } catch {
        fail(new Error("Cloudinary upload timed out"));
      }
    }, UPLOAD_TIMEOUT_MS);
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: assetId,
        resource_type: "image",
        format,
        tags: ["quynh-nhi-store", "product"],
        context: {
          original_filename: file.name,
          uploaded_from: "quynh-nhi-store",
        },
        unique_filename: false,
        use_filename: false,
        overwrite: false,
        transformation: [
          {
            width: 1600,
            height: 1600,
            crop: "limit",
            quality: "auto:good",
            flags: "strip_profile",
          },
        ],
      },
      (error, result) => {
        if (error || !result) {
          const message =
            error?.message ||
            (typeof error === "string" ? error : undefined) ||
            "Upload image failed";
          fail(new Error(message));
          return;
        }

        finish({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    stream.on("error", (error) =>
      fail(error instanceof Error ? error : new Error(String(error))),
    );
    stream.end(buffer);
  });
}

export async function deleteProductImageFromCloudinary(
  publicId?: string | null,
) {
  if (!publicId || !publicId.startsWith(`${PRODUCT_IMAGE_FOLDER}/`)) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
}

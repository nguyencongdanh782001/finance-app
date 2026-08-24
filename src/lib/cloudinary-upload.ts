import cloudinary from "@/lib/cloudinary";
import { isHeicLikeFile } from "@/lib/image-file";

export type UploadedImage = {
  url: string;
  publicId: string;
};

const PRODUCT_IMAGE_FOLDER = "finance-app/products";

const getOutputFormat = (file: File) => {
  if (isHeicLikeFile(file)) {
    return "jpg";
  }

  return "webp";
};

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

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        format,
        tags: ["quynh-nhi-store", "product"],
        context: {
          original_filename: file.name,
          uploaded_from: "quynh-nhi-store",
        },
        unique_filename: true,
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
          reject(new Error(message));
          return;
        }

        resolve({
          url: cloudinary.url(result.public_id, {
            secure: true,
            fetch_format: "auto",
            quality: "auto:good",
          }),
          publicId: result.public_id,
        });
      },
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

import cloudinary from "@/lib/cloudinary";
import { isHeicLikeFile } from "@/lib/image-file";

export type UploadedImage = {
  url: string;
  publicId: string;
};

const getOutputFormat = (file: File) => {
  if (isHeicLikeFile(file)) {
    return "jpg";
  }

  return undefined;
};

export async function uploadImageToCloudinary(
  file: File,
  folder = "finance-app/products",
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
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    stream.end(buffer);
  });
}

export async function deleteImageFromCloudinary(publicId?: string | null) {
  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId);
}

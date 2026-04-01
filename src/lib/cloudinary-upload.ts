import cloudinary from "@/lib/cloudinary";

export type UploadedImage = {
  url: string;
  publicId: string;
};

export async function uploadImageToCloudinary(
  file: File,
  folder = "finance-app/products",
): Promise<UploadedImage> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Upload image failed"));
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

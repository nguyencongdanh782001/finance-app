import {
  deleteProductImageFromCloudinary,
  uploadImageToCloudinary,
} from "@/lib/cloudinary-upload";
import { isHeicLikeFile } from "@/lib/image-file";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Image file is required" },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { message: "Image file is empty" },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "Hình ảnh không được vượt quá 5MB" },
        { status: 413 },
      );
    }

    const isSupportedImage =
      file.type.startsWith("image/") || isHeicLikeFile(file);

    if (!isSupportedImage) {
      return NextResponse.json(
        { message: "Only image files are allowed" },
        { status: 400 },
      );
    }

    const result = await uploadImageToCloudinary(file);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload image failed";

    return NextResponse.json(
      { message, hint: "Check Cloudinary env key/secret/cloud name" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { publicId } = await req.json();

    if (typeof publicId !== "string" || !publicId) {
      return NextResponse.json(
        { message: "Image public id is required" },
        { status: 400 },
      );
    }

    await deleteProductImageFromCloudinary(publicId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Delete image failed";

    return NextResponse.json({ message }, { status: 500 });
  }
}

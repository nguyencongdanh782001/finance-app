import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { message: "Image file is required" },
      { status: 400 },
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { message: "Only image files are allowed" },
      { status: 400 },
    );
  }

  const result = await uploadImageToCloudinary(file);

  return NextResponse.json(result);
}

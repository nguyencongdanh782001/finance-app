import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";
import { NextResponse } from "next/server";

const MAX_BYTES = 8 * 1024 * 1024;
const folders = {
  PRODUCT_DESCRIPTION: "finance-app/editor/products",
  STORE_POLICY: "finance-app/editor/policies",
} as const;
const signatures: Record<string, (bytes: Uint8Array) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) => b.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10",
  "image/webp": (b) =>
    new TextDecoder().decode(b.slice(0, 4)) === "RIFF" &&
    new TextDecoder().decode(b.slice(8, 12)) === "WEBP",
  "image/avif": (b) =>
    new TextDecoder().decode(b.slice(4, 12)).includes("ftypavif"),
};

export async function POST(request: Request) {
  if (
    !request.headers.get("x-user-id") ||
    !["ADMIN", "SUPER_ADMIN"].includes(request.headers.get("x-user-role") || "")
  )
    return NextResponse.json(
      { message: "Bạn không có quyền tải ảnh." },
      { status: 403 },
    );
  try {
    const form = await request.formData();
    const file = form.get("file");
    const context = String(
      form.get("context") || "PRODUCT_DESCRIPTION",
    ) as keyof typeof folders;
    if (!(file instanceof File) || !folders[context])
      return NextResponse.json(
        { message: "Thiếu tệp hoặc ngữ cảnh tải ảnh." },
        { status: 400 },
      );
    if (file.size === 0 || file.size > MAX_BYTES)
      return NextResponse.json(
        { message: "Ảnh phải có dung lượng từ 1 đến 8MB." },
        { status: 400 },
      );
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = Object.keys(signatures).find((key) => signatures[key](bytes));
    if (!mime)
      return NextResponse.json(
        { message: "Định dạng ảnh không được hỗ trợ hoặc tệp không hợp lệ." },
        { status: 415 },
      );
    const uploaded = await uploadImageToCloudinary(
      new File([bytes], file.name, { type: mime }),
      folders[context],
    );
    return NextResponse.json({
      id: uploaded.publicId,
      url: uploaded.url,
      mimeType: mime,
      alt: "",
    });
  } catch (error) {
    console.error("Editor image upload failed", error);
    return NextResponse.json(
      { message: "Không thể xử lý ảnh. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}

import { v2 as cloudinary } from "cloudinary";

const normalizeEnv = (value?: string) =>
  value
    ?.trim()
    .replace(/^['"]+|['"]+$/g, "")
    .replace(/^,+|,+$/g, "")
    .trim();

cloudinary.config({
  cloud_name: normalizeEnv(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME),
  api_key: normalizeEnv(process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY),
  api_secret: normalizeEnv(process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET),
});

export default cloudinary;

import { autocompleteAddress } from "@/lib/geoapify";
import { NextResponse } from "next/server";

const cache = new Map<string, { expiresAt: number; value: Awaited<ReturnType<typeof autocompleteAddress>> }>();
const rateLimit = new Map<string, { startedAt: number; count: number }>();

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const current = rateLimit.get(ip);
  if (!current || now - current.startedAt >= 60_000) rateLimit.set(ip, { startedAt: now, count: 1 });
  else if (current.count >= 30) return NextResponse.json({ message: "Bạn tìm kiếm quá nhiều lần. Vui lòng thử lại sau." }, { status: 429 });
  else current.count += 1;
  const text = new URL(request.url).searchParams.get("text")?.trim().replace(/\s+/g, " ") || "";
  if ([...text].length < 3) return NextResponse.json({ suggestions: [] });
  const key = text.toLocaleLowerCase("vi");
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return NextResponse.json({ suggestions: cached.value });
  try {
    const suggestions = await autocompleteAddress(text);
    cache.set(key, { expiresAt: Date.now() + 60_000, value: suggestions });
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Address autocomplete unavailable", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ message: "Không thể tìm địa chỉ lúc này." }, { status: 503 });
  }
}

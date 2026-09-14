import { NextResponse } from "next/server";

type Ward = { code: number; name: string; province_code: number };
type Province = { code: number; name: string; wards: Ward[] };
type SourceWard = {
  id: string;
  name: { local: string };
};
type SourceProvince = {
  id: string;
  name: { local: string };
  ward?: SourceWard[];
};

let cached: { expiresAt: number; data: Province[] } | null = null;

export async function GET() {
  if (cached && cached.expiresAt > Date.now())
    return NextResponse.json(cached.data);
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/open-admin-data/vietnam-administrative-divisions/main/data/hierarchy.json",
      { signal: AbortSignal.timeout(8_000), next: { revalidate: 86_400 } },
    );
    if (!response.ok)
      throw new Error(`Administrative API failed (${response.status}).`);
    const source = (await response.json()) as { data: SourceProvince[] };
    const data = source.data.map((province) => ({
      code: Number(province.id),
      name: province.name.local,
      wards: (province.ward || []).map((ward) => ({
        code: Number(ward.id),
        name: ward.name.local,
        province_code: Number(province.id),
      })),
    }));
    cached = { expiresAt: Date.now() + 86_400_000, data };
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error(
      "Administrative divisions unavailable",
      error instanceof Error ? error.message : "unknown error",
    );
    return NextResponse.json(
      { message: "Không thể tải danh sách tỉnh thành." },
      { status: 503 },
    );
  }
}

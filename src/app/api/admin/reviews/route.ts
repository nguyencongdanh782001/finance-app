import { NextResponse } from "next/server";
import { getAdminReviews } from "@/lib/reviews";
import { isAdminReviewRole } from "@/lib/reviews-policy";

function isAdmin(request: Request) {
  return Boolean(request.headers.get("x-user-id")) &&
    isAdminReviewRole(request.headers.get("x-user-role"));
}

export async function GET(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      { message: request.headers.get("x-user-role") ? "Forbidden" : "Unauthorized" },
      { status: request.headers.get("x-user-role") ? 403 : 401 },
    );
  }

  const searchParams = new URL(request.url).searchParams;
  const requestedPage = Number(searchParams.get("page") || 1);
  const requestedLimit = Number(searchParams.get("limit") || 20);
  const page = Number.isInteger(requestedPage) ? Math.max(1, requestedPage) : 1;
  const limit = Number.isInteger(requestedLimit) ? Math.min(50, Math.max(1, requestedLimit)) : 20;
  const rawStatus = searchParams.get("status");
  const status = rawStatus === "visible" || rawStatus === "hidden" ? rawStatus : "all";

  try {
    const data = await getAdminReviews({
      page,
      limit,
      status,
      search: searchParams.get("search") || "",
    });
    return NextResponse.json(data, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ message: "Không thể tải danh sách đánh giá." }, { status: 500 });
  }
}

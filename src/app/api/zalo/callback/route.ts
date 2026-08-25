import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const expectedState = process.env.ZALO_OAUTH_STATE;

  if (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Zalo từ chối cấp quyền.",
        error,
      },
      { status: 400 },
    );
  }

  if (!code) {
    return NextResponse.json(
      {
        success: false,
        message: "Callback Zalo thiếu authorization code.",
      },
      { status: 400 },
    );
  }

  if (expectedState && state !== expectedState) {
    return NextResponse.json(
      {
        success: false,
        message: "State xác thực Zalo không hợp lệ.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "Đã nhận authorization code từ Zalo.",
    code,
  });
}

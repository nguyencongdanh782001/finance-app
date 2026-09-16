import { NextResponse } from "next/server";
import { ADMIN_ROLES } from "@/lib/auth/constants";

export function getAdminIdentity(request: Request) {
  const userId = Number(request.headers.get("x-user-id"));
  const role = request.headers.get("x-user-role") || "";
  if (!Number.isInteger(userId) || userId < 1) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return { userId, role } as const;
}

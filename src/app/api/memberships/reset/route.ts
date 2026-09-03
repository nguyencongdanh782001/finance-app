import { getAdminFromRequest } from "@/lib/orders/daily-orders";
import {
  getMembershipCycle,
  runAnnualMembershipReset,
} from "@/lib/memberships";
import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const admin = getAdminFromRequest(request);
    const body = (await request.json().catch(() => ({}))) as { year?: number };
    const currentYear = getMembershipCycle().year;
    const year =
      body.year === undefined ? currentYear : Math.round(Number(body.year));
    if (!Number.isInteger(year) || year < 2020 || year > currentYear) {
      throw new Error("Năm reset không hợp lệ.");
    }
    const result = await runAnnualMembershipReset(year);
    await recordAudit({
      actorId: admin.userId,
      action: "ANNUAL_RESET",
      entityType: "MEMBERSHIP_RESET_RUN",
      entityId: result.id,
      newValue: result,
    });
    return NextResponse.json({ ...result, triggeredBy: admin.userId });
  } catch (error) {
    const status = error instanceof Response ? error.status : 400;
    if (error instanceof Response) return error;
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể reset membership.",
      },
      { status },
    );
  }
}

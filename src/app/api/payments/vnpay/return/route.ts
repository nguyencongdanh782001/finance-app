import { getVnpayConfig, verifyVnpayResponse } from "@/lib/vnpay";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const config = getVnpayConfig(url.origin);
  const valid = Boolean(config && verifyVnpayResponse(url.searchParams, config.hashSecret));
  const order = url.searchParams.get("vnp_TxnRef") || "";
  const success = valid && url.searchParams.get("vnp_ResponseCode") === "00";
  const destination = new URL("/checkout/success", url.origin);
  destination.searchParams.set("order", order);
  destination.searchParams.set("payment", "BANK_TRANSFER");
  destination.searchParams.set("vnpay", success ? "success" : valid ? "failed" : "invalid");
  return NextResponse.redirect(destination);
}

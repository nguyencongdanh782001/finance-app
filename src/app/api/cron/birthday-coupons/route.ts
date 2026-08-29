import { CouponSource } from "@/app/generated/prisma/client";
import prisma from "@/lib/db";
import { generateDiscountCode, generatePublicToken } from "@/lib/discounts";
import { sendGmailEmail } from "@/lib/auth/email";
import { NextResponse } from "next/server";

const todayInVietnam = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()).split("-").map(Number);

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const [year, month, day] = todayInVietnam();
  const users = await prisma.user.findMany({ where: { birthday: { not: null }, email: { not: null }, status: "ACTIVE", membership: { is: { isActive: true } } }, include: { membership: true } });
  const birthdayUsers = users.filter((user) => { const birthday = user.birthday; return birthday ? birthday.getUTCMonth() + 1 === month && birthday.getUTCDate() === day : false; });
  let created = 0; let sent = 0;
  for (const user of birthdayUsers) {
    if (!user.email || !user.membership || Number(user.membership.discountRate) <= 0) continue;
    const existing = await prisma.coupon.findFirst({ where: { source: CouponSource.BIRTHDAY, recipientUserId: user.id, birthdayYear: year } });
    if (existing) continue;
    let code = generateDiscountCode();
    while (await prisma.coupon.findUnique({ where: { code } })) code = generateDiscountCode();
    const coupon = await prisma.coupon.create({ data: { code, normalizedCode: code, publicToken: generatePublicToken(), name: `Quà sinh nhật ${user.displayName || user.firstName || "khách hàng"}`, description: "Mã ưu đãi sinh nhật dành riêng cho bạn.", type: "PERCENTAGE", value: user.membership.discountRate, maxDiscountAmount: user.membership.birthdayMaxDiscountAmount, usageLimit: 1, usageLimitPerUser: 1, source: CouponSource.BIRTHDAY, recipientUserId: user.id, birthdayYear: year, startsAt: new Date(), endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000), applicableMemberships: { create: { membershipId: user.membership.id, discountRate: user.membership.discountRate } } } });
    created++;
    const name = user.displayName || user.firstName || "bạn";
    const subject = "Chúc mừng sinh nhật từ Quỳnh Nhi Store";
    const textBody = `Xin chào ${name},\n\nChúc bạn sinh nhật vui vẻ! Quỳnh Nhi Store gửi tặng bạn mã giảm giá ${coupon.code}, giảm ${Number(user.membership.discountRate)}% tối đa ${coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount).toLocaleString("vi-VN") + "đ" : "không giới hạn"}.\n\nMã chỉ dùng 1 lần trong ngày hôm nay.`;
    const htmlBody = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;color:#2d2226"><p style="color:#d96c8a;font-weight:700">QUỲNH NHI STORE</p><h1>Chúc mừng sinh nhật, ${name}!</h1><p>Chúc bạn có một ngày thật vui vẻ. Đây là món quà dành riêng cho bạn:</p><div style="padding:18px;text-align:center;background:#fceef3;border-radius:12px;color:#a43e5f;font-size:24px;font-weight:800;letter-spacing:3px">${coupon.code}</div><p>Giảm <b>${Number(user.membership.discountRate)}%</b>${coupon.maxDiscountAmount ? `, tối đa <b>${Number(coupon.maxDiscountAmount).toLocaleString("vi-VN")}đ</b>` : ""}. Mã dùng 1 lần và có hiệu lực trong ngày hôm nay.</p></div>`;
    const result = await sendGmailEmail({ to: user.email, subject, textBody, htmlBody });
    if (result.sent) sent++;
    else await prisma.coupon.delete({ where: { id: coupon.id } });
  }
  return NextResponse.json({ year, month, day, matched: birthdayUsers.length, created, sent });
}

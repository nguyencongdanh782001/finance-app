"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/Auth/AuthProvider";
import StorefrontShell from "@/components/Storefront/StorefrontShell";
import { isAdminRole } from "@/lib/auth/routing";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

type MembershipData = {
  cycle: { year: number; start: string; end: string };
  current: {
    spending: number;
    membership: {
      name: string;
      color?: string | null;
      minSpendAmount: number;
      discountRate: number;
    } | null;
  };
  currentRank: { name: string; minSpend: number } | null;
  nextRank: { name: string; minSpend: number } | null;
  eligibleSpend: number;
  remainingSpend: number;
  progressPercentage: number;
  periodStart: string;
  periodEnd: string;
  benefits: Array<{
    id: number;
    name: string;
    description?: string | null;
    endsAt?: string | null;
    redemptions: unknown[];
  }>;
  history: Array<{
    cycleYear: number;
    membershipNameSnapshot: string;
    spending: number;
  }>;
};

const money = (value: number) => `${value.toLocaleString("vi-VN")}đ`;
const date = (value: string) => new Date(value).toLocaleDateString("vi-VN");

function MembershipSkeleton() {
  return (
    <main className="min-h-svh bg-[#FFF9FA] px-4 py-8 text-[#2D2226] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Skeleton className="h-3 w-32 bg-[#F1DDE3]" />
        <Skeleton className="mt-3 h-8 w-64 bg-[#EADFE2]" />
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#EAE1E4] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Skeleton className="h-4 w-24 bg-[#EADFE2]" />
              <Skeleton className="mt-3 h-8 w-40 bg-[#F1DDE3]" />
            </div>
            <Skeleton className="h-7 w-24 rounded-full bg-[#FCEEF3]" />
          </div>
          <div className="mt-7 flex justify-between gap-4">
            <Skeleton className="h-4 w-40 bg-[#EADFE2]" />
            <Skeleton className="h-4 w-8 bg-[#EADFE2]" />
          </div>
          <Skeleton className="mt-3 h-3 w-full rounded-full bg-[#F3E7EA]" />
          <Skeleton className="mt-6 h-16 w-full rounded-xl bg-[#FFF3F6]" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Skeleton className="h-16 rounded-lg bg-[#FAF8F8]" />
            <Skeleton className="h-16 rounded-lg bg-[#FAF8F8]" />
          </div>
          <Skeleton className="mt-5 h-4 w-56 bg-[#EADFE2]" />
        </section>
        <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#EAE1E4] sm:p-6">
          <Skeleton className="h-5 w-40 bg-[#EADFE2]" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-20 rounded-xl bg-[#FAF8F8]" />
            <Skeleton className="h-20 rounded-xl bg-[#FAF8F8]" />
          </div>
        </section>
        <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#EAE1E4] sm:p-6">
          <Skeleton className="h-5 w-44 bg-[#EADFE2]" />
          <Skeleton className="mt-5 h-8 w-full bg-[#FAF8F8]" />
        </section>
      </div>
    </main>
  );
}

export default function MembershipPage() {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<MembershipData | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (isInitializing) return;
    if (!isAuthenticated || !user || isAdminRole(user.role)) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    void fetch("/api/memberships/me")
      .then(async (response) => {
        const result = await response.json();
        if (response.status === 401) {
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }
        if (!response.ok) throw new Error(result.message);
        setData(result);
      })
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Không thể tải membership.",
        ),
      );
  }, [isAuthenticated, isInitializing, pathname, router, user]);
  if (isInitializing)
    return (
      <StorefrontShell>
        <MembershipSkeleton />
      </StorefrontShell>
    );
  if (!isAuthenticated || !user || isAdminRole(user.role))
    return (
      <StorefrontShell>
        <main className="mx-auto max-w-3xl px-4 py-10 text-sm text-[#8B7A80]">
          Đang chuyển đến trang đăng nhập...
        </main>
      </StorefrontShell>
    );
  if (error)
    return (
      <StorefrontShell>
        <main className="mx-auto max-w-3xl px-4 py-10">
          <p className="rounded-xl bg-[#FFF3F6] p-4 text-sm text-[#A43E5F]">
            {error}
          </p>
        </main>
      </StorefrontShell>
    );
  if (!data)
    return (
      <StorefrontShell>
        <MembershipSkeleton />
      </StorefrontShell>
    );
  const progress = Math.max(0, Math.min(100, data.progressPercentage));
  return (
    <StorefrontShell>
      <main className="min-h-svh bg-[#FFF9FA] px-4 py-8 text-[#2D2226] sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D96C8A]">
            Hạng thành viên
          </p>
          <h1 className="mt-2 text-2xl font-extrabold">
            Hạng thành viên của bạn
          </h1>
          <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#EAE1E4] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-[#8B7A80]">Hạng hiện tại</p>
                <h2 className="mt-1 text-2xl font-extrabold text-[#A43E5F]">
                  {data.current.membership?.name || "Chưa đạt hạng"}
                </h2>
              </div>
              <span className="rounded-full bg-[#FCEEF3] px-3 py-1 text-xs font-bold text-[#A43E5F]">
                Chu kỳ {data.cycle.year}
              </span>
            </div>
            <div className="mt-6">
              <div className="flex justify-between gap-3 text-sm">
                <span>
                  Chi tiêu hợp lệ:{" "}
                  <strong>{money(data.eligibleSpend)}</strong>
                </span>
                <span>{progress}%</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#F3E7EA]">
                <div
                  className="h-full rounded-full bg-[#D96C8A] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            {data.nextRank ? (
              <>
                <p className="mt-5 rounded-xl bg-[#FFF3F6] px-4 py-3 text-base font-semibold leading-7 text-[#4A3039]">
                  Chi tiêu thêm{" "}
                  <strong className="text-lg text-[#A43E5F]">
                    {money(data.remainingSpend)}
                  </strong>{" "}
                  để đạt hạng{" "}
                  <strong className="text-[#A43E5F]">{data.nextRank.name}</strong>
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-[#FAF8F8] p-3">
                    <p className="text-[#8B7A80]">{data.currentRank?.name || "Bắt đầu"}</p>
                    <strong>{money(data.currentRank?.minSpend || 0)}</strong>
                  </div>
                  <div className="rounded-lg bg-[#FAF8F8] p-3 text-right">
                    <p className="text-[#8B7A80]">{data.nextRank.name}</p>
                    <strong>{money(data.nextRank.minSpend)}</strong>
                  </div>
                </div>
              </>
            ) : (
              <p className="mt-5 rounded-xl bg-[#FFF3F6] px-4 py-3 text-sm font-semibold text-[#A43E5F]">
                Bạn đang ở hạng thành viên cao nhất.
              </p>
            )}
            <p className="mt-4 text-sm text-[#65545B]">
              Ưu đãi mặc định:{" "}
              <strong>{data.current.membership?.discountRate || 0}%</strong>
            </p>
            <p className="mt-2 text-xs leading-5 text-[#8B7A80]">
              Chu kỳ được tính từ {date(data.cycle.start)} đến{" "}
              {date(data.cycle.end)}. Hạng được đánh giá lại mỗi năm; lịch sử và
              tổng chi tiêu trọn đời không bị xóa.
            </p>
          </section>
          <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#EAE1E4] sm:p-6">
            <h2 className="font-bold">Quyền lợi khả dụng</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {data.benefits.length ? (
                data.benefits.map((benefit) => (
                  <article
                    key={benefit.id}
                    className="rounded-xl border border-[#EAE1E4] p-3"
                  >
                    <p className="font-semibold">{benefit.name}</p>
                    <p className="mt-1 text-sm text-[#65545B]">
                      {benefit.description ||
                        "Quyền lợi dành cho hạng hiện tại."}
                    </p>
                    {benefit.endsAt ? (
                      <p className="mt-2 text-xs text-[#A43E5F]">
                        Hết hạn: {date(benefit.endsAt)}
                      </p>
                    ) : null}
                  </article>
                ))
              ) : (
                <p className="text-sm text-[#8B7A80]">
                  Chưa có quyền lợi khả dụng.
                </p>
              )}
            </div>
          </section>
          <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#EAE1E4] sm:p-6">
            <h2 className="font-bold">Lịch sử membership</h2>
            <div className="mt-3 grid gap-2">
              {data.history.map((item) => (
                <div
                  key={item.cycleYear}
                  className="flex flex-wrap justify-between gap-2 border-b border-[#F1E9EB] py-2 text-sm"
                >
                  <span>
                    {item.cycleYear} · {item.membershipNameSnapshot}
                  </span>
                  <strong>{money(Number(item.spending))}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </StorefrontShell>
  );
}

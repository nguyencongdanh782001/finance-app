"use client";
import {
  AdminPageContainer,
  AdminPageHeader,
  AdminSection,
} from "@/components/Admin/AdminPage";
import { formatCurrencyVND } from "@/helper/convertCurrency";
import { ReactNode, useEffect, useRef, useState } from "react";
import { YearProfitResponse } from "@/interface/financeAPI";
import { financeAPI } from "@/endpoint/financeAPI";
import { RESPONSE_CODES } from "@/constant/codes";
import { Skeleton } from "@/components/ui/skeleton";
import ListDate from "@/components/Dashboard/ListDate";
import { usePathname, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const ChartLoading = () => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center justify-between gap-3">
      <Skeleton className="h-5 w-40 rounded-2" />
      <Skeleton className="h-8 w-28 rounded-full" />
    </div>
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <Skeleton className="h-72 w-full rounded-lg" />
    </div>
  </div>
);

const TopSellingProductsChart = dynamic(
  () => import("@/components/Dashboard/TopSellingProductsChart"),
  {
    ssr: false,
    loading: ChartLoading,
  },
);

const ChartMonthlyProductProfit = dynamic(
  () => import("@/components/Dashboard/ChartMonthlyProductProfit"),
  {
    ssr: false,
    loading: ChartLoading,
  },
);

const ChartYearlyRevenue = dynamic(
  () => import("@/components/Dashboard/ChartYearlyRevenue"),
  {
    ssr: false,
    loading: ChartLoading,
  },
);

const ChartYearlyExpense = dynamic(
  () => import("@/components/Dashboard/ChartYearlyExpense"),
  {
    ssr: false,
    loading: ChartLoading,
  },
);

function LazySection({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element || isVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "480px 0px" },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [isVisible]);

  return <div ref={ref}>{isVisible ? children : <ChartLoading />}</div>;
}

export default function HomeContainer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const now = new Date();
  const urlYear = Number(searchParams.get("year"));
  const defaultYear = urlYear || now.getFullYear();

  const [isLoading, setIsLoading] = useState(true);
  const [yearProfit, setYearProfit] = useState<YearProfitResponse | undefined>(
    undefined,
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await financeAPI.getYearProfit(defaultYear);
      if (res.code === RESPONSE_CODES.success) {
        setYearProfit(res.data);
      }
      setIsLoading(false);
    };
    fetchData();
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname, searchParams.toString()]);

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Tổng quan"
        description="Theo dõi tài chính và hoạt động bán hàng của cửa hàng."
      />
      <AdminSection className="p-5">
        {isLoading ? (
          <Skeleton className="h-6 w-50 rounded-2 mb-2" />
        ) : (
          <p className="text-sm font-medium text-slate-500">
            Tổng doanh thu năm {yearProfit?.year}
          </p>
        )}

        {isLoading ? (
          <Skeleton className="h-6 w-50 rounded-2" />
        ) : (
          <p
            className={`mt-1 text-2xl font-bold ${yearProfit?.totalProfit && yearProfit?.totalProfit < 0 ? "text-red-600" : "text-emerald-700"}`}
          >
            {formatCurrencyVND(yearProfit?.totalProfit || 0)}
          </p>
        )}
      </AdminSection>
      <ListDate />

      <LazySection>
        <TopSellingProductsChart />
      </LazySection>

      <LazySection>
        <ChartMonthlyProductProfit />
      </LazySection>

      <LazySection>
        <ChartYearlyRevenue isLoading={isLoading} />
      </LazySection>

      <LazySection>
        <ChartYearlyExpense isLoading={isLoading} />
      </LazySection>
    </AdminPageContainer>
  );
}

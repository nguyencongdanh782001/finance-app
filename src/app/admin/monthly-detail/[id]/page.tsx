"use client";

import {
  AdminPageContainer,
  AdminPageHeader,
} from "@/components/Admin/AdminPage";
import FormAddExpense from "@/components/MonthlyDetail/FormAddExpense";
import ListExpense from "@/components/MonthlyDetail/ListExpense";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import { formatCurrencyVND } from "@/helper/convertCurrency";
import { toast } from "@/hook/use-toast";
import { MonthlyDetailResponse } from "@/interface/financeAPI";
import { Download, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

const escapeCsvValue = (value: string | number) => {
  const normalizedValue = String(value).replace(/"/g, '""');
  return `"${normalizedValue}"`;
};

const formatCsvDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
};

const formatNumber = (value: number) => value.toLocaleString("vi-VN");

const MonthDetail = () => {
  const params = useParams();

  const id = Number(params.id);

  const [monthlyDetailData, setMonthlyDetailData] = useState<
    MonthlyDetailResponse | undefined
  >(undefined);
  const [reload, setReload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  const fetchData = async () => {
    try {
      if (!reload) setIsLoading(true);
      const res = await financeAPI.getMonthlyDetailData(id);
      if (res.code === RESPONSE_CODES.success) {
        setMonthlyDetailData(res.data);
      }
    } finally {
      setIsLoading(false);
      setReload(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (reload) fetchData();
  }, [reload]);

  const revenue = monthlyDetailData?.totalRevenue ?? 0;
  const expense = monthlyDetailData?.totalExpense ?? 0;
  const soldProductsByDay = monthlyDetailData?.soldProductsByDay ?? [];

  const expensePercent =
    revenue === 0 ? null : Number(((expense / revenue) * 100).toFixed(1));

  const hasSoldProducts = soldProductsByDay.some(
    (day) => day.soldProducts.length > 0,
  );

  const handleExportCsv = async () => {
    if (!monthlyDetailData || !hasSoldProducts) {
      toast({
        title: "Không có sản phẩm bán ra để xuất CSV",
        className: "bg-red-1 text-white text-sm font-medium w-fit",
        duration: 3000,
      });
      return;
    }

    try {
      setIsExporting(true);
      let monthlyProfit = 0;
      const detailRows = soldProductsByDay
        .flatMap((day) =>
          day.soldProducts.flatMap((product) => {
            const totalQuantity = product.sales.reduce(
              (sum, sale) => sum + sale.quantity,
              0,
            );
            const sellPrices = Array.from(
              new Set(product.sales.map((sale) => sale.sellPrice)),
            ).sort((a, b) => a - b);
            const totalRevenue = product.sales.reduce(
              (sum, sale) => sum + sale.sellPrice * sale.quantity,
              0,
            );
            const totalCost = product.importPrice * totalQuantity;
            const dayProfit = totalRevenue - totalCost;

            monthlyProfit += dayProfit;

            return {
              date: formatCsvDate(day.date),
              productTitle: product.productTitle,
              categoryName: product.categoryName,
              quantity: totalQuantity,
              importPrice: product.importPrice,
              sellPrices,
              totalRevenue,
              dayProfit,
            };
          }),
        )
        .sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.productTitle.localeCompare(b.productTitle, "vi");
        });

      const rows = [
        [
          `Báo cáo sản phẩm bán - ${monthlyDetailData.year}/${String(
            monthlyDetailData.month,
          ).padStart(2, "0")}`,
        ],
        [""],
        [
          "Ngày",
          "Sản phẩm",
          "Danh mục",
          "Số lượng",
          "Giá nhập",
          "Giá bán",
          "Doanh thu ngày",
          "Lợi nhuận ngày",
        ],
        ...detailRows.map((row) => [
          row.date,
          row.productTitle,
          row.categoryName,
          String(row.quantity),
          formatNumber(row.importPrice),
          row.sellPrices.map((price) => formatNumber(price)).join(" / "),
          formatNumber(row.totalRevenue),
          formatNumber(row.dayProfit),
        ]),
        [""],
        [
          "Tổng lợi nhuận tháng",
          "",
          "",
          "",
          "",
          "",
          "",
          formatNumber(monthlyProfit),
        ],
      ];

      const csvContent = rows
        .map((row) => row.map((cell) => escapeCsvValue(cell)).join(","))
        .join("\n");
      const csvBlob = new Blob([`\uFEFF${csvContent}`], {
        type: "text/csv;charset=utf-8;",
      });
      const downloadUrl = window.URL.createObjectURL(csvBlob);
      const link = document.createElement("a");
      const fileMonth = String(monthlyDetailData.month).padStart(2, "0");

      link.href = downloadUrl;
      link.download = `monthly-sold-products-${monthlyDetailData.year}-${fileMonth}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Xuất CSV thành công",
        className: "bg-green-1 text-white text-sm font-medium w-fit",
        duration: 3000,
      });
    } catch {
      toast({
        title: "Xuất CSV thất bại",
        className: "bg-red-1 text-white text-sm font-medium w-fit",
        duration: 3000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AdminPageContainer>
      <Toaster />
      {isLoading ? (
        <Skeleton className="h-16 w-full rounded-lg" />
      ) : (
        <AdminPageHeader
          title={`Tháng ${monthlyDetailData?.month}, ${monthlyDetailData?.year}`}
          description="Quản lý chi phí và tổng hợp kết quả kinh doanh trong tháng."
          breadcrumb={
            <span className="flex items-center gap-1.5">
              <Link href="/admin" className="text-primary hover:underline">
                Tổng quan
              </Link>
              <span aria-hidden="true">/</span>
              <span>Chi tiết tháng</span>
            </span>
          }
          actions={
            <Button
              type="button"
              variant="adminPrimary"
              onClick={handleExportCsv}
              disabled={isExporting || !hasSoldProducts}
              className="h-10 rounded-lg px-4"
            >
              {isExporting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Xuất CSV sản phẩm bán
            </Button>
          }
        />
      )}

      <section className="flex min-w-0 flex-col gap-3">
        <h2 className="text-base font-semibold text-slate-800">Thêm chi phí</h2>
        <FormAddExpense reload={() => setReload(true)} />
      </section>

      <section className="flex min-w-0 flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-slate-800">
            Chi phí trong tháng
          </h2>

          {isLoading ? (
            <Skeleton className="h-6 w-30 rounded-2" />
          ) : (
            <p className="text-xs font-medium text-slate-500">
              {monthlyDetailData?.expenses.length} hạng mục
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2 rounded-lg bg-slate-50 p-4">
            <Skeleton className="h-7 w-60 rounded-2" />
            <Skeleton className="h-6 w-60 rounded-2" />
            <Skeleton className="h-7 w-60 rounded-2" />
          </div>
        ) : (
          <ListExpense
            data={monthlyDetailData?.expenses}
            reload={() => setReload(true)}
          />
        )}
      </section>

      <div className="sticky bottom-3 z-20 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-0.75">
            <p className="text-sm font-medium text-orange-3">Tổng chi phí</p>
            {isLoading ? (
              <Skeleton className="h-6 w-30 rounded-2" />
            ) : (
              <p className="text-base font-bold text-orange-3">
                {formatCurrencyVND(
                  Number(monthlyDetailData?.totalExpense || 0),
                )}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-0.75">
            <p className="text-sm font-medium text-orange-3">
              Phần trăm chi tiêu
            </p>
            {isLoading ? (
              <Skeleton className="h-6 w-30 rounded-2" />
            ) : (
              <p className="text-orange-1 text-base font-bold text-right">
                {!revenue && expense > 0 ? 100 : expensePercent || 0}%
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-green-2">Tổng doanh thu</p>
          </div>
          {isLoading ? (
            <Skeleton className="h-6 w-30 rounded-2" />
          ) : (
            <p
              className={`${monthlyDetailData?.profit && monthlyDetailData?.profit < 0 ? "text-red-600" : "text-green-2"} text-base font-bold`}
            >
              {formatCurrencyVND(Number(monthlyDetailData?.profit || 0))}
            </p>
          )}
        </div>
      </div>
    </AdminPageContainer>
  );
};

export default MonthDetail;

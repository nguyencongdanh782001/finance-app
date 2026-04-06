"use client";

import Header from "@/components/common/Header";
import FormAddExpense from "@/components/MonthlyDetail/FormAddExpense";
import ListExpense from "@/components/MonthlyDetail/ListExpense";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import { formatCurrencyVND } from "@/helper/convertCurrency";
import { toast } from "@/hook/use-toast";
import { MonthlyDetailResponse } from "@/interface/financeAPI";
import { Download, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
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
    <div className="sm:max-w-191.25 mx-auto">
      <Toaster />
      <Header />
      <Container className="gap-8 py-8 min-h-[calc(100svh-117px)]!">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {isLoading ? (
            <Skeleton className="h-7 w-60 rounded-2 mb-2" />
          ) : (
            <h3 className="text-blue-2 text-3xl font-extrabold">
              Tháng {monthlyDetailData?.month}, {monthlyDetailData?.year}
            </h3>
          )}

          {isLoading ? (
            <Skeleton className="h-11 w-40 rounded-xl" />
          ) : (
            <Button
              type="button"
              onClick={handleExportCsv}
              disabled={isExporting || !hasSoldProducts}
              className="h-11 rounded-xl bg-blue-2 px-4 text-sm font-bold text-white hover:bg-blue-2/90 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Download className="h-4 w-4 text-white" />
              )}
              Xuất CSV sản phẩm bán
            </Button>
          )}
        </div>

        {/* <div className="rounded-[40px] bg-green-50 p-8 border border-gray-200 shadow-sm">
          <p className="text-13px text-green-9 uppercase font-bold">
            Tổng lợi nhuận
          </p>
          {isLoading ? (
            <Skeleton className="h-7 w-60 rounded-2 mb-2" />
          ) : (
            <p className="text-[28px] text-blue-2 font-extrabold">
              {formatCompactNumber(monthlyDetailData?.totalRevenue || 0)} VND
            </p>
          )}
        </div> */}

        <div className="flex flex-col gap-5">
          <p className="text-md text-blue-2 uppercase font-bold">
            Thêm chi phí
          </p>
          <FormAddExpense reload={() => setReload(true)} />
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-center gap-10">
            <p className="text-md text-blue-2 uppercase font-bold">
              Chi phí trong tháng
            </p>

            {isLoading ? (
              <Skeleton className="h-6 w-30 rounded-2" />
            ) : (
              <p className="text-green-1 text-xs font-bold uppercase">
                {monthlyDetailData?.expenses.length} hạng mục
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col bg-white shadow-md p-5 rounded-[32px] gap-2">
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
        </div>

        <div
          className="mt-auto sticky bottom-0 flex flex-col bg-white p-5 rounded-[32px] gap-5"
          style={{ boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.75">
              <p className="text-green-1 text-sm font-extrabold uppercase">
                Tổng chi phí
              </p>
              {isLoading ? (
                <Skeleton className="h-6 w-30 rounded-2" />
              ) : (
                <p className="text-gray-3 text-base font-bold uppercase">
                  {formatCurrencyVND(
                    Number(monthlyDetailData?.totalExpense || 0),
                  )}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-0.75">
              <p className="text-green-1 text-sm font-extrabold uppercase">
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
          <div className="flex items-center justify-between gap-4 px-6 py-4 border border-green-11 bg-green-12 rounded-[24px]">
            <div className="flex flex-col">
              <p className="text-green-9 text-sm font-bold">Doanh Thu</p>
              {/* <p className="text-green-10 text-sm font-medium">(còn lại)</p> */}
            </div>
            {isLoading ? (
              <Skeleton className="h-6 w-30 rounded-2" />
            ) : (
              <p
                className={`${monthlyDetailData?.profit && monthlyDetailData?.profit < 0 ? "text-red-1" : "text-green-9"}  text-base font-extrabold`}
              >
                {formatCurrencyVND(Number(monthlyDetailData?.profit || 0))}
              </p>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default MonthDetail;

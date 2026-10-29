import prisma from "@/lib/db";
import { getDailySoldProducts } from "@/lib/sold-products/daily-sold-products";
import ExcelJS from "exceljs";
import { NextResponse } from "next/server";

const moneyFormat = '#,##0" đ"';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const monthlyId = Number((await context.params).id);
  if (!Number.isInteger(monthlyId) || monthlyId < 1) {
    return NextResponse.json(
      { message: "Mã tháng không hợp lệ." },
      { status: 400 },
    );
  }

  const monthly = await prisma.monthlyFinance.findUnique({
    where: { id: monthlyId },
    select: {
      year: true,
      month: true,
      days: { orderBy: { date: "asc" }, select: { id: true } },
    },
  });
  if (!monthly) {
    return NextResponse.json(
      { message: "Không tìm thấy dữ liệu tháng." },
      { status: 404 },
    );
  }

  const dailyResults = await Promise.all(
    monthly.days.map((day) => getDailySoldProducts(prisma, day.id)),
  );
  const rows = dailyResults
    .flatMap((result) =>
      (result?.items ?? []).map((item) => ({
        date: new Date(item.date),
        product: item.productName,
        category: item.categoryName || "Không phân loại",
        source:
          item.orderSource === "ONLINE"
            ? "Online"
            : item.orderSource === "OFFLINE"
              ? "Tại shop"
              : "Nhập thủ công",
        orderCode: item.orderCode || "—",
        quantity: item.quantity,
        importPrice: item.unitCost ?? 0,
        sellPrice: item.unitPrice,
        revenue: item.totalAmount,
        profit: item.profit ?? 0,
      })),
    )
    .sort(
      (a, b) =>
        a.date.getTime() - b.date.getTime() ||
        a.product.localeCompare(b.product, "vi"),
    );

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Quỳnh Nhi Store";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet("Sản phẩm bán", {
    views: [{ state: "frozen", ySplit: 4 }],
  });

  sheet.mergeCells("A1:J1");
  sheet.getCell("A1").value =
    `BÁO CÁO SẢN PHẨM BÁN - ${monthly.year}/${String(monthly.month).padStart(2, "0")}`;
  sheet.getCell("A1").font = {
    bold: true,
    size: 14,
    color: { argb: "FFFFFFFF" },
  };
  sheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD96C8A" },
  };
  sheet.getCell("A1").alignment = { horizontal: "center" };
  sheet.mergeCells("A2:J2");
  sheet.getCell("A2").value =
    "Bao gồm đơn bán tại shop, đơn online đã giao và dữ liệu bán thủ công.";
  sheet.getCell("A2").font = { italic: true, color: { argb: "FF6F686B" } };

  const header = [
    "Ngày",
    "Sản phẩm",
    "Danh mục",
    "Nguồn đơn",
    "Mã đơn",
    "Số lượng",
    "Giá nhập",
    "Giá bán",
    "Doanh thu",
    "Lợi nhuận",
  ];
  sheet.addRow([]);
  const headerRow = sheet.addRow(header);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFA43E5F" },
  };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };
  headerRow.eachCell((cell) => {
    cell.border = { bottom: { style: "thin", color: { argb: "FFE9E2E5" } } };
  });

  rows.forEach((row) => {
    const excelRow = sheet.addRow([
      row.date,
      row.product,
      row.category,
      row.source,
      row.orderCode,
      row.quantity,
      row.importPrice,
      row.sellPrice,
      row.revenue,
      row.profit,
    ]);
    excelRow.getCell(1).numFmt = "dd/mm/yyyy";
    [7, 8, 9, 10].forEach((column) => {
      excelRow.getCell(column).numFmt = moneyFormat;
    });
  });

  const totalRow = sheet.addRow([]);
  totalRow.getCell(1).value = "TỔNG CỘNG";
  totalRow.getCell(6).value = rows.reduce((sum, row) => sum + row.quantity, 0);
  totalRow.getCell(9).value = rows.reduce((sum, row) => sum + row.revenue, 0);
  totalRow.getCell(10).value = rows.reduce((sum, row) => sum + row.profit, 0);
  totalRow.font = { bold: true };
  [9, 10].forEach((column) => {
    totalRow.getCell(column).numFmt = moneyFormat;
  });

  [12, 28, 20, 16, 20, 10, 16, 16, 18, 18].forEach((width, index) => {
    sheet.getColumn(index + 1).width = width;
  });
  sheet.autoFilter = { from: "A4", to: "J4" };

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="monthly-sold-products-${monthly.year}-${String(monthly.month).padStart(2, "0")}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}

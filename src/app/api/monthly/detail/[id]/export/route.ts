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
      totalExpense: true,
      expenses: {
        orderBy: { createdAt: "asc" },
        select: { name: true, amount: true, createdAt: true },
      },
      days: {
        orderBy: { date: "asc" },
        select: { id: true, profitBank: true, profitCash: true },
      },
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

  const totalRevenue = monthly.days.reduce(
    (sum, day) =>
      sum + Number(day.profitBank || 0) + Number(day.profitCash || 0),
    0,
  );
  const totalExpense = Number(monthly.totalExpense || 0);
  const remainingAmount = totalRevenue - totalExpense;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Quỳnh Nhi Store";
  workbook.created = new Date();

  const summarySheet = workbook.addWorksheet("Tổng hợp");
  summarySheet.mergeCells("A1:B1");
  summarySheet.getCell("A1").value =
    `BÁO CÁO KẾT QUẢ KINH DOANH - ${monthly.year}/${String(monthly.month).padStart(2, "0")}`;
  summarySheet.getCell("A1").font = {
    bold: true,
    size: 14,
    color: { argb: "FFFFFFFF" },
  };
  summarySheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD96C8A" },
  };
  summarySheet.getCell("A1").alignment = { horizontal: "center" };
  summarySheet.addRow([]);
  const summaryHeader = summarySheet.addRow(["Chỉ tiêu", "Số tiền"]);
  summaryHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  summaryHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFA43E5F" },
  };
  const summaryRows = [
    ["Tổng doanh thu", totalRevenue],
    ["Tổng chi phí", totalExpense],
    ["Còn lại (doanh thu - chi phí)", remainingAmount],
  ];
  summaryRows.forEach(([label, amount]) => {
    const row = summarySheet.addRow([label, amount]);
    row.getCell(2).numFmt = moneyFormat;
    if (label === "Còn lại (doanh thu - chi phí)") {
      row.font = {
        bold: true,
        color: { argb: remainingAmount >= 0 ? "FF00876C" : "FFDC2626" },
      };
    }
  });
  summarySheet.getColumn(1).width = 32;
  summarySheet.getColumn(2).width = 22;

  const expenseSheet = workbook.addWorksheet("Chi phí");
  expenseSheet.mergeCells("A1:C1");
  expenseSheet.getCell("A1").value = "CHI PHÍ TRONG THÁNG";
  expenseSheet.getCell("A1").font = {
    bold: true,
    size: 14,
    color: { argb: "FFFFFFFF" },
  };
  expenseSheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF97316" },
  };
  expenseSheet.getCell("A1").alignment = { horizontal: "center" };
  const expenseHeader = expenseSheet.addRow([
    "Ngày ghi nhận",
    "Mô tả chi phí",
    "Số tiền",
  ]);
  expenseHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  expenseHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEA580C" },
  };
  monthly.expenses.forEach((expense) => {
    const row = expenseSheet.addRow([
      expense.createdAt,
      expense.name,
      Number(expense.amount),
    ]);
    row.getCell(1).numFmt = "dd/mm/yyyy";
    row.getCell(3).numFmt = moneyFormat;
  });
  const expenseTotalRow = expenseSheet.addRow([
    "TỔNG CHI PHÍ",
    "",
    totalExpense,
  ]);
  expenseTotalRow.font = { bold: true };
  expenseTotalRow.getCell(3).numFmt = moneyFormat;
  expenseSheet.getColumn(1).width = 18;
  expenseSheet.getColumn(2).width = 32;
  expenseSheet.getColumn(3).width = 20;
  expenseSheet.autoFilter = { from: "A2", to: "C2" };

  const sheet = workbook.addWorksheet("Sản phẩm bán", {
    views: [{ state: "frozen", ySplit: 4 }],
  });

  sheet.mergeCells("A1:J1");
  sheet.getCell("A1").value =
    `SẢN PHẨM BÁN TRONG THÁNG - ${monthly.year}/${String(monthly.month).padStart(2, "0")}`;
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

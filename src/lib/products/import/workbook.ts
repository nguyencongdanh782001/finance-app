import ExcelJS from "exceljs";
import type { CellValue, Row, Worksheet } from "exceljs";
import {
  PRODUCT_IMPORT_HEADERS,
  PRODUCT_IMPORT_LIMITS,
  PRODUCT_IMPORT_SHEETS,
  type ImportCellError,
  type ImportCellValue,
  type ProductImportSource,
} from "./types.ts";

const HEADER_FILL = "FFD96C8A";
const HEADER_TEXT = "FFFFFFFF";
const SOFT_FILL = "FFFCEEF3";
const ERROR_FILL = "FFFFE4E6";
const WARNING_FILL = "FFFEF3C7";

const protectPlainText = (value: ImportCellValue): CellValue => {
  if (typeof value === "string" && /^[=+\-@]/.test(value)) return `'${value}`;
  return value;
};

const styleHeader = (row: Row) => {
  row.height = 26;
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: HEADER_TEXT } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: HEADER_FILL },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FFEAE1E4" } },
    };
  });
};

const prepareDataSheet = (
  workbook: ExcelJS.Workbook,
  name: string,
  headers: readonly string[],
) => {
  const sheet = workbook.addWorksheet(name, {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sheet.addRow([...headers]);
  styleHeader(sheet.getRow(1));
  sheet.autoFilter = {
    from: "A1",
    to: `${sheet.getColumn(headers.length).letter}1`,
  };
  headers.forEach((header, index) => {
    const column = sheet.getColumn(index + 1);
    column.width = Math.max(14, Math.min(42, header.length + 8));
    if (header.includes("description") || header === "image_url")
      column.width = 42;
    if (header.includes("sku") || header.endsWith("_key")) column.numFmt = "@";
  });
  return sheet;
};

const addListValidation = (
  sheet: Worksheet,
  columnName: string,
  values: string[],
) => {
  const header = sheet.getRow(1).values as CellValue[];
  const column = header.findIndex((value) => value === columnName);
  if (column < 1) return;
  for (let row = 2; row <= PRODUCT_IMPORT_LIMITS.maxProducts + 1; row += 1) {
    sheet.getCell(row, column).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [`"${values.join(",")}"`],
      showErrorMessage: true,
      errorTitle: "Giá trị không hợp lệ",
      error: `Chọn một trong: ${values.join(", ")}`,
    };
  }
};

export async function createProductImportTemplate() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Finance App";
  workbook.created = new Date();
  workbook.modified = new Date();

  const instructions = workbook.addWorksheet(
    PRODUCT_IMPORT_SHEETS.instructions,
    {
      views: [{ state: "frozen", ySplit: 3 }],
    },
  );
  instructions.columns = [{ width: 26 }, { width: 95 }];
  instructions.mergeCells("A1:B1");
  instructions.getCell("A1").value = "HƯỚNG DẪN NHẬP SẢN PHẨM TỪ EXCEL";
  instructions.getCell("A1").font = {
    bold: true,
    size: 16,
    color: { argb: HEADER_TEXT },
  };
  instructions.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: HEADER_FILL },
  };
  instructions.getCell("A1").alignment = {
    vertical: "middle",
    horizontal: "center",
  };
  instructions.getRow(1).height = 34;
  instructions.addRow([]);
  instructions.addRow(["Mục", "Quy tắc"]);
  styleHeader(instructions.getRow(3));
  [
    [
      "Quan trọng",
      "Không đổi tên sheet hoặc tên cột. Xóa các dòng ví dụ trước khi nhập dữ liệu thật.",
    ],
    [
      "Giới hạn",
      `Tối đa ${PRODUCT_IMPORT_LIMITS.maxProducts.toLocaleString("vi-VN")} sản phẩm, ${PRODUCT_IMPORT_LIMITS.maxRows.toLocaleString("vi-VN")} dòng và ${(PRODUCT_IMPORT_LIMITS.maxFileSize / 1024 / 1024).toLocaleString("vi-VN")} MB.`,
    ],
    [
      "Liên kết",
      "Dùng product_key, category_key và variant_sku ổn định; không dùng số dòng làm quan hệ.",
    ],
    [
      "Trạng thái",
      "PUBLIC / PRIVATE / DISCONTINUED hoặc Công khai / Riêng tư / Ngừng bán.",
    ],
    ["Giới tính", "WOMEN / MEN / UNISEX / KIDS."],
    ["Boolean", "TRUE/FALSE, 1/0 hoặc Có/Không."],
    [
      "Tiền và tồn kho",
      "VND là số nguyên. Giá bán > 0; giá vốn và tồn kho >= 0.",
    ],
    [
      "SKU",
      "Luôn nhập SKU dưới dạng text để giữ số 0 ở đầu. SKU phải duy nhất trong file và hệ thống.",
    ],
    [
      "Danh mục",
      "Sheet Danh mục chỉ được dùng để tạo danh mục mới khi Admin bật xác nhận tương ứng.",
    ],
    [
      "Sản phẩm không biến thể",
      "has_variants = FALSE và bắt buộc default_sku, default_price, default_cost, default_stock.",
    ],
    [
      "Sản phẩm có biến thể",
      "has_variants = TRUE và có ít nhất một dòng Biến thể với màu hoặc kích thước.",
    ],
    [
      "Ảnh",
      "Hình ảnh là tùy chọn. Nếu khai báo, chỉ dùng URL HTTP/HTTPS công khai; tối đa 20 ảnh/sản phẩm.",
    ],
    [
      "Ảnh biến thể",
      "Để trống variant_sku cho ảnh chung; điền SKU để gán ảnh cho biến thể.",
    ],
    [
      "Chế độ nhập",
      "Mặc định chỉ tạo mới. File upload chỉ được kiểm tra; dữ liệu chỉ ghi sau bước xác nhận.",
    ],
  ].forEach((row) => instructions.addRow(row));
  instructions.eachRow((row, rowNumber) => {
    if (rowNumber > 3 && rowNumber % 2 === 0)
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: SOFT_FILL },
        };
      });
    row.alignment = { vertical: "top", wrapText: true };
  });
  instructions.protect("finance-app-template", {
    selectLockedCells: true,
    selectUnlockedCells: true,
  });

  const categories = prepareDataSheet(
    workbook,
    PRODUCT_IMPORT_SHEETS.categories,
    PRODUCT_IMPORT_HEADERS.categories,
  );
  categories.addRow(["ao", "Áo", "ao", ""]);
  categories.addRow(["ao-thun", "Áo thun", "ao-thun", "ao"]);

  const products = prepareDataSheet(
    workbook,
    PRODUCT_IMPORT_SHEETS.products,
    PRODUCT_IMPORT_HEADERS.products,
  );
  products.addRow([
    "SP-001",
    "Áo thun cơ bản",
    "ao-thun-co-ban",
    "ao-thun",
    "",
    "",
    "UNISEX",
    "PRIVATE",
    "Áo thun mặc hằng ngày",
    "Mô tả chi tiết sản phẩm",
    true,
    "",
    "",
    "",
    "",
  ]);
  products.addRow([
    "SP-002",
    "Túi vải",
    "tui-vai",
    "",
    "phu-kien",
    "",
    "UNISEX",
    "Riêng tư",
    "",
    "",
    false,
    "00123",
    120000,
    50000,
    10,
  ]);
  addListValidation(products, "gender", ["WOMEN", "MEN", "UNISEX", "KIDS"]);
  addListValidation(products, "status", ["PUBLIC", "PRIVATE", "DISCONTINUED"]);
  addListValidation(products, "has_variants", ["TRUE", "FALSE"]);

  const variants = prepareDataSheet(
    workbook,
    PRODUCT_IMPORT_SHEETS.variants,
    PRODUCT_IMPORT_HEADERS.variants,
  );
  variants.addRow(["SP-001", "Đen", "M", "AT-DEN-M", 150000, 70000, 20, true]);
  variants.addRow([
    "SP-001",
    "Trắng",
    "L",
    "AT-TRANG-L",
    150000,
    70000,
    15,
    true,
  ]);
  addListValidation(variants, "is_active", ["TRUE", "FALSE"]);

  const images = prepareDataSheet(
    workbook,
    PRODUCT_IMPORT_SHEETS.images,
    PRODUCT_IMPORT_HEADERS.images,
  );
  images.addRow([
    "SP-001",
    "",
    "https://example.com/ao-thun.jpg",
    0,
    true,
    "Áo thun cơ bản",
  ]);
  images.addRow([
    "SP-001",
    "AT-DEN-M",
    "https://example.com/ao-thun-den.jpg",
    0,
    true,
    "Áo thun đen",
  ]);
  images.addRow([
    "SP-002",
    "",
    "https://example.com/tui-vai.jpg",
    0,
    true,
    "Túi vải",
  ]);
  addListValidation(images, "is_primary", ["TRUE", "FALSE"]);

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

const sheetHeaders = new Map<string, readonly string[]>([
  [PRODUCT_IMPORT_SHEETS.categories, PRODUCT_IMPORT_HEADERS.categories],
  [PRODUCT_IMPORT_SHEETS.products, PRODUCT_IMPORT_HEADERS.products],
  [PRODUCT_IMPORT_SHEETS.variants, PRODUCT_IMPORT_HEADERS.variants],
  [PRODUCT_IMPORT_SHEETS.images, PRODUCT_IMPORT_HEADERS.images],
]);

export async function createProductImportErrorWorkbook(
  source: ProductImportSource,
  errors: ImportCellError[],
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Finance App";
  const errorsBySheetRow = new Map<string, ImportCellError[]>();
  errors.forEach((error) => {
    const key = `${error.sheet}:${error.row}`;
    errorsBySheetRow.set(key, [...(errorsBySheetRow.get(key) || []), error]);
  });
  const invalidProductKeys = new Set(
    errors
      .filter((error) => error.severity === "ERROR" && error.productKey)
      .map((error) => error.productKey?.toLocaleLowerCase("vi")),
  );

  Object.entries(source.originalRows).forEach(([sheetName, rows]) => {
    const headers = sheetHeaders.get(sheetName);
    if (!headers) return;
    const selectedRows = rows.filter((row) => {
      const productKey = String(row.values.product_key || "").toLocaleLowerCase(
        "vi",
      );
      return (
        errorsBySheetRow.has(`${sheetName}:${row.row}`) ||
        invalidProductKeys.has(productKey)
      );
    });
    if (
      !selectedRows.length &&
      !errors.some((error) => error.sheet === sheetName)
    )
      return;
    const sheet = prepareDataSheet(workbook, sheetName, [
      ...headers,
      "import_status",
      "error_columns",
      "error_messages",
    ]);
    selectedRows.forEach((rawRow) => {
      const directErrors =
        errorsBySheetRow.get(`${sheetName}:${rawRow.row}`) || [];
      const productKey = String(
        rawRow.values.product_key || "",
      ).toLocaleLowerCase("vi");
      const relatedErrors = directErrors.length
        ? directErrors
        : errors.filter(
            (error) => error.productKey?.toLocaleLowerCase("vi") === productKey,
          );
      const hasError = relatedErrors.some(
        (error) => error.severity === "ERROR",
      );
      const row = sheet.addRow([
        ...headers.map((header) =>
          protectPlainText(rawRow.values[header] ?? null),
        ),
        hasError ? "ERROR" : "WARNING",
        [
          ...new Set(
            relatedErrors.map((error) => error.column).filter(Boolean),
          ),
        ].join(", "),
        relatedErrors
          .map((error) => protectPlainText(error.message))
          .join(" | "),
      ]);
      row.eachCell((cell, column) => {
        const header = String(sheet.getRow(1).getCell(column).value || "");
        const cellErrors = relatedErrors.filter(
          (error) => error.column === header,
        );
        if (cellErrors.some((error) => error.severity === "ERROR")) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: ERROR_FILL },
          };
        } else if (cellErrors.length) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: WARNING_FILL },
          };
        }
      });
    });
  });

  const summary = workbook.addWorksheet("Tổng hợp lỗi", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  const summaryHeaders = [
    "sheet",
    "row",
    "column",
    "field",
    "value",
    "code",
    "severity",
    "message",
  ];
  summary.addRow(summaryHeaders);
  styleHeader(summary.getRow(1));
  errors.forEach((error) =>
    summary.addRow([
      error.sheet,
      error.row,
      error.column,
      error.field,
      protectPlainText(error.value),
      error.code,
      error.severity,
      protectPlainText(error.message),
    ]),
  );
  summary.columns.forEach((column, index) => {
    column.width = index === 7 ? 60 : 20;
  });

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

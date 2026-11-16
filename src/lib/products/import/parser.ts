import ExcelJS from "exceljs";
import type { Cell, Worksheet } from "exceljs";
import type { ProductStatus } from "@/interface/product";
import {
  PRODUCT_IMPORT_HEADERS,
  PRODUCT_IMPORT_LIMITS,
  PRODUCT_IMPORT_SHEETS,
  PRODUCT_PER_SHEET_HEADERS,
  PRODUCT_PER_SHEET_SECTIONS,
  type ImportCellError,
  type ImportCellValue,
  type ImportImage,
  type ImportProduct,
  type ImportRawRow,
  type ImportVariant,
  type ProductImportDatabaseContext,
  type ProductImportOptions,
  type ProductImportSource,
  type ProductImportValidation,
  isFileBlockingImportError,
} from "./types.ts";

type SheetKey = keyof typeof PRODUCT_IMPORT_HEADERS;
type RowReader = {
  row: number;
  sheet?: string;
  values: Record<string, ImportCellValue>;
  formulas: Set<string>;
};

const normalizeText = (value: unknown) => String(value ?? "").trim();
const normalizedKey = (value: string) => value.trim().toLocaleLowerCase("vi");
const normalizeCategoryReference = (value: ImportCellValue) => {
  const reference = normalizeText(value);
  const displayValue = reference.match(/^(\d+)\s*[-–—|]\s*.+$/);
  return displayValue?.[1] || reference;
};

export const slugifyImportValue = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getCellValue = (
  cell: Cell,
): { value: ImportCellValue; formula: boolean } => {
  const raw = cell.value;

  if (raw && typeof raw === "object") {
    if ("formula" in raw || "sharedFormula" in raw) {
      return { value: normalizeText(cell.text), formula: true };
    }
    if ("richText" in raw && Array.isArray(raw.richText)) {
      return {
        value: raw.richText
          .map((part) => part.text)
          .join("")
          .trim(),
        formula: false,
      };
    }
    if ("hyperlink" in raw) {
      return {
        value: normalizeText(raw.text || raw.hyperlink),
        formula: false,
      };
    }
    if (raw instanceof Date) {
      return { value: raw.toISOString(), formula: false };
    }
    return { value: normalizeText(cell.text), formula: false };
  }

  if (typeof raw === "number" || typeof raw === "boolean") {
    return { value: raw, formula: false };
  }

  return { value: raw == null ? null : normalizeText(raw), formula: false };
};

const readSheet = (
  worksheet: Worksheet,
  headers: readonly string[],
  errors: ImportCellError[],
): RowReader[] => {
  const headerRow = worksheet.getRow(1);
  const seen = new Set<string>();
  const headerIndex = new Map<string, number>();

  for (let column = 1; column <= headerRow.cellCount; column += 1) {
    const header = normalizeText(headerRow.getCell(column).text).toLowerCase();
    if (!header) continue;
    if (seen.has(header)) {
      errors.push({
        sheet: worksheet.name,
        row: 1,
        column: header,
        field: header,
        value: header,
        code: "DUPLICATE_HEADER",
        message: `Cột “${header}” bị lặp.`,
        severity: "ERROR",
      });
    }
    seen.add(header);
    headerIndex.set(header, column);
  }

  headers.forEach((header) => {
    if (!headerIndex.has(header)) {
      errors.push({
        sheet: worksheet.name,
        row: 1,
        column: header,
        field: header,
        value: null,
        code: "MISSING_HEADER",
        message: `Thiếu cột bắt buộc “${header}”.`,
        severity: "ERROR",
      });
    }
  });

  const rows: RowReader[] = [];
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const values: Record<string, ImportCellValue> = {};
    const formulas = new Set<string>();
    let hasValue = false;

    headers.forEach((header) => {
      const column = headerIndex.get(header);
      const parsed = column
        ? getCellValue(row.getCell(column))
        : { value: null, formula: false };
      values[header] = parsed.value;
      if (parsed.formula) formulas.add(header);
      if (parsed.value !== null && parsed.value !== "") hasValue = true;
    });

    if (hasValue) rows.push({ row: rowNumber, values, formulas });
  }

  return rows;
};

const readPerProductSheet = (
  worksheet: Worksheet,
  errors: ImportCellError[],
): {
  product: RowReader;
  variants: RowReader[];
  images: RowReader[];
} | null => {
  const sheet = worksheet.name;
  const firstHeader = worksheet.getRow(1);
  const firstHeaders = [
    normalizeText(firstHeader.getCell(1).text).toLowerCase(),
    normalizeText(firstHeader.getCell(2).text).toLowerCase(),
  ];
  PRODUCT_PER_SHEET_HEADERS.product.forEach((header, index) => {
    if (firstHeaders[index] === header) return;
    errors.push({
      sheet,
      row: 1,
      column: header,
      field: header,
      value: null,
      code: "MISSING_HEADER",
      message: `Sheet sản phẩm thiếu cột “${header}”.`,
      severity: "ERROR",
    });
  });

  const productValues: Record<string, ImportCellValue> = {};
  const productFormulas = new Set<string>();
  let productRow = 2;
  let variantsStart = -1;
  let imagesStart = -1;
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const label = normalizeText(worksheet.getRow(rowNumber).getCell(1).text);
    if (label === PRODUCT_PER_SHEET_SECTIONS.variants) {
      variantsStart = rowNumber;
      break;
    }
    if (label === PRODUCT_PER_SHEET_SECTIONS.images) {
      imagesStart = rowNumber;
      break;
    }
    if (!label) continue;
    if (PRODUCT_IMPORT_HEADERS.products.includes(label as never)) {
      const cell = worksheet.getRow(rowNumber).getCell(2);
      const parsed = getCellValue(cell);
      productValues[label] = parsed.value;
      if (parsed.formula) productFormulas.add(label);
      if (label === "product_key") productRow = rowNumber;
    }
  }
  PRODUCT_IMPORT_HEADERS.products.forEach((header) => {
    if (!(header in productValues)) productValues[header] = null;
  });

  const readTable = (
    sectionRow: number,
    headers: readonly string[],
  ): RowReader[] => {
    if (sectionRow < 0) return [];
    const headerRowNumber = sectionRow + 1;
    const headerRow = worksheet.getRow(headerRowNumber);
    const headerIndex = new Map<string, number>();
    for (let column = 1; column <= headerRow.cellCount; column += 1) {
      const header = normalizeText(
        headerRow.getCell(column).text,
      ).toLowerCase();
      if (header) headerIndex.set(header, column);
    }
    headers.forEach((header) => {
      if (!headerIndex.has(header)) {
        errors.push({
          sheet,
          row: headerRowNumber,
          column: header,
          field: header,
          value: null,
          code: "MISSING_HEADER",
          message: `Sheet sản phẩm thiếu cột “${header}” trong bảng ${worksheet.getRow(sectionRow).getCell(1).text}.`,
          severity: "ERROR",
        });
      }
    });
    const rows: RowReader[] = [];
    for (
      let rowNumber = headerRowNumber + 1;
      rowNumber <= worksheet.rowCount;
      rowNumber += 1
    ) {
      const row = worksheet.getRow(rowNumber);
      const values: Record<string, ImportCellValue> = {};
      const formulas = new Set<string>();
      let hasValue = false;
      headers.forEach((header) => {
        const column = headerIndex.get(header);
        const parsed = column
          ? getCellValue(row.getCell(column))
          : { value: null, formula: false };
        values[header] = parsed.value;
        if (parsed.formula) formulas.add(header);
        if (parsed.value !== null && parsed.value !== "") hasValue = true;
      });
      if (!hasValue) break;
      rows.push({ row: rowNumber, values, formulas, sheet });
    }
    return rows;
  };

  if (variantsStart >= 0) {
    const nextSection = worksheet
      .getRows(variantsStart + 1, worksheet.rowCount - variantsStart)
      ?.find((row) =>
        [PRODUCT_PER_SHEET_SECTIONS.images].includes(
          normalizeText(row.getCell(1).text) as never,
        ),
      );
    if (nextSection) imagesStart = nextSection.number;
  }
  if (imagesStart < 0) {
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
      if (
        normalizeText(worksheet.getRow(rowNumber).getCell(1).text) ===
        PRODUCT_PER_SHEET_SECTIONS.images
      ) {
        imagesStart = rowNumber;
        break;
      }
    }
  }

  return {
    product: {
      row: productRow,
      values: productValues,
      formulas: productFormulas,
      sheet,
    },
    variants: readTable(variantsStart, PRODUCT_PER_SHEET_HEADERS.variants).map(
      (row) => ({
        ...row,
        values: { ...row.values, product_key: productValues.product_key },
      }),
    ),
    images: readTable(imagesStart, PRODUCT_PER_SHEET_HEADERS.images).map(
      (row) => ({
        ...row,
        values: { ...row.values, product_key: productValues.product_key },
      }),
    ),
  };
};

const parseInteger = (value: ImportCellValue) => {
  if (typeof value === "number") return Number.isInteger(value) ? value : null;
  if (typeof value !== "string" || !/^-?\d+$/.test(value.trim())) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
};

const parseBoolean = (value: ImportCellValue) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number")
    return value === 1 ? true : value === 0 ? false : null;
  const normalized = normalizeText(value).toLocaleLowerCase("vi");
  if (["true", "1", "có", "co"].includes(normalized)) return true;
  if (["false", "0", "không", "khong"].includes(normalized)) return false;
  return null;
};

const parseStatus = (value: ImportCellValue) => {
  const normalized = normalizeText(value).toLocaleLowerCase("vi");
  const statuses = new Map<string, ProductStatus>([
    ["public", "PUBLIC"],
    ["công khai", "PUBLIC"],
    ["cong khai", "PUBLIC"],
    ["private", "PRIVATE"],
    ["riêng tư", "PRIVATE"],
    ["rieng tu", "PRIVATE"],
    ["discontinued", "DISCONTINUED"],
    ["ngừng bán", "DISCONTINUED"],
    ["ngung ban", "DISCONTINUED"],
  ] as const);
  return statuses.get(normalized) || null;
};

const isSafeImageUrl = (value: string) => {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "0.0.0.0" ||
      host === "169.254.169.254" ||
      host === "::1" ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)
    )
      return false;
    return true;
  } catch {
    return false;
  }
};

const addError = (
  errors: ImportCellError[],
  input: Omit<ImportCellError, "severity"> & {
    severity?: ImportCellError["severity"];
  },
) => errors.push({ severity: "ERROR", ...input });

const valueOf = (row: RowReader, column: string) => row.values[column] ?? null;

const validateFormulaFields = (
  rows: RowReader[],
  sheet: string,
  fields: string[],
  errors: ImportCellError[],
) => {
  rows.forEach((row) =>
    fields.forEach((field) => {
      if (!row.formulas.has(field)) return;
      addError(errors, {
        sheet,
        row: row.row,
        column: field,
        field,
        value: valueOf(row, field),
        code: "FORMULA_NOT_ALLOWED",
        message: "Không chấp nhận công thức ở trường định danh.",
      });
    }),
  );
};

export async function parseAndValidateProductWorkbook(
  buffer: Buffer,
  database: ProductImportDatabaseContext,
  options: ProductImportOptions,
): Promise<ProductImportValidation> {
  const workbook = new ExcelJS.Workbook();
  const errors: ImportCellError[] = [];

  try {
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer;
    await workbook.xlsx.load(arrayBuffer);
  } catch {
    throw new Error("File Excel bị lỗi hoặc không đúng định dạng .xlsx.");
  }

  const legacyProductSheet = workbook.getWorksheet(
    PRODUCT_IMPORT_SHEETS.products,
  );
  const usesLegacyLayout = Boolean(
    legacyProductSheet &&
    normalizeText(
      legacyProductSheet.getRow(1).getCell(1).text,
    ).toLowerCase() === "product_key",
  );
  const requiredSheets = usesLegacyLayout
    ? Object.values(PRODUCT_IMPORT_SHEETS)
    : [PRODUCT_IMPORT_SHEETS.instructions, PRODUCT_IMPORT_SHEETS.categories];
  requiredSheets.forEach((sheet) => {
    if (!workbook.getWorksheet(sheet))
      addError(errors, {
        sheet,
        row: 0,
        column: "",
        field: "sheet",
        value: null,
        code: "MISSING_SHEET",
        message: `Thiếu sheet “${sheet}”.`,
      });
  });

  const getRows = (key: SheetKey) => {
    const sheet = workbook.getWorksheet(PRODUCT_IMPORT_SHEETS[key]);
    return sheet ? readSheet(sheet, PRODUCT_IMPORT_HEADERS[key], errors) : [];
  };
  const categorySheet = workbook.getWorksheet(PRODUCT_IMPORT_SHEETS.categories);
  const categoryRows = categorySheet
    ? readSheet(
        categorySheet,
        usesLegacyLayout
          ? PRODUCT_IMPORT_HEADERS.categories
          : PRODUCT_PER_SHEET_HEADERS.categories,
        errors,
      )
    : [];
  let productRows: RowReader[] = [];
  let variantRows: RowReader[] = [];
  let imageRows: RowReader[] = [];
  if (usesLegacyLayout) {
    productRows = getRows("products");
    variantRows = getRows("variants");
    imageRows = getRows("images");
  } else {
    const reservedSheetNames = new Set<string>([
      PRODUCT_IMPORT_SHEETS.instructions,
      PRODUCT_IMPORT_SHEETS.categories,
      PRODUCT_IMPORT_SHEETS.products,
      PRODUCT_IMPORT_SHEETS.variants,
      PRODUCT_IMPORT_SHEETS.images,
    ]);
    const productSheets = workbook.worksheets.filter(
      (sheet) => !reservedSheetNames.has(sheet.name),
    );
    if (!productSheets.length) {
      addError(errors, {
        sheet: "Workbook",
        row: 0,
        column: "sheet",
        field: "sheet",
        value: null,
        code: "MISSING_SHEET",
        message:
          "File phải có ít nhất một sheet sản phẩm (tên bắt đầu bằng SP-).",
      });
    }
    productSheets.forEach((sheet) => {
      const parsed = readPerProductSheet(sheet, errors);
      if (!parsed) return;
      productRows.push(parsed.product);
      variantRows.push(...parsed.variants);
      imageRows.push(...parsed.images);
    });
  }
  const totalRows =
    categoryRows.length +
    productRows.length +
    variantRows.length +
    imageRows.length;

  if (totalRows > PRODUCT_IMPORT_LIMITS.maxRows)
    addError(errors, {
      sheet: "Workbook",
      row: 0,
      column: "",
      field: "rows",
      value: totalRows,
      code: "ROW_LIMIT_EXCEEDED",
      message: `File vượt quá ${PRODUCT_IMPORT_LIMITS.maxRows.toLocaleString("vi-VN")} dòng dữ liệu.`,
    });
  if (productRows.length > PRODUCT_IMPORT_LIMITS.maxProducts)
    addError(errors, {
      sheet: PRODUCT_IMPORT_SHEETS.products,
      row: 0,
      column: "product_key",
      field: "product_key",
      value: productRows.length,
      code: "PRODUCT_LIMIT_EXCEEDED",
      message: `File vượt quá ${PRODUCT_IMPORT_LIMITS.maxProducts.toLocaleString("vi-VN")} sản phẩm.`,
    });

  validateFormulaFields(
    productRows,
    PRODUCT_IMPORT_SHEETS.products,
    ["product_key", "slug", "default_sku"],
    errors,
  );
  validateFormulaFields(
    categoryRows,
    PRODUCT_IMPORT_SHEETS.categories,
    ["category_key", "slug", "parent_category_key"],
    errors,
  );
  validateFormulaFields(
    variantRows,
    PRODUCT_IMPORT_SHEETS.variants,
    ["product_key", "sku"],
    errors,
  );
  validateFormulaFields(
    imageRows,
    PRODUCT_IMPORT_SHEETS.images,
    ["product_key", "variant_sku"],
    errors,
  );

  const categories = categoryRows.map((row) => ({
    row: row.row,
    key: normalizeText(valueOf(row, "category_key")),
    name: normalizeText(valueOf(row, "name")),
    slug: slugifyImportValue(
      normalizeText(valueOf(row, "slug")) ||
        normalizeText(valueOf(row, "name")),
    ),
    parentKey: normalizeText(valueOf(row, "parent_category_key")),
  }));
  const categoryMap = new Map(
    categories.map((category) => [normalizedKey(category.key), category]),
  );
  const invalidCategoryKeys = new Set<string>();
  const categoryKeyCount = new Map<string, number>();
  const categorySlugCount = new Map<string, number>();
  categories.forEach((category) => {
    const key = normalizedKey(category.key);
    categoryKeyCount.set(key, (categoryKeyCount.get(key) || 0) + 1);
    categorySlugCount.set(
      normalizedKey(category.slug),
      (categorySlugCount.get(normalizedKey(category.slug)) || 0) + 1,
    );
    if (!category.key || !category.name) {
      invalidCategoryKeys.add(key);
      addError(errors, {
        sheet: PRODUCT_IMPORT_SHEETS.categories,
        row: category.row,
        column: !category.key ? "category_key" : "name",
        field: !category.key ? "category_key" : "name",
        value: !category.key ? category.key : category.name,
        code: "CATEGORY_REQUIRED",
        message: "Danh mục phải có category_key và name.",
      });
    }
    if (category.parentKey && normalizedKey(category.parentKey) === key) {
      invalidCategoryKeys.add(key);
      addError(errors, {
        sheet: PRODUCT_IMPORT_SHEETS.categories,
        row: category.row,
        column: "parent_category_key",
        field: "parent_category_key",
        value: category.parentKey,
        code: "CATEGORY_SELF_PARENT",
        message: "Danh mục không thể là cha của chính nó.",
      });
    }
    if (
      category.parentKey &&
      !categoryMap.has(normalizedKey(category.parentKey))
    ) {
      invalidCategoryKeys.add(key);
      addError(errors, {
        sheet: PRODUCT_IMPORT_SHEETS.categories,
        row: category.row,
        column: "parent_category_key",
        field: "parent_category_key",
        value: category.parentKey,
        code: "CATEGORY_PARENT_NOT_FOUND",
        message: "Không tìm thấy category_key của danh mục cha.",
      });
    }
  });
  categories.forEach((category) => {
    const key = normalizedKey(category.key);
    if ((categoryKeyCount.get(key) || 0) > 1) {
      invalidCategoryKeys.add(key);
      addError(errors, {
        sheet: PRODUCT_IMPORT_SHEETS.categories,
        row: category.row,
        column: "category_key",
        field: "category_key",
        value: category.key,
        code: "DUPLICATE_CATEGORY_KEY",
        message: "category_key bị trùng trong file.",
      });
    }
    if ((categorySlugCount.get(normalizedKey(category.slug)) || 0) > 1) {
      invalidCategoryKeys.add(key);
      addError(errors, {
        sheet: PRODUCT_IMPORT_SHEETS.categories,
        row: category.row,
        column: "slug",
        field: "slug",
        value: category.slug,
        code: "DUPLICATE_CATEGORY_SLUG",
        message: "Slug danh mục bị trùng trong file.",
      });
    }
    const visited = new Set<string>();
    let cursor = category;
    let depth = 1;
    while (cursor.parentKey) {
      const cursorKey = normalizedKey(cursor.key);
      if (visited.has(cursorKey)) {
        invalidCategoryKeys.add(key);
        addError(errors, {
          sheet: PRODUCT_IMPORT_SHEETS.categories,
          row: category.row,
          column: "parent_category_key",
          field: "parent_category_key",
          value: category.parentKey,
          code: "CATEGORY_CYCLE",
          message: "Cấu trúc danh mục tạo thành vòng lặp.",
        });
        break;
      }
      visited.add(cursorKey);
      const parent = categoryMap.get(normalizedKey(cursor.parentKey));
      if (!parent) break;
      cursor = parent;
      depth += 1;
      if (depth > PRODUCT_IMPORT_LIMITS.maxCategoryDepth) {
        invalidCategoryKeys.add(key);
        addError(errors, {
          sheet: PRODUCT_IMPORT_SHEETS.categories,
          row: category.row,
          column: "parent_category_key",
          field: "parent_category_key",
          value: category.parentKey,
          code: "CATEGORY_DEPTH_EXCEEDED",
          message: `Danh mục vượt quá ${PRODUCT_IMPORT_LIMITS.maxCategoryDepth} cấp.`,
        });
        break;
      }
    }
  });

  const variants: ImportVariant[] = variantRows.map((row) => ({
    sheet: row.sheet,
    row: row.row,
    productKey: normalizeText(valueOf(row, "product_key")),
    color: normalizeText(valueOf(row, "color")),
    size: normalizeText(valueOf(row, "size")),
    sku: normalizeText(valueOf(row, "sku")),
    price: parseInteger(valueOf(row, "price")),
    cost: parseInteger(valueOf(row, "cost")),
    stock: parseInteger(valueOf(row, "stock")),
    isActive: parseBoolean(valueOf(row, "is_active")),
  }));
  const images: ImportImage[] = imageRows.map((row) => ({
    sheet: row.sheet,
    row: row.row,
    productKey: normalizeText(valueOf(row, "product_key")),
    variantSku: normalizeText(valueOf(row, "variant_sku")),
    imageUrl: normalizeText(valueOf(row, "image_url")),
    sortOrder: parseInteger(valueOf(row, "sort_order")),
    isPrimary: parseBoolean(valueOf(row, "is_primary")),
    altText: normalizeText(valueOf(row, "alt_text")),
  }));
  const products: ImportProduct[] = productRows.map((row) => {
    const key = normalizeText(valueOf(row, "product_key"));
    const name = normalizeText(valueOf(row, "name"));
    const rawGender = normalizeText(valueOf(row, "gender")).toUpperCase();
    return {
      sheet: row.sheet,
      row: row.row,
      key,
      name,
      slug: slugifyImportValue(normalizeText(valueOf(row, "slug")) || name),
      categoryKey: normalizeCategoryReference(valueOf(row, "category_key")),
      categorySlug: slugifyImportValue(
        normalizeText(valueOf(row, "category_slug")),
      ),
      brand: normalizeText(valueOf(row, "brand")),
      gender:
        (["WOMEN", "MEN", "UNISEX", "KIDS"] as const).find(
          (item) => item === rawGender,
        ) || null,
      status: parseStatus(valueOf(row, "status")),
      shortDescription: normalizeText(valueOf(row, "short_description")),
      description: normalizeText(valueOf(row, "description")),
      hasVariants: parseBoolean(valueOf(row, "has_variants")),
      defaultSku: normalizeText(valueOf(row, "default_sku")),
      defaultPrice: parseInteger(valueOf(row, "default_price")),
      defaultCost: parseInteger(valueOf(row, "default_cost")),
      defaultStock: parseInteger(valueOf(row, "default_stock")),
      variants: variants.filter(
        (variant) => normalizedKey(variant.productKey) === normalizedKey(key),
      ),
      images: images.filter(
        (image) => normalizedKey(image.productKey) === normalizedKey(key),
      ),
    };
  });

  const productKeyCount = new Map<string, number>();
  const productSlugCount = new Map<string, number>();
  const fileSkus = new Map<string, number>();
  const existingSkus = new Set(database.variantSkus.map(normalizedKey));
  const existingSlugs = new Set(database.productSlugs.map(normalizedKey));
  const existingCategories = new Set(database.categorySlugs.map(normalizedKey));
  variants.forEach((variant) => {
    const key = normalizedKey(variant.sku);
    if (key) fileSkus.set(key, (fileSkus.get(key) || 0) + 1);
  });

  products.forEach((product) => {
    const key = normalizedKey(product.key);
    productKeyCount.set(key, (productKeyCount.get(key) || 0) + 1);
    productSlugCount.set(
      normalizedKey(product.slug),
      (productSlugCount.get(normalizedKey(product.slug)) || 0) + 1,
    );
    const productError = (
      column: string,
      value: ImportCellValue,
      code: string,
      message: string,
    ) =>
      addError(errors, {
        sheet: product.sheet || PRODUCT_IMPORT_SHEETS.products,
        row: product.row,
        column,
        field: column,
        value,
        code,
        message,
        productKey: product.key,
      });
    if (!product.key)
      productError(
        "product_key",
        product.key,
        "PRODUCT_KEY_REQUIRED",
        "product_key là bắt buộc.",
      );
    if (!product.name)
      productError(
        "name",
        product.name,
        "PRODUCT_NAME_REQUIRED",
        "Tên sản phẩm là bắt buộc.",
      );
    if (!product.categoryKey && !product.categorySlug)
      productError(
        "category_key",
        null,
        "CATEGORY_REQUIRED",
        "Cần category_key hoặc category_slug.",
      );
    if (!product.gender)
      productError(
        "gender",
        null,
        "INVALID_GENDER",
        "Gender chỉ nhận WOMEN, MEN, UNISEX hoặc KIDS.",
      );
    if (!product.status)
      productError(
        "status",
        null,
        "INVALID_STATUS",
        "Status chỉ nhận PUBLIC, PRIVATE, DISCONTINUED hoặc nhãn tiếng Việt tương ứng.",
      );
    if (product.hasVariants === null)
      productError(
        "has_variants",
        null,
        "INVALID_BOOLEAN",
        "has_variants phải là TRUE/FALSE, 1/0 hoặc Có/Không.",
      );
    if (!product.slug)
      productError(
        "slug",
        product.slug,
        "INVALID_SLUG",
        "Không thể tạo slug hợp lệ.",
      );
    if (existingSlugs.has(normalizedKey(product.slug)))
      productError(
        "slug",
        product.slug,
        "DUPLICATE_DATABASE_SLUG",
        "Slug đã được sử dụng.",
      );
    if (product.categoryKey) {
      const category = categoryMap.get(normalizedKey(product.categoryKey));
      if (!category)
        productError(
          "category_key",
          product.categoryKey,
          "CATEGORY_NOT_FOUND",
          "category_key không tồn tại trong sheet Danh mục.",
        );
      else if (invalidCategoryKeys.has(normalizedKey(category.key)))
        productError(
          "category_key",
          product.categoryKey,
          "INVALID_CATEGORY",
          "Danh mục tham chiếu đang có lỗi.",
        );
      else if (
        !options.createMissingCategories &&
        !existingCategories.has(normalizedKey(category.slug))
      )
        productError(
          "category_key",
          product.categoryKey,
          "CATEGORY_CREATION_NOT_CONFIRMED",
          "Danh mục chưa tồn tại. Hãy bật xác nhận tạo danh mục mới.",
        );
      else if (
        options.createMissingCategories &&
        !existingCategories.has(normalizedKey(category.slug))
      )
        addError(errors, {
          sheet: product.sheet || PRODUCT_IMPORT_SHEETS.products,
          row: product.row,
          column: "category_key",
          field: "category_key",
          value: product.categoryKey,
          code: "CATEGORY_WILL_BE_CREATED",
          message: `Danh mục “${category.name}” sẽ được tạo khi nhập.`,
          severity: "WARNING",
          productKey: product.key,
        });
    } else if (!existingCategories.has(normalizedKey(product.categorySlug))) {
      productError(
        "category_slug",
        product.categorySlug,
        "CATEGORY_NOT_FOUND",
        "Không tìm thấy category_slug trong hệ thống.",
      );
    }
    if (product.hasVariants === false) {
      if (!product.defaultSku)
        productError(
          "default_sku",
          product.defaultSku,
          "DEFAULT_SKU_REQUIRED",
          "Sản phẩm không biến thể phải có default_sku.",
        );
      if (product.defaultPrice === null || product.defaultPrice <= 0)
        productError(
          "default_price",
          product.defaultPrice,
          "INVALID_PRICE",
          "Giá bán phải là số nguyên dương.",
        );
      if (product.defaultCost === null || product.defaultCost < 0)
        productError(
          "default_cost",
          product.defaultCost,
          "INVALID_COST",
          "Giá vốn phải là số nguyên không âm.",
        );
      if (product.defaultStock === null || product.defaultStock < 0)
        productError(
          "default_stock",
          product.defaultStock,
          "INVALID_STOCK",
          "Tồn kho phải là số nguyên không âm.",
        );
    }
    if (product.hasVariants === true && product.variants.length === 0)
      productError(
        "has_variants",
        true,
        "VARIANT_REQUIRED",
        "Sản phẩm có biến thể phải có ít nhất một dòng ở sheet Biến thể.",
      );
    const generalImages = product.images.filter((image) => !image.variantSku);
    if (generalImages.filter((image) => image.isPrimary).length > 1)
      productError(
        "product_key",
        product.key,
        "MULTIPLE_PRIMARY_IMAGES",
        "Chỉ được có một ảnh chính cho sản phẩm.",
      );
    if (product.images.length > PRODUCT_IMPORT_LIMITS.maxImagesPerProduct)
      productError(
        "product_key",
        product.key,
        "IMAGE_LIMIT_EXCEEDED",
        `Mỗi sản phẩm tối đa ${PRODUCT_IMPORT_LIMITS.maxImagesPerProduct} ảnh.`,
      );
    if (options.forcePrivate && product.status && product.status !== "PRIVATE")
      addError(errors, {
        sheet: product.sheet || PRODUCT_IMPORT_SHEETS.products,
        row: product.row,
        column: "status",
        field: "status",
        value: product.status,
        code: "STATUS_FORCED_PRIVATE",
        message: "Trạng thái sẽ được đổi thành PRIVATE theo lựa chọn an toàn.",
        severity: "WARNING",
        productKey: product.key,
      });
    const totalStock = product.hasVariants
      ? product.variants
          .filter((variant) => variant.isActive)
          .reduce((sum, variant) => sum + Math.max(0, variant.stock || 0), 0)
      : Math.max(0, product.defaultStock || 0);
    if (product.status === "PUBLIC" && totalStock <= 0)
      addError(errors, {
        sheet: product.sheet || PRODUCT_IMPORT_SHEETS.products,
        row: product.row,
        column: "status",
        field: "status",
        value: product.status,
        code: "PUBLIC_OUT_OF_STOCK",
        message: "Sản phẩm công khai đang hết hàng; trạng thái vẫn giữ PUBLIC.",
        severity: "WARNING",
        productKey: product.key,
      });
  });

  products.forEach((product) => {
    if ((productKeyCount.get(normalizedKey(product.key)) || 0) > 1)
      addError(errors, {
        sheet: product.sheet || PRODUCT_IMPORT_SHEETS.products,
        row: product.row,
        column: "product_key",
        field: "product_key",
        value: product.key,
        code: "DUPLICATE_PRODUCT_KEY",
        message: "product_key bị trùng trong file.",
        severity: "ERROR",
        productKey: product.key,
      });
    if ((productSlugCount.get(normalizedKey(product.slug)) || 0) > 1)
      addError(errors, {
        sheet: product.sheet || PRODUCT_IMPORT_SHEETS.products,
        row: product.row,
        column: "slug",
        field: "slug",
        value: product.slug,
        code: "DUPLICATE_PRODUCT_SLUG",
        message: "Slug sản phẩm bị trùng trong file.",
        severity: "ERROR",
        productKey: product.key,
      });
    if (product.hasVariants === false) {
      const key = normalizedKey(product.defaultSku);
      if (key) fileSkus.set(key, (fileSkus.get(key) || 0) + 1);
    }
  });

  variants.forEach((variant) => {
    const product = products.find(
      (item) => normalizedKey(item.key) === normalizedKey(variant.productKey),
    );
    const variantError = (
      column: string,
      value: ImportCellValue,
      code: string,
      message: string,
    ) =>
      addError(errors, {
        sheet: variant.sheet || PRODUCT_IMPORT_SHEETS.variants,
        row: variant.row,
        column,
        field: column,
        value,
        code,
        message,
        productKey: variant.productKey,
      });
    if (!product)
      variantError(
        "product_key",
        variant.productKey,
        "PRODUCT_NOT_FOUND",
        "product_key không tồn tại trong sheet Sản phẩm.",
      );
    if (!variant.sku)
      variantError(
        "sku",
        variant.sku,
        "SKU_REQUIRED",
        "SKU biến thể là bắt buộc.",
      );
    if (!variant.color && !variant.size)
      variantError(
        "color",
        variant.color,
        "VARIANT_OPTION_REQUIRED",
        "Biến thể phải có màu hoặc kích thước.",
      );
    if (variant.price === null || variant.price <= 0)
      variantError(
        "price",
        variant.price,
        "INVALID_PRICE",
        "Giá bán phải là số nguyên dương.",
      );
    if (variant.cost === null || variant.cost < 0)
      variantError(
        "cost",
        variant.cost,
        "INVALID_COST",
        "Giá vốn phải là số nguyên không âm.",
      );
    if (variant.stock === null || variant.stock < 0)
      variantError(
        "stock",
        variant.stock,
        "INVALID_STOCK",
        "Tồn kho phải là số nguyên không âm.",
      );
    if (variant.isActive === null)
      variantError(
        "is_active",
        null,
        "INVALID_BOOLEAN",
        "is_active phải là TRUE/FALSE, 1/0 hoặc Có/Không.",
      );
    if (existingSkus.has(normalizedKey(variant.sku)))
      variantError(
        "sku",
        variant.sku,
        "DUPLICATE_DATABASE_SKU",
        "SKU đã được sử dụng.",
      );
    if ((fileSkus.get(normalizedKey(variant.sku)) || 0) > 1)
      variantError(
        "sku",
        variant.sku,
        "DUPLICATE_SKU",
        "SKU bị trùng trong file.",
      );
    if (product) {
      const combination = `${normalizedKey(variant.color)}|${normalizedKey(variant.size)}`;
      const duplicateCombination =
        product.variants.filter(
          (item) =>
            `${normalizedKey(item.color)}|${normalizedKey(item.size)}` ===
            combination,
        ).length > 1;
      if (duplicateCombination)
        variantError(
          "color",
          `${variant.color}|${variant.size}`,
          "DUPLICATE_VARIANT_COMBINATION",
          "Tổ hợp màu và kích thước bị trùng trong sản phẩm.",
        );
    }
  });

  products
    .filter((product) => product.hasVariants === false)
    .forEach((product) => {
      if (existingSkus.has(normalizedKey(product.defaultSku)))
        addError(errors, {
          sheet: product.sheet || PRODUCT_IMPORT_SHEETS.products,
          row: product.row,
          column: "default_sku",
          field: "default_sku",
          value: product.defaultSku,
          code: "DUPLICATE_DATABASE_SKU",
          message: "SKU đã được sử dụng.",
          severity: "ERROR",
          productKey: product.key,
        });
      if ((fileSkus.get(normalizedKey(product.defaultSku)) || 0) > 1)
        addError(errors, {
          sheet: product.sheet || PRODUCT_IMPORT_SHEETS.products,
          row: product.row,
          column: "default_sku",
          field: "default_sku",
          value: product.defaultSku,
          code: "DUPLICATE_SKU",
          message: "SKU bị trùng trong file.",
          severity: "ERROR",
          productKey: product.key,
        });
    });

  images.forEach((image) => {
    const product = products.find(
      (item) => normalizedKey(item.key) === normalizedKey(image.productKey),
    );
    const imageError = (
      column: string,
      value: ImportCellValue,
      code: string,
      message: string,
    ) =>
      addError(errors, {
        sheet: image.sheet || PRODUCT_IMPORT_SHEETS.images,
        row: image.row,
        column,
        field: column,
        value,
        code,
        message,
        productKey: image.productKey,
      });
    if (!product)
      imageError(
        "product_key",
        image.productKey,
        "PRODUCT_NOT_FOUND",
        "product_key không tồn tại trong sheet Sản phẩm.",
      );
    if (!image.imageUrl || !isSafeImageUrl(image.imageUrl))
      imageError(
        "image_url",
        image.imageUrl,
        "INVALID_IMAGE_URL",
        "Ảnh phải là URL HTTP/HTTPS công khai hợp lệ.",
      );
    if (image.sortOrder === null || image.sortOrder < 0)
      imageError(
        "sort_order",
        image.sortOrder,
        "INVALID_SORT_ORDER",
        "sort_order phải là số nguyên không âm.",
      );
    if (image.isPrimary === null)
      imageError(
        "is_primary",
        null,
        "INVALID_BOOLEAN",
        "is_primary phải là TRUE/FALSE, 1/0 hoặc Có/Không.",
      );
    if (
      product &&
      image.variantSku &&
      !product.variants.some(
        (variant) =>
          normalizedKey(variant.sku) === normalizedKey(image.variantSku),
      ) &&
      normalizedKey(product.defaultSku) !== normalizedKey(image.variantSku)
    )
      imageError(
        "variant_sku",
        image.variantSku,
        "VARIANT_NOT_FOUND",
        "variant_sku không thuộc sản phẩm này.",
      );
    if (
      product &&
      image.variantSku &&
      product.images.filter(
        (item) =>
          normalizedKey(item.variantSku) === normalizedKey(image.variantSku) &&
          item.isPrimary,
      ).length > 1
    )
      imageError(
        "is_primary",
        image.isPrimary,
        "MULTIPLE_PRIMARY_IMAGES",
        "Chỉ được có một ảnh chính cho mỗi biến thể.",
      );
    if (
      product &&
      product.images.filter(
        (item) =>
          normalizedKey(item.variantSku) === normalizedKey(image.variantSku) &&
          item.imageUrl === image.imageUrl,
      ).length > 1
    )
      imageError(
        "image_url",
        image.imageUrl,
        "DUPLICATE_IMAGE",
        "Ảnh bị gán lặp trong cùng phạm vi.",
      );
  });

  const globalBlocker = errors.some(isFileBlockingImportError);
  const invalidKeys = new Set(
    errors
      .filter((error) => error.severity === "ERROR" && error.productKey)
      .map((error) => normalizedKey(error.productKey || "")),
  );
  const valid = globalBlocker
    ? 0
    : products.filter((product) => !invalidKeys.has(normalizedKey(product.key)))
        .length;
  const categoriesToCreate = new Set(
    products.flatMap((product) => {
      const category = categoryMap.get(normalizedKey(product.categoryKey));
      return category && !existingCategories.has(normalizedKey(category.slug))
        ? [normalizedKey(category.slug)]
        : [];
    }),
  ).size;
  const originalRows: Record<string, ImportRawRow[]> = {
    [PRODUCT_IMPORT_SHEETS.categories]: categoryRows.map(({ row, values }) => ({
      row,
      values,
    })),
  };
  if (usesLegacyLayout) {
    originalRows[PRODUCT_IMPORT_SHEETS.products] = productRows.map(
      ({ row, values }) => ({ row, values }),
    );
    originalRows[PRODUCT_IMPORT_SHEETS.variants] = variantRows.map(
      ({ row, values }) => ({ row, values }),
    );
    originalRows[PRODUCT_IMPORT_SHEETS.images] = imageRows.map(
      ({ row, values }) => ({ row, values }),
    );
  } else {
    const productSheetNames = new Set(
      productRows.map((row) => row.sheet).filter(Boolean) as string[],
    );
    productSheetNames.forEach((sheet) => {
      originalRows[sheet] = [
        ...productRows.filter((row) => row.sheet === sheet),
        ...variantRows.filter((row) => row.sheet === sheet),
        ...imageRows.filter((row) => row.sheet === sheet),
      ].map(({ row, values }) => ({ row, values }));
    });
  }
  const source: ProductImportSource = {
    version: 1,
    layout: usesLegacyLayout ? "legacy" : "per-product",
    categories,
    products,
    originalRows,
  };

  return {
    source,
    errors,
    totals: {
      products: products.length,
      valid,
      invalid: products.length - valid,
      warnings: new Set(
        errors
          .filter((error) => error.severity === "WARNING")
          .map((error) => error.productKey || `${error.sheet}:${error.row}`),
      ).size,
      variants: variants.length,
      images: images.length,
      categoriesToCreate,
    },
  };
}

import test from "node:test";
import assert from "node:assert/strict";
import ExcelJS from "exceljs";
import { parseAndValidateProductWorkbook } from "./parser.ts";
import {
  createProductImportErrorWorkbook,
  createPerProductImportTemplate,
  createProductImportTemplate,
} from "./workbook.ts";
import {
  PRODUCT_IMPORT_HEADERS,
  PRODUCT_IMPORT_LIMITS,
  PRODUCT_IMPORT_SHEETS,
} from "./types.ts";

const context = {
  categorySlugs: ["ao"],
  productSlugs: [] as string[],
  variantSkus: [] as string[],
};

const getSheet = (workbook: ExcelJS.Workbook, name: string) => {
  const worksheet = workbook.getWorksheet(name);
  assert.ok(worksheet, `Expected worksheet ${name}`);
  return worksheet;
};

const makeWorkbook = async (mutate?: (workbook: ExcelJS.Workbook) => void) => {
  const workbook = new ExcelJS.Workbook();
  workbook.addWorksheet(PRODUCT_IMPORT_SHEETS.instructions);
  const categories = workbook.addWorksheet(PRODUCT_IMPORT_SHEETS.categories);
  categories.addRow([...PRODUCT_IMPORT_HEADERS.categories]);
  const products = workbook.addWorksheet(PRODUCT_IMPORT_SHEETS.products);
  products.addRow([...PRODUCT_IMPORT_HEADERS.products]);
  products.addRow([
    "P-001",
    "Áo mẫu",
    "ao-mau",
    "",
    "ao",
    "",
    "UNISEX",
    "PRIVATE",
    "",
    "Mô tả",
    false,
    "00123",
    100000,
    50000,
    10,
  ]);
  const variants = workbook.addWorksheet(PRODUCT_IMPORT_SHEETS.variants);
  variants.addRow([...PRODUCT_IMPORT_HEADERS.variants]);
  const images = workbook.addWorksheet(PRODUCT_IMPORT_SHEETS.images);
  images.addRow([...PRODUCT_IMPORT_HEADERS.images]);
  images.addRow([
    "P-001",
    "",
    "https://cdn.example.com/ao.jpg",
    0,
    true,
    "Áo mẫu",
  ]);
  mutate?.(workbook);
  return Buffer.from(await workbook.xlsx.writeBuffer());
};

const parse = async (
  mutate?: (workbook: ExcelJS.Workbook) => void,
  overrides?: Partial<typeof context>,
) =>
  parseAndValidateProductWorkbook(
    await makeWorkbook(mutate),
    { ...context, ...overrides },
    { createMissingCategories: true, forcePrivate: false },
  );

test("template contains all five stable sheets and expected headers", async () => {
  const buffer = await createProductImportTemplate();
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
  await workbook.xlsx.load(arrayBuffer);
  assert.deepEqual(
    workbook.worksheets.map((sheet) => sheet.name),
    [
      PRODUCT_IMPORT_SHEETS.instructions,
      PRODUCT_IMPORT_SHEETS.categories,
      PRODUCT_IMPORT_SHEETS.products,
      PRODUCT_IMPORT_SHEETS.variants,
      PRODUCT_IMPORT_SHEETS.images,
    ],
  );
  assert.deepEqual(
    PRODUCT_IMPORT_HEADERS.products.map(
      (_, index) =>
        getSheet(workbook, PRODUCT_IMPORT_SHEETS.products)
          .getRow(1)
          .getCell(index + 1).text,
    ),
    [...PRODUCT_IMPORT_HEADERS.products],
  );
});

test("valid workbook preserves an SKU with a leading zero", async () => {
  const result = await parse();
  assert.equal(result.totals.valid, 1);
  assert.equal(result.source.products[0].defaultSku, "00123");
});

test("per-product template imports product, variants and images from one sheet", async () => {
  const result = await parseAndValidateProductWorkbook(
    await createPerProductImportTemplate(),
    { categorySlugs: ["ao-thun"], productSlugs: [], variantSkus: [] },
    { createMissingCategories: false, forcePrivate: false },
  );
  assert.equal(result.totals.products, 1);
  assert.equal(result.totals.valid, 1);
  assert.equal(result.totals.variants, 2);
  assert.equal(result.totals.images, 2);
  assert.equal(result.source.products[0].sheet, "SP-001");
  assert.equal(result.errors.length, 0);
});

test("product import allows an empty image sheet", async () => {
  const result = await parse((workbook) => {
    getSheet(workbook, PRODUCT_IMPORT_SHEETS.images).spliceRows(2, 1);
  });
  assert.equal(result.totals.valid, 1);
  assert.equal(result.source.products[0].images.length, 0);
});

test("missing sheet and missing header are file-level errors", async () => {
  const missingSheet = await parse((workbook) => {
    workbook.removeWorksheet(
      getSheet(workbook, PRODUCT_IMPORT_SHEETS.images).id,
    );
  });
  assert.ok(
    missingSheet.errors.some((error) => error.code === "MISSING_SHEET"),
  );
  assert.equal(missingSheet.totals.valid, 0);

  const missingHeader = await parse((workbook) => {
    getSheet(workbook, PRODUCT_IMPORT_SHEETS.products)
      .getRow(1)
      .getCell(15).value = "";
  });
  assert.ok(
    missingHeader.errors.some((error) => error.code === "MISSING_HEADER"),
  );
});

test("duplicate product key, slug and SKU are rejected", async () => {
  const result = await parse((workbook) => {
    const sheet = getSheet(workbook, PRODUCT_IMPORT_SHEETS.products);
    sheet.addRow(
      PRODUCT_IMPORT_HEADERS.products.map(
        (_, index) => sheet.getRow(2).getCell(index + 1).value,
      ),
    );
  });
  assert.ok(
    result.errors.some((error) => error.code === "DUPLICATE_PRODUCT_KEY"),
  );
  assert.ok(
    result.errors.some((error) => error.code === "DUPLICATE_PRODUCT_SLUG"),
  );
  assert.ok(result.errors.some((error) => error.code === "DUPLICATE_SKU"));
});

test("database SKU collision is rejected", async () => {
  const result = await parse(undefined, { variantSkus: ["00123"] });
  assert.ok(
    result.errors.some((error) => error.code === "DUPLICATE_DATABASE_SKU"),
  );
});

test("Vietnamese status is normalized", async () => {
  const result = await parse((workbook) => {
    getSheet(workbook, PRODUCT_IMPORT_SHEETS.products)
      .getRow(2)
      .getCell(8).value = "Công khai";
  });
  assert.equal(result.source.products[0].status, "PUBLIC");
});

test("invalid status, price and negative stock identify their columns", async () => {
  const result = await parse((workbook) => {
    const row = getSheet(workbook, PRODUCT_IMPORT_SHEETS.products).getRow(2);
    row.getCell(8).value = "Đang bán";
    row.getCell(13).value = 0;
    row.getCell(15).value = -1;
  });
  assert.ok(result.errors.some((error) => error.code === "INVALID_STATUS"));
  assert.ok(result.errors.some((error) => error.code === "INVALID_PRICE"));
  assert.ok(result.errors.some((error) => error.code === "INVALID_STOCK"));
});

test("invalid category and category cycles block the referenced product", async () => {
  const missing = await parse((workbook) => {
    const row = getSheet(workbook, PRODUCT_IMPORT_SHEETS.products).getRow(2);
    row.getCell(4).value = "missing";
    row.getCell(5).value = "";
  });
  assert.ok(
    missing.errors.some((error) => error.code === "CATEGORY_NOT_FOUND"),
  );

  const cycle = await parse((workbook) => {
    const categories = getSheet(workbook, PRODUCT_IMPORT_SHEETS.categories);
    categories.addRow(["c1", "Cấp 1", "cap-1", "c2"]);
    categories.addRow(["c2", "Cấp 2", "cap-2", "c1"]);
    const product = getSheet(workbook, PRODUCT_IMPORT_SHEETS.products).getRow(
      2,
    );
    product.getCell(4).value = "c1";
    product.getCell(5).value = "";
  });
  assert.ok(cycle.errors.some((error) => error.code === "CATEGORY_CYCLE"));
  assert.ok(cycle.errors.some((error) => error.code === "INVALID_CATEGORY"));
});

test("invalid variant relation and duplicate SKU are reported", async () => {
  const result = await parse((workbook) => {
    const variants = getSheet(workbook, PRODUCT_IMPORT_SHEETS.variants);
    variants.addRow(["UNKNOWN", "Đen", "M", "SKU-1", 100000, 50000, 2, true]);
    variants.addRow(["UNKNOWN", "Trắng", "L", "SKU-1", 100000, 50000, 2, true]);
  });
  assert.ok(result.errors.some((error) => error.code === "PRODUCT_NOT_FOUND"));
  assert.ok(result.errors.some((error) => error.code === "DUPLICATE_SKU"));
});

test("invalid image URL and multiple primary images are rejected", async () => {
  const result = await parse((workbook) => {
    const images = getSheet(workbook, PRODUCT_IMPORT_SHEETS.images);
    images.getRow(2).getCell(3).value = "http://127.0.0.1/private.jpg";
    images.addRow([
      "P-001",
      "",
      "https://cdn.example.com/other.jpg",
      1,
      true,
      "",
    ]);
  });
  assert.ok(result.errors.some((error) => error.code === "INVALID_IMAGE_URL"));
  assert.ok(
    result.errors.some((error) => error.code === "MULTIPLE_PRIMARY_IMAGES"),
  );
});

test("maximum row limit is enforced", async () => {
  const result = await parse((workbook) => {
    const variants = getSheet(workbook, PRODUCT_IMPORT_SHEETS.variants);
    for (let index = 0; index < PRODUCT_IMPORT_LIMITS.maxRows; index += 1) {
      variants.addRow(["UNKNOWN", "Đen", "M", `SKU-${index}`, 1, 0, 0, false]);
    }
  });
  assert.ok(result.errors.some((error) => error.code === "ROW_LIMIT_EXCEEDED"));
  assert.equal(result.totals.valid, 0);
});

test("malformed workbook is rejected", async () => {
  await assert.rejects(
    () =>
      parseAndValidateProductWorkbook(Buffer.from("not an xlsx"), context, {
        createMissingCategories: false,
        forcePrivate: false,
      }),
    /không đúng định dạng/,
  );
});

test("error workbook protects formula injection", async () => {
  const result = await parse((workbook) => {
    const row = getSheet(workbook, PRODUCT_IMPORT_SHEETS.products).getRow(2);
    row.getCell(2).value = '=HYPERLINK("https://bad.example")';
    row.getCell(8).value = "INVALID";
  });
  const buffer = await createProductImportErrorWorkbook(
    result.source,
    result.errors,
  );
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
  await workbook.xlsx.load(arrayBuffer);
  const value = getSheet(workbook, PRODUCT_IMPORT_SHEETS.products)
    .getRow(2)
    .getCell(2).value;
  assert.equal(String(value).startsWith("'="), true);
});

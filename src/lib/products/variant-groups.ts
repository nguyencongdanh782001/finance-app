import type {
  ProductColorGroupFormValue,
  ProductImageDraftValue,
  ProductSizeVariantFormValue,
  ProductVariantFormValue,
} from "@/interface/product";

export const SIZE_PRESETS = {
  "Thời trang": ["XS", "S", "M", "L", "XL", "XXL"],
  Quần: ["26", "27", "28", "29", "30", "31", "32"],
  Giày: ["35", "36", "37", "38", "39", "40", "41", "42"],
  "Mỹ phẩm": ["5ml", "10ml", "15ml", "30ml", "50ml", "100ml"],
} as const;

const CLOTHING_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export const createVariantClientId = (prefix = "variant") =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const normalizeVariantLabel = (value: string) =>
  value.trim().replace(/\s+/g, " ");

export const normalizedVariantKey = (value: string) =>
  normalizeVariantLabel(value).toLocaleLowerCase("vi");

const imageSignature = (images: ProductImageDraftValue[]) =>
  images
    .map((image) => `${image.publicId || ""}|${image.url}`)
    .sort()
    .join("::");

const cloneImages = (images: ProductImageDraftValue[]) =>
  images.map((image, position) => ({
    ...image,
    clientId: createVariantClientId("image"),
    position,
    isPrimary: position === 0,
  }));

export const compareNaturalSizes = (left: string, right: string) => {
  const a = normalizeVariantLabel(left);
  const b = normalizeVariantLabel(right);
  const clothingA = CLOTHING_ORDER.indexOf(a.toUpperCase());
  const clothingB = CLOTHING_ORDER.indexOf(b.toUpperCase());
  if (clothingA >= 0 && clothingB >= 0) return clothingA - clothingB;

  const numericA = a.match(/^(\d+(?:\.\d+)?)(ml)?$/i);
  const numericB = b.match(/^(\d+(?:\.\d+)?)(ml)?$/i);
  if (numericA && numericB) {
    const unitA = numericA[2]?.toLowerCase() || "number";
    const unitB = numericB[2]?.toLowerCase() || "number";
    if (unitA === unitB) return Number(numericA[1]) - Number(numericB[1]);
  }
  return 0;
};

const sortSizesNaturally = (sizes: ProductSizeVariantFormValue[]) =>
  sizes
    .map((size, index) => ({ size, index }))
    .sort((left, right) => {
      const compared = compareNaturalSizes(left.size.sizeName, right.size.sizeName);
      return compared || left.index - right.index;
    })
    .map(({ size }) => size);

export function groupVariantsByColor(
  variants: ProductVariantFormValue[],
): ProductColorGroupFormValue[] {
  const groups = new Map<string, ProductColorGroupFormValue>();

  variants.forEach((variant) => {
    const rawColor = normalizeVariantLabel(variant.color || "");
    const displayColor = rawColor || "Mặc định";
    const key = variant.colorCode?.trim()
      ? `code:${variant.colorCode.trim().toLowerCase()}`
      : rawColor
        ? `name:${normalizedVariantKey(rawColor)}`
        : "__default_color__";
    let group = groups.get(key);
    if (!group) {
      group = {
        clientId: variant.id
          ? `color-existing-${variant.id}`
          : createVariantClientId("color"),
        colorName: displayColor,
        sourceColorName: rawColor,
        colorCode: variant.colorCode || "",
        defaultPrice: variant.price,
        defaultCost: variant.importPrice,
        sharedImages: [],
        sizes: [],
      };
      groups.set(key, group);
    }
    group.sizes.push({
      id: variant.id,
      clientId: variant.clientId,
      sizeName: normalizeVariantLabel(variant.size),
      sku: variant.sku,
      priceOverride: variant.price,
      costOverride: variant.importPrice,
      inheritsPrice: variant.price === group.defaultPrice,
      inheritsCost: variant.importPrice === group.defaultCost,
      stock: variant.quantity,
      isActive: variant.isActive,
      images: cloneImages(variant.images || []),
    });
  });

  return [...groups.values()].map((group) => {
    const signatures = new Map<string, number>();
    group.sizes.forEach((size) => {
      const signature = imageSignature(size.images);
      if (signature) signatures.set(signature, (signatures.get(signature) || 0) + 1);
    });
    const sharedSignature = [...signatures.entries()]
      .filter(([, count]) => count > 1)
      .sort((left, right) => right[1] - left[1])[0]?.[0];
    if (sharedSignature) {
      const representative = group.sizes.find(
        (size) => imageSignature(size.images) === sharedSignature,
      );
      group.sharedImages = cloneImages(representative?.images || []);
      group.sizes = group.sizes.map((size) =>
        imageSignature(size.images) === sharedSignature
          ? { ...size, images: [] }
          : size,
      );
    }
    group.sizes = sortSizesNaturally(group.sizes);
    return group;
  });
}

export const resolveSizePrice = (
  group: ProductColorGroupFormValue,
  size: ProductSizeVariantFormValue,
  productPrice: string,
) =>
  size.inheritsPrice
    ? group.defaultPrice || productPrice
    : size.priceOverride;

export const resolveSizeCost = (
  group: ProductColorGroupFormValue,
  size: ProductSizeVariantFormValue,
  productCost: string,
) =>
  size.inheritsCost ? group.defaultCost || productCost : size.costOverride;

export const resolveSizeImages = (
  generalImages: ProductImageDraftValue[],
  group: ProductColorGroupFormValue,
  size: ProductSizeVariantFormValue,
) =>
  size.images.length
    ? size.images
    : group.sharedImages.length
      ? group.sharedImages
      : generalImages;

export function flattenColorGroups(
  groups: ProductColorGroupFormValue[],
  options: {
    productPrice: string;
    productCost: string;
    generalImages?: ProductImageDraftValue[];
    includeGeneralImageFallback?: boolean;
  },
): ProductVariantFormValue[] {
  return groups.flatMap((group) =>
    group.sizes.map((size) => ({
      id: size.id,
      clientId: size.clientId,
      color:
        group.sourceColorName === "" && group.colorName === "Mặc định"
          ? ""
          : normalizeVariantLabel(group.colorName),
      colorCode: group.colorCode.trim() || undefined,
      size: normalizeVariantLabel(size.sizeName),
      sku: size.sku.trim(),
      price: resolveSizePrice(group, size, options.productPrice),
      importPrice: resolveSizeCost(group, size, options.productCost),
      quantity: size.stock,
      isActive: size.isActive,
      images: cloneImages(
        size.images.length
          ? size.images
          : group.sharedImages.length
            ? group.sharedImages
            : options.includeGeneralImageFallback
              ? options.generalImages || []
              : [],
      ),
    })),
  );
}

export const createEmptyColorGroup = (
  productPrice = "",
  productCost = "",
): ProductColorGroupFormValue => ({
  clientId: createVariantClientId("color"),
  colorName: "",
  colorCode: "",
  defaultPrice: productPrice,
  defaultCost: productCost,
  sharedImages: [],
  sizes: [],
});

export function addSizesToColorGroup(
  group: ProductColorGroupFormValue,
  requestedSizes: string[],
): { group: ProductColorGroupFormValue; added: number } {
  const existing = new Set(group.sizes.map((size) => normalizedVariantKey(size.sizeName)));
  const uniqueRequested = [...new Map(
    requestedSizes
      .map(normalizeVariantLabel)
      .filter(Boolean)
      .map((size) => [normalizedVariantKey(size), size]),
  ).values()];
  const missing = uniqueRequested.filter((size) => !existing.has(normalizedVariantKey(size)));
  const nextSizes = missing.map<ProductSizeVariantFormValue>((sizeName) => ({
    clientId: createVariantClientId("size"),
    sizeName,
    sku: "",
    priceOverride: "",
    costOverride: "",
    inheritsPrice: true,
    inheritsCost: true,
    stock: "0",
    isActive: true,
    images: [],
  }));
  return {
    group: { ...group, sizes: sortSizesNaturally([...group.sizes, ...nextSizes]) },
    added: nextSizes.length,
  };
}

export function applySizesToColorGroups(
  groups: ProductColorGroupFormValue[],
  groupIds: string[],
  sizes: string[],
) {
  const selected = new Set(groupIds);
  let added = 0;
  const nextGroups = groups.map((group) => {
    if (!selected.has(group.clientId)) return group;
    const result = addSizesToColorGroup(group, sizes);
    added += result.added;
    return result.group;
  });
  return { groups: nextGroups, added };
}

export const skuSegment = (value: string) =>
  normalizeVariantLabel(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toUpperCase();

export const generateVariantSku = (
  base: string,
  color: string,
  size: string,
) => [base, skuSegment(color), skuSegment(size)].filter(Boolean).join("-");

export function summarizeVariantsByColor(
  variants: Array<{ color: string; size: string }>,
) {
  const groups = new Map<string, { color: string; sizes: string[] }>();
  variants.forEach((variant) => {
    const color = normalizeVariantLabel(variant.color) || "Mặc định";
    const key = normalizedVariantKey(color);
    const group = groups.get(key) || { color, sizes: [] };
    if (
      variant.size.trim() &&
      !group.sizes.some(
        (size) => normalizedVariantKey(size) === normalizedVariantKey(variant.size),
      )
    )
      group.sizes.push(normalizeVariantLabel(variant.size));
    groups.set(key, group);
  });
  return [...groups.values()].map((group) => ({
    ...group,
    sizes: group.sizes.sort(compareNaturalSizes),
  }));
}

"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ImagePlus,
  Layers3,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numberInput";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  ProductColorGroupFormValue,
  ProductImageDraftValue,
  ProductSizeVariantFormValue,
} from "@/interface/product";
import {
  addSizesToColorGroup,
  applySizesToColorGroups,
  createEmptyColorGroup,
  generateVariantSku,
  normalizedVariantKey,
  resolveSizeCost,
  resolveSizePrice,
  SIZE_PRESETS,
  skuSegment,
} from "@/lib/products/variant-groups";
import type { ProductValidationError } from "@/lib/products/product-draft-validation";

export type VariantImageTarget = { groupId: string; sizeId?: string };

type PendingConfirmation = {
  title: string;
  description: string;
  confirmLabel: string;
  tone: "danger" | "primary";
  action: () => void;
};

type Props = {
  groups: ProductColorGroupFormValue[];
  productTitle: string;
  productSlug: string;
  productPrice: string;
  productCost: string;
  isUploading: boolean;
  errors: ProductValidationError[];
  onChange: (groups: ProductColorGroupFormValue[]) => void;
  onUpload: (
    files: FileList | null,
    target: VariantImageTarget,
  ) => Promise<void>;
};

const fieldClass =
  "h-10 min-w-0 rounded-xl border-(--admin-border) bg-white px-3 text-sm";
const normalizeImages = (images: ProductImageDraftValue[]) =>
  images.map((image, position) => ({
    ...image,
    position,
    isPrimary: position === 0,
  }));

export default function VariantGroupsEditor({
  groups,
  productTitle,
  productSlug,
  productPrice,
  productCost,
  isUploading,
  errors,
  onChange,
  onUpload,
}: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(groups.map((group) => group.clientId)),
  );
  const [sizeInputs, setSizeInputs] = useState<Record<string, string>>({});
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({});
  const [bulkSizes, setBulkSizes] = useState<string[]>([]);
  const [bulkGroupIds, setBulkGroupIds] = useState<string[]>([]);
  const [confirmation, setConfirmation] = useState<PendingConfirmation | null>(
    null,
  );
  const baseSku = skuSegment(productSlug || productTitle) || "SP";

  const errorFor = (path: string) =>
    errors.find((error) => error.path === path)?.message;
  const setGroup = (groupId: string, next: ProductColorGroupFormValue) =>
    onChange(
      groups.map((group) => (group.clientId === groupId ? next : group)),
    );
  const updateGroup = <K extends keyof ProductColorGroupFormValue>(
    group: ProductColorGroupFormValue,
    key: K,
    value: ProductColorGroupFormValue[K],
  ) => setGroup(group.clientId, { ...group, [key]: value });
  const updateSize = <K extends keyof ProductSizeVariantFormValue>(
    group: ProductColorGroupFormValue,
    sizeId: string,
    key: K,
    value: ProductSizeVariantFormValue[K],
  ) =>
    setGroup(group.clientId, {
      ...group,
      sizes: group.sizes.map((size) =>
        size.clientId === sizeId ? { ...size, [key]: value } : size,
      ),
    });

  const addColor = () => {
    const next = createEmptyColorGroup(productPrice, productCost);
    onChange([...groups, next]);
    setExpanded((current) => new Set(current).add(next.clientId));
  };
  const removeColor = (group: ProductColorGroupFormValue) => {
    const action = () =>
      onChange(groups.filter((item) => item.clientId !== group.clientId));
    if (
      !group.colorName.trim() &&
      !group.colorCode.trim() &&
      !group.sizes.length &&
      !group.sharedImages.length
    )
      return action();
    setConfirmation({
      title: `Xóa màu ${group.colorName || "chưa đặt tên"}?`,
      description: `Nhóm màu này có ${group.sizes.length} kích thước. Biến thể đã phát sinh đơn sẽ được ngừng hoạt động thay vì xóa để giữ nguyên lịch sử.`,
      confirmLabel: "Xóa nhóm màu",
      tone: "danger",
      action,
    });
  };
  const removeSize = (
    group: ProductColorGroupFormValue,
    size: ProductSizeVariantFormValue,
  ) => {
    const action = () =>
      updateGroup(
        group,
        "sizes",
        group.sizes.filter((item) => item.clientId !== size.clientId),
      );
    const hasData =
      size.id ||
      size.sizeName.trim() ||
      size.sku.trim() ||
      size.priceOverride.trim() ||
      size.costOverride.trim() ||
      size.stock !== "0" ||
      size.images.length;
    if (!hasData) return action();
    setConfirmation({
      title: `Xóa size ${size.sizeName || "chưa đặt tên"}?`,
      description: size.id
        ? "Nếu biến thể đã phát sinh đơn, hệ thống sẽ ngừng hoạt động biến thể thay vì xóa để bảo toàn lịch sử."
        : "Biến thể mới cùng các dữ liệu đã nhập và ảnh riêng sẽ bị xóa khỏi bản nháp.",
      confirmLabel: "Xóa size",
      tone: "danger",
      action,
    });
  };
  const addSizeText = (group: ProductColorGroupFormValue, values: string[]) => {
    const result = addSizesToColorGroup(group, values);
    setGroup(group.clientId, result.group);
    setSizeInputs((current) => ({ ...current, [group.clientId]: "" }));
  };
  const generateMissingSkus = (onlyGroup?: ProductColorGroupFormValue) => {
    const targets = onlyGroup ? new Set([onlyGroup.clientId]) : null;
    const used = new Set(
      groups.flatMap((group) =>
        group.sizes
          .map((size) => size.sku.trim().toLocaleUpperCase("vi"))
          .filter(Boolean),
      ),
    );
    onChange(
      groups.map((group) =>
        targets && !targets.has(group.clientId)
          ? group
          : {
              ...group,
              sizes: group.sizes.map((size) =>
                size.sku.trim()
                  ? size
                  : (() => {
                      const base = generateVariantSku(
                        baseSku,
                        group.colorName,
                        size.sizeName,
                      );
                      let sku = base;
                      let suffix = 2;
                      while (used.has(sku.toLocaleUpperCase("vi")))
                        sku = `${base}-${suffix++}`;
                      used.add(sku.toLocaleUpperCase("vi"));
                      return { ...size, sku };
                    })(),
              ),
            },
      ),
    );
  };
  const generateOneSku = (
    group: ProductColorGroupFormValue,
    size: ProductSizeVariantFormValue,
  ) => {
    const used = new Set(
      groups.flatMap((item) =>
        item.sizes
          .filter((candidate) => candidate.clientId !== size.clientId)
          .map((candidate) => candidate.sku.trim().toLocaleUpperCase("vi"))
          .filter(Boolean),
      ),
    );
    const base = generateVariantSku(baseSku, group.colorName, size.sizeName);
    let sku = base;
    let suffix = 2;
    while (used.has(sku.toLocaleUpperCase("vi"))) sku = `${base}-${suffix++}`;
    updateSize(group, size.clientId, "sku", sku);
  };
  const applyBulkSizes = () => {
    if (!bulkSizes.length || !bulkGroupIds.length) return;
    const selectedGroups = groups.filter((group) =>
      bulkGroupIds.includes(group.clientId),
    );
    const selectedNames = selectedGroups.map(
      (group) => group.colorName || "chưa đặt tên",
    );
    const addedCount = selectedGroups.reduce((total, group) => {
      const existing = new Set(
        group.sizes.map((size) => normalizedVariantKey(size.sizeName)),
      );
      return (
        total +
        bulkSizes.filter((size) => !existing.has(normalizedVariantKey(size)))
          .length
      );
    }, 0);
    if (!addedCount) return;
    setConfirmation({
      title: "Áp dụng kích thước cho nhiều màu?",
      description: `${addedCount} biến thể mới sẽ được tạo cho ${selectedNames.join(", ")}. Size đã tồn tại và dữ liệu hiện có sẽ được giữ nguyên.`,
      confirmLabel: `Tạo ${addedCount} biến thể`,
      tone: "primary",
      action: () =>
        onChange(
          applySizesToColorGroups(groups, bulkGroupIds, bulkSizes).groups,
        ),
    });
  };

  const totalVariants = groups.reduce(
    (sum, group) => sum + group.sizes.length,
    0,
  );
  return (
    <div className="space-y-4" data-field-path="colorGroups">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-(--admin-text)">
            Biến thể theo màu và kích thước
          </h2>
          <p className="mt-1 text-sm text-(--admin-text-secondary)">
            {groups.length} màu · {totalVariants} biến thể. Mỗi SKU vẫn là một
            dòng tồn kho độc lập.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {totalVariants ? (
            <Button
              type="button"
              variant="ghost"
              className="border border-(--admin-border)"
              onClick={() => generateMissingSkus()}
            >
              <Sparkles className="size-4" /> Tạo SKU còn thiếu
            </Button>
          ) : null}
          <Button type="button" variant="adminPrimary" onClick={addColor}>
            <Plus className="size-4" /> Thêm màu
          </Button>
        </div>
      </div>

      {errorFor("colorGroups") ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-sm text-red-600"
        >
          {errorFor("colorGroups")}
        </p>
      ) : null}

      {groups.length > 1 ? (
        <BulkSizePanel
          groups={groups}
          sizes={bulkSizes}
          selectedGroupIds={bulkGroupIds}
          onSizesChange={setBulkSizes}
          onGroupsChange={setBulkGroupIds}
          onApply={applyBulkSizes}
        />
      ) : null}

      {groups.map((group) => {
        const activeSizes = group.sizes.filter((size) => size.isActive);
        const stock = activeSizes.reduce(
          (sum, size) => sum + Number(size.stock || 0),
          0,
        );
        const prices = activeSizes
          .map((size) => Number(resolveSizePrice(group, size, productPrice)))
          .filter(Number.isFinite);
        const isOpen = expanded.has(group.clientId);
        return (
          <Collapsible
            key={group.clientId}
            open={isOpen}
            onOpenChange={(open) =>
              setExpanded((current) => {
                const next = new Set(current);
                if (open) next.add(group.clientId);
                else next.delete(group.clientId);
                return next;
              })
            }
            className={`overflow-hidden rounded-2xl border bg-white ${isOpen ? "border-[#D96C8A]" : "border-(--admin-border)"}`}
          >
            <div className="flex min-w-0 items-center gap-3 p-3 sm:p-4">
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span
                    className="size-9 shrink-0 rounded-full border border-(--admin-border) bg-slate-100"
                    style={
                      group.colorCode
                        ? { backgroundColor: group.colorCode }
                        : undefined
                    }
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-(--admin-text)">
                      {group.colorName || "Màu chưa đặt tên"}
                    </span>
                    <span className="block truncate text-xs text-(--admin-text-secondary)">
                      {group.sizes
                        .map((size) => size.sizeName || "?")
                        .join(", ") || "Chưa có size"}
                      {prices.length
                        ? ` · từ ${Math.min(...prices).toLocaleString("vi-VN")}đ`
                        : ""}
                      {` · ${stock} SP`}
                    </span>
                  </span>
                  {group.sharedImages.slice(0, 2).map((image) => (
                    <img
                      key={image.clientId}
                      src={image.url}
                      alt=""
                      className="hidden size-9 shrink-0 rounded-lg border border-(--admin-border) object-cover sm:block"
                    />
                  ))}
                  <ChevronDown
                    className={`size-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </CollapsibleTrigger>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Xóa nhóm màu"
                className="text-red-500"
                onClick={() => removeColor(group)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            <CollapsibleContent>
              <div className="space-y-5 border-t border-(--admin-border) p-3 sm:p-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <EditorField
                    label="Tên màu"
                    path={`colorGroups.${group.clientId}.colorName`}
                    error={errorFor(`colorGroups.${group.clientId}.colorName`)}
                    required
                  >
                    <Input
                      standalone
                      value={group.colorName}
                      className={fieldClass}
                      placeholder="Ví dụ: Đen"
                      onChange={(event) =>
                        updateGroup(group, "colorName", event.target.value)
                      }
                    />
                  </EditorField>
                  <EditorField
                    label="Mã màu"
                    path={`colorGroups.${group.clientId}.colorCode`}
                    error={errorFor(`colorGroups.${group.clientId}.colorCode`)}
                    optional
                  >
                    <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row">
                      <input
                        type="color"
                        aria-label="Chọn mã màu"
                        value={
                          /^#[0-9a-f]{6}$/i.test(group.colorCode)
                            ? group.colorCode
                            : "#000000"
                        }
                        className="h-10 w-12 shrink-0 cursor-pointer rounded-xl border border-(--admin-border) bg-white p-1"
                        onChange={(event) =>
                          updateGroup(group, "colorCode", event.target.value)
                        }
                      />
                      <Input
                        standalone
                        value={group.colorCode}
                        className={fieldClass}
                        classNameContainer="w-full min-w-0 flex-1"
                        placeholder="#000000"
                        onChange={(event) =>
                          updateGroup(group, "colorCode", event.target.value)
                        }
                      />
                    </div>
                  </EditorField>
                  <EditorField label="Giá bán mặc định">
                    <NumericInput
                      standalone
                      value={group.defaultPrice}
                      className={fieldClass}
                      placeholder={productPrice || "0"}
                      onManualChange={(value) =>
                        updateGroup(group, "defaultPrice", value)
                      }
                    />
                  </EditorField>
                  <EditorField label="Giá vốn mặc định">
                    <NumericInput
                      standalone
                      value={group.defaultCost}
                      className={fieldClass}
                      placeholder={productCost || "0"}
                      onManualChange={(value) =>
                        updateGroup(group, "defaultCost", value)
                      }
                    />
                  </EditorField>
                </div>

                {group.sizes.length ? (
                  <div className="flex flex-wrap items-end gap-2 rounded-xl border border-(--admin-border) p-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="border border-(--admin-border)"
                      onClick={() =>
                        updateGroup(
                          group,
                          "sizes",
                          group.sizes.map((size) => ({
                            ...size,
                            inheritsPrice: true,
                          })),
                        )
                      }
                    >
                      Dùng giá mặc định cho mọi size
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="border border-(--admin-border)"
                      onClick={() =>
                        updateGroup(
                          group,
                          "sizes",
                          group.sizes.map((size) => ({
                            ...size,
                            inheritsCost: true,
                          })),
                        )
                      }
                    >
                      Dùng giá vốn mặc định cho mọi size
                    </Button>
                    <div className="flex min-w-60 flex-1 gap-2 sm:max-w-sm">
                      <NumericInput
                        standalone
                        value={stockInputs[group.clientId] || ""}
                        className={fieldClass}
                        placeholder="Tồn kho ban đầu"
                        onManualChange={(value) =>
                          setStockInputs((current) => ({
                            ...current,
                            [group.clientId]: value,
                          }))
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="border border-(--admin-border)"
                        disabled={
                          !/^\d+$/.test(stockInputs[group.clientId] || "")
                        }
                        onClick={() =>
                          updateGroup(
                            group,
                            "sizes",
                            group.sizes.map((size) => ({
                              ...size,
                              stock: stockInputs[group.clientId],
                            })),
                          )
                        }
                      >
                        Đặt cho mọi size
                      </Button>
                    </div>
                  </div>
                ) : null}

                <ImageEditor
                  title="Ảnh dùng chung cho màu này"
                  description="Size không có ảnh riêng sẽ dùng bộ ảnh này; nếu trống sẽ hiển thị ảnh chung của sản phẩm."
                  images={group.sharedImages}
                  isUploading={isUploading}
                  onChange={(images) =>
                    updateGroup(group, "sharedImages", images)
                  }
                  onUpload={(files) =>
                    onUpload(files, { groupId: group.clientId })
                  }
                />

                <SizeAdder
                  value={sizeInputs[group.clientId] || ""}
                  existingSizes={group.sizes.map((size) => size.sizeName)}
                  onChange={(value) =>
                    setSizeInputs((current) => ({
                      ...current,
                      [group.clientId]: value,
                    }))
                  }
                  onAdd={(sizes) => addSizeText(group, sizes)}
                />

                {group.sizes.length ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-(--admin-text)">
                        {group.sizes.length} size
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="border border-(--admin-border)"
                        onClick={() => generateMissingSkus(group)}
                      >
                        <Sparkles className="size-3.5" /> Tạo SKU còn thiếu
                      </Button>
                    </div>
                    <div className="hidden lg:block">
                      <SizeTable
                        group={group}
                        generateSku={generateOneSku}
                        productPrice={productPrice}
                        productCost={productCost}
                        isUploading={isUploading}
                        errorFor={errorFor}
                        updateSize={updateSize}
                        removeSize={removeSize}
                        onUpload={onUpload}
                      />
                    </div>
                    <div className="space-y-3 lg:hidden">
                      {group.sizes.map((size) => (
                        <SizeCard
                          key={size.clientId}
                          group={group}
                          generateSku={generateOneSku}
                          size={size}
                          productPrice={productPrice}
                          productCost={productCost}
                          isUploading={isUploading}
                          errorFor={errorFor}
                          updateSize={updateSize}
                          removeSize={removeSize}
                          onUpload={onUpload}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-(--admin-border) p-6 text-center text-sm text-(--admin-text-secondary)">
                    Chọn preset hoặc nhập nhiều size, ngăn cách bằng dấu phẩy.
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}

      {!groups.length ? (
        <button
          type="button"
          onClick={addColor}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-(--admin-border) p-10 text-(--admin-text-secondary) hover:border-(--admin-primary-border) hover:bg-(--admin-primary-soft)"
        >
          <Layers3 className="size-8" />
          <span className="font-semibold">Sản phẩm chưa có biến thể</span>
          <span className="text-sm">
            Thêm màu đầu tiên để quản lý size và SKU.
          </span>
        </button>
      ) : null}
      <ConfirmDialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => {
          if (!open) setConfirmation(null);
        }}
        title={confirmation?.title || "Xác nhận thao tác"}
        description={confirmation?.description || ""}
        confirmLabel={confirmation?.confirmLabel}
        tone={confirmation?.tone}
        onConfirm={() => confirmation?.action()}
      />
    </div>
  );
}

type SizeEditorProps = {
  group: ProductColorGroupFormValue;
  generateSku: (
    group: ProductColorGroupFormValue,
    size: ProductSizeVariantFormValue,
  ) => void;
  productPrice: string;
  productCost: string;
  isUploading: boolean;
  errorFor: (path: string) => string | undefined;
  updateSize: <K extends keyof ProductSizeVariantFormValue>(
    group: ProductColorGroupFormValue,
    sizeId: string,
    key: K,
    value: ProductSizeVariantFormValue[K],
  ) => void;
  removeSize: (
    group: ProductColorGroupFormValue,
    size: ProductSizeVariantFormValue,
  ) => void;
  onUpload: (
    files: FileList | null,
    target: VariantImageTarget,
  ) => Promise<void>;
};

function SizeTable(props: SizeEditorProps) {
  return (
    <Table className="min-w-245">
      <TableHeader>
        <TableRow>
          <TableHead>Size</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Giá bán</TableHead>
          <TableHead>Giá vốn</TableHead>
          <TableHead>Tồn kho</TableHead>
          <TableHead>Ảnh riêng</TableHead>
          <TableHead>Hoạt động</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.group.sizes.map((size) => (
          <TableRow key={size.clientId}>
            <TableCell className="w-28 align-bottom">
              <SizeTextField field="sizeName" size={size} {...props} />
            </TableCell>
            <TableCell className="w-52 align-bottom">
              <SizeTextField field="sku" size={size} {...props} />
            </TableCell>
            <TableCell className="w-44 align-bottom">
              <InheritedNumber field="price" size={size} {...props} />
            </TableCell>
            <TableCell className="w-44 align-bottom">
              <InheritedNumber field="cost" size={size} {...props} />
            </TableCell>
            <TableCell className="w-32 align-bottom">
              <SizeStock size={size} {...props} />
            </TableCell>
            <TableCell className="w-36">
              <CompactImageUpload size={size} {...props} />
            </TableCell>
            <TableCell>
              <ActiveToggle size={size} {...props} />
            </TableCell>
            <TableCell>
              <RemoveSizeButton size={size} {...props} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SizeCard(
  props: SizeEditorProps & { size: ProductSizeVariantFormValue },
) {
  const { size } = props;
  const price = resolveSizePrice(props.group, size, props.productPrice);
  return (
    <Collapsible className="overflow-hidden rounded-xl border border-(--admin-border)">
      <div className="flex items-center gap-2 p-3">
        <CollapsibleTrigger asChild>
          <button type="button" className="min-w-0 flex-1 text-left">
            <span className="block font-bold">
              {size.sizeName || "Size chưa đặt tên"}
            </span>
            <span className="block truncate text-xs text-(--admin-text-secondary)">
              {size.sku || "Chưa có SKU"} ·{" "}
              {Number(price || 0).toLocaleString("vi-VN")}đ
              {` · Kho ${size.stock || 0} · `}
              {size.images.length
                ? `${size.images.length} ảnh riêng`
                : props.group.sharedImages.length
                  ? "Dùng ảnh màu"
                  : "Dùng ảnh sản phẩm"}
            </span>
          </button>
        </CollapsibleTrigger>
        <ActiveToggle {...props} />
        <RemoveSizeButton {...props} />
      </div>
      <CollapsibleContent>
        <div className="space-y-4 border-t border-(--admin-border) p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <EditorField label="Size" required>
              <SizeTextField field="sizeName" {...props} />
            </EditorField>
            <EditorField label="SKU" required>
              <SizeTextField field="sku" {...props} />
            </EditorField>
            <EditorField label="Giá bán">
              <InheritedNumber field="price" {...props} />
            </EditorField>
            <EditorField label="Giá vốn">
              <InheritedNumber field="cost" {...props} />
            </EditorField>
            <EditorField label="Tồn kho" required>
              <SizeStock {...props} />
            </EditorField>
          </div>
          <ImageEditor
            title="Ảnh riêng của size"
            description="Để trống để kế thừa ảnh màu."
            images={size.images}
            isUploading={props.isUploading}
            onChange={(images) =>
              props.updateSize(props.group, size.clientId, "images", images)
            }
            onUpload={(files) =>
              props.onUpload(files, {
                groupId: props.group.clientId,
                sizeId: size.clientId,
              })
            }
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function SizeTextField({
  group,
  size,
  field,
  generateSku,
  updateSize,
  errorFor,
}: SizeEditorProps & {
  size: ProductSizeVariantFormValue;
  field: "sizeName" | "sku";
}) {
  const path = `colorGroups.${group.clientId}.sizes.${size.clientId}.${field}`;
  const error = errorFor(path);
  return (
    <div className="w-full min-w-0" data-field-path={path}>
      <div className="flex w-full min-w-0 gap-1 items-center">
        <Input
          standalone
          value={size[field]}
          className={fieldClass}
          classNameContainer="w-full min-w-0 flex-1"
          aria-invalid={Boolean(error)}
          onChange={(event) =>
            updateSize(group, size.clientId, field, event.target.value)
          }
        />
        {field === "sku" && !size.sku.trim() ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            title="Tạo SKU cho size này"
            className="shrink-0 border border-(--admin-border) self-auto"
            onClick={() => generateSku(group, size)}
          >
            <Sparkles className="size-3.5" />
          </Button>
        ) : null}
      </div>
      {error ? (
        <p className="mt-1 whitespace-normal text-xs text-red-500">{error}</p>
      ) : null}
    </div>
  );
}

function InheritedNumber({
  group,
  size,
  field,
  productPrice,
  productCost,
  updateSize,
  errorFor,
}: SizeEditorProps & {
  size: ProductSizeVariantFormValue;
  field: "price" | "cost";
}) {
  const inheritKey = field === "price" ? "inheritsPrice" : "inheritsCost";
  const overrideKey = field === "price" ? "priceOverride" : "costOverride";
  const inherited = size[inheritKey];
  const fallback =
    field === "price"
      ? resolveSizePrice(group, { ...size, inheritsPrice: true }, productPrice)
      : resolveSizeCost(group, { ...size, inheritsCost: true }, productCost);
  const path = `colorGroups.${group.clientId}.sizes.${size.clientId}.${field}`;
  const error = errorFor(path);
  return (
    <div data-field-path={path} className="space-y-1">
      <label className="flex items-center gap-1.5 text-xs text-(--admin-text-secondary)">
        <input
          type="checkbox"
          checked={inherited}
          onChange={(event) =>
            updateSize(group, size.clientId, inheritKey, event.target.checked)
          }
          className="size-4 accent-(--admin-primary)"
        />
        Dùng mặc định
      </label>
      <NumericInput
        standalone
        value={inherited ? fallback : size[overrideKey]}
        disabled={inherited}
        className={fieldClass}
        aria-invalid={Boolean(error)}
        onManualChange={(value) =>
          updateSize(group, size.clientId, overrideKey, value)
        }
      />
      {error ? (
        <p className="whitespace-normal text-xs text-red-500">{error}</p>
      ) : null}
    </div>
  );
}

function SizeStock({
  group,
  size,
  updateSize,
  errorFor,
}: SizeEditorProps & { size: ProductSizeVariantFormValue }) {
  const path = `colorGroups.${group.clientId}.sizes.${size.clientId}.stock`;
  const error = errorFor(path);
  return (
    <div data-field-path={path}>
      <NumericInput
        standalone
        value={size.stock}
        className={fieldClass}
        aria-invalid={Boolean(error)}
        onManualChange={(value) =>
          updateSize(group, size.clientId, "stock", value)
        }
      />
      {error ? (
        <p className="mt-1 whitespace-normal text-xs text-red-500">{error}</p>
      ) : null}
    </div>
  );
}

function ActiveToggle({
  group,
  size,
  updateSize,
}: SizeEditorProps & { size: ProductSizeVariantFormValue }) {
  return (
    <label className="inline-flex items-center gap-2 text-xs font-semibold">
      <input
        type="checkbox"
        checked={size.isActive}
        onChange={(event) =>
          updateSize(group, size.clientId, "isActive", event.target.checked)
        }
        className="size-4 accent-(--admin-primary)"
      />
      {size.isActive ? "Bật" : "Tắt"}
    </label>
  );
}

function CompactImageUpload({
  group,
  size,
  isUploading,
  updateSize,
  onUpload,
}: SizeEditorProps & { size: ProductSizeVariantFormValue }) {
  return (
    <div className="flex items-center gap-2">
      {size.images.slice(0, 2).map((image) => (
        <button
          type="button"
          key={image.clientId}
          aria-label="Xóa ảnh riêng"
          className="relative size-9 overflow-hidden rounded-lg border border-(--admin-border)"
          onClick={() =>
            updateSize(
              group,
              size.clientId,
              "images",
              normalizeImages(
                size.images.filter((item) => item.clientId !== image.clientId),
              ),
            )
          }
        >
          <img src={image.url} alt="" className="size-full object-cover" />
        </button>
      ))}
      <label className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-(--admin-primary)">
        <ImagePlus className="size-4" /> {size.images.length || "Thêm"}
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          disabled={isUploading}
          onChange={(event) => {
            const input = event.currentTarget;
            void onUpload(input.files, {
              groupId: group.clientId,
              sizeId: size.clientId,
            }).finally(() => {
              input.value = "";
            });
          }}
        />
      </label>
    </div>
  );
}

function RemoveSizeButton({
  group,
  size,
  removeSize,
}: SizeEditorProps & { size: ProductSizeVariantFormValue }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="Xóa size"
      className="text-red-500"
      onClick={() => removeSize(group, size)}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}

function SizeAdder({
  value,
  existingSizes,
  onChange,
  onAdd,
}: {
  value: string;
  existingSizes: string[];
  onChange: (value: string) => void;
  onAdd: (sizes: string[]) => void;
}) {
  const parsed = useMemo(
    () =>
      value
        .split(/[,;\n]/)
        .map((size) => size.trim())
        .filter(Boolean),
    [value],
  );
  return (
    <div className="space-y-3 rounded-xl bg-(--admin-surface-subtle) p-3">
      <div className="flex flex-wrap gap-2">
        {Object.entries(SIZE_PRESETS).map(([label, sizes]) => {
          const existing = new Set(existingSizes.map(normalizedVariantKey));
          const missing = sizes.filter(
            (size) => !existing.has(normalizedVariantKey(size)),
          ).length;
          return (
            <Button
              key={label}
              type="button"
              variant="ghost"
              size="sm"
              disabled={!missing}
              className="border border-(--admin-border) bg-white"
              onClick={() => onAdd([...sizes])}
            >
              {label} · thêm {missing}
            </Button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          standalone
          value={value}
          className={fieldClass}
          placeholder="Nhập S, M, L hoặc size tùy chỉnh"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && parsed.length) {
              event.preventDefault();
              onAdd(parsed);
            }
          }}
        />
        <Button
          type="button"
          variant="adminPrimary"
          disabled={!parsed.length}
          onClick={() => onAdd(parsed)}
        >
          <Plus className="size-4" /> Thêm {parsed.length || ""} size
        </Button>
      </div>
    </div>
  );
}

function BulkSizePanel({
  groups,
  sizes,
  selectedGroupIds,
  onSizesChange,
  onGroupsChange,
  onApply,
}: {
  groups: ProductColorGroupFormValue[];
  sizes: string[];
  selectedGroupIds: string[];
  onSizesChange: (sizes: string[]) => void;
  onGroupsChange: (ids: string[]) => void;
  onApply: () => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-(--admin-primary-border) bg-(--admin-primary-soft) p-4">
      <div>
        <p className="font-bold text-(--admin-text)">
          Áp dụng size cho nhiều màu
        </p>
        <p className="text-xs text-(--admin-text-secondary)">
          Dữ liệu đang có và SKU nhập tay được giữ nguyên.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {[...new Set(Object.values(SIZE_PRESETS).flat())].map((size) => {
          const selected = sizes.includes(size);
          return (
            <Button
              key={size}
              type="button"
              size="xs"
              variant={selected ? "adminPrimary" : "ghost"}
              className={
                selected ? undefined : "border border-(--admin-border) bg-white"
              }
              onClick={() =>
                onSizesChange(
                  selected
                    ? sizes.filter((item) => item !== size)
                    : [...sizes, size],
                )
              }
            >
              {size}
            </Button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {groups.map((group) => (
          <label
            key={group.clientId}
            className="inline-flex items-center gap-1.5 text-sm"
          >
            <input
              type="checkbox"
              checked={selectedGroupIds.includes(group.clientId)}
              className="size-4 accent-(--admin-primary)"
              onChange={(event) =>
                onGroupsChange(
                  event.target.checked
                    ? [...selectedGroupIds, group.clientId]
                    : selectedGroupIds.filter((id) => id !== group.clientId),
                )
              }
            />
            {group.colorName || "Chưa đặt tên"}
          </label>
        ))}
        <Button
          type="button"
          variant="adminPrimary"
          size="sm"
          disabled={!sizes.length || !selectedGroupIds.length}
          onClick={onApply}
        >
          Áp dụng
        </Button>
      </div>
    </div>
  );
}

function ImageEditor({
  title,
  description,
  images,
  isUploading,
  onChange,
  onUpload,
}: {
  title: string;
  description: string;
  images: ProductImageDraftValue[];
  isUploading: boolean;
  onChange: (images: ProductImageDraftValue[]) => void;
  onUpload: (files: FileList | null) => Promise<void>;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-xs font-bold text-(--admin-text)">{title}</p>
        <p className="text-xs text-(--admin-text-secondary)">{description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {images.map((image) => (
          <button
            key={image.clientId}
            type="button"
            aria-label="Xóa ảnh"
            className="group relative size-16 overflow-hidden rounded-xl border border-(--admin-border)"
            onClick={() =>
              onChange(
                normalizeImages(
                  images.filter((item) => item.clientId !== image.clientId),
                ),
              )
            }
          >
            <img src={image.url} alt="" className="size-full object-cover" />
            <span className="absolute inset-0 hidden items-center justify-center bg-black/40 text-white group-hover:flex">
              <Trash2 className="size-4" />
            </span>
          </button>
        ))}
        <label className="inline-flex h-16 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-(--admin-primary-border) px-3 text-xs font-semibold text-(--admin-primary)">
          <ImagePlus className="size-4" />{" "}
          {isUploading ? "Đang tải..." : "Thêm ảnh"}
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            disabled={isUploading}
            onChange={(event) => {
              const input = event.currentTarget;
              void onUpload(input.files).finally(() => {
                input.value = "";
              });
            }}
          />
        </label>
      </div>
    </div>
  );
}

function EditorField({
  label,
  children,
  path,
  error,
  required,
  optional,
}: {
  label: string;
  children: React.ReactNode;
  path?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <div className="min-w-0 space-y-1.5" data-field-path={path}>
      <p className="text-xs font-semibold text-(--admin-text-secondary)">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
        {optional ? (
          <span className="ml-1 font-normal text-slate-400">(Tùy chọn)</span>
        ) : null}
      </p>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-red-500">
          {error}
        </p>
      ) : null}
    </div>
  );
}

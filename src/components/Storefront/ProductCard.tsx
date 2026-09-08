/* eslint-disable @next/next/no-img-element */
import type { ProductApiItem } from "@/interface/product";
import ProductFavoriteButton, {
  type FavoriteChangedDetail,
} from "@/components/Storefront/ProductFavoriteButton";
import Link from "next/link";
import { useState } from "react";

const money = (value: number | string) =>
  `${Number(value).toLocaleString("vi-VN")}đ`;

export default function ProductCard({
  product,
  onFavoriteChange,
}: {
  product: ProductApiItem;
  onFavoriteChange?: (detail: FavoriteChangedDetail) => void;
}) {
  const variants =
    product.variants?.filter((variant) => variant.isActive) || [];
  const prices = variants.map((variant) => Number(variant.sellPrice));
  const price = prices.length ? Math.min(...prices) : Number(product.sellPrice);
  const stock = Number(product.totalAvailableStock ?? product.quantity);
  const colors = [
    ...new Map(
      variants
        .filter((variant) => variant.color)
        .map((variant) => [variant.color, variant.colorCode || "#D96C8A"]),
    ).entries(),
  ].slice(0, 4);
  const secondaryImage = product.images?.[1]?.url;
  const [imageReady, setImageReady] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <article className="group min-w-0">
      <Link href={`/products/${product.slug || product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#F5EEF0]">
          {!imageReady && !imageFailed && (
            <div
              aria-hidden="true"
              className="storefront-skeleton absolute inset-0"
            />
          )}
          {imageFailed ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#F3EDEF] px-4 text-center text-xs font-semibold text-[#998B91]">
              Ảnh sản phẩm đang được cập nhật
            </div>
          ) : (
            <img
              src={product.imageUrl}
              alt={product.title}
              loading="lazy"
              onLoad={() => setImageReady(true)}
              onError={() => setImageFailed(true)}
              className={`relative size-full object-cover transition-opacity duration-300 ${imageReady ? "opacity-100" : "opacity-0"} ${secondaryImage ? "group-hover:opacity-0" : ""}`}
            />
          )}
          {secondaryImage && (
            <img
              src={secondaryImage}
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover opacity-0 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
            />
          )}
          {stock <= 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-[#1C1A1B]/80 px-2.5 py-1 text-xs font-bold text-white">
              Hết hàng
            </span>
          )}
          <span className="absolute right-3 top-3 shadow-sm">
            <ProductFavoriteButton
              productId={product.id}
              initialIsFavorited={product.isFavorited}
              initialCount={product.displayFavoriteCount}
              onChange={onFavoriteChange}
              compact
            />
          </span>
        </div>
        <div className="pt-3">
          <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-[#2D2226]">
            {product.title}
          </h3>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-sm font-extrabold text-[#A43E5F]">
              {money(price)}
            </p>
            {colors.length > 0 && (
              <span className="flex gap-1">
                {colors.map(([name, color]) => (
                  <i
                    key={name}
                    title={name || undefined}
                    className="size-3 rounded-full border border-white shadow-[0_0_0_1px_#E9E2E5]"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

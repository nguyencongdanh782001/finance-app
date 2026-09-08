import { toProductResponse } from "@/lib/products/product-status";

export const getDisplayFavoriteCount = (
  organicFavoriteCount: number,
  favoriteCountAdjustment: number,
) => Math.max(0, Number(organicFavoriteCount || 0) + Number(favoriteCountAdjustment || 0));

export const withFavoriteMeta = (
  product: Parameters<typeof toProductResponse>[0],
  options: { isAdmin: boolean; isFavorited?: boolean },
) => {
  const response = toProductResponse(product) as Record<string, unknown>;
  const organicFavoriteCount = Number(response.organicFavoriteCount || 0);
  const favoriteCountAdjustment = Number(response.favoriteCountAdjustment || 0);
  const result: Record<string, unknown> = {
    ...response,
    displayFavoriteCount: getDisplayFavoriteCount(
      organicFavoriteCount,
      favoriteCountAdjustment,
    ),
    isFavorited: Boolean(options.isFavorited),
  };

  if (!options.isAdmin) {
    delete result.organicFavoriteCount;
    delete result.favoriteCountAdjustment;
  }

  return result;
};

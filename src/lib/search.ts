/**
 * Keeps search behaviour consistent between the browser and the database.
 * Vietnamese characters such as "á" and "a" should be equivalent for a
 * product lookup, while the original value is still kept for display/URLs.
 */
export function normalizeSearchText(value: string | null | undefined) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 100);
}

export function foldSearchText(value: string | null | undefined) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLocaleLowerCase("vi");
}

export function getSearchTokens(value: string | null | undefined) {
  return foldSearchText(normalizeSearchText(value))
    .split(/\s+/)
    .filter(Boolean);
}

export function matchesSearchTokens(
  searchableText: string,
  query: string | null | undefined,
) {
  const foldedText = foldSearchText(searchableText);
  return getSearchTokens(query).every((token) => foldedText.includes(token));
}

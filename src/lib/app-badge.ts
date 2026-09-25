export async function updateAppBadge(count: number): Promise<void> {
  if (typeof navigator === "undefined") return;

  const normalizedCount = Number.isFinite(count)
    ? Math.max(0, Math.floor(count))
    : 0;

  try {
    if (normalizedCount > 0 && "setAppBadge" in navigator) {
      await navigator.setAppBadge(normalizedCount);
      return;
    }

    if (normalizedCount === 0 && "clearAppBadge" in navigator) {
      await navigator.clearAppBadge();
    }
  } catch {
    // App badge support is optional and must never break the application.
  }
}

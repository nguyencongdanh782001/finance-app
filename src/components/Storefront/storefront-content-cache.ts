type CacheEntry<T> = {
  value?: T;
  promise?: Promise<T>;
  expiresAt: number;
};

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, CacheEntry<unknown>>();

export function getStorefrontContent<T>(
  key: string,
  loader: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const existing = cache.get(key) as CacheEntry<T> | undefined;

  if (existing && existing.expiresAt > now) {
    if (existing.promise) return existing.promise;
    return Promise.resolve(existing.value as T);
  }

  const promise = loader()
    .then((value) => {
      cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
      return value;
    })
    .catch((error) => {
      cache.delete(key);
      throw error;
    });

  cache.set(key, { promise, expiresAt: now + CACHE_TTL_MS });
  return promise;
}

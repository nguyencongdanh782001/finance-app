type RuntimeCachingPattern = RegExp | ((input: { url: URL }) => boolean);

type RuntimeCachingEntry = {
  urlPattern: RuntimeCachingPattern;
  handler:
    | "CacheFirst"
    | "CacheOnly"
    | "NetworkFirst"
    | "NetworkOnly"
    | "StaleWhileRevalidate";
  method?:
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE"
    | "HEAD";
  options?: Record<string, unknown>;
};

declare module "next-pwa/cache" {
  const runtimeCaching: RuntimeCachingEntry[];
  export default runtimeCaching;
}

import type { ProductContext } from "./types.ts";

export const CHAT_MESSAGE_MAX_LENGTH = 500;

export type ChatRequestPayload = {
  message: string;
  context?: ProductContext;
};

export function parseChatRequest(value: unknown): ChatRequestPayload | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.message !== "string") return null;
  const message = record.message.trim();
  if (!message || message.length > CHAT_MESSAGE_MAX_LENGTH) return null;
  if (record.context === undefined) return { message };
  if (!record.context || typeof record.context !== "object") return null;
  const contextRecord = record.context as Record<string, unknown>;
  const id = contextRecord.id;
  const slug = contextRecord.slug;
  if (id !== undefined && (!Number.isInteger(id) || Number(id) <= 0))
    return null;
  if (
    slug !== undefined &&
    (typeof slug !== "string" || !/^[a-zA-Z0-9_-]{1,160}$/.test(slug))
  )
    return null;
  if (id === undefined && slug === undefined) return null;
  return {
    message,
    context: {
      ...(typeof id === "number" ? { id } : {}),
      ...(typeof slug === "string" ? { slug } : {}),
    },
  };
}

type Bucket = { count: number; resetAt: number };

export class InMemoryRateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly maxKeys: number;

  constructor(limit: number, windowMs: number, maxKeys = 1_000) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.maxKeys = maxKeys;
  }

  consume(key: string, now = Date.now()) {
    const current = this.buckets.get(key);
    if (!current || current.resetAt <= now) {
      if (this.buckets.size >= this.maxKeys) {
        for (const [bucketKey, bucket] of this.buckets) {
          if (bucket.resetAt <= now) this.buckets.delete(bucketKey);
        }
        if (this.buckets.size >= this.maxKeys)
          this.buckets.delete(this.buckets.keys().next().value ?? "");
      }
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, retryAfterSeconds: 0 };
    }
    if (current.count >= this.limit) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((current.resetAt - now) / 1_000),
        ),
      };
    }
    current.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

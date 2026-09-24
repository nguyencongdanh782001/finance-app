import assert from "node:assert/strict";
import test from "node:test";
import {
  CHAT_MESSAGE_MAX_LENGTH,
  InMemoryRateLimiter,
  parseChatRequest,
} from "./request.ts";

test("validates and trims chat requests", () => {
  assert.deepEqual(
    parseChatRequest({ message: "  còn size M?  ", context: { id: 12 } }),
    {
      message: "còn size M?",
      context: { id: 12 },
    },
  );
  assert.equal(parseChatRequest({ message: "" }), null);
  assert.equal(
    parseChatRequest({ message: "a".repeat(CHAT_MESSAGE_MAX_LENGTH + 1) }),
    null,
  );
  assert.equal(
    parseChatRequest({ message: "hello", context: { slug: "../admin" } }),
    null,
  );
});

test("limits requests per key inside one process window", () => {
  const limiter = new InMemoryRateLimiter(2, 1_000);
  assert.equal(limiter.consume("client", 0).allowed, true);
  assert.equal(limiter.consume("client", 10).allowed, true);
  assert.equal(limiter.consume("client", 20).allowed, false);
  assert.equal(limiter.consume("client", 1_001).allowed, true);
});

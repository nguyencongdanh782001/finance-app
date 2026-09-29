const attempts = new Map<number, number[]>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;

export function allowReviewWrite(userId: number) {
  const now = Date.now();
  const recent = (attempts.get(userId) || []).filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );
  if (recent.length >= MAX_ATTEMPTS) {
    attempts.set(userId, recent);
    return false;
  }
  recent.push(now);
  attempts.set(userId, recent);
  return true;
}

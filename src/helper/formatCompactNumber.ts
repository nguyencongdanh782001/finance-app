export function formatCompactNumber(value: number): string {
  if (value === 0) return "0";

  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000) {
    const v = abs / 1_000_000;
    return `${sign}${Number.isInteger(v) ? v : v.toFixed(1)}M`;
  }

  if (abs >= 1_000) {
    const v = abs / 1_000;
    return `${sign}${Number.isInteger(v) ? v : v.toFixed(1)}K`;
  }

  return `${value}`;
}

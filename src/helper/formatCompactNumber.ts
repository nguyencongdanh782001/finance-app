export function formatCompactNumber(value: number): string {
  if (value === 0) return "0";

  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  const format = (num: number) => {
    const truncated = Math.floor(num * 10) / 10;
    return Number.isInteger(truncated)
      ? truncated.toString()
      : truncated.toString();
  };

  if (abs >= 1_000_000_000) {
    return `${sign}${format(abs / 1_000_000_000)}B`;
  }

  if (abs >= 1_000_000) {
    return `${sign}${format(abs / 1_000_000)}M`;
  }

  if (abs >= 1_000) {
    return `${sign}${format(abs / 1_000)}K`;
  }

  return `${value}`;
}

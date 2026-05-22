export function formatCompactNumber(value: number): string {
  if (value === 0) return "0";

  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  const format = (num: number) => {
    const precision = num >= 100 ? 0 : num >= 10 ? 1 : 2;
    const factor = 10 ** precision;
    const truncated = Math.trunc(num * factor) / factor;

    return truncated
      .toFixed(precision)
      .replace(/\.0+$|(\.\d*?[1-9])0+$/, "$1");
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

export type DebouncedFunction<TArgs extends unknown[]> = ((
  ...args: TArgs
) => void) & {
  cancel: () => void;
};

export function debounce<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void | Promise<void>,
  delay: number,
): DebouncedFunction<TArgs> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const debounced = ((...args: TArgs) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      void callback(...args);
    }, delay);
  }) as DebouncedFunction<TArgs>;

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
  };

  return debounced;
}

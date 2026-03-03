"use client";

import { debounce } from "lodash";
import { useCallback, useEffect, useRef } from "react";

export function useDailyAutoSave<T>(
  submitFn: (value: T) => Promise<void>,
  delay = 300,
) {
  const debouncedRef = useRef<ReturnType<typeof debounce> | null>(null);

  useEffect(() => {
    debouncedRef.current = debounce(async (value: T) => {
      await submitFn(value);
    }, delay);

    return () => {
      debouncedRef.current?.cancel();
    };
  }, [submitFn, delay]);

  const submitDebounced = useCallback((value: T) => {
    debouncedRef.current?.(value);
  }, []);

  return { submitDebounced };
}

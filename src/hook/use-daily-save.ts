"use client";

import { debounce, DebouncedFunction } from "@/lib/debounce";
import { useCallback, useEffect, useRef } from "react";

export function useDailyAutoSave<T>(
  submitFn: (value: T) => Promise<void>,
  delay = 300,
) {
  const debouncedRef = useRef<DebouncedFunction<[T]> | null>(null);

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

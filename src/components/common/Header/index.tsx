"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";

const AUTO_COMPACT_SCROLL_OFFSET = 1;

interface HeaderProps {
  children?: ReactNode;
  compact?: boolean;
}

const Header = ({ children, compact }: HeaderProps) => {
  const router = useRouter();
  const [autoCompact, setAutoCompact] = useState(false);
  const autoCompactRef = useRef(false);
  const lastTouchYRef = useRef<number | null>(null);

  useEffect(() => {
    if (compact !== undefined) {
      return;
    }

    const updateCompactState = (nextCompact: boolean) => {
      if (autoCompactRef.current === nextCompact) {
        return;
      }

      autoCompactRef.current = nextCompact;
      setAutoCompact(nextCompact);
    };

    const handleScrollDown = () => {
      if (window.scrollY <= AUTO_COMPACT_SCROLL_OFFSET) {
        return;
      }

      updateCompactState(true);
    };

    const handleScrollUp = () => {
      updateCompactState(false);
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY > 0) {
        handleScrollDown();
      } else if (event.deltaY < 0) {
        handleScrollUp();
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      lastTouchYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const currentTouchY = event.touches[0]?.clientY;

      if (currentTouchY === undefined || lastTouchYRef.current === null) {
        return;
      }

      const deltaY = lastTouchYRef.current - currentTouchY;

      if (deltaY > 0) {
        handleScrollDown();
      } else if (deltaY < 0) {
        handleScrollUp();
      }

      lastTouchYRef.current = currentTouchY;
    };

    const handleTouchEnd = () => {
      lastTouchYRef.current = null;
    };

    const handleScroll = () => {
      if (window.scrollY <= AUTO_COMPACT_SCROLL_OFFSET) {
        updateCompactState(false);
      }
    };

    autoCompactRef.current = window.scrollY > AUTO_COMPACT_SCROLL_OFFSET;
    setAutoCompact(autoCompactRef.current);

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [compact]);

  const isCompact = compact ?? autoCompact;

  return (
    <div
      className={cn(
        "sticky top-0 z-10 border-b border-blue-1 bg-white shadow",
      )}
    >
      <div
        className={cn(
          "overflow-hidden px-5 transition-[padding] duration-300 ease-out",
          isCompact ? "pb-3 pt-2" : "pb-6 pt-6",
        )}
      >
        <div
          className={cn(
            "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out",
            isCompact ? "pointer-events-none" : "pointer-events-auto",
            isCompact
              ? "grid-rows-[0fr] opacity-0"
              : "grid-rows-[1fr] opacity-100",
          )}
          aria-hidden={isCompact}
        >
          <div className="min-h-0">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              disabled={isCompact}
              className={cn(
                "h-fit! gap-1 p-0! font-medium text-base text-green-9 transition-transform duration-300 ease-out",
                isCompact ? "-translate-y-2" : "translate-y-0",
              )}
            >
              <ChevronLeft className="size-5" />
              Quay lại
            </Button>
            <h3
              className={cn(
                "mt-4 text-center text-base font-extrabold uppercase text-blue-2 transition-transform duration-300 ease-out",
                isCompact ? "-translate-y-2" : "translate-y-0",
              )}
            >
              Báo cáo tài chính
            </h3>
          </div>
        </div>
        {children ? (
          <div
            className={cn(
              "transition-[margin-top,transform] duration-300 ease-out",
              isCompact ? "mt-0 -translate-y-0.5" : "mt-4 translate-y-0",
            )}
          >
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Header;

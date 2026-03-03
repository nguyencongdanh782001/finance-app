"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-10 bg-white py-6 border-b border-blue-1 shadow">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="p-0! gap-1 h-fit! font-medium text-base text-green-9 ml-5"
      >
        <ChevronLeft className="size-5" />
        Quay lại
      </Button>
      <h3 className="uppercase font-extrabold text-blue-2 text-base text-center mt-4">
        Báo cáo tài chính
      </h3>
    </div>
  );
};

export default Header;

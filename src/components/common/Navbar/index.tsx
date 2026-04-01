"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Package } from "lucide-react";

const menu = [
  {
    icon: Home,
    title: "trang chủ",
    link: "/",
  },
  {
    icon: LayoutGrid,
    title: "danh mục",
    link: "/categories",
  },
  {
    icon: Package,
    title: "sản phẩm",
    link: "/products",
  },
];

const Navbar = () => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-191.25 -translate-x-1/2 bg-white px-4 py-2 shadow-[0_-4px_16px_rgba(15,23,42,0.08)]">
      <div className="flex w-full justify-between">
        {menu.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.link;

          return (
            <Link
              key={index}
              href={item.link}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <Icon
                size={20}
                strokeWidth={2}
                className={isActive ? "text-green-2" : "text-gray-2"}
              />
              <div className="flex flex-col w-full justify-between items-center">
                <span
                  className={`text-10px font-semibold uppercase tracking-[0.08em] ${
                    isActive ? "text-green-2" : "text-gray-2"
                  }`}
                >
                  {item.title}
                </span>
                <span
                  className={`h-1 w-8 rounded-full transition-all ${
                    isActive ? "bg-green-2" : "bg-transparent"
                  }`}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Navbar;

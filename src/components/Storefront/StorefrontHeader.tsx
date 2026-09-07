"use client";

import { useAuth } from "@/components/Auth/AuthProvider";
import { useCart } from "@/components/Storefront/CartProvider";
import { getDefaultRouteByRole, isAdminRole } from "@/lib/auth/routing";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const links = [{ label: "Trang chủ", href: "/" }, { label: "Sản phẩm", href: "/products" }, { label: "Nam", href: "/products?gender=MEN" }, { label: "Nữ", href: "/products?gender=WOMEN" }];

export default function StorefrontHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { count } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const submit = (event: React.FormEvent) => { event.preventDefault(); router.push(`/products?search=${encodeURIComponent(query.trim())}`); setMobileOpen(false); };
  const accountHref = isAuthenticated && user ? (isAdminRole(user.role) ? getDefaultRouteByRole(user.role) : "/profile") : `/login?redirect=${encodeURIComponent(pathname)}`;
  return <header className="sticky top-0 z-40 border-b border-[#E9E2E5]/80 bg-[#FFFCFA]/95 backdrop-blur">
    <div className="mx-auto flex h-20 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
      <Link href="/" aria-label="Quỳnh Nhi Store" className="flex shrink-0 items-center gap-2.5"><Image src="/logo-quynh-nhi-store-mark.svg" alt="" width={54} height={54} className="size-13" /><span className="hidden text-sm font-extrabold text-[#1C1A1B] sm:block">Quỳnh Nhi Store</span></Link>
      <nav className="hidden items-center gap-5 lg:flex">{links.map((link) => <Link key={link.label} href={link.href} className={`text-sm font-bold transition-colors hover:text-[#A43E5F] ${pathname === link.href.split("?")[0] && (link.href === "/" || pathname === "/products") ? "text-[#A43E5F]" : "text-[#6F686B]"}`}>{link.label}</Link>)}</nav>
      <form onSubmit={submit} className="ml-auto hidden max-w-64 flex-1 items-center rounded-full border border-[#E9E2E5] bg-white px-3 py-2 focus-within:border-[#D96C8A] sm:flex"><Search className="size-4 text-[#9C8E93]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm sản phẩm..." aria-label="Tìm sản phẩm" className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-[#9C8E93]" /></form>
      <div className="flex items-center gap-1"><Link href={accountHref} aria-label="Tài khoản" className="rounded-full p-2.5 text-[#6F686B] hover:bg-[#FFF3F6] hover:text-[#A43E5F]"><UserRound className="size-5" /></Link><Link href="/cart" aria-label={`Giỏ hàng, ${count} sản phẩm`} className="relative rounded-full p-2.5 text-[#6F686B] hover:bg-[#FFF3F6] hover:text-[#A43E5F]"><ShoppingBag className="size-5" />{count > 0 && <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[#D96C8A] text-[10px] font-bold text-white">{count > 9 ? "9+" : count}</span>}</Link><button type="button" aria-label={mobileOpen ? "Đóng menu" : "Mở menu"} onClick={() => setMobileOpen(!mobileOpen)} className="rounded-full p-2.5 text-[#6F686B] hover:bg-[#FFF3F6] lg:hidden">{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button></div>
    </div>
    {mobileOpen && <div className="border-t border-[#E9E2E5] bg-[#FFFCFA] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 lg:hidden"><form onSubmit={submit} className="mb-3 flex items-center rounded-full border border-[#E9E2E5] bg-white px-3 py-2"><Search className="size-4 text-[#9C8E93]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm sản phẩm..." className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none" /></form><nav className="grid gap-1">{links.map((link) => <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-3 text-sm font-bold text-[#4D4448] hover:bg-[#FFF3F6]">{link.label}</Link>)}</nav></div>}
  </header>;
}

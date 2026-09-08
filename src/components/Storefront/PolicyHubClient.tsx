"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RichTextRenderer from "@/components/RichText/RichTextRenderer";

export type PublicPolicy = {
  title: string;
  slug: string;
  summaryHtml: string | null;
  summaryText: string | null;
  contentHtml: string;
  updatedAt: string;
  footerOrder: number;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" }).format(new Date(value));
}

export default function PolicyHubClient({
  policies,
  error = false,
}: {
  policies: PublicPolicy[];
  error?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedSlug = searchParams.get("policy");
  const selected = useMemo(
    () => policies.find((policy) => policy.slug === requestedSlug) || policies[0],
    [policies, requestedSlug],
  );
  const invalidSlug = Boolean(requestedSlug && !policies.some((policy) => policy.slug === requestedSlug));

  useEffect(() => {
    if (!selected || requestedSlug === selected.slug || invalidSlug) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("policy", selected.slug);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [invalidSlug, pathname, requestedSlug, router, searchParams, selected]);

  const selectPolicy = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("policy", slug);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (error) {
    return (
      <section className="rounded-2xl border border-[#EAE1E4] bg-white px-6 py-12 text-center shadow-[0_12px_32px_rgba(45,34,38,0.05)]">
        <h2 className="font-serif text-2xl text-[#2D2226]">Không thể tải thông tin chính sách.</h2>
        <p className="mt-3 text-sm text-[#7A6C72]">Vui lòng thử lại.</p>
        <button type="button" onClick={() => window.location.reload()} className="mt-6 inline-flex min-h-11 items-center rounded-xl border border-[#D96C8A] px-5 text-sm font-bold text-[#A43E5F]">Thử lại</button>
      </section>
    );
  }

  if (!policies.length) {
    return (
      <section className="rounded-2xl border border-[#EAE1E4] bg-white px-6 py-12 text-center shadow-[0_12px_32px_rgba(45,34,38,0.05)]">
        <h2 className="font-serif text-2xl text-[#2D2226]">Chính sách đang được cập nhật</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7A6C72]">Quỳnh Nhi Store đang hoàn thiện thông tin chính sách. Vui lòng quay lại sau.</p>
        <Link href="/" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#D96C8A] px-5 text-sm font-bold text-white">Về trang chủ</Link>
      </section>
    );
  }

  if (invalidSlug || !selected) {
    return (
      <section className="rounded-2xl border border-[#EAE1E4] bg-white px-6 py-12 text-center shadow-[0_12px_32px_rgba(45,34,38,0.05)]">
        <h2 className="font-serif text-2xl text-[#2D2226]">Không tìm thấy chính sách</h2>
        <p className="mt-3 text-sm text-[#7A6C72]">Chính sách này không tồn tại hoặc chưa được xuất bản.</p>
        <button type="button" onClick={() => selectPolicy(policies[0].slug)} className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#D96C8A] px-5 text-sm font-bold text-white">Xem chính sách đầu tiên</button>
      </section>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start lg:gap-12">
      <div className="lg:hidden">
        <label htmlFor="policy-select" className="mb-2 block text-sm font-bold text-[#2D2226]">Chọn chính sách</label>
        <Select value={selected.slug} onValueChange={selectPolicy}>
          <SelectTrigger id="policy-select" aria-label="Chọn chính sách"><SelectValue /></SelectTrigger>
          <SelectContent>{policies.map((policy) => <SelectItem key={policy.slug} value={policy.slug}>{policy.title}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <nav className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto lg:block" aria-label="Các chính sách cửa hàng">
        <p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-[#8A7B81]">Chính sách cửa hàng</p>
        <ul className="grid gap-1 border-l border-[#EAE1E4]">
          {policies.map((policy) => {
            const active = policy.slug === selected.slug;
            return <li key={policy.slug}><button type="button" aria-current={active ? "page" : undefined} onClick={() => selectPolicy(policy.slug)} className={`w-full border-l-2 px-4 py-3 text-left text-sm leading-5 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D96C8A] ${active ? "-ml-px border-[#D96C8A] bg-[#FCEEF3] font-bold text-[#A43E5F]" : "border-transparent text-[#65545B] hover:bg-[#FBF7F8] hover:text-[#A43E5F]"}`}>{policy.title}</button></li>;
          })}
        </ul>
      </nav>
      <article className="min-w-0 max-w-[860px]" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#D96C8A]">Thông tin cửa hàng</p>
        <h2 className="mt-3 font-serif text-4xl leading-tight text-[#2D2226] sm:text-5xl">{selected.title}</h2>
        {selected.summaryHtml || selected.summaryText ? <RichTextRenderer html={selected.summaryHtml || `<p>${selected.summaryText}</p>`} compact className="policy-summary mt-5 max-w-3xl text-base leading-7 text-[#6F6066]" /> : null}
        <p className="mt-4 text-xs font-semibold text-[#8A7B81]">Cập nhật lần cuối: {formatDate(selected.updatedAt)}</p>
        <RichTextRenderer html={selected.contentHtml} className="policy-content mt-10 max-w-[820px]" />
      </article>
    </div>
  );
}

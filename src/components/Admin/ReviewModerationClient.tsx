"use client";

import { AdminPageContainer, AdminPageHeader, AdminSection } from "@/components/Admin/AdminPage";
import { Eye, EyeOff, Loader2, Search, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type AdminReview = {
  id: number;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  isApproved: boolean;
  product: { id: number; title: string; slug: string | null };
};

type AdminResponse = {
  reviews: AdminReview[];
  pagination: {
    page: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} sao`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star key={value} aria-hidden="true" className={`size-3.5 ${value <= rating ? "fill-[#E7A52F] text-[#E7A52F]" : "text-slate-300"}`} />
      ))}
    </span>
  );
}

export default function ReviewModerationClient() {
  const [data, setData] = useState<AdminResponse>({ reviews: [], pagination: { page: 1, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const query = new URLSearchParams({ page: String(page), limit: "20", status });
    if (search) query.set("search", search);
    try {
      const response = await fetch(`/api/admin/reviews?${query.toString()}`, { cache: "no-store" });
      const result = (await response.json()) as AdminResponse | { message?: string };
      if (!response.ok) throw new Error("message" in result ? result.message : undefined);
      setData(result as AdminResponse);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải danh sách đánh giá.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const applySearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const toggleVisibility = async (review: AdminReview) => {
    setPendingId(review.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !review.isApproved }),
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(result.message || "Không thể cập nhật trạng thái.");
      await load();
    } catch (toggleError: unknown) {
      setError(toggleError instanceof Error ? toggleError.message : "Không thể cập nhật trạng thái.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <AdminPageContainer>
      <AdminPageHeader title="Đánh giá sản phẩm" description="Kiểm duyệt đánh giá của khách hàng trước khi hiển thị trên cửa hàng." />
      <AdminSection className="p-0">
        <div className="flex flex-col gap-3 border-b border-(--admin-border) p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <form onSubmit={applySearch} className="flex min-w-0 flex-1 gap-2 sm:max-w-md">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-(--admin-text-muted)" />
              <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Tìm sản phẩm, khách hàng, nội dung" className="h-10 w-full rounded-lg border border-(--admin-border) bg-white pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
            </div>
            <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white">Tìm</button>
          </form>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-10 rounded-lg border border-(--admin-border) bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10">
            <option value="all">Tất cả trạng thái</option>
            <option value="visible">Đang hiển thị</option>
            <option value="hidden">Đang ẩn</option>
          </select>
        </div>
        {error ? <p role="alert" className="mx-4 mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:mx-5">{error}</p> : null}
        {loading ? <div className="flex items-center justify-center p-12 text-sm text-(--admin-text-secondary)"><Loader2 className="mr-2 size-4 animate-spin" /> Đang tải đánh giá...</div> : data.reviews.length === 0 ? <div className="p-12 text-center text-sm text-(--admin-text-secondary)">Chưa có đánh giá phù hợp.</div> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-(--admin-surface-muted) text-xs uppercase tracking-wide text-(--admin-text-muted)">
                <tr><th className="px-5 py-3 font-semibold">Sản phẩm</th><th className="px-5 py-3 font-semibold">Khách hàng</th><th className="px-5 py-3 font-semibold">Đánh giá</th><th className="px-5 py-3 font-semibold">Trạng thái</th><th className="px-5 py-3 text-right font-semibold">Thao tác</th></tr>
              </thead>
              <tbody className="divide-y divide-(--admin-border)">
                {data.reviews.map((review) => (
                  <tr key={review.id} className="align-top">
                    <td className="max-w-52 px-5 py-4 font-semibold text-(--admin-text)">{review.product.title}</td>
                    <td className="px-5 py-4 text-(--admin-text-secondary)">{review.authorName}</td>
                    <td className="max-w-96 px-5 py-4"><Stars rating={review.rating} /><p className="mt-2 whitespace-pre-wrap break-words leading-5 text-(--admin-text-secondary)">{review.comment}</p><p className="mt-1 text-xs text-(--admin-text-muted)">{new Date(review.createdAt).toLocaleDateString("vi-VN")}</p></td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${review.isApproved ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{review.isApproved ? "Đang hiển thị" : "Đang ẩn"}</span></td>
                    <td className="px-5 py-4 text-right"><button type="button" disabled={pendingId === review.id} onClick={() => void toggleVisibility(review)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-(--admin-border) px-3 text-xs font-semibold text-(--admin-text-secondary) hover:bg-(--admin-primary-soft) hover:text-primary disabled:opacity-50">{pendingId === review.id ? <Loader2 className="size-3.5 animate-spin" /> : review.isApproved ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}{review.isApproved ? "Ẩn" : "Hiện"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data.pagination.totalPages > 1 ? <div className="flex items-center justify-between border-t border-(--admin-border) px-5 py-4 text-sm"><button type="button" disabled={!data.pagination.hasPreviousPage} onClick={() => setPage((value) => value - 1)} className="rounded-lg px-3 py-2 font-semibold text-primary disabled:opacity-40">Trước</button><span className="text-(--admin-text-muted)">Trang {data.pagination.page} / {data.pagination.totalPages}</span><button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setPage((value) => value + 1)} className="rounded-lg px-3 py-2 font-semibold text-primary disabled:opacity-40">Sau</button></div> : null}
      </AdminSection>
    </AdminPageContainer>
  );
}

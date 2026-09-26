"use client";

import { useAuth } from "@/components/Auth/AuthProvider";
import { buildLoginUrl } from "@/lib/auth/routing";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

type Review = {
  id: number;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  isApproved: boolean;
};

type Summary = {
  average: number;
  total: number;
  breakdown: Record<"1" | "2" | "3" | "4" | "5", number>;
};

type ReviewResponse = {
  reviews: Review[];
  summary: Summary;
  myReview: Review | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

const emptySummary: Summary = {
  average: 0,
  total: 0,
  breakdown: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
};
const maxCommentLength = 1000;

function Stars({ rating, size = "size-4" }: { rating: number; size?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden="true"
          className={`${size} ${star <= rating ? "fill-[#E7A52F] text-[#E7A52F]" : "text-[#D9CDD1]"}`}
        />
      ))}
    </span>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function ProductReviews({
  productIdentifier,
}: {
  productIdentifier: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isInitializing, user } = useAuth();
  const [data, setData] = useState<ReviewResponse>({
    reviews: [],
    summary: emptySummary,
    myReview: null,
    pagination: {
      page: 1,
      limit: 5,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(
      `/api/products/${encodeURIComponent(productIdentifier)}/reviews?page=${page}&limit=5`,
      { cache: "no-store", signal: controller.signal },
    )
      .then(async (response) => {
        const result = (await response.json()) as ReviewResponse | { message?: string };
        if (!response.ok) throw new Error("message" in result ? result.message : undefined);
        const reviewData = result as ReviewResponse;
        setData(reviewData);
        setRating(reviewData.myReview?.rating || 5);
        setComment(reviewData.myReview?.comment || "");
      })
      .catch((loadError: unknown) => {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setError("Không thể tải đánh giá sản phẩm.");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [isAuthenticated, page, productIdentifier, user?.id]);

  const goToLogin = () => {
    const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}#reviews`;
    router.push(buildLoginUrl(currentUrl));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAuthenticated || user?.role !== "CUSTOMER") {
      goToLogin();
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    const existing = data.myReview;
    const response = await fetch(
      existing
        ? `/api/products/${encodeURIComponent(productIdentifier)}/reviews/${existing.id}`
        : `/api/products/${encodeURIComponent(productIdentifier)}/reviews`,
      {
        method: existing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      },
    );
    const result = (await response.json()) as { message?: string };
    if (!response.ok) setError(result.message || "Không thể lưu đánh giá.");
    else {
      setMessage(existing ? "Đã cập nhật đánh giá." : "Cảm ơn bạn đã đánh giá sản phẩm.");
      setPage(1);
    }
    setSaving(false);
  };

  const remove = async () => {
    if (!data.myReview || !window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return;
    setDeleting(true);
    setError("");
    const response = await fetch(
      `/api/products/${encodeURIComponent(productIdentifier)}/reviews/${data.myReview.id}`,
      { method: "DELETE" },
    );
    const result = (await response.json()) as { message?: string };
    if (!response.ok) setError(result.message || "Không thể xóa đánh giá.");
    else {
      setData((current) => ({ ...current, myReview: null }));
      setRating(5);
      setComment("");
      setMessage("Đã xóa đánh giá.");
      setPage(1);
    }
    setDeleting(false);
  };

  const summary = data.summary || emptySummary;
  const isCustomer = isAuthenticated && user?.role === "CUSTOMER";

  return (
    <section id="reviews" className="mt-14 scroll-mt-24 border-t border-[#EAE1E4] pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold">Đánh giá sản phẩm</h2>
          <p className="mt-1 text-sm text-[#998B91]">Chia sẻ trải nghiệm của bạn với sản phẩm này.</p>
        </div>
        {summary.total ? <p className="text-sm text-[#998B91]">{summary.total} đánh giá</p> : null}
      </div>

      <div className="mt-6 grid gap-6 rounded-2xl border border-[#EAE1E4] bg-white p-5 sm:grid-cols-[180px_1fr] sm:p-6">
        <div className="flex flex-col items-center justify-center border-b border-[#EAE1E4] pb-5 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6">
          <p className="text-4xl font-extrabold text-[#A43E5F]">{summary.average.toFixed(1)}</p>
          <Stars rating={Math.round(summary.average)} size="size-4" />
          <p className="mt-2 text-sm text-[#998B91]">{summary.total} lượt đánh giá</p>
        </div>
        <div className="space-y-2.5" aria-label="Phân bổ số sao">
          {[5, 4, 3, 2, 1].map((value) => {
            const count = summary.breakdown[String(value) as keyof Summary["breakdown"]] || 0;
            const width = summary.total ? `${(count / summary.total) * 100}%` : "0%";
            return (
              <div key={value} className="flex items-center gap-2 text-xs text-[#6F6066]">
                <span className="w-10 shrink-0 text-right">{value} sao</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F2E9EC]">
                  <div className="h-full rounded-full bg-[#E7A52F]" style={{ width }} />
                </div>
                <span className="w-7 text-right text-[#998B91]">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div>
          {loading ? <p className="py-8 text-center text-sm text-[#998B91]">Đang tải đánh giá...</p> : null}
          {!loading && !data.reviews.length ? (
            <div className="rounded-2xl border border-dashed border-[#EAE1E4] px-5 py-10 text-center text-sm text-[#998B91]">
              Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ cảm nhận.
            </div>
          ) : null}
          <div className="divide-y divide-[#EAE1E4]">
            {data.reviews.map((review) => (
              <article key={review.id} className="py-5 first:pt-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-[#4B3F44]">{review.authorName}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Stars rating={review.rating} />
                      <span className="text-xs text-[#998B91]">{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                  {review.updatedAt !== review.createdAt ? <span className="text-xs text-[#998B91]">Đã chỉnh sửa</span> : null}
                </div>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#6F6066]">{review.comment}</p>
              </article>
            ))}
          </div>
          {data.pagination.totalPages > 1 ? (
            <div className="mt-5 flex items-center justify-between border-t border-[#EAE1E4] pt-4">
              <button type="button" disabled={!data.pagination.hasPreviousPage} onClick={() => setPage((current) => current - 1)} className="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-sm font-bold text-[#A43E5F] hover:bg-[#FCEEF3] disabled:opacity-40"><ChevronLeft className="size-4" /> Trước</button>
              <span className="text-xs text-[#998B91]">Trang {data.pagination.page} / {data.pagination.totalPages}</span>
              <button type="button" disabled={!data.pagination.hasNextPage} onClick={() => setPage((current) => current + 1)} className="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-sm font-bold text-[#A43E5F] hover:bg-[#FCEEF3] disabled:opacity-40">Sau <ChevronRight className="size-4" /></button>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-[#EAE1E4] bg-white p-5">
          <h3 className="font-extrabold">{data.myReview ? "Chỉnh sửa đánh giá" : "Viết đánh giá"}</h3>
          {!isInitializing && !isCustomer ? (
            <div className="mt-4">
              <p className="text-sm leading-6 text-[#6F6066]">Đăng nhập bằng tài khoản khách hàng để chia sẻ trải nghiệm của bạn.</p>
              <button type="button" onClick={goToLogin} className="mt-4 h-11 w-full rounded-xl bg-[#D96C8A] px-4 text-sm font-bold text-white hover:bg-[#C85B7B]">Đăng nhập để đánh giá</button>
            </div>
          ) : isCustomer ? (
            <form onSubmit={submit} className="mt-4 space-y-4">
              <div>
                <p className="mb-2 text-sm font-bold">Mức độ hài lòng</p>
                <div className="flex gap-1" role="radiogroup" aria-label="Chọn số sao">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} sao`} onClick={() => setRating(value)} className="rounded-md p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D96C8A]/40"><Star className={`size-6 ${value <= rating ? "fill-[#E7A52F] text-[#E7A52F]" : "text-[#D9CDD1]"}`} /></button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="review-comment" className="mb-2 block text-sm font-bold">Nội dung đánh giá</label>
                <textarea id="review-comment" value={comment} maxLength={maxCommentLength} onChange={(event) => setComment(event.target.value)} rows={5} placeholder="Chia sẻ cảm nhận của bạn..." className="w-full resize-y rounded-xl border border-[#EAE1E4] px-3 py-3 text-sm leading-6 outline-none focus:border-[#D96C8A] focus:ring-4 focus:ring-[#D96C8A]/10" />
                <p className="mt-1 text-right text-xs text-[#998B91]">{comment.length}/{maxCommentLength}</p>
              </div>
              {data.myReview && !data.myReview.isApproved ? <p className="text-xs leading-5 text-[#A43E5F]">Đánh giá này đang được ẩn bởi quản trị viên. Chỉnh sửa sẽ không tự động hiển thị lại đánh giá.</p> : null}
              {error ? <p role="alert" className="text-sm font-semibold text-[#C84F64]">{error}</p> : null}
              {message ? <p role="status" className="text-sm font-semibold text-[#398866]">{message}</p> : null}
              <div className="flex flex-wrap gap-2">
                <button type="submit" disabled={saving || deleting || !comment.trim()} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#D96C8A] px-4 text-sm font-bold text-white hover:bg-[#C85B7B] disabled:cursor-not-allowed disabled:opacity-50">{saving ? <Loader2 className="size-4 animate-spin" /> : data.myReview ? <Pencil className="size-4" /> : null}{saving ? "Đang lưu..." : data.myReview ? "Cập nhật" : "Gửi đánh giá"}</button>
                {data.myReview ? <button type="button" disabled={saving || deleting} onClick={() => void remove()} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#F1CCD5] px-4 text-sm font-bold text-[#C84F64] hover:bg-[#FFF4F6] disabled:opacity-50"><Trash2 className="size-4" /> Xóa</button> : null}
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useAuth } from "@/components/Auth/AuthProvider";
import { buildLoginUrl } from "@/lib/auth/routing";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Star,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

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

type ReviewMutationResponse = {
  review?: Pick<Review, "id" | "rating" | "comment" | "createdAt" | "updatedAt" | "isApproved">;
  message?: string;
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

function reviewWithAuthor(
  review: NonNullable<ReviewMutationResponse["review"]>,
  authorName: string,
): Review {
  return {
    ...review,
    comment: review.comment || "",
    authorName,
  };
}

function summaryAfterAdding(summary: Summary, review: Review): Summary {
  if (!review.isApproved) return summary;
  const breakdown = { ...summary.breakdown };
  const key = String(review.rating) as keyof Summary["breakdown"];
  breakdown[key] += 1;
  const total = summary.total + 1;
  const ratingTotal = Object.entries(breakdown).reduce(
    (sum, [value, count]) => sum + Number(value) * count,
    0,
  );
  return {
    total,
    breakdown,
    average: Math.round((ratingTotal / total) * 10) / 10,
  };
}

function ReviewSectionSkeleton() {
  return (
    <section
      id="reviews"
      aria-label="Đang tải đánh giá sản phẩm"
      aria-busy="true"
      className="mt-16 scroll-mt-24 border-t border-[#EAE1E4] pt-10"
    >
      <div className="space-y-2">
        <div className="h-7 w-56 animate-pulse rounded-lg bg-[#EEE5E8]" />
        <div className="h-4 w-80 max-w-[85vw] animate-pulse rounded bg-[#F2EAED]" />
      </div>
      <div className="mt-7 grid gap-0 overflow-hidden rounded-3xl border border-[#EAE1E4] bg-white lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,1.05fr)]">
        <div className="space-y-5 bg-[#FFF8FA] p-6 sm:p-8">
          <div className="h-12 w-24 animate-pulse rounded-xl bg-[#F3E1E7]" />
          <div className="h-4 w-32 animate-pulse rounded bg-[#F3E1E7]" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <div key={value} className="flex items-center gap-2">
                <div className="h-3 w-10 animate-pulse rounded bg-[#F3E1E7]" />
                <div className="h-2 flex-1 animate-pulse rounded-full bg-[#F3E1E7]" />
                <div className="h-3 w-5 animate-pulse rounded bg-[#F3E1E7]" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-5 p-6 sm:p-8">
          <div className="h-4 w-28 animate-pulse rounded bg-[#EEE5E8]" />
          <div className="h-6 w-48 animate-pulse rounded bg-[#F2EAED]" />
          <div className="h-8 w-40 animate-pulse rounded bg-[#F2EAED]" />
          <div className="h-24 w-full animate-pulse rounded-2xl bg-[#F2EAED]" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-[#F2EAED]" />
        </div>
      </div>
      <div className="mt-8 space-y-3">
        {[1, 2, 3].map((value) => (
          <div key={value} className="rounded-2xl border border-[#EAE1E4] bg-white p-5">
            <div className="h-4 w-32 animate-pulse rounded bg-[#EEE5E8]" />
            <div className="mt-2 h-3 w-24 animate-pulse rounded bg-[#F2EAED]" />
            <div className="mt-4 h-4 w-full animate-pulse rounded bg-[#F2EAED]" />
            <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-[#F2EAED]" />
          </div>
        ))}
      </div>
    </section>
  );
}

function StarRatingInput({
  value,
  onChange,
  disabled,
  describedBy,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  describedBy: string;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      onChange(Math.min(5, value + 1));
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      onChange(Math.max(1, value - 1));
    }
    if (event.key === "Home") {
      event.preventDefault();
      onChange(1);
    }
    if (event.key === "End") {
      event.preventDefault();
      onChange(5);
    }
  };

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Chọn số sao" aria-describedby={describedBy}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} sao`}
          tabIndex={value === star ? 0 : -1}
          disabled={disabled}
          onClick={() => onChange(star)}
          onKeyDown={handleKeyDown}
          className="rounded-lg p-1.5 text-[#D9CDD1] transition hover:scale-105 hover:text-[#E7A52F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D96C8A]/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Star aria-hidden="true" className={`size-7 ${star <= value ? "fill-[#E7A52F] text-[#E7A52F]" : ""}`} />
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({ productIdentifier }: { productIdentifier: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const commentId = useId();
  const ratingHelperId = `${commentId}-rating-helper`;
  const textareaHelperId = `${commentId}-textarea-helper`;
  const errorId = `${commentId}-error`;
  const { isAuthenticated, isInitializing, user } = useAuth();
  const [data, setData] = useState<ReviewResponse>({
    reviews: [],
    summary: emptySummary,
    myReview: null,
    pagination: { page: 1, limit: 5, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const loadReviews = useCallback(
    async (targetPage: number, signal?: AbortSignal) => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/products/${encodeURIComponent(productIdentifier)}/reviews?page=${targetPage}&limit=5`,
          { cache: "no-store", signal },
        );
        const result = (await response.json()) as ReviewResponse | { message?: string };
        if (!response.ok) throw new Error("message" in result ? result.message : undefined);
        const reviewData = result as ReviewResponse;
        setData(reviewData);
        setRating(reviewData.myReview?.rating || 5);
        setComment(reviewData.myReview?.comment || "");
        setError("");
      } catch (loadError: unknown) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setError("Không thể tải đánh giá sản phẩm.");
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [productIdentifier],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadReviews(page, controller.signal);
    return () => controller.abort();
  }, [isAuthenticated, loadReviews, page, user?.id]);

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
    if (data.myReview || submitting) return;
    if (!comment.trim()) {
      setError("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(
        `/api/products/${encodeURIComponent(productIdentifier)}/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating, comment }),
        },
      );
      const result = (await response.json()) as ReviewMutationResponse;
      if (!response.ok || !result.review) {
        setError(result.message || "Không thể gửi đánh giá.");
        return;
      }

      const savedReview = reviewWithAuthor(result.review, user.displayName?.trim() || "Bạn");
      setData((current) => ({
        ...current,
        reviews: [savedReview, ...current.reviews].slice(0, current.pagination.limit),
        summary: summaryAfterAdding(current.summary, savedReview),
        myReview: savedReview,
        pagination: {
          ...current.pagination,
          page: 1,
          total: current.pagination.total + 1,
          totalPages: Math.ceil((current.pagination.total + 1) / current.pagination.limit),
          hasPreviousPage: false,
          hasNextPage: current.pagination.total + 1 > current.pagination.limit,
        },
      }));
      setPage(1);
      setComment("");
      setMessage("Cảm ơn bạn đã chia sẻ trải nghiệm về sản phẩm.");
      void loadReviews(1);
    } catch {
      setError("Không thể kết nối để gửi đánh giá. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const summary = data.summary || emptySummary;
  const isCustomer = isAuthenticated && user?.role === "CUSTOMER";
  const hasSubmittedReview = Boolean(data.myReview);
  const isHiddenReview = Boolean(data.myReview && !data.myReview.isApproved);
  const textareaDescribedBy = error ? `${textareaHelperId} ${errorId}` : textareaHelperId;

  if (loading && data.pagination.total === 0 && !data.myReview) return <ReviewSectionSkeleton />;

  return (
    <section id="reviews" className="mt-16 scroll-mt-24 border-t border-[#EAE1E4] pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#FCEEF3] text-[#D96C8A]"><Star className="size-4 fill-current" aria-hidden="true" /></span>
            <h2 className="text-xl font-extrabold">Đánh giá sản phẩm</h2>
          </div>
          <p className="mt-2 text-sm text-[#998B91]">Cảm nhận thật từ khách hàng Quỳnh Nhi Store.</p>
        </div>
        {summary.total ? <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#6F6066] shadow-sm ring-1 ring-[#EAE1E4]">{summary.total} đánh giá</span> : null}
      </div>

      <div className="mt-7 grid overflow-hidden rounded-3xl border border-[#EAE1E4] bg-white shadow-[0_12px_35px_rgba(113,75,88,0.05)] lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,1.05fr)]">
        <div className="bg-[#FFF8FA] p-5 sm:p-8">
          <div className="flex items-end gap-3">
            <p className="text-5xl font-extrabold leading-none text-[#A43E5F]">{summary.average.toFixed(1)}</p>
            <div className="pb-1"><Stars rating={Math.round(summary.average)} /><p className="mt-1 text-xs text-[#998B91]">{summary.total} lượt đánh giá</p></div>
          </div>
          <div className="mt-7 space-y-2.5" aria-label="Phân bổ số sao">
            {[5, 4, 3, 2, 1].map((value) => {
              const count = summary.breakdown[String(value) as keyof Summary["breakdown"]] || 0;
              const width = summary.total ? `${(count / summary.total) * 100}%` : "0%";
              return <div key={value} className="flex items-center gap-2 text-xs text-[#6F6066]"><span className="w-10 shrink-0 text-right">{value} sao</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F2E1E6]"><div className="h-full rounded-full bg-[#D96C8A] transition-[width] duration-500" style={{ width }} /></div><span className="w-5 text-right text-[#998B91]">{count}</span></div>;
            })}
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#D96C8A]">Trải nghiệm của bạn</p>
          {hasSubmittedReview ? (
            <div className="mt-4 rounded-2xl border border-[#D8EBDD] bg-[#F5FBF6] p-4" role="status"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#398866]" aria-hidden="true" /><div><p className="font-bold text-[#286B4B]">Bạn đã đánh giá sản phẩm này</p><p className="mt-1 text-sm leading-6 text-[#527263]">{isHiddenReview ? "Đánh giá của bạn đang được ẩn theo trạng thái kiểm duyệt." : "Cảm ơn bạn đã dành thời gian chia sẻ cảm nhận."}</p></div></div></div>
          ) : !isInitializing && !isCustomer ? (
            <div className="mt-4"><h3 className="text-lg font-extrabold text-[#4B3F44]">Bạn đã trải nghiệm sản phẩm?</h3><p className="mt-2 text-sm leading-6 text-[#6F6066]">Đăng nhập để chia sẻ cảm nhận của bạn với những khách hàng khác.</p><button type="button" onClick={goToLogin} className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#D96C8A] px-4 text-sm font-bold text-white transition hover:bg-[#C85B7B] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D96C8A]/20">Đăng nhập để đánh giá</button></div>
          ) : isCustomer ? (
            <form onSubmit={submit} className="mt-4 space-y-4">
              <div><div className="flex items-center justify-between gap-3"><label className="text-sm font-bold text-[#4B3F44]" id={`${commentId}-rating-label`}>Mức độ hài lòng</label><span className="rounded-full bg-[#FFF4F6] px-2.5 py-1 text-xs font-bold text-[#A43E5F]" aria-live="polite">{rating}/5 sao</span></div><div className="mt-2"><StarRatingInput value={rating} onChange={setRating} disabled={submitting} describedBy={ratingHelperId} /></div><p id={ratingHelperId} className="mt-1 text-xs text-[#998B91]">Dùng phím mũi tên để thay đổi số sao.</p></div>
              <div><label htmlFor={commentId} className="block text-sm font-bold text-[#4B3F44]">Nội dung đánh giá</label><textarea id={commentId} value={comment} maxLength={maxCommentLength} onChange={(event) => { setComment(event.target.value); if (error) setError(""); }} rows={4} aria-describedby={textareaDescribedBy} aria-invalid={Boolean(error)} placeholder="Sản phẩm có phù hợp với bạn không?" className="mt-2 block min-h-28 w-full resize-y rounded-2xl border border-[#E4D6DB] bg-[#FFFCFD] px-4 py-3 text-sm leading-6 text-[#4B3F44] outline-none transition placeholder:text-[#B2A4A9] focus:border-[#D96C8A] focus:bg-white focus:ring-4 focus:ring-[#D96C8A]/10" /><div className="mt-1 flex items-center justify-between gap-3"><p id={textareaHelperId} className="text-xs text-[#998B91]">Tối đa {maxCommentLength} ký tự.</p><p className="text-xs tabular-nums text-[#998B91]" aria-live="polite">{comment.length}/{maxCommentLength}</p></div></div>
              {error ? <p id={errorId} role="alert" className="rounded-xl bg-[#FFF4F6] px-3 py-2.5 text-sm font-semibold leading-5 text-[#C84F64]">{error}</p> : null}{message ? <p role="status" className="rounded-xl bg-[#F5FBF6] px-3 py-2.5 text-sm font-semibold leading-5 text-[#398866]">{message}</p> : null}
              <button type="submit" disabled={submitting} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#D96C8A] px-4 text-sm font-bold text-white transition hover:bg-[#C85B7B] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D96C8A]/20 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}{submitting ? "Đang gửi đánh giá..." : "Gửi đánh giá"}</button>
              <p className="text-center text-xs text-[#998B91]">Mỗi khách hàng chỉ gửi một đánh giá cho mỗi sản phẩm.</p>
            </form>
          ) : null}
        </div>
      </div>

      <div className="mt-9"><div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-lg font-extrabold text-[#4B3F44]">Khách hàng nói gì?</h3><p className="mt-1 text-sm text-[#998B91]">Các đánh giá mới nhất từ cộng đồng khách hàng.</p></div>{loading ? <span className="text-xs text-[#998B91]">Đang cập nhật...</span> : null}</div>
        {error && !data.reviews.length ? <div className="mt-4 rounded-2xl border border-[#F1CCD5] bg-[#FFF7F8] px-5 py-6 text-center"><p role="alert" className="text-sm font-semibold text-[#C84F64]">{error}</p><button type="button" onClick={() => void loadReviews(page)} className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-[#A43E5F] hover:bg-[#FCEEF3]"><RefreshCw className="size-4" /> Thử lại</button></div> : !data.reviews.length && !loading ? <div className="mt-4 rounded-2xl border border-dashed border-[#E6D4DA] bg-white px-5 py-10 text-center"><Star className="mx-auto size-7 text-[#D96C8A]" aria-hidden="true" /><p className="mt-3 font-bold text-[#4B3F44]">Chưa có đánh giá nào</p><p className="mt-1 text-sm text-[#998B91]">Hãy là người đầu tiên chia sẻ cảm nhận về sản phẩm.</p></div> : <div className="mt-4 space-y-3">{data.reviews.map((review) => <article key={review.id} className="rounded-2xl border border-[#EAE1E4] bg-white px-4 py-4 shadow-[0_8px_25px_rgba(113,75,88,0.03)] sm:px-5"><div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2"><div className="flex min-w-0 items-center gap-2.5"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#FCEEF3] text-xs font-extrabold text-[#A43E5F]">{review.authorName.slice(0, 1).toUpperCase()}</span><p className="truncate font-bold text-[#4B3F44]">{review.authorName}</p></div><div className="flex items-center gap-2"><Stars rating={review.rating} size="size-3.5" /><span className="text-xs text-[#998B91]">{formatDate(review.createdAt)}</span></div></div><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#6F6066]">{review.comment}</p></article>)}</div>}
        {data.pagination.totalPages > 1 ? <div className="mt-5 flex items-center justify-between border-t border-[#EAE1E4] pt-4"><button type="button" disabled={!data.pagination.hasPreviousPage || loading} onClick={() => setPage((current) => current - 1)} className="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-sm font-bold text-[#A43E5F] hover:bg-[#FCEEF3] disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="size-4" /> Trước</button><span className="text-xs text-[#998B91]">Trang {data.pagination.page} / {data.pagination.totalPages}</span><button type="button" disabled={!data.pagination.hasNextPage || loading} onClick={() => setPage((current) => current + 1)} className="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-sm font-bold text-[#A43E5F] hover:bg-[#FCEEF3] disabled:cursor-not-allowed disabled:opacity-40">Sau <ChevronRight className="size-4" /></button></div> : null}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import {
  AdminPageContainer,
  AdminPageHeader,
  AdminSection,
} from "@/components/Admin/AdminPage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const STEPS = [
  "Tải file mẫu",
  "Tải file lên",
  "Kiểm tra dữ liệu",
  "Xác nhận nhập",
  "Kết quả",
] as const;

type JobStatus =
  | "UPLOADED"
  | "VALIDATING"
  | "READY"
  | "PROCESSING"
  | "COMPLETED"
  | "PARTIALLY_COMPLETED"
  | "FAILED";

type PreviewItem = {
  productKey: string;
  name: string;
  slug: string;
  status: string | null;
  variants: number;
  variantGroups: Array<{ color: string; sizes: string[] }>;
  images: number;
  state: "VALID" | "ERROR" | "WARNING";
  errors: Array<{ message: string; severity: "ERROR" | "WARNING" }>;
};

type JobDetail = {
  job: {
    id: string;
    fileName: string;
    status: JobStatus;
    mode: "CREATE_ONLY";
    createMissingCategories: boolean;
    forcePrivate: boolean;
    totalProducts: number;
    totalVariants: number;
    totalImages: number;
    processed: number;
    succeeded: number;
    failed: number;
    skipped: number;
  };
  totals: {
    products: number;
    valid: number;
    invalid: number;
    warnings: number;
    variants: number;
    images: number;
    categoriesToCreate: number;
  } | null;
  preview: PreviewItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  errorCount: number;
  warningCount: number;
};

type RecentJob = Pick<
  JobDetail["job"],
  | "id"
  | "fileName"
  | "status"
  | "totalProducts"
  | "processed"
  | "succeeded"
  | "failed"
  | "skipped"
>;

const terminalStatuses: JobStatus[] = [
  "COMPLETED",
  "PARTIALLY_COMPLETED",
  "FAILED",
];

const stateStyle = {
  VALID: "bg-emerald-50 text-emerald-700",
  ERROR: "bg-rose-50 text-rose-700",
  WARNING: "bg-amber-50 text-amber-700",
};
const stateLabel = { VALID: "Hợp lệ", ERROR: "Có lỗi", WARNING: "Cảnh báo" };

export default function ProductImportWizard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [createMissingCategories, setCreateMissingCategories] = useState(false);
  const [forcePrivate, setForcePrivate] = useState(true);
  const [jobId, setJobId] = useState<string | null>(null);
  const [detail, setDetail] = useState<JobDetail | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadRecentJobs = useCallback(async () => {
    const response = await fetch("/api/product-imports", { cache: "no-store" });
    if (!response.ok) return;
    const payload = (await response.json()) as { data: RecentJob[] };
    setRecentJobs(payload.data);
  }, []);

  const loadJob = useCallback(
    async (
      id: string,
      options?: { page?: number; filter?: string; search?: string },
    ) => {
      const params = new URLSearchParams({
        page: String(options?.page ?? page),
        limit: "25",
        filter: options?.filter ?? filter,
        search: options?.search ?? search,
      });
      const response = await fetch(`/api/product-imports/${id}?${params}`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Không thể tải phiên nhập.");
      const payload = (await response.json()) as JobDetail;
      setDetail(payload);
      return payload;
    },
    [filter, page, search],
  );

  useEffect(() => {
    void loadRecentJobs();
  }, [loadRecentJobs]);

  useEffect(() => {
    if (!jobId || step !== 3) return;
    const timeout = window.setTimeout(() => {
      void loadJob(jobId).catch(() =>
        setMessage("Không thể cập nhật bảng kiểm tra."),
      );
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [jobId, step, page, filter, search, loadJob]);

  const chooseFile = (selected: File | null) => {
    setMessage(null);
    if (!selected) return;
    if (!selected.name.toLowerCase().endsWith(".xlsx")) {
      setMessage("Chỉ hỗ trợ file .xlsx.");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setMessage("File không được vượt quá 10 MB.");
      return;
    }
    setFile(selected);
  };

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    setMessage(null);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("createMissingCategories", String(createMissingCategories));
    formData.set("forcePrivate", String(forcePrivate));
    try {
      const response = await fetch("/api/product-imports", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        jobId?: string;
        message?: string;
      };
      if (!response.ok || !payload.jobId)
        throw new Error(payload.message || "Không thể kiểm tra file Excel.");
      setJobId(payload.jobId);
      const loaded = await loadJob(payload.jobId, {
        page: 1,
        filter: "ALL",
        search: "",
      });
      setStep(loaded.job.status === "FAILED" ? 3 : 3);
      setPage(1);
      setFilter("ALL");
      setSearch("");
      await loadRecentJobs();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể tải file.",
      );
    } finally {
      setBusy(false);
    }
  };

  const openJob = async (job: RecentJob) => {
    setBusy(true);
    setMessage(null);
    try {
      setJobId(job.id);
      const loaded = await loadJob(job.id, {
        page: 1,
        filter: "ALL",
        search: "",
      });
      setStep(
        terminalStatuses.includes(loaded.job.status) ||
          loaded.job.status === "PROCESSING"
          ? 5
          : 3,
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể mở phiên nhập.",
      );
    } finally {
      setBusy(false);
    }
  };

  const processBatches = async (id: string) => {
    setProcessing(true);
    setMessage(null);
    try {
      let status: JobStatus = "PROCESSING";
      while (status === "PROCESSING") {
        const response = await fetch(`/api/product-imports/${id}/process`, {
          method: "POST",
        });
        const payload = (await response.json()) as {
          status?: JobStatus;
          message?: string;
        };
        if (!response.ok) {
          if (response.status === 409) {
            const loaded = await loadJob(id);
            status = loaded.job.status;
            break;
          }
          throw new Error(payload.message || "Không thể xử lý lô sản phẩm.");
        }
        status = payload.status || "PROCESSING";
        await loadJob(id);
      }
      await loadJob(id);
      await loadRecentJobs();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Quá trình nhập bị gián đoạn. Bạn có thể tiếp tục lại.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const confirmImport = async () => {
    if (!jobId) return;
    setBusy(true);
    setConfirmOpen(false);
    try {
      const response = await fetch(`/api/product-imports/${jobId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed: true }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok)
        throw new Error(payload.message || "Không thể xác nhận phiên nhập.");
      setStep(5);
      await loadJob(jobId);
      await processBatches(jobId);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Không thể bắt đầu nhập.",
      );
    } finally {
      setBusy(false);
    }
  };

  const retryFailed = async () => {
    if (!jobId) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/product-imports/${jobId}/retry`, {
        method: "POST",
      });
      const payload = (await response.json()) as {
        jobId?: string;
        message?: string;
      };
      if (!response.ok || !payload.jobId)
        throw new Error(payload.message || "Không thể tạo phiên thử lại.");
      setJobId(payload.jobId);
      await loadJob(payload.jobId, { page: 1, filter: "ALL", search: "" });
      setStep(4);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể thử lại.");
    } finally {
      setBusy(false);
    }
  };

  const progress = detail?.job.totalProducts
    ? Math.min(
        100,
        Math.round((detail.job.processed / detail.job.totalProducts) * 100),
      )
    : 0;

  return (
    <AdminPageContainer className="max-w-6xl">
      <AdminPageHeader
        title="Nhập sản phẩm từ Excel"
        description="Kiểm tra toàn bộ dữ liệu trước, sau đó nhập theo từng sản phẩm an toàn."
        breadcrumb={
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1 hover:text-(--admin-primary)"
          >
            <ArrowLeft className="size-3.5" /> Sản phẩm
          </Link>
        }
      />

      <nav
        aria-label="Tiến trình nhập"
        className="grid grid-cols-5 gap-1 rounded-2xl border border-(--admin-border) bg-white p-2 sm:gap-2 sm:p-3"
      >
        {STEPS.map((label, index) => {
          const number = index + 1;
          const active = step === number;
          const completed = step > number;
          return (
            <div
              key={label}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-center sm:flex-row sm:justify-center sm:px-2",
                active && "bg-(--admin-primary-soft)",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  active || completed
                    ? "bg-(--admin-primary) text-white"
                    : "bg-slate-100 text-slate-400",
                )}
              >
                {completed ? <Check className="size-4" /> : number}
              </span>
              <span
                className={cn(
                  "hidden truncate text-xs font-semibold md:block",
                  active
                    ? "text-(--admin-primary)"
                    : "text-(--admin-text-muted)",
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </nav>

      {message ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Cần kiểm tra lại</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      {step === 1 ? (
        <AdminSection>
          <div className="mx-auto max-w-3xl">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-(--admin-primary-soft) text-(--admin-primary)">
              <FileSpreadsheet className="size-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-(--admin-text)">
              Chuẩn bị file theo mẫu chuẩn
            </h2>
            <p className="mt-2 text-sm leading-6 text-(--admin-text-secondary)">
              Mỗi sheet bắt đầu bằng SP- là một sản phẩm, bên trong có thông
              tin, biến thể và hình ảnh. Không đổi tên sheet hoặc các field liên
              kết.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                "Tối đa 5.000 sản phẩm / 20.000 dòng / 10 MB",
                "Status: PUBLIC, PRIVATE, DISCONTINUED",
                "Giá VND và tồn kho phải là số nguyên",
                "SKU và stable key luôn nhập dưới dạng text",
                "Mỗi sản phẩm là một sheet riêng, dễ sao chép và quản lý",
                "Upload chỉ validate, chưa tạo sản phẩm",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-2 rounded-xl bg-(--admin-surface-subtle) p-3 text-sm text-(--admin-text-secondary)"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />{" "}
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button
                asChild
                variant="adminPrimary"
                className="h-10 rounded-lg"
              >
                <a href="/api/product-imports/template" download>
                  <Download className="size-4" /> Tải file Excel mẫu
                </a>
              </Button>
              <Button
                variant="ghost"
                className="h-10 rounded-lg border border-(--admin-border)"
                onClick={() => setStep(2)}
              >
                Tôi đã có file <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
          {recentJobs.length ? (
            <div className="mt-8 border-t border-(--admin-border) pt-5">
              <h3 className="text-sm font-semibold text-(--admin-text)">
                Phiên nhập gần đây
              </h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {recentJobs.slice(0, 4).map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => void openJob(job)}
                    className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-(--admin-border) p-3 text-left hover:border-(--admin-primary-border) hover:bg-(--admin-primary-soft)"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-(--admin-text)">
                        {job.fileName}
                      </span>
                      <span className="mt-1 block text-xs text-(--admin-text-muted)">
                        {job.processed}/{job.totalProducts} · {job.status}
                      </span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-(--admin-primary)" />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </AdminSection>
      ) : null}

      {step === 2 ? (
        <AdminSection>
          <h2 className="text-lg font-semibold text-(--admin-text)">
            Tải file .xlsx lên
          </h2>
          <div
            className={cn(
              "mt-4 flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
              dragging
                ? "border-(--admin-primary) bg-(--admin-primary-soft)"
                : "border-(--admin-border) bg-(--admin-surface-subtle) hover:border-(--admin-primary-border)",
            )}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              chooseFile(event.dataTransfer.files[0] || null);
            }}
          >
            <UploadCloud className="size-9 text-(--admin-primary)" />
            <p className="mt-3 font-semibold text-(--admin-text)">
              {file ? file.name : "Kéo thả file vào đây hoặc bấm để chọn"}
            </p>
            <p className="mt-1 text-xs text-(--admin-text-muted)">
              {file
                ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                : ".xlsx · tối đa 10 MB"}
            </p>
            <Input
              standalone
              ref={fileInputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              classNameContainer="hidden"
              onChange={(event) => chooseFile(event.target.files?.[0] || null)}
            />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-(--admin-border) p-4">
              <input
                type="checkbox"
                checked={createMissingCategories}
                onChange={(event) =>
                  setCreateMissingCategories(event.target.checked)
                }
                className="mt-0.5 size-4 accent-[#D96C8A]"
              />
              <span>
                <span className="block text-sm font-semibold text-(--admin-text)">
                  Tạo danh mục còn thiếu
                </span>
                <span className="mt-1 block text-xs leading-5 text-(--admin-text-muted)">
                  Chỉ tạo các danh mục đã khai báo hợp lệ trong sheet Danh mục.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-(--admin-border) p-4">
              <input
                type="checkbox"
                checked={forcePrivate}
                onChange={(event) => setForcePrivate(event.target.checked)}
                className="mt-0.5 size-4 accent-[#D96C8A]"
              />
              <span>
                <span className="block text-sm font-semibold text-(--admin-text)">
                  Ép tất cả về Riêng tư
                </span>
                <span className="mt-1 block text-xs leading-5 text-(--admin-text-muted)">
                  Khuyến nghị để rà soát trước khi công khai.
                </span>
              </span>
            </label>
          </div>
          <div className="mt-6 flex justify-between gap-2">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ChevronLeft className="size-4" /> Quay lại
            </Button>
            <Button
              variant="adminPrimary"
              disabled={!file || busy}
              onClick={() => void upload()}
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UploadCloud className="size-4" />
              )}{" "}
              Tải lên và kiểm tra
            </Button>
          </div>
        </AdminSection>
      ) : null}

      {step === 3 && detail ? (
        <AdminSection className="p-0 sm:p-0">
          <div className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-(--admin-text)">
                  Kết quả kiểm tra
                </h2>
                <p className="mt-1 text-sm text-(--admin-text-muted)">
                  {detail.job.fileName}
                </p>
              </div>
              {detail.errorCount ? (
                <Button
                  asChild
                  variant="ghost"
                  className="border border-(--admin-border)"
                >
                  <a
                    href={`/api/product-imports/${detail.job.id}/errors`}
                    download
                  >
                    <Download className="size-4" /> Tải file lỗi
                  </a>
                </Button>
              ) : null}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                [
                  "Tổng sản phẩm",
                  detail.totals?.products || 0,
                  "text-(--admin-text)",
                ],
                ["Hợp lệ", detail.totals?.valid || 0, "text-emerald-600"],
                ["Có lỗi", detail.totals?.invalid || 0, "text-rose-600"],
                ["Cảnh báo", detail.totals?.warnings || 0, "text-amber-600"],
              ].map(([label, value, color]) => (
                <div
                  key={String(label)}
                  className="rounded-xl bg-(--admin-surface-subtle) p-3"
                >
                  <p className="text-xs text-(--admin-text-muted)">{label}</p>
                  <p
                    className={cn(
                      "mt-1 text-xl font-bold tabular-nums",
                      String(color),
                    )}
                  >
                    {Number(value).toLocaleString("vi-VN")}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {[
                  ["ALL", "Tất cả"],
                  ["VALID", "Hợp lệ"],
                  ["ERROR", "Có lỗi"],
                  ["WARNING", "Cảnh báo"],
                ].map(([value, label]) => (
                  <Button
                    key={value}
                    size="sm"
                    variant="ghost"
                    className={cn(
                      "rounded-full border",
                      filter === value
                        ? "border-(--admin-primary-border) bg-(--admin-primary-soft) text-(--admin-primary)"
                        : "border-(--admin-border)",
                    )}
                    onClick={() => {
                      setFilter(value);
                      setPage(1);
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
              <Input
                standalone
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Tìm key, tên hoặc slug"
                className="h-9 rounded-lg border-(--admin-border) px-3 sm:w-64"
              />
            </div>
          </div>
          <div className="hidden max-h-120 overflow-auto border-y border-(--admin-border) md:block">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white">
                <TableRow>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>product_key</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Biến thể</TableHead>
                  <TableHead>Ảnh</TableHead>
                  <TableHead>Chi tiết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.preview.map((item) => (
                  <TableRow key={item.productKey}>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-semibold",
                          stateStyle[item.state],
                        )}
                      >
                        {stateLabel[item.state]}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {item.productKey}
                    </TableCell>
                    <TableCell className="max-w-56 truncate font-medium">
                      {item.name}
                    </TableCell>
                    <TableCell>{item.status || "—"}</TableCell>
                    <TableCell className="whitespace-normal">
                      <p className="font-semibold">{item.variants} biến thể</p>
                      {item.variantGroups.map((group) => (
                        <p
                          key={group.color}
                          className="mt-1 text-xs text-(--admin-text-muted)"
                        >
                          <span className="font-medium text-(--admin-text)">
                            {group.color}:
                          </span>{" "}
                          {group.sizes.join(", ") || "Không size"}
                        </p>
                      ))}
                    </TableCell>
                    <TableCell>{item.images}</TableCell>
                    <TableCell className="max-w-80 whitespace-normal text-xs text-(--admin-text-muted)">
                      {item.errors.map((error) => error.message).join(" · ") ||
                        "Sẵn sàng nhập"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="grid gap-3 border-y border-(--admin-border) p-4 md:hidden">
            {detail.preview.map((item) => (
              <article
                key={item.productKey}
                className="rounded-xl border border-(--admin-border) p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-(--admin-text)">
                      {item.name}
                    </p>
                    <p className="mt-1 font-mono text-xs text-(--admin-text-muted)">
                      {item.productKey}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-1 text-xs font-semibold",
                      stateStyle[item.state],
                    )}
                  >
                    {stateLabel[item.state]}
                  </span>
                </div>
                <p className="mt-3 text-xs text-(--admin-text-muted)">
                  {item.status || "Chưa rõ status"} · {item.variants} biến thể ·{" "}
                  {item.images} ảnh
                </p>
                {item.variantGroups.length ? (
                  <div className="mt-2 space-y-1 rounded-lg bg-(--admin-surface-subtle) p-2 text-xs">
                    {item.variantGroups.map((group) => (
                      <p key={group.color}>
                        <span className="font-semibold">{group.color}:</span>{" "}
                        {group.sizes.join(", ") || "Không size"}
                      </p>
                    ))}
                  </div>
                ) : null}
                {item.errors.length ? (
                  <p className="mt-2 text-xs leading-5 text-rose-600">
                    {item.errors.map((error) => error.message).join(" · ")}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-center gap-2 text-xs text-(--admin-text-muted)">
              <span>
                Trang {detail.pagination.page}/
                {Math.max(1, detail.pagination.totalPages)}
              </span>
              <Button
                size="icon-sm"
                variant="ghost"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                <ChevronLeft />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                disabled={page >= detail.pagination.totalPages}
                onClick={() => setPage((value) => value + 1)}
              >
                <ChevronRight />
              </Button>
            </div>
            <Button
              variant="adminPrimary"
              disabled={detail.job.status !== "READY" || !detail.totals?.valid}
              onClick={() => setStep(4)}
            >
              Tiếp tục xác nhận <ChevronRight className="size-4" />
            </Button>
          </div>
        </AdminSection>
      ) : null}

      {step === 4 && detail ? (
        <AdminSection>
          <h2 className="text-lg font-semibold text-(--admin-text)">
            Xác nhận nhập sản phẩm
          </h2>
          <p className="mt-2 text-sm leading-6 text-(--admin-text-secondary)">
            Chỉ sản phẩm hợp lệ được tạo. Mỗi sản phẩm dùng một transaction
            riêng; lỗi ở sản phẩm khác không làm rollback toàn bộ job.
          </p>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Sản phẩm sẽ tạo", detail.totals?.valid || 0],
              ["Biến thể trong file", detail.job.totalVariants],
              ["URL hình ảnh", detail.job.totalImages],
              ["Danh mục sẽ tạo", detail.totals?.categoriesToCreate || 0],
              ["Chế độ", "Chỉ tạo mới"],
              [
                "Trạng thái an toàn",
                detail.job.forcePrivate ? "Ép Riêng tư" : "Theo file",
              ],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-xl border border-(--admin-border) p-4"
              >
                <dt className="text-xs text-(--admin-text-muted)">{label}</dt>
                <dd className="mt-1 font-semibold text-(--admin-text)">
                  {typeof value === "number"
                    ? value.toLocaleString("vi-VN")
                    : value}
                </dd>
              </div>
            ))}
          </dl>
          {detail.totals?.warnings ? (
            <Alert variant="warning" className="mt-5">
              <AlertCircle />
              <AlertTitle>
                Có {detail.totals.warnings} sản phẩm cần lưu ý
              </AlertTitle>
              <AlertDescription>
                Cảnh báo không chặn nhập, nhưng bạn nên rà soát trước khi xác
                nhận.
              </AlertDescription>
            </Alert>
          ) : null}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button variant="ghost" onClick={() => setStep(3)}>
              <ChevronLeft className="size-4" /> Quay lại kiểm tra
            </Button>
            <Button variant="adminPrimary" onClick={() => setConfirmOpen(true)}>
              Xác nhận nhập {detail.totals?.valid || 0} sản phẩm
            </Button>
          </div>
        </AdminSection>
      ) : null}

      {step === 5 && detail ? (
        <AdminSection>
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-(--admin-primary-soft) text-(--admin-primary)">
              {detail.job.status === "PROCESSING" ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <CheckCircle2 className="size-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-(--admin-text)">
                {detail.job.status === "PROCESSING"
                  ? "Đang nhập sản phẩm"
                  : "Kết quả nhập sản phẩm"}
              </h2>
              <p className="mt-1 text-sm text-(--admin-text-muted)">
                {detail.job.fileName}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-xs font-medium text-(--admin-text-muted)">
              <span>
                {detail.job.processed.toLocaleString("vi-VN")} /{" "}
                {detail.job.totalProducts.toLocaleString("vi-VN")}
              </span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["Thành công", detail.job.succeeded, "text-emerald-600"],
              ["Thất bại", detail.job.failed, "text-rose-600"],
              ["Bỏ qua", detail.job.skipped, "text-amber-600"],
              [
                "Đang xử lý",
                Math.max(0, detail.job.totalProducts - detail.job.processed),
                "text-(--admin-primary)",
              ],
            ].map(([label, value, color]) => (
              <div
                key={String(label)}
                className="rounded-xl bg-(--admin-surface-subtle) p-3"
              >
                <p className="text-xs text-(--admin-text-muted)">{label}</p>
                <p
                  className={cn(
                    "mt-1 text-xl font-bold tabular-nums",
                    String(color),
                  )}
                >
                  {Number(value).toLocaleString("vi-VN")}
                </p>
              </div>
            ))}
          </div>
          {detail.job.status === "PROCESSING" && !processing ? (
            <Alert variant="info" className="mt-5">
              <RefreshCw />
              <AlertTitle>Phiên nhập có thể tiếp tục</AlertTitle>
              <AlertDescription>
                Tiến độ đã được lưu trên server. Bạn có thể đóng trang và quay
                lại tiếp tục từ lô kế tiếp.
              </AlertDescription>
            </Alert>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-2">
            {detail.job.status === "PROCESSING" ? (
              <Button
                variant="adminPrimary"
                disabled={processing}
                onClick={() => jobId && void processBatches(jobId)}
              >
                {processing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}{" "}
                {processing ? "Đang xử lý" : "Tiếp tục xử lý"}
              </Button>
            ) : null}
            <Button
              asChild
              variant="ghost"
              className="border border-(--admin-border)"
            >
              <Link href="/admin/products">Xem sản phẩm</Link>
            </Button>
            {detail.errorCount ? (
              <Button
                asChild
                variant="ghost"
                className="border border-(--admin-border)"
              >
                <a
                  href={`/api/product-imports/${detail.job.id}/errors`}
                  download
                >
                  <Download className="size-4" /> Tải file lỗi
                </a>
              </Button>
            ) : null}
            {detail.job.failed > 0 ? (
              <Button
                variant="ghost"
                className="border border-(--admin-border)"
                disabled={busy}
                onClick={() => void retryFailed()}
              >
                <RefreshCw className="size-4" /> Thử lại lỗi xử lý
              </Button>
            ) : null}
            <Button
              variant="ghost"
              onClick={() => {
                setStep(1);
                setJobId(null);
                setDetail(null);
                setFile(null);
              }}
            >
              Tạo phiên nhập mới
            </Button>
          </div>
        </AdminSection>
      ) : null}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="w-[calc(100%-2rem)] rounded-2xl border border-(--admin-border) p-5 shadow-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận ghi dữ liệu?</DialogTitle>
            <DialogDescription className="pt-2 leading-6">
              Hệ thống sẽ bắt đầu tạo {detail?.totals?.valid || 0} sản phẩm hợp
              lệ. Thao tác tạo mới không ghi đè sản phẩm hiện có.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-5 gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="adminPrimary"
              disabled={busy}
              onClick={() => void confirmImport()}
            >
              Tôi xác nhận nhập
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPageContainer>
  );
}

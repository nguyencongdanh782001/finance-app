"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  ExternalLink,
  LoaderCircle,
  MessageCircle,
  Send,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import type {
  ChatAssistantReply,
  ProductContext,
} from "@/lib/chat-assistant/types";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  reply?: ChatAssistantReply;
};

const STORAGE_KEY = "quynh-nhi-store-chat-v1";
const MAX_STORED_MESSAGES = 30;
const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Chào bạn! Mình có thể giúp tìm sản phẩm, kiểm tra giá, màu, size, tồn kho và chính sách cửa hàng.",
};
const STARTER_SUGGESTIONS = [
  "Tìm sản phẩm",
  "Chính sách đổi trả",
  "Phí vận chuyển",
  "Liên hệ cửa hàng",
];

function initialMessages() {
  if (typeof window === "undefined") return [WELCOME];
  try {
    const stored = JSON.parse(
      window.sessionStorage.getItem(STORAGE_KEY) || "null",
    ) as unknown;
    if (!Array.isArray(stored)) return [WELCOME];
    const valid = stored.filter((item): item is ChatMessage =>
      Boolean(
        item &&
        typeof item === "object" &&
        "id" in item &&
        "role" in item &&
        "text" in item &&
        typeof item.id === "string" &&
        (item.role === "assistant" || item.role === "user") &&
        typeof item.text === "string",
      ),
    );
    return valid.length ? valid.slice(-MAX_STORED_MESSAGES) : [WELCOME];
  } catch {
    return [WELCOME];
  }
}

function productContext(pathname: string): ProductContext | undefined {
  const match = pathname.match(/^\/products\/([^/?#]+)/);
  if (!match) return undefined;
  const identifier = decodeURIComponent(match[1]);
  const id = Number(identifier);
  return Number.isInteger(id) && id > 0 ? { id } : { slug: identifier };
}

function conversationProductContext(
  messages: ChatMessage[],
): ProductContext | undefined {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const products = messages[index].reply?.products;
    if (!products?.length) continue;
    return products.length === 1 ? { id: products[0].id } : undefined;
  }
  return undefined;
}

export default function CustomerChatAssistant() {
  const pathname = usePathname();
  const raisedLauncher =
    pathname === "/cart" ||
    pathname === "/checkout" ||
    /^\/products\/[^/]+/.test(pathname);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)),
    );
    const frame = window.requestAnimationFrame(() => {
      messagesRef.current?.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: messages.length > 1 ? "smooth" : "auto",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [messages, loading]);

  useEffect(() => {
    if (!open) return;
    const isMobile = window.matchMedia("(max-width: 639px)").matches;
    const previousOverflow = document.body.style.overflow;
    const previousOverscrollBehavior = document.body.style.overscrollBehavior;
    const syncMobileViewport = () => {
      if (!isMobile || !rootRef.current) return;
      const viewport = window.visualViewport;
      rootRef.current.style.setProperty(
        "--chat-mobile-height",
        `${viewport?.height || window.innerHeight}px`,
      );
      rootRef.current.style.setProperty(
        "--chat-mobile-top",
        `${viewport?.offsetTop || 0}px`,
      );
      window.requestAnimationFrame(() => {
        messagesRef.current?.scrollTo({
          top: messagesRef.current.scrollHeight,
          behavior: "auto",
        });
      });
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    if (isMobile) {
      document.body.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "none";
      syncMobileViewport();
      window.visualViewport?.addEventListener("resize", syncMobileViewport);
      window.visualViewport?.addEventListener("scroll", syncMobileViewport);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    if (!isMobile) inputRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscrollBehavior;
      window.visualViewport?.removeEventListener("resize", syncMobileViewport);
      window.visualViewport?.removeEventListener("scroll", syncMobileViewport);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const ask = async (rawQuestion: string) => {
    const question = rawQuestion.trim();
    if (!question || loading) return;
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: question,
    };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("/api/chat-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          context:
            productContext(pathname) || conversationProductContext(messages),
        }),
      });
      const data = (await response.json().catch(() => null)) as
        (Partial<ChatAssistantReply> & { message?: string }) | null;
      if (!response.ok || !data?.message) {
        throw new Error(data?.message || "Không thể nhận phản hồi.");
      }
      const reply = data as ChatAssistantReply;
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: reply.message,
          reply,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          text:
            error instanceof Error
              ? error.message
              : "Trợ lý đang tạm gián đoạn. Bạn vui lòng thử lại.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void ask(input);
  };

  return (
    <div
      ref={rootRef}
      className={
        open
          ? "fixed inset-x-0 top-[var(--chat-mobile-top,0px)] z-[70] h-[var(--chat-mobile-height,100dvh)] sm:inset-auto sm:bottom-6 sm:right-6 sm:top-auto sm:h-auto"
          : `fixed right-3 z-[70] sm:bottom-6 sm:right-6 ${
              raisedLauncher
                ? "bottom-24"
                : "bottom-[max(1.25rem,env(safe-area-inset-bottom))]"
            }`
      }
    >
      {open ? (
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="customer-chat-title"
          className="flex h-full w-full animate-in flex-col overflow-hidden bg-[#FFFCFD] duration-200 fade-in-0 slide-in-from-bottom-4 motion-reduce:animate-none sm:h-[min(600px,calc(100dvh-3rem))] sm:w-[390px] sm:rounded-[26px] sm:border sm:border-[#E9DDE1] sm:shadow-[0_22px_70px_rgba(67,34,45,0.22)] sm:zoom-in-95"
        >
          <header className="flex shrink-0 items-center gap-3 border-b border-[#F0E5E8] bg-white px-4 pb-3 pt-[max(.75rem,env(safe-area-inset-top))] sm:py-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-[#FCE9EF] text-[#B74769] sm:size-11 sm:rounded-2xl">
              <Bot size={22} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2
                  id="customer-chat-title"
                  className="truncate text-[15px] font-extrabold text-[#2D2226]"
                >
                  Trợ lý mua sắm
                </h2>
                <Sparkles
                  size={14}
                  className="text-[#D96C8A]"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#8B7C82] sm:text-xs">
                <span className="size-1.5 rounded-full bg-[#45A978]" />
                Sẵn sàng hỗ trợ bạn
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid size-11 shrink-0 touch-manipulation place-items-center rounded-full border border-[#E9DDE1] text-[#65545B] transition active:scale-95 hover:border-[#D96C8A] hover:bg-[#FFF4F7] hover:text-[#A43E5F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D96C8A] sm:size-10"
              aria-label="Đóng trợ lý mua sắm"
            >
              <X size={19} aria-hidden="true" />
            </button>
          </header>

          <div
            ref={messagesRef}
            className="min-h-0 flex-1 overscroll-contain overflow-y-auto scroll-smooth px-3 py-4 [scrollbar-width:thin] [scrollbar-color:#E7D9DE_transparent] sm:px-4 sm:py-5"
            aria-live="polite"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-3 ${message.role === "user" ? "ml-12" : "mr-3 sm:mr-5"}`}
              >
                <div
                  className={
                    message.role === "user"
                      ? "ml-auto w-fit max-w-full rounded-2xl rounded-br-md bg-[#D96C8A] px-3.5 py-2.5 text-[14px] leading-5.5 text-white sm:px-4 sm:py-3 sm:leading-6"
                      : "rounded-2xl rounded-bl-md border border-[#EFE4E7] bg-white px-3.5 py-2.5 text-[14px] leading-5.5 whitespace-pre-line text-[#4C3D43] shadow-[0_5px_18px_rgba(67,34,45,0.05)] sm:px-4 sm:py-3 sm:leading-6"
                  }
                >
                  {message.text}
                </div>
                {message.reply?.products?.length ? (
                  <div className="mt-2 grid gap-2">
                    {message.reply.products.map((product) => (
                      <Link
                        key={product.id}
                        href={product.href}
                        onClick={() => setOpen(false)}
                        className="group flex min-h-20 touch-manipulation gap-3 rounded-2xl border border-[#EADDE1] bg-white p-2.5 transition active:scale-[.99] hover:border-[#D96C8A] hover:shadow-sm"
                      >
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="size-16 shrink-0 rounded-xl bg-[#F5EFF1] object-cover"
                        />
                        <span className="min-w-0 flex-1 py-0.5">
                          <span className="line-clamp-2 text-sm font-bold leading-5 text-[#2D2226] group-hover:text-[#A43E5F]">
                            {product.title}
                          </span>
                          <span className="mt-1 block text-xs font-bold text-[#B74769]">
                            {product.priceLabel}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-[#85767C]">
                            {product.availabilityLabel}
                          </span>
                        </span>
                        <ExternalLink
                          size={14}
                          className="mt-1 shrink-0 text-[#A9989F]"
                          aria-hidden="true"
                        />
                      </Link>
                    ))}
                  </div>
                ) : null}
                {message.reply?.policyLinks?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.reply.policyLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="inline-flex min-h-10 touch-manipulation items-center gap-1.5 rounded-full border border-[#E5CBD3] bg-white px-3 text-xs font-bold text-[#A43E5F] active:scale-[.98] hover:bg-[#FFF3F6] sm:min-h-9"
                      >
                        {link.title}
                        <ExternalLink size={12} aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {loading ? (
              <div className="mr-20 flex w-fit items-center gap-2 rounded-2xl rounded-bl-md border border-[#EFE4E7] bg-white px-4 py-3 text-sm text-[#7A6C72]">
                <LoaderCircle
                  size={16}
                  className="animate-spin text-[#D96C8A]"
                  aria-hidden="true"
                />
                Đang kiểm tra dữ liệu…
              </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-[#F0E5E8] bg-white px-3 pb-[max(.75rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_24px_rgba(67,34,45,0.04)] sm:pt-3">
            <div className="mb-2 flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(messages.at(-1)?.reply?.suggestions || STARTER_SUGGESTIONS)
                .slice(0, 4)
                .map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={loading}
                    onClick={() => void ask(suggestion)}
                    className="min-h-9 shrink-0 snap-start touch-manipulation rounded-full border border-[#E9DDE1] bg-[#FFF9FA] px-3 text-xs font-semibold text-[#765F68] transition active:scale-[.98] hover:border-[#D96C8A] hover:text-[#A43E5F] disabled:opacity-50 sm:min-h-8"
                  >
                    {suggestion}
                  </button>
                ))}
            </div>
            <form
              onSubmit={submit}
              className="flex min-h-13 items-center gap-2 rounded-2xl border border-[#DFCFD4] bg-[#FFFCFD] p-1.5 focus-within:border-[#D96C8A] focus-within:ring-2 focus-within:ring-[#F8DCE5]"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value.slice(0, 500))}
                maxLength={500}
                autoComplete="off"
                enterKeyHint="send"
                placeholder="Hỏi về sản phẩm, chính sách…"
                className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-base text-[#2D2226] outline-none placeholder:text-[#A9989F] sm:text-sm"
                aria-label="Nhập câu hỏi cho trợ lý mua sắm"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="grid size-11 shrink-0 touch-manipulation place-items-center rounded-xl bg-[#D96C8A] text-white transition active:scale-95 hover:bg-[#C95B7C] disabled:cursor-not-allowed disabled:opacity-45 sm:size-10"
                aria-label="Gửi câu hỏi"
              >
                <Send size={17} aria-hidden="true" />
              </button>
            </form>
            <p className="mt-1.5 hidden items-center justify-center gap-1 text-[10px] text-[#9A8A90] sm:flex">
              <ShoppingBag size={11} aria-hidden="true" /> Dữ liệu sản phẩm và
              chính sách hiện tại
            </p>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex min-h-14 touch-manipulation items-center gap-2.5 rounded-full bg-[#D96C8A] px-3 text-white shadow-[0_12px_34px_rgba(164,62,95,0.35)] transition active:scale-95 hover:-translate-y-0.5 hover:bg-[#C95B7C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D96C8A] sm:px-4"
          aria-label="Mở trợ lý mua sắm"
          aria-expanded="false"
        >
          <span className="grid size-9 place-items-center rounded-full bg-white/18">
            <MessageCircle size={21} aria-hidden="true" />
          </span>
          <span className="hidden pr-1 text-sm font-extrabold sm:inline">
            Cần tư vấn?
          </span>
        </button>
      )}
    </div>
  );
}

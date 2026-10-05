import { answerChatAssistant } from "./engine.ts";
import type {
  AssistantProduct,
  ChatAssistantData,
  ChatAssistantReply,
  ChatIntent,
  ProductContext,
} from "./types.ts";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.5-flash-lite";
const REQUEST_TIMEOUT_MS = 8_000;

const intents: ChatIntent[] = [
  "PRODUCT_SEARCH",
  "PRODUCT_INFO",
  "PRODUCT_PRICE",
  "PRODUCT_COLORS",
  "PRODUCT_SIZES",
  "PRODUCT_STOCK",
  "POLICY",
  "CONTACT",
  "GREETING",
  "UNKNOWN",
];

const responseSchema = {
  type: "OBJECT",
  properties: {
    intent: { type: "STRING", enum: intents },
    message: { type: "STRING" },
    productIds: { type: "ARRAY", items: { type: "INTEGER" } },
    policySlugs: { type: "ARRAY", items: { type: "STRING" } },
    suggestions: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["intent", "message", "productIds", "policySlugs", "suggestions"],
};

type GeminiReply = {
  intent?: unknown;
  message?: unknown;
  productIds?: unknown;
  policySlugs?: unknown;
  suggestions?: unknown;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

const compact = (value: string, maxLength: number) => {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > maxLength
    ? `${text.slice(0, maxLength).trimEnd()}…`
    : text;
};

const publicProducts = (data: ChatAssistantData) =>
  data.products.filter((product) => product.status === "PUBLIC");

function productFacts(products: AssistantProduct[]) {
  return products.map((product) => ({
    id: product.id,
    title: product.title,
    price: product.basePrice,
    description: compact(product.description, 360),
    variants: product.variants.map((variant) => ({
      color: variant.color,
      size: variant.size,
      price: variant.price,
      available: Math.max(0, variant.quantity - variant.reservedQuantity),
    })),
  }));
}

function parseModelJson(text: string): GeminiReply | null {
  try {
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as GeminiReply;
  } catch {
    return null;
  }
}

function toSafeReply(
  value: GeminiReply,
  fallback: ChatAssistantReply,
  data: ChatAssistantData,
  candidates: AssistantProduct[],
): ChatAssistantReply | null {
  if (typeof value.message !== "string" || !value.message.trim()) return null;

  const candidateIds = new Set(candidates.map((product) => product.id));
  const cardsById = new Map(
    fallback.products.map((product) => [product.id, product]),
  );
  const productIds = Array.isArray(value.productIds)
    ? value.productIds
        .filter((id): id is number => Number.isInteger(id))
        .filter((id) => candidateIds.has(id))
    : [];
  const products = productIds
    .map((id) => cardsById.get(id))
    .filter((product): product is ChatAssistantReply["products"][number] =>
      Boolean(product),
    );
  const policyBySlug = new Map(
    data.policies.map((policy) => [policy.slug, policy]),
  );
  const policyLinks = Array.isArray(value.policySlugs)
    ? value.policySlugs
        .filter((slug): slug is string => typeof slug === "string")
        .map((slug) => policyBySlug.get(slug))
        .filter((policy): policy is ChatAssistantData["policies"][number] =>
          Boolean(policy),
        )
        .map((policy) => ({
          title: `Xem ${policy.title}`,
          href: `/policies?policy=${encodeURIComponent(policy.slug)}`,
        }))
    : [];
  const intent = intents.includes(value.intent as ChatIntent)
    ? (value.intent as ChatIntent)
    : fallback.intent;
  const suggestions = Array.isArray(value.suggestions)
    ? value.suggestions
        .filter(
          (suggestion): suggestion is string => typeof suggestion === "string",
        )
        .map((suggestion) => compact(suggestion, 80))
        .filter(Boolean)
        .slice(0, 4)
    : [];

  return {
    intent,
    message: compact(value.message, 1_200),
    products,
    policyLinks: policyLinks.length ? policyLinks : fallback.policyLinks,
    suggestions: suggestions.length ? suggestions : fallback.suggestions,
  };
}

export async function answerChatAssistantWithAI(
  rawMessage: string,
  data: ChatAssistantData,
  context?: ProductContext,
) {
  const fallback = answerChatAssistant(rawMessage, data, context);
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return fallback;

  const products = publicProducts(data);
  const fallbackIds = new Set(fallback.products.map((product) => product.id));
  const candidates = products.filter((product) => fallbackIds.has(product.id));
  const selectedCandidates = (candidates.length ? candidates : products).slice(
    0,
    24,
  );
  const prompt = `
Bạn là trợ lý tư vấn mua sắm của ${data.contact.storeName}. Trả lời bằng tiếng Việt tự nhiên, ngắn gọn và thân thiện.

QUY TẮC BẮT BUỘC:
- Chỉ dùng thông tin trong DATA bên dưới; không bịa giá, tồn kho, màu, size, chính sách hoặc khuyến mãi.
- Nếu DATA không đủ, nói rõ là chưa có thông tin và hướng khách liên hệ cửa hàng.
- Với tồn kho, dùng đúng số lượng available. Không tự suy luận thêm.
- Chỉ chọn productIds có trong PRODUCT DATA và policySlugs có trong POLICY DATA.
- Không trả HTML, markdown table, hoặc JSON lồng trong message. Kết quả bên ngoài phải là JSON đúng schema.

CUSTOMER QUESTION:
${rawMessage}

PRODUCT DATA:
${JSON.stringify(productFacts(selectedCandidates))}

POLICY DATA:
${JSON.stringify(data.policies.map((policy) => ({ slug: policy.slug, title: policy.title, type: policy.type, summary: compact(policy.summary, 500), content: compact(policy.content, 900) })))}

CONTACT DATA:
${JSON.stringify(data.contact)}
`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
    const response = await fetch(
      `${GEMINI_ENDPOINT}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema,
          },
        }),
        signal: controller.signal,
      },
    );
    if (!response.ok) return fallback;
    const payload = (await response.json()) as GeminiResponse;
    const text = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();
    if (!text) return fallback;
    return (
      toSafeReply(
        parseModelJson(text) || {},
        fallback,
        data,
        selectedCandidates,
      ) || fallback
    );
  } catch {
    return fallback;
  } finally {
    clearTimeout(timeout);
  }
}

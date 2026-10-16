import type {
  AssistantPolicy,
  AssistantProduct,
  ChatAssistantData,
  ChatAssistantReply,
  ChatIntent,
  ChatProductCard,
  ProductContext,
} from "./types.ts";

const STOP_WORDS = new Set([
  "san",
  "pham",
  "mau",
  "size",
  "gia",
  "con",
  "hang",
  "shop",
  "cua",
  "nay",
  "do",
  "cho",
  "minh",
  "toi",
  "co",
  "khong",
  "la",
  "bao",
  "nhieu",
  "tim",
  "muon",
  "xem",
]);

const SUGGESTIONS = [
  "Tìm sản phẩm",
  "Sản phẩm này còn màu nào?",
  "Chính sách đổi trả",
  "Liên hệ cửa hàng",
];

export function normalizeVietnamese(value: string) {
  return value
    .toLocaleLowerCase("vi-VN")
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const containsAny = (value: string, phrases: string[]) =>
  phrases.some((phrase) => value.includes(normalizeVietnamese(phrase)));

function distance(left: string, right: string) {
  const rows = Array.from({ length: left.length + 1 }, (_, index) => index);
  for (let column = 1; column <= right.length; column += 1) {
    let previous = rows[0];
    rows[0] = column;
    for (let row = 1; row <= left.length; row += 1) {
      const current = rows[row];
      rows[row] = Math.min(
        rows[row] + 1,
        rows[row - 1] + 1,
        previous + (left[row - 1] === right[column - 1] ? 0 : 1),
      );
      previous = current;
    }
  }
  return rows[left.length];
}

const words = (value: string) =>
  normalizeVietnamese(value).split(" ").filter(Boolean);

function productScore(message: string, product: AssistantProduct) {
  const queryWords = words(message);
  const title = normalizeVietnamese(product.title);
  const titleWords = words(product.title);
  if (message.includes(title)) return 100 + titleWords.length;
  let score = 0;
  for (const titleWord of titleWords) {
    if (STOP_WORDS.has(titleWord) || titleWord.length < 2) continue;
    if (queryWords.includes(titleWord)) score += 4;
    else if (
      titleWord.length >= 4 &&
      queryWords.some(
        (queryWord) =>
          queryWord.length >= 4 && distance(queryWord, titleWord) <= 1,
      )
    )
      score += 2;
  }
  return score;
}

function publicProducts(products: AssistantProduct[]) {
  return products
    .filter((product) => product.status === "PUBLIC")
    .map((product) => ({
      ...product,
      variants: product.variants.filter((variant) => variant.isActive),
    }));
}

function available(variant: AssistantProduct["variants"][number]) {
  return Math.max(0, variant.quantity - variant.reservedQuantity);
}

function money(value: number) {
  return `${Math.round(value).toLocaleString("vi-VN")}đ`;
}

function productPriceLabel(product: AssistantProduct) {
  const prices = product.variants
    .map((variant) => variant.price)
    .filter((price) => price >= 0);
  const unique = [
    ...new Set(prices.length ? prices : [product.basePrice]),
  ].sort((a, b) => a - b);
  return unique.length > 1
    ? `${money(unique[0])} – ${money(unique.at(-1) ?? unique[0])}`
    : money(unique[0]);
}

function toCard(product: AssistantProduct): ChatProductCard {
  const stock = product.variants.length
    ? product.variants.reduce((total, variant) => total + available(variant), 0)
    : Math.max(0, product.baseQuantity);
  return {
    id: product.id,
    title: product.title,
    href: `/products/${product.slug || product.id}`,
    imageUrl: product.imageUrl,
    priceLabel: productPriceLabel(product),
    availabilityLabel: stock > 0 ? "Còn hàng" : "Tạm hết hàng",
  };
}

function detectPolicyType(message: string): AssistantPolicy["type"] | null {
  if (
    containsAny(message, [
      "đổi trả",
      "đổi hàng",
      "hoàn tiền",
      "trả hàng",
      "bao lâu được đổi",
    ])
  )
    return "RETURN_REFUND";
  if (
    containsAny(message, [
      "vận chuyển",
      "giao hàng",
      "tiền ship",
      "phí ship",
      "bao lâu nhận",
    ])
  )
    return "SHIPPING";
  if (
    containsAny(message, [
      "thanh toán",
      "chuyển khoản",
      "cod",
      "ngân hàng",
    ])
  )
    return "PAYMENT";
  if (containsAny(message, ["mua hàng", "đặt hàng", "hướng dẫn mua"]))
    return "PURCHASE_GUIDE";
  if (containsAny(message, ["bảo mật", "thông tin cá nhân", "quyền riêng tư"]))
    return "PRIVACY";
  if (containsAny(message, ["điều khoản", "quy định"])) return "TERMS";
  return null;
}

function detectIntent(message: string): ChatIntent {
  if (/^(xin chao|chao|hello|hi|alo|hey)( |$)/.test(message)) return "GREETING";
  if (
    containsAny(message, [
      "liên hệ",
      "hotline",
      "số điện thoại",
      "sdt",
      "email",
      "địa chỉ cửa hàng",
    ])
  )
    return "CONTACT";
  if (detectPolicyType(message)) return "POLICY";
  if (
    containsAny(message, [
      "còn hàng",
      "có sẵn",
      "hết hàng",
      "tồn kho",
      "còn không",
    ])
  )
    return "PRODUCT_STOCK";
  if (
    containsAny(message, ["màu nào", "màu gì", "có màu", "còn màu", "màu sắc"])
  )
    return "PRODUCT_COLORS";
  if (
    containsAny(message, [
      "size nào",
      "kích cỡ",
      "kích thước",
      "cỡ nào",
      "còn size",
      "size ",
    ])
  )
    return "PRODUCT_SIZES";
  if (containsAny(message, ["giá", "bao nhiêu", "giá tiền"]))
    return "PRODUCT_PRICE";
  if (
    containsAny(message, [
      "mô tả",
      "thông tin sản phẩm",
      "chi tiết sản phẩm",
      "chất liệu",
      "sản phẩm này là gì",
    ])
  )
    return "PRODUCT_INFO";
  if (
    containsAny(message, [
      "tìm",
      "sản phẩm",
      "áo",
      "quần",
      "đầm",
      "váy",
      "set ",
    ])
  )
    return "PRODUCT_SEARCH";
  return "UNKNOWN";
}

function resolveProducts(
  message: string,
  products: AssistantProduct[],
  context?: ProductContext,
) {
  const ranked = products
    .map((product) => ({ product, score: productScore(message, product) }))
    .filter((item) => item.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.product.title.localeCompare(right.product.title, "vi"),
    );
  if (ranked.length) return ranked.slice(0, 4).map((item) => item.product);
  const contextual = context
    ? products.find(
        (product) => product.id === context.id || product.slug === context.slug,
      )
    : undefined;
  return contextual ? [contextual] : [];
}

function compactText(value: string, maxLength = 360) {
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > maxLength
    ? `${compact.slice(0, maxLength).trimEnd()}…`
    : compact;
}

function policyReply(
  policy: AssistantPolicy | undefined,
  hasExceptionRequest: boolean,
): ChatAssistantReply {
  if (!policy) {
    return {
      intent: "POLICY",
      message:
        "Cửa hàng chưa đăng chính sách phù hợp cho nội dung này. Bạn có thể xem trang chính sách hoặc liên hệ cửa hàng để được xác nhận.",
      products: [],
      policyLinks: [{ title: "Xem chính sách cửa hàng", href: "/policies" }],
      suggestions: ["Liên hệ cửa hàng", "Chính sách vận chuyển"],
    };
  }
  const detail = compactText(policy.summary || policy.content, 420);
  const caution = hasExceptionRequest
    ? " Trường hợp bạn nêu có thể là ngoại lệ; mình không thể tự xác nhận ngoài nội dung đã công bố, bạn vui lòng liên hệ cửa hàng."
    : "";
  return {
    intent: "POLICY",
    message: `${policy.title}: ${detail || "Vui lòng mở chính sách để xem nội dung đang được cửa hàng công bố."}${caution}`,
    products: [],
    policyLinks: [
      {
        title: `Xem ${policy.title}`,
        href: `/policies?policy=${encodeURIComponent(policy.slug)}`,
      },
    ],
    suggestions: hasExceptionRequest
      ? ["Liên hệ cửa hàng"]
      : ["Chính sách đổi trả", "Phí vận chuyển"],
  };
}

export function answerChatAssistant(
  rawMessage: string,
  data: ChatAssistantData,
  context?: ProductContext,
): ChatAssistantReply {
  const message = normalizeVietnamese(rawMessage);
  const intent = detectIntent(message);
  const products = publicProducts(data.products);

  if (intent === "GREETING") {
    return {
      intent,
      message: `Chào bạn! Mình là trợ lý mua sắm của ${data.contact.storeName}. Bạn muốn tìm sản phẩm hay xem chính sách cửa hàng?`,
      products: [],
      policyLinks: [],
      suggestions: SUGGESTIONS,
    };
  }
  if (intent === "CONTACT") {
    const details = [
      data.contact.phone ? `Điện thoại: ${data.contact.phone}` : null,
      data.contact.email ? `Email: ${data.contact.email}` : null,
      data.contact.address ? `Địa chỉ: ${data.contact.address}` : null,
    ].filter(Boolean);
    return {
      intent,
      message: details.length
        ? `Thông tin liên hệ ${data.contact.storeName}:\n${details.join("\n")}`
        : "Cửa hàng chưa cập nhật thông tin liên hệ công khai. Bạn có thể xem trang chính sách để biết thêm thông tin.",
      products: [],
      policyLinks: [{ title: "Xem thông tin cửa hàng", href: "/policies" }],
      suggestions: ["Chính sách đổi trả", "Tìm sản phẩm"],
    };
  }
  if (intent === "POLICY") {
    const type = detectPolicyType(message);
    const policy = data.policies.find((item) => item.type === type);
    const exception = containsAny(message, [
      "ngoại lệ",
      "quá hạn",
      "không hóa đơn",
      "đã sử dụng",
      "đã mặc",
      "mất tag",
    ]);
    return policyReply(policy, exception);
  }

  const matches = resolveProducts(message, products, context);
  if (
    [
      "PRODUCT_INFO",
      "PRODUCT_PRICE",
      "PRODUCT_COLORS",
      "PRODUCT_SIZES",
      "PRODUCT_STOCK",
    ].includes(intent) &&
    !matches.length
  ) {
    return {
      intent,
      message:
        "Bạn đang hỏi sản phẩm nào? Hãy gửi tên sản phẩm, hoặc mở trang sản phẩm rồi hỏi lại để mình kiểm tra chính xác.",
      products: [],
      policyLinks: [],
      suggestions: ["Tìm sản phẩm", "Xem sản phẩm mới"],
    };
  }

  if (intent === "PRODUCT_SEARCH") {
    const shown = matches.length ? matches.slice(0, 4) : products.slice(0, 4);
    return {
      intent,
      message: shown.length
        ? `Mình tìm thấy ${shown.length} sản phẩm phù hợp. Bạn có thể mở sản phẩm để xem chi tiết màu, size và tồn kho hiện tại.`
        : "Hiện chưa tìm thấy sản phẩm công khai phù hợp. Bạn thử mô tả tên hoặc kiểu sản phẩm rõ hơn nhé.",
      products: shown.map(toCard),
      policyLinks: [],
      suggestions: ["Sản phẩm này còn màu nào?", "Giá sản phẩm này bao nhiêu?"],
    };
  }

  if (matches.length) {
    const product = matches[0];
    if (
      matches.length > 1 &&
      productScore(message, product) === productScore(message, matches[1])
    ) {
      return {
        intent,
        message:
          "Mình thấy vài sản phẩm có tên gần giống. Bạn chọn đúng sản phẩm bên dưới để mình trả lời chính xác nhé.",
        products: matches.map(toCard),
        policyLinks: [],
        suggestions: ["Sản phẩm đầu tiên còn hàng không?"],
      };
    }
    if (intent === "PRODUCT_PRICE") {
      return {
        intent,
        message: `${product.title} hiện có giá niêm yết ${productPriceLabel(product)} tùy biến thể. Ưu đãi đủ điều kiện (nếu có) sẽ được áp dụng và hiển thị ở bước thanh toán.`,
        products: [toCard(product)],
        policyLinks: [],
        suggestions: ["Còn màu nào?", "Còn size nào?"],
      };
    }
    if (intent === "PRODUCT_INFO") {
      return {
        intent,
        message: product.description
          ? `${product.title}: ${compactText(product.description, 420)}`
          : `${product.title} hiện chưa có phần mô tả chi tiết. Bạn có thể mở sản phẩm để xem hình ảnh, giá và các biến thể đang bán.`,
        products: [toCard(product)],
        policyLinks: [],
        suggestions: ["Giá bao nhiêu?", "Còn màu nào?", "Còn size nào?"],
      };
    }
    const colors = [
      ...new Set(
        product.variants
          .map((variant) => variant.color?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    ];
    const requestedColor = colors.find((color) =>
      message.includes(normalizeVietnamese(color)),
    );
    const sizeValues = [
      ...new Set(
        product.variants
          .map((variant) => variant.size?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    ];
    const requestedSize = sizeValues.find((size) =>
      new RegExp(
        `(^| )${normalizeVietnamese(size).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}( |$)`,
      ).test(message),
    );
    const relevantVariants = product.variants.filter(
      (variant) =>
        !requestedColor ||
        normalizeVietnamese(variant.color || "") ===
          normalizeVietnamese(requestedColor),
    );
    if (intent === "PRODUCT_COLORS") {
      const availableColors = colors.filter((color) =>
        product.variants.some(
          (variant) => variant.color === color && available(variant) > 0,
        ),
      );
      return {
        intent,
        message: availableColors.length
          ? `${product.title} đang còn các màu: ${availableColors.join(", ")}. Tồn kho có thể thay đổi khi có đơn mới.`
          : `${product.title} hiện chưa có màu nào còn hàng.`,
        products: [toCard(product)],
        policyLinks: [],
        suggestions: ["Còn size nào?", "Giá bao nhiêu?"],
      };
    }
    if (intent === "PRODUCT_SIZES") {
      const availableSizes = [
        ...new Set(
          relevantVariants
            .filter((variant) => available(variant) > 0)
            .map((variant) => variant.size)
            .filter((value): value is string => Boolean(value)),
        ),
      ];
      const colorText = requestedColor ? ` màu ${requestedColor}` : "";
      return {
        intent,
        message: availableSizes.length
          ? `${product.title}${colorText} đang còn size: ${availableSizes.join(", ")}.`
          : `${product.title}${colorText} hiện chưa có size nào còn hàng.`,
        products: [toCard(product)],
        policyLinks: [],
        suggestions: ["Kiểm tra còn hàng", "Giá bao nhiêu?"],
      };
    }
    if (intent === "PRODUCT_STOCK") {
      const exact = product.variants.filter(
        (variant) =>
          (!requestedColor ||
            normalizeVietnamese(variant.color || "") ===
              normalizeVietnamese(requestedColor)) &&
          (!requestedSize ||
            normalizeVietnamese(variant.size || "") ===
              normalizeVietnamese(requestedSize)),
      );
      const stock = product.variants.length
        ? exact.reduce((total, variant) => total + available(variant), 0)
        : Math.max(0, product.baseQuantity);
      const selection = [
        requestedColor ? `màu ${requestedColor}` : null,
        requestedSize ? `size ${requestedSize}` : null,
      ]
        .filter(Boolean)
        .join(", ");
      return {
        intent,
        message: `${product.title}${selection ? ` (${selection})` : ""} ${stock > 0 ? `hiện còn ${stock} sản phẩm` : "hiện đã hết hàng"}. Tồn kho được lấy từ dữ liệu hiện tại và có thể thay đổi khi có đơn mới.`,
        products: [toCard(product)],
        policyLinks: [],
        suggestions: ["Còn màu nào?", "Còn size nào?"],
      };
    }
  }

  return {
    intent: "UNKNOWN",
    message:
      "Mình chưa hiểu rõ câu hỏi. Mình có thể hỗ trợ tìm sản phẩm, kiểm tra giá/màu/size/tồn kho, xem chính sách hoặc thông tin liên hệ.",
    products: [],
    policyLinks: [],
    suggestions: SUGGESTIONS,
  };
}

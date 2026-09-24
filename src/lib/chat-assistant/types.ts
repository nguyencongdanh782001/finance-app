export type ChatIntent =
  | "PRODUCT_SEARCH"
  | "PRODUCT_INFO"
  | "PRODUCT_PRICE"
  | "PRODUCT_COLORS"
  | "PRODUCT_SIZES"
  | "PRODUCT_STOCK"
  | "POLICY"
  | "CONTACT"
  | "GREETING"
  | "UNKNOWN";

export type AssistantVariant = {
  color: string | null;
  size: string | null;
  price: number;
  quantity: number;
  reservedQuantity: number;
  isActive: boolean;
};

export type AssistantProduct = {
  id: number;
  title: string;
  slug: string | null;
  description: string;
  imageUrl: string;
  basePrice: number;
  baseQuantity: number;
  status: "PUBLIC" | "PRIVATE" | "DISCONTINUED";
  variants: AssistantVariant[];
};

export type AssistantPolicy = {
  type:
    | "PURCHASE_GUIDE"
    | "SHIPPING"
    | "RETURN_REFUND"
    | "PRIVACY"
    | "TERMS"
    | "PAYMENT"
    | "OTHER";
  title: string;
  slug: string;
  summary: string;
  content: string;
};

export type AssistantContact = {
  storeName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
};

export type ProductContext = {
  id?: number;
  slug?: string;
};

export type ChatProductCard = {
  id: number;
  title: string;
  href: string;
  imageUrl: string;
  priceLabel: string;
  availabilityLabel: string;
};

export type ChatPolicyLink = {
  title: string;
  href: string;
};

export type ChatAssistantReply = {
  intent: ChatIntent;
  message: string;
  products: ChatProductCard[];
  policyLinks: ChatPolicyLink[];
  suggestions: string[];
};

export type ChatAssistantData = {
  products: AssistantProduct[];
  policies: AssistantPolicy[];
  contact: AssistantContact;
};

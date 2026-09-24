import assert from "node:assert/strict";
import test from "node:test";
import { answerChatAssistant, normalizeVietnamese } from "./engine.ts";
import type { ChatAssistantData } from "./types.ts";

const data: ChatAssistantData = {
  contact: {
    storeName: "Quỳnh Nhi Store",
    phone: "0909000111",
    email: "hello@example.com",
    address: "Quận 1, TP.HCM",
  },
  policies: [
    {
      type: "RETURN_REFUND",
      title: "Chính sách đổi trả",
      slug: "doi-tra",
      summary:
        "Đổi hàng trong thời hạn được công bố nếu sản phẩm đủ điều kiện.",
      content: "Sản phẩm cần giữ nguyên tình trạng theo quy định.",
    },
    {
      type: "SHIPPING",
      title: "Chính sách vận chuyển",
      slug: "van-chuyen",
      summary: "Phí giao hàng được hiển thị khi đặt hàng.",
      content: "",
    },
  ],
  products: [
    {
      id: 1,
      title: "Áo len S44",
      slug: "ao-len-s44",
      description: "Áo len nữ",
      imageUrl: "/ao.jpg",
      basePrice: 245_000,
      baseQuantity: 0,
      status: "PUBLIC",
      variants: [
        {
          color: "Đen",
          size: "M",
          price: 245_000,
          quantity: 3,
          reservedQuantity: 1,
          isActive: true,
        },
        {
          color: "Đen",
          size: "L",
          price: 255_000,
          quantity: 1,
          reservedQuantity: 1,
          isActive: true,
        },
        {
          color: "Trắng",
          size: "M",
          price: 245_000,
          quantity: 2,
          reservedQuantity: 0,
          isActive: true,
        },
        {
          color: "Hồng",
          size: "S",
          price: 245_000,
          quantity: 9,
          reservedQuantity: 0,
          isActive: false,
        },
      ],
    },
    {
      id: 2,
      title: "Đầm hoa nhí",
      slug: "dam-hoa-nhi",
      description: "Đầm hoa",
      imageUrl: "/dam.jpg",
      basePrice: 320_000,
      baseQuantity: 4,
      status: "PUBLIC",
      variants: [],
    },
    {
      id: 3,
      title: "Áo len nội bộ",
      slug: "ao-len-noi-bo",
      description: "",
      imageUrl: "/private.jpg",
      basePrice: 1,
      baseQuantity: 100,
      status: "PRIVATE",
      variants: [],
    },
  ],
};

test("normalizes Vietnamese accents, punctuation and whitespace", () => {
  assert.equal(
    normalizeVietnamese("  ĐỔI-trả,   được không? "),
    "doi tra duoc khong",
  );
});

test("uses current product context for a short price question", () => {
  const reply = answerChatAssistant("Giá bao nhiêu?", data, {
    slug: "ao-len-s44",
  });
  assert.equal(reply.intent, "PRODUCT_PRICE");
  assert.match(reply.message, /245\.000đ – 255\.000đ/);
  assert.equal(reply.products[0]?.id, 1);
});

test("answers product description from current public product data", () => {
  const reply = answerChatAssistant("Mô tả sản phẩm này", data, {
    slug: "ao-len-s44",
  });
  assert.equal(reply.intent, "PRODUCT_INFO");
  assert.match(reply.message, /Áo len nữ/);
});

test("checks stock for the exact color and size combination", () => {
  const inStock = answerChatAssistant(
    "Áo len S44 màu đen size M còn hàng không?",
    data,
  );
  assert.match(inStock.message, /còn 2 sản phẩm/);
  const outOfStock = answerChatAssistant(
    "Áo len S44 màu đen size L còn hàng không?",
    data,
  );
  assert.match(outOfStock.message, /đã hết hàng/);
});

test("lists only active colors that still have stock", () => {
  const reply = answerChatAssistant("Áo len S44 còn màu nào?", data);
  assert.match(reply.message, /Đen, Trắng/);
  assert.doesNotMatch(reply.message, /Hồng/);
});

test("never recommends private products", () => {
  const reply = answerChatAssistant("Tìm áo len", data);
  assert.ok(reply.products.every((product) => product.id !== 3));
});

test("ranks a generic garment search by product title", () => {
  const reply = answerChatAssistant("Tìm đầm", data);
  assert.equal(reply.products[0]?.id, 2);
});

test("matches a one-character spelling error in a distinctive product word", () => {
  const reply = answerChatAssistant("Tìm áo lenn", data);
  assert.equal(reply.products[0]?.id, 1);
});

test("grounds exception requests in the published policy", () => {
  const reply = answerChatAssistant(
    "Đồ đã mặc có được đổi trả ngoại lệ không?",
    data,
  );
  assert.equal(reply.intent, "POLICY");
  assert.match(reply.message, /không thể tự xác nhận/);
  assert.equal(reply.policyLinks[0]?.href, "/policies?policy=doi-tra");
});

test("returns configured public contact information", () => {
  const reply = answerChatAssistant("Cho mình số điện thoại liên hệ", data);
  assert.match(reply.message, /0909000111/);
  assert.doesNotMatch(reply.message, /undefined|null/);
});

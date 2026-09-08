export const storefrontGenderLinks = [
  { label: "Hàng mới", href: "/products" },
  { label: "Nữ", href: "/products?gender=WOMEN" },
  { label: "Nam", href: "/products?gender=MEN" },
  { label: "Unisex", href: "/products?gender=UNISEX" },
] as const;

export const storefrontFooterLinks = [
  ...storefrontGenderLinks,
  { label: "Sản phẩm yêu thích", href: "/account/favorites" },
] as const;

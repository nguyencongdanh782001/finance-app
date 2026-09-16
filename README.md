This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Production deployments run `prisma migrate deploy` automatically in the GitHub Actions production job before the Vercel artifact is built. Configure `PRO_DATABASE_URL` in the Vercel Production environment and provide the GitHub Actions environment secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` for both the `development` and `production` environments. `VERCEL_TOKEN` must be a non-empty Vercel access token.

### Chuyển database production sang Neon

Neon tương thích với PostgreSQL hiện tại, nên không cần đổi `prisma/schema.prisma`. Sau khi tạo database Neon và chuyển dữ liệu, cấu hình:

```env
# Pooled Neon URL: dùng cho runtime trên Vercel
PRO_DATABASE_URL="postgresql://...@...-pooler.../neondb?sslmode=require"

# Direct Neon URL: dùng cho migration, không dùng pooler
PRO_DIRECT_DATABASE_URL="postgresql://...@.../neondb?sslmode=require"
```

Có thể chuyển dữ liệu bằng `pg_dump`/`pg_restore` từ database cũ sang Neon. Chỉ cập nhật `PRO_DATABASE_URL` trên Vercel sau khi đã kiểm tra dữ liệu và chạy `npm run db:migrate:deploy` với `PRO_DIRECT_DATABASE_URL`.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# finance-app

## Địa chỉ và phí giao hàng

Địa chỉ dùng Geoapify Address Autocomplete và Geoapify Routing API. API key chỉ được dùng ở server qua các endpoint `/api/locations/autocomplete` và `/api/shipping/quote`; frontend không nhận hoặc gọi Geoapify trực tiếp.

Thiết lập backend:

```env
GEOAPIFY_API_KEY=""
SHOP_LATITUDE="11.275790867301161"
SHOP_LONGITUDE="106.5892647696457"
```

Autocomplete bắt đầu từ ba ký tự và debounce 600ms. Chỉ địa chỉ đã chọn từ gợi ý mới có tọa độ để tính phí. Phí mặc định là 15.000đ cho tối đa 3km, cộng 5.000đ cho mỗi km phát sinh (làm tròn lên), tối đa 50km. Checkout luôn tính lại quote ở server và lưu khoảng cách/phí vào order snapshot.

Google OAuth (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`) vẫn được giữ nguyên. Không cần bản đồ cho luồng giao hàng; nếu thêm bản đồ sau này phải dùng OSM/Leaflet và giữ attribution.

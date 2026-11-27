# Phân tích tĩnh, quét secret và coding convention

## 1. Mục tiêu quản lý chất lượng mã nguồn

Việc kiểm tra chất lượng phải thực hiện trên mã nguồn thật của repository, có lưu nguyên báo cáo và giải thích các cảnh báo còn tồn tại. Không chỉ ghi kết luận “đã kiểm tra” nếu không có lệnh chạy, kết quả và phạm vi kiểm tra.

## 2. Công cụ và lệnh kiểm tra

| Hạng mục | Công cụ/lệnh áp dụng | Phạm vi |
|---|---|---|
| Phân tích tĩnh TypeScript/JavaScript | `npm run lint` hoặc `npx eslint . --max-warnings=0` | `src/**/*.ts`, `src/**/*.tsx` và file JS/TS được ESLint áp dụng. |
| Kiểm tra kiểu | `npm run type-check` | TypeScript với `strict: true` trong `tsconfig.json`. |
| Phân tích tĩnh Python | `ruff check services/fashn-vton` | Service virtual try-on và các file Python thuộc service. Chỉ ghi là đã chạy khi ruff thực sự được cài và có output. |
| Quét secret | `gitleaks detect --source . --redact --report-format sarif --report-path reports/gitleaks.sarif` | Git history và working tree theo phạm vi được cấu hình. |
| Kiểm thử | `npm test` | Các test được khai báo trong `package.json`. |

Nếu môi trường chưa có `ruff` hoặc `gitleaks`, phải ghi rõ **chưa chạy do thiếu tool**, không thay bằng tuyên bố đã đạt. Báo cáo lưu trong `reports/quality/` hoặc thư mục do nhóm thống nhất.

## 3. Nội dung báo cáo phải nộp

Mỗi đợt kiểm tra cần nộp:

- Lệnh đầy đủ, thời điểm chạy, commit/branch và phạm vi file được quét.
- Nguyên báo cáo của ESLint, TypeScript, ruff nếu có Python và Gitleaks.
- Số lượng lỗi, cảnh báo, secret phát hiện hoặc kết quả sạch.
- Danh sách cảnh báo còn tồn tại, phân loại mức độ và lý do chưa xử lý.
- Các lỗi đã sửa, file/commit liên quan và kết quả chạy lại sau khi sửa.
- Ghi chú false positive hoặc secret mẫu đã được loại trừ có lý do; không che giấu cảnh báo bằng cách xóa báo cáo.

## 4. Coding convention của nhóm

Coding convention là quy tắc nhóm thống nhất và phải được áp dụng thật trong mã nguồn. Với repository hiện tại:

- Dùng TypeScript cho mã ứng dụng; compiler bật `strict: true`.
- Dùng alias import `@/*` trỏ tới `src/*` khi phù hợp.
- Tổ chức UI theo route trong `src/app` và component theo module trong `src/components`.
- Đặt API trong `src/app/api/<resource>/route.ts`, dùng đúng HTTP method và mã trạng thái.
- Tách nghiệp vụ dùng lại vào `src/lib`, không lặp logic tính giá, tồn kho, shipping, auth hoặc policy.
- Dùng Prisma thông qua lớp truy cập database hiện có; tên model, enum và quan hệ phải khớp `prisma/schema.prisma`.
- React component dùng PascalCase; hook dùng tiền tố `use`; hàm và biến dùng camelCase.
- Không dùng non-null assertion TypeScript (`!`) nếu không có lý do được ghi nhận; ESLint hiện đặt quy tắc này là lỗi.
- Tuân thủ rule React Hooks và các rule ESLint/Next.js trong `eslint.config.mjs`.
- Không commit secret, token, khóa riêng, file `.env` hoặc dữ liệu production; cấu hình lấy từ biến môi trường.
- Giữ thay đổi format tách biệt với thay đổi nghiệp vụ khi có thể.

Convention chỉ được xem là đạt khi thể hiện trong cấu hình, mã nguồn và kết quả kiểm tra; không chỉ ghi trong tài liệu mà không áp dụng.

## 5. Mẫu ghi nhận cảnh báo còn tồn tại

| Tool | File/dòng | Cảnh báo | Mức độ | Trạng thái | Lý do/kế hoạch |
|---|---|---|---|---|---|
| ESLint | `path/to/file.ts:line` | Mô tả nguyên văn | Error/Warning | Open/Fixed | Cách xử lý hoặc lý do chấp nhận |
| Ruff | `services/fashn-vton/app.py:line` | Mô tả nguyên văn | Error/Warning | Open/Fixed | Cách xử lý hoặc lý do chấp nhận |
| Gitleaks | Commit/file/rule | Không ghi secret thật | High/Medium/False positive | Open/Resolved | Thu hồi secret, xóa khỏi history hoặc giải trình |

## 6. Tiêu chí nghiệm thu chất lượng

- Có nguyên báo cáo của các tool đã chạy.
- Không còn lỗi blocking chưa được giải trình.
- Mọi cảnh báo còn lại có file/dòng, mức độ và lý do cụ thể.
- Secret thật phải được thu hồi/thay khóa, không chỉ xóa khỏi file hiện tại.
- Coding convention được thể hiện bằng cấu hình lint/format và được áp dụng trong các file đã sửa.

# Khai báo sử dụng LLM/AI theo từng tuần

> Dựa trên schedule 15 tuần từ 03/08/2026 đến 15/11/2026. Nội dung dưới đây là bản điền theo các task trong schedule; cần đối chiếu lại với lịch sử chat/commit trước khi nộp.

## Tuần 1 — 03/08–09/08/2026

- **Nội dung:** Khảo sát và khởi tạo repository, môi trường phát triển, quy ước branch và luồng chính.
- **Có dùng LLM/AI:** Có.
- **Công cụ/model:** ChatGPT – GPT-5.
- **Prompt đã dùng:** `tạo cấu trúc khởi tạo dự án Next.js TypeScript cho website bán quần áo, gồm route storefront, route admin, cấu trúc component và cấu hình môi trường development`
- **Nội dung AI tạo ra:** Gợi ý cấu trúc thư mục, route, cách tách component và checklist khởi tạo dự án.
- **Phần đã sửa/hoàn thiện:** Đối chiếu với repository thực tế, giữ cấu trúc `src/app`, `src/components`, `src/lib`, bổ sung route admin/API và điều chỉnh theo code hiện có.

## Tuần 2 — 10/08–16/08/2026

- **Nội dung:** Tài khoản và phân quyền.
- **Có dùng LLM/AI:** Có.
- **Công cụ/model:** ChatGPT – GPT-5.
- **Prompt đã dùng:** `viết API đăng ký, đăng nhập, xác thực OTP, refresh session và logout cho Next.js, có kiểm tra role CUSTOMER, ADMIN, SUPER_ADMIN`
- **Nội dung AI tạo ra:** Gợi ý flow auth, middleware kiểm tra session, xử lý OTP và phân quyền route admin.
- **Phần đã sửa/hoàn thiện:** Tích hợp với session/cookie và Prisma thực tế; sửa tên enum, mã lỗi, thông báo tiếng Việt và kiểm tra quyền sở hữu dữ liệu.

## Tuần 3 — 17/08–23/08/2026

- **Nội dung:** Catalog sản phẩm, biến thể, hình ảnh và danh mục.
- **Có dùng LLM/AI:** Có.
- **Công cụ/model:** ChatGPT/Codex – GPT-5.
- **Prompt đã dùng:** `viết chức năng CRUD sản phẩm bằng Next.js và Prisma, hỗ trợ danh mục, thương hiệu, size, màu, SKU, tồn kho, ảnh và trạng thái PUBLIC/PRIVATE`
- **Nội dung AI tạo ra:** Gợi ý model, API CRUD, validation giá/tồn kho và cách xử lý product variant.
- **Phần đã sửa/hoàn thiện:** Đối chiếu với `prisma/schema.prisma`, giữ logic variant group, SKU, ảnh theo màu/size và thêm validation theo nghiệp vụ thật.

## Tuần 4 — 24/08–30/08/2026

- **Nội dung:** Website người dùng: trang chủ, danh sách, tìm kiếm, lọc và chi tiết sản phẩm.
- **Có dùng LLM/AI:** Có.
- **Công cụ/model:** ChatGPT/Codex – GPT-5.
- **Prompt đã dùng:** `tạo component React cho trang danh sách và chi tiết sản phẩm, có tìm kiếm, lọc danh mục/giá, chọn size/màu và hiển thị tồn kho`
- **Nội dung AI tạo ra:** Gợi ý component, state filter, loading state, empty state và responsive layout.
- **Phần đã sửa/hoàn thiện:** Chỉnh theo component Storefront hiện có, dùng API thật, sửa logic biến thể và kiểm tra sản phẩm hết hàng/private.

## Tuần 5 — 31/08–06/09/2026

- **Nội dung:** Giỏ hàng và checkout.
- **Có dùng LLM/AI:** Có.
- **Công cụ/model:** ChatGPT/Codex – GPT-5.
- **Prompt đã dùng:** `viết API và component giỏ hàng cho sản phẩm có variant, hỗ trợ thêm, sửa số lượng, xóa item, kiểm tra tồn kho và tạo checkout preview`
- **Nội dung AI tạo ra:** Gợi ý CartProvider, API CartItem, cách tính subtotal và flow checkout.
- **Phần đã sửa/hoàn thiện:** Sửa theo logic giữ chỗ tồn kho, kiểm tra ownership, tính lại dữ liệu ở server và xử lý giỏ rỗng/API lỗi.

## Tuần 6 — 07/09–13/09/2026

- **Nội dung:** Khuyến mãi và membership.
- **Có dùng LLM/AI:** Có.
- **Công cụ/model:** ChatGPT/Codex – GPT-5.
- **Prompt đã dùng:** `viết chức năng validate coupon tại checkout, hỗ trợ giảm phần trăm, giảm tiền, miễn phí ship, thời hạn và giới hạn sử dụng`
- **Nội dung AI tạo ra:** Gợi ý validation coupon, thứ tự áp dụng discount và cách hiển thị số tiền giảm.
- **Phần đã sửa/hoàn thiện:** Điều chỉnh theo model Coupon/Membership thực tế, xử lý coupon hết hạn, vượt hạn mức, điều kiện sản phẩm và không cho giảm sai tổng tiền.

## Tuần 7 — 14/09–20/09/2026

- **Nội dung:** Thanh toán và vận chuyển.
- **Có dùng LLM/AI:** Có.
- **Công cụ/model:** ChatGPT/Codex – GPT-5.
- **Prompt đã dùng:** `viết route tạo thanh toán VNPay, xử lý return/IPN và API tính phí ship theo tọa độ, có kiểm tra chữ ký và callback lặp`
- **Nội dung AI tạo ra:** Gợi ý flow payment session, xác thực callback, shipping quote và trạng thái thanh toán.
- **Phần đã sửa/hoàn thiện:** Đối chiếu với `src/lib/vnpay.ts`, `src/lib/shipping.ts`, sửa trạng thái thực tế, lưu shipping snapshot và thêm ca lỗi payment fail/duplicate callback.

## Tuần 8 — 21/09–27/09/2026

- **Nội dung:** Quản lý đơn hàng Admin.
- **Có dùng LLM/AI:** Có.
- **Công cụ/model:** ChatGPT/Codex – GPT-5.
- **Prompt đã dùng:** `tạo màn hình admin danh sách và chi tiết đơn hàng, có tìm kiếm, lọc trạng thái, cập nhật trạng thái, hủy đơn và xem lịch sử`
- **Nội dung AI tạo ra:** Gợi ý bảng admin, bộ lọc, modal cập nhật trạng thái và API PATCH order.
- **Phần đã sửa/hoàn thiện:** Khớp với `src/app/admin/orders`, giới hạn chuyển trạng thái theo order-status thật, ghi history và bảo vệ API bằng role admin.

## Tuần 9 — 28/09–04/10/2026

- **Nội dung:** Bán hàng tại shop và đơn offline.
- **Có dùng LLM/AI:** Có.
- **Công cụ/model:** ChatGPT/Codex – GPT-5.
- **Prompt đã dùng:** `viết form tạo đơn offline cho admin, chọn khách hàng, sản phẩm/variant, giảm giá, tiền khách trả và cập nhật tồn kho`
- **Nội dung AI tạo ra:** Gợi ý form đơn offline, tính tiền còn thiếu và xử lý inventory transaction.
- **Phần đã sửa/hoàn thiện:** Điều chỉnh theo component `OfflineOrderEditor`, hỗ trợ snapshot sản phẩm, trạng thái thanh toán và kiểm tra số liệu doanh thu.

## Tuần 10 — 05/10–11/10/2026

- **Nội dung:** Tài chính ngày và tháng.
- **Có dùng LLM/AI:** Có.
- **Công cụ/model:** ChatGPT/Codex – GPT-5.
- **Prompt đã dùng:** `viết API tổng hợp doanh thu, chi phí và lợi nhuận theo ngày/tháng cho dashboard admin, có lọc năm và tháng`
- **Nội dung AI tạo ra:** Gợi ý công thức tổng hợp, query báo cáo và cấu trúc response cho biểu đồ.
- **Phần đã sửa/hoàn thiện:** Đối chiếu với các route summary/monthly/daily, sửa công thức theo dữ liệu thật và kiểm tra đối soát đơn hàng–chi phí.

## Tuần 11 — 12/10–18/10/2026

- **Nội dung:** Báo cáo và hóa đơn.
- **Có dùng LLM/AI:** Có.
- **Công cụ/model:** ChatGPT/Codex – GPT-5.
- **Prompt đã dùng:** `viết service tạo invoice snapshot, cấp số hóa đơn duy nhất, xem trước hóa đơn và xuất báo cáo Excel theo tháng`
- **Nội dung AI tạo ra:** Gợi ý cấu trúc invoice, sequence number, endpoint preview/issue và các sheet Excel.
- **Phần đã sửa/hoàn thiện:** Dùng model OrderInvoice thực tế, bảo toàn snapshot, xử lý trạng thái DRAFT/ISSUED/VOIDED và kiểm tra công thức doanh thu trừ chi phí.

## Tuần 12 — 19/10–25/10/2026

- **Nội dung:** Nội dung và chăm sóc khách hàng.
- **Có dùng LLM/AI:** Có.
- **Công cụ/model:** ChatGPT/Codex – GPT-5.
- **Prompt đã dùng:** `tạo màn hình admin quản lý banner và policy rich text, cùng chức năng khách xem chính sách và gửi review sản phẩm`
- **Nội dung AI tạo ra:** Gợi ý form CRUD nội dung, sanitizer rich text, trạng thái duyệt review và empty state.
- **Phần đã sửa/hoàn thiện:** Tích hợp với `RichTextEditor`, `RichTextRenderer`, content policy và review policy; giữ kiểm tra quyền admin và alt text ảnh.

## Tuần 13 — 26/10–01/11/2026

- **Nội dung:** Thông báo và vận hành.
- **Có dùng LLM/AI:** Có.
- **Công cụ/model:** ChatGPT/Codex – GPT-5.
- **Prompt đã dùng:** `viết API notification cho khách hàng và admin, có unread count, mark read, read all, Web Push subscription và retry outbox`
- **Nội dung AI tạo ra:** Gợi ý notification model, API đọc/chưa đọc, push subscription và cơ chế retry.
- **Phần đã sửa/hoàn thiện:** Đối chiếu với các route notification/push/cron, sửa loại notification, quyền xem dữ liệu và xử lý duplicate/retry.

## Tuần 14 — 02/11–08/11/2026

- **Nội dung:** Tích hợp toàn hệ thống, bảo mật và hiệu năng.
- **Có dùng LLM/AI:** Có.
- **Công cụ/model:** ChatGPT/Codex – GPT-5.
- **Prompt đã dùng:** `kiểm tra luồng User mua hàng từ catalog đến thanh toán và luồng Admin xử lý đơn đến báo cáo; lập checklist auth, phân quyền, upload, validation và hiệu năng`
- **Nội dung AI tạo ra:** Checklist integration/security/performance và gợi ý các ca lỗi cần kiểm tra.
- **Phần đã sửa/hoàn thiện:** Đối chiếu từng mục với mã nguồn, test ownership/role, validation upload, truy vấn sản phẩm/dashboard và bổ sung test regression cần thiết.

## Tuần 15 — 09/11–15/11/2026

- **Nội dung:** UAT và sửa lỗi.
- **Có dùng LLM/AI:** Có.
- **Công cụ/model:** ChatGPT/Codex – GPT-5.
- **Prompt đã dùng:** `lập checklist UAT cho khách hàng và admin gồm đăng ký, tìm kiếm, giỏ hàng, checkout, thanh toán, xử lý đơn và báo cáo; phân loại lỗi và đề xuất test regression`
- **Nội dung AI tạo ra:** Checklist UAT, nhóm lỗi theo mức độ và gợi ý test hồi quy sau khi sửa.
- **Phần đã sửa/hoàn thiện:** Chạy lại các test liên quan, đối chiếu kết quả với sản phẩm thật, ghi defect mở/đã đóng và cập nhật tài liệu kiểm thử.


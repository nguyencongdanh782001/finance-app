# Kế hoạch và tiêu chí kiểm thử phần mềm

## 1. Mục tiêu

Kiểm thử phải chứng minh các chức năng chính của website bán quần áo hoạt động đúng, xử lý được ca lỗi và có bằng chứng chạy được. Mỗi chức năng phải có test case thành công và test case lỗi; không chỉ kiểm thử luồng thuận.

## 2. Phạm vi kiểm thử

- Xác thực, session, OTP và phân quyền.
- Danh mục, sản phẩm, biến thể, tồn kho và nhập sản phẩm.
- Giỏ hàng, yêu thích, checkout, voucher, phí giao hàng và đơn hàng.
- Thanh toán, hóa đơn, đánh giá, thông báo và nội dung quản trị.
- Trợ lý chat, gợi ý sản phẩm và virtual try-on.
- Dashboard tài chính, báo cáo và các service Python liên quan.

## 3. Kế hoạch kiểm thử

| Giai đoạn | Nội dung | Đầu ra |
|---|---|---|
| Unit test | Kiểm tra hàm nghiệp vụ độc lập trong `src/lib`. | Kết quả test tự động và danh sách case. |
| Integration/API | Kiểm tra route, validation, quyền, Prisma và tích hợp dịch vụ ngoài. | Log request/response và defect nếu có. |
| UI/flow test | Kiểm tra các luồng storefront và admin trên desktop/mobile. | Checklist và ảnh/video bằng chứng khi cần. |
| Regression test | Chạy lại các chức năng liên quan sau mỗi thay đổi. | Kết quả pass/fail theo phiên bản. |
| Security/negative test | Dữ liệu sai, truy cập trái quyền, tồn kho thiếu, token sai, secret và rate limit. | Danh sách ca lỗi và trạng thái xử lý. |

## 4. Mã nguồn test tự động

Repository hiện có các test tự động trong `src/lib`:

- `src/lib/chat-assistant/engine.test.ts`, `request.test.ts`
- `src/lib/geoapify.test.ts`, `shipping.test.ts`
- `src/lib/orders/order-status.test.ts`, `shop-order-products.test.ts`
- `src/lib/products/import/parser.test.ts`
- `src/lib/products/product-draft-validation.test.ts`
- `src/lib/products/product-preview.test.ts`
- `src/lib/products/product-status.test.ts`
- `src/lib/products/variant-groups.test.ts`, `variant-removal.test.ts`
- `src/lib/recommendations.test.ts`, `reviews-policy.test.ts`, `rich-text.test.ts`
- `src/lib/sold-products/sold-products.test.ts`

Lệnh chạy bộ test hiện được khai báo trong `package.json`:

```bash
npm test
```

Test tự động chỉ được ghi là đạt khi lệnh chạy thực tế kết thúc thành công và có lưu output. Nếu thêm test route/API hoặc UI, phải bổ sung file test và cập nhật lệnh chạy trong `package.json`.

## 5. Test case theo chức năng

| ID | Chức năng | Điều kiện/dữ liệu | Kết quả mong đợi | Ca lỗi cần kiểm tra |
|---|---|---|---|---|
| TC-AUTH-01 | Đăng ký | Email mới, mật khẩu hợp lệ | Tạo tài khoản và yêu cầu OTP | Email trùng, mật khẩu yếu, email sai định dạng, OTP sai/hết hạn |
| TC-AUTH-02 | Đăng nhập | Tài khoản active và đúng mật khẩu | Tạo phiên đăng nhập | Sai mật khẩu, tài khoản blocked, thiếu dữ liệu |
| TC-AUTH-03 | Phân quyền | CUSTOMER gọi API admin | Từ chối truy cập | Không có session, role không đủ, session hết hạn |
| TC-PROD-01 | Danh sách sản phẩm | Sản phẩm PUBLIC và PRIVATE | Chỉ hiển thị sản phẩm được phép | Không có kết quả, page/limit sai, bộ lọc sai |
| TC-PROD-02 | Chi tiết/biến thể | Sản phẩm có size, màu và SKU | Hiển thị đúng biến thể và tồn kho | ID không tồn tại, biến thể không thuộc sản phẩm |
| TC-PROD-03 | Quản trị sản phẩm | Admin nhập đủ trường | Tạo/cập nhật sản phẩm thành công | Giá âm, thiếu tên, SKU trùng, ảnh sai định dạng |
| TC-CART-01 | Thêm giỏ hàng | Chọn variant còn hàng | Tạo hoặc cập nhật CartItem | Chưa đăng nhập, sản phẩm private, số lượng vượt tồn kho |
| TC-CART-02 | Sửa/xóa giỏ hàng | CartItem thuộc tài khoản hiện tại | Cập nhật hoặc xóa đúng item | Item không thuộc user, số lượng 0/âm, item không tồn tại |
| TC-CHECKOUT-01 | Preview checkout | Giỏ hàng hợp lệ, địa chỉ hợp lệ | Tính đúng subtotal, discount, shipping, total | Giỏ rỗng, voucher hết hạn, giá/tồn kho thay đổi |
| TC-ORDER-01 | Tạo đơn | Preview hợp lệ | Tạo Order, OrderItem, Payment và snapshot | Gửi tổng tiền giả, tồn kho thiếu, lỗi transaction |
| TC-ORDER-02 | Trạng thái đơn | Admin có quyền cập nhật | Ghi trạng thái và history | Chuyển trạng thái không hợp lệ, user thường gọi API admin |
| TC-PAY-01 | Thanh toán VNPay | Request có chữ ký hợp lệ | Tạo/ghi nhận giao dịch đúng | Chữ ký sai, transaction trùng, callback không hợp lệ |
| TC-SHIP-01 | Báo phí ship | Tọa độ hợp lệ và cấu hình phí | Trả quote đúng và lưu snapshot | Thiếu tọa độ, khoảng cách vượt giới hạn, Geoapify lỗi |
| TC-REVIEW-01 | Đánh giá | User đã mua và đơn đã giao | Tạo đánh giá hợp lệ | Chưa mua, đơn chưa giao, đánh giá trùng, nội dung vi phạm |
| TC-ADMIN-01 | Quản lý đơn | Admin mở danh sách và chi tiết | Lọc, xem, cập nhật đúng đơn | Không tồn tại order, truy cập trái quyền |
| TC-IMPORT-01 | Nhập sản phẩm | File đúng template | Tạo import job và xử lý dữ liệu | Thiếu cột, dòng lỗi, file sai loại, SKU trùng |
| TC-NOTIFY-01 | Thông báo | Có notification chưa đọc | Hiển thị và đánh dấu đã đọc | Notification của user khác, ID không tồn tại |
| TC-AI-01 | Chat/try-on | Request hợp lệ và file hợp lệ | Trả kết quả hoặc lỗi có kiểm soát | Prompt rỗng, file quá lớn, provider timeout |
| TC-FIN-01 | Dashboard tài chính | Có dữ liệu tháng/ngày | Tính đúng doanh thu, chi phí, lợi nhuận | Tháng không tồn tại, dữ liệu thiếu, quyền không hợp lệ |

### 5.1. Test case chi tiết theo từng màn hình

#### Màn hình trang chủ – `/`

| ID | Kịch bản | Kết quả mong đợi |
|---|---|---|
| HOME-01 | Mở trang chủ khi chưa đăng nhập | Banner, danh mục và sản phẩm được tải đúng. |
| HOME-02 | Banner có link nội bộ | Click banner chuyển đúng trang đích. |
| HOME-03 | Banner bị ẩn hoặc hết thời gian | Không hiển thị banner không còn hiệu lực. |
| HOME-04 | API trang chủ lỗi | Hiển thị fallback/error state, không làm trắng toàn trang. |
| HOME-05 | Mở trên mobile | Layout không tràn ngang, menu và banner thao tác được. |

#### Màn hình đăng ký – `/register`

| ID | Kịch bản | Kết quả mong đợi |
|---|---|---|
| REG-01 | Nhập đủ email và mật khẩu hợp lệ | Gửi request đăng ký và chuyển sang bước OTP. |
| REG-02 | Bỏ trống email/mật khẩu | Hiển thị lỗi tại trường, không gọi API. |
| REG-03 | Email sai định dạng | Từ chối form và thông báo rõ lỗi. |
| REG-04 | Mật khẩu và xác nhận không khớp | Không cho submit. |
| REG-05 | Email đã tồn tại | Hiển thị lỗi conflict từ API. |
| REG-06 | Double click nút đăng ký | Chỉ tạo một request, nút chuyển loading. |

#### Màn hình đăng nhập – `/login`

| ID | Kịch bản | Kết quả mong đợi |
|---|---|---|
| LOGIN-01 | Đăng nhập đúng thông tin | Tạo phiên và chuyển tới trang phù hợp. |
| LOGIN-02 | Sai mật khẩu | Hiển thị lỗi, không tạo phiên. |
| LOGIN-03 | Tài khoản cần OTP | Hiển thị bước nhập OTP. |
| LOGIN-04 | Tài khoản bị khóa | Từ chối đăng nhập và thông báo trạng thái. |
| LOGIN-05 | Đăng nhập Google thành công | Tạo/nhận phiên và tải giao diện khách hàng. |
| LOGIN-06 | Refresh trang sau đăng nhập | Phiên hợp lệ vẫn được duy trì. |

#### Màn hình danh sách sản phẩm – `/products`

| ID | Kịch bản | Kết quả mong đợi |
|---|---|---|
| LIST-01 | Mở danh sách mặc định | Chỉ hiển thị sản phẩm PUBLIC. |
| LIST-02 | Tìm theo tên sản phẩm | Kết quả khớp từ khóa, không phân biệt hoa thường nếu API hỗ trợ. |
| LIST-03 | Lọc theo danh mục | Chỉ hiển thị sản phẩm thuộc danh mục đã chọn. |
| LIST-04 | Lọc size/màu/giá | Kết quả thỏa đồng thời các điều kiện lọc. |
| LIST-05 | Chuyển trang | Không lặp hoặc mất sản phẩm giữa các trang. |
| LIST-06 | Không có kết quả | Hiển thị empty state và tùy chọn xóa bộ lọc. |
| LIST-07 | API trả lỗi | Hiển thị lỗi và nút thử lại. |
| LIST-08 | Click thẻ sản phẩm | Chuyển đúng URL chi tiết theo slug/id thực tế. |

#### Màn hình chi tiết sản phẩm – `/products/[id]`

| ID | Kịch bản | Kết quả mong đợi |
|---|---|---|
| DETAIL-01 | Mở sản phẩm tồn tại | Hiển thị tên, giá, ảnh, mô tả, biến thể và tồn kho. |
| DETAIL-02 | Chọn size và màu | Giá/SKU/tồn kho/ảnh thay đổi theo biến thể nếu có. |
| DETAIL-03 | Chưa chọn biến thể bắt buộc | Nút thêm giỏ hàng bị chặn và có hướng dẫn. |
| DETAIL-04 | Nhập số lượng lớn hơn tồn kho | Hiển thị lỗi và không thêm vào giỏ. |
| DETAIL-05 | Thêm vào giỏ thành công | Toast thành công, số lượng giỏ cập nhật. |
| DETAIL-06 | Sản phẩm PRIVATE/DISCONTINUED | Không cho khách truy cập như sản phẩm công khai. |
| DETAIL-07 | Thêm/xóa yêu thích | Trạng thái nút và dữ liệu server đồng bộ. |
| DETAIL-08 | Gửi đánh giá không đủ điều kiện | API từ chối nếu chưa mua hoặc đơn chưa giao. |

#### Màn hình giỏ hàng – `/cart`

| ID | Kịch bản | Kết quả mong đợi |
|---|---|---|
| CART-01 | Mở giỏ có sản phẩm | Hiển thị đúng ảnh, biến thể, đơn giá, số lượng và tổng. |
| CART-02 | Tăng số lượng trong tồn kho | Cập nhật item và tổng tiền. |
| CART-03 | Tăng vượt tồn kho | Chặn thao tác và hiển thị tồn kho tối đa. |
| CART-04 | Giảm về số lượng hợp lệ | Lưu số lượng mới. |
| CART-05 | Xóa item | Item biến mất, tổng tiền cập nhật. |
| CART-06 | Giỏ rỗng | Hiển thị empty state và nút tiếp tục mua sắm. |
| CART-07 | Item bị xóa ở server | Hiển thị thông báo và đồng bộ lại giỏ. |
| CART-08 | Chưa đăng nhập | Chuyển tới đăng nhập hoặc thông báo theo rule hiện tại. |

#### Màn hình checkout – `/checkout`

| ID | Kịch bản | Kết quả mong đợi |
|---|---|---|
| CHECKOUT-01 | Mở checkout với giỏ hợp lệ | Hiển thị địa chỉ, sản phẩm, phí và tổng tiền. |
| CHECKOUT-02 | Chọn địa chỉ đã lưu | Điền đúng thông tin nhận hàng. |
| CHECKOUT-03 | Thêm địa chỉ mới | Validate trường bắt buộc và lưu thành công. |
| CHECKOUT-04 | Nhập địa chỉ bằng autocomplete | Chỉ địa chỉ đã chọn có tọa độ để tính phí. |
| CHECKOUT-05 | Áp dụng voucher hợp lệ | Discount và tổng tiền cập nhật. |
| CHECKOUT-06 | Voucher hết hạn/không đủ điều kiện | Không áp dụng và hiển thị lý do. |
| CHECKOUT-07 | Geoapify lỗi | Hiển thị phí fallback hoặc lỗi theo cấu hình, không crash. |
| CHECKOUT-08 | Tồn kho thay đổi trước khi đặt | Preview/checkout từ chối và yêu cầu cập nhật giỏ. |
| CHECKOUT-09 | Thanh toán COD | Tạo đơn đúng trạng thái chưa thanh toán. |
| CHECKOUT-10 | Thanh toán VNPay | Chuyển đúng URL/trạng thái và xử lý callback. |
| CHECKOUT-11 | Double submit đặt hàng | Không tạo hai đơn trùng. |

#### Màn hình kết quả checkout – `/checkout/success`

| ID | Kịch bản | Kết quả mong đợi |
|---|---|---|
| SUCCESS-01 | Đơn tạo thành công | Hiển thị mã đơn và thông tin tổng quan. |
| SUCCESS-02 | Refresh trang kết quả | Không tạo lại đơn hàng. |
| SUCCESS-03 | Callback thanh toán thất bại | Hiển thị trạng thái thất bại và hướng dẫn tiếp theo. |
| SUCCESS-04 | Mã đơn không tồn tại | Không hiển thị dữ liệu của người khác. |

#### Màn hình tài khoản – `/account`, `/account/profile`, `/account/addresses`

| ID | Kịch bản | Kết quả mong đợi |
|---|---|---|
| ACCOUNT-01 | Mở tài khoản khi chưa đăng nhập | Chuyển tới login. |
| ACCOUNT-02 | Cập nhật tên/số điện thoại | Lưu đúng dữ liệu và hiển thị thông báo. |
| ACCOUNT-03 | Đổi mật khẩu sai mật khẩu cũ | Từ chối thay đổi. |
| ACCOUNT-04 | Thêm/sửa/xóa địa chỉ | Chỉ thay đổi địa chỉ của user hiện tại. |
| ACCOUNT-05 | Chọn địa chỉ mặc định | Chỉ có địa chỉ được chọn là default. |
| ACCOUNT-06 | Gọi API bằng user khác | Trả 401/403, không lộ dữ liệu. |

#### Màn hình đơn hàng khách hàng – `/account/orders`

| ID | Kịch bản | Kết quả mong đợi |
|---|---|---|
| ORDERS-01 | Mở danh sách đơn | Chỉ hiển thị đơn của user hiện tại. |
| ORDERS-02 | Lọc hoặc mở chi tiết đơn | Đúng trạng thái, sản phẩm, thanh toán và giao hàng. |
| ORDERS-03 | Hủy đơn ở trạng thái cho phép | Đơn chuyển CANCELLED và có lịch sử. |
| ORDERS-04 | Hủy đơn đã giao | API từ chối. |
| ORDERS-05 | Xem hóa đơn | Trả đúng hóa đơn của đơn đang đăng nhập. |
| ORDERS-06 | Đánh giá sản phẩm đã mua | Cho phép sau khi đủ điều kiện giao hàng. |

#### Màn hình admin sản phẩm – `/admin/products`

| ID | Kịch bản | Kết quả mong đợi |
|---|---|---|
| APROD-01 | Admin mở danh sách | Hiển thị sản phẩm và trạng thái quản trị. |
| APROD-02 | Tìm/lọc sản phẩm | Kết quả đúng điều kiện và phân trang. |
| APROD-03 | Thêm sản phẩm | Lưu thông tin, biến thể, ảnh và tồn kho. |
| APROD-04 | Thiếu trường bắt buộc | Không lưu, lỗi hiển thị tại form. |
| APROD-05 | Sửa sản phẩm | Dữ liệu cập nhật không làm mất biến thể không sửa. |
| APROD-06 | Xóa sản phẩm | Có xác nhận; sản phẩm không còn xuất hiện theo rule. |
| APROD-07 | Đổi PUBLIC/PRIVATE | Storefront phản ánh đúng trạng thái. |
| APROD-08 | Upload ảnh lỗi | Từ chối file sai loại/quá dung lượng. |
| APROD-09 | Import file đúng template | Tạo job và hiển thị kết quả xử lý. |
| APROD-10 | Import file sai dữ liệu | Ghi lỗi theo từng dòng, không tạo dữ liệu sai. |

#### Màn hình admin danh mục – `/admin/categories`

| ID | Kịch bản | Kết quả mong đợi |
|---|---|---|
| ACAT-01 | Tạo danh mục | Tạo thành công với tên/slug hợp lệ. |
| ACAT-02 | Slug trùng | Từ chối và báo lỗi rõ ràng. |
| ACAT-03 | Sửa danh mục có sản phẩm | Không làm mất liên kết sản phẩm. |
| ACAT-04 | Xóa danh mục đang được dùng | Chặn hoặc yêu cầu xử lý liên kết trước. |

#### Màn hình admin đơn hàng – `/admin/orders`

| ID | Kịch bản | Kết quả mong đợi |
|---|---|---|
| AORDER-01 | Mở danh sách đơn | Hiển thị mã đơn, user, tổng, payment và status. |
| AORDER-02 | Lọc theo trạng thái | Chỉ trả đúng trạng thái. |
| AORDER-03 | Mở chi tiết đơn | Hiển thị item snapshot, shipping, payment, history. |
| AORDER-04 | Cập nhật trạng thái hợp lệ | Lưu trạng thái và ghi OrderStatusHistory. |
| AORDER-05 | Chuyển trạng thái không hợp lệ | API từ chối, không thay đổi dữ liệu. |
| AORDER-06 | Phát hành hóa đơn | Tạo số hóa đơn duy nhất và trạng thái ISSUED. |
| AORDER-07 | Gửi thông báo đơn mới | Admin notification được tạo/gửi theo cấu hình. |

#### Màn hình admin dashboard/tài chính – `/admin`, `/admin/daily-detail/[id]`, `/admin/monthly-detail/[id]`

| ID | Kịch bản | Kết quả mong đợi |
|---|---|---|
| DASH-01 | Mở dashboard có dữ liệu | Hiển thị tổng quan doanh thu, chi phí, lợi nhuận. |
| DASH-02 | Chọn năm/tháng | Biểu đồ và số liệu đổi đúng kỳ. |
| DASH-03 | Thêm chi phí tháng | Tổng chi phí và lợi nhuận cập nhật. |
| DASH-04 | Sửa/xóa chi phí | Dữ liệu và tổng hợp được tính lại. |
| DASH-05 | Xem sản phẩm bán chạy | Xếp hạng khớp dữ liệu đơn hàng. |
| DASH-06 | Xuất chi tiết | File export có đúng kỳ và cột dữ liệu. |
| DASH-07 | User không phải admin truy cập | Bị từ chối và không trả dữ liệu tài chính. |

#### Màn hình admin nội dung, đánh giá, thông báo và cấu hình

| ID | Màn hình | Kịch bản | Kết quả mong đợi |
|---|---|---|---|
| CONTENT-01 | Banners | Tạo/sửa/xóa/sắp xếp banner | Storefront hiển thị đúng thứ tự và trạng thái. |
| CONTENT-02 | Policies | Soạn nội dung rich text và publish | Khách xem đúng nội dung đã publish. |
| REVIEW-01 | Reviews | Duyệt/ẩn đánh giá | Trạng thái hiển thị đúng ở storefront. |
| NOTIFY-01 | Notifications | Đánh dấu một hoặc tất cả đã đọc | Badge unread cập nhật đúng. |
| PUSH-01 | Push settings | Đăng ký subscription và gửi test | Thiết bị nhận hoặc ghi nhận lỗi gửi. |
| SETTING-01 | Payment settings | Cập nhật cấu hình thanh toán | Chỉ admin được phép và không lộ secret. |
| SHIPPING-01 | Shipping settings | Sửa cấu hình/phí khuyến mãi | Quote checkout dùng cấu hình mới. |

## 6. Test case kiểm thử giao diện

- Kiểm tra menu, header, footer, modal và toast trên desktop/mobile.
- Kiểm tra loading, empty state, error state và retry khi API lỗi.
- Kiểm tra form không cho submit khi thiếu trường bắt buộc.
- Kiểm tra tổng tiền và trạng thái nút checkout thay đổi đúng theo giỏ hàng.
- Kiểm tra dữ liệu không mất khi reload ở các luồng được thiết kế để lưu theo tài khoản.
- Kiểm tra keyboard focus, label, thông báo lỗi và khả năng thao tác cơ bản bằng bàn phím.

## 7. Báo cáo độ phủ

Repository hiện có script chạy test nhưng chưa có script coverage riêng trong `package.json`. Khi nộp báo cáo, phải chạy công cụ coverage được nhóm thống nhất và lưu nguyên output, ví dụ:

```bash
node --test --experimental-test-coverage \
  src/lib/**/*.test.ts
```

Báo cáo độ phủ phải có tối thiểu:

- Line coverage.
- Function coverage.
- Branch coverage.
- Danh sách file chưa được cover hoặc có độ phủ thấp.
- Ngưỡng nhóm đặt ra và lý do nếu chưa đạt.

Không tự ghi phần trăm độ phủ khi chưa chạy tool. Nếu command trên không phù hợp với phiên bản Node hoặc glob của môi trường, phải ghi lệnh thực tế đã dùng và lưu output tương ứng.

## 8. Danh sách defect

| ID | Chức năng | Mô tả lỗi | Mức độ | Trạng thái | Người xử lý | Bằng chứng |
|---|---|---|---|---|---|---|
| DEF-001 | Bộ test tự động | Không phát hiện defect trong phạm vi 102 test tự động đã chạy. | - | Closed | Danh Nguyễn | `npm test`: 102 pass, 0 fail, 0 skipped |
| DEF-002 | CD Production | Workflow `CD - Vercel` trên nhánh `main` thất bại khi triển khai commit `8899deb`; cần kiểm tra log Vercel credentials/môi trường production. | High | Open | Danh Nguyễn | [CD run #370](https://github.com/nguyencongdanh782001/finance-app/actions/runs/45773322138) |

Quy tắc trạng thái:

- **Open:** đã xác nhận có lỗi, chưa sửa.
- **Fixed:** đã sửa trong mã nguồn, chờ chạy lại test.
- **Retest:** đã chạy lại, đang xác nhận kết quả.
- **Closed:** test pass và có bằng chứng.
- **Won't fix/Deferred:** chưa sửa, phải ghi rõ lý do và người phê duyệt.

Không xóa defect đã phát hiện. Defect còn mở phải xuất hiện trong báo cáo cuối kỳ cùng mức độ, tác động và kế hoạch xử lý.

## 9. Tiêu chí nghiệm thu kiểm thử

- Có kế hoạch và phạm vi kiểm thử được duyệt.
- Mỗi chức năng chính có test case pass và ca lỗi.
- Mã nguồn test tự động chạy được bằng lệnh đã ghi nhận.
- Có nguyên báo cáo độ phủ, không chỉ ghi một con số tổng hợp.
- Có danh sách defect và trạng thái mới nhất.
- Không còn defect Critical/High mở nếu chưa có chấp thuận rủi ro.
- Các defect đã sửa có test hồi quy hoặc bằng chứng chạy lại.

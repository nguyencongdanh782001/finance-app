# CHƯƠNG 4: KIỂM THỬ VÀ TRIỂN KHAI HỆ THỐNG

## 4.1. Kiểm thử hệ thống

Việc kiểm thử được thực hiện theo các nhóm chức năng chính của website thương mại điện tử. Mỗi trường hợp kiểm thử gồm mã kiểm thử, chức năng, dữ liệu đầu vào, kết quả mong đợi và trạng thái thực tế. Các ảnh chụp màn hình minh chứng do người thực hiện tự chụp trong quá trình kiểm thử.

### 4.1.1. Đăng ký và đăng nhập

**Bảng 4.1. Kiểm thử đăng ký và đăng nhập**

| ID    | Chức năng     | Dữ liệu kiểm thử                  | Kết quả mong đợi                         | Trạng thái                |
| ----- | ------------- | --------------------------------- | ---------------------------------------- | ------------------------- |
| TC001 | Đăng ký       | Thông tin hợp lệ và mã OTP hợp lệ | Tạo tài khoản thành công                 | Cập nhật sau khi kiểm thử |
| TC002 | Đăng ký       | Email đã tồn tại                  | Hiển thị thông báo tài khoản đã tồn tại  | Cập nhật sau khi kiểm thử |
| TC003 | Đăng ký       | Thiếu email hoặc mật khẩu         | Hiển thị thông báo bắt buộc nhập dữ liệu | Cập nhật sau khi kiểm thử |
| TC004 | Đăng ký       | Mật khẩu không đủ 8 ký tự         | Hiển thị thông báo mật khẩu không hợp lệ | Cập nhật sau khi kiểm thử |
| TC005 | Đăng nhập     | Email và mật khẩu hợp lệ          | Đăng nhập thành công                     | Cập nhật sau khi kiểm thử |
| TC006 | Đăng nhập     | Sai mật khẩu                      | Hiển thị thông báo lỗi xác thực          | Cập nhật sau khi kiểm thử |
| TC007 | Quên mật khẩu | Email hợp lệ và OTP hợp lệ        | Cho phép tạo mật khẩu mới                | Cập nhật sau khi kiểm thử |

### 4.1.2. Sản phẩm, giỏ hàng và yêu thích

**Bảng 4.2. Kiểm thử sản phẩm và giỏ hàng**

| ID    | Chức năng         | Dữ liệu kiểm thử                         | Kết quả mong đợi                                    | Trạng thái                |
| ----- | ----------------- | ---------------------------------------- | --------------------------------------------------- | ------------------------- |
| TC008 | Tìm kiếm sản phẩm | Nhập từ khóa hợp lệ                      | Hiển thị đúng sản phẩm liên quan                    | Cập nhật sau khi kiểm thử |
| TC009 | Lọc sản phẩm      | Chọn danh mục, giới tính hoặc khoảng giá | Danh sách được lọc đúng điều kiện                   | Cập nhật sau khi kiểm thử |
| TC010 | Xem chi tiết      | Chọn sản phẩm đang công khai             | Hiển thị ảnh, giá, biến thể và tồn kho              | Cập nhật sau khi kiểm thử |
| TC011 | Thêm vào giỏ      | Chọn biến thể và số lượng hợp lệ         | Sản phẩm được thêm vào giỏ hàng                     | Cập nhật sau khi kiểm thử |
| TC012 | Cập nhật giỏ hàng | Thay đổi số lượng hoặc xóa sản phẩm      | Tổng tiền được cập nhật chính xác                   | Cập nhật sau khi kiểm thử |
| TC013 | Yêu thích         | Khách hàng đã đăng nhập                  | Sản phẩm được thêm hoặc bỏ khỏi danh sách yêu thích | Cập nhật sau khi kiểm thử |

### 4.1.3. Checkout và thanh toán

**Bảng 4.3. Kiểm thử đặt hàng và thanh toán**

| ID    | Chức năng             | Dữ liệu kiểm thử                          | Kết quả mong đợi                                                | Trạng thái                |
| ----- | --------------------- | ----------------------------------------- | --------------------------------------------------------------- | ------------------------- |
| TC014 | Chọn địa chỉ          | Địa chỉ hợp lệ                            | Địa chỉ được chọn cho đơn hàng                                  | Cập nhật sau khi kiểm thử |
| TC015 | Tính phí vận chuyển   | Địa chỉ giao hàng hợp lệ                  | Hiển thị phí vận chuyển phù hợp                                 | Cập nhật sau khi kiểm thử |
| TC016 | Áp dụng voucher       | Mã còn hiệu lực và đủ điều kiện           | Đơn hàng được giảm đúng giá trị                                 | Cập nhật sau khi kiểm thử |
| TC017 | Đặt COD               | Sản phẩm và thông tin nhận hàng hợp lệ    | Tạo đơn với trạng thái chưa thanh toán                          | Cập nhật sau khi kiểm thử |
| TC018 | Đặt chuyển khoản      | Cấu hình VietQR hợp lệ                    | Tạo đơn và hiển thị thông tin chuyển khoản/QR                   | Cập nhật sau khi kiểm thử |
| TC019 | Báo đã chuyển khoản   | Đơn hàng chuyển khoản đang chờ thanh toán | Trạng thái chuyển sang chờ admin kiểm tra                       | Cập nhật sau khi kiểm thử |
| TC020 | Thiếu cấu hình VietQR | Chưa cấu hình ngân hàng hoặc số tài khoản | Không cho thanh toán chuyển khoản và hiển thị hướng dẫn phù hợp | Cập nhật sau khi kiểm thử |

### 4.1.4. Tài khoản và quản lý đơn hàng

**Bảng 4.4. Kiểm thử tài khoản và đơn hàng**

| ID    | Chức năng         | Dữ liệu kiểm thử                   | Kết quả mong đợi                                      | Trạng thái                |
| ----- | ----------------- | ---------------------------------- | ----------------------------------------------------- | ------------------------- |
| TC021 | Cập nhật hồ sơ    | Thông tin cá nhân hợp lệ           | Lưu thông tin thành công                              | Cập nhật sau khi kiểm thử |
| TC022 | Quản lý địa chỉ   | Thêm, sửa và chọn địa chỉ mặc định | Địa chỉ được lưu đúng                                 | Cập nhật sau khi kiểm thử |
| TC023 | Xem danh sách đơn | Khách hàng đã có đơn hàng          | Hiển thị đúng đơn và trạng thái                       | Cập nhật sau khi kiểm thử |
| TC024 | Xem chi tiết đơn  | Chọn một đơn hàng hợp lệ           | Hiển thị sản phẩm, thanh toán, giao hàng và lịch sử   | Cập nhật sau khi kiểm thử |
| TC025 | Hủy đơn           | Đơn chưa được xác nhận             | Hủy đơn thành công                                    | Cập nhật sau khi kiểm thử |
| TC026 | Xem voucher       | Khách hàng có voucher              | Hiển thị mã, giá trị, thời gian và trạng thái voucher | Cập nhật sau khi kiểm thử |

### 4.1.5. Quản trị sản phẩm và danh mục

**Bảng 4.5. Kiểm thử quản trị sản phẩm**

| ID    | Chức năng         | Dữ liệu kiểm thử                  | Kết quả mong đợi                              | Trạng thái                |
| ----- | ----------------- | --------------------------------- | --------------------------------------------- | ------------------------- |
| TC027 | Tạo sản phẩm      | Nhập đầy đủ thông tin và biến thể | Tạo sản phẩm thành công                       | Cập nhật sau khi kiểm thử |
| TC028 | Cập nhật sản phẩm | Thay đổi giá, ảnh hoặc tồn kho    | Dữ liệu được cập nhật chính xác               | Cập nhật sau khi kiểm thử |
| TC029 | Ẩn sản phẩm       | Chọn sản phẩm đang công khai      | Sản phẩm không còn hiển thị ở storefront      | Cập nhật sau khi kiểm thử |
| TC030 | Quản lý danh mục  | Tạo hoặc cập nhật danh mục        | Danh mục hiển thị đúng ở bộ lọc               | Cập nhật sau khi kiểm thử |
| TC031 | Phân loại thử đồ  | Chọn loại áo, quần hoặc đầm       | Sản phẩm được phân loại đúng cho tính năng AI | Cập nhật sau khi kiểm thử |

### 4.1.6. Quản trị đơn hàng và thanh toán

**Bảng 4.6. Kiểm thử quản trị đơn hàng**

| ID    | Chức năng                  | Dữ liệu kiểm thử                                | Kết quả mong đợi                             | Trạng thái                |
| ----- | -------------------------- | ----------------------------------------------- | -------------------------------------------- | ------------------------- |
| TC032 | Lọc đơn hàng               | Lọc theo trạng thái hoặc phương thức thanh toán | Hiển thị đúng danh sách đơn                  | Cập nhật sau khi kiểm thử |
| TC033 | Cập nhật trạng thái đơn    | Chọn trạng thái hợp lệ                          | Đơn hàng và timeline được cập nhật           | Cập nhật sau khi kiểm thử |
| TC034 | Xác nhận chuyển khoản      | Có giao dịch khớp với đơn hàng                  | Thanh toán được xác nhận và lưu lịch sử      | Cập nhật sau khi kiểm thử |
| TC035 | Báo chuyển khoản chưa khớp | Số tiền hoặc nội dung không khớp                | Không xác nhận, giữ trạng thái chờ kiểm tra  | Cập nhật sau khi kiểm thử |
| TC036 | Xem thông báo admin        | Có đơn mới hoặc khách báo chuyển khoản          | Admin nhận thông báo và mở được chi tiết đơn | Cập nhật sau khi kiểm thử |

### 4.1.7. Quản trị voucher, membership và nội dung

**Bảng 4.7. Kiểm thử các chức năng quản trị bổ sung**

| ID    | Chức năng                       | Dữ liệu kiểm thử                             | Kết quả mong đợi                                               | Trạng thái                |
| ----- | ------------------------------- | -------------------------------------------- | -------------------------------------------------------------- | ------------------------- |
| TC037 | Tạo voucher chung               | Nhập mã, giá trị và thời gian hợp lệ         | Voucher được tạo và áp dụng đúng điều kiện                     | Cập nhật sau khi kiểm thử |
| TC038 | Tặng voucher theo số điện thoại | Nhập số điện thoại khách hàng đang hoạt động | Voucher chỉ hiển thị với khách hàng đó                         | Cập nhật sau khi kiểm thử |
| TC039 | Tạm dừng voucher                | Tạm dừng voucher đang hoạt động              | Voucher không còn hiển thị phía khách hàng                     | Cập nhật sau khi kiểm thử |
| TC040 | Quản lý membership              | Cập nhật hạng và quyền lợi                   | Thông tin được hiển thị đúng cho khách hàng                    | Cập nhật sau khi kiểm thử |
| TC041 | Quản lý chính sách              | Tạo và xuất bản chính sách                   | Chính sách hiển thị tại trang policies và footer theo cấu hình | Cập nhật sau khi kiểm thử |
| TC042 | Ẩn chính sách                   | Chuyển chính sách sang ẩn                    | Chính sách không còn hiển thị công khai                        | Cập nhật sau khi kiểm thử |

### 4.1.8. Responsive và tính năng AI thử đồ

**Bảng 4.8. Kiểm thử responsive và AI**

| ID    | Chức năng                | Dữ liệu kiểm thử                            | Kết quả mong đợi                                       | Trạng thái                |
| ----- | ------------------------ | ------------------------------------------- | ------------------------------------------------------ | ------------------------- |
| TC043 | Responsive storefront    | Mở website trên điện thoại và máy tính bảng | Nội dung không tràn, thao tác sử dụng được             | Cập nhật sau khi kiểm thử |
| TC044 | Responsive checkout      | Mở trang checkout trên màn hình nhỏ         | Form và phương thức thanh toán xếp đúng chiều dọc      | Cập nhật sau khi kiểm thử |
| TC045 | Tải ảnh thử đồ           | Ảnh JPG/PNG không vượt quá giới hạn         | Ảnh được tải lên và hiển thị xem trước                 | Cập nhật sau khi kiểm thử |
| TC046 | Thử đồ AI                | Chọn ảnh người và sản phẩm có hỗ trợ        | Hiển thị ảnh kết quả hoặc thông báo trạng thái rõ ràng | Cập nhật sau khi kiểm thử |
| TC047 | Sản phẩm không hỗ trợ AI | Chọn phụ kiện hoặc loại chưa hỗ trợ         | Hiển thị thông báo không hỗ trợ, không gửi request lỗi | Cập nhật sau khi kiểm thử |

## 4.2. Triển khai hệ thống

Website được triển khai theo mô hình frontend và backend Next.js kết hợp cơ sở dữ liệu PostgreSQL. Các biến môi trường được cấu hình riêng cho môi trường phát triển và môi trường production, bao gồm chuỗi kết nối cơ sở dữ liệu, thông tin xác thực, Cloudinary, VietQR và các dịch vụ tích hợp.

Trước khi triển khai production, cần thực hiện các bước:

1. Kiểm tra type-check, lint và các unit test.
2. Chạy migration cơ sở dữ liệu trên môi trường production.
3. Cấu hình biến môi trường production, không đưa secret vào source code.
4. Build ứng dụng và kiểm tra các route storefront, admin, checkout và API.
5. Kiểm tra quyền truy cập của khách hàng, quản trị viên và các endpoint thanh toán.
6. Kiểm tra lại thông tin VietQR bằng một đơn hàng thử nghiệm có giá trị nhỏ.

Các hình ảnh triển khai, kết quả kiểm thử và ảnh chụp giao diện được bổ sung sau khi thực hiện trên môi trường thực tế.

## 4.3. Kết luận kiểm thử

Nội dung kiểm thử cần được thực hiện trên môi trường staging hoặc production đã cấu hình đầy đủ. Cột trạng thái trong các bảng được để **“Cập nhật sau khi kiểm thử”** để tránh ghi nhận kết quả khi chưa có ảnh chụp và bằng chứng thực tế. Sau khi hoàn tất, thay bằng **Pass/Fail** và đính kèm hình ảnh tương ứng.

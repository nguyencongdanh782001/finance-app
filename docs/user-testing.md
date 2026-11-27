# Thực nghiệm người dùng và cải tiến theo phản hồi

## 1. Mục tiêu

Đánh giá khả năng người dùng thật hoàn thành các tác vụ chính trên website bán quần áo, phát hiện điểm gây khó hiểu hoặc lỗi thao tác, sau đó thực hiện cải tiến và kiểm thử lại.

## 2. Đối tượng tham gia

- Số lượng: **5–10 người dùng thật**.
- Đối tượng phù hợp: người từng mua quần áo online, có thể sử dụng trình duyệt trên điện thoại hoặc máy tính.
- Không thu thập mật khẩu, thông tin thẻ, mã OTP thật hoặc dữ liệu cá nhân không cần thiết.
- Mỗi người tham gia được gán mã ẩn danh `U01`, `U02`, ... `U10`.
- Ghi nhận thiết bị, trình duyệt và kinh nghiệm mua hàng ở mức tổng quát để phân tích, không ghi thông tin nhận dạng không cần thiết.

## 3. Kịch bản thực nghiệm

Người hướng dẫn chỉ đọc mục tiêu của tác vụ, không hướng dẫn từng cú click. Nếu người dùng bị kẹt, ghi lại thời điểm và chỉ hỗ trợ sau khi đã xác định lỗi hoặc điểm khó hiểu.

| Mã | Tác vụ giao cho người dùng | Điều kiện hoàn thành |
|---|---|---|
| TASK-01 | Mở website và đăng ký một tài khoản mới bằng email thử nghiệm. | Tài khoản được tạo và người dùng vào được trang chính/tài khoản. |
| TASK-02 | Đăng xuất rồi đăng nhập lại bằng tài khoản vừa tạo. | Đăng nhập thành công và phiên được duy trì khi tải lại trang. |
| TASK-03 | Tìm một sản phẩm theo từ khóa và lọc theo danh mục/size/màu. | Tìm được sản phẩm phù hợp với yêu cầu. |
| TASK-04 | Mở chi tiết sản phẩm, chọn biến thể và xem thông tin giá/tồn kho. | Chọn đúng biến thể trước khi thêm vào giỏ. |
| TASK-05 | Thêm sản phẩm vào giỏ, đổi số lượng và xóa một sản phẩm. | Tổng tiền và danh sách giỏ hàng cập nhật đúng. |
| TASK-06 | Vào checkout, chọn hoặc thêm địa chỉ giao hàng. | Địa chỉ hợp lệ được chọn và phí giao hàng hiển thị. |
| TASK-07 | Áp dụng một voucher thử nghiệm hợp lệ. | Discount và tổng tiền thay đổi đúng. |
| TASK-08 | Tạo đơn hàng bằng phương thức COD trong môi trường thử nghiệm. | Đơn được tạo và trang thành công hiển thị mã đơn. |
| TASK-09 | Mở lịch sử đơn hàng và xem chi tiết đơn vừa tạo. | Người dùng tìm thấy đúng đơn và trạng thái đơn. |
| TASK-10 | Thử yêu thích một sản phẩm và viết đánh giá nếu đủ điều kiện. | Trạng thái yêu thích/đánh giá được lưu hoặc thông báo điều kiện rõ ràng. |

Không dùng thanh toán thật trong thực nghiệm. Nếu kiểm tra VNPay, chỉ sử dụng môi trường sandbox và dữ liệu thử nghiệm.

## 4. Dữ liệu cần thu thập

### 4.1. Dữ liệu định lượng

- Thời gian hoàn thành từng tác vụ, tính từ lúc bắt đầu đến khi đạt điều kiện hoàn thành.
- Tỷ lệ hoàn thành tác vụ.
- Số lần người dùng click sai hoặc quay lại bước trước.
- Số lần cần người hướng dẫn hỗ trợ.
- Số lỗi hệ thống/API nhìn thấy trong quá trình thực nghiệm.
- Số lần nhập lại dữ liệu hoặc sửa form.
- Điểm dễ sử dụng sau mỗi tác vụ theo thang 1–5.
- Điểm hài lòng chung sau buổi thực nghiệm theo thang 1–5.

### 4.2. Dữ liệu định tính

- Câu nói hoặc nhận xét trực tiếp của người dùng.
- Điểm người dùng thấy dễ hiểu, khó hiểu hoặc không chắc chắn.
- Vị trí người dùng dừng lại, tìm kiếm lâu hoặc thao tác lặp.
- Lý do người dùng không hoàn thành tác vụ.
- Đề xuất cải tiến ưu tiên cao.

## 5. Biểu mẫu ghi nhận theo người dùng

| Người dùng | Thiết bị/trình duyệt | TASK-01 | TASK-02 | TASK-03 | TASK-04 | TASK-05 | TASK-06 | TASK-07 | TASK-08 | TASK-09 | TASK-10 |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| U01 | `Cần điền` | `s/phút, pass/fail` | `s/phút, pass/fail` | `s/phút, pass/fail` | `s/phút, pass/fail` | `s/phút, pass/fail` | `s/phút, pass/fail` | `s/phút, pass/fail` | `s/phút, pass/fail` | `s/phút, pass/fail` | `s/phút, pass/fail` |
| U02 | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` |
| U03 | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` |
| U04 | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` |
| U05 | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` |

Nếu thực nghiệm có 6–10 người, thêm dòng tương ứng thay vì để trống dữ liệu.

## 6. Bảng tổng hợp chỉ số

| Tác vụ | Số người tham gia | Số người hoàn thành | Tỷ lệ hoàn thành | Thời gian trung bình | Số lỗi trung bình | Điểm dễ dùng TB |
|---|---:|---:|---:|---:|---:|---:|
| Đăng ký/đăng nhập | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` |
| Tìm kiếm/lọc | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` |
| Chi tiết/thêm giỏ hàng | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` |
| Checkout/đặt hàng | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` |
| Lịch sử đơn hàng | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` | `Cần điền` |

Không điền số liệu ước lượng như số liệu đã đo. Nếu chưa thực nghiệm, ghi trạng thái **chưa thực hiện**.

## 7. Nhật ký phản hồi

| Mã phản hồi | Người dùng | Màn hình/tác vụ | Phản hồi hoặc vấn đề | Mức độ | Bằng chứng |
|---|---|---|---|---|---|
| FB-001 | `U01` | `Màn hình/tác vụ` | Ghi nguyên ý kiến hoặc mô tả quan sát | Cao/Vừa/Thấp | Ảnh, video, log hoặc thời gian xảy ra |
| FB-002 | `U02` | `Màn hình/tác vụ` | `Cần điền` | `Cần điền` | `Cần điền` |

## 8. Danh sách cải tiến từ phản hồi

| ID | Phản hồi gốc | Cải tiến đã thực hiện | File/chức năng liên quan | Trạng thái | Kết quả kiểm tra lại |
|---|---|---|---|---|---|
| UX-001 | `Cần điền phản hồi thật` | `Cần điền thay đổi cụ thể` | `Cần điền file hoặc màn hình` | Planned/In progress/Done | `Cần điền số liệu trước-sau` |
| UX-002 | `Cần điền phản hồi thật` | `Cần điền thay đổi cụ thể` | `Cần điền file hoặc màn hình` | Planned/In progress/Done | `Cần điền` |

Một cải tiến chỉ được đánh dấu **Done** khi đã sửa trong mã nguồn, có test hồi quy và đã kiểm tra lại với ít nhất một kịch bản liên quan.

## 9. Quy trình thực hiện và báo cáo

1. Chuẩn bị môi trường demo public, tài khoản thử nghiệm và dữ liệu sản phẩm/voucher không nhạy cảm.
2. Giải thích mục tiêu, thời lượng và xin sự đồng ý tham gia.
3. Cho từng người thực hiện cùng một bộ tác vụ, ghi thời gian và lỗi mà không can thiệp sớm.
4. Hỏi cảm nhận sau mỗi nhóm tác vụ và ghi nhận nhận xét nguyên ý.
5. Tổng hợp chỉ số, nhóm các vấn đề trùng nhau và xếp ưu tiên.
6. Sửa các vấn đề được chọn, ghi lại file/chức năng đã sửa.
7. Chạy lại test tự động và thực hiện lại tác vụ bị ảnh hưởng.
8. Cập nhật bảng cải tiến với trạng thái và số liệu sau cải tiến.

## 10. Tiêu chí nghiệm thu

- Có 5–10 người dùng thật hoặc ghi rõ lý do nếu chưa đủ.
- Có kịch bản tác vụ cụ thể và cùng một cách hướng dẫn cho mọi người.
- Có dữ liệu thời gian hoàn thành, tỷ lệ hoàn thành, số lỗi và điểm dễ dùng.
- Có phản hồi định tính và bằng chứng thu thập phù hợp.
- Có danh sách cải tiến liên kết với phản hồi cụ thể.
- Các cải tiến đã làm có trạng thái, file/chức năng liên quan và kết quả kiểm tra lại.
- Không công khai thông tin cá nhân, mật khẩu, OTP hoặc dữ liệu thanh toán của người tham gia.

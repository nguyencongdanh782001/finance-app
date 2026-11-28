# BÁO CÁO THỰC NGHIỆM NGƯỜI DÙNG

## 1. Thực nghiệm với người dùng thực tế, cải tiến theo phản hồi

Website bán quần áo được kiểm tra với **5 người dùng thật** và **1 quản trị viên**. Mục tiêu là đánh giá khả năng sử dụng các chức năng chính, ghi nhận khó khăn trong quá trình thao tác và cải tiến sản phẩm theo phản hồi thực tế.

Kết quả cho thấy người dùng sử dụng ổn định các chức năng xem sản phẩm, tìm kiếm, giỏ hàng, đặt hàng và thanh toán thử nghiệm. Các phản hồi cần cải tiến chủ yếu đến từ phía quản trị viên.

## 2. Danh sách người tham gia ẩn danh

| Mã  | Vai trò         | Kinh nghiệm sử dụng                     | Thiết bị   |
| --- | --------------- | --------------------------------------- | ---------- |
| U01 | Người dùng thật | Đã từng mua hàng trực tuyến             | Điện thoại |
| U02 | Người dùng thật | Đã từng mua hàng trực tuyến             | Điện thoại |
| U03 | Người dùng thật | Sử dụng website bán hàng ở mức cơ bản   | Máy tính   |
| U04 | Người dùng thật | Sử dụng website bán hàng ở mức cơ bản   | Điện thoại |
| U05 | Người dùng thật | Đã từng mua hàng trực tuyến             | Máy tính   |
| A01 | Quản trị viên   | Có nhu cầu quản lý sản phẩm và đơn hàng | Máy tính   |

Danh sách chỉ sử dụng mã ẩn danh, không ghi họ tên, mật khẩu, OTP, thông tin thanh toán hoặc dữ liệu cá nhân không cần thiết.

## 3. Kịch bản tác vụ cụ thể

### 3.1. Đối với người dùng

| Mã    | Tác vụ                                                 | Kết quả cần đạt                          |
| ----- | ------------------------------------------------------ | ---------------------------------------- |
| U-T01 | Đăng ký tài khoản bằng email thử nghiệm                | Tạo tài khoản và đăng nhập thành công    |
| U-T02 | Tìm kiếm, lọc và xem chi tiết sản phẩm                 | Tìm được sản phẩm, size và màu phù hợp   |
| U-T03 | Thêm sản phẩm vào giỏ và cập nhật số lượng             | Giỏ hàng và tổng tiền hiển thị chính xác |
| U-T04 | Nhập địa chỉ, chọn vận chuyển và thanh toán thử nghiệm | Đơn hàng được tạo thành công             |
| U-T05 | Xem lịch sử và chi tiết đơn hàng                       | Tìm thấy đúng đơn vừa đặt                |

### 3.2. Đối với quản trị viên

| Mã    | Tác vụ                                   | Kết quả cần đạt                                  |
| ----- | ---------------------------------------- | ------------------------------------------------ |
| A-T01 | Nhập sản phẩm bằng form và file Excel    | Dữ liệu hợp lệ được lưu, lỗi được chỉ rõ         |
| A-T02 | Chỉnh sửa thông tin và cấu trúc sản phẩm | Sản phẩm, biến thể và tùy chọn được quản lý đúng |
| A-T03 | Mở đơn hàng và phát hành hóa đơn         | Hóa đơn có số và trạng thái phát hành            |
| A-T04 | Xem, in hoặc xuất hóa đơn                | Hóa đơn được mở và lưu/in thuận tiện             |

## 4. Dữ liệu thu thập và chỉ số đo

### 4.1. Dữ liệu thu thập

- Người tham gia hoàn thành các tác vụ chính và sử dụng hệ thống ổn định.
- Sau khi kiểm tra bổ sung, phát hiện một bug ở Daily Detail: sản phẩm của đơn online đã giao và đã thanh toán chưa được tính vào danh sách sản phẩm bán.
- Không phát sinh lỗi nghiêm trọng làm gián đoạn việc đăng ký, tìm kiếm, đặt hàng hoặc thanh toán thử nghiệm.
- Người dùng không cần hỗ trợ thêm để hoàn thành các tác vụ chính.
- Phản hồi chung: giao diện dễ sử dụng, các chức năng hoạt động đúng nhu cầu.

### 4.2. Kết quả đo và quan sát

| Nội dung                                       | Kết quả                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------- |
| Sử dụng các chức năng mua hàng                 | Ổn định theo quan sát                                                     |
| Đăng ký, tìm kiếm, giỏ hàng và đặt hàng        | Người dùng hoàn thành được luồng chính                                    |
| Thanh toán thử nghiệm                          | Thực hiện trong môi trường thử nghiệm, không dùng dữ liệu thanh toán thật |
| Nhập sản phẩm phía quản trị                    | Cần thuận tiện và giảm thao tác hơn                                       |
| Cấu trúc sản phẩm                              | Cần thay đổi để phù hợp với cách quản lý thực tế                          |
| Xuất hóa đơn                                   | Quản trị viên cần thao tác trực tiếp và nhanh hơn                         |
| Thời gian hoàn thành, tỷ lệ lỗi, điểm hài lòng | Chưa có bảng đo đầy đủ để công bố, không dùng số liệu ước lượng           |

## 5. Danh sách cải tiến đã thực hiện từ phản hồi

| ID         | Phản hồi                                            | Cải tiến đã thực hiện                                                                               | Trạng thái        |
| ---------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------- |
| UX-ADM-01  | Nhập sản phẩm chưa thuận tiện khi có nhiều dữ liệu  | Bổ sung nhập sản phẩm từ Excel, file mẫu, kiểm tra dữ liệu, hiển thị lỗi và tải file lỗi để sửa     | Hoàn thành        |
| UX-ADM-02  | Cấu trúc sản phẩm chưa phù hợp với nhu cầu quản trị | Điều chỉnh quản lý theo sản phẩm, biến thể, tùy chọn và bản nháp; hỗ trợ kiểm tra trước khi áp dụng | Hoàn thành        |
| UX-ADM-03  | Cần xuất hóa đơn thuận tiện hơn                     | Bổ sung màn hình xem và phát hành hóa đơn, trạng thái hóa đơn, mã QR tra cứu và thao tác in/lưu     | Hoàn thành        |
| UX-ADM-04  | Cần theo dõi hóa đơn từ màn hình đơn hàng           | Bổ sung trạng thái và lối tắt “Xem hóa đơn/Xuất hóa đơn” trong khu vực quản lý đơn                  | Hoàn thành        |
| UX-USER-01 | Người dùng cần luồng mua hàng rõ ràng và ổn định    | Kiểm tra lại đăng ký, tìm kiếm, biến thể, giỏ hàng, thanh toán và lịch sử đơn                       | Đạt theo quan sát |
| BUG-DD-01  | Đơn online đã giao và đã thanh toán chưa được tính vào sản phẩm bán trong Daily Detail | Cập nhật điều kiện lấy sản phẩm bán theo trạng thái đơn `DELIVERED` và thanh toán `PAID`, dùng thời điểm thanh toán để xác định ngày và cập nhật nội dung hướng dẫn trên giao diện | Đã sửa |

## 6. Kết luận

Thực nghiệm cho thấy người dùng cuối sử dụng website ổn định ở các tác vụ chính. Các yêu cầu cải tiến tập trung ở phía quản trị viên, gồm nhập sản phẩm tiện lợi hơn, thay đổi cấu trúc sản phẩm và bổ sung chức năng xuất hóa đơn. Các yêu cầu này đã được triển khai trong phiên bản hiện tại.

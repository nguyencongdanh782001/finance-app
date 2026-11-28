# Thực nghiệm người dùng — thực nghiệm với người dùng thực tế, cải tiến theo phản hồi

## 1. Thực nghiệm với người dùng thực tế

Báo cáo ghi nhận kết quả thực nghiệm trên website bán quần áo với **5 người dùng thật** và **1 quản trị viên**. Người dùng cuối sử dụng ổn định các luồng chính. Phản hồi cần cải tiến tập trung ở quản trị viên: nhập sản phẩm thuận tiện hơn, thay đổi cấu trúc sản phẩm và bổ sung chức năng xuất hóa đơn.

Phạm vi báo cáo này tập trung vào các phản hồi đã dùng để điều chỉnh sản phẩm. Các chỉ số định lượng như thời gian hoàn thành và tỷ lệ lỗi chỉ được ghi là “chưa đo” nếu chưa có biên bản đo cụ thể; không sử dụng số liệu ước lượng thay cho số liệu thực nghiệm.

## 2. Kịch bản tác vụ cụ thể

### Người dùng

| Mã | Tác vụ | Kết quả cần đạt |
|---|---|---|
| U-T01 | Đăng ký tài khoản bằng email thử nghiệm | Tạo tài khoản thành công và đăng nhập được |
| U-T02 | Tìm kiếm, lọc và xem chi tiết sản phẩm | Tìm được sản phẩm, size và màu phù hợp |
| U-T03 | Thêm sản phẩm vào giỏ, cập nhật số lượng | Giỏ hàng và tổng tiền hiển thị đúng |
| U-T04 | Nhập địa chỉ, chọn vận chuyển và thanh toán thử nghiệm | Đơn hàng được tạo thành công |
| U-T05 | Xem lịch sử và chi tiết đơn hàng | Tìm thấy đúng đơn vừa đặt |

### Quản trị viên

| Mã | Tác vụ | Kết quả cần đạt |
|---|---|---|
| A-T01 | Nhập sản phẩm bằng form và file Excel | Dữ liệu hợp lệ được lưu, lỗi được chỉ rõ |
| A-T02 | Chỉnh sửa thông tin và cấu trúc sản phẩm | Sản phẩm, biến thể và tùy chọn được quản lý đúng |
| A-T03 | Mở đơn hàng và phát hành hóa đơn | Hóa đơn có số và trạng thái phát hành |
| A-T04 | Xem, in hoặc xuất hóa đơn | Hóa đơn được mở và lưu/in thuận tiện |

## 3. Danh sách người tham gia ẩn danh

| Mã | Vai trò | Kinh nghiệm sử dụng | Thiết bị | Phạm vi tham gia |
|---|---|---|---|---|
| U01 | Người dùng thật | Đã từng mua hàng trực tuyến | Điện thoại | Đăng ký, tìm kiếm, đặt hàng |
| U02 | Người dùng thật | Đã từng mua hàng trực tuyến | Điện thoại | Tìm kiếm, giỏ hàng, thanh toán |
| U03 | Người dùng thật | Sử dụng website bán hàng ở mức cơ bản | Máy tính | Đăng ký, đặt hàng, xem lịch sử đơn |
| U04 | Người dùng thật | Sử dụng website bán hàng ở mức cơ bản | Điện thoại | Tìm sản phẩm, checkout |
| U05 | Người dùng thật | Đã từng mua hàng trực tuyến | Máy tính | Tìm kiếm, đặt hàng, xem hóa đơn |
| A01 | Quản trị viên | Có nhu cầu quản lý sản phẩm và đơn hàng | Máy tính | Nhập sản phẩm, quản lý đơn, xuất hóa đơn |

> Danh sách chỉ dùng mã định danh, không lưu họ tên, mật khẩu, OTP, thông tin thẻ hoặc dữ liệu cá nhân không cần thiết.

## 4. Dữ liệu thu thập và chỉ số đo

### 4.1. Dữ liệu định lượng

- Thời gian hoàn thành từng tác vụ, tính từ lúc bắt đầu đến khi đạt kết quả cần đạt.
- Tỷ lệ hoàn thành tác vụ.
- Số lỗi thao tác, số lần click sai hoặc quay lại.
- Số lần nhập lại dữ liệu và số lần cần hỗ trợ.
- Số lỗi giao diện/API mà người tham gia nhìn thấy.
- Điểm dễ sử dụng sau tác vụ theo thang 1–5.
- Điểm hài lòng chung sau buổi kiểm tra theo thang 1–5.

Tại thời điểm lập báo cáo, nhóm chưa có bảng đo thời gian và điểm số đầy đủ để công bố. Vì vậy, các chỉ số trên được giữ làm chỉ số đo chuẩn cho vòng kiểm thử tiếp theo, không quy đổi thành số liệu ước lượng.

### 4.2. Dữ liệu định tính

- Người dùng cuối hoàn thành các luồng xem sản phẩm, giỏ hàng, checkout và xem đơn hàng ổn định; không ghi nhận trở ngại nghiêm trọng cần thay đổi luồng.
- Quản trị viên phản hồi rằng thao tác nhập sản phẩm cần rõ ràng và tiện lợi hơn, đặc biệt khi nhập nhiều dữ liệu.
- Quản trị viên yêu cầu thay đổi cấu trúc sản phẩm để phù hợp hơn với cách quản lý thực tế.
- Quản trị viên cần chức năng xuất hóa đơn ngay từ màn hình quản lý đơn hàng/hóa đơn.

## 5. Kết quả quan sát và chỉ số

| Nhóm | Kết quả quan sát | Trạng thái |
|---|---|---|
| Người dùng cuối | Sử dụng ổn định các luồng mua hàng chính | Đạt theo quan sát |
| Nhập sản phẩm phía quản trị | Cần giảm thao tác và tăng tính thuận tiện | Đã cải tiến |
| Cấu trúc sản phẩm | Cấu trúc cũ chưa phù hợp đầy đủ với nhu cầu quản trị | Đã điều chỉnh |
| Phát hành/xuất hóa đơn | Có nhu cầu thao tác trực tiếp và thuận tiện hơn | Đã triển khai |
| Thời gian hoàn thành | Chưa có biên bản đo định lượng đầy đủ | Chưa đo |
| SUS/điểm hài lòng | Chưa thu thập theo biểu mẫu chuẩn | Chưa đo |

## 6. Danh sách cải tiến đã làm từ phản hồi

| ID | Phản hồi/nhu cầu | Cải tiến đã thực hiện | Khu vực minh chứng | Trạng thái |
|---|---|---|---|---|
| UX-ADM-01 | Nhập sản phẩm cần nhanh và tiện lợi hơn | Bổ sung luồng nhập sản phẩm từ Excel, có file mẫu, kiểm tra dữ liệu, hiển thị lỗi và cho tải file lỗi để sửa | `/admin/products/import`, `ProductImportWizard`, `/api/product-imports/*` | Hoàn thành |
| UX-ADM-02 | Cấu trúc sản phẩm chưa phù hợp cách quản lý thực tế | Điều chỉnh mô hình quản lý sản phẩm theo sản phẩm, biến thể, tùy chọn và bản nháp; hỗ trợ kiểm tra trước khi áp dụng | `Product`, `ProductVariant`, `ProductDraft`, các API product import/draft | Hoàn thành |
| UX-ADM-03 | Cần xuất hóa đơn thuận tiện | Bổ sung màn hình xem hóa đơn, phát hành hóa đơn, trạng thái hóa đơn, mã QR tra cứu và thao tác in/lưu từ trình duyệt | `/admin/invoices/[orderId]`, `/api/admin/orders/[orderId]/invoice/*`, `InvoiceDocument` | Hoàn thành |
| UX-ADM-04 | Cần theo dõi hóa đơn từ màn hình quản lý đơn | Bổ sung trạng thái và lối tắt “Xem hóa đơn/Xuất hóa đơn” trong chi tiết đơn và khu vực quản lý hóa đơn | `DailyOrderSection`, `/admin/daily-detail/[id]` | Hoàn thành |
| UX-USER-01 | Người dùng cần thao tác mua hàng rõ ràng, ổn định | Kiểm tra lại tìm kiếm, biến thể, giỏ hàng, checkout và lịch sử đơn; tiếp tục giữ luồng hiện tại | Các màn hình sản phẩm, giỏ hàng, checkout, đơn hàng | Đạt theo quan sát |

## 7. Kiểm tra lại sau cải tiến

- Nhập sản phẩm: kiểm tra file Excel mẫu, file hợp lệ và file có lỗi; xác nhận lỗi được chỉ ra để quản trị viên sửa lại.
- Cấu trúc sản phẩm: kiểm tra tạo, chỉnh sửa và xem trước dữ liệu trước khi áp dụng.
- Hóa đơn: kiểm tra xem bản xem trước, phát hành, mở hóa đơn công khai, in/lưu và trạng thái hóa đơn.
- Người dùng cuối: chạy lại các luồng mua hàng chính; kết quả quan sát vẫn ổn định.

## 8. Kết luận

Thực nghiệm cho thấy sản phẩm đáp ứng ổn định nhu cầu sử dụng của người dùng cuối ở các tác vụ mua hàng chính. Các phản hồi có giá trị cải tiến chủ yếu đến từ quản trị viên: cần nhập dữ liệu thuận tiện hơn, cần tổ chức lại cấu trúc sản phẩm và cần xuất hóa đơn nhanh chóng. Ba nhóm yêu cầu này đã được triển khai trong phiên bản hiện tại. Vòng kiểm thử tiếp theo nên bổ sung bảng đo thời gian, tỷ lệ hoàn thành và điểm dễ sử dụng để có số liệu định lượng trước–sau.

## 9. Bảo mật và quyền riêng tư

Chỉ sử dụng tài khoản và dữ liệu thử nghiệm. Không đưa thông tin cá nhân thật, mật khẩu, OTP, thông tin thanh toán hoặc dữ liệu khách hàng thật vào báo cáo. Các kết quả trong báo cáo được trình bày theo mã ẩn danh.

# 2.5. Đặc tả Use Case – Role Quản lý

## 2.5.1. Xác thực quản trị

- **Use Case:** UC-QL-01 – Xác thực quản trị
- **Tác nhân:** Quản lý
- **Mô tả:** Quản lý đăng nhập vào khu vực quản trị bằng thông tin tài khoản hợp lệ. Hệ thống kiểm tra thông tin xác thực, quyền truy cập và tạo phiên làm việc cho quản lý.
- **Tiền điều kiện:** Quản lý đã có tài khoản quản trị đang hoạt động.
- **Hậu điều kiện:** Quản lý được truy cập các chức năng quản trị phù hợp với quyền hạn.
- **Luồng chính:** Mở trang đăng nhập quản trị → Nhập thông tin đăng nhập → Hệ thống kiểm tra thông tin → Xác thực thành công → Tạo phiên đăng nhập → Chuyển đến Dashboard.
- **Luồng ngoại lệ:** Nếu thông tin không hợp lệ, hệ thống thông báo lỗi và yêu cầu nhập lại. Nếu tài khoản bị khóa hoặc không có quyền quản trị, hệ thống từ chối truy cập.

## 2.5.2. Dashboard và tài chính

- **Use Case:** UC-QL-02 – Dashboard và tài chính
- **Tác nhân:** Quản lý
- **Mô tả:** Quản lý xem tổng quan hoạt động kinh doanh, doanh thu, chi phí, lợi nhuận và danh sách sản phẩm đã bán theo ngày hoặc theo tháng.
- **Tiền điều kiện:** Quản lý đã đăng nhập và dữ liệu tài chính đã được ghi nhận.
- **Hậu điều kiện:** Số liệu tổng hợp và chi tiết tài chính được hiển thị; báo cáo có thể được xuất thành file Excel.
- **Luồng chính:** Truy cập Dashboard → Chọn khoảng thời gian hoặc tháng cần xem → Hệ thống tổng hợp doanh thu, chi phí và lợi nhuận → Hiển thị biểu đồ và danh sách sản phẩm bán → Chọn xuất báo cáo Excel nếu cần.
- **Luồng ngoại lệ:** Nếu chưa có dữ liệu trong khoảng thời gian đã chọn, hệ thống hiển thị trạng thái không có dữ liệu.

## 2.5.3. Danh mục và sản phẩm

- **Use Case:** UC-QL-03 – Danh mục và sản phẩm
- **Tác nhân:** Quản lý
- **Mô tả:** Quản lý tạo, cập nhật, ẩn/hiện sản phẩm, quản lý danh mục, biến thể, giá bán và số lượng tồn kho.
- **Tiền điều kiện:** Quản lý đã đăng nhập; danh mục hoặc sản phẩm cần thao tác có thể được truy cập.
- **Hậu điều kiện:** Thông tin sản phẩm, danh mục, biến thể và tồn kho được cập nhật trong hệ thống.
- **Luồng chính:** Truy cập quản lý sản phẩm → Xem danh sách hoặc tìm kiếm sản phẩm → Chọn thêm mới hoặc chỉnh sửa → Nhập thông tin sản phẩm → Thiết lập danh mục, giá, biến thể và tồn kho → Lưu thay đổi → Hệ thống kiểm tra và cập nhật dữ liệu.
- **Luồng thay thế:** Quản lý có thể nhập danh sách sản phẩm từ file Excel theo mẫu hệ thống → Hệ thống kiểm tra dữ liệu → Hiển thị lỗi nếu có → Tạo hoặc cập nhật sản phẩm hợp lệ.
- **Luồng ngoại lệ:** Nếu dữ liệu thiếu, sai định dạng hoặc trùng SKU, hệ thống không lưu và hiển thị thông báo lỗi.

## 2.5.4. Quản lý đơn hàng online

- **Use Case:** UC-QL-04 – Quản lý đơn hàng online
- **Tác nhân:** Quản lý
- **Mô tả:** Quản lý theo dõi đơn hàng online, xem chi tiết, kiểm tra thanh toán chuyển khoản và cập nhật trạng thái xử lý, giao hàng.
- **Tiền điều kiện:** Quản lý đã đăng nhập; đơn hàng online đã được tạo.
- **Hậu điều kiện:** Trạng thái đơn hàng và trạng thái thanh toán được cập nhật; khách hàng nhận được thông tin trạng thái mới.
- **Luồng chính:** Mở danh sách đơn hàng online → Tìm kiếm hoặc lọc đơn hàng → Xem chi tiết đơn → Kiểm tra sản phẩm, người nhận và thanh toán → Xác nhận chuyển khoản thủ công nếu giao dịch hợp lệ → Cập nhật trạng thái đơn hàng → Hệ thống lưu lịch sử thay đổi và gửi thông báo.
- **Luồng ngoại lệ:** Nếu thanh toán chưa được xác nhận hoặc đơn đã hủy, hệ thống không cho phép xác nhận hoặc chuyển trạng thái không hợp lệ.

## 2.5.5. Quản lý đơn hàng tại shop

- **Use Case:** UC-QL-05 – Quản lý đơn hàng tại shop
- **Tác nhân:** Quản lý
- **Mô tả:** Quản lý tạo và cập nhật đơn hàng phát sinh tại cửa hàng, bao gồm chọn sản phẩm, số lượng, phương thức thanh toán và ghi nhận doanh thu.
- **Tiền điều kiện:** Quản lý đã đăng nhập; sản phẩm và tồn kho đã có trong hệ thống.
- **Hậu điều kiện:** Đơn hàng tại shop được lưu; tồn kho, doanh thu và sản phẩm bán trong ngày được cập nhật.
- **Luồng chính:** Mở chức năng tạo đơn tại shop → Tìm và chọn sản phẩm → Chọn biến thể và số lượng → Chọn thanh toán tiền mặt hoặc chuyển khoản → Kiểm tra tổng tiền → Lưu đơn hàng → Hệ thống trừ tồn kho và ghi nhận giao dịch.
- **Luồng ngoại lệ:** Nếu số lượng mua vượt tồn kho hoặc dữ liệu đơn không hợp lệ, hệ thống không cho lưu đơn.

## 2.5.6. Quản lý người dùng

- **Use Case:** UC-QL-06 – Quản lý người dùng
- **Tác nhân:** Quản lý
- **Mô tả:** Quản lý xem danh sách người dùng, xem thông tin chi tiết, cập nhật trạng thái tài khoản và theo dõi thông tin membership.
- **Tiền điều kiện:** Quản lý đã đăng nhập và có quyền truy cập chức năng người dùng.
- **Hậu điều kiện:** Thông tin hoặc trạng thái tài khoản được cập nhật; dữ liệu membership được hiển thị chính xác.
- **Luồng chính:** Truy cập danh sách người dùng → Tìm kiếm hoặc chọn người dùng → Xem thông tin chi tiết → Kiểm tra đơn hàng, membership và trạng thái → Cập nhật thông tin được phép → Lưu thay đổi.
- **Luồng ngoại lệ:** Nếu người dùng không tồn tại hoặc dữ liệu cập nhật không hợp lệ, hệ thống thông báo lỗi và giữ nguyên dữ liệu cũ.

## 2.5.7. Quản lý nội dung website

- **Use Case:** UC-QL-07 – Quản lý nội dung website
- **Tác nhân:** Quản lý
- **Mô tả:** Quản lý cập nhật banner, chính sách cửa hàng và kiểm duyệt, phản hồi đánh giá của khách hàng.
- **Tiền điều kiện:** Quản lý đã đăng nhập; quản lý có quyền chỉnh sửa nội dung.
- **Hậu điều kiện:** Nội dung được lưu, xuất bản hoặc ẩn theo trạng thái đã chọn.
- **Luồng chính:** Mở phân hệ nội dung → Chọn banner, chính sách hoặc đánh giá → Tạo mới hoặc chỉnh sửa nội dung → Nhập thông tin cần thiết → Lưu bản nháp hoặc xuất bản → Hệ thống cập nhật nội dung hiển thị trên website.
- **Luồng thay thế:** Với đánh giá, quản lý có thể duyệt, ẩn hoặc gửi phản hồi cho khách hàng.
- **Luồng ngoại lệ:** Nếu nội dung thiếu trường bắt buộc hoặc không đạt điều kiện kiểm tra, hệ thống không cho lưu/xuất bản.

## 2.5.8. Giảm giá và membership

- **Use Case:** UC-QL-08 – Giảm giá và membership
- **Tác nhân:** Quản lý
- **Mô tả:** Quản lý cấu hình mã giảm giá, hạng membership, quyền lợi thành viên và điều kiện áp dụng ưu đãi.
- **Tiền điều kiện:** Quản lý đã đăng nhập; các sản phẩm hoặc danh mục liên quan đã tồn tại nếu ưu đãi có phạm vi giới hạn.
- **Hậu điều kiện:** Chương trình ưu đãi hoặc membership được tạo, cập nhật, kích hoạt hoặc tạm dừng.
- **Luồng chính:** Truy cập phân hệ ưu đãi → Chọn mã giảm giá hoặc membership → Nhập tên, điều kiện, thời gian và giá trị áp dụng → Chọn phạm vi sản phẩm/danh mục nếu cần → Lưu cấu hình → Hệ thống kiểm tra và áp dụng dữ liệu cho khách hàng đủ điều kiện.
- **Luồng ngoại lệ:** Nếu mã đã tồn tại, thời gian không hợp lệ hoặc điều kiện giảm giá sai, hệ thống từ chối lưu và hiển thị lỗi.

## 2.5.9. Quản lý vận chuyển

- **Use Case:** UC-QL-09 – Quản lý vận chuyển
- **Tác nhân:** Quản lý
- **Mô tả:** Quản lý cấu hình thông tin cửa hàng, phí giao hàng, khoảng cách giao hàng và chương trình miễn/giảm phí vận chuyển.
- **Tiền điều kiện:** Quản lý đã đăng nhập; thông tin vị trí cửa hàng và quy tắc phí giao hàng có thể được cập nhật.
- **Hậu điều kiện:** Cấu hình vận chuyển mới được lưu và được sử dụng khi hệ thống tính phí checkout.
- **Luồng chính:** Mở cài đặt vận chuyển → Nhập hoặc cập nhật vị trí cửa hàng → Thiết lập phí cơ bản, phí theo khoảng cách và giới hạn giao hàng → Thiết lập điều kiện miễn/giảm phí → Lưu cấu hình → Hệ thống áp dụng cấu hình cho các đơn mới.
- **Luồng ngoại lệ:** Nếu thông tin vị trí hoặc mức phí không hợp lệ, hệ thống không lưu và yêu cầu kiểm tra lại.

## 2.5.10. Cấu hình hệ thống và thanh toán

- **Use Case:** UC-QL-10 – Cấu hình hệ thống và thanh toán
- **Tác nhân:** Quản lý
- **Mô tả:** Quản lý cấu hình tài khoản nhận chuyển khoản, mã QR thanh toán và các thiết lập thông báo trong khu vực quản trị.
- **Tiền điều kiện:** Quản lý đã đăng nhập và có quyền cấu hình hệ thống.
- **Hậu điều kiện:** Thông tin thanh toán và thông báo được lưu; khách hàng có thể nhận thông tin chuyển khoản khi đặt hàng.
- **Luồng chính:** Mở cài đặt thanh toán → Nhập mã ngân hàng, số tài khoản và tên chủ tài khoản → Bật hoặc tắt hình thức chuyển khoản → Lưu cấu hình → Hệ thống tạo mã QR theo đơn hàng → Quản lý nhận thông báo khi khách báo đã chuyển khoản → Kiểm tra giao dịch và xác nhận thanh toán.
- **Luồng ngoại lệ:** Nếu thiếu thông tin tài khoản hoặc dữ liệu không hợp lệ, hệ thống không cho bật chuyển khoản và yêu cầu bổ sung thông tin.

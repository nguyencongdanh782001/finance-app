# 2.4. Đặc tả Use Case – Khách hàng

## 2.4.1. Xác thực

- **Use Case:** UC-KH-01 – Xác thực
- **Tác nhân:** Khách hàng
- **Mô tả:** Khách hàng đăng ký, đăng nhập và xác thực tài khoản để sử dụng các chức năng mua sắm trên hệ thống.
- **Tiền điều kiện:** Khách hàng có thể chưa đăng nhập khi đăng ký; để đăng nhập, khách hàng phải có tài khoản hợp lệ.
- **Hậu điều kiện:** Tài khoản được tạo hoặc phiên đăng nhập được thiết lập thành công.
- **Luồng chính:** Mở trang xác thực → Chọn đăng ký hoặc đăng nhập → Nhập thông tin → Hệ thống kiểm tra dữ liệu → Xác thực bằng OTP, Google hoặc mật khẩu → Chuyển đến trang phù hợp.
- **Luồng ngoại lệ:** Nếu thông tin không hợp lệ, OTP sai hoặc tài khoản không tồn tại, hệ thống thông báo lỗi và yêu cầu thao tác lại.

## 2.4.2. Quản lý tài khoản

- **Use Case:** UC-KH-02 – Quản lý tài khoản
- **Tác nhân:** Khách hàng
- **Mô tả:** Khách hàng xem và cập nhật hồ sơ cá nhân, đổi mật khẩu, quản lý địa chỉ giao hàng và sản phẩm yêu thích.
- **Tiền điều kiện:** Khách hàng đã đăng nhập.
- **Hậu điều kiện:** Thông tin tài khoản, địa chỉ hoặc danh sách yêu thích được cập nhật.
- **Luồng chính:** Mở khu vực tài khoản → Chọn hồ sơ, mật khẩu, địa chỉ hoặc yêu thích → Thực hiện thao tác → Hệ thống kiểm tra dữ liệu → Lưu và hiển thị kết quả.
- **Luồng ngoại lệ:** Nếu dữ liệu không hợp lệ hoặc phiên đăng nhập hết hạn, hệ thống không lưu và yêu cầu đăng nhập hoặc nhập lại.

## 2.4.3. Khám phá sản phẩm

- **Use Case:** UC-KH-03 – Khám phá sản phẩm
- **Tác nhân:** Khách hàng
- **Mô tả:** Khách hàng duyệt danh mục, tìm kiếm, lọc và xem chi tiết các sản phẩm đang được bán trên website.
- **Tiền điều kiện:** Hệ thống có sản phẩm được hiển thị; khách hàng không bắt buộc phải đăng nhập.
- **Hậu điều kiện:** Danh sách hoặc chi tiết sản phẩm phù hợp với nhu cầu được hiển thị.
- **Luồng chính:** Truy cập website → Duyệt danh mục hoặc nhập từ khóa → Hệ thống trả về danh sách sản phẩm → Áp dụng bộ lọc nếu cần → Chọn sản phẩm → Xem hình ảnh, giá, biến thể, mô tả và tồn kho.
- **Luồng ngoại lệ:** Nếu không có sản phẩm phù hợp, hệ thống hiển thị trạng thái không có kết quả và gợi ý thao tác tìm kiếm khác.

## 2.4.4. Quản lý giỏ hàng

- **Use Case:** UC-KH-04 – Quản lý giỏ hàng
- **Tác nhân:** Khách hàng
- **Mô tả:** Khách hàng thêm sản phẩm vào giỏ hàng, xem giỏ hàng, thay đổi số lượng hoặc xóa sản phẩm.
- **Tiền điều kiện:** Sản phẩm còn tồn kho và khách hàng đã chọn biến thể nếu sản phẩm có biến thể.
- **Hậu điều kiện:** Giỏ hàng được cập nhật với sản phẩm và số lượng mới.
- **Luồng chính:** Xem sản phẩm → Chọn biến thể và số lượng → Thêm vào giỏ hàng → Mở giỏ hàng → Cập nhật số lượng hoặc xóa sản phẩm → Hệ thống tính lại tạm tính.
- **Luồng ngoại lệ:** Nếu sản phẩm hết hàng hoặc số lượng vượt tồn kho, hệ thống thông báo và không cập nhật số lượng không hợp lệ.

## 2.4.5. Đặt hàng

- **Use Case:** UC-KH-05 – Đặt hàng
- **Tác nhân:** Khách hàng
- **Mô tả:** Khách hàng cung cấp thông tin nhận hàng, chọn sản phẩm cần mua, áp dụng mã giảm giá và tạo đơn hàng.
- **Tiền điều kiện:** Khách hàng đã đăng nhập, có sản phẩm hợp lệ và có địa chỉ nhận hàng.
- **Hậu điều kiện:** Đơn hàng được tạo với trạng thái chờ xử lý.
- **Luồng chính:** Chọn mua ngay hoặc thanh toán từ giỏ hàng → Chọn/nhập địa chỉ nhận hàng → Kiểm tra sản phẩm và số lượng → Nhập mã giảm giá nếu có → Hệ thống tính phí giao hàng và tổng tiền → Xác nhận đặt hàng → Hệ thống tạo đơn.
- **Luồng ngoại lệ:** Nếu địa chỉ thiếu, sản phẩm không đủ tồn kho hoặc phiên checkout hết hạn, hệ thống không tạo đơn và hiển thị thông báo.

## 2.4.6. Thanh toán

- **Use Case:** UC-KH-06 – Thanh toán
- **Tác nhân:** Khách hàng, Quản lý
- **Mô tả:** Khách hàng chọn thanh toán khi nhận hàng hoặc chuyển khoản ngân hàng. Với chuyển khoản, khách hàng thanh toán theo QR/thông tin tài khoản và báo đã chuyển khoản để quản lý kiểm tra thủ công.
- **Tiền điều kiện:** Đơn hàng đã được tạo; thông tin tài khoản nhận chuyển khoản đã được cấu hình nếu khách chọn chuyển khoản.
- **Hậu điều kiện:** Đơn hàng có trạng thái thanh toán phù hợp: chưa thanh toán, chờ kiểm tra hoặc đã thanh toán.
- **Luồng chính:** Chọn phương thức thanh toán → Nếu COD, hoàn tất đặt hàng và thanh toán khi nhận hàng → Nếu chuyển khoản, xem QR và thông tin tài khoản → Chuyển đúng số tiền và nội dung đơn → Bấm “Tôi đã chuyển khoản” → Hệ thống thông báo cho quản lý → Quản lý kiểm tra giao dịch và xác nhận thanh toán.
- **Luồng ngoại lệ:** Nếu thông tin chuyển khoản chưa được cấu hình hoặc giao dịch chưa được xác nhận, đơn hàng vẫn ở trạng thái chờ kiểm tra và chưa được ghi nhận là đã thanh toán.

## 2.4.7. Quản lý đơn hàng

- **Use Case:** UC-KH-07 – Quản lý đơn hàng
- **Tác nhân:** Khách hàng
- **Mô tả:** Khách hàng xem danh sách, theo dõi chi tiết, hủy đơn hợp lệ và xem hóa đơn của các đơn hàng đã đặt.
- **Tiền điều kiện:** Khách hàng đã đăng nhập và có đơn hàng thuộc tài khoản.
- **Hậu điều kiện:** Thông tin đơn hàng được hiển thị; yêu cầu hủy được ghi nhận nếu đơn còn cho phép hủy.
- **Luồng chính:** Mở khu vực đơn hàng → Chọn đơn cần xem → Xem sản phẩm, địa chỉ, thanh toán và trạng thái → Hủy đơn nếu đủ điều kiện → Xem hoặc tải hóa đơn.
- **Luồng ngoại lệ:** Nếu đơn đã giao, hoàn tất hoặc bị hủy trước đó, hệ thống không cho phép hủy lại.

## 2.4.8. Đánh giá sản phẩm

- **Use Case:** UC-KH-08 – Đánh giá sản phẩm
- **Tác nhân:** Khách hàng
- **Mô tả:** Khách hàng viết đánh giá, chấm điểm và tải ảnh cho sản phẩm đã mua.
- **Tiền điều kiện:** Khách hàng đã đăng nhập và đơn hàng/sản phẩm đủ điều kiện đánh giá.
- **Hậu điều kiện:** Đánh giá được lưu và chờ hệ thống hoặc quản lý kiểm duyệt.
- **Luồng chính:** Mở đơn hàng đã mua → Chọn sản phẩm → Chọn số sao → Nhập nội dung → Tải ảnh nếu cần → Gửi đánh giá → Hệ thống kiểm tra và lưu đánh giá.
- **Luồng ngoại lệ:** Nếu sản phẩm chưa đủ điều kiện, nội dung không hợp lệ hoặc ảnh không đúng định dạng, hệ thống từ chối gửi đánh giá.

## 2.4.9. Ưu đãi

- **Use Case:** UC-KH-09 – Ưu đãi
- **Tác nhân:** Khách hàng
- **Mô tả:** Khách hàng xem mã giảm giá, hạng membership và quyền lợi thành viên được áp dụng cho tài khoản.
- **Tiền điều kiện:** Khách hàng đã đăng nhập khi xem ưu đãi cá nhân hoặc quyền lợi membership.
- **Hậu điều kiện:** Danh sách ưu đãi và quyền lợi phù hợp được hiển thị; mã hợp lệ có thể được áp dụng khi đặt hàng.
- **Luồng chính:** Mở khu vực ưu đãi → Xem mã giảm giá hoặc hạng membership → Xem điều kiện sử dụng và quyền lợi → Chọn mã khi checkout → Hệ thống kiểm tra điều kiện → Áp dụng giảm giá vào đơn.
- **Luồng ngoại lệ:** Nếu mã hết hạn, vượt lượt sử dụng hoặc không đạt điều kiện đơn hàng, hệ thống không áp dụng mã.

## 2.4.10. Trải nghiệm mua sắm

- **Use Case:** UC-KH-10 – Trải nghiệm mua sắm
- **Tác nhân:** Khách hàng
- **Mô tả:** Khách hàng sử dụng trợ lý mua sắm, nhận gợi ý sản phẩm, thử đồ ảo và nhận thông báo liên quan đến hoạt động mua sắm.
- **Tiền điều kiện:** Website và dịch vụ hỗ trợ tương ứng đang hoạt động; một số chức năng có thể yêu cầu khách hàng đăng nhập.
- **Hậu điều kiện:** Khách hàng nhận được gợi ý, kết quả tư vấn, hình ảnh thử đồ hoặc thông báo phù hợp.
- **Luồng chính:** Mở chức năng trải nghiệm → Chọn trợ lý, gợi ý, thử đồ ảo hoặc thông báo → Cung cấp thông tin/hình ảnh cần thiết → Hệ thống xử lý → Hiển thị kết quả hoặc gửi thông báo.
- **Luồng ngoại lệ:** Nếu dữ liệu đầu vào không phù hợp hoặc dịch vụ tạm thời không khả dụng, hệ thống thông báo và cho phép khách hàng thử lại.

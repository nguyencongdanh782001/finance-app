# CHƯƠNG 3: THIẾT KẾ GIAO DIỆN

## 3.1. Giao diện chung

Website được thiết kế theo mô hình cửa hàng thời trang trực tuyến. Giao diện được chia thành hai khu vực chính:

- **Khu vực khách hàng:** dùng để khám phá sản phẩm, quản lý giỏ hàng, đặt hàng, thanh toán, theo dõi đơn hàng và sử dụng các tiện ích mua sắm.
- **Khu vực quản trị viên:** dùng để quản lý sản phẩm, danh mục, đơn hàng, người dùng, nội dung website, khuyến mãi, membership, vận chuyển và số liệu tài chính.

Giao diện sử dụng thanh điều hướng, tìm kiếm sản phẩm, biểu tượng tài khoản, yêu thích, giỏ hàng và thông báo. Các màn hình được thiết kế responsive để sử dụng trên máy tính, máy tính bảng và điện thoại.

### 3.1.1. Trang chủ cửa hàng

**Hình 3.1. Trang chủ cửa hàng**

Trang chủ giới thiệu thương hiệu, banner và các khu vực sản phẩm nổi bật. Khách hàng có thể truy cập danh mục, tìm kiếm sản phẩm, xem sản phẩm mới, sản phẩm bán chạy, ưu đãi và các nội dung do quản trị viên cấu hình.

### 3.1.2. Trang đăng ký

**Hình 3.2. Trang đăng ký**

Khách hàng nhập thông tin đăng ký tài khoản, mật khẩu và thông tin liên hệ. Hệ thống kiểm tra dữ liệu, gửi mã OTP xác thực email và chỉ hoàn tất đăng ký khi mã xác thực hợp lệ.

### 3.1.3. Trang đăng nhập

**Hình 3.3. Trang đăng nhập**

Khách hàng đăng nhập bằng email và mật khẩu hoặc sử dụng Google OAuth nếu được cấu hình. Sau khi đăng nhập thành công, hệ thống chuyển khách hàng đến trang phù hợp với phiên đăng nhập.

### 3.1.4. Trang quên và đặt lại mật khẩu

**Hình 3.4. Trang quên mật khẩu**

Khách hàng nhập email đã đăng ký để nhận mã OTP. Sau khi xác thực OTP, khách hàng tạo mật khẩu mới và đăng nhập lại vào hệ thống.

### 3.1.5. Trang danh sách sản phẩm

**Hình 3.5. Trang danh sách sản phẩm**

Trang danh sách hiển thị các sản phẩm đang được công khai. Khách hàng có thể tìm kiếm theo từ khóa, lọc theo danh mục, giới tính, màu sắc, kích thước, khoảng giá và tình trạng tồn kho; đồng thời sắp xếp theo sản phẩm mới hoặc giá.

### 3.1.6. Trang chi tiết sản phẩm

**Hình 3.6. Trang chi tiết sản phẩm**

Trang chi tiết hiển thị hình ảnh, tên, giá, mô tả, biến thể, màu sắc, kích thước, số lượng tồn kho và đánh giá. Khách hàng có thể chọn biến thể, thêm sản phẩm vào giỏ hàng, mua ngay, yêu thích sản phẩm hoặc xem các sản phẩm liên quan.

### 3.1.7. Trang tìm kiếm sản phẩm

**Hình 3.7. Tìm kiếm và gợi ý sản phẩm**

Thanh tìm kiếm hiển thị gợi ý sản phẩm trong quá trình nhập từ khóa. Khách hàng có thể chọn một gợi ý để xem chi tiết hoặc xem toàn bộ kết quả tìm kiếm.

### 3.1.8. Trang giỏ hàng

**Hình 3.8. Trang giỏ hàng**

Trang giỏ hàng hiển thị các sản phẩm đã chọn, biến thể, đơn giá, số lượng và thành tiền. Khách hàng có thể thay đổi số lượng, xóa sản phẩm hoặc chuyển sang bước thanh toán. Hệ thống kiểm tra lại tồn kho trước khi cho phép đặt hàng.

### 3.1.9. Trang thanh toán và đặt hàng

**Hình 3.9. Trang thanh toán**

Khách hàng nhập hoặc chọn địa chỉ nhận hàng, kiểm tra sản phẩm, phí vận chuyển, mã giảm giá và tổng tiền. Khách hàng có thể chọn thanh toán khi nhận hàng hoặc chuyển khoản ngân hàng/QR, sau đó xác nhận tạo đơn hàng.

### 3.1.10. Trang kết quả đặt hàng

**Hình 3.10. Trang kết quả đặt hàng**

Sau khi tạo đơn, hệ thống hiển thị mã đơn hàng, tổng tiền, phương thức thanh toán và hướng dẫn tiếp theo. Với phương thức chuyển khoản, khách hàng được chuyển đến khu vực hiển thị thông tin tài khoản và mã QR.

### 3.1.11. Khu vực thanh toán chuyển khoản/QR

**Hình 3.11. Khu vực thanh toán chuyển khoản**

Khách hàng xem mã QR, ngân hàng, số tài khoản, chủ tài khoản, số tiền và nội dung chuyển khoản. Sau khi chuyển khoản, khách hàng bấm **“Tôi đã chuyển khoản”** để gửi thông báo cho quản trị viên. Trạng thái được hiển thị theo các bước chờ thanh toán, chờ kiểm tra và đã xác nhận.

### 3.1.12. Trang tài khoản khách hàng

**Hình 3.12. Trang tài khoản khách hàng**

Trang tài khoản cung cấp tổng quan thông tin cá nhân, đơn hàng gần đây, membership và các lối tắt đến địa chỉ, yêu thích, đơn hàng và hồ sơ.

### 3.1.13. Trang hồ sơ cá nhân

**Hình 3.13. Trang hồ sơ cá nhân**

Khách hàng xem và cập nhật họ tên, số điện thoại, email và thông tin cá nhân được phép chỉnh sửa. Hệ thống yêu cầu dữ liệu hợp lệ trước khi lưu thay đổi.

### 3.1.14. Trang quản lý địa chỉ

**Hình 3.14. Trang quản lý địa chỉ**

Khách hàng thêm, sửa, xóa và chọn địa chỉ mặc định dùng cho giao hàng. Một địa chỉ có thể được dùng cho giao hàng, thanh toán hoặc cả hai mục đích tùy cấu hình.

### 3.1.15. Trang sản phẩm yêu thích

**Hình 3.15. Trang sản phẩm yêu thích**

Khách hàng xem danh sách sản phẩm yêu thích, bỏ yêu thích hoặc mở trang chi tiết để mua hàng. Chức năng yêu thích yêu cầu khách hàng đăng nhập.

### 3.1.16. Trang danh sách đơn hàng

**Hình 3.16. Trang danh sách đơn hàng**

Khách hàng xem các đơn hàng đã đặt, lọc theo trạng thái và mở chi tiết từng đơn hàng. Danh sách thể hiện mã đơn, thời gian đặt, tổng tiền, phương thức thanh toán và trạng thái xử lý.

### 3.1.17. Trang chi tiết đơn hàng

**Hình 3.17. Trang chi tiết đơn hàng**

Trang chi tiết hiển thị sản phẩm, người nhận, địa chỉ, vận chuyển, thanh toán, tổng tiền và lịch sử trạng thái. Khách hàng có thể hủy đơn nếu đơn vẫn còn trong thời gian cho phép và xem/tải hóa đơn khi có.

### 3.1.18. Trang membership và quyền lợi

**Hình 3.18. Trang membership**

Trang membership hiển thị các hạng thành viên, điều kiện đạt hạng, tỷ lệ ưu đãi và quyền lợi tương ứng. Thông tin được lấy từ cấu hình của quản trị viên.

### 3.1.19. Trang mã giảm giá và voucher

**Hình 3.19. Trang mã giảm giá/voucher**

Khách hàng xem mã giảm giá được cấp, điều kiện sử dụng, thời hạn và trạng thái mã. Mã hợp lệ có thể được chọn hoặc nhập tại bước thanh toán.

### 3.1.20. Trang chính sách và nội dung cửa hàng

**Hình 3.20. Trang chính sách cửa hàng**

Khách hàng xem các chính sách được công khai như vận chuyển, đổi trả, thanh toán và điều khoản sử dụng. Nội dung được quản trị viên tạo và xuất bản trong khu vực quản trị.

### 3.1.21. Trang thử đồ AI

**Hình 3.21. Trang thử đồ AI**

Khách hàng tải ảnh toàn thân hoặc chụp ảnh trực tiếp trên điện thoại, sau đó chọn sản phẩm muốn thử. Hệ thống phân loại sản phẩm theo áo, quần/chân váy hoặc đầm/váy liền, gửi ảnh đến dịch vụ AI và hiển thị kết quả. Khách hàng có thể thử sản phẩm khác hoặc tải ảnh kết quả xuống.

Giao diện hỗ trợ kéo-thả ảnh trên máy tính, chụp ảnh trên thiết bị di động, lọc sản phẩm, hiển thị trạng thái xử lý và cảnh báo rằng ảnh AI chỉ mang tính minh họa.

### 3.1.22. Khu vực thông báo

**Hình 3.22. Khu vực thông báo khách hàng**

Khách hàng nhận thông báo về trạng thái đơn hàng và các sự kiện liên quan. Thông báo có thể được xem trong trung tâm thông báo hoặc qua push notification nếu trình duyệt và tài khoản đã cấp quyền.

## 3.2. Giao diện quản trị viên

### 3.2.1. Trang đăng nhập quản trị

**Hình 3.23. Trang đăng nhập quản trị**

Quản trị viên đăng nhập bằng tài khoản quản trị đã được cấp. Hệ thống kiểm tra vai trò và chỉ cho phép tài khoản có quyền quản trị truy cập khu vực `/admin`.

### 3.2.2. Dashboard tổng quan

**Hình 3.24. Dashboard tổng quan**

Dashboard hiển thị các chỉ số về doanh thu, chi phí, lợi nhuận, đơn hàng, sản phẩm bán chạy và hoạt động kinh doanh theo ngày hoặc theo tháng. Quản trị viên có thể mở chi tiết tài chính và dữ liệu bán hàng.

### 3.2.3. Trang chi tiết tài chính theo tháng

**Hình 3.25. Chi tiết tài chính**

Quản trị viên theo dõi doanh thu, vốn, chi phí, lợi nhuận tiền mặt và chuyển khoản; đồng thời thêm, sửa hoặc xóa các khoản chi phí và ghi chú tài chính.

### 3.2.4. Trang quản lý sản phẩm

**Hình 3.26. Quản lý sản phẩm**

Quản trị viên xem, tìm kiếm, lọc, tạo mới, chỉnh sửa, ẩn/hiện và cập nhật trạng thái sản phẩm. Thông tin sản phẩm gồm hình ảnh, giá, mô tả, danh mục, giới tính, biến thể, SKU và tồn kho.

### 3.2.5. Trang thêm và chỉnh sửa sản phẩm

**Hình 3.27. Form sản phẩm**

Form sản phẩm hỗ trợ nhập thông tin cơ bản, tải hình ảnh, tạo nhóm biến thể, thiết lập giá và số lượng. Hệ thống kiểm tra dữ liệu trước khi lưu hoặc xuất bản sản phẩm.

### 3.2.6. Trang nhập sản phẩm từ Excel

**Hình 3.28. Nhập sản phẩm từ Excel**

Quản trị viên tải file mẫu, tải file dữ liệu lên, xem kết quả kiểm tra, sửa các dòng lỗi và xác nhận tạo/cập nhật sản phẩm hợp lệ.

### 3.2.7. Trang quản lý danh mục

**Hình 3.29. Quản lý danh mục**

Quản trị viên tạo, sửa, sắp xếp, bật/tắt danh mục và thiết lập loại thử đồ tương ứng như áo, quần/chân váy, đầm/váy liền hoặc không hỗ trợ.

### 3.2.8. Trang quản lý đơn hàng online

**Hình 3.30. Quản lý đơn hàng online**

Quản trị viên tìm kiếm và lọc đơn online theo trạng thái đơn, trạng thái thanh toán và phương thức thanh toán. Quản trị viên mở chi tiết đơn, cập nhật trạng thái xử lý, xác nhận thanh toán chuyển khoản thủ công và xem lịch sử thao tác.

### 3.2.9. Trang chi tiết đơn hàng quản trị

**Hình 3.31. Chi tiết đơn hàng quản trị**

Trang chi tiết hiển thị thông tin khách hàng, sản phẩm, địa chỉ, vận chuyển, thanh toán, các lần thanh toán, lịch sử trạng thái và thao tác xử lý đơn.

### 3.2.10. Trang quản lý đơn tại cửa hàng

**Hình 3.32. Quản lý đơn tại cửa hàng**

Quản trị viên tạo đơn offline, chọn sản phẩm và biến thể, áp dụng mã giảm giá, chọn tiền mặt hoặc chuyển khoản, xác định trạng thái thanh toán và ghi nhận doanh thu bán hàng trong ngày.

### 3.2.11. Trang quản lý người dùng

**Hình 3.33. Quản lý người dùng**

Quản trị viên xem, tìm kiếm và lọc người dùng; mở thông tin chi tiết, theo dõi đơn hàng, membership và trạng thái tài khoản. Các thao tác bị giới hạn theo quyền quản trị.

### 3.2.12. Trang hồ sơ quản trị viên

**Hình 3.34. Hồ sơ quản trị viên**

Quản trị viên xem thông tin tài khoản và đổi mật khẩu. Hệ thống yêu cầu xác thực mật khẩu hiện tại và kiểm tra các điều kiện an toàn đối với mật khẩu mới.

### 3.2.13. Trang quản lý đánh giá

**Hình 3.35. Quản lý đánh giá**

Quản trị viên xem, lọc, duyệt hoặc ẩn đánh giá của khách hàng và phản hồi những đánh giá phù hợp. Hệ thống áp dụng chính sách chống spam và giới hạn tần suất đánh giá.

### 3.2.14. Trang quản lý banner và nội dung

**Hình 3.36. Quản lý banner và nội dung**

Quản trị viên tạo, chỉnh sửa, sắp xếp, bật/tắt banner trang chủ; đồng thời quản lý các trang chính sách và nội dung được hiển thị trên website.

### 3.2.15. Trang quản lý mã giảm giá

**Hình 3.37. Quản lý mã giảm giá**

Quản trị viên tạo và cập nhật mã giảm giá, giá trị giảm, thời gian hiệu lực, số lượt sử dụng, giá trị đơn tối thiểu và phạm vi sản phẩm hoặc danh mục áp dụng.

### 3.2.16. Trang quản lý membership

**Hình 3.38. Quản lý membership**

Quản trị viên cấu hình hạng thành viên, điều kiện đạt hạng, tỷ lệ giảm giá và quyền lợi. Các quyền lợi được hiển thị cho khách hàng tại trang membership và trong quá trình mua hàng.

### 3.2.17. Trang quản lý vận chuyển

**Hình 3.39. Quản lý vận chuyển**

Quản trị viên cấu hình địa chỉ cửa hàng, phí vận chuyển cơ bản, phí theo khoảng cách, giới hạn giao hàng và chương trình miễn/giảm phí vận chuyển.

### 3.2.18. Trang cấu hình thanh toán

**Hình 3.40. Cấu hình thanh toán**

Quản trị viên nhập thông tin ngân hàng nhận chuyển khoản, số tài khoản, tên chủ tài khoản, mẫu mã QR và bật/tắt hình thức chuyển khoản. Thông tin này được hiển thị cho khách hàng tại checkout và trang thanh toán của đơn hàng.

### 3.2.19. Trang thông báo quản trị

**Hình 3.41. Thông báo quản trị**

Quản trị viên nhận thông báo khi có đơn hàng online mới hoặc khi khách hàng báo đã chuyển khoản. Từ thông báo, quản trị viên có thể mở trực tiếp chi tiết đơn để kiểm tra và xử lý.

### 3.2.20. Trang cài đặt thông báo

**Hình 3.42. Cài đặt thông báo**

Quản trị viên quản lý quyền nhận thông báo và thiết lập push notification cho tài khoản quản trị trên thiết bị đang sử dụng.

## 3.3. Đặc điểm responsive và trải nghiệm sử dụng

### 3.3.1. Responsive phía khách hàng

Trên màn hình nhỏ, thanh điều hướng chuyển thành menu bên; danh sách sản phẩm chuyển sang lưới ít cột hơn; các form checkout, thanh toán và thông tin đơn hàng xếp theo chiều dọc. Các nút thao tác được đặt ở vị trí dễ bấm và nội dung dài được phép xuống dòng.

### 3.3.2. Responsive phía quản trị

Các bảng dữ liệu được chuyển thành thẻ thông tin trên màn hình nhỏ hoặc cho phép cuộn ngang khi cần. Bộ lọc, form và thao tác cập nhật được sắp xếp lại theo chiều dọc để tránh tràn nội dung.

### 3.3.3. Trạng thái phản hồi giao diện

Các màn hình có trạng thái đang tải, không có dữ liệu, lỗi kết nối, thao tác thành công và thao tác thất bại. Những thao tác quan trọng như thanh toán, hủy đơn, xác nhận thanh toán và cập nhật dữ liệu đều hiển thị thông báo kết quả cho người dùng.

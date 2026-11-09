# CHƯƠNG 5: QUẢN LÝ DỰ ÁN

## 5.1. Kế hoạch công việc

Dự án được triển khai nhằm xây dựng hệ thống thương mại điện tử Quỳnh Nhi Store, gồm giao diện mua sắm dành cho khách hàng và khu vực quản trị dành cho cửa hàng. Hệ thống hỗ trợ quản lý sản phẩm, biến thể sản phẩm, tồn kho, đơn hàng, thanh toán, giao hàng, khuyến mãi, thành viên, đánh giá và các báo cáo tài chính.

Kế hoạch được lập theo cấu trúc WBS trong file Excel. Các công việc được phân chia theo nhóm chức năng và thực hiện trong 15 tuần, từ ngày **03/08/2026 đến ngày 15/11/2026**.

### Bảng 5.1: Kế hoạch công việc

| STT | Công việc                                                     | Người thực hiện |
| --: | ------------------------------------------------------------- | --------------- |
|   1 | Khảo sát quy trình bán hàng và xác định phạm vi hệ thống      | Danh Nguyễn     |
|   2 | Phân tích yêu cầu cho khách hàng và quản trị viên             | Danh Nguyễn     |
|   3 | Lập WBS, KPI và kế hoạch triển khai dự án                     | Danh Nguyễn     |
|   4 | Thiết kế kiến trúc hệ thống và cơ sở dữ liệu                  | Danh Nguyễn     |
|   5 | Xây dựng chức năng đăng ký, đăng nhập và phân quyền           | Danh Nguyễn     |
|   6 | Xây dựng quản lý sản phẩm, danh mục, thương hiệu và biến thể  | Danh Nguyễn     |
|   7 | Xây dựng tìm kiếm, lọc sản phẩm, yêu thích và sản phẩm đã xem | Danh Nguyễn     |
|   8 | Xây dựng giỏ hàng và quy trình đặt hàng                       | Danh Nguyễn     |
|   9 | Tích hợp thanh toán VNPay, VietQR và chuyển khoản             | Danh Nguyễn     |
|  10 | Xây dựng tính phí giao hàng và quản lý địa chỉ nhận hàng      | Danh Nguyễn     |
|  11 | Xây dựng quản lý đơn hàng, tồn kho và hóa đơn                 | Danh Nguyễn     |
|  12 | Xây dựng mã giảm giá, membership và chương trình khuyến mãi   | Danh Nguyễn     |
|  13 | Xây dựng quản lý nội dung cửa hàng, banner và chính sách      | Danh Nguyễn     |
|  14 | Xây dựng đánh giá sản phẩm, thông báo và quản lý người dùng   | Danh Nguyễn     |
|  15 | Xây dựng dashboard doanh thu, chi phí và lợi nhuận            | Danh Nguyễn     |
|  16 | Tích hợp trợ lý AI, virtual try-on và các chức năng hỗ trợ    | Danh Nguyễn     |
|  17 | Kiểm thử chức năng, bảo mật, hiệu năng và khả năng đáp ứng    | Danh Nguyễn     |
|  18 | Triển khai, hoàn thiện tài liệu và bàn giao hệ thống          | Danh Nguyễn     |

Trong giai đoạn đầu, dự án tập trung khảo sát quy trình bán hàng, xác định yêu cầu và thiết kế cơ sở dữ liệu. Các bảng dữ liệu chính bao gồm người dùng, sản phẩm, biến thể, giỏ hàng, đơn hàng, thanh toán, kho hàng, mã giảm giá, đánh giá và các bảng tài chính.

Sau khi hoàn thiện nền tảng, các chức năng cốt lõi được phát triển theo thứ tự: xác thực và phân quyền, quản lý sản phẩm, giỏ hàng, checkout, thanh toán, giao hàng và quản lý đơn hàng. Những chức năng này tạo thành quy trình mua hàng hoàn chỉnh từ lúc khách hàng xem sản phẩm đến khi đơn hàng được xử lý.

Các chức năng mở rộng như membership, mã giảm giá, đánh giá sản phẩm, thông báo đẩy, trợ lý AI và virtual try-on được triển khai ở các giai đoạn tiếp theo. Khu vực quản trị được bổ sung dashboard doanh thu, chi phí, lợi nhuận và các báo cáo hỗ trợ chủ cửa hàng theo dõi hoạt động kinh doanh.

Toàn bộ công việc trong kế hoạch được phân công cho **Danh Nguyễn**. Việc sử dụng một người phụ trách xuyên suốt giúp thống nhất cách triển khai, giảm thời gian bàn giao và thuận tiện trong việc kiểm soát chất lượng của toàn bộ hệ thống.

## 5.2. Biểu đồ Gantt

Biểu đồ Gantt được xây dựng dựa trên sheet **Schedule** trong file Excel. Lịch thực hiện kéo dài 15 tuần, từ ngày **03/08/2026 đến ngày 15/11/2026**. Mỗi dòng trên biểu đồ tương ứng với một nhóm công việc hoặc một task con trong WBS. Các thanh màu thể hiện thời gian bắt đầu, thời lượng và thời điểm hoàn thành của từng task.

**Hình 5.1. Biểu đồ Gantt giai đoạn khảo sát và phân tích yêu cầu**

Giai đoạn đầu bao gồm khảo sát quy trình bán hàng, xác định yêu cầu của khách hàng và quản trị viên, lập KPI và xây dựng kế hoạch dự án. Kết quả của giai đoạn này là danh sách chức năng chính và phạm vi triển khai của hệ thống.

**Hình 5.2. Biểu đồ Gantt giai đoạn thiết kế hệ thống và xác thực người dùng**

Trong giai đoạn này, Danh Nguyễn thiết kế kiến trúc hệ thống, mô hình dữ liệu và triển khai chức năng đăng ký, đăng nhập, quản lý phiên đăng nhập và phân quyền giữa khách hàng, admin và super admin.

**Hình 5.3. Biểu đồ Gantt giai đoạn phát triển catalog và trải nghiệm mua sắm**

Các chức năng được triển khai gồm quản lý sản phẩm, danh mục, thương hiệu, biến thể, hình ảnh, tìm kiếm, lọc sản phẩm, yêu thích và lịch sử xem sản phẩm. Đây là nhóm chức năng giúp khách hàng tìm kiếm và lựa chọn sản phẩm trên storefront.

**Hình 5.4. Biểu đồ Gantt giai đoạn giỏ hàng, checkout, thanh toán và giao hàng**

Giai đoạn này xây dựng quy trình mua hàng hoàn chỉnh. Hệ thống xử lý giỏ hàng, địa chỉ nhận hàng, mã giảm giá, phí vận chuyển, tạo đơn hàng và thanh toán qua VNPay, VietQR hoặc chuyển khoản. Phí vận chuyển được tính toán ở phía máy chủ trước khi lưu vào đơn hàng.

**Hình 5.5. Biểu đồ Gantt giai đoạn quản trị đơn hàng, tài chính và nội dung**

Khu vực quản trị hỗ trợ cập nhật trạng thái đơn hàng, quản lý tồn kho, xuất hóa đơn, quản lý mã giảm giá, membership, banner, chính sách và đánh giá sản phẩm. Dashboard tài chính cung cấp thông tin về doanh thu, chi phí, lợi nhuận và sản phẩm bán chạy.

**Hình 5.6. Biểu đồ Gantt giai đoạn tính năng mở rộng, kiểm thử và triển khai**

Ở giai đoạn cuối, hệ thống được tích hợp trợ lý AI, virtual try-on, thông báo đẩy và các chức năng hỗ trợ người dùng. Sau đó, Danh Nguyễn thực hiện kiểm thử các luồng chính, kiểm tra phân quyền, thanh toán, giao hàng, dữ liệu đơn hàng và khả năng đáp ứng của hệ thống trước khi triển khai.

Thông qua biểu đồ Gantt, tiến độ dự án được theo dõi theo từng tuần và từng task nhỏ. Việc phân chia công việc thành các nhóm Analysis, Implement, Test, Regression và Handover giúp quá trình thực hiện rõ ràng hơn, dễ kiểm soát và thuận tiện trong việc đánh giá mức độ hoàn thành của từng chức năng.

# ĐÁNH GIÁ KẾT QUẢ DỰ ÁN

## Đánh giá KPI

Trong quá trình thực hiện đề tài, Danh Nguyễn đã hoàn thành phần lớn các mục tiêu đề ra và đạt được các kết quả sau:

- Hoàn thành khoảng 90% các kịch bản sử dụng chính của hệ thống thương mại điện tử. Hệ thống đáp ứng các luồng quan trọng dành cho khách hàng và quản trị viên như đăng ký, đăng nhập, xem sản phẩm, tìm kiếm, thêm sản phẩm vào giỏ hàng, đặt hàng, thanh toán và theo dõi đơn hàng.
- Hoàn thành khoảng 95% nhóm chức năng quản trị cốt lõi, bao gồm quản lý sản phẩm, danh mục, thương hiệu, biến thể, tồn kho, đơn hàng, người dùng, đánh giá và nội dung hiển thị trên trang chủ.
- Hoàn thành khoảng 90% mục tiêu phân tích nghiệp vụ bán hàng, bao gồm quy trình quản lý sản phẩm, giỏ hàng, checkout, thanh toán, giao hàng, hóa đơn và xử lý trạng thái đơn hàng.
- Nghiên cứu và áp dụng các công nghệ chính để xây dựng hệ thống, gồm Next.js, React, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL, Recharts, Cloudinary, VNPay, VietQR, Geoapify, Web Push và Vercel.
- Xây dựng kiến trúc hệ thống theo mô hình ứng dụng web hiện đại, trong đó giao diện Next.js/React giao tiếp với các API phía máy chủ, dữ liệu được quản lý thông qua Prisma ORM và cơ sở dữ liệu PostgreSQL.
- Hoàn thành thiết kế cơ sở dữ liệu cho các nhóm dữ liệu chính như User, Product, ProductVariant, Cart, Order, Payment, Shipping, Coupon, Review, Membership, Warehouse, MonthlyFinance và các bảng thông báo.
- Xây dựng hệ thống xác thực và phân quyền cho khách hàng, admin và super admin; đồng thời hỗ trợ đăng nhập bằng tài khoản hệ thống và Google OAuth.
- Hoàn thành quy trình mua hàng từ xem sản phẩm, quản lý giỏ hàng, nhập địa chỉ, tính phí giao hàng, áp dụng mã giảm giá, tạo đơn hàng đến thanh toán và nhận kết quả giao dịch.
- Tích hợp các dịch vụ bên ngoài gồm Cloudinary để lưu trữ hình ảnh, VNPay và VietQR cho thanh toán, Geoapify cho gợi ý địa chỉ và tính phí giao hàng, Web Push cho thông báo quản trị viên.
- Xây dựng và thực hiện các kiểm thử tự động cho nhiều nhóm nghiệp vụ như sản phẩm, biến thể, đơn hàng, vận chuyển, đánh giá, đề xuất sản phẩm, trợ lý AI và xử lý dữ liệu import.
- Mã nguồn được quản lý bằng Git, có quy trình kiểm tra và triển khai tự động thông qua GitHub Actions, đồng thời hỗ trợ triển khai ứng dụng trên nền tảng Vercel.
- Hoàn thành các chức năng hỗ trợ mở rộng như membership, voucher, đánh giá sản phẩm, thông báo đẩy, trợ lý AI và virtual try-on.
- Hoàn thiện dashboard báo cáo doanh thu, chi phí, lợi nhuận và sản phẩm bán chạy, giúp người quản trị theo dõi tình hình kinh doanh của cửa hàng.
- Giao diện được xây dựng theo hướng responsive, có trạng thái loading, thông báo thành công/thất bại và xử lý lỗi cho các thao tác chính.
- Hệ thống được tổ chức thành các module độc lập, giúp thuận tiện cho việc bảo trì, mở rộng chức năng và kiểm soát nghiệp vụ trong quá trình phát triển.

## Đánh giá sản phẩm

Sau quá trình triển khai, hệ thống thương mại điện tử Quỳnh Nhi Store đã hoàn thành các chức năng chính như sau:

- Xây dựng storefront cho khách hàng, hỗ trợ xem danh sách sản phẩm, xem chi tiết sản phẩm, lựa chọn biến thể, tìm kiếm và lọc sản phẩm.
- Xây dựng hệ thống quản lý tài khoản gồm đăng ký, đăng nhập, đăng xuất, quên mật khẩu, cập nhật hồ sơ, quản lý địa chỉ và đăng nhập thông qua Google OAuth.
- Xây dựng phân quyền theo vai trò Customer, Admin và Super Admin nhằm giới hạn quyền truy cập vào các chức năng phù hợp.
- Xây dựng quản lý sản phẩm trong khu vực admin, bao gồm tạo mới, chỉnh sửa, xóa, cập nhật trạng thái, quản lý hình ảnh, danh mục, thương hiệu và các biến thể sản phẩm.
- Xây dựng chức năng import sản phẩm từ file, xử lý bản nháp, kiểm tra dữ liệu và ghi nhận lỗi trong quá trình nhập.
- Xây dựng giỏ hàng và danh sách yêu thích, cho phép khách hàng điều chỉnh số lượng, lựa chọn biến thể và lưu lại sản phẩm quan tâm.
- Xây dựng quy trình checkout, bao gồm lựa chọn địa chỉ, tính phí vận chuyển, áp dụng coupon, membership discount và xác nhận thông tin đơn hàng.
- Tích hợp phương thức thanh toán VNPay, VietQR và chuyển khoản; đồng thời xử lý kết quả trả về, IPN và log thanh toán.
- Xây dựng quản lý đơn hàng, lịch sử trạng thái đơn hàng, hủy đơn, giao hàng và phát hành hóa đơn.
- Xây dựng quản lý kho hàng, tồn kho theo biến thể và các giao dịch nhập, xuất hoặc điều chỉnh số lượng sản phẩm.
- Xây dựng quản lý coupon, chương trình giảm giá, điều kiện áp dụng theo sản phẩm, danh mục hoặc hạng thành viên.
- Xây dựng chương trình membership, quyền lợi thành viên, lịch sử thay đổi và cơ chế quy đổi quyền lợi.
- Xây dựng chức năng đánh giá sản phẩm, hình ảnh đánh giá và quy trình duyệt nội dung đánh giá của khách hàng.
- Xây dựng quản lý nội dung cửa hàng gồm banner, chính sách, section sản phẩm nổi bật và các thiết lập hiển thị trên trang chủ.
- Xây dựng dashboard tài chính với các báo cáo doanh thu, chi phí, lợi nhuận theo thời gian và sản phẩm bán chạy.
- Xây dựng hệ thống thông báo cho quản trị viên, thông báo đơn hàng và Web Push thông qua subscription của người dùng.
- Tích hợp trợ lý AI sử dụng Gemini để hỗ trợ trả lời câu hỏi của khách hàng và tích hợp tính năng virtual try-on thông qua dịch vụ AI bên ngoài.
- Thiết kế giao diện theo hướng hiện đại, sử dụng component tái sử dụng, responsive layout, trạng thái loading và thông báo phản hồi sau thao tác.

Mặc dù đã hoàn thành nhiều chức năng quan trọng, sản phẩm vẫn còn một số hạn chế cần tiếp tục cải thiện:

- Một số chức năng vẫn phụ thuộc vào dịch vụ bên ngoài như VNPay, Geoapify, Cloudinary, Gemini và dịch vụ virtual try-on. Khi các dịch vụ này giới hạn tốc độ hoặc tạm thời không hoạt động, trải nghiệm của hệ thống có thể bị ảnh hưởng.
- Các kiểm thử tự động hiện mới tập trung vào một số module nghiệp vụ và chưa bao phủ toàn bộ giao diện, API route và các luồng tích hợp.
- Hiệu năng khi có số lượng lớn người dùng đồng thời chưa được đánh giá đầy đủ bằng các bài kiểm thử tải và kiểm thử chịu tải chuyên sâu.
- Một số giao diện quản trị có thể cần tiếp tục tối ưu cho màn hình nhỏ, máy tính bảng và các thiết bị có độ phân giải khác nhau.
- Chức năng báo cáo hiện tập trung vào các chỉ số chính; chưa có đầy đủ hệ thống phân tích nâng cao như dự báo doanh thu, phân tích hành vi khách hàng và cảnh báo bất thường.
- Hệ thống chưa có đầy đủ cơ chế quan sát tập trung cho log, metric, tracing và cảnh báo lỗi ở môi trường production.
- Một số chức năng AI phụ thuộc vào độ chính xác của mô hình và dữ liệu đầu vào, do đó kết quả trả về cần được kiểm tra trước khi sử dụng trong các quyết định quan trọng.

Trong tương lai, hệ thống có thể được tiếp tục phát triển theo các hướng sau:

- Mở rộng kiểm thử bằng Unit Test, Integration Test, End-to-End Test và kiểm thử tải cho các luồng mua hàng, thanh toán và quản trị đơn hàng.
- Tăng độ bao phủ của CI/CD, bổ sung kiểm tra chất lượng mã nguồn, bảo mật dependency, migration database và kiểm tra tự động trước khi triển khai.
- Tối ưu hiệu năng thông qua caching, phân trang, tối ưu truy vấn Prisma, tối ưu hình ảnh và bổ sung cơ chế theo dõi hiệu năng thực tế.
- Hoàn thiện giao diện responsive cho thiết bị di động và phát triển trải nghiệm PWA tốt hơn trên Android và iOS.
- Bổ sung các kênh thông báo qua email, SMS hoặc Zalo bên cạnh Web Push để thông báo trạng thái đơn hàng và chương trình khuyến mãi.
- Phát triển hệ thống phân tích nâng cao bằng biểu đồ, báo cáo theo nhóm sản phẩm, khách hàng, khu vực và thời gian.
- Bổ sung dự báo doanh thu, dự báo tồn kho và gợi ý nhập hàng dựa trên dữ liệu bán hàng.
- Mở rộng trợ lý AI để hỗ trợ tư vấn sản phẩm, đề xuất sản phẩm phù hợp và hỗ trợ quản trị viên tra cứu dữ liệu kinh doanh.
- Bổ sung cơ chế sao lưu, phục hồi và kiểm tra tính toàn vẹn dữ liệu định kỳ cho cơ sở dữ liệu production.
- Tiếp tục hoàn thiện chức năng quản lý kho, membership, coupon và các chương trình chăm sóc khách hàng.

Nhìn chung, hệ thống đã đáp ứng được các yêu cầu cốt lõi của một nền tảng thương mại điện tử kết hợp quản trị bán hàng và tài chính. Sản phẩm có nền tảng kỹ thuật tương đối đầy đủ, có khả năng triển khai thực tế và có thể tiếp tục mở rộng trong các giai đoạn sau.

## DANH MỤC TÀI LIỆU THAM KHẢO

1. Vercel, _Next.js Documentation_. [https://nextjs.org/docs](https://nextjs.org/docs)
2. Meta, _React Documentation_. [https://react.dev](https://react.dev)
3. Microsoft, _TypeScript Documentation_. [https://www.typescriptlang.org/docs](https://www.typescriptlang.org/docs)
4. Prisma, _Prisma ORM Documentation_. [https://www.prisma.io/docs](https://www.prisma.io/docs)
5. PostgreSQL Global Development Group, _PostgreSQL Documentation_. [https://www.postgresql.org/docs](https://www.postgresql.org/docs)
6. Tailwind Labs, _Tailwind CSS Documentation_. [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
7. shadcn, _shadcn/ui Documentation_. [https://ui.shadcn.com](https://ui.shadcn.com)
8. Vercel, _Vercel Documentation_. [https://vercel.com/docs](https://vercel.com/docs)
9. Mozilla, _MDN Web Docs_. [https://developer.mozilla.org](https://developer.mozilla.org)
10. Cloudinary, _Cloudinary Documentation_. [https://cloudinary.com/documentation](https://cloudinary.com/documentation)
11. VNPAY, _Tài liệu tích hợp cổng thanh toán VNPAY_. [https://sandbox.vnpayment.vn/apis](https://sandbox.vnpayment.vn/apis)
12. VietQR, _VietQR API Documentation_. [https://www.vietqr.io](https://www.vietqr.io)
13. Geoapify, _Geoapify API Documentation_. [https://apidocs.geoapify.com](https://apidocs.geoapify.com)
14. npm, _web-push Documentation_. [https://www.npmjs.com/package/web-push](https://www.npmjs.com/package/web-push)
15. Google, _Gemini API Documentation_. [https://ai.google.dev/gemini-api/docs](https://ai.google.dev/gemini-api/docs)
16. GitHub, _GitHub Actions Documentation_. [https://docs.github.com/actions](https://docs.github.com/actions)

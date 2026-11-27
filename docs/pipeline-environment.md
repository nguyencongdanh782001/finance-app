# Pipeline và môi trường triển khai

## 1. Mục tiêu

## 2. Tệp cấu hình pipeline trong repository

| Pipeline | Tệp cấu hình | Trigger | Công việc chính |
|---|---|---|---|
| CI | [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | Pull request hoặc push vào `main`, `develop` | Cài dependency, lint, type-check và build. |
| CD | [`.github/workflows/cd-vercel.yml`](.github/workflows/cd-vercel.yml) | Chạy sau CI thành công | Deploy preview cho `develop`, production cho `main`. |

### CI hiện tại

Workflow CI chạy trên `ubuntu-latest`, dùng Node.js 22 và `npm ci`. Các bước thực tế:

```text
Checkout
Setup Node.js 22
Install dependencies
npm run lint
npm run type-check
npm run build
```

### CD hiện tại

- Push vào `develop` sau khi CI thành công sẽ build và deploy preview bằng Vercel CLI.
- Push vào `main` sau khi CI thành công sẽ lấy biến môi trường production, chạy `npm run db:migrate:deploy`, build production và deploy production.
- Vercel credentials được lấy từ GitHub Actions secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- Pipeline không ghi secret trực tiếp vào repository.

## 3. Môi trường

| Môi trường | Nhánh | Mục đích | URL public |
|---|---|---|---|
| Development/Preview | `develop` | Kiểm tra tính năng trước khi đưa lên production. | https://finance-1gozocqbk-nguyencongdanh782001s-projects.vercel.app |
| Production | `main` | Môi trường chạy chính để trình diễn/nghiệm thu. | Chưa có deployment production thành công để xác minh URL public. |
| Local | Không áp dụng | Phát triển và kiểm thử trên máy cá nhân. | `http://localhost:3000` |

URL public phải mở được ở chế độ trình duyệt ẩn danh, không yêu cầu tài khoản nội bộ. Không được ghi URL local thay cho link môi trường đang chạy.

## 4. Lịch sử chạy pipeline

Lịch sử chạy phải lấy trực tiếp từ tab **Actions** của repository, không tự ghi nhớ bằng tay. Mỗi bản nộp cần cập nhật bảng sau:

| Pipeline | Commit/branch | Thời điểm chạy | Trạng thái | Link run | Ghi chú |
|---|---|---|---|---|---|
| CI | `main` / `8899deb` | 26/11/2026 14:05:05–14:10:09 (GMT+7) | Success | [CI run #387](https://github.com/nguyencongdanh782001/finance-app/actions/runs/45772697090) | Lint, type-check và build thành công. |
| CD Preview | `develop` / `8899deb` | 26/11/2026 14:06:52 (GMT+7) | Success | [Preview deployment](https://github.com/nguyencongdanh782001/finance-app/deployments/8078774103) | URL: https://finance-1gozocqbk-nguyencongdanh782001s-projects.vercel.app |
| CD Production | `main` / `8899deb` | 26/11/2026 14:10:12–14:12:20 (GMT+7) | Failure | [CD run #370](https://github.com/nguyencongdanh782001/finance-app/actions/runs/45773322138) | Deployment thất bại; chưa có URL production xác minh được. |

### Lần chạy thành công gần nhất

- CI thành công gần nhất: [CI run #387](https://github.com/nguyencongdanh782001/finance-app/actions/runs/45772697090), nhánh `main`, commit `8899deb4ed99cbdc3b7e9deabe85221e4b3d4033`.
- CD preview thành công gần nhất: [Preview deployment](https://github.com/nguyencongdanh782001/finance-app/deployments/8078774103), nhánh `develop`, commit `8899deb4ed99cbdc3b7e9deabe85221e4b3d4033`.
- CD production thành công gần nhất: Chưa có; [CD run #370](https://github.com/nguyencongdanh782001/finance-app/actions/runs/45773322138) gần nhất bị `failure`.
- Commit được triển khai gần nhất: `8899deb4ed99cbdc3b7e9deabe85221e4b3d4033` trên `main` và `develop`.
- Môi trường đã kiểm tra sau deploy: Preview public tại https://finance-1gozocqbk-nguyencongdanh782001s-projects.vercel.app.

Link lịch sử tổng quát cần đặt theo repository thật:

```text
https://github.com/nguyencongdanh782001/finance-app/actions
```

## 5. Tiêu chí nghiệm thu Pipeline và môi trường

- Có tệp cấu hình pipeline được commit trong repository.
- Pull request hoặc push vào `main`/`develop` tạo được CI run.
- CI chạy đủ lint, type-check và build; lỗi phải làm pipeline thất bại.
- CD chỉ chạy sau khi CI thành công.
- `develop` deploy được preview; `main` deploy được production.
- Có link tới ít nhất một lần CI thành công gần nhất và một lần deploy thành công gần nhất.
- Link môi trường mở được công khai, không chỉ trỏ tới `localhost`.
- Database migration production chạy trước bước build/deploy production theo workflow hiện tại.
- Không đưa token, password, database URL hoặc secret vào log và repository.
- Sau deploy phải kiểm tra smoke test: mở trang chủ, danh sách sản phẩm, đăng nhập, API docs và một luồng checkout không thanh toán thật.

## 6. Checklist cập nhật trước khi nộp

- [ ] URL production công khai: chưa có deployment production thành công.
- [x] URL preview/môi trường demo đã cập nhật.
- [x] Link CI thành công gần nhất đã cập nhật.
- [x] Link CD preview gần nhất đã cập nhật.
- [x] Commit, branch và thời gian chạy đã cập nhật.
- [x] Link bằng chứng Actions/deployment đã cập nhật.
- [ ] Kiểm tra URL preview ở chế độ ẩn danh.

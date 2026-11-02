import { mkdir, writeFile } from "node:fs/promises";

const outDir = new URL("../docs/activity/", import.meta.url);
await mkdir(outDir, { recursive: true });

const colors = { border: "#8aa1c1", header: "#dbe7f5", lane: "#f8fbff", box: "#ffffff", text: "#1f2937", accent: "#315b96" };
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function textLines(lines, x, y, size = 16, weight = 500) {
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${colors.text}">${lines.map((line, i) => `<tspan x="${x}" dy="${i ? size + 3 : 0}">${esc(line)}</tspan>`).join("")}</text>`;
}

async function diagram({ file, title, lanes, nodes, edges, note }) {
  const W = 1400;
  const headerH = 82;
  const laneW = W / lanes.length;
  const H = Math.max(900, Math.ceil(Math.max(...Object.values(nodes).map((n) => n.y + n.h), 760)) + 100);
  const laneRects = lanes.map((lane, i) => `<rect x="${i * laneW}" y="${headerH}" width="${laneW}" height="${H - headerH}" fill="${i % 2 ? colors.lane : "#ffffff"}" stroke="${colors.border}"/><rect x="${i * laneW}" y="0" width="${laneW}" height="${headerH}" fill="${colors.header}" stroke="${colors.border}"/>${textLines([lane], i * laneW + laneW / 2, 49, 20, 700)}`).join("");
  const defs = `<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="${colors.accent}"/></marker></defs>`;
  const edgeSvg = edges.map(([from, to, label]) => { const a = nodes[from]; const b = nodes[to]; const x1 = a.x + a.w / 2; const y1 = a.y + a.h; const x2 = b.x + b.w / 2; const y2 = b.y; const mid = Math.round((y1 + y2) / 2); return `<path d="M ${x1} ${y1} L ${x1} ${mid} L ${x2} ${mid} L ${x2} ${y2}" fill="none" stroke="${colors.accent}" stroke-width="2.5" marker-end="url(#arrow)"/>${label ? textLines([label], (x1 + x2) / 2, mid - 8, 14, 600) : ""}`; }).join("");
  const nodeSvg = Object.values(nodes).map((n) => {
    if (n.type === "start") return `<circle cx="${n.x + n.w / 2}" cy="${n.y + 15}" r="13" fill="#111827"/><circle cx="${n.x + n.w / 2}" cy="${n.y + 15}" r="19" fill="none" stroke="#111827" stroke-width="2"/>`;
    if (n.type === "end") return `<circle cx="${n.x + n.w / 2}" cy="${n.y + 18}" r="13" fill="#111827"/><circle cx="${n.x + n.w / 2}" cy="${n.y + 18}" r="20" fill="none" stroke="#111827" stroke-width="3"/>`;
    if (n.type === "decision") return `<polygon points="${n.x + n.w / 2},${n.y} ${n.x + n.w},${n.y + n.h / 2} ${n.x + n.w / 2},${n.y + n.h} ${n.x},${n.y + n.h / 2}" fill="#fff8df" stroke="#bd8b18" stroke-width="2"/>${textLines(n.lines, n.x + n.w / 2, n.y + n.h / 2 - (n.lines.length - 1) * 9, 15, 700)}`;
    return `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="12" fill="${colors.box}" stroke="${colors.accent}" stroke-width="2"/>${textLines(n.lines, n.x + n.w / 2, n.y + n.h / 2 - (n.lines.length - 1) * 9, 16, 600)}`;
  }).join("");
  const footer = note ? `<text x="30" y="${H - 25}" font-family="Arial, sans-serif" font-size="14" fill="#64748b">${esc(note)}</text>` : "";
  const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}<rect width="${W}" height="${H}" fill="#ffffff"/><text x="${W / 2}" y="36" text-anchor="middle" font-family="Arial, sans-serif" font-size="25" font-weight="700" fill="#1e3a5f">${esc(title)}</text>${laneRects}${edgeSvg}${nodeSvg}${footer}</svg>`;
  await writeFile(new URL(file, outDir), svg, "utf8");
}

const box = (x, y, lines, w = 210, h = 62) => ({ x, y, w, h, lines });
const common = { start: { x: 570, y: 105, w: 40, h: 35, type: "start" }, end: { x: 570, y: 760, w: 40, h: 40, type: "end" } };

await diagram({ file: "01-xac-thuc.svg", title: "ACTIVITY DIAGRAM: XÁC THỰC", lanes: ["Người dùng", "Hệ thống", "Cơ sở dữ liệu"], nodes: { ...common, a: box(165, 180, ["Mở trang đăng nhập"]), b: box(165, 285, ["Nhập email và mật khẩu"]), c: box(165, 390, ["Nhấn Đăng nhập"]), d: box(590, 285, ["Kiểm tra thông tin", "đăng nhập"]), e: { x: 555, y: 405, w: 140, h: 100, type: "decision", lines: ["Thông tin", "hợp lệ?"] }, f: box(930, 285, ["Truy vấn tài khoản"]), g: box(590, 565, ["Tạo session và", "đăng nhập thành công"]), h: box(165, 565, ["Hiển thị thông báo", "lỗi đăng nhập"]) }, edges: [["start", "a"], ["a", "b"], ["b", "c"], ["c", "d"], ["d", "e"], ["e", "f", "Có"], ["f", "g"], ["e", "h", "Không"], ["g", "end"], ["h", "b"]], note: "Luồng áp dụng cho đăng nhập bằng tài khoản; website cũng hỗ trợ đăng ký, Google OAuth và đặt lại mật khẩu." });

await diagram({ file: "02-quan-ly-ho-so.svg", title: "ACTIVITY DIAGRAM: QUẢN LÝ HỒ SƠ", lanes: ["Khách hàng", "Hệ thống", "Cơ sở dữ liệu"], nodes: { ...common, a: box(165, 180, ["Mở trang tài khoản"]), b: box(590, 180, ["Tải thông tin hồ sơ"]), c: box(930, 180, ["Truy vấn User và", "UserAddress"]), d: box(165, 310, ["Xem hoặc chỉnh sửa", "thông tin cá nhân"]), e: { x: 555, y: 430, w: 140, h: 100, type: "decision", lines: ["Dữ liệu", "hợp lệ?"] }, f: box(930, 450, ["Lưu thông tin", "cập nhật"]), g: box(590, 600, ["Thông báo cập nhật", "thành công"]), h: box(165, 600, ["Hiển thị thông báo", "lỗi"]), i: box(165, 740, ["Quản lý địa chỉ,", "mật khẩu, đơn hàng"]) }, edges: [["start", "a"], ["a", "b"], ["b", "c"], ["c", "d"], ["d", "e"], ["e", "f", "Có"], ["f", "g"], ["e", "h", "Không"], ["g", "i"], ["h", "d"], ["i", "end"]], note: "Hồ sơ khách hàng gồm thông tin cá nhân, địa chỉ giao hàng, mật khẩu và lịch sử đơn hàng." });

await diagram({ file: "03-khach-hang.svg", title: "ACTIVITY DIAGRAM: KHÁCH HÀNG", lanes: ["Khách hàng", "Hệ thống", "Cơ sở dữ liệu"], nodes: { ...common, a: box(165, 165, ["Truy cập website"]), b: box(165, 265, ["Tìm kiếm hoặc chọn", "sản phẩm"]), c: box(590, 265, ["Hiển thị sản phẩm", "và thông tin chi tiết"]), d: box(165, 390, ["Thêm vào giỏ hàng", "hoặc Mua ngay"]), e: box(590, 390, ["Kiểm tra tồn kho", "và giỏ hàng"]), f: { x: 555, y: 515, w: 140, h: 100, type: "decision", lines: ["Đủ điều kiện", "đặt hàng?"] }, g: box(930, 535, ["Tạo Order và", "OrderItem"]), h: box(165, 665, ["Nhận thông báo lỗi"]), i: box(590, 665, ["Theo dõi đơn hàng", "và đánh giá"] ) }, edges: [["start", "a"], ["a", "b"], ["b", "c"], ["c", "d"], ["d", "e"], ["e", "f"], ["f", "g", "Có"], ["f", "h", "Không"], ["g", "i"], ["h", "b"], ["i", "end"]], note: "Khách hàng có thể quản lý giỏ hàng, yêu thích, mã giảm giá, đơn hàng và đánh giá sản phẩm." });

await diagram({ file: "04-quan-tri-vien.svg", title: "ACTIVITY DIAGRAM: QUẢN TRỊ VIÊN", lanes: ["Quản trị viên", "Hệ thống", "Cơ sở dữ liệu"], nodes: { ...common, a: box(165, 165, ["Đăng nhập trang", "quản trị"]), b: box(590, 165, ["Kiểm tra vai trò", "ADMIN/SUPER_ADMIN"]), c: { x: 555, y: 290, w: 140, h: 100, type: "decision", lines: ["Có quyền", "truy cập?"] }, d: box(165, 435, ["Chọn chức năng:", "sản phẩm, đơn hàng,", "người dùng, báo cáo"]), e: box(590, 435, ["Xử lý yêu cầu", "và kiểm tra dữ liệu"]), f: box(930, 435, ["Đọc hoặc cập nhật", "dữ liệu"]), g: box(590, 610, ["Trả kết quả và", "thông báo thao tác"]), h: box(165, 610, ["Thông báo không", "có quyền truy cập"]), i: box(165, 745, ["Tiếp tục quản trị", "hoặc đăng xuất"] ) }, edges: [["start", "a"], ["a", "b"], ["b", "c"], ["c", "d", "Có"], ["c", "h", "Không"], ["d", "e"], ["e", "f"], ["f", "g"], ["g", "i"], ["h", "end"], ["i", "end"]], note: "Quản trị viên quản lý sản phẩm, danh mục, đơn hàng, kho, khuyến mãi, nội dung và báo cáo tài chính." });

await diagram({ file: "05-thanh-toan.svg", title: "ACTIVITY DIAGRAM: THANH TOÁN CHUYỂN KHOẢN / QR", lanes: ["Khách hàng", "Hệ thống", "Quản lý / CSDL"], nodes: {
  start: { x: 570, y: 105, w: 40, h: 35, type: "start" },
  end: { x: 570, y: 1080, w: 40, h: 40, type: "end" },
  a: box(165, 165, ["Xác nhận giỏ hàng", "và địa chỉ giao hàng"]),
  b: box(590, 165, ["Tạo đơn hàng", "trạng thái chờ thanh toán"]),
  c: box(590, 290, ["Hiển thị QR và", "thông tin chuyển khoản"]),
  d: box(165, 420, ["Chuyển khoản đúng số tiền", "và nội dung đơn hàng"]),
  e: box(165, 550, ["Bấm “Tôi đã chuyển khoản”"]),
  f: box(590, 550, ["Ghi nhận yêu cầu", "chờ kiểm tra"]),
  g: box(930, 550, ["Gửi thông báo cho", "quản lý kiểm tra"]),
  h: box(930, 680, ["Kiểm tra giao dịch", "và đối soát số tiền"]),
  i: { x: 555, y: 805, w: 140, h: 100, type: "decision", lines: ["Giao dịch", "hợp lệ?"] },
  j: box(590, 950, ["Cập nhật đã thanh toán", "và gửi thông báo khách hàng"]),
  k: box(165, 950, ["Giữ trạng thái chờ kiểm tra", "hoặc thông báo cần bổ sung"])
}, edges: [["start", "a"], ["a", "b"], ["b", "c"], ["c", "d"], ["d", "e"], ["e", "f"], ["f", "g"], ["g", "h"], ["h", "i"], ["i", "j", "Có"], ["i", "k", "Không"], ["j", "end"], ["k", "e"]], note: "Luồng chuyển khoản ngân hàng/QR: khách báo đã chuyển khoản, quản lý kiểm tra và xác nhận thủ công trước khi cập nhật trạng thái thanh toán." });

await diagram({ file: "06-he-thong.svg", title: "ACTIVITY DIAGRAM: HỆ THỐNG", lanes: ["Người dùng", "Ứng dụng", "Cơ sở dữ liệu"], nodes: { ...common, a: box(165, 165, ["Thực hiện thao tác", "trên website"]), b: box(590, 165, ["Tiếp nhận yêu cầu"]), c: box(590, 285, ["Xác thực và kiểm tra", "quyền truy cập"]), d: { x: 555, y: 410, w: 140, h: 100, type: "decision", lines: ["Yêu cầu", "hợp lệ?"] }, e: box(930, 425, ["Truy vấn hoặc cập nhật", "PostgreSQL"]), f: box(590, 585, ["Xử lý nghiệp vụ", "và ghi nhận kết quả"]), g: box(165, 585, ["Nhận kết quả hoặc", "thông báo lỗi"]), h: box(165, 725, ["Tiếp tục sử dụng", "hoặc đăng xuất"] ) }, edges: [["start", "a"], ["a", "b"], ["b", "c"], ["c", "d"], ["d", "e", "Có"], ["e", "f"], ["f", "g"], ["d", "g", "Không"], ["g", "h"], ["h", "end"]], note: "Luồng tổng quát áp dụng cho các yêu cầu về sản phẩm, tài khoản, đơn hàng, thanh toán và báo cáo tài chính." });

await diagram({ file: "07-thu-do-ai.svg", title: "ACTIVITY DIAGRAM: THỬ ĐỒ AI", lanes: ["Khách hàng", "Ứng dụng", "Dịch vụ AI"], nodes: {
  start: { x: 570, y: 105, w: 40, h: 35, type: "start" },
  end: { x: 570, y: 975, w: 40, h: 40, type: "end" },
  a: box(165, 180, ["Mở chức năng", "Thử đồ AI"]),
  b: box(165, 295, ["Tải ảnh toàn thân", "hoặc chụp ảnh"]),
  c: box(590, 295, ["Kiểm tra định dạng", "và dung lượng ảnh"]),
  d: { x: 555, y: 420, w: 140, h: 100, type: "decision", lines: ["Ảnh hợp lệ", "và đủ rõ?"] },
  e: box(165, 575, ["Chọn sản phẩm", "và loại trang phục"]),
  f: box(590, 575, ["Kiểm tra nhóm sản phẩm", "áo / quần / váy"]),
  g: { x: 555, y: 700, w: 140, h: 100, type: "decision", lines: ["Loại đồ", "được hỗ trợ?"] },
  h: box(930, 705, ["Gửi ảnh người, ảnh đồ", "và loại trang phục"]),
  i: box(930, 840, ["AI tạo ảnh thử đồ"]),
  j: box(590, 840, ["Hiển thị ảnh kết quả", "và thông tin cảnh báo"]),
  k: box(165, 705, ["Hiển thị lỗi và", "cho phép chọn lại"]),
  l: box(165, 865, ["Tải ảnh xuống hoặc", "thử sản phẩm khác"])
}, edges: [["start", "a"], ["a", "b"], ["b", "c"], ["c", "d"], ["d", "e", "Có"], ["d", "b", "Không"], ["e", "f"], ["f", "g"], ["g", "h", "Có"], ["g", "k", "Không"], ["h", "i"], ["i", "j"], ["j", "l"], ["k", "e"], ["l", "end"]], note: "Ảnh người dùng chỉ được dùng để tạo kết quả minh họa; hệ thống không đảm bảo màu sắc và độ vừa vặn giống hoàn toàn thực tế." });

console.log("Generated activity diagrams in docs/activity/");

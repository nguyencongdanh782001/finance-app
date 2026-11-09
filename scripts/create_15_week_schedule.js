/* eslint-disable @typescript-eslint/no-require-imports */
const ExcelJS = require('exceljs');
const path = require('path');

const wb = new ExcelJS.Workbook();
wb.creator = 'OpenAI';
wb.title = 'WBS Task Tracker - Finance App';
wb.subject = 'WBS và schedule 15 tuần';

const C = { navy: '1F4E78', blue: 'B4C7E7', white: 'FFFFFF', green: 'A9D18E', greenDark: '548235', purple: '8064A2', orange: 'F4B183', lightGreen: 'E2F0D9', border: 'A6A6A6', text: '1F2937' };
const FONT = 'Aptos';
const start = new Date(Date.UTC(2026, 7, 3));
const days = 15 * 7;
const dateAt = (n) => { const d = new Date(start); d.setUTCDate(d.getUTCDate() + n); return d; };
const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const weeks = [
  ['Khởi động dự án', 'Project kickoff và thống nhất mục tiêu'], ['Phạm vi dự án', 'Xác định phạm vi, đầu ra và tiêu chí thành công'],
  ['Phân tích yêu cầu', 'Thu thập yêu cầu từ các bên liên quan'], ['Ưu tiên yêu cầu', 'Phân loại và chốt backlog ưu tiên'],
  ['Thiết kế giải pháp', 'Thiết kế kiến trúc và quy trình tổng thể'], ['Duyệt thiết kế', 'Review và phê duyệt thiết kế'],
  ['Chuẩn bị triển khai', 'Chuẩn bị dữ liệu, môi trường và tài nguyên'], ['Phát triển giai đoạn 1', 'Triển khai hạng mục chính - giai đoạn 1'],
  ['Kiểm thử giai đoạn 1', 'Kiểm tra nội bộ và xử lý lỗi giai đoạn 1'], ['Phát triển giai đoạn 2', 'Triển khai hạng mục chính - giai đoạn 2'],
  ['Tích hợp hệ thống', 'Tích hợp các hạng mục và xử lý vấn đề phát sinh'], ['Nghiệm thu nội bộ', 'Kiểm thử tổng thể và nghiệm thu nội bộ'],
  ['Đào tạo', 'Đào tạo người dùng và chuẩn bị tài liệu'], ['Bàn giao', 'Bàn giao kết quả và hoàn thiện hồ sơ'], ['Đóng dự án', 'Tổng kết, đánh giá và đóng dự án'],
];

const taskRows = [];
let taskId = 1600;
weeks.forEach(([phase, summary], wi) => {
  const s = wi * 7;
  taskRows.push({ parent: true, week: wi + 1, phase, summary, start: s, end: s + 6 });
  const detail = [
    { level3: 'Analysis', level4: 'Analysis', task: `Làm rõ yêu cầu và tiêu chí nghiệm thu: ${phase}`, type: 'Analysis', assignee: 'Tôi', est: 1, start: s, end: s },
    { level3: 'Implement', level4: 'Frontend', task: `Cập nhật giao diện và luồng người dùng: ${phase}`, type: 'Frontend', assignee: 'Tôi', est: 2, start: s + 1, end: s + 2 },
    { level3: 'Implement', level4: 'Backend', task: `Triển khai xử lý nghiệp vụ và tích hợp dữ liệu: ${phase}`, type: 'Frontend', assignee: 'Tôi', est: 2, start: s + 2, end: s + 3 },
    { level3: 'Test', level4: 'Execute TC', task: `Soạn và thực thi test case: ${phase}`, type: 'QC', assignee: 'Tôi', est: 1, start: s + 4, end: s + 4 },
    { level3: 'Test', level4: 'Regression', task: `Sửa lỗi, regression test và xác nhận hoàn tất: ${phase}`, type: 'QC', assignee: 'Tôi', est: 1, start: s + 5, end: s + 5 },
    { level3: 'Release', level4: 'Handover', task: `Cập nhật tài liệu và chốt kết quả tuần ${wi + 1}`, type: 'Release', assignee: 'Tôi', est: 1, start: s + 6, end: s + 6 },
  ].map((item) => ({ ...item, week: wi + 1, phase, summary, taskId: ++taskId }));
  taskRows.push(...detail);
});

function fill(cell, color) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } }; }
function border(cell) { cell.border = { top: { style: 'thin', color: { argb: C.border } }, bottom: { style: 'thin', color: { argb: C.border } }, left: { style: 'thin', color: { argb: C.border } }, right: { style: 'thin', color: { argb: C.border } } }; }
function base(cell, align = 'left') { cell.font = { name: FONT, size: 10, color: C.text }; cell.alignment = { vertical: 'center', horizontal: align, wrapText: true }; border(cell); }
function styleRow(row, color = C.white) { row.eachCell((cell) => { base(cell); fill(cell, color); }); row.height = 24; }

// WBS / Tasks sheet
const wbs = wb.addWorksheet('WBS-Tasks');
wbs.views = [{ state: 'frozen', xSplit: 6, ySplit: 3 }];
wbs.mergeCells('A1:T1'); wbs.getCell('A1').value = 'WBS / TASK TRACKER - FINANCE APP';
wbs.getCell('A1').font = { name: FONT, size: 15, bold: true, color: C.white }; wbs.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left' }; fill(wbs.getCell('A1'), C.navy); wbs.getRow(1).height = 30;
wbs.mergeCells('A2:T2'); wbs.getCell('A2').value = '15 tuần: 03/08/2026 - 15/11/2026 | Trạng thái mẫu: Closed | G%: 100%'; wbs.getCell('A2').font = { name: FONT, italic: true, color: '5B6573' };
const wbsHeaders = ['#', 'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Selected #', 'Task', 'Note', 'Status', 'Type', 'Assignee', 'Est. (d)', 'G%', '%', 'Phase', 'TaskID', 'Link1', 'Link2', 'Link3', 'ProductName'];
const wh = wbs.addRow(wbsHeaders); wh.height = 30;
wh.eachCell((cell, i) => { base(cell, 'center'); cell.font = { name: FONT, size: 10, bold: true, color: C.text }; fill(cell, i === 9 ? 'FFF200' : C.blue); });
let number = 1;
taskRows.forEach((r, idx) => {
  if (r.parent) {
    const row = wbs.addRow([number++, '', `2026-${String(r.week).padStart(2, '0')} ${r.phase}`, '', '', '', r.summary, '', '', '', '', '', '', '', r.week, '', '', '', '', 'FinanceApp']);
    styleRow(row, C.lightGreen); row.eachCell((cell) => { cell.font = { name: FONT, size: 10, bold: true, color: C.text }; }); row.height = 26;
  } else {
    const row = wbs.addRow([number++, 'Finance App', `2026-${String(r.week).padStart(2, '0')}`, r.level3, r.level4, '☑', r.task, r.level3 === 'Test' ? 'Đã kiểm tra theo kế hoạch' : 'Đã hoàn tất theo kế hoạch', 'Closed', r.type, r.assignee, r.est, 1, '100%', r.week, r.taskId, `https://example.com/task/${r.taskId}`, '', '', 'FinanceApp']);
    styleRow(row, idx % 2 ? C.white : 'F7FBFD');
    row.getCell(6).alignment = { horizontal: 'center', vertical: 'center' }; row.getCell(9).font = { name: FONT, size: 10, bold: true, color: C.greenDark }; fill(row.getCell(9), C.lightGreen);
    row.getCell(10).font = { name: FONT, size: 10, color: r.type === 'QC' ? C.purple : C.greenDark }; fill(row.getCell(10), r.type === 'QC' ? 'E4DFEC' : C.lightGreen); row.getCell(13).numFmt = '0%';
    row.getCell(17).font = { name: FONT, size: 9, color: '0563C1', underline: true };
  }
});
wbs.autoFilter = { from: 'A3', to: `T${wbs.rowCount}` };
wbs.columns = [
  { width: 5 }, { width: 16 }, { width: 22 }, { width: 13 }, { width: 15 }, { width: 10 }, { width: 48 }, { width: 28 }, { width: 12 }, { width: 12 }, { width: 17 }, { width: 10 }, { width: 8 }, { width: 8 }, { width: 8 }, { width: 10 }, { width: 34 }, { width: 14 }, { width: 14 }, { width: 15 },
];

// Schedule / Gantt sheet
const sch = wb.addWorksheet('Schedule');
sch.views = [{ state: 'frozen', xSplit: 10, ySplit: 4 }];
const timelineStartCol = 9;
sch.mergeCells('A1:H1'); sch.getCell('A1').value = 'SCHEDULE - 15 WEEK GANTT VIEW'; sch.getCell('A1').font = { name: FONT, size: 15, bold: true, color: C.white }; sch.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left' }; fill(sch.getCell('A1'), C.navy); sch.getRow(1).height = 30;
sch.mergeCells('A2:H2'); sch.getCell('A2').value = 'WBS / Task'; sch.getCell('A2').font = { name: FONT, bold: true, color: C.white }; fill(sch.getCell('A2'), C.navy); sch.getCell('A2').alignment = { horizontal: 'center', vertical: 'center' };
let month = null;
for (let i = 0; i < days; i++) { const d = dateAt(i); const key = `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`; if (!month || month.key !== key) { month = { key, start: i, end: i }; const end = (() => { let j = i; while (j + 1 < days && `${dateAt(j + 1).getUTCFullYear()}/${String(dateAt(j + 1).getUTCMonth() + 1).padStart(2, '0')}` === key) j++; return j; })(); month.end = end; sch.mergeCells(1, timelineStartCol + i, 1, timelineStartCol + end); const c = sch.getCell(1, timelineStartCol + i); c.value = key; c.font = { name: FONT, bold: true, color: C.white }; c.alignment = { horizontal: 'center', vertical: 'center' }; fill(c, C.navy); } }
for (let wi = 0; wi < 15; wi++) { const c1 = timelineStartCol + wi * 7; const c2 = c1 + 6; sch.mergeCells(2, c1, 2, c2); const c = sch.getCell(2, c1); c.value = `W${String(wi + 1).padStart(2, '0')}`; c.font = { name: FONT, bold: true, color: C.white }; c.alignment = { horizontal: 'center', vertical: 'center' }; fill(c, wi % 2 ? C.greenDark : C.purple); }
for (let i = 0; i < days; i++) { const col = timelineStartCol + i; const d = dateAt(i); const c3 = sch.getCell(3, col); const c4 = sch.getCell(4, col); c3.value = d.getUTCDate(); c4.value = weekdays[i % 7]; [c3, c4].forEach((c) => { base(c, 'center'); c.font = { name: FONT, size: 9, bold: true, color: C.text }; fill(c, (i % 7 >= 5) ? 'E7E6E6' : (Math.floor(i / 7) % 2 ? 'E2F0D9' : 'FCE4D6')); }); }
const staticHeaders = ['#', 'Level 1', 'Level 2', 'Total', 'Front', 'QC', 'Total %', 'TaskID']; const staticRow = sch.getRow(4); staticHeaders.forEach((v, i) => { const c = staticRow.getCell(i + 1); c.value = v; base(c, 'center'); c.font = { name: FONT, size: 10, bold: true }; fill(c, C.blue); });
let schedNum = 1;
taskRows.forEach((r) => {
  const values = r.parent ? [schedNum++, '', `W${String(r.week).padStart(2, '0')} ${r.phase}`, '', '', '', '', ''] : [schedNum++, 'Finance App', `W${String(r.week).padStart(2, '0')}`, r.est, r.type === 'Frontend' ? r.est : 0, r.type === 'QC' ? r.est : 0, 1, r.taskId];
  const row = sch.addRow(values); styleRow(row, r.parent ? C.lightGreen : C.white); if (r.parent) { row.height = 25; row.eachCell((cell) => { cell.font = { name: FONT, size: 10, bold: true }; }); }
  for (let i = 0; i < days; i++) { const cell = row.getCell(timelineStartCol + i); base(cell, 'center'); if (r.parent) fill(cell, C.lightGreen); else if (i >= r.start && i <= r.end) { const barColor = r.type === 'QC' ? C.purple : (r.type === 'Release' ? C.orange : (r.type === 'Analysis' ? C.blue : C.green)); fill(cell, barColor); cell.value = i === r.start ? '▶' : ''; cell.font = { name: FONT, size: 9, bold: true, color: r.type === 'QC' ? C.white : C.greenDark }; } else fill(cell, (i % 7 >= 5) ? 'F2F2F2' : C.white); }
});
const legendRow = sch.getRow(sch.rowCount + 2); legendRow.getCell(2).value = 'Legend'; legendRow.getCell(2).font = { name: FONT, bold: true };
[['Frontend', C.green], ['QC', C.purple], ['Release / Milestone', C.orange]].forEach(([label, color], i) => { const c1 = legendRow.getCell(3 + i * 2); const c2 = legendRow.getCell(4 + i * 2); c1.value = label; c2.value = ''; fill(c2, color); base(c1); base(c2); });
sch.columns = [{ width: 5 }, { width: 15 }, { width: 23 }, { width: 8 }, { width: 8 }, { width: 8 }, { width: 9 }, { width: 10 }]; for (let i = 0; i < days; i++) sch.getColumn(timelineStartCol + i).width = 3.3;
for (const sheet of [wbs, sch]) { sheet.properties.defaultRowHeight = 20; sheet.pageSetup.orientation = 'landscape'; sheet.pageSetup.fitToPage = true; sheet.pageSetup.fitToWidth = 1; sheet.pageSetup.fitToHeight = 0; sheet.headerFooter.oddFooter = '&LFinance App - WBS / Schedule&RPage &P / &N'; }
const out = path.join(__dirname, '..', 'schedule_15_tuan_thang_08_2026.xlsx'); wb.xlsx.writeFile(out).then(() => console.log(out));

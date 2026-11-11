/* =========================================================
   CHỈ CẦN SỬA FILE NÀY
   1. Thả ảnh của bạn vào assets/me.jpg (ảnh trường đã có sẵn: assets/school.jpg)
   2. Nhạc: assets/music.mp3 (đang là Pomp and Circumstance — nhạc lễ tốt nghiệp).
      Muốn bài khác thì chép đè file mp3 cùng tên. Xoá file → tự phát hộp nhạc soạn bằng code.
   3. Gửi link riêng cho từng khách: index.html?to=Anh%20Minh
      → thiệp sẽ ghi "Thân gửi: Anh Minh"
   ========================================================= */
window.CONFIG = {
  name: "Nguyễn Văn Kinh",
  initials: "VK",                       // chữ trên con dấu sáp
  degree: "Cử nhân Khoa học Dữ liệu",
  school: "Trường Đại học Khoa học Tự nhiên, ĐHQG-HCM",
  classOf: "2026",

  // Giờ Việt Nam (+07:00) — gặp nhau sáng Thứ Bảy 21/11/2026, 10:30–12:00
  start: "2026-11-21T10:30:00+07:00",
  end:   "2026-11-21T12:00:00+07:00",

  venue: "Cột cờ giữa sân trường",
  address: "227 Nguyễn Văn Cừ, P. Chợ Quán (Q.5 cũ), TP. Hồ Chí Minh",
  mapQuery: "Trường Đại học Khoa học Tự nhiên, 227 Nguyễn Văn Cừ",  // từ khoá tìm trên Google Maps

  photo: "assets/me.jpg",
  schoolPhoto: "assets/school.jpg",
  schoolPin: [65, 50],                  // vị trí cột cờ trên ảnh trường (% ngang, % dọc); null để ẩn
  music: "assets/music.mp3",

  message:
    "Cuối cùng thì ngày này cũng đến rồi! Sau bao mùa thi, bao đêm chạy deadline và không biết bao nhiêu dòng code, " +
    "mình đã chính thức tốt nghiệp. Ngày vui sẽ trọn vẹn hơn nhiều nếu có bạn ở bên — " +
    "ghé chung vui và chụp với mình vài tấm ảnh thật xinh nha!",

  phone: "0908014240",                  // hiện số + nút sao chép, gọi, Zalo

  // Nút "Mình sẽ tham dự": khách đăng nhập Google → mail xác nhận về hộp thư của bạn.
  // Cách lấy 2 giá trị này: xem đầu file apps-script/rsvp.gs. Để trống → nút báo khách nhắn Zalo.
  googleClientId: "473722698084-03bf8a8rrflgqbobum1gl2sc35ntjvol.apps.googleusercontent.com",                   // dạng 1234-abc.apps.googleusercontent.com
  rsvpUrl: "https://script.google.com/macros/s/AKfycbxrVXeGk9audIPbDUtuEQF-vc0Iz8duLFbpndIm4SXwC6BE7IHSze2yDf_JRE9EpJ4Z/exec",                          // dạng https://script.google.com/macros/s/…/exec

  // Hộp quà rơi: bấm mở ra 1 món ngẫu nhiên (hết lượt mới lặp lại). Loại: code | tease | fortune | voucher
  gifts: [
    ["code", "if bạn.đến_dự_lễ():\n    vibe = \"đỉnh nóc kịch trần\"  # 🚀"],
    ["code", "git commit -m \"ra trường rồi mấy ní ơi 🎓\"\ngit push origin tương-lai  # gét gô!"],
    ["code", "model.fit(X=4_năm_đại_học, y=tấm_bằng)\n# accuracy: 100% — slay ✅\n# loss: vài sợi tóc 🥲"],
    ["code", "assert bạn in danh_sách_khách_mời\n# ✅ passed — vắng bạn là toang á"],
    ["code", "while còn_deadline:\n    cày()\n# và giờ thì… free rồi nha 😎"],
    ["code", "SELECT * FROM kỷ_niệm\nWHERE có_bạn = TRUE;\n-- kết quả: quá trời quá đất 💛"],
    ["code", "try:\n    tốt_nghiệp()\nexcept ChạyDeadlineError:\n    trà_sữa += 1  # keo lỳ suốt 4 năm 🧋"],
    ["code", "import vibe\nvibe.check(ngày=\"21/11\")\n# → chill phết, đi liền 😌"],
    ["tease", "Mở quà rồi là phải tới nha mấy ní, không là mình dỗi á 😤 Real đó!"],
    ["tease", "Ủa alo? Bạn vừa trúng gói “chụp chung 10 tấm sống ảo” 📸 No refund nha!"],
    ["tease", "Hết quà rồi đó… xạo á, mở tiếp đi bạn ui 🙈"],
    ["tease", "Quà này chỉ unlock khi bạn có mặt ở cột cờ thôi, khum có ngoại lệ 😏"],
    ["tease", "Không tới là bị mình seen không rep cả năm luôn á, nghĩ kĩ nha 😶"],
    ["fortune", "AI do mình tự train phán: 99,9% bạn sẽ slay nhất trong ảnh tốt nghiệp của mình 📸✨"],
    ["fortune", "Thống kê nhanh: 4 năm ≈ 1.461 ngày, n ly trà sữa 🧋, 1 tấm bằng — và bạn là biến quan trọng nhất trong model 💛"],
    ["fortune", "Quẻ hôm nay: Đại cát! Ai tới chung vui là cả năm auto may mắn, đỉnh của chóp 🍀"],
    ["voucher", "Voucher 1 cái ôm siêu to khổng lồ 🤗\nÁp dụng tại cột cờ · HSD: 21/11/2026"],
    ["voucher", "Vé VIP: được đội mũ cử nhân của mình check-in 1 tấm sống ảo 🎓"],
    ["voucher", "Phiếu nợ: mình nợ bạn 1 ly trà sữa full topping 🧋 Nhớ tới đòi nha ní!"],
  ],

  credits:
    "Ảnh trường: trungydang / Wikimedia Commons (CC BY 3.0) · " +
    "Nhạc: E. Elgar — Pomp and Circumstance No. 1, U.S. Marine Band (public domain)",
};

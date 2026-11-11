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

  credits:
    "Ảnh trường: trungydang / Wikimedia Commons (CC BY 3.0) · " +
    "Nhạc: E. Elgar — Pomp and Circumstance No. 1, U.S. Marine Band (public domain)",
};

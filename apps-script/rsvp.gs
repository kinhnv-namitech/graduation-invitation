/* =========================================================
   XÁC NHẬN THAM DỰ — chạy miễn phí trên Google Apps Script
   Khách đăng nhập Google trên thiệp → script kiểm tra đúng là tài khoản đó
   → gửi mail về hộp thư của bạn (tên người gửi = tên khách, bấm Trả lời là trả lời khách).

   CÀI ĐẶT (làm 1 lần):
   1. console.cloud.google.com → tạo project mới
      → APIs & Services → OAuth consent screen: chọn External, điền tên app + email → Publish app
        (chỉ xin quyền tên + email nên KHÔNG cần Google duyệt)
      → Credentials → Create credentials → OAuth client ID → loại "Web application"
        Authorized JavaScript origins: thêm link trang thiệp (vd https://tenban.github.io)
        và http://localhost:8000 (để thử trên máy)
      → copy Client ID: dán vào CLIENT_ID bên dưới VÀ vào googleClientId trong config.js
   2. script.google.com → New project → xoá code mẫu, dán toàn bộ file này → Save
      → Deploy → New deployment → loại "Web app"
        Execute as: Me   ·   Who has access: Anyone   → Deploy → cho phép quyền gửi email
      → copy "Web app URL" (…/exec) dán vào rsvpUrl trong config.js
   Sửa code sau này: Deploy → Manage deployments → Edit → Version: New version (giữ nguyên URL).
   ========================================================= */
const CLIENT_ID = "473722698084-03bf8a8rrflgqbobum1gl2sc35ntjvol.apps.googleusercontent.com";
const OWNER_EMAIL = Session.getEffectiveUser().getEmail(); // mail về tài khoản đã Deploy; muốn email khác thì ghi thẳng vào đây

function doPost(e) {
  try {
    const { token, invited } = JSON.parse(e.postData.contents);

    // Xác minh token do chính thiệp này xin từ Google (không ai giả mạo tên/email được)
    const info = fetchJson("https://oauth2.googleapis.com/tokeninfo?access_token=" + encodeURIComponent(token));
    if (info.aud !== CLIENT_ID) throw new Error("Token không thuộc thiệp này");
    const guest = fetchJson("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: "Bearer " + token } });
    if (!guest.email_verified) throw new Error("Email Google chưa được xác minh");
    const name = guest.name || guest.email;

    // Không lưu gì trên máy chủ (thiệp đã hứa với khách) — chỉ gửi 1 mail.
    // Chống bấm trùng do thiệp tự nhớ trên máy khách (localStorage).
    MailApp.sendEmail({
      to: OWNER_EMAIL,
      replyTo: guest.email,
      name,
      subject: "🎓 " + name + " sẽ đến dự lễ tốt nghiệp của bạn!",
      body: [
        name + " vừa xác nhận sẽ đến dự lễ tốt nghiệp của bạn 🎉",
        "",
        "Tên Google: " + name,
        "Email: " + guest.email,
        "Tên ghi trên thiệp: " + (invited || "—"),
        "Lúc: " + Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "HH:mm dd/MM/yyyy"),
        "",
        "Bấm Trả lời để nhắn lại trực tiếp cho " + name + ".",
      ].join("\n"),
    });
    return json({ ok: true, name });
  } catch (err) {
    return json({ ok: false, error: String((err && err.message) || err) });
  }
}

const fetchJson = (url, opts) => JSON.parse(UrlFetchApp.fetch(url, opts).getContentText()); // token sai/hết hạn → Google trả lỗi → throw
const json = (o) => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);

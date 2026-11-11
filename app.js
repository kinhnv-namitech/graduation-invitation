(() => {
  const C = window.CONFIG;
  const $ = (s) => document.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const guest = new URLSearchParams(location.search).get("to")?.trim().slice(0, 60) || ""; // không có ?to= → thiệp gửi chung
  const start = new Date(C.start);
  const end = C.end ? new Date(C.end) : new Date(+start + 3 * 36e5);
  const pad = (n) => String(n).padStart(2, "0");
  history.scrollRestoration = "manual";

  /* ---------- Đổ dữ liệu (textContent → an toàn với ?to=) ---------- */
  const data = { ...C, guest };
  document.querySelectorAll("[data-k]").forEach((el) => (el.textContent = data[el.dataset.k] ?? ""));
  if (!guest) document.querySelectorAll('[data-k="guest"]').forEach((el) => el.remove());
  if (guest) document.title = `${guest} ơi, mời bạn dự lễ tốt nghiệp của ${C.name}`;

  const ring = $("#ringText");
  ring.textContent = `Graduation Day ✦ Class of ${C.classOf} ✦ Congratulations ✦ `;
  ring.setAttribute("textLength", "826"); // trải đều chữ kín vòng tròn (2π·132)
  ring.setAttribute("lengthAdjust", "spacing");

  const placeholder = (label) =>
    "data:image/svg+xml," + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#26306a"/><stop offset="1" stop-color="#0a0f24"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/><text x="200" y="250" font-size="96" text-anchor="middle">🎓</text><text x="200" y="320" fill="#d9b46c" font-family="sans-serif" font-size="17" text-anchor="middle">${label}</text></svg>`);
  const setImg = (el, src, label) => {
    el.onerror = () => { el.onerror = null; el.src = placeholder(label); };
    el.src = src || placeholder(label);
  };
  setImg($("#photo"), C.photo, "Thêm ảnh: assets/me.jpg");
  setImg($("#schoolPhoto"), C.schoolPhoto, "Thêm ảnh: assets/school.jpg");

  const pin = $("#pinMark"); // chấm "gặp nhau ở đây" trên ảnh trường; ảnh zoom dần vào đúng chỗ đó
  if (C.schoolPin && C.schoolPhoto) {
    const [x, y] = C.schoolPin;
    pin.style.left = x + "%"; pin.style.top = y + "%";
    $(".sp-zoom").style.transformOrigin = `${x}% ${y}%`;
    $("#schoolPhoto").addEventListener("error", () => pin.remove());
  } else pin.remove();

  /* ---------- Ngày giờ (luôn hiển thị theo giờ Việt Nam) ---------- */
  const vn = new Date(+start + 7 * 36e5); // ponytail: cố định UTC+7, đổi nếu tổ chức ở múi giờ khác
  const WD = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  $("#weekday").textContent = WD[vn.getUTCDay()];
  const hm = (d) => { const v = new Date(+d + 7 * 36e5); return `${pad(v.getUTCHours())}:${pad(v.getUTCMinutes())}`; };
  $("#time").textContent = vn.getUTCHours() < 12 ? "Sáng" : vn.getUTCHours() < 18 ? "Chiều" : "Tối";
  $("#timeRange").textContent = `${hm(start)} – ${hm(end)}`;
  $("#day").textContent = pad(vn.getUTCDate());
  $("#month").textContent = "Tháng " + (vn.getUTCMonth() + 1);
  $("#year").textContent = vn.getUTCFullYear();

  const cd = ["d", "h", "m", "s"].map((k) => $("#cd-" + k));
  const tick = () => {
    const s = Math.max(0, Math.floor((start - Date.now()) / 1000));
    [Math.floor(s / 86400), pad(Math.floor((s % 86400) / 3600)), pad(Math.floor((s % 3600) / 60)), pad(s % 60)]
      .forEach((v, i) => {
        const el = cd[i];
        if (el.textContent === String(v)) return;
        el.textContent = v;
        el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
      });
  };
  tick(); setInterval(tick, 1000);

  const gcal = (d) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  $("#calBtn").href = "https://calendar.google.com/calendar/render?" + new URLSearchParams({
    action: "TEMPLATE",
    text: `🎓 Lễ tốt nghiệp của ${C.name}`,
    dates: `${gcal(start)}/${gcal(end)}`,
    location: `${C.venue}, ${C.school}, ${C.address}`,
    details: "Hẹn gặp bạn ở đó nhé!",
  });

  const q = encodeURIComponent(C.mapQuery || C.address);
  $("#map").src = `https://maps.google.com/maps?q=${q}&z=16&output=embed`;
  $("#dirBtn").href = `https://www.google.com/maps/dir/?api=1&destination=${q}`;

  const phone = String(C.phone || "").replace(/\D/g, "");
  if (phone) {
    $("#callBtn").href = "tel:" + phone; $("#zaloBtn").href = "https://zalo.me/" + phone;
    $("#phoneNum").textContent = phone.replace(/(\d{4})(\d{3})(\d+)/, "$1 $2 $3"); // 0908 014 240
    $("#copyBtn").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(phone); $("#copyBtn").textContent = "✓ Đã chép số"; }
      catch { getSelection().selectAllChildren($("#phoneNum")); } // không có clipboard (http/file) → bôi đen sẵn để tự chép
    });
  } else { $(".contact").remove(); $(".phone-card").remove(); }

  /* ---------- Không gian lễ hội: đốm sáng bokeh, kim tuyến, pháo giấy rơi, mũ ---------- */
  const cv = $("#sky"), ctx = cv.getContext("2d");
  const COLORS = ["#f6e3a6", "#d9b46c", "#fffbe8", "#c0394b", "#a07a35"]; // vàng, kem, đỏ thắm (màu bằng & dải lụa)
  let W, H, stars = [], orbs = [], parts = [], last = 0;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ORB = ["255,210,110", "255,236,170", "120,180,255", "255,140,185"].map((rgb) => { // vẽ sẵn 1 đốm mờ mỗi màu
    const c = document.createElement("canvas"), g = c.getContext("2d"), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    c.width = c.height = 64;
    gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(.5, `rgba(${rgb},.4)`); gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return c;
  });

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: Math.round((W * H) / 12000) }, () => ({ x: rnd(0, W), y: rnd(0, H), r: rnd(.4, 1.6), p: rnd(0, 6.3), s: rnd(.01, .04) }));
    orbs = Array.from({ length: Math.round((W * H) / 22000) + 6 }, () => ({ x: rnd(0, W), y: rnd(0, H), r: rnd(16, 64), p: rnd(0, 6.3), s: rnd(.004, .012), vy: rnd(.05, .25), img: ORB[(Math.random() * 4) | 0] }));
  };
  const drawOrb = (o, alpha) => { ctx.globalAlpha = alpha; ctx.drawImage(o.img, o.x - o.r, o.y - o.r, o.r * 2, o.r * 2); };
  addEventListener("resize", resize); resize();

  const add = (p) => parts.length < 700 && parts.push({ vx: 0, vy: 0, g: 0, drag: 1, rot: 0, vr: 0, size: 3, max: p.life, ...p });
  const confetti = (x, y, a, v, g, i) =>
    add({ kind: "conf", x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g, drag: .975, size: rnd(5, 10), rot: rnd(0, 6), vr: rnd(-.3, .3), life: rnd(160, 260), color: COLORS[i % 5] });

  const burst = (x, y, n) => { for (let i = 0; i < n; i++) confetti(x, y, rnd(0, Math.PI * 2), rnd(3, 13), .18, i); };
  const toss = () => {
    for (let i = 0; i < 14; i++)
      add({ kind: "cap", x: rnd(W * .1, W * .9), y: H + 30, vx: rnd(-2.5, 2.5), vy: -rnd(12, 19) * Math.min(1, H / 800 + .3), g: .28, size: rnd(30, 52), rot: rnd(-.5, .5), vr: rnd(-.12, .12), life: 260 });
    [[0, 1], [W, -1]].forEach(([x, side]) => { // hai ống pháo giấy ở 2 góc dưới
      for (let i = 0; i < 70; i++) confetti(x, H, -Math.PI / 2 + side * rnd(.2, .7), rnd(10, 19), .25, i);
    });
  };

  const star4 = (x, y, r) => { // ngôi sao 4 cánh lấp lánh
    ctx.beginPath(); ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill();
  };

  const frame = (t) => {
    const dt = Math.min((t - last) / 16.67 || 1, 3); last = t;
    ctx.clearRect(0, 0, W, H);

    for (const o of orbs) { // đốm sáng trôi chậm lên như đèn sân khấu ngoài tiêu cự
      o.p += o.s * dt; o.y -= o.vy * dt;
      if (o.y < -o.r) { o.y = H + o.r; o.x = rnd(0, W); }
      drawOrb(o, .18 + .12 * Math.sin(o.p));
    }

    ctx.fillStyle = "#fff8e1";
    const sy = scrollY;
    for (const s of stars) {
      s.p += s.s * dt;
      ctx.globalAlpha = .25 + .75 * Math.abs(Math.sin(s.p));
      const y = (((s.y - sy * s.r * .06) % H) + H) % H; // parallax nhẹ khi cuộn
      if (s.r > 1.2) star4(s.x, y, s.r * 2.6);
      else { ctx.beginPath(); ctx.arc(s.x, y, s.r, 0, 7); ctx.fill(); }
    }

    if (Math.random() < .25 * dt) add({ kind: "dust", x: rnd(0, W), y: H + 5, vx: rnd(-.2, .2), vy: rnd(-.9, -.3), size: rnd(.8, 2.2), life: rnd(300, 600) });
    if (Math.random() < .05 * dt) // pháo giấy rơi lác đác suốt buổi lễ
      add({ kind: "conf", x: rnd(0, W), y: -10, vx: rnd(-.4, .4), vy: rnd(.8, 1.6), size: rnd(5, 9), rot: rnd(0, 6), vr: rnd(-.08, .08), life: 3000, color: COLORS[(Math.random() * 5) | 0] });

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vx *= p.drag ** dt; p.vy = p.vy * p.drag ** dt + p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.life -= dt;
      if (p.life <= 0 || p.y > H + 80) { parts.splice(i, 1); continue; }
      const a = Math.min(1, p.life / 40);
      ctx.globalAlpha = a;
      if (p.kind === "conf") {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.cos(p.rot * 3)); // lật như dải giấy
        ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); ctx.restore();
      } else if (p.kind === "cap") { // mũ tốt nghiệp vẽ tay: thân mũ, mặt mũ vuông, tua rua vàng
        const s = p.size / 2;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, .75 + .25 * Math.cos(p.rot * 2));
        ctx.fillStyle = "#0c1130";
        ctx.beginPath(); ctx.moveTo(-s * .5, 0); ctx.lineTo(s * .5, 0); ctx.lineTo(s * .45, s * .55); ctx.quadraticCurveTo(0, s * .8, -s * .45, s * .55); ctx.fill();
        ctx.fillStyle = "#1f2a62"; ctx.strokeStyle = "#d9b46c"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, -s * .42); ctx.lineTo(s, 0); ctx.lineTo(0, s * .42); ctx.lineTo(-s, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "#f6e3a6"; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(s * .75, s * .1); ctx.lineTo(s * .75, s * .62); ctx.stroke();
        ctx.fillStyle = "#d9b46c"; ctx.fillRect(s * .66, s * .6, s * .18, s * .34);
        ctx.restore();
      } else if (p.kind === "spark") {
        ctx.fillStyle = p.color; star4(p.x, p.y, p.size * a);
      } else if (p.kind === "dust") {
        ctx.globalAlpha = .6 * Math.sin((p.life / p.max) * Math.PI);
        ctx.fillStyle = "#f6e3a6"; ctx.beginPath(); ctx.arc(p.x + Math.sin(p.life / 30) * 6, p.y, p.size, 0, 7); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  };

  if (reduce) { // tĩnh cho người dùng hạn chế chuyển động
    document.querySelectorAll("svg").forEach((s) => s.pauseAnimations?.()); // dừng tua rua SMIL
    orbs.forEach((o) => drawOrb(o, .25));
    ctx.fillStyle = "#fff8e1"; ctx.globalAlpha = .6;
    stars.forEach((s) => { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill(); });
  } else requestAnimationFrame(frame);

  let lastSpark = 0;
  addEventListener("pointermove", (e) => { // vệt kim tuyến theo con trỏ / ngón tay
    if (reduce || e.timeStamp - lastSpark < 30) return;
    lastSpark = e.timeStamp;
    add({ kind: "spark", x: e.clientX, y: e.clientY, vx: rnd(-.6, .6), vy: rnd(-.2, .9), size: rnd(3, 6), life: rnd(30, 50), color: COLORS[(Math.random() * 3) | 0] });
  });

  /* ---------- Nhạc: hộp nhạc soạn bằng Web Audio (giai điệu gốc) ---------- */
  const Music = (() => {
    let ac, master, audio, bar = 0, next = 0, playing = false;
    const BAR = (60 / 76) * 4, E = BAR / 8;
    const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
    // Vòng hợp âm bass đi xuống kiểu Canon (Pachelbel, public domain); giai điệu tự soạn
    const BASS = [48, 47, 45, 43, 41, 40, 38, 43];
    const CHORD = [[60, 64, 67, 72], [62, 67, 71, 74], [60, 64, 69, 72], [59, 64, 67, 71], [60, 65, 69, 72], [60, 64, 67, 72], [62, 65, 69, 72], [62, 67, 71, 74]];
    const MEL = [
      [[79, 1.5], [77, .5], [76, 1], [72, 1]], [[74, 2], [71, 1], [74, 1]],
      [[72, 1.5], [74, .5], [76, 1], [81, 1]], [[79, 3], [76, 1]],
      [[77, 1.5], [76, .5], [74, 1], [72, 1]], [[76, 1], [79, 1], [84, 2]],
      [[81, 1.5], [79, .5], [77, 1], [74, 1]], [[71, 1], [74, 1], [79, 2]],
    ];
    const ARP = [0, 1, 2, 3, 1, 2, 3, 2];

    const tone = (m, t, vol, decay, type, partials) => {
      const g = ac.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + .008);
      g.gain.exponentialRampToValueAtTime(.0001, t + decay);
      g.connect(master);
      partials.forEach(([mul, amp]) => {
        const o = ac.createOscillator(), pg = ac.createGain();
        o.type = type; o.frequency.value = mtof(m) * mul; pg.gain.value = amp;
        o.connect(pg).connect(g); o.start(t); o.stop(t + decay + .05);
      });
    };
    const bell = (m, t, vol = .11) => tone(m, t, vol, 2.4, "sine", [[1, 1], [2, .3], [3.01, .12], [4.2, .05]]);
    const harp = (m, t) => tone(m, t, .045, 1.4, "triangle", [[1, 1], [2, .15]]);

    const padChord = (notes, t) => {
      const f = ac.createBiquadFilter(), g = ac.createGain();
      f.type = "lowpass"; f.frequency.value = 900;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.025, t + 1); g.gain.linearRampToValueAtTime(0, t + BAR + .4);
      f.connect(g).connect(master);
      notes.forEach((m, i) => {
        const o = ac.createOscillator();
        o.type = "sawtooth"; o.frequency.value = mtof(m - 12); o.detune.value = i % 2 ? 6 : -6;
        o.connect(f); o.start(t); o.stop(t + BAR + .5);
      });
    };

    const playBar = (i, t) => {
      const k = i % 8, pass = Math.floor(i / 8), ch = CHORD[k];
      tone(BASS[k], t, .16, BAR * 1.1, "sine", [[1, 1], [2, .2]]);
      padChord(ch.slice(0, 3), t);
      ARP.forEach((n, j) => harp(ch[n], t + j * E + Math.random() * .008));
      let beat = 0;
      MEL[k].forEach(([m, len]) => {
        const at = t + beat * (BAR / 4);
        bell(m, at);
        if (pass % 2 === 1) bell(m + 12, at + .012, .03); // vòng lặp lẻ: thêm lớp lấp lánh quãng tám
        beat += len;
      });
    };

    const schedule = () => { while (next < ac.currentTime + 1.2) { playBar(bar++, next); next += BAR; } };
    const startSynth = () => { next = ac.currentTime + .15; schedule(); setInterval(schedule, 250); };
    const setUi = (on) => { playing = on; $("#musicBtn").setAttribute("aria-pressed", on); };

    return {
      start() { // gọi ngay trong cú chạm mở thiệp → iOS/Android cho phép phát âm thanh
        ac = new (window.AudioContext || window.webkitAudioContext)();
        ac.resume();
        master = ac.createGain();
        master.gain.setValueAtTime(0, ac.currentTime);
        master.gain.linearRampToValueAtTime(.7, ac.currentTime + 2.5);
        const comp = ac.createDynamicsCompressor(), rev = ac.createConvolver(), send = ac.createGain();
        const len = ac.sampleRate * 3.2, ir = ac.createBuffer(2, len, ac.sampleRate);
        for (let c = 0; c < 2; c++) {
          const d = ir.getChannelData(c);
          for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3; // reverb hội trường
        }
        rev.buffer = ir; send.gain.value = .5;
        master.connect(comp); master.connect(send).connect(rev).connect(comp); comp.connect(ac.destination);
        setUi(true);
        if (!C.music) return startSynth();
        audio = new Audio(C.music); audio.loop = true;
        audio.play().catch(() => { audio = null; startSynth(); }); // không có file nhạc → dùng hộp nhạc
      },
      chime() { // chuỗi chuông khi tung mũ
        if (!playing) return;
        const t = ac.currentTime + .02;
        [72, 76, 79, 84, 88, 91].forEach((m, i) => bell(m, t + i * .07, .08));
      },
      toggle() {
        if (!ac) return;
        if (audio) playing ? audio.pause() : audio.play();
        else playing ? ac.suspend() : ac.resume();
        setUi(!playing);
      },
      get playing() { return playing; },
    };
  })();

  /* ---------- Mở thiệp ---------- */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: .15, rootMargin: "0px 0px -40px 0px" });

  let opened = false;
  $("#envelope").addEventListener("click", () => {
    if (opened) return;
    opened = true;
    Music.start();
    document.body.classList.add("open");
    setTimeout(() => {
      document.body.classList.add("opened");
      document.body.classList.remove("locked");
      burst(W / 2, H * .42, 200);
      document.querySelectorAll(".reveal").forEach((el) => {
        const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
        el.style.transitionDelay = sibs.indexOf(el) * 120 + "ms";
        io.observe(el);
      });
    }, reduce ? 0 : 2100);
    setTimeout(() => $("#intro").remove(), reduce ? 100 : 3400);
  });

  $("#tossBtn").addEventListener("click", () => { toss(); Music.chime(); navigator.vibrate?.([30, 40, 30]); });
  $("#musicBtn").addEventListener("click", () => Music.toggle());

  /* ---------- Xác nhận tham dự: đăng nhập Google → Apps Script (apps-script/rsvp.gs) gửi mail cho chủ thiệp ---------- */
  const rsvpBtn = $("#rsvpBtn"), say = (t) => ($("#rsvpMsg").textContent = t);
  const confirmed = (name) => {
    rsvpBtn.disabled = true; rsvpBtn.textContent = "✓ Đã xác nhận tham dự";
    say(`Cảm ơn ${name}! Mình nhận được rồi, hẹn gặp bạn ở lễ tốt nghiệp nha 💛`);
  };
  try { const n = localStorage.getItem("rsvp"); if (n) confirmed(n); } catch {} // Safari riêng tư có thể chặn localStorage
  if (C.googleClientId && C.rsvpUrl)
    document.head.append(Object.assign(document.createElement("script"), { src: "https://accounts.google.com/gsi/client", async: true }));

  let tokenClient;
  rsvpBtn.addEventListener("click", () => {
    if (!C.googleClientId || !C.rsvpUrl) return say("Phần xác nhận chưa được cài đặt — bạn nhắn Zalo cho mình giúp nhé!");
    const oauth = window.google?.accounts?.oauth2;
    if (!oauth) return say("Đang tải đăng nhập Google, bạn bấm lại sau giây lát nhé…");
    tokenClient ??= oauth.initTokenClient({ // popup mở ngay trong cú bấm → Safari/Chrome không chặn
      client_id: C.googleClientId,
      scope: "openid email profile",
      callback: async (r) => {
        if (r.error) return say("Chưa đăng nhập được Google, bạn thử lại nhé.");
        rsvpBtn.disabled = true; say("Đang gửi xác nhận…");
        try {
          const res = await (await fetch(C.rsvpUrl, { // body text/plain → không preflight CORS với Apps Script
            method: "POST", body: JSON.stringify({ token: r.access_token, invited: guest }),
          })).json();
          if (!res.ok) throw new Error(res.error);
          confirmed(res.name);
          try { localStorage.setItem("rsvp", res.name); } catch {}
          const b = rsvpBtn.getBoundingClientRect();
          burst(b.left + b.width / 2, b.top, 120); Music.chime();
        } catch {
          rsvpBtn.disabled = false; say("Gửi chưa được, bạn thử lại hoặc nhắn Zalo cho mình nhé.");
        }
      },
      error_callback: () => say("Cửa sổ đăng nhập đã đóng — bấm lại khi bạn sẵn sàng nhé."),
    });
    tokenClient.requestAccessToken();
  });

  let autoPaused = false;
  document.addEventListener("visibilitychange", () => { // tạm dừng nhạc khi chuyển app/tab
    if (document.hidden && Music.playing) { Music.toggle(); autoPaused = true; }
    else if (!document.hidden && autoPaused) { Music.toggle(); autoPaused = false; }
  });

  /* ---------- Nghiêng ảnh 3D theo chuột ---------- */
  const portrait = $("#portrait");
  portrait.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const r = portrait.getBoundingClientRect();
    portrait.style.setProperty("--ry", ((e.clientX - r.left) / r.width - .5) * 16 + "deg");
    portrait.style.setProperty("--rx", -((e.clientY - r.top) / r.height - .5) * 16 + "deg");
  });
  portrait.addEventListener("pointerleave", () => { portrait.style.setProperty("--rx", "0deg"); portrait.style.setProperty("--ry", "0deg"); });
})();

// Kiểm tra nút "Mình sẽ tham dự" với Google + Apps Script giả lập, qua Chrome headless (CDP).
// Chạy: node tests/rsvp-check.mjs   (cần Google Chrome trên macOS)
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";

const url = new URL("../index.html?to=Lan%20Anh", import.meta.url).href;
const port = 9800 + Math.floor(Math.random() * 100);
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "rsvp-"))}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i++) {
  await sleep(200);
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page")?.webSocketDebuggerUrl; } catch {}
}
const ws = new WebSocket(wsUrl); await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map(), errors = [];
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id) pending.get(d.id)?.(d.result);
  if (d.method === "Runtime.exceptionThrown") errors.push(d.params.exceptionDetails.exception?.description);
};
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (e) => (await send("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true })).result?.value;
const state = () => ev(`({ msg: document.querySelector('#rsvpMsg').textContent, btn: document.querySelector('#rsvpBtn').textContent, dis: document.querySelector('#rsvpBtn').disabled })`);

try {
  await send("Runtime.enable"); await send("Page.enable");
  await send("Page.navigate", { url }); await sleep(1500);

  // 1. chưa cấu hình → báo nhắn Zalo
  await ev("document.querySelector('#rsvpBtn').click()");
  let s = await state(); assert.match(s.msg, /chưa được cài đặt/); assert.equal(s.dis, false);

  // 2. Apps Script báo lỗi → nút bấm lại được
  await ev(`CONFIG.googleClientId = 'cid'; CONFIG.rsvpUrl = 'https://script.example/exec';
    window.google = { accounts: { oauth2: { initTokenClient: (c) => ({ requestAccessToken: () => c.callback({ access_token: 'tok123' }) }) } } };
    window.__sent = []; window.fetch = async (u, o) => { window.__sent.push({ u, body: JSON.parse(o.body) }); return { json: async () => window.__reply }; };
    window.__reply = { ok: false, error: 'boom' }; document.querySelector('#rsvpBtn').click()`);
  await sleep(200); s = await state(); assert.match(s.msg, /Gửi chưa được/); assert.equal(s.dis, false);

  // 3. thành công → gửi đúng token + tên trên thiệp, khoá nút, nhớ trong localStorage
  await ev(`window.__reply = { ok: true, name: 'Lan Anh Google' }; document.querySelector('#rsvpBtn').click()`);
  await sleep(200); s = await state();
  assert.deepEqual(await ev("window.__sent.at(-1)"), { u: "https://script.example/exec", body: { token: "tok123", invited: "Lan Anh" } });
  assert.equal(s.dis, true); assert.match(s.btn, /Đã xác nhận/); assert.match(s.msg, /Cảm ơn Lan Anh Google/);

  // 4. mở lại thiệp → vẫn hiện đã xác nhận
  await send("Page.reload"); await sleep(1500); s = await state();
  assert.equal(s.dis, true); assert.match(s.msg, /Cảm ơn Lan Anh Google/);

  assert.deepEqual(errors, []);
  console.log("rsvp-check: 4/4 pass");
} finally {
  ws.close(); chrome.kill();
}

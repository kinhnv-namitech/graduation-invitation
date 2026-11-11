# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page graduation invitation (Vietnamese UI) built with plain HTML/CSS/JS. There's no build step, package manager, linter, or test suite. External resources are Google Fonts plus Google Maps and Google Calendar links.

## Running

```sh
python3 -m http.server 8000   # then open http://localhost:8000/?to=Anh%20Minh
```

Opening `index.html` directly over `file://` also works because the scripts are classic scripts, not modules. Use the `?to=` param to check the personalised guest name. Google sign-in is the exception: it only works over http(s) from an origin listed on the OAuth client, such as `http://localhost:8000`.

```sh
node tests/page-check.mjs     # the only test: RSVP button (Google and Apps Script mocked) and the falling gift dialog; needs macOS Google Chrome
```

## Architecture

- **[config.js](config.js)** is the only file the owner is meant to edit. It sets `window.CONFIG` (name, degree, school, ISO `start`/`end` with `+07:00`, venue/address/`mapQuery`, asset paths, `schoolPin` = `[x%, y%]` of the meeting point on the school photo, `phone` (shown large with a copy button, plus call/Zalo links), `googleClientId`/`rsvpUrl`, `credits`). The meeting time pill (`#timeRange`) shows `start`–`end`. It loads before [app.js](app.js). New user-facing content belongs here, not hard-coded in HTML.
- **[app.js](app.js)** is one IIFE that does everything:
  - **Data binding:** every `[data-k="key"]` element gets `textContent` from `{...CONFIG, guest}`. `guest` comes from `?to=` and is cut to 60 characters. Without `?to=` the invite is generic: `guest` is empty and every `[data-k="guest"]` element is removed, leaving no "bạn" placeholder. Keep using `textContent` (never `innerHTML`), because `?to=` is attacker-controlled.
  - **Dates:** the display is hard-wired to UTC+7 by shifting `start` and reading `getUTC*`. The countdown, the Google Calendar link (`gcal()`), and the Maps embed and directions URLs are all derived from CONFIG.
  - **Missing images:** if `assets/me.jpg` or `assets/school.jpg` is missing or fails to load, `setImg()` swaps in an inline SVG placeholder. The owner supplies `me.jpg`.
  - **Bundled assets:** `assets/school.jpg` is a Wikimedia Commons photo under CC BY 3.0, so `CONFIG.credits` must keep its attribution. `assets/music.mp3` is a public-domain US Marine Band recording.
  - **Meeting-point pin:** `#pinMark` is placed at `CONFIG.schoolPin`, and the photo's slow zoom (`.sp-zoom`) uses the same point as its origin. Change both values together if the photo changes.
  - **Canvas `#sky`:** one particle system. `add()` pushes particles with a `kind` (`conf`, `cap`, `spark`, or `dust`) and caps them at 700. Bokeh orbs (`orbs`, drawn from the pre-rendered `ORB` sprites) and the twinkling `stars` are separate arrays that `resize()` rebuilds. Confetti also falls slowly all the time. The page gradient lives on the fixed `body::before` layer, not on `body`, because iOS ignores `background-attachment: fixed`. `burst()` and `toss()` are the confetti and cap-toss effects. A new effect means a new `kind` branch in `frame()`.
  - **Music:** `Music.start()` must run inside the envelope click handler because mobile browsers only allow audio from a user gesture. If `CONFIG.music` can't play, it falls back to a Web Audio music box that schedules bars with a lookahead (`schedule()` every 250 ms). The melody is original over a Canon-style bass line. Playback pauses when the tab is hidden.
- **RSVP ("Mình sẽ tham dự"):**
  1. When `CONFIG.googleClientId` and `CONFIG.rsvpUrl` are both set, `app.js` lazy-loads Google Identity Services.
  2. The button click calls `initTokenClient(...).requestAccessToken()` synchronously, so Safari doesn't block the popup. It asks only for `openid email profile`, which need no Google verification.
  3. The access token is POSTed as a `text/plain` body (avoiding a CORS preflight) to the Apps Script web app in [apps-script/rsvp.gs](apps-script/rsvp.gs).
  4. The script checks the token's `aud` against its own `CLIENT_ID`, fetches userinfo, and emails the deploying account through `MailApp`. The guest's name is the sender name and their address is the reply-to. **Nothing is stored server-side.** The RSVP note on the page promises guests this, so don't add Script Properties or Sheets logging without also changing that copy. Only the client's `localStorage` guards against double clicks.
  5. On success, the page saves `localStorage.rsvp` so the confirmed state survives a reload.

  Two limits to keep in mind:
  - **The `.gs` file only runs in Google's editor.** Edits must be pasted into script.google.com and redeployed as a new version.
  - **The mail can't come from the guest's own Gmail.** That would need the restricted `gmail.send` scope.
- **Falling gifts:**
  - `giftLoop()` starts 4.5 s after the envelope opens and spawns `.gift` `<button>`s, at most 2 at a time. These are DOM elements, not canvas particles, because the canvas has `pointer-events: none`.
  - Gifts fall with the CSS `fall` animation and are removed by a timeout. Under reduced motion they don't fall: they sit still, then disappear on the same timeout.
  - Clicking one opens the `#surprise` dialog with the next item from a shuffled bag of `CONFIG.gifts`, given as `[type, text]` with type `code`, `tease`, `fortune` or `voucher`. The bag only repeats after every item has been shown.
  - All copy is deliberately Gen Z slang (the owner asked for it). Keep that tone when adding gifts.
- **Open sequence:** the `body` classes `locked` → `open` → `opened` drive it. `open` starts the envelope CSS animation. After 2100 ms, `opened` shows `#card`, unlocks scrolling, and starts observing `.reveal` elements. `#intro` is removed at 3400 ms. **The JS timeouts must match the transition durations in [style.css](style.css).**
- **Reveal-on-scroll:** `.reveal` elements fade in through an IntersectionObserver, staggered by their index among `.reveal` siblings. Any element created dynamically must get the `reveal` class before the envelope opens.
- **Shared SVG sprite:** the hidden `<svg class="sprite">` at the top of `index.html` defines `#g-gold`, `#leaf`, and the mortarboard `#i-cap`, which is reused through `<use>`. The cap's tassel swings with SMIL `<animateTransform>` because CSS can't animate inside `<use>`.
- **Reduced motion:** `prefers-reduced-motion` turns off the animation loop, pointer sparkles, and open delays. It also pauses SMIL through `pauseAnimations()`, since the CSS media query doesn't stop SMIL. Keep this path working when adding effects.

## Conventions

- UI copy and code comments are in Vietnamese. Match that.
- Mark deliberate shortcuts with a `ponytail:` comment that states the limit (see the UTC+7 note in `app.js`).
- Colours, easing, and fonts are CSS custom properties on `:root` in [style.css](style.css). Reuse them instead of new literals.

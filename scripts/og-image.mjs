/* OG 이미지(1200×630)·앱 아이콘(192/512) 생성. 로컬에서 1회 실행: npm run og
   Playwright 가 필요하다 (Cloudflare 빌드에서는 실행하지 않음 — 결과 PNG 를 public/ 에 커밋). */
import { createRequire } from "node:module";
// playwright 는 devDependency 가 아니라 로컬/전역 어디에 있든 찾아서 쓴다 (npx playwright install chromium 필요)
const req = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = req("playwright")); }
catch { ({ chromium } = createRequire(process.env.PLAYWRIGHT_DIR || "/opt/npm-tools/node_modules/")("playwright")); }
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.resolve(__dirname, "../public");

const og = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<style>
  body{margin:0;width:1200px;height:630px;font-family:"Pretendard Variable",Pretendard,sans-serif;background:#fff;position:relative;overflow:hidden}
  .bg{position:absolute;inset:0;background:radial-gradient(800px 420px at 8% -10%,rgba(109,91,255,.18),transparent 60%),radial-gradient(600px 380px at 95% 15%,rgba(255,77,109,.10),transparent 55%)}
  .wrap{position:absolute;left:84px;top:96px;right:84px}
  .logo{display:flex;align-items:center;gap:14px}
  .mark{width:64px;height:64px;border-radius:18px;background:linear-gradient(135deg,#6D5BFF,#9B6BFF);display:grid;place-items:center;box-shadow:0 12px 30px rgba(109,91,255,.4)}
  .word{font-size:40px;font-weight:900;letter-spacing:-.02em;color:#0A0E1A}
  .word span{color:#9B6BFF}.word small{font-size:22px;font-weight:700;color:#6B7185;margin-left:10px}
  h1{font-size:76px;font-weight:900;line-height:1.12;letter-spacing:-.035em;color:#0A0E1A;margin:54px 0 0}
  h1 b{background:linear-gradient(90deg,#6D5BFF,#9B6BFF);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  p{font-size:28px;color:#6B7185;margin:26px 0 0;line-height:1.5;font-weight:500}
  .chips{position:absolute;left:84px;bottom:70px;display:flex;gap:12px}
  .chip{padding:12px 22px;border-radius:999px;border:2px solid #E7E9F1;background:#fff;font-size:21px;font-weight:700;color:#1A1F30}
</style></head><body><div class="bg"></div>
<div class="wrap">
  <div class="logo"><div class="mark"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
  <div class="word">PVIT<span>.</span><small>프빗</small></div></div>
  <h1>우리끼리만 쓰는 공간,<br><b>프빗에서 찾다.</b></h1>
  <p>파티룸 · 프라이빗 사우나 · 시네마룸 · 키즈 워터룸 · 포커스룸<br>남들과 섞이지 않는 프라이빗 공간을 한 곳에서</p>
</div>
<div class="chips"><span class="chip">#독립 공간</span><span class="chip">#단독 이용</span><span class="chip">#예약제</span><span class="chip">#외부인 미출입</span></div>
</body></html>`;

const icon = (size) => `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;width:${size}px;height:${size}px}
.m{width:${size}px;height:${size}px;border-radius:${Math.round(size * 0.22)}px;background:linear-gradient(135deg,#6D5BFF,#9B6BFF);display:grid;place-items:center}</style></head>
<body><div class="m"><svg width="${size * 0.56}" height="${size * 0.56}" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(og, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.screenshot({ path: path.join(PUB, "og-image.png"), type: "png" });
for (const s of [192, 512]) {
  const p = await browser.newPage({ viewport: { width: s, height: s }, deviceScaleFactor: 1 });
  await p.setContent(icon(s));
  await p.screenshot({ path: path.join(PUB, `icon-${s}.png`), type: "png", omitBackground: true });
  await p.close();
}
await browser.close();
console.log("✓ og-image.png, icon-192.png, icon-512.png 생성");

/* ------------------------------------------------------------
   사전 렌더링 (Static Pre-render)
   - vite build 결과(dist/index.html) 를 템플릿으로, 라우트별 HTML 을 생성한다.
   - react-dom/server 만 사용 → 브라우저·Playwright 불필요 → Cloudflare Pages 빌드 환경에서 그대로 동작
   - 결과: dist/<route>.html  (예: dist/category/party.html → /category/party 로 열림)
   ------------------------------------------------------------ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const SSR = path.join(ROOT, "dist-ssr");

const template = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
const raw = JSON.parse(fs.readFileSync(path.join(ROOT, "public/data/spaces.json"), "utf8"));
const ssrEntry = fs.readdirSync(SSR).find((f) => f.startsWith("entry-server") && f.endsWith(".js"));
const { render } = await import(pathToFileURL(path.join(SSR, ssrEntry)).href);

/* 라우트 목록 생성 — 콘텐츠·데이터 모듈에서 가져온다 (SSR 번들에 포함되어 있지 않으므로 JSON/소스에서 직접 계산) */
const { GUIDES } = await import(pathToFileURL(path.join(ROOT, "src/content/guides.js")).href);
const CAT_SLUGS = { "스파·웰니스": "spa", "영화·게임": "cinema-game", "운동·스포츠": "sports", "파티·모임": "party", "다이닝·쿠킹": "dining", "키즈·패밀리": "kids", "업무·스터디": "work" };
const KIND_SLUGS = { "프라이빗 사우나": "private-sauna", "1인 세신·스파": "sesin-spa", "프라이빗 시네마룸": "cinema-room", "프라이빗 사운드룸": "sound-room", "1인 헬스룸": "private-gym", "프라이빗 골프룸": "golf-room", "올인원 파티룸": "party-room", "프라이빗 키친": "private-kitchen", "프라이빗 워터룸": "kids-water-room", "포커스룸": "focus-room" };
const REGION_SLUGS = { 서울: "seoul", 경기: "gyeonggi", 인천: "incheon", 부산: "busan", 대구: "daegu", 광주: "gwangju", 대전: "daejeon", 울산: "ulsan", 세종: "sejong", 강원: "gangwon", 충북: "chungbuk", 충남: "chungnam", 전북: "jeonbuk", 전남: "jeonnam", 경북: "gyeongbuk", 경남: "gyeongnam", 제주: "jeju" };
const slugify = (s) => encodeURIComponent(String(s).trim().replace(/\s+/g, "-"));

const routes = new Set(["/", "/search", "/guide", "/hotdeal", "/community", "/host", "/host/apply", "/host/guide", "/about", "/faq", "/terms", "/privacy"]);
const cat1s = [...new Set(raw.kinds.map((k) => k.c1))];
cat1s.forEach((c) => routes.add(`/category/${CAT_SLUGS[c] || slugify(c)}`));
raw.kinds.forEach((k) => routes.add(`/category/${KIND_SLUGS[k.c3] || slugify(k.c3)}`));
[...new Set(raw.spaces.map((s) => s.s))].forEach((r) => routes.add(`/region/${REGION_SLUGS[r] || slugify(r)}`));
GUIDES.forEach((g) => routes.add(`/guide/${g.slug}`));
for (let i = 1; i <= 8; i++) routes.add(`/community/${i}`);
// 검증(A/B) 공간만 상세 페이지를 사전 렌더링 (미검증 공간은 noindex, 클라이언트 렌더)
raw.spaces.filter((s) => s.grade === "A" || s.grade === "B").forEach((s) => routes.add(`/space/${s.id}`));
// 대표 샘플 몇 개는 미리 렌더링해 크롤러가 구조를 파악하게 한다 (noindex 유지)
const seen = new Set();
for (const s of raw.spaces) { if (s.s === "서울" && !seen.has(s.k)) { seen.add(s.k); routes.add(`/space/${s.id}`); } if (seen.size >= raw.kinds.length) break; }

const esc = (s) => String(s);
let ok = 0, fail = 0;
const t0 = Date.now();
for (const route of routes) {
  try {
    const { html, head } = render(route, raw);
    let out = template
      .replace(/<!--pvit-head-->[\s\S]*?<!--\/pvit-head-->/, `<!--pvit-head-->\n    ${head}\n    <!--/pvit-head-->`)
      .replace("<!--pvit-app-->", esc(html));
    // /category/party → dist/category/party.html
    // (폴더/index.html 로 내보내면 Cloudflare Pages 가 주소 끝에 '/' 를 붙여 넘기는데,
    //  대표 주소·사이트맵·내부 링크는 '/' 없는 주소라 서치 콘솔에 '리디렉션이 포함된 페이지'로 잡힌다)
    const file = route === "/" ? path.join(DIST, "index.html") : path.join(DIST, route.replace(/^\//, "") + ".html");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, out, "utf8");
    ok++;
  } catch (e) {
    fail++;
    console.error("✗ prerender 실패:", route, e.message);
  }
}
console.log(`✓ 사전 렌더링 완료: ${ok}개 라우트 (${fail}개 실패) · ${((Date.now() - t0) / 1000).toFixed(1)}s`);
if (fail) process.exitCode = 1;

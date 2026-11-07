/* ------------------------------------------------------------
   sitemap.xml + robots.txt 생성 → dist/
   - 색인 대상: 정적 페이지, 카테고리·지역 랜딩, 가이드, 검증(A/B) 공간 상세
   - 미검증 공간은 noindex 이므로 사이트맵에서 제외 (CONFIG.INDEX_UNVERIFIED 와 동일 정책)
   ------------------------------------------------------------ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const SITE_URL = (process.env.SITE_URL || "https://pvit.pages.dev").replace(/\/$/, "");
const INDEX_UNVERIFIED = process.env.INDEX_UNVERIFIED === "1";

const raw = JSON.parse(fs.readFileSync(path.join(ROOT, "public/data/spaces.json"), "utf8"));
const { GUIDES } = await import(pathToFileURL(path.join(ROOT, "src/content/guides.js")).href);
const CAT_SLUGS = { "스파·웰니스": "spa", "영화·게임": "cinema-game", "운동·스포츠": "sports", "파티·모임": "party", "다이닝·쿠킹": "dining", "키즈·패밀리": "kids", "업무·스터디": "work" };
const KIND_SLUGS = { "프라이빗 사우나": "private-sauna", "1인 세신·스파": "sesin-spa", "프라이빗 시네마룸": "cinema-room", "프라이빗 사운드룸": "sound-room", "1인 헬스룸": "private-gym", "프라이빗 골프룸": "golf-room", "올인원 파티룸": "party-room", "프라이빗 키친": "private-kitchen", "프라이빗 워터룸": "kids-water-room", "포커스룸": "focus-room" };
const REGION_SLUGS = { 서울: "seoul", 경기: "gyeonggi", 인천: "incheon", 부산: "busan", 대구: "daegu", 광주: "gwangju", 대전: "daejeon", 울산: "ulsan", 세종: "sejong", 강원: "gangwon", 충북: "chungbuk", 충남: "chungnam", 전북: "jeonbuk", 전남: "jeonnam", 경북: "gyeongbuk", 경남: "gyeongnam", 제주: "jeju" };
const slugify = (s) => encodeURIComponent(String(s).trim().replace(/\s+/g, "-"));
const today = new Date().toISOString().slice(0, 10);

const urls = [];
const add = (loc, priority = "0.6", changefreq = "weekly", lastmod = today) => urls.push({ loc: SITE_URL + loc, priority, changefreq, lastmod });

add("/", "1.0", "daily");
add("/search", "0.8", "daily");
add("/guide", "0.8", "weekly");
add("/host", "0.8", "monthly");
add("/host/guide", "0.6", "monthly");
add("/hotdeal", "0.6", "weekly");
add("/community", "0.6", "weekly");
add("/about", "0.5", "monthly");
add("/faq", "0.6", "monthly");
[...new Set(raw.kinds.map((k) => k.c1))].forEach((c) => add(`/category/${CAT_SLUGS[c] || slugify(c)}`, "0.9", "weekly"));
raw.kinds.forEach((k) => add(`/category/${KIND_SLUGS[k.c3] || slugify(k.c3)}`, "0.8", "weekly"));
[...new Set(raw.spaces.map((s) => s.s))].forEach((r) => add(`/region/${REGION_SLUGS[r] || slugify(r)}`, "0.8", "weekly"));
GUIDES.forEach((g) => add(`/guide/${g.slug}`, "0.7", "monthly", g.date));
for (let i = 1; i <= 8; i++) add(`/community/${i}`, "0.4", "monthly");
raw.spaces.filter((s) => INDEX_UNVERIFIED || s.grade === "A" || s.grade === "B").forEach((s) => add(`/space/${s.id}`, "0.6", "weekly"));

const esc = (s) => s.replace(/&/g, "&amp;");
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(u.loc)}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(DIST, "sitemap.xml"), xml, "utf8");

const robots = `User-agent: *
Allow: /
Disallow: /host/center
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;
fs.writeFileSync(path.join(DIST, "robots.txt"), robots, "utf8");
console.log(`✓ sitemap.xml (${urls.length} URL) · robots.txt 생성 → ${SITE_URL}`);

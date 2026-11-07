# PVIT 프빗 — 우리끼리 쓰는 모든 프라이빗 공간

남들과 섞이지 않는 프라이빗 공간(파티룸·프라이빗 사우나·시네마룸·키즈 워터룸·포커스룸 등)만 모아 보여주는 정보 플랫폼입니다. React + Vite 로 만들었고 Cloudflare Pages 에 배포합니다.

## 무엇이 들어 있나

| 영역 | 내용 |
|---|---|
| 고객 | 홈, 공간찾기(지역·카테고리·금액대·목적 필터), 공간 상세(지도·전화·예약 요청), 카테고리·지역 랜딩, 가이드 14편, FAQ, 커뮤니티, 핫딜 |
| 호스트 | 입점 안내(`/host`), 6단계 입점 신청 위저드(`/host/apply`), 호스트 센터 7탭(`/host/center`), 운영 가이드(`/host/guide`) |
| SEO | URL 라우팅, 76개 라우트 사전 렌더링(SSR), 페이지별 title/description/canonical/OG, JSON-LD(Organization·WebSite·Breadcrumb·ItemList·FAQ·Article·HowTo·LocalBusiness), sitemap.xml, robots.txt |
| 백엔드 | Cloudflare Pages Functions (`/api/host/apply`, `/api/booking/request`, `/api/contact`) — KV 바인딩 시 저장, 웹훅 알림 |

자세한 기획·구조는 `docs/` 폴더를 보세요.

- `docs/호스트_기능_기획서.md` — 입점·예약·결제·운영 흐름과 데이터 구조
- `docs/SEO_전략.md` — 키워드, 페이지 구조, 색인 정책, 서치어드바이저·서치콘솔 등록법
- `docs/배포_가이드.md` — GitHub ↔ Cloudflare Pages 연동, KV·웹훅 설정
- `docs/데이터_교체_가이드.md` — `public/data/spaces.json` 구조와 교체 방법

## 빠른 시작 (로컬)

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/ 생성 (클라이언트 + SSR 사전 렌더링 + 사이트맵)
npm run preview    # 빌드 결과 미리보기
```

Node 18 이상. 빌드는 브라우저가 필요 없습니다(Playwright 불필요). `npm run og` 만 Playwright 를 씁니다 (OG 이미지 재생성용, 결과 PNG 는 이미 `public/` 에 포함).

## 폴더 구조

```
src/
  App.jsx               라우트 테이블·전역 상태
  entry-server.jsx      사전 렌더링용 SSR 엔트리
  lib/                  router(URL 라우터) · seo(메타·JSON-LD) · data(데이터 로딩·필터) · store(로컬 저장·API)
  styles/               pvit.css(디자인 시스템) · tokens.js(색상)
  components/           Header · Footer · SpaceCard · BookingRequest · ui(공용)
  pages/                Home · Search · Detail · LandingPages(카테고리·지역) · GuidePages · CommunityPages · StaticPages · Host*
  content/              guides(가이드 14편) · categories · regions · faq · host · legal
public/
  data/spaces.json      공간 데이터 (교체 가능)
  og-image.png, icon-*.png, favicon.svg, site.webmanifest, _headers
functions/api/          Cloudflare Pages Functions
scripts/                prerender.mjs · sitemap.mjs · og-image.mjs
docs/                   기획·운영 문서
```

## 운영 스위치 (`src/lib/data.js` → `CONFIG`)

| 키 | 기본값 | 설명 |
|---|---|---|
| `VERIFY_MODE` | `"open"` | `"open"` 전체 노출 + 미검증은 '정보 확인 중' 뱃지 / `"strict"` A·B 등급만 노출 |
| `INDEX_UNVERIFIED` | `false` | 미검증 공간 상세를 검색엔진에 색인할지 (false = noindex, 사이트맵 제외) |
| `PAGE_SIZE` | `24` | 목록 한 번에 보여줄 개수 |

도메인을 연결하면 `src/lib/seo.jsx` 의 `SITE.url` 을 바꾸고, 빌드 시 `SITE_URL=https://pvit.kr npm run build` 처럼 환경변수를 주면 사이트맵·canonical 이 그 주소로 생성됩니다.

## 배포

Cloudflare Pages 에 GitHub 저장소를 연결하면 push 할 때마다 자동 배포됩니다.

- Build command: `npm run build`
- Build output directory: `dist`
- `_redirects` 파일을 두지 마세요 — Cloudflare 에서는 리다이렉트가 정적 파일보다 우선해 사전 렌더링된 페이지가 가려집니다. 404.html 도 두지 않습니다(SPA 폴백 유지).

자세한 절차는 `docs/배포_가이드.md` 참고.

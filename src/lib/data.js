import { useEffect, useState } from "react";
import { Waves, Clapperboard, Dumbbell, PartyPopper, UtensilsCrossed, Baby, Briefcase, Sparkles } from "lucide-react";
import { C } from "../styles/tokens.js";

/* ---------- 운영 설정 ---------- */
export const CONFIG = {
  // "open"  : 모든 등급 노출 + 미검증은 '정보 확인 중' 뱃지
  // "strict": A·B 등급만 노출
  VERIFY_MODE: "open",
  // 미검증(D) 공간 상세 페이지를 검색엔진에 색인시킬지. false = noindex (근거 없는 중복 페이지로 도메인 평가가 떨어지는 것을 방지)
  INDEX_UNVERIFIED: false,
  PAGE_SIZE: 24,
  DATA_URL: "data/spaces.json",
};

/* ---------- 대분류 메타 ---------- */
export const CAT1 = {
  "스파·웰니스": { slug: "spa", Icon: Waves, color: "#23B5C9", blurb: "프라이빗 사우나 · 1인 세신", short: "스파" },
  "영화·게임": { slug: "cinema-game", Icon: Clapperboard, color: "#8B5CF6", blurb: "시네마룸 · 사운드룸", short: "영화·게임" },
  "운동·스포츠": { slug: "sports", Icon: Dumbbell, color: "#12B76A", blurb: "1인 헬스룸 · 골프룸", short: "운동" },
  "파티·모임": { slug: "party", Icon: PartyPopper, color: "#FF5C8A", blurb: "올인원 파티룸", short: "파티" },
  "다이닝·쿠킹": { slug: "dining", Icon: UtensilsCrossed, color: "#FF7A45", blurb: "프라이빗 키친", short: "다이닝" },
  "키즈·패밀리": { slug: "kids", Icon: Baby, color: "#FFB020", blurb: "프라이빗 워터룸", short: "키즈" },
  "업무·스터디": { slug: "work", Icon: Briefcase, color: "#5B8DEF", blurb: "1인 포커스룸", short: "업무" },
};
export const cat1Of = (name) => CAT1[name] || { slug: slugify(name), Icon: Sparkles, color: C.violet, blurb: "", short: name };

/* 소분류 슬러그 */
export const KIND_SLUG = {
  "프라이빗 사우나": "private-sauna",
  "1인 세신·스파": "sesin-spa",
  "프라이빗 시네마룸": "cinema-room",
  "프라이빗 사운드룸": "sound-room",
  "1인 헬스룸": "private-gym",
  "프라이빗 골프룸": "golf-room",
  "올인원 파티룸": "party-room",
  "프라이빗 키친": "private-kitchen",
  "프라이빗 워터룸": "kids-water-room",
  "포커스룸": "focus-room",
};

/* 지역 슬러그 */
export const REGION_SLUG = {
  서울: "seoul", 경기: "gyeonggi", 인천: "incheon", 부산: "busan", 대구: "daegu", 광주: "gwangju",
  대전: "daejeon", 울산: "ulsan", 세종: "sejong", 강원: "gangwon", 충북: "chungbuk", 충남: "chungnam",
  전북: "jeonbuk", 전남: "jeonnam", 경북: "gyeongbuk", 경남: "gyeongnam", 제주: "jeju",
};

export function slugify(s) {
  return encodeURIComponent(String(s || "").trim().replace(/\s+/g, "-"));
}
export const kindSlug = (c3) => KIND_SLUG[c3] || slugify(c3);
export const regionSlug = (sido) => REGION_SLUG[sido] || slugify(sido);

export function findBySlug(map, slug) {
  for (const [k, v] of Object.entries(map)) if (v === slug) return k;
  try { return decodeURIComponent(slug).replace(/-/g, " "); } catch { return null; }
}

/* ---------- 외부 링크 빌더 ---------- */
export const naverUrl = (q) => "https://map.naver.com/p/search/" + encodeURIComponent(q);
export const googleUrl = (q) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q).replace(/%20/g, "+");
export const telUrl = (t) => "tel:" + String(t).replace(/[^0-9+]/g, "");

/* ---------- 미리보기용 최소 데이터 (fetch 실패 시) ---------- */
export const FALLBACK = {
  meta: { defaultGrade: "D" },
  descs: ["배포된 사이트에서는 전체 데이터가 로드됩니다. (미리보기 샘플)"],
  kinds: [
    { c1: "스파·웰니스", c2: "사우나·목욕", c3: "프라이빗 사우나", form: "독립룸 또는 단독 대관", tags: ["휴식", "힐링", "데이트", "커플"], price: "시간당 4-8만원", checks: ["인원", "욕조/사우나", "샤워실", "이용시간", "커플 가능"] },
    { c1: "파티·모임", c2: "파티룸", c3: "올인원 파티룸", form: "단독 대관", tags: ["생일", "모임", "브라이덜샤워", "워크숍"], price: "시간당 2-8만원", checks: ["인원", "노래방", "주방", "주류", "주차", "숙박 여부"] },
    { c1: "영화·게임", c2: "영화·OTT", c3: "프라이빗 시네마룸", form: "독립룸 또는 단독 대관", tags: ["데이트", "영화감상", "친구모임"], price: "시간당 2.5-5만원", checks: ["스크린", "OTT", "음향", "취식", "주차"] },
  ],
  spaces: [
    { id: "PVIT-10001", n: "스파 더 프라이빗 강남구점", s: "서울", g: "강남구", q: "스파 더 프라이빗 강남구점 서울 강남구", k: 0, d: 0 },
    { id: "PVIT-11801", n: "올댓파티 건대", s: "서울", g: "광진구", q: "올댓파티 건대 서울 광진구", k: 1, d: 0 },
    { id: "PVIT-10601", n: "시네룸 성수", s: "서울", g: "성동구", q: "시네룸 성수 서울 성동구", k: 2, d: 0 },
  ],
};

/* ---------- 데이터 가공 ---------- */
export function enrich(raw) {
  const kinds = raw.kinds || [];
  const descs = raw.descs || [];
  let spaces = (raw.spaces || []).map((r) => ({
    ...r,
    kind: kinds[r.k] || kinds[0],
    desc: r.desc || descs[r.d] || "",
    grade: r.grade || raw.meta?.defaultGrade || "D",
    naver: r.naverUrl || naverUrl(r.q || `${r.n} ${r.s} ${r.g}`),
    google: r.googleUrl || googleUrl(r.q || `${r.n} ${r.s} ${r.g}`),
  }));
  if (CONFIG.VERIFY_MODE === "strict") spaces = spaces.filter((s) => s.grade === "A" || s.grade === "B");

  const regions = {};
  spaces.forEach((s) => { (regions[s.s] = regions[s.s] || new Set()).add(s.g); });
  const regionIndex = Object.fromEntries(Object.entries(regions).map(([k, v]) => [k, [...v].sort()]));
  const regionCount = {};
  spaces.forEach((s) => { regionCount[s.s] = (regionCount[s.s] || 0) + 1; });
  const catCount = {};
  const kindCount = {};
  spaces.forEach((s) => {
    catCount[s.kind.c1] = (catCount[s.kind.c1] || 0) + 1;
    kindCount[s.kind.c3] = (kindCount[s.kind.c3] || 0) + 1;
  });
  const byId = Object.fromEntries(spaces.map((s) => [s.id, s]));
  const cat1List = [...new Set(kinds.map((k) => k.c1))];
  return { kinds, spaces, byId, regionIndex, regionCount, catCount, kindCount, cat1List, total: spaces.length, isFallback: !!raw.__fb, meta: raw.meta || {} };
}

/* 브라우저: public/data/spaces.json 로드. SSR: initialData 사용. */
export function useSpaces(initialData) {
  const [state, setState] = useState(() =>
    initialData ? { loading: false, data: initialData, error: null } : { loading: true, data: null, error: null }
  );
  useEffect(() => {
    if (initialData) return;
    let alive = true;
    const base = (typeof import.meta !== "undefined" && import.meta.env?.BASE_URL) || "/";
    fetch(base + CONFIG.DATA_URL)
      .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then((j) => alive && setState({ loading: false, data: enrich(j), error: null }))
      .catch(() => alive && setState({ loading: false, data: enrich({ ...FALLBACK, __fb: true }), error: "fallback" }));
    return () => { alive = false; };
  }, [initialData]);
  return state;
}

/* ---------- 검색 ---------- */
export function filterSpaces(data, f) {
  let arr = data.spaces;
  if (f.c1) arr = arr.filter((s) => s.kind.c1 === f.c1);
  if (f.c3) arr = arr.filter((s) => s.kind.c3 === f.c3);
  if (f.sido) arr = arr.filter((s) => s.s === f.sido);
  if (f.gu) arr = arr.filter((s) => s.g === f.gu);
  if (f.price) arr = arr.filter((s) => s.kind.price === f.price);
  if (f.tag) arr = arr.filter((s) => s.kind.tags.includes(f.tag));
  if (f.grade) arr = arr.filter((s) => s.grade === "A" || s.grade === "B");
  if (f.q && f.q.trim()) {
    const q = f.q.trim().toLowerCase();
    arr = arr.filter((s) => (s.n + " " + s.desc + " " + s.q + " " + s.kind.c3 + " " + s.kind.c1 + " " + s.kind.tags.join(" ")).toLowerCase().includes(q));
  }
  if (f.sort === "이름순") arr = [...arr].sort((a, b) => a.n.localeCompare(b.n, "ko"));
  else if (f.sort === "지역순") arr = [...arr].sort((a, b) => (a.s + a.g).localeCompare(b.s + b.g, "ko"));
  else if (f.sort === "인증순") arr = [...arr].sort((a, b) => gradeRank(a.grade) - gradeRank(b.grade));
  return arr;
}
const gradeRank = (g) => ({ A: 0, B: 1, C: 2 }[g] ?? 3);

export const fmtN = (n) => (n || 0).toLocaleString("ko-KR");

import { GUIDES_A } from "./guides-a.js";
import { GUIDES_B } from "./guides-b.js";

/* 가이드 전체 목록 (최신순) */
export const GUIDES = [...GUIDES_A, ...GUIDES_B].sort((a, b) => (a.date < b.date ? 1 : -1));
export const guideBySlug = (slug) => GUIDES.find((g) => g.slug === slug);
export const GUIDE_SECTIONS = [...new Set(GUIDES.map((g) => g.section))];

/* 카테고리 → 관련 가이드 매핑 */
export const GUIDES_BY_CAT = {
  "스파·웰니스": ["private-sauna-guide", "sesin-spa-first-visit"],
  "영화·게임": ["private-cinema-room-date"],
  "운동·스포츠": ["private-golf-gym"],
  "파티·모임": ["how-to-choose-party-room", "small-group-venue-bridal-shower"],
  "다이닝·쿠킹": ["private-kitchen-cooking-class", "room-restaurant-private-dining"],
  "키즈·패밀리": ["kids-water-room-checklist"],
  "업무·스터디": ["focus-room-solo-office"],
};

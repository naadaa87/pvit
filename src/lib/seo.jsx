import React, { createContext, useContext, useEffect } from "react";

/* ------------------------------------------------------------
   SEO 레이어
   - 브라우저: document.head 를 직접 갱신 (title, meta, canonical, JSON-LD)
   - 사전 렌더링(SSR): SeoCollector 에 모아 두었다가 HTML <head> 에 주입
   ------------------------------------------------------------ */

export const SITE = {
  name: "프빗 PVIT",
  shortName: "프빗",
  url: "https://pvit.kr",
  tagline: "우리끼리 쓰는 모든 프라이빗 공간",
  description:
    "파티룸, 프라이빗 사우나, 룸식당, 독채 숙소, 키즈룸, 시네마룸, 포커스룸까지. 남들과 섞이지 않는 프라이빗 공간을 지역·목적·가격대로 찾아보세요.",
  ogImage: "/og-image.png",
  locale: "ko_KR",
  twitter: "",
  // 검색엔진 소유 확인 코드 — 서치어드바이저/서치콘솔에서 발급받아 입력
  naverVerification: "8d5ae1bac74dd90e815e67bca193aed7c9aba777", // index.html 에 실제 태그가 들어있음
  googleVerification: "",
};

const SeoCtx = createContext(null);
const isBrowser = typeof window !== "undefined";

export function SeoProvider({ collector, children }) {
  return <SeoCtx.Provider value={collector || null}>{children}</SeoCtx.Provider>;
}

export function titleOf(t) {
  if (!t) return `${SITE.name} — ${SITE.tagline}`;
  return t.includes("프빗") ? t : `${t} | ${SITE.name}`;
}

function absolute(path) {
  if (!path) return SITE.url;
  if (path.startsWith("http")) return path;
  return SITE.url + (path.startsWith("/") ? path : "/" + path);
}

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setJsonLd(items) {
  document.head.querySelectorAll('script[data-pvit-jsonld]').forEach((n) => n.remove());
  (items || []).forEach((obj) => {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.setAttribute("data-pvit-jsonld", "1");
    s.textContent = JSON.stringify(obj);
    document.head.appendChild(s);
  });
}

/**
 * useSEO({ title, description, path, image, type, jsonLd, noindex })
 * 각 페이지 최상단에서 한 번 호출한다.
 */
export function useSEO(meta) {
  const collector = useContext(SeoCtx);
  const skip = !!meta.skip; // 다른 페이지 안에 포함된 컴포넌트는 메타를 덮어쓰지 않는다
  const full = {
    title: titleOf(meta.title),
    description: meta.description || SITE.description,
    canonical: absolute(meta.path || "/"),
    image: absolute(meta.image || SITE.ogImage),
    type: meta.type || "website",
    jsonLd: meta.jsonLd || [],
    noindex: !!meta.noindex,
  };

  // SSR 수집 (렌더 중 동기 기록)
  if (collector && !isBrowser && !skip) {
    collector.current = full;
  }

  useEffect(() => {
    if (!isBrowser || skip) return;
    document.title = full.title;
    setMeta("name", "description", full.description);
    setMeta("name", "robots", full.noindex ? "noindex, nofollow" : "index, follow");
    setMeta("property", "og:title", full.title);
    setMeta("property", "og:description", full.description);
    setMeta("property", "og:url", full.canonical);
    setMeta("property", "og:image", full.image);
    setMeta("property", "og:type", full.type);
    setMeta("property", "og:site_name", SITE.name);
    setMeta("property", "og:locale", SITE.locale);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", full.title);
    setMeta("name", "twitter:description", full.description);
    setMeta("name", "twitter:image", full.image);
    setLink("canonical", full.canonical);
    setJsonLd(full.jsonLd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, full.title, full.description, full.canonical, full.image, full.noindex, JSON.stringify(full.jsonLd)]);
}

/* SSR 에서 <head> 에 넣을 문자열 생성 */
export function renderHeadTags(full) {
  if (!full) return "";
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const lines = [
    `<title>${esc(full.title)}</title>`,
    `<meta name="description" content="${esc(full.description)}">`,
    `<meta name="robots" content="${full.noindex ? "noindex, nofollow" : "index, follow"}">`,
    `<link rel="canonical" href="${esc(full.canonical)}">`,
    `<meta property="og:title" content="${esc(full.title)}">`,
    `<meta property="og:description" content="${esc(full.description)}">`,
    `<meta property="og:url" content="${esc(full.canonical)}">`,
    `<meta property="og:image" content="${esc(full.image)}">`,
    `<meta property="og:type" content="${esc(full.type)}">`,
    `<meta property="og:site_name" content="${esc(SITE.name)}">`,
    `<meta property="og:locale" content="${SITE.locale}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(full.title)}">`,
    `<meta name="twitter:description" content="${esc(full.description)}">`,
    `<meta name="twitter:image" content="${esc(full.image)}">`,
  ];
  (full.jsonLd || []).forEach((obj) => {
    lines.push(`<script type="application/ld+json" data-pvit-jsonld="1">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`);
  });
  return lines.join("\n    ");
}

/* ---------- JSON-LD 빌더 ---------- */
export const ld = {
  org: () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    alternateName: ["PVIT", "프빗"],
    url: SITE.url,
    logo: absolute("/icon-512.png"),
    description: SITE.description,
  }),
  website: () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    inLanguage: "ko",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: SITE.url + "/search?q={search_term_string}" },
      "query-input": "required name=search_term_string",
    },
  }),
  breadcrumb: (items) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absolute(it.path),
    })),
  }),
  itemList: (name, items) => ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.slice(0, 50).map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: absolute(it.path),
    })),
  }),
  faq: (qas) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qas.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  }),
  article: ({ title, description, path, date, modified, section }) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    inLanguage: "ko",
    datePublished: date,
    dateModified: modified || date,
    articleSection: section,
    mainEntityOfPage: absolute(path),
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: absolute("/icon-512.png") } },
    image: absolute(SITE.ogImage),
  }),
  /* 검증된(A/B) 공간에만 LocalBusiness 를 붙인다. 미검증은 WebPage 만. */
  place: (s) => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: s.n,
    description: s.desc,
    url: absolute(`/space/${s.id}`),
    address: { "@type": "PostalAddress", addressRegion: s.s, addressLocality: s.g, addressCountry: "KR" },
    ...(s.tel ? { telephone: s.tel } : {}),
    ...(s.img ? { image: s.img } : {}),
    ...(s.home ? { sameAs: [s.home] } : {}),
  }),
  howto: (name, steps) => ({
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    step: steps.map(([n, t], i) => ({ "@type": "HowToStep", position: i + 1, name: n, text: t })),
  }),
};

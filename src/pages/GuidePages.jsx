import React, { useState } from "react";
import { BookOpen, Clock, ChevronRight, ArrowRight } from "lucide-react";
import { C } from "../styles/tokens.js";
import { Link } from "../lib/router.jsx";
import { useSEO, ld } from "../lib/seo.jsx";
import { Container, Breadcrumb, SectionHead } from "../components/ui.jsx";
import { GUIDES, GUIDE_SECTIONS, guideBySlug } from "../content/guides.js";
import { NotFoundPage } from "./StaticPages.jsx";

/* /guide — 가이드 허브 (콘텐츠 SEO 허브) */
export function GuideIndexPage() {
  const [sec, setSec] = useState("전체");
  const list = sec === "전체" ? GUIDES : GUIDES.filter((g) => g.section === sec);
  useSEO({
    title: "프라이빗 공간 가이드 — 고르는 법, 예약 전 체크리스트, 지역별 정리",
    description: "파티룸, 프라이빗 사우나, 1인 세신, 시네마룸, 키즈 워터룸, 포커스룸까지. 프라이빗 공간을 고르고 예약하기 전에 알아두면 좋은 것들을 유형별로 정리한 가이드입니다.",
    path: "/guide",
    jsonLd: [
      ld.breadcrumb([{ name: "홈", path: "/" }, { name: "가이드", path: "/guide" }]),
      ld.itemList("프라이빗 공간 가이드", GUIDES.map((g) => ({ name: g.title, path: `/guide/${g.slug}` }))),
    ],
  });
  return (
    <div>
      <section style={{ background: `linear-gradient(135deg, ${C.violetSoft}, #fff 60%)`, borderBottom: `1px solid ${C.line}` }}>
        <Container className="py-10 sm:py-12">
          <Breadcrumb items={[{ name: "홈", to: "/" }, { name: "가이드" }]} />
          <div className="flex items-center gap-2" style={{ color: C.violet, fontWeight: 800, fontSize: 13, letterSpacing: ".06em" }}><BookOpen size={15} /> GUIDE</div>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, color: C.ink, letterSpacing: "-0.02em", margin: "8px 0 0" }}>프라이빗 공간 가이드</h1>
          <p style={{ fontSize: 15, color: C.sub, lineHeight: 1.7, marginTop: 10, maxWidth: 680 }}>
            공간 유형별로 고르는 기준, 예약 전 확인할 것, 지역별 특징을 정리했습니다. 네이버에서 하나하나 검색하기 전에 먼저 읽어보세요.
          </p>
        </Container>
      </section>
      <Container className="py-8">
        <div className="flex gap-1.5" style={{ overflowX: "auto", paddingBottom: 8, marginBottom: 18 }}>
          {["전체", ...GUIDE_SECTIONS].map((t) => (
            <button key={t} className={`pv-chip ${sec === t ? "on" : ""}`} onClick={() => setSec(t)} style={{ flexShrink: 0 }}>{t}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((g) => (
            <Link key={g.slug} to={`/guide/${g.slug}`} className="pv-card" style={{ display: "flex", flexDirection: "column", textDecoration: "none", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 18, padding: 20 }}>
              <div className="flex items-center gap-2" style={{ fontSize: 11.5, fontWeight: 800 }}>
                <span style={{ color: C.violet, background: C.violetSoft, padding: "3px 9px", borderRadius: 999 }}>{g.section}</span>
                <span className="flex items-center gap-1" style={{ color: C.sub }}><Clock size={11} /> {g.readMin}분</span>
              </div>
              <h2 className="pv-clamp2" style={{ fontSize: 17, fontWeight: 900, color: C.ink, margin: "10px 0 6px", lineHeight: 1.4 }}>{g.title}</h2>
              <p className="pv-clamp3" style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.6, margin: 0 }}>{g.description}</p>
              <div className="flex items-center gap-1" style={{ marginTop: "auto", paddingTop: 14, color: C.violet, fontWeight: 800, fontSize: 13.5 }}>읽기 <ChevronRight size={14} /></div>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}

/* /guide/:slug — 가이드 본문 */
export function GuideArticlePage({ slug }) {
  const g = guideBySlug(slug);
  if (!g) return <NotFoundPage />;
  const related = GUIDES.filter((x) => x.slug !== g.slug && x.section === g.section).slice(0, 3);
  const more = related.length ? related : GUIDES.filter((x) => x.slug !== g.slug).slice(0, 3);
  useSEO({
    title: g.title,
    description: g.description,
    path: `/guide/${g.slug}`,
    type: "article",
    jsonLd: [
      ld.breadcrumb([{ name: "홈", path: "/" }, { name: "가이드", path: "/guide" }, { name: g.title, path: `/guide/${g.slug}` }]),
      ld.article({ title: g.title, description: g.description, path: `/guide/${g.slug}`, date: g.date, section: g.section }),
    ],
  });
  return (
    <Container className="py-8">
      <article style={{ maxWidth: 760, margin: "0 auto" }}>
        <Breadcrumb items={[{ name: "홈", to: "/" }, { name: "가이드", to: "/guide" }, { name: g.section }]} />
        <div className="flex items-center gap-2" style={{ fontSize: 12, fontWeight: 800 }}>
          <span style={{ color: C.violet, background: C.violetSoft, padding: "4px 10px", borderRadius: 999 }}>{g.section}</span>
          <span style={{ color: C.sub }}>{g.date}</span>
          <span className="flex items-center gap-1" style={{ color: C.sub }}><Clock size={11} /> {g.readMin}분</span>
        </div>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 900, color: C.ink, lineHeight: 1.3, letterSpacing: "-0.02em", margin: "12px 0 10px" }}>{g.title}</h1>
        <p style={{ fontSize: 15.5, color: C.sub, lineHeight: 1.7, margin: 0, paddingBottom: 18, borderBottom: `1px solid ${C.line}` }}>{g.description}</p>
        <div className="pv-prose" style={{ paddingTop: 10 }} dangerouslySetInnerHTML={{ __html: g.body }} />
        <div className="flex flex-wrap gap-1.5" style={{ marginTop: 20 }}>
          {g.keywords.map((k) => <Link key={k} to="/search" query={{ q: k.split(" ")[0] }} className="pv-chip" style={{ padding: "6px 11px", fontSize: 12.5 }}>#{k}</Link>)}
        </div>
        <div style={{ background: `linear-gradient(120deg, ${C.ink} 30%, #1E1440)`, borderRadius: 20, padding: 24, marginTop: 30, color: "#fff" }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>조건에 맞는 공간 바로 찾기</div>
          <div style={{ fontSize: 14, color: C.subDark, marginTop: 6, lineHeight: 1.6 }}>지역과 목적으로 좁히고, 지도 버튼으로 확인하고, 공식 채널로 예약하세요.</div>
          <Link to="/search" className="pv-btn pv-primary" style={{ padding: "12px 22px", borderRadius: 12, fontSize: 14.5, marginTop: 14 }}>공간찾기 <ArrowRight size={15} /></Link>
        </div>
      </article>
      <div style={{ maxWidth: 760, margin: "40px auto 0" }}>
        <SectionHead eyebrow="MORE" title="함께 읽으면 좋은 글" action="가이드 전체" to="/guide" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {more.map((x) => (
            <Link key={x.slug} to={`/guide/${x.slug}`} className="pv-card" style={{ display: "block", textDecoration: "none", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 18px" }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: C.violet }}>{x.section}</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.ink, marginTop: 3 }}>{x.title}</div>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}

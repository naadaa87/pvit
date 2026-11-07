import React, { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, MapPin, ArrowRight } from "lucide-react";
import { C } from "../styles/tokens.js";
import { Link } from "../lib/router.jsx";
import { useApp } from "../lib/app-context.jsx";
import { CAT1, cat1Of, KIND_SLUG, kindSlug, REGION_SLUG, regionSlug, findBySlug, fmtN, filterSpaces } from "../lib/data.js";
import { useSEO, ld } from "../lib/seo.jsx";
import { Container, Breadcrumb, SectionHead } from "../components/ui.jsx";
import { SpaceCard } from "../components/SpaceCard.jsx";
import { SearchPage } from "./SearchPage.jsx";
import { CAT_CONTENT, KIND_CONTENT } from "../content/categories.js";
import { regionContent } from "../content/regions.js";
import { GUIDES_BY_CAT, guideBySlug } from "../content/guides.js";
import { NotFoundPage } from "./StaticPages.jsx";

function FaqList({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div>
      {items.map(([q, a], i) => (
        <div key={i} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 14, marginBottom: 8, overflow: "hidden" }}>
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between" style={{ background: "none", border: "none", cursor: "pointer", padding: "14px 18px", textAlign: "left" }} aria-expanded={open === i}>
            <span style={{ fontWeight: 800, fontSize: 14.5, color: C.ink }}>Q. {q}</span>
            {open === i ? <ChevronUp size={17} color={C.sub} /> : <ChevronDown size={17} color={C.sub} />}
          </button>
          {open === i && <div className="pv-up" style={{ padding: "0 18px 16px", fontSize: 14, color: C.sub, lineHeight: 1.7 }}>{a}</div>}
        </div>
      ))}
    </div>
  );
}

/* /category/:slug — 대분류 또는 소분류 랜딩. 고유 소개문 + 고르는 기준 + FAQ + 실제 목록 */
export function CategoryPage({ slug }) {
  const { data } = useApp();
  // 슬러그 → 이름. 알려진 슬러그가 아니면 디코딩한 이름으로 데이터에서 직접 찾는다 (새 카테고리 데이터 대응)
  const c1Known = Object.keys(CAT1).find((k) => CAT1[k].slug === slug);
  const c3Known = Object.keys(KIND_SLUG).find((k) => KIND_SLUG[k] === slug);
  const decoded = findBySlug({}, slug);
  const c1 = c1Known || (data.cat1List.includes(decoded) ? decoded : null);
  const c3 = c3Known || (data.kinds.find((k) => k.c3 === decoded) ? decoded : null);
  const isKind = !!(c3 && data.kinds.find((k) => k.c3 === c3));
  const isCat = !isKind && !!(c1 && data.cat1List.includes(c1));
  if (!isKind && !isCat) return <NotFoundPage />;

  const kind = isKind ? data.kinds.find((k) => k.c3 === c3) : null;
  const catName = isKind ? kind.c1 : c1;
  const base = CAT_CONTENT[catName] || { title: `${catName} 프라이빗 공간`, description: `${catName} 유형의 프라이빗 공간을 지역별로 찾아보세요.`, intro: [], criteria: [], faq: [] };
  const over = isKind ? KIND_CONTENT[c3] || { title: `${c3} — ${catName}`, description: base.description } : {};
  const content = { ...base, ...over };
  const meta = cat1Of(catName);
  const count = isKind ? data.kindCount[c3] : data.catCount[catName];
  const fixed = isKind ? { c3, c1: catName } : { c1: catName };
  const path = `/category/${slug}`;
  const siblings = isKind ? data.kinds.filter((k) => k.c1 === catName && k.c3 !== c3) : data.kinds.filter((k) => k.c1 === catName);
  const regions = useMemo(() => {
    const m = {};
    filterSpaces(data, fixed).forEach((s) => { m[s.s] = (m[s.s] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [data, slug]);
  const guides = (GUIDES_BY_CAT[catName] || []).map(guideBySlug).filter(Boolean);
  const top = useMemo(() => filterSpaces(data, { ...fixed, sort: "인증순" }).slice(0, 20), [data, slug]);

  useSEO({
    title: content.title,
    description: content.description,
    path,
    jsonLd: [
      ld.breadcrumb([{ name: "홈", path: "/" }, ...(isKind ? [{ name: catName, path: `/category/${meta.slug}` }] : []), { name: isKind ? c3 : catName, path }]),
      ld.itemList(content.title, top.map((s) => ({ name: s.n, path: `/space/${s.id}` }))),
      ...(content.faq?.length ? [ld.faq(content.faq)] : []),
    ],
  });

  return (
    <div>
      <section style={{ background: `linear-gradient(135deg, ${meta.color}14, #fff 60%)`, borderBottom: `1px solid ${C.line}` }}>
        <Container className="py-10 sm:py-12">
          <Breadcrumb items={[{ name: "홈", to: "/" }, ...(isKind ? [{ name: catName, to: `/category/${meta.slug}` }] : []), { name: isKind ? c3 : catName }]} />
          <div className="flex items-start gap-4">
            <span style={{ width: 56, height: 56, borderRadius: 16, display: "grid", placeItems: "center", background: `${meta.color}1A`, flexShrink: 0 }}><meta.Icon size={26} color={meta.color} /></span>
            <div style={{ maxWidth: 780 }}>
              <h1 style={{ fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 900, color: C.ink, letterSpacing: "-0.02em", margin: 0, lineHeight: 1.25 }}>{content.title}</h1>
              <div style={{ fontSize: 14, color: C.sub, marginTop: 8, fontWeight: 700 }}>전국 {fmtN(count)}곳 · {isKind ? kind.form : `${siblings.length}개 세부 유형`}</div>
              {content.intro?.map((p, i) => <p key={i} style={{ fontSize: 15, color: C.text, lineHeight: 1.75, marginTop: i === 0 ? 14 : 8 }}>{p}</p>)}
            </div>
          </div>
          {siblings.length > 0 && (
            <div className="flex flex-wrap gap-2" style={{ marginTop: 18 }}>
              {!isKind && <span className="pv-chip on">전체</span>}
              {siblings.map((k) => <Link key={k.c3} to={`/category/${kindSlug(k.c3)}`} className="pv-chip">{k.c3} <span style={{ opacity: .6 }}>{fmtN(data.kindCount[k.c3])}</span></Link>)}
            </div>
          )}
        </Container>
      </section>

      <Container className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 18, padding: 20 }}>
            <div style={{ fontWeight: 900, fontSize: 15.5, color: C.ink, marginBottom: 10 }}>고르는 기준</div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {(isKind ? kind.checks : content.criteria).map((c) => (
                <li key={c} className="flex items-start gap-2" style={{ fontSize: 14, color: C.text }}><CheckCircle2 size={15} color={meta.color} style={{ flexShrink: 0, marginTop: 2 }} /> {c}</li>
              ))}
            </ul>
          </div>
          <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 18, padding: 20 }}>
            <div style={{ fontWeight: 900, fontSize: 15.5, color: C.ink, marginBottom: 10 }}>지역별</div>
            <div className="flex flex-wrap gap-1.5">
              {regions.map(([r, n]) => (
                <Link key={r} to={`/region/${regionSlug(r)}`} query={isKind ? { c3 } : { c1: catName }} className="pv-chip" style={{ padding: "6px 11px", fontSize: 12.5 }}><MapPin size={11} /> {r} {fmtN(n)}</Link>
              ))}
            </div>
          </div>
          <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 18, padding: 20 }}>
            <div style={{ fontWeight: 900, fontSize: 15.5, color: C.ink, marginBottom: 10 }}>읽어보면 좋은 글</div>
            {guides.length ? guides.map((g) => (
              <Link key={g.slug} to={`/guide/${g.slug}`} className="pv-clamp2" style={{ display: "block", textDecoration: "none", fontSize: 13.5, fontWeight: 700, color: C.ink, padding: "7px 0", borderBottom: `1px solid ${C.line}`, lineHeight: 1.45 }}>{g.title}</Link>
            )) : <Link to="/guide" className="pv-link" style={{ fontSize: 13.5 }}>가이드 보기 <ArrowRight size={13} style={{ display: "inline" }} /></Link>}
          </div>
        </div>
      </Container>

      <SearchPage fixed={fixed} />

      {content.faq?.length > 0 && (
        <Container className="py-10">
          <SectionHead eyebrow="FAQ" title={`${isKind ? c3 : catName}, 자주 묻는 질문`} />
          <FaqList items={content.faq} />
        </Container>
      )}
    </div>
  );
}

/* /region/:sido — 지역 랜딩 */
export function RegionPage({ slug }) {
  const { data } = useApp();
  const sido = findBySlug(REGION_SLUG, slug);
  if (!sido || !data.regionIndex[sido]) return <NotFoundPage />;
  const rc = regionContent(sido);
  const count = data.regionCount[sido];
  const gus = data.regionIndex[sido];
  const path = `/region/${slug}`;
  const byCat = useMemo(() => {
    const m = {};
    data.spaces.filter((s) => s.s === sido).forEach((s) => { m[s.kind.c1] = (m[s.kind.c1] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [data, sido]);
  const title = `${sido} 프라이빗 공간 ${fmtN(count)}곳 — 파티룸·사우나·시네마룸·키즈룸`;
  const top = useMemo(() => filterSpaces(data, { sido, sort: "인증순" }).slice(0, 20), [data, sido]);

  useSEO({
    title,
    description: `${sido}의 프라이빗 공간을 시군구·카테고리·목적별로 찾아보세요. ${rc.intro.slice(0, 80)}`,
    path,
    jsonLd: [
      ld.breadcrumb([{ name: "홈", path: "/" }, { name: `${sido} 프라이빗 공간`, path }]),
      ld.itemList(title, top.map((s) => ({ name: s.n, path: `/space/${s.id}` }))),
    ],
  });

  return (
    <div>
      <section style={{ background: `linear-gradient(135deg, ${C.violetSoft}, #fff 60%)`, borderBottom: `1px solid ${C.line}` }}>
        <Container className="py-10 sm:py-12">
          <Breadcrumb items={[{ name: "홈", to: "/" }, { name: `${sido} 프라이빗 공간` }]} />
          <h1 style={{ fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 900, color: C.ink, letterSpacing: "-0.02em", margin: 0, lineHeight: 1.25 }}>
            {sido} 프라이빗 공간 <span style={{ color: C.violet }}>{fmtN(count)}곳</span>
          </h1>
          <p style={{ fontSize: 15, color: C.text, lineHeight: 1.75, marginTop: 14, maxWidth: 780 }}>{rc.intro}</p>
          <p style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.6, marginTop: 6, maxWidth: 780 }}>💡 {rc.tip}</p>
          <div className="flex flex-wrap gap-2" style={{ marginTop: 18 }}>
            {byCat.map(([c, n]) => (
              <Link key={c} to={`/region/${slug}`} query={{ c1: c }} className="pv-chip">{c} <span style={{ opacity: .6 }}>{fmtN(n)}</span></Link>
            ))}
          </div>
          <div style={{ marginTop: 14, fontSize: 13, color: C.sub }}>
            <b style={{ color: C.ink }}>시군구:</b> {gus.map((g, i) => (
              <React.Fragment key={g}>{i > 0 && " · "}<Link to={`/region/${slug}`} query={{ gu: g }} style={{ color: C.sub, textDecoration: "none" }}>{g}</Link></React.Fragment>
            ))}
          </div>
        </Container>
      </section>
      <SearchPage fixed={{ sido }} />
      <Container className="py-10">
        <SectionHead eyebrow="MORE" title="다른 지역 보기" />
        <div className="flex flex-wrap gap-2">
          {Object.keys(data.regionCount).filter((r) => r !== sido).sort((a, b) => data.regionCount[b] - data.regionCount[a]).map((r) => (
            <Link key={r} to={`/region/${regionSlug(r)}`} className="pv-chip"><MapPin size={12} /> {r} {fmtN(data.regionCount[r])}</Link>
          ))}
        </div>
      </Container>
    </div>
  );
}

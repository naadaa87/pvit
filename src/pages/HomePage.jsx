import React, { useState, useMemo } from "react";
import { Search, MapPin, Sparkles, ArrowRight, ShieldCheck, Map as MapIcon, CalendarDays, BookOpen, ChevronRight, Lock, Flame } from "lucide-react";
import { C } from "../styles/tokens.js";
import { Link, useRoute } from "../lib/router.jsx";
import { useApp } from "../lib/app-context.jsx";
import { CAT1, regionSlug, fmtN } from "../lib/data.js";
import { useSEO, ld, SITE } from "../lib/seo.jsx";
import { Container, SectionHead, VerifyNotice } from "../components/ui.jsx";
import { SpaceCard } from "../components/SpaceCard.jsx";
import { GUIDES } from "../content/guides.js";

const PURPOSES = ["데이트", "생일", "가족모임", "키즈", "힐링", "브라이덜샤워", "워크숍", "1인 이용", "커플", "영화감상", "골프연습", "면접"];

export function HomePage() {
  const { data } = useApp();
  const { navigate } = useRoute();
  const [q, setQ] = useState("");
  const [sido, setSido] = useState("");
  const [c1, setC1] = useState("");

  useSEO({
    title: "",
    description: SITE.description,
    path: "/",
    jsonLd: [ld.org(), ld.website()],
  });

  const sidoList = useMemo(() => Object.keys(data.regionCount).sort((a, b) => data.regionCount[b] - data.regionCount[a]), [data]);
  const featured = useMemo(() => {
    const seen = new Set(); const out = [];
    for (const s of data.spaces) {
      if ((s.grade === "A" || s.grade === "B") && !seen.has(s.k)) { seen.add(s.k); out.push(s); }
      if (out.length >= 8) break;
    }
    for (const s of data.spaces) {
      if (out.length >= 8) break;
      if (s.s === "서울" && !seen.has(s.k)) { seen.add(s.k); out.push(s); }
    }
    for (const s of data.spaces) { if (out.length >= 8) break; if (!out.includes(s)) out.push(s); }
    return out;
  }, [data]);

  const go = () => navigate({ path: "/search", query: { q, sido, c1 } });
  const guides = GUIDES.slice(0, 3);

  return (
    <div>
      {/* 히어로 — 밝은 배경 + 바이올렛 포인트 */}
      <section style={{ background: `radial-gradient(900px 420px at 8% -10%, rgba(109,91,255,.14), transparent 60%), radial-gradient(700px 380px at 95% 10%, rgba(255,77,109,.09), transparent 55%), #fff`, borderBottom: `1px solid ${C.line}`, position: "relative", overflow: "hidden" }}>
        <div className="pv-blob" aria-hidden="true" style={{ position: "absolute", right: -120, top: -80, width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(155,107,255,.16), transparent 65%)" }} />
        <Container className="relative py-14 sm:py-20">
          <div style={{ maxWidth: 780 }}>
            <div className="pv-up" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 999, background: C.violetSoft, color: C.violet, fontSize: 12.5, fontWeight: 800, marginBottom: 20 }}>
              <Sparkles size={13} /> 전국 프라이빗 공간 {fmtN(data.total)}곳 · 7개 카테고리
            </div>
            <h1 className="pv-up" style={{ fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 900, color: C.ink, lineHeight: 1.15, letterSpacing: "-0.03em", margin: 0 }}>
              우리끼리만 쓰는 공간,<br />
              <span style={{ background: `linear-gradient(90deg, ${C.violet}, ${C.violet2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>프빗에서 찾다.</span>
            </h1>
            <p className="pv-up" style={{ color: C.sub, fontSize: "clamp(15px, 2vw, 18px)", marginTop: 18, lineHeight: 1.65, maxWidth: 600 }}>
              파티룸부터 프라이빗 사우나, 룸식당, 독채 숙소, 키즈룸까지.<br className="hidden sm:block" />
              남들과 섞이지 않는 프라이빗 공간을 한 곳에서 찾아보세요.
            </p>

            <form className="pv-up" onSubmit={(e) => { e.preventDefault(); go(); }} role="search" aria-label="공간 검색" style={{ background: "#fff", borderRadius: 18, padding: 12, marginTop: 28, boxShadow: "0 18px 50px rgba(16,22,43,.12)", border: `1px solid ${C.line}` }}>
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="sr-only" htmlFor="home-sido">지역</label>
                  <select id="home-sido" className="pv-select" value={sido} onChange={(e) => setSido(e.target.value)}>
                    <option value="">지역 전체</option>
                    {sidoList.map((s) => <option key={s} value={s}>{s} ({fmtN(data.regionCount[s])})</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="sr-only" htmlFor="home-cat">카테고리</label>
                  <select id="home-cat" className="pv-select" value={c1} onChange={(e) => setC1(e.target.value)}>
                    <option value="">카테고리 전체</option>
                    {data.cat1List.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="sr-only" htmlFor="home-q">검색어</label>
                  <input id="home-q" className="pv-input" placeholder="공간명·목적 검색 (예: 사우나, 생일)" value={q} onChange={(e) => setQ(e.target.value)} />
                </div>
                <button type="submit" className="pv-btn pv-primary sm:col-span-1" style={{ padding: "12px", borderRadius: 12, fontSize: 15 }}>
                  <Search size={17} /><span className="sm:hidden ml-1">검색</span>
                </button>
              </div>
            </form>

            <div className="pv-up flex flex-wrap gap-2" style={{ marginTop: 16 }}>
              {sidoList.slice(0, 7).map((s) => (
                <Link key={s} to={`/region/${regionSlug(s)}`} className="pv-chip"><MapPin size={12} /> {s}</Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* 프라이빗 기준 */}
      <Container className="py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            [Lock, "구조로 고릅니다", "분위기가 아니라 '모르는 사람이 들어올 수 있는가'로 프라이빗을 판단합니다."],
            [MapIcon, "지도로 바로 확인", "카드마다 네이버·구글 지도 버튼. 위치와 최신 정보를 바로 봅니다."],
            [ShieldCheck, "검증 등급 표시", "호스트 인증·공식채널 검증·정보 확인 중을 구분해 보여줍니다."],
          ].map(([I, t, d]) => (
            <div key={t} className="flex gap-3" style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: "16px 18px" }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, display: "grid", placeItems: "center", background: C.violetSoft, flexShrink: 0 }}><I size={19} color={C.violet} /></span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: C.ink }}>{t}</div>
                <div style={{ fontSize: 13, color: C.sub, marginTop: 3, lineHeight: 1.5 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* 카테고리 */}
      <Container className="py-8 sm:py-10">
        <SectionHead eyebrow="CATEGORY" title="어떤 프라이빗 공간을 찾으세요?" sub="7개 카테고리 · 10개 세부 유형" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {Object.entries(CAT1).map(([name, m]) => (
            <Link key={name} to={`/category/${m.slug}`} className="pv-card" style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: "18px 12px", textAlign: "center", textDecoration: "none", display: "block" }}>
              <span style={{ width: 46, height: 46, margin: "0 auto 10px", borderRadius: 13, display: "grid", placeItems: "center", background: `${m.color}1A` }}>
                <m.Icon size={22} color={m.color} strokeWidth={2.1} />
              </span>
              <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink }}>{name}</div>
              <div style={{ fontSize: 11.5, color: C.sub, marginTop: 3 }}>{fmtN(data.catCount[name])}곳</div>
            </Link>
          ))}
        </div>
      </Container>

      {/* 추천 공간 */}
      <div style={{ background: "#fff", borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
        <Container className="py-12 sm:py-14">
          <SectionHead eyebrow="PICK" title="유형별 대표 공간 미리보기" sub="10가지 세부 유형에서 하나씩 골라봤어요" action="전체 보기" to="/search" />
          <VerifyNotice compact />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginTop: 16 }}>
            {featured.map((s) => <SpaceCard key={s.id} space={s} />)}
          </div>
        </Container>
      </div>

      {/* 목적 */}
      <Container className="py-12">
        <SectionHead eyebrow="PURPOSE" title="이런 순간, 프라이빗하게" />
        <div className="flex flex-wrap gap-2">
          {PURPOSES.map((t) => (
            <Link key={t} to="/search" query={{ tag: t }} className="pv-chip">#{t}</Link>
          ))}
        </div>
      </Container>

      {/* 핫딜 티저 + 가이드 */}
      <Container className="pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Link to="/hotdeal" className="pv-card lg:col-span-1" style={{ display: "block", textDecoration: "none", background: `linear-gradient(135deg, ${C.coral}, ${C.coral2})`, borderRadius: 20, padding: 24, color: "#fff" }}>
            <div className="flex items-center gap-2" style={{ fontSize: 12.5, fontWeight: 800, opacity: .9 }}><Flame size={14} /> HOT DEAL</div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 10, lineHeight: 1.3 }}>비는 시간을<br />할인가로.</div>
            <div style={{ fontSize: 13.5, marginTop: 8, opacity: .9, lineHeight: 1.5 }}>평일 낮·당일 예약 타임딜. 검증 호스트 한정으로 오픈 준비 중입니다.</div>
            <div className="flex items-center gap-1" style={{ marginTop: 16, fontWeight: 800, fontSize: 14 }}>핫딜 보기 <ArrowRight size={15} /></div>
          </Link>
          <div className="lg:col-span-2" style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 20, padding: 24 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <div className="flex items-center gap-2" style={{ fontWeight: 900, fontSize: 17, color: C.ink }}><BookOpen size={18} color={C.violet} /> 프라이빗 공간 가이드</div>
              <Link to="/guide" className="pv-link flex items-center gap-1" style={{ fontSize: 13.5 }}>전체 <ChevronRight size={14} /></Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {guides.map((g) => (
                <Link key={g.slug} to={`/guide/${g.slug}`} style={{ textDecoration: "none", padding: "11px 0", borderTop: `1px solid ${C.line}` }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: C.violet }}>{g.section}</div>
                  <div className="pv-clamp1" style={{ fontSize: 15, fontWeight: 800, color: C.ink, marginTop: 2 }}>{g.title}</div>
                  <div className="pv-clamp1" style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>{g.description}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* 호스트 모집 */}
      <Container className="py-12">
        <div style={{ background: `linear-gradient(120deg, ${C.ink} 30%, #1E1440)`, borderRadius: 24, padding: "clamp(28px, 5vw, 52px)", position: "relative", overflow: "hidden" }}>
          <div className="pv-blob" aria-hidden="true" style={{ position: "absolute", right: -60, bottom: -80, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(109,91,255,.4), transparent 65%)" }} />
          <div style={{ position: "relative", maxWidth: 640 }}>
            <h2 style={{ color: "#fff", fontSize: "clamp(21px, 3.4vw, 30px)", fontWeight: 900, letterSpacing: "-0.02em", margin: 0 }}>
              프라이빗 공간을 운영 중이신가요?
            </h2>
            <p style={{ color: C.subDark, marginTop: 12, fontSize: 15, lineHeight: 1.65 }}>
              입점과 기본 노출은 무료입니다. 검수를 통과하면 <b style={{ color: "#fff" }}>호스트 인증 뱃지</b>와 함께 상단에 노출되고, 호스트 센터에서 예약 요청·문의·핫딜을 한곳에서 관리할 수 있습니다.
            </p>
            <div className="flex flex-wrap gap-3" style={{ marginTop: 22 }}>
              <Link to="/host/apply" className="pv-btn pv-primary" style={{ padding: "13px 24px", borderRadius: 13, fontSize: 15 }}>
                공간 등록 신청하기 <ArrowRight size={16} />
              </Link>
              <Link to="/host" className="pv-btn pv-darkghost" style={{ padding: "13px 24px", borderRadius: 13, fontSize: 15 }}>
                입점 안내 보기
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

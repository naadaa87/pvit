import React, { useState } from "react";
import { Search, MapPin, CalendarDays, ArrowRight, Flame, BadgeCheck, Sparkles, ChevronDown, ChevronUp, HelpCircle, Home } from "lucide-react";
import { C } from "../styles/tokens.js";
import { Link } from "../lib/router.jsx";
import { useApp } from "../lib/app-context.jsx";
import { CAT1, fmtN } from "../lib/data.js";
import { useSEO, ld, SITE } from "../lib/seo.jsx";
import { Container, Logo, SectionHead, Breadcrumb } from "../components/ui.jsx";
import { FAQ_CUSTOMER, FAQ_HOST } from "../content/faq.js";
import { TERMS, PRIVACY, COMPANY } from "../content/legal.js";

/* ---------- 핫딜 (오픈 준비) ---------- */
export function HotDealPage() {
  useSEO({
    title: "프라이빗 공간 핫딜·타임딜 — 비는 시간을 할인가로",
    description: "평일 낮·당일 예약 타임딜, 오픈 기념 특가. 검증된 호스트의 프라이빗 공간 할인을 모아 보여주는 핫딜 페이지입니다. 오픈 준비 중.",
    path: "/hotdeal",
    jsonLd: [ld.breadcrumb([{ name: "홈", path: "/" }, { name: "핫딜", path: "/hotdeal" }])],
  });
  return (
    <div>
      <section style={{ background: `radial-gradient(900px 400px at 15% -10%, rgba(255,77,109,.16), transparent 60%), #fff`, borderBottom: `1px solid ${C.line}` }}>
        <Container className="py-14 sm:py-16">
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 999, background: "rgba(255,77,109,.1)", color: C.coral, fontSize: 12.5, fontWeight: 800 }}>
              <Flame size={13} /> HOT DEAL · 오픈 준비 중
            </div>
            <h1 style={{ color: C.ink, fontSize: "clamp(26px, 5vw, 40px)", fontWeight: 900, letterSpacing: "-0.02em", margin: "16px 0 0" }}>
              프라이빗 공간 핫딜,<br />곧 시작합니다.
            </h1>
            <p style={{ color: C.sub, fontSize: 15.5, lineHeight: 1.7, marginTop: 14 }}>
              마감 임박 타임딜, 평일 낮 특가, 당일 예약 할인 — 검증된 호스트의 공간만 모아 실제 할인가로 선보일 예정입니다.
            </p>
            <div className="flex flex-wrap gap-3" style={{ marginTop: 24 }}>
              <Link to="/host/center" query={{ tab: "deals" }} className="pv-btn pv-deal" style={{ padding: "13px 26px", borderRadius: 13, fontSize: 15 }}>호스트 핫딜 신청 <ArrowRight size={16} /></Link>
              <Link to="/search" className="pv-btn pv-ghost" style={{ padding: "13px 26px", borderRadius: 13, fontSize: 15 }}>공간 먼저 둘러보기</Link>
            </div>
          </div>
        </Container>
      </section>
      <Container className="py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            [Flame, "타임딜", "마감 카운트다운과 함께 오늘만 할인되는 공간. 원가·할인가·남은 수량이 표시됩니다."],
            [BadgeCheck, "검증 호스트 한정", "호스트 인증(A등급)을 마친 공간만 핫딜에 참여합니다. 허위 할인은 올라오지 않습니다."],
            [Sparkles, "비는 시간 채우기", "평일 낮, 당일 예약처럼 비는 시간을 할인으로 채웁니다. 고객은 싸게, 호스트는 가동률을."],
          ].map(([I, t, d]) => (
            <div key={t} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 18, padding: 22 }}>
              <span style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", background: "rgba(255,77,109,.1)" }}><I size={20} color={C.coral} /></span>
              <div style={{ fontWeight: 900, fontSize: 16.5, color: C.ink, marginTop: 12 }}>{t}</div>
              <p style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.65, marginTop: 6 }}>{d}</p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

/* ---------- 소개 ---------- */
export function AboutPage() {
  const { data } = useApp();
  useSEO({
    title: "PVIT 프빗 소개 — 우리끼리 쓰는 모든 프라이빗 공간",
    description: "프빗은 파티룸, 프라이빗 사우나, 룸식당, 독채 숙소, 키즈룸, 포커스룸처럼 남들과 섞이지 않는 공간만 모아 보여주는 프라이빗 공간 종합 플랫폼입니다. 브랜드 의미와 이용 방법을 소개합니다.",
    path: "/about",
    jsonLd: [ld.org(), ld.breadcrumb([{ name: "홈", path: "/" }, { name: "PVIT 소개", path: "/about" }])],
  });
  return (
    <div>
      <section style={{ background: `radial-gradient(1000px 460px at 50% -20%, rgba(109,91,255,.14), transparent 60%), #fff`, borderBottom: `1px solid ${C.line}` }}>
        <Container className="py-16 text-center">
          <div className="flex justify-center"><Logo size={26} /></div>
          <h1 style={{ color: C.ink, fontSize: "clamp(26px, 5vw, 42px)", fontWeight: 900, letterSpacing: "-0.02em", margin: "22px 0 0" }}>우리끼리 쓰는 모든 공간</h1>
          <p style={{ color: C.sub, fontSize: 16, marginTop: 14, lineHeight: 1.7 }}>
            PVIT = <b style={{ color: C.ink }}>P</b>rivate <b style={{ color: C.ink }}>V</b>isit · Private Place · Private It<br />
            남들과 섞이지 않는 프라이빗 공간·서비스를 연결하는 종합 플랫폼
          </p>
        </Container>
      </section>

      <Container className="py-14">
        <SectionHead eyebrow="WHY" title="왜 프빗을 만들었나" />
        <div className="pv-prose" style={{ maxWidth: 760 }}>
          <p>파티룸은 파티룸 플랫폼에서, 사우나는 네이버에서, 키즈룸은 맘카페에서 찾아야 했습니다. 공간의 종류는 다르지만 찾는 이유는 하나였습니다. <strong>"우리끼리만 쓰고 싶다."</strong> 프빗은 그 이유 하나로 공간을 모읍니다.</p>
          <p>그래서 프빗은 분위기가 아니라 구조로 공간을 고릅니다. 독립된 공간인가, 단독으로 쓰는가, 예약제인가, 예약 시간에 외부인이 안 들어오는가. 이 네 가지를 통과한 공간만 올립니다. 인테리어가 화려해도 옆 테이블 소리가 들리면 프빗에는 없습니다.</p>
          <p>지금은 네이버지도·네이버예약·전화 같은 공식 채널로 연결하는 정보 플랫폼으로 시작합니다. 호스트가 직접 등록하고 검수를 거친 공간부터 예약 요청을 받고, 자체 예약·결제는 그다음입니다.</p>
        </div>
      </Container>

      <div style={{ background: "#fff", borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
        <Container className="py-14">
          <SectionHead eyebrow="HOW" title="프빗은 이렇게 이용해요" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              [Search, "1. 목적으로 찾기", "지역·카테고리·이용목적 필터로 우리 모임에 맞는 독립 공간을 좁혀요."],
              [MapPin, "2. 지도로 확인", "네이버·구글 지도 버튼으로 위치, 사진, 연락처, 영업 여부를 확인해요."],
              [CalendarDays, "3. 예약 요청·공식 채널 예약", "인증 공간은 예약 요청을 바로 보내고, 그 외는 네이버예약·전화로 예약해요."],
            ].map(([I, t, d]) => (
              <div key={t} style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 18, padding: 24 }}>
                <span style={{ width: 44, height: 44, borderRadius: 13, display: "grid", placeItems: "center", background: C.violetSoft }}><I size={20} color={C.violet} /></span>
                <div style={{ fontWeight: 900, fontSize: 16.5, color: C.ink, marginTop: 14 }}>{t}</div>
                <p style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.65, marginTop: 6 }}>{d}</p>
              </div>
            ))}
          </div>
        </Container>
      </div>

      <Container className="py-14">
        <SectionHead eyebrow="CATEGORY" title={`7개 카테고리 · ${fmtN(data.total)}개 공간`} sub="1차 수집을 마치고 실존·연락처 검증을 진행하고 있어요. 룸식당·독채 숙소·촬영 스튜디오·반려동물 공간은 다음 확장 카테고리입니다." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(CAT1).map(([name, m]) => (
            <Link key={name} to={`/category/${m.slug}`} className="pv-card flex items-center gap-3" style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 15, padding: "15px 17px", textDecoration: "none" }}>
              <span style={{ width: 40, height: 40, borderRadius: 11, display: "grid", placeItems: "center", background: `${m.color}1A`, flexShrink: 0 }}><m.Icon size={19} color={m.color} /></span>
              <span>
                <span style={{ display: "block", fontWeight: 800, fontSize: 14.5, color: C.ink }}>{name}</span>
                <span style={{ display: "block", fontSize: 12, color: C.sub, marginTop: 2 }}>{m.blurb} · {fmtN(data.catCount[name])}곳</span>
              </span>
            </Link>
          ))}
        </div>
      </Container>

      <Container className="py-10 text-center">
        <SectionHead title="프빗의 약속" />
        <div className="flex flex-wrap justify-center gap-2.5" style={{ maxWidth: 720, margin: "0 auto" }}>
          {["우리끼리 쓰는 모든 공간", "프라이빗한 순간을 찾는 가장 쉬운 방법", "남들과 섞이지 않는 공간 예약", "오늘, 우리만의 공간", "파티룸부터 스파까지, 프라이빗 공간의 모든 것"].map((s) => (
            <span key={s} style={{ padding: "11px 20px", borderRadius: 999, background: "#fff", border: `1.5px solid ${C.line}`, fontSize: 14, fontWeight: 800, color: C.ink }}>“{s}”</span>
          ))}
        </div>
        <Link to="/search" className="pv-btn pv-primary" style={{ padding: "14px 32px", borderRadius: 14, fontSize: 15.5, marginTop: 30 }}>지금 공간 찾아보기 <ArrowRight size={16} /></Link>
      </Container>
    </div>
  );
}

/* ---------- FAQ ---------- */
function Accordion({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div>
      {items.map(([q, a], i) => (
        <div key={i} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 14, marginBottom: 8, overflow: "hidden" }}>
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-3" style={{ background: "none", border: "none", cursor: "pointer", padding: "15px 18px", textAlign: "left" }} aria-expanded={open === i}>
            <span style={{ fontWeight: 800, fontSize: 15, color: C.ink }}>{q}</span>
            {open === i ? <ChevronUp size={17} color={C.sub} style={{ flexShrink: 0 }} /> : <ChevronDown size={17} color={C.sub} style={{ flexShrink: 0 }} />}
          </button>
          {open === i && <div className="pv-up" style={{ padding: "0 18px 16px", fontSize: 14.5, color: C.text, lineHeight: 1.75 }}>{a}</div>}
        </div>
      ))}
    </div>
  );
}

export function FaqPage() {
  useSEO({
    title: "자주 묻는 질문 — 프빗 이용·예약·검증 등급, 호스트 입점·검수·정산",
    description: "프빗은 어떤 서비스인지, 예약·결제는 어떻게 하는지, '정보 확인 중' 표시의 뜻, 호스트 입점 비용·검수·핫딜·정산까지 자주 묻는 질문을 모았습니다.",
    path: "/faq",
    jsonLd: [ld.breadcrumb([{ name: "홈", path: "/" }, { name: "FAQ", path: "/faq" }]), ld.faq([...FAQ_CUSTOMER, ...FAQ_HOST])],
  });
  return (
    <Container className="py-10">
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <Breadcrumb items={[{ name: "홈", to: "/" }, { name: "자주 묻는 질문" }]} />
        <div className="flex items-center gap-2" style={{ color: C.violet, fontWeight: 800, fontSize: 13, letterSpacing: ".06em" }}><HelpCircle size={15} /> FAQ</div>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 900, color: C.ink, margin: "8px 0 24px", letterSpacing: "-0.02em" }}>자주 묻는 질문</h1>
        <h2 style={{ fontSize: 19, fontWeight: 900, color: C.ink, margin: "0 0 12px" }}>이용자</h2>
        <Accordion items={FAQ_CUSTOMER} />
        <h2 style={{ fontSize: 19, fontWeight: 900, color: C.ink, margin: "32px 0 12px" }}>호스트</h2>
        <Accordion items={FAQ_HOST} />
        <div style={{ marginTop: 24, fontSize: 14, color: C.sub }}>찾는 답이 없다면 <a href={`mailto:${COMPANY.email}`} className="pv-link">{COMPANY.email}</a> 로 문의해 주세요.</div>
      </div>
    </Container>
  );
}

/* ---------- 약관 / 개인정보 ---------- */
export function LegalPage({ kind }) {
  const isTerms = kind === "terms";
  useSEO({
    title: isTerms ? "이용약관" : "개인정보처리방침",
    description: isTerms ? "프빗 서비스 이용약관" : "프빗 개인정보처리방침 — 수집 항목, 목적, 보유 기간, 이용자의 권리",
    path: isTerms ? "/terms" : "/privacy",
    noindex: true,
  });
  return (
    <Container className="py-10">
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <Breadcrumb items={[{ name: "홈", to: "/" }, { name: isTerms ? "이용약관" : "개인정보처리방침" }]} />
        <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 900, color: C.ink, margin: "0 0 6px", letterSpacing: "-0.02em" }}>{isTerms ? "이용약관" : "개인정보처리방침"}</h1>
        <div style={{ fontSize: 13, color: C.sub, marginBottom: 20 }}>시행일 {COMPANY.updated} · {COMPANY.corp}</div>
        <div className="pv-prose" style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 18, padding: "clamp(18px, 3vw, 30px)" }} dangerouslySetInnerHTML={{ __html: isTerms ? TERMS : PRIVACY }} />
      </div>
    </Container>
  );
}

/* ---------- 404 ---------- */
export function NotFoundPage() {
  useSEO({ title: "페이지를 찾을 수 없어요", description: "요청하신 페이지가 없습니다.", path: "/404", noindex: true });
  return (
    <Container className="py-24 text-center">
      <div style={{ fontSize: 64, fontWeight: 900, color: C.violet, letterSpacing: "-0.04em" }}>404</div>
      <h1 style={{ fontSize: 22, fontWeight: 900, color: C.ink, margin: "8px 0" }}>페이지를 찾을 수 없어요</h1>
      <p style={{ color: C.sub, fontSize: 14.5 }}>주소가 바뀌었거나 삭제된 공간일 수 있어요.</p>
      <div className="flex justify-center gap-2" style={{ marginTop: 20 }}>
        <Link to="/" className="pv-btn pv-ghost" style={{ padding: "12px 20px", borderRadius: 12, fontSize: 14 }}><Home size={15} /> 홈으로</Link>
        <Link to="/search" className="pv-btn pv-primary" style={{ padding: "12px 20px", borderRadius: 12, fontSize: 14 }}><Search size={15} /> 공간찾기</Link>
      </div>
    </Container>
  );
}

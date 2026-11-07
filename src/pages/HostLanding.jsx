import React, { useState } from "react";
import { Building2, ArrowRight, Check, ChevronDown, ChevronUp, Lock, ShieldCheck, LayoutDashboard, Megaphone, BookOpen, Mail } from "lucide-react";
import { C } from "../styles/tokens.js";
import { Link, useRoute } from "../lib/router.jsx";
import { useApp } from "../lib/app-context.jsx";
import { useSEO, ld } from "../lib/seo.jsx";
import { Container, SectionHead, Breadcrumb, Field } from "../components/ui.jsx";
import { HOST_BENEFITS, HOST_PROCESS, HOST_PLANS, PRIVACY_CHECKS } from "../content/host.js";
import { FAQ_HOST } from "../content/faq.js";
import { postApi, load, save, makeRef } from "../lib/store.js";

export function HostLandingPage() {
  const { query } = useRoute();
  const { notify } = useApp();
  const [open, setOpen] = useState(null);
  const [ad, setAd] = useState({ name: "", contact: "", space: "", interest: "노출 부스트", memo: "" });
  const [adDone, setAdDone] = useState(false);

  useSEO({
    title: "호스트 입점 안내 — 프라이빗 공간 무료 등록, 호스트 인증, 호스트 센터",
    description: "파티룸·사우나·시네마룸·키친·키즈룸·포커스룸을 운영하신다면 프빗에 무료로 입점하세요. 입점 절차(신청→검수→인증→운영), 요금 구조, 호스트 센터 기능, 광고·제휴 문의를 안내합니다.",
    path: "/host",
    jsonLd: [
      ld.breadcrumb([{ name: "홈", path: "/" }, { name: "호스트 입점", path: "/host" }]),
      ld.howto("프빗 호스트 입점 절차", HOST_PROCESS),
      ld.faq(FAQ_HOST),
    ],
  });

  const submitAd = async () => {
    if (!ad.name || !ad.contact) { notify("담당자명과 연락처를 입력해 주세요"); return; }
    const payload = { ref: makeRef("AD"), ...ad, createdAt: new Date().toISOString() };
    await postApi("/api/contact", { type: "ads", ...payload });
    save("contacts", [payload, ...load("contacts", [])].slice(0, 20));
    setAdDone(true);
  };

  return (
    <div>
      <section style={{ background: `radial-gradient(900px 420px at 10% -10%, rgba(109,91,255,.14), transparent 60%), #fff`, borderBottom: `1px solid ${C.line}` }}>
        <Container className="py-14 sm:py-20">
          <Breadcrumb items={[{ name: "홈", to: "/" }, { name: "호스트 입점" }]} />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
            <div className="lg:col-span-3">
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 999, background: C.violetSoft, color: C.violet, fontSize: 12.5, fontWeight: 800 }}>
                <Building2 size={13} /> HOST · 입점·기본 노출 무료
              </div>
              <h1 style={{ fontSize: "clamp(28px, 5vw, 46px)", fontWeight: 900, color: C.ink, lineHeight: 1.2, letterSpacing: "-0.03em", margin: "16px 0 0" }}>
                프라이빗 공간을 운영하시나요?<br />
                <span style={{ color: C.violet }}>'우리끼리'를 찾는 고객</span>에게 보여주세요.
              </h1>
              <p style={{ fontSize: 16, color: C.sub, lineHeight: 1.7, marginTop: 16, maxWidth: 560 }}>
                프빗 방문자는 처음부터 '남들과 섞이지 않는 공간'을 찾는 사람들입니다. 공간의 구조적 장점이 그대로 선택 이유가 됩니다. 등록 10분, 검수 2~3일, 그다음은 호스트 센터에서 관리합니다.
              </p>
              <div className="flex flex-wrap gap-3" style={{ marginTop: 24 }}>
                <Link to="/host/apply" className="pv-btn pv-primary" style={{ padding: "14px 26px", borderRadius: 13, fontSize: 15.5 }}>공간 등록 신청 <ArrowRight size={16} /></Link>
                <Link to="/host/center" className="pv-btn pv-ghost" style={{ padding: "14px 26px", borderRadius: 13, fontSize: 15.5 }}><LayoutDashboard size={16} /> 호스트 센터 둘러보기</Link>
              </div>
            </div>
            <div className="lg:col-span-2" style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 22, padding: 22, boxShadow: "0 18px 50px rgba(16,22,43,.1)" }}>
              <div className="flex items-center gap-2" style={{ fontWeight: 900, fontSize: 15, color: C.ink, marginBottom: 12 }}><Lock size={16} color={C.violet} /> 프빗의 프라이빗 기준</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {PRIVACY_CHECKS.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5" style={{ fontSize: 13.5, color: C.text, lineHeight: 1.5 }}>
                    <Check size={15} color={c.required ? C.green : C.sub} strokeWidth={3} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{c.label} {!c.required && <span style={{ color: C.sub, fontSize: 12 }}>(선택)</span>}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12.5, color: C.sub, marginTop: 12, lineHeight: 1.5 }}>네 가지 필수 기준을 충족하면 입점 대상입니다. 칸막이석·개방형 좌석은 해당하지 않습니다.</div>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-14">
        <SectionHead eyebrow="WHY PVIT" title="입점하면 달라지는 것" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {HOST_BENEFITS.map((b) => (
            <div key={b.title} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 18, padding: 22 }}>
              <div style={{ fontWeight: 900, fontSize: 16.5, color: C.ink }}>{b.title}</div>
              <p style={{ fontSize: 14, color: C.sub, lineHeight: 1.65, marginTop: 6 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </Container>

      <div style={{ background: "#fff", borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
        <Container className="py-14">
          <SectionHead eyebrow="PROCESS" title="입점 절차 — 신청부터 운영까지" sub="신청 10분 · 검수 영업일 2~3일" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {HOST_PROCESS.map(([t, d], i) => (
              <div key={t} style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 18, padding: 20, position: "relative" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: C.violet, color: "#fff", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 14 }}>{i + 1}</div>
                <div style={{ fontWeight: 900, fontSize: 16.5, color: C.ink, marginTop: 12 }}>{t}</div>
                <p style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.65, marginTop: 6, margin: "6px 0 0" }}>{d}</p>
              </div>
            ))}
          </div>
        </Container>
      </div>

      <Container className="py-14">
        <SectionHead eyebrow="HOST CENTER" title="호스트 센터에서 할 수 있는 것" sub="예약·문의·핫딜·정보 수정을 한 화면에서" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            [LayoutDashboard, "대시보드", "오늘 예약, 문의, 공간 상태, 할 일"],
            [Building2, "내 공간", "정보 수정 요청, 사진, 요금표, 정책"],
            [ShieldCheck, "예약 관리", "요청 확인·확정·취소, 주간 캘린더"],
            [Megaphone, "핫딜·프로모션", "타임딜 신청, 상위노출, 인증 프로그램"],
          ].map(([I, t, d]) => (
            <Link key={t} to="/host/center" className="pv-card" style={{ display: "block", textDecoration: "none", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: 18 }}>
              <I size={20} color={C.violet} />
              <div style={{ fontWeight: 900, fontSize: 15, color: C.ink, marginTop: 10 }}>{t}</div>
              <div style={{ fontSize: 12.5, color: C.sub, marginTop: 4, lineHeight: 1.5 }}>{d}</div>
            </Link>
          ))}
        </div>
      </Container>

      <div style={{ background: "#fff", borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
        <Container className="py-14">
          <SectionHead eyebrow="PLAN" title="요금 구조" sub="기본 입점은 무료입니다. 유료 상품은 정식 오픈 시 금액을 공지하고, 사전 입점 호스트에게 먼저 안내합니다." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {HOST_PLANS.map((p) => (
              <div key={p.name} style={{ background: p.highlight ? `linear-gradient(160deg, ${C.ink}, #1E1440)` : C.bg, border: `1px solid ${p.highlight ? "transparent" : C.line}`, borderRadius: 20, padding: 24, color: p.highlight ? "#fff" : C.ink, display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: 900, fontSize: 17 }}>{p.name}</div>
                <div style={{ fontSize: 26, fontWeight: 900, marginTop: 8, color: p.highlight ? C.violet2 : C.ink }}>{p.price}</div>
                <div style={{ fontSize: 12.5, opacity: .7, marginTop: 2 }}>{p.note}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "flex", flexDirection: "column", gap: 7 }}>
                  {p.items.map((it) => <li key={it} className="flex items-start gap-2" style={{ fontSize: 13.5, lineHeight: 1.5 }}><Check size={14} color={C.green} strokeWidth={3} style={{ flexShrink: 0, marginTop: 3 }} /> {it}</li>)}
                </ul>
                {p.highlight ? (
                  <Link to="/host/apply" className="pv-btn pv-primary" style={{ padding: 12, borderRadius: 12, fontSize: 14, marginTop: "auto", paddingTop: 12 }}>{p.cta}</Link>
                ) : (
                  <a href="#ads" className="pv-btn pv-ghost" style={{ padding: 12, borderRadius: 12, fontSize: 14, marginTop: "auto" }}>{p.cta}</a>
                )}
              </div>
            ))}
          </div>
        </Container>
      </div>

      <Container className="py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <SectionHead eyebrow="FAQ" title="호스트가 자주 묻는 질문" />
            {FAQ_HOST.map(([q, a], i) => (
              <div key={i} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 14, marginBottom: 8, overflow: "hidden" }}>
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-3" style={{ background: "none", border: "none", cursor: "pointer", padding: "14px 18px", textAlign: "left" }} aria-expanded={open === i}>
                  <span style={{ fontWeight: 800, fontSize: 14.5, color: C.ink }}>{q}</span>
                  {open === i ? <ChevronUp size={16} color={C.sub} style={{ flexShrink: 0 }} /> : <ChevronDown size={16} color={C.sub} style={{ flexShrink: 0 }} />}
                </button>
                {open === i && <div className="pv-up" style={{ padding: "0 18px 16px", fontSize: 14, color: C.sub, lineHeight: 1.7 }}>{a}</div>}
              </div>
            ))}
            <Link to="/host/guide" className="pv-link flex items-center gap-1" style={{ fontSize: 14, marginTop: 8 }}><BookOpen size={15} /> 호스트 운영 가이드 읽기 <ArrowRight size={14} /></Link>
          </div>
          <div id="ads">
            <SectionHead eyebrow="ADS · PARTNERSHIP" title="광고·제휴 문의" sub="상위노출, 핫딜, 인증 프로그램, 콘텐츠 제휴" />
            <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 20, padding: 22 }}>
              {adDone ? (
                <div style={{ textAlign: "center", padding: "20px 0" }} className="pv-up">
                  <Mail size={30} color={C.green} style={{ margin: "0 auto 10px" }} />
                  <div style={{ fontWeight: 900, fontSize: 17, color: C.ink }}>문의가 접수됐어요</div>
                  <div style={{ fontSize: 14, color: C.sub, marginTop: 6 }}>영업일 기준 2일 안에 연락드립니다.</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="담당자명" required><input className="pv-input" value={ad.name} onChange={(e) => setAd({ ...ad, name: e.target.value })} /></Field>
                  <Field label="연락처 또는 이메일" required><input className="pv-input" value={ad.contact} onChange={(e) => setAd({ ...ad, contact: e.target.value })} /></Field>
                  <Field label="공간·회사명" full><input className="pv-input" value={ad.space} onChange={(e) => setAd({ ...ad, space: e.target.value })} /></Field>
                  <Field label="관심 상품" full>
                    <select className="pv-select" value={ad.interest} onChange={(e) => setAd({ ...ad, interest: e.target.value })}>
                      {["노출 부스트", "핫딜 등록", "프빗 인증 프로그램", "콘텐츠·커뮤니티 광고", "제휴 프로모션", "기타"].map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </Field>
                  <Field label="문의 내용" full><textarea className="pv-textarea" rows={3} value={ad.memo} onChange={(e) => setAd({ ...ad, memo: e.target.value })} placeholder="지점 수, 희망 시기, 예산 범위 등 자유롭게 적어주세요" /></Field>
                  <button className="pv-btn pv-primary sm:col-span-2" style={{ padding: 13, borderRadius: 12, fontSize: 14.5 }} onClick={submitAd}>문의 보내기 <ArrowRight size={15} /></button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

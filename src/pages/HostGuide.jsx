import React from "react";
import { BookOpen, ArrowRight } from "lucide-react";
import { C } from "../styles/tokens.js";
import { Link } from "../lib/router.jsx";
import { useSEO, ld } from "../lib/seo.jsx";
import { Container, Breadcrumb } from "../components/ui.jsx";
import { HOST_GUIDE_SECTIONS } from "../content/host.js";

export function HostGuidePage() {
  useSEO({
    title: "호스트 운영 가이드 — 사진, 요금표, 예약 응대, 무인 운영, 정산",
    description: "프라이빗 공간 호스트를 위한 운영 매뉴얼. 문의를 늘리는 사진 구성, 요금표 작성법, 1시간 내 예약 응대, 프라이빗 기준 유지, 무인 운영 체크리스트, 후기 관리, 결제·정산 구조를 정리했습니다.",
    path: "/host/guide",
    jsonLd: [ld.breadcrumb([{ name: "홈", path: "/" }, { name: "호스트 입점", path: "/host" }, { name: "운영 가이드", path: "/host/guide" }])],
  });
  return (
    <Container className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="hidden lg:block">
          <div style={{ position: "sticky", top: 84, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: 16 }}>
            <div style={{ fontWeight: 900, fontSize: 13, color: C.violet, marginBottom: 8 }}>목차</div>
            {HOST_GUIDE_SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: C.text, textDecoration: "none", padding: "6px 0", borderBottom: `1px solid ${C.line}` }}>{s.title}</a>
            ))}
            <Link to="/host/center" className="pv-btn pv-primary w-full" style={{ padding: 11, borderRadius: 11, fontSize: 13.5, marginTop: 12 }}>호스트 센터 <ArrowRight size={14} /></Link>
          </div>
        </aside>
        <div className="lg:col-span-3" style={{ maxWidth: 780 }}>
          <Breadcrumb items={[{ name: "홈", to: "/" }, { name: "호스트 입점", to: "/host" }, { name: "운영 가이드" }]} />
          <div className="flex items-center gap-2" style={{ color: C.violet, fontWeight: 800, fontSize: 13, letterSpacing: ".06em" }}><BookOpen size={15} /> HOST GUIDE</div>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 900, color: C.ink, margin: "8px 0 10px", letterSpacing: "-0.02em" }}>호스트 운영 가이드</h1>
          <p style={{ fontSize: 15, color: C.sub, lineHeight: 1.7 }}>
            입점 후 문의와 예약을 늘리는 데 실제로 효과가 있었던 것들만 정리했습니다. 한 번에 다 하지 않아도 됩니다. 사진 → 요금표 → 응대 순서로 하나씩 채워가세요.
          </p>
          {HOST_GUIDE_SECTIONS.map((s) => (
            <section key={s.id} id={s.id} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 18, padding: "clamp(18px, 3vw, 26px)", marginTop: 18, scrollMarginTop: 90 }}>
              <h2 style={{ fontSize: 19, fontWeight: 900, color: C.ink, margin: "0 0 10px" }}>{s.title}</h2>
              <div className="pv-prose" style={{ fontSize: 14.5 }} dangerouslySetInnerHTML={{ __html: s.body }} />
            </section>
          ))}
          <div style={{ background: `linear-gradient(120deg, ${C.ink} 30%, #1E1440)`, borderRadius: 20, padding: 24, marginTop: 24, color: "#fff" }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>아직 입점 전이라면</div>
            <div style={{ fontSize: 14, color: C.subDark, marginTop: 6 }}>신청 10분, 검수 2~3일. 입점과 기본 노출은 무료입니다.</div>
            <Link to="/host/apply" className="pv-btn pv-primary" style={{ padding: "12px 22px", borderRadius: 12, fontSize: 14.5, marginTop: 14 }}>공간 등록 신청 <ArrowRight size={15} /></Link>
          </div>
        </div>
      </div>
    </Container>
  );
}

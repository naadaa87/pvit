import React, { useState, useEffect } from "react";
import { Lock, BadgeCheck, Info, CheckCircle2, ChevronRight, AlertCircle, X, Check } from "lucide-react";
import { C } from "../styles/tokens.js";
import { cat1Of } from "../lib/data.js";
import { Link } from "../lib/router.jsx";

export function Container({ children, className = "", style }) {
  return <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`} style={style}>{children}</div>;
}

export function Logo({ dark, size = 21 }) {
  return (
    <Link to="/" className="flex items-center gap-2" style={{ textDecoration: "none" }} aria-label="프빗 홈">
      <span style={{ width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${C.violet}, ${C.violet2})`, boxShadow: "0 6px 14px rgba(109,91,255,.4)" }}>
        <Lock size={17} color="#fff" strokeWidth={2.6} />
      </span>
      <span style={{ fontSize: size, fontWeight: 900, letterSpacing: "-0.02em", color: dark ? "#fff" : C.ink }}>
        PVIT<span style={{ color: C.violet2 }}>.</span>
        <span style={{ fontSize: 13, fontWeight: 700, marginLeft: 6, color: dark ? C.subDark : C.sub }}>프빗</span>
      </span>
    </Link>
  );
}

export function VerifyBadge({ grade, size = "sm" }) {
  const big = size === "lg";
  if (grade === "A" || grade === "B") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: big ? "6px 12px" : "4px 9px", borderRadius: 999, background: "rgba(18,183,106,.12)", color: C.green, fontSize: big ? 13 : 11.5, fontWeight: 800 }}>
        <BadgeCheck size={big ? 15 : 12} /> {grade === "A" ? "호스트 인증" : "공식채널 검증"}
      </span>
    );
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: big ? "6px 12px" : "4px 9px", borderRadius: 999, background: "rgba(255,176,32,.14)", color: "#B57E00", fontSize: big ? 13 : 11.5, fontWeight: 800 }}>
      <Info size={big ? 15 : 12} /> 정보 확인 중
    </span>
  );
}

export function PrivacyTag({ form, dark }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 999, background: dark ? "rgba(255,255,255,.12)" : C.violetSoft, color: dark ? "#fff" : C.violet, fontSize: 12, fontWeight: 800 }}>
      <Lock size={12} /> {form}
    </span>
  );
}

/* 대표 이미지: img 가 있으면 실제 사진, 없으면 카테고리 그라데이션 */
export function SpaceImg({ space, className = "", style = {}, iconSize = 44 }) {
  const meta = cat1Of(space.kind.c1);
  const [err, setErr] = useState(false);
  const showImg = space.img && !err;
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: `linear-gradient(135deg, ${meta.color}, ${C.ink2})`, ...style }}>
      {showImg ? (
        <img src={space.img} alt={`${space.n} 대표 사진`} loading="lazy" onError={() => setErr(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }} aria-hidden="true">
          <meta.Icon size={iconSize} color="rgba(255,255,255,.5)" strokeWidth={1.6} />
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,14,26,0) 45%, rgba(10,14,26,.55) 100%)" }} />
    </div>
  );
}

export function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, left: 0, right: 0, zIndex: 200, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div role="status" className="pv-up" style={{ background: C.ink, color: "#fff", padding: "12px 22px", borderRadius: 999, fontSize: 14, fontWeight: 600, boxShadow: "0 12px 32px rgba(10,14,26,.4)", display: "flex", alignItems: "center", gap: 8, maxWidth: "90vw" }}>
        <CheckCircle2 size={16} color={C.violet2} /> {msg}
      </div>
    </div>
  );
}

export function SectionHead({ eyebrow, title, sub, action, to, query, as = "h2" }) {
  const H = as;
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        {eyebrow && <div style={{ color: C.violet, fontWeight: 800, fontSize: 13, letterSpacing: ".06em", marginBottom: 6 }}>{eyebrow}</div>}
        <H style={{ fontSize: "clamp(20px, 3vw, 27px)", fontWeight: 900, color: C.ink, letterSpacing: "-0.02em", margin: 0 }}>{title}</H>
        {sub && <p style={{ color: C.sub, marginTop: 6, fontSize: 14.5, margin: "6px 0 0" }}>{sub}</p>}
      </div>
      {action && to && (
        <Link to={to} query={query} className="pv-link hidden sm:flex items-center gap-1" style={{ fontSize: 14, flexShrink: 0 }}>
          {action} <ChevronRight size={15} />
        </Link>
      )}
    </div>
  );
}

export function VerifyNotice({ compact }) {
  return (
    <div style={{ background: "linear-gradient(90deg, rgba(255,176,32,.1), rgba(255,176,32,.05))", border: "1px solid rgba(255,176,32,.35)", borderRadius: 14, padding: compact ? "10px 14px" : "14px 18px", display: "flex", gap: 10, alignItems: "flex-start" }}>
      <AlertCircle size={17} color="#B57E00" style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ fontSize: compact ? 12.5 : 13.5, color: "#8A6100", lineHeight: 1.55 }}>
        <b>1차 수집 데이터 검증 진행 중</b> — 현재 목록은 후보 데이터로, 상호·주소·연락처 확인 절차가 진행 중입니다. 지도 버튼은 <b>검색 결과 페이지</b>로 연결되며, 방문 전 운영 여부를 꼭 확인해 주세요. 공간 운영자시라면 <Link to="/host" className="pv-link" style={{ color: "#8A6100" }}>호스트 등록</Link>으로 정보를 인증해 주세요.
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children, width = 520 }) {
  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 180, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }} role="dialog" aria-modal="true" aria-label={title}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(10,14,26,.55)", backdropFilter: "blur(3px)" }} onClick={onClose} />
      <div className="pv-up" style={{ position: "relative", width: `min(${width}px, 100%)`, maxHeight: "90vh", overflowY: "auto", background: "#fff", borderRadius: 22, padding: "22px 22px 24px", boxShadow: "0 30px 80px rgba(10,14,26,.4)" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: C.ink }}>{title}</div>
          <button onClick={onClose} aria-label="닫기" style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={20} color={C.sub} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, required, hint, error, children, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label style={{ display: "block", fontWeight: 800, fontSize: 13.5, color: C.ink, marginBottom: 7 }}>
        {label} {required && <span style={{ color: C.coral }}>*</span>}
        {hint && <span style={{ fontWeight: 500, color: C.sub, fontSize: 12, marginLeft: 6 }}>{hint}</span>}
      </label>
      {children}
      {error && <div style={{ fontSize: 12, color: C.coral, marginTop: 5, fontWeight: 600 }}>{error}</div>}
    </div>
  );
}

export function Switch({ on, onChange, label, desc }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="flex items-center justify-between gap-3 w-full" style={{ background: "#fff", border: `1.5px solid ${on ? C.violet : C.line}`, borderRadius: 13, padding: "12px 14px", cursor: "pointer", textAlign: "left" }} aria-pressed={on}>
      <span>
        <span style={{ display: "block", fontWeight: 800, fontSize: 14, color: C.ink }}>{label}</span>
        {desc && <span style={{ display: "block", fontSize: 12, color: C.sub, marginTop: 2 }}>{desc}</span>}
      </span>
      <span className={`pv-switch ${on ? "on" : ""}`} aria-hidden="true" />
    </button>
  );
}

export function CheckRow({ on, onChange, label, desc, required }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="flex items-start gap-3 w-full" style={{ background: on ? C.violetSoft : "#fff", border: `1.5px solid ${on ? C.violet : C.line}`, borderRadius: 13, padding: "13px 14px", cursor: "pointer", textAlign: "left" }} aria-pressed={on}>
      <span style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${on ? C.violet : "#C9CEDD"}`, background: on ? C.violet : "#fff", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>
        {on && <Check size={14} color="#fff" strokeWidth={3} />}
      </span>
      <span>
        <span style={{ display: "block", fontWeight: 800, fontSize: 14, color: C.ink }}>{label} {required && <span style={{ color: C.coral }}>*</span>}</span>
        {desc && <span style={{ display: "block", fontSize: 12.5, color: C.sub, marginTop: 3, lineHeight: 1.5 }}>{desc}</span>}
      </span>
    </button>
  );
}

export function Steps({ steps, current }) {
  return (
    <div className="flex items-center gap-2" style={{ overflowX: "auto", paddingBottom: 4 }}>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`pv-step ${i === current ? "on" : i < current ? "done" : ""}`} style={{ flexShrink: 0 }}>
            <span className="pv-step-dot">{i < current ? <Check size={13} strokeWidth={3} /> : i + 1}</span>
            <span style={{ fontSize: 13, fontWeight: i === current ? 900 : 600, color: i === current ? C.ink : C.sub, whiteSpace: "nowrap" }}>{s}</span>
          </div>
          {i < steps.length - 1 && <span style={{ width: 18, height: 2, background: i < current ? C.green : C.line, flexShrink: 0 }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

export function Status({ s }) {
  const map = { req: ["요청", "req"], ok: ["확정", "ok"], done: ["이용완료", "done"], cancel: ["취소", "cancel"], review: ["검수 중", "req"], live: ["인증·노출 중", "ok"], fix: ["보완 요청", "hot"], draft: ["임시저장", "cancel"] };
  const [label, cls] = map[s] || [s, "cancel"];
  return <span className={`pv-status ${cls}`}>{label}</span>;
}

export function Breadcrumb({ items }) {
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1.5" style={{ fontSize: 12.5, color: C.sub, marginBottom: 14, flexWrap: "wrap" }}>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight size={12} />}
          {it.to ? <Link to={it.to} query={it.query} style={{ color: C.sub, fontWeight: 600, textDecoration: "none" }}>{it.name}</Link> : <span style={{ color: C.ink, fontWeight: 700 }}>{it.name}</span>}
        </React.Fragment>
      ))}
    </nav>
  );
}

export function Empty({ icon: Icon, title, desc, action, to }) {
  return (
    <div style={{ textAlign: "center", padding: "56px 20px", background: "#fff", borderRadius: 18, border: `1px solid ${C.line}` }}>
      {Icon && <Icon size={34} color={C.sub} style={{ margin: "0 auto 12px" }} />}
      <div style={{ fontWeight: 800, fontSize: 16.5, color: C.ink }}>{title}</div>
      {desc && <div style={{ fontSize: 14, color: C.sub, marginTop: 6 }}>{desc}</div>}
      {action && to && <Link to={to} className="pv-btn pv-ghost" style={{ padding: "10px 20px", borderRadius: 11, fontSize: 13.5, marginTop: 14 }}>{action}</Link>}
    </div>
  );
}

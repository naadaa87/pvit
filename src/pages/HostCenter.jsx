import React, { useState, useEffect, useMemo } from "react";
import { LayoutDashboard, Building2, CalendarDays, Wallet, Megaphone, MessageSquare, Settings, LogOut, CheckCircle2, XCircle, Clock, ChevronRight, Eye, Phone, Users, Info, ArrowRight, Send, Plus, Flame, BadgeCheck, Star, ExternalLink, Bell, Camera } from "lucide-react";
import { C } from "../styles/tokens.js";
import { Link, useRoute } from "../lib/router.jsx";
import { useApp } from "../lib/app-context.jsx";
import { useSEO } from "../lib/seo.jsx";
import { Container, Field, Status, Switch, Empty } from "../components/ui.jsx";
import { load, save, remove, demoHostState, makeRef, postApi } from "../lib/store.js";
import { AMENITIES, CANCEL_POLICIES } from "../content/host.js";

const TABS = [
  ["dashboard", "대시보드", LayoutDashboard],
  ["spaces", "내 공간", Building2],
  ["bookings", "예약 관리", CalendarDays],
  ["settlement", "정산", Wallet],
  ["deals", "핫딜·프로모션", Megaphone],
  ["inbox", "문의·후기", MessageSquare],
  ["settings", "설정", Settings],
];

const won = (n) => (n || 0).toLocaleString("ko-KR") + "원";

/* ---------- 로그인 게이트 ---------- */
function Gate({ onLogin }) {
  const [email, setEmail] = useState("");
  const [ref, setRef] = useState("");
  const [err, setErr] = useState("");
  const apps = load("applications", []);
  const tryLogin = () => {
    const a = apps.find((x) => x.basic?.email?.toLowerCase() === email.trim().toLowerCase() && (!ref || x.ref === ref.trim().toUpperCase()));
    if (a) onLogin({ email: a.basic.email, name: a.basic.owner, spaceName: a.basic.name, ref: a.ref, since: a.createdAt });
    else if (!email.trim()) setErr("이메일을 입력해 주세요");
    else setErr("이 기기에서 접수된 신청 내역을 찾지 못했어요. 접수번호를 확인하거나 데모로 둘러보세요.");
  };
  return (
    <Container className="py-14">
      <div style={{ maxWidth: 460, margin: "0 auto", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 24, padding: "34px 28px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, background: C.violetSoft, color: C.violet, fontSize: 12, fontWeight: 800 }}><LayoutDashboard size={12} /> HOST CENTER</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: C.ink, margin: "12px 0 6px" }}>호스트 센터</h1>
        <p style={{ fontSize: 14, color: C.sub, lineHeight: 1.6 }}>입점 신청 시 입력한 이메일과 접수번호로 들어오세요. 정식 로그인(비밀번호·소셜 로그인)은 계정 시스템 오픈 시 연결됩니다.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
          <Field label="이메일"><input className="pv-input" placeholder="host@example.com" value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" /></Field>
          <Field label="접수번호" hint="PV-로 시작"><input className="pv-input" placeholder="PV-20261107-AB12" value={ref} onChange={(e) => setRef(e.target.value)} /></Field>
          {err && <div style={{ fontSize: 13, color: C.coral, fontWeight: 700 }}>{err}</div>}
          <button className="pv-btn pv-primary" style={{ padding: 13, borderRadius: 12, fontSize: 15 }} onClick={tryLogin}>들어가기 <ArrowRight size={15} /></button>
          <button className="pv-btn pv-ghost" style={{ padding: 13, borderRadius: 12, fontSize: 14.5 }} onClick={() => onLogin({ email: "demo@pvit.kr", name: "데모 호스트", spaceName: "프라이빗 파티룸 (데모)", ref: "DEMO", since: new Date().toISOString(), demo: true })}>데모로 둘러보기</button>
        </div>
        <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 18, paddingTop: 14, fontSize: 13, color: C.sub }}>
          아직 입점 전이라면 <Link to="/host/apply" className="pv-link">공간 등록 신청</Link> 부터 진행해 주세요.
        </div>
      </div>
    </Container>
  );
}

/* ---------- 호스트 센터 본체 ---------- */
export function HostCenterPage() {
  const { hostSession, setHostSession, notify } = useApp();
  const { query, navigate } = useRoute();
  const tab = TABS.find((t) => t[0] === query.tab) ? query.tab : "dashboard";
  const [st, setSt] = useState(null);

  useSEO({ title: "호스트 센터", description: "예약 관리, 공간 정보, 정산, 핫딜 신청, 고객 문의를 한곳에서 관리하는 프빗 호스트 센터.", path: "/host/center", noindex: true });

  useEffect(() => {
    if (!hostSession) return;
    const saved = load("host-state", null);
    const base = saved && saved.host?.email === hostSession.email ? saved : demoHostState(hostSession.spaceName);
    base.host = { ...base.host, ...hostSession };
    // 이 기기에서 고객이 보낸 예약 요청을 합친다 (한 기기 데모 흐름)
    const reqs = load("bookings", []).filter((b) => !base.bookings.find((x) => x.id === b.ref));
    reqs.forEach((b) => base.bookings.unshift({ id: b.ref, space: b.spaceName, who: b.name, phone: b.phone, when: `${b.date} ${b.start}`, hours: Number(b.hours), people: Number(b.people), purpose: b.purpose, status: b.status || "req", memo: b.memo, amount: 0, fromSite: true }));
    // 입점 신청 내역 → 내 공간
    const apps = load("applications", []).filter((a) => a.basic?.email === hostSession.email);
    apps.forEach((a) => {
      if (!base.spaces.find((s) => s.id === a.ref)) base.spaces.unshift({ id: a.ref, name: a.basic.name, c1: a.space.c1, c3: a.space.c3, status: "review", step: 1, sido: a.basic.addr.split(" ")[0], gu: a.basic.addr.split(" ")[1] || "", photos: a.photoCount || 0, priceNote: a.price.base, open: true, app: a });
    });
    if (apps.length && base.spaces.length > apps.length && base.spaces.some((s) => s.id === "H-001") && !hostSession.demo) base.spaces = base.spaces.filter((s) => s.id !== "H-001");
    setSt(base);
  }, [hostSession]);

  useEffect(() => { if (st) save("host-state", st); }, [st]);

  if (!hostSession) return <Gate onLogin={(s) => { setHostSession(s); notify(`${s.name}님, 환영합니다`); }} />;
  if (!st) return null;

  const upd = (patch) => setSt((p) => ({ ...p, ...patch }));
  const setBooking = (id, status) => {
    upd({ bookings: st.bookings.map((b) => (b.id === id ? { ...b, status } : b)) });
    const site = load("bookings", []);
    save("bookings", site.map((b) => (b.ref === id ? { ...b, status } : b)));
    notify(status === "ok" ? "예약을 확정했어요. 고객에게 안내가 전송됩니다." : status === "cancel" ? "예약을 취소했어요." : "이용 완료 처리했어요.");
  };
  const logout = () => { setHostSession(null); remove("host-state"); navigate("/host"); };
  const go = (t) => navigate({ path: "/host/center", query: { tab: t } });

  const counts = {
    req: st.bookings.filter((b) => b.status === "req").length,
    today: st.bookings.filter((b) => b.status === "ok").length,
    inbox: st.inquiries.filter((q) => !q.reply).length,
  };

  return (
    <Container className="py-6">
      <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.violet }}>HOST CENTER{hostSession.demo && " · 데모 모드"}</div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: C.ink, margin: "2px 0 0" }}>{hostSession.name}님의 호스트 센터</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/host/guide" className="pv-btn pv-ghost" style={{ padding: "9px 14px", borderRadius: 11, fontSize: 13 }}>운영 가이드</Link>
          <button className="pv-btn pv-ghost" style={{ padding: "9px 14px", borderRadius: 11, fontSize: 13 }} onClick={logout}><LogOut size={14} /> 나가기</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <nav className="lg:col-span-1 flex lg:flex-col gap-1" style={{ overflowX: "auto", paddingBottom: 4 }} aria-label="호스트 센터 메뉴">
          {TABS.map(([id, label, I]) => (
            <button key={id} onClick={() => go(id)} className="pv-btn" style={{ justifyContent: "flex-start", background: tab === id ? C.ink : "#fff", color: tab === id ? "#fff" : C.text, border: `1px solid ${tab === id ? C.ink : C.line}`, padding: "11px 14px", borderRadius: 12, fontSize: 14, flexShrink: 0, position: "relative" }}>
              <I size={16} /> {label}
              {id === "bookings" && counts.req > 0 && <span style={{ marginLeft: "auto", background: C.coral, color: "#fff", fontSize: 11, fontWeight: 900, padding: "2px 7px", borderRadius: 999 }}>{counts.req}</span>}
              {id === "inbox" && counts.inbox > 0 && <span style={{ marginLeft: "auto", background: C.amber, color: "#fff", fontSize: 11, fontWeight: 900, padding: "2px 7px", borderRadius: 999 }}>{counts.inbox}</span>}
            </button>
          ))}
        </nav>
        <div className="lg:col-span-4">
          {tab === "dashboard" && <Dashboard st={st} counts={counts} go={go} setBooking={setBooking} />}
          {tab === "spaces" && <Spaces st={st} upd={upd} notify={notify} />}
          {tab === "bookings" && <Bookings st={st} setBooking={setBooking} />}
          {tab === "settlement" && <Settlement st={st} />}
          {tab === "deals" && <Deals st={st} upd={upd} notify={notify} />}
          {tab === "inbox" && <Inbox st={st} upd={upd} notify={notify} />}
          {tab === "settings" && <SettingsTab st={st} upd={upd} notify={notify} logout={logout} />}
        </div>
      </div>
    </Container>
  );
}

const Card = ({ title, children, action, style }) => (
  <section style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 18, padding: 20, ...style }}>
    {title && <div className="flex items-center justify-between" style={{ marginBottom: 12 }}><h2 style={{ fontSize: 16, fontWeight: 900, color: C.ink, margin: 0 }}>{title}</h2>{action}</div>}
    {children}
  </section>
);

const Stat = ({ label, value, sub, color = C.ink }) => (
  <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: "16px 18px" }}>
    <div style={{ fontSize: 12, color: C.sub, fontWeight: 700 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 900, color, marginTop: 4, letterSpacing: "-0.02em" }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{sub}</div>}
  </div>
);

/* ---------- 대시보드 ---------- */
function Dashboard({ st, counts, go, setBooking }) {
  const sp = st.spaces[0];
  const steps = ["신청 접수", "검수 중", "인증·노출"];
  const pending = st.bookings.filter((b) => b.status === "req").slice(0, 3);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="확인 대기 예약" value={counts.req} sub="1시간 내 응답 권장" color={counts.req ? C.coral : C.ink} />
        <Stat label="확정 예약" value={counts.today} sub="이용 예정" />
        <Stat label="미답변 문의" value={counts.inbox} sub="고객이 기다리고 있어요" color={counts.inbox ? "#B57E00" : C.ink} />
        <Stat label="등록 공간" value={st.spaces.length} sub={sp ? (sp.status === "live" ? "노출 중" : "검수 진행 중") : "-"} />
      </div>

      {sp && (
        <Card title="공간 상태" action={<button className="pv-link" style={{ fontSize: 13 }} onClick={() => go("spaces")}>내 공간 <ChevronRight size={13} style={{ display: "inline" }} /></button>}>
          <div className="flex items-center gap-3 flex-wrap">
            <div style={{ fontWeight: 900, fontSize: 16, color: C.ink }}>{sp.name}</div>
            <Status s={sp.status} />
            <span style={{ fontSize: 13, color: C.sub }}>{sp.c1}{sp.c3 ? " · " + sp.c3 : ""} · {sp.sido} {sp.gu}</span>
          </div>
          <div className="flex items-center gap-2" style={{ marginTop: 14 }}>
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                  <span style={{ width: 24, height: 24, borderRadius: 999, display: "grid", placeItems: "center", background: i <= sp.step ? C.violet : C.line, color: i <= sp.step ? "#fff" : C.sub, fontSize: 11, fontWeight: 900 }}>{i < sp.step ? "✓" : i + 1}</span>
                  <span style={{ fontSize: 13, fontWeight: i === sp.step ? 900 : 600, color: i === sp.step ? C.ink : C.sub }}>{s}</span>
                </div>
                {i < steps.length - 1 && <span style={{ flex: 1, height: 2, background: i < sp.step ? C.violet : C.line, minWidth: 16 }} />}
              </React.Fragment>
            ))}
          </div>
          <div style={{ background: C.bg, borderRadius: 12, padding: "12px 14px", fontSize: 13, color: C.sub, marginTop: 14, lineHeight: 1.6 }}>
            {sp.status === "live" ? "검수를 통과해 '호스트 인증' 뱃지와 함께 노출 중입니다." : "검수 담당자가 상호·주소·지도 URL·연락처 일치 여부를 확인하고 있습니다. 영업일 2~3일 안에 결과를 안내드려요. 그동안 사진과 요금표를 채워두면 승인 즉시 노출됩니다."}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="확인이 필요한 예약 요청" action={<button className="pv-link" style={{ fontSize: 13 }} onClick={() => go("bookings")}>전체 <ChevronRight size={13} style={{ display: "inline" }} /></button>}>
          {pending.length ? pending.map((b) => (
            <div key={b.id} style={{ padding: "10px 0", borderBottom: `1px solid ${C.line}` }}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>{b.when} · {b.hours}시간 · {b.people}명</div>
                  <div style={{ fontSize: 12.5, color: C.sub, marginTop: 2 }}>{b.who} · {b.purpose}{b.memo ? ` · "${b.memo}"` : ""}</div>
                </div>
                <div className="flex gap-1">
                  <button className="pv-btn pv-primary" style={{ padding: "7px 11px", borderRadius: 9, fontSize: 12 }} onClick={() => setBooking(b.id, "ok")}>확정</button>
                  <button className="pv-btn pv-ghost" style={{ padding: "7px 11px", borderRadius: 9, fontSize: 12 }} onClick={() => setBooking(b.id, "cancel")}>거절</button>
                </div>
              </div>
            </div>
          )) : <div style={{ fontSize: 13.5, color: C.sub, padding: "10px 0" }}>대기 중인 요청이 없어요.</div>}
        </Card>
        <Card title="할 일">
          {st.notes.todo.map((t, i) => (
            <div key={i} className="flex items-center gap-2" style={{ padding: "9px 0", borderBottom: `1px solid ${C.line}`, fontSize: 14, color: C.text }}>
              <span style={{ width: 18, height: 18, borderRadius: 6, border: `2px solid ${C.line}`, flexShrink: 0 }} /> {t}
            </div>
          ))}
          <Link to="/host/guide" className="pv-link flex items-center gap-1" style={{ fontSize: 13, marginTop: 10 }}>운영 가이드에서 자세히 <ArrowRight size={13} /></Link>
        </Card>
      </div>
    </div>
  );
}

/* ---------- 내 공간 ---------- */
function Spaces({ st, upd, notify }) {
  const [editing, setEditing] = useState(null);
  const [req, setReq] = useState({ field: "요금·운영시간", text: "" });
  const sp = st.spaces.find((s) => s.id === editing);
  const sendFix = async () => {
    if (!req.text.trim()) { notify("수정 내용을 적어주세요"); return; }
    await postApi("/api/contact", { type: "fix", spaceId: editing, ...req, email: st.host.email, createdAt: new Date().toISOString() });
    notify("수정 요청을 보냈어요. 확인 후 반영됩니다.");
    setReq({ field: "요금·운영시간", text: "" }); setEditing(null);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {st.spaces.map((s) => (
        <Card key={s.id}>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap"><span style={{ fontWeight: 900, fontSize: 17, color: C.ink }}>{s.name}</span><Status s={s.status} /></div>
              <div style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>{s.c1}{s.c3 ? " · " + s.c3 : ""} · {s.sido} {s.gu} · 접수번호 {s.id}</div>
              <div className="flex items-center gap-3 flex-wrap" style={{ fontSize: 12.5, color: C.sub, marginTop: 8 }}>
                <span className="flex items-center gap-1"><Camera size={12} /> 사진 {s.photos}장 {s.photos < 6 && <span style={{ color: "#B57E00", fontWeight: 700 }}>(6장 이상 권장)</span>}</span>
                <span className="flex items-center gap-1"><Wallet size={12} /> {s.priceNote || "요금표 미등록"}</span>
                <span className="flex items-center gap-1"><Eye size={12} /> 노출 {s.open ? "ON" : "OFF"}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="pv-btn pv-ghost" style={{ padding: "9px 13px", borderRadius: 10, fontSize: 13 }} onClick={() => notify("사진 업로드 링크를 등록 이메일로 보내드렸어요 (데모)")}><Camera size={13} /> 사진 등록</button>
              <button className="pv-btn pv-ghost" style={{ padding: "9px 13px", borderRadius: 10, fontSize: 13 }} onClick={() => setEditing(editing === s.id ? null : s.id)}>정보 수정 요청</button>
            </div>
          </div>
          {s.app && (
            <div style={{ marginTop: 14, background: C.bg, borderRadius: 12, padding: 14, fontSize: 13, color: C.text, lineHeight: 1.7 }}>
              <b>등록 내용 요약</b> — 인원 {s.app.space.minPeople}~{s.app.space.maxPeople}명 · 운영 {s.app.space.open}~{s.app.space.close} · 취소정책 {CANCEL_POLICIES.find((p) => p.id === s.app.price.cancel)?.name}<br />
              시설: {Object.entries(s.app.space.amenities || {}).filter(([, v]) => v).map(([k]) => AMENITIES.find((a) => a[0] === k)?.[1]).join(", ") || "-"}<br />
              프라이빗: {s.app.space.privacyDesc}
            </div>
          )}
          {editing === s.id && (
            <div className="pv-up" style={{ marginTop: 14, borderTop: `1px solid ${C.line}`, paddingTop: 14 }}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="수정 항목">
                  <select className="pv-select" value={req.field} onChange={(e) => setReq({ ...req, field: e.target.value })}>
                    {["요금·운영시간", "전화번호·채널 링크", "소개·시설", "주소·위치", "프라이빗 이용 방식", "기타"].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="수정 내용" full><input className="pv-input" placeholder="변경할 내용을 적어주세요" value={req.text} onChange={(e) => setReq({ ...req, text: e.target.value })} /></Field>
              </div>
              <div className="flex justify-end gap-2" style={{ marginTop: 10 }}>
                <button className="pv-btn pv-ghost" style={{ padding: "9px 14px", borderRadius: 10, fontSize: 13 }} onClick={() => setEditing(null)}>취소</button>
                <button className="pv-btn pv-primary" style={{ padding: "9px 14px", borderRadius: 10, fontSize: 13 }} onClick={sendFix}><Send size={13} /> 요청 보내기</button>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between" style={{ marginTop: 14, borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
            <span style={{ fontSize: 13, color: C.sub }}>노출 상태</span>
            <button className={`pv-switch ${s.open ? "on" : ""}`} aria-label="노출 토글" onClick={() => { upd({ spaces: st.spaces.map((x) => (x.id === s.id ? { ...x, open: !x.open } : x)) }); notify(s.open ? "노출을 껐어요 (휴업)" : "노출을 켰어요"); }} />
          </div>
        </Card>
      ))}
      <Link to="/host/apply" className="pv-btn pv-ghost" style={{ padding: 14, borderRadius: 14, fontSize: 14.5, borderStyle: "dashed" }}><Plus size={15} /> 다른 지점·공간 추가 등록</Link>
    </div>
  );
}

/* ---------- 예약 관리 ---------- */
function Bookings({ st, setBooking }) {
  const [filter, setFilter] = useState("all");
  const [sel, setSel] = useState(null);
  const list = st.bookings.filter((b) => filter === "all" || b.status === filter);
  const b = st.bookings.find((x) => x.id === sel);
  const week = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) { const d = new Date(now); d.setDate(now.getDate() + i); days.push(d); }
    return days;
  }, []);
  const onDay = (d) => st.bookings.filter((x) => x.status !== "cancel" && x.when.startsWith(`${d.getMonth() + 1}/${d.getDate()} `) || x.when.startsWith(`${d.toISOString().slice(0, 10)} `));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card title="이번 주">
        <div className="grid grid-cols-7 gap-1.5">
          {week.map((d, i) => {
            const items = onDay(d);
            return (
              <div key={i} style={{ background: i === 0 ? C.violetSoft : C.bg, borderRadius: 10, padding: "8px 6px", minHeight: 74, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: C.sub, fontWeight: 700 }}>{["일", "월", "화", "수", "목", "금", "토"][d.getDay()]}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: i === 0 ? C.violet : C.ink }}>{d.getDate()}</div>
                {items.slice(0, 2).map((x) => <div key={x.id} style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: x.status === "ok" ? C.green : C.amber, borderRadius: 6, padding: "2px 4px", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.when.split(" ")[1]}</div>)}
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 12, color: C.sub, marginTop: 8 }}>초록 = 확정, 노랑 = 확인 대기. 월간 캘린더·외부 예약 동기화(네이버예약)는 다음 버전에 열립니다.</div>
      </Card>

      <Card title="예약 목록" action={
        <div className="flex gap-1">
          {[["all", "전체"], ["req", "요청"], ["ok", "확정"], ["done", "완료"], ["cancel", "취소"]].map(([v, l]) => (
            <button key={v} className={`pv-chip ${filter === v ? "on" : ""}`} style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
      }>
        {list.length === 0 ? <div style={{ fontSize: 13.5, color: C.sub, padding: "10px 0" }}>해당 상태의 예약이 없어요.</div> : (
          <div style={{ overflowX: "auto" }}>
            <table className="pv-table">
              <thead><tr><th>일시</th><th>고객</th><th>인원·목적</th><th>상태</th><th>금액</th><th></th></tr></thead>
              <tbody>
                {list.map((x) => (
                  <tr key={x.id} style={{ cursor: "pointer" }} onClick={() => setSel(x.id)}>
                    <td style={{ fontWeight: 800 }}>{x.when}<div style={{ fontSize: 11.5, color: C.sub, fontWeight: 500 }}>{x.hours}시간{x.fromSite && " · 프빗 요청"}</div></td>
                    <td>{x.who}<div style={{ fontSize: 11.5, color: C.sub }}>{x.phone}</div></td>
                    <td>{x.people}명 · {x.purpose}</td>
                    <td><Status s={x.status} /></td>
                    <td>{x.amount ? won(x.amount) : <span style={{ color: C.sub }}>미정</span>}</td>
                    <td><ChevronRight size={14} color={C.sub} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {b && (
        <Card title={`예약 ${b.id}`} action={<button className="pv-link" style={{ fontSize: 13 }} onClick={() => setSel(null)}>닫기</button>}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ fontSize: 13.5 }}>
            {[["일시", `${b.when} (${b.hours}시간)`], ["고객", `${b.who} · ${b.phone}`], ["인원·목적", `${b.people}명 · ${b.purpose}`], ["상태", <Status s={b.status} />]].map(([k, v]) => (
              <div key={k}><div style={{ fontSize: 11.5, color: C.sub, fontWeight: 700 }}>{k}</div><div style={{ color: C.ink, fontWeight: 700, marginTop: 2 }}>{v}</div></div>
            ))}
          </div>
          {b.memo && <div style={{ background: C.bg, borderRadius: 10, padding: "10px 12px", fontSize: 13.5, color: C.text, marginTop: 12 }}>요청사항: {b.memo}</div>}
          <div style={{ fontSize: 12.5, color: C.sub, marginTop: 12, lineHeight: 1.6 }}>
            <b style={{ color: C.ink }}>진행 흐름</b> — 요청 → 확정(고객에게 입금·결제 안내) → 이용 완료 → 정산. 자체 결제 오픈 전까지 결제는 호스트의 기존 방식(계좌·현장·네이버예약)으로 안내해 주세요.
          </div>
          <div className="flex gap-2 flex-wrap" style={{ marginTop: 14 }}>
            {b.status === "req" && <><button className="pv-btn pv-primary" style={{ padding: "10px 16px", borderRadius: 10, fontSize: 13.5 }} onClick={() => setBooking(b.id, "ok")}><CheckCircle2 size={14} /> 확정</button><button className="pv-btn pv-ghost" style={{ padding: "10px 16px", borderRadius: 10, fontSize: 13.5 }} onClick={() => setBooking(b.id, "cancel")}><XCircle size={14} /> 거절</button></>}
            {b.status === "ok" && <><button className="pv-btn pv-primary" style={{ padding: "10px 16px", borderRadius: 10, fontSize: 13.5 }} onClick={() => setBooking(b.id, "done")}><CheckCircle2 size={14} /> 이용 완료</button><button className="pv-btn pv-ghost" style={{ padding: "10px 16px", borderRadius: 10, fontSize: 13.5 }} onClick={() => setBooking(b.id, "cancel")}>취소</button></>}
            <a href={`tel:${b.phone.replace(/[^0-9]/g, "")}`} className="pv-btn pv-ghost" style={{ padding: "10px 16px", borderRadius: 10, fontSize: 13.5 }}><Phone size={14} /> 고객에게 전화</a>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ---------- 정산 ---------- */
function Settlement({ st }) {
  const done = st.bookings.filter((b) => b.status === "done");
  const total = done.reduce((a, b) => a + (b.amount || 0), 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: "linear-gradient(90deg, rgba(109,91,255,.1), rgba(109,91,255,.04))", border: `1px solid rgba(109,91,255,.3)`, borderRadius: 14, padding: "12px 16px", fontSize: 13.5, color: C.violet, display: "flex", gap: 8 }}>
        <Info size={16} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>현재는 호스트의 기존 결제 방식(계좌·현장·네이버예약)을 그대로 씁니다. 프빗 자체 결제·정산은 준비 중이며, 수수료율은 오픈 전 호스트에게 먼저 안내하고 동의를 받은 뒤 적용합니다. 아래 금액은 호스트가 입력한 참고값입니다.</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="이용 완료 건수" value={done.length} sub="정산 대상" />
        <Stat label="이용 완료 금액 (참고)" value={won(total)} sub="호스트 입력값 합계" />
        <Stat label="정산 주기" value="주 1회" sub="자체 결제 오픈 시" />
        <Stat label="정산 계좌" value={st.host.bank ? "등록됨" : "미등록"} sub="설정에서 등록" color={st.host.bank ? C.green : "#B57E00"} />
      </div>
      <Card title="정산 구조 (자체 결제 오픈 시)">
        <div className="pv-prose" style={{ fontSize: 14 }}>
          <ol>
            <li>고객 결제(카드·간편결제) → 프빗이 예약금 보관</li>
            <li>이용 완료 자동 처리(이용 종료 시각 기준) → 분쟁 없으면 정산 확정</li>
            <li>매주 지정 요일, 수수료 차감 후 등록 계좌로 입금</li>
            <li>세금계산서·현금영수증 자동 발행, 월별 정산서 다운로드</li>
          </ol>
          <p>취소·환불은 입점 시 선택한 정책(유연/표준/엄격)에 따라 자동 계산됩니다. 노쇼 보호(예약금 일부 호스트 귀속)도 함께 제공할 예정입니다.</p>
        </div>
      </Card>
      <Card title="이용 완료 내역">
        {done.length === 0 ? <div style={{ fontSize: 13.5, color: C.sub }}>아직 완료된 이용이 없어요.</div> : (
          <table className="pv-table">
            <thead><tr><th>일시</th><th>고객</th><th>인원</th><th>금액</th><th>상태</th></tr></thead>
            <tbody>{done.map((b) => <tr key={b.id}><td>{b.when}</td><td>{b.who}</td><td>{b.people}명</td><td>{b.amount ? won(b.amount) : "-"}</td><td><Status s="done" /></td></tr>)}</tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

/* ---------- 핫딜·프로모션 ---------- */
function Deals({ st, upd, notify }) {
  const [f, setF] = useState({ kind: "타임딜", from: "", to: "", days: "평일", time: "10:00~17:00", original: "", sale: "", qty: 5, memo: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const rate = f.original && f.sale ? Math.round((1 - Number(f.sale) / Number(f.original)) * 100) : null;
  const submit = async () => {
    if (!f.from || !f.to || !f.original || !f.sale) { notify("기간과 원가·할인가를 입력해 주세요"); return; }
    const d = { id: makeRef("HD"), ...f, rate, status: "review", createdAt: new Date().toISOString() };
    await postApi("/api/contact", { type: "deal", email: st.host.email, ...d });
    upd({ deals: [d, ...st.deals] });
    notify("핫딜 신청을 보냈어요. 검토 후 핫딜 페이지에 노출됩니다.");
    setF({ ...f, from: "", to: "", original: "", sale: "", memo: "" });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          [Flame, "타임딜·핫딜", "비는 시간(평일 낮·당일)을 할인가로 채웁니다. 원가·할인가·수량이 핫딜 페이지에 표시됩니다.", "아래에서 신청"],
          [Star, "노출 부스트", "지역·카테고리 상단 고정, 메인 추천 섹션 노출. 정식 오픈 시 금액 공지, 사전 신청 호스트 우대.", "관심 등록"],
          [BadgeCheck, "프빗 인증 프로그램", "현장 확인 후 'PVIT 추천' 뱃지. 프라이빗 구조 인증 리포트 제공.", "관심 등록"],
        ].map(([I, t, d, cta]) => (
          <div key={t} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: 18 }}>
            <I size={20} color={C.coral} />
            <div style={{ fontWeight: 900, fontSize: 15, color: C.ink, marginTop: 8 }}>{t}</div>
            <div style={{ fontSize: 12.5, color: C.sub, marginTop: 4, lineHeight: 1.55 }}>{d}</div>
            {cta === "관심 등록" && <button className="pv-btn pv-ghost" style={{ padding: "8px 12px", borderRadius: 9, fontSize: 12.5, marginTop: 10 }} onClick={async () => { await postApi("/api/contact", { type: "interest", product: t, email: st.host.email }); notify(`'${t}' 관심 등록 완료. 오픈 시 먼저 안내드려요.`); }}>{cta}</button>}
          </div>
        ))}
      </div>
      <Card title="핫딜 신청">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="종류"><select className="pv-select" value={f.kind} onChange={set("kind")}>{["타임딜", "평일 특가", "당일 예약 할인", "오픈 기념", "기간 한정"].map((o) => <option key={o}>{o}</option>)}</select></Field>
          <Field label="적용 요일·시간"><div className="flex gap-2"><select className="pv-select" value={f.days} onChange={set("days")}>{["평일", "주말", "매일"].map((o) => <option key={o}>{o}</option>)}</select><input className="pv-input" value={f.time} onChange={set("time")} placeholder="10:00~17:00" /></div></Field>
          <Field label="시작일" required><input type="date" className="pv-input" value={f.from} onChange={set("from")} /></Field>
          <Field label="종료일" required><input type="date" className="pv-input" value={f.to} onChange={set("to")} /></Field>
          <Field label="정상가 (원)" required><input type="number" className="pv-input" value={f.original} onChange={set("original")} placeholder="예: 60000" /></Field>
          <Field label="할인가 (원)" required><input type="number" className="pv-input" value={f.sale} onChange={set("sale")} placeholder="예: 39000" /></Field>
          <Field label="수량 (건)"><input type="number" min={1} className="pv-input" value={f.qty} onChange={set("qty")} /></Field>
          <Field label="할인율"><div className="pv-input" style={{ background: C.bg, fontWeight: 900, color: rate ? C.coral : C.sub }}>{rate !== null ? `${rate}% 할인` : "원가·할인가 입력 시 계산"}</div></Field>
          <Field label="조건·메모" full><input className="pv-input" value={f.memo} onChange={set("memo")} placeholder="예: 2시간 기준, 추가 시간 정상가" /></Field>
        </div>
        <button className="pv-btn pv-deal" style={{ padding: 13, borderRadius: 12, fontSize: 14.5, marginTop: 14 }} onClick={submit}><Flame size={15} /> 핫딜 신청 보내기</button>
      </Card>
      {st.deals.length > 0 && (
        <Card title="신청 내역">
          <table className="pv-table">
            <thead><tr><th>종류</th><th>기간</th><th>가격</th><th>수량</th><th>상태</th></tr></thead>
            <tbody>{st.deals.map((d) => <tr key={d.id}><td>{d.kind}<div style={{ fontSize: 11.5, color: C.sub }}>{d.days} {d.time}</div></td><td>{d.from} ~ {d.to}</td><td><s style={{ color: C.sub }}>{won(Number(d.original))}</s> → <b>{won(Number(d.sale))}</b> <span style={{ color: C.coral, fontWeight: 800 }}>{d.rate}%</span></td><td>{d.qty}건</td><td><Status s="review" /></td></tr>)}</tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

/* ---------- 문의·후기 ---------- */
function Inbox({ st, upd, notify }) {
  const [reply, setReply] = useState({});
  const send = (id) => {
    const text = (reply[id] || "").trim();
    if (!text) return;
    upd({ inquiries: st.inquiries.map((q) => (q.id === id ? { ...q, reply: text } : q)) });
    setReply({ ...reply, [id]: "" });
    notify("답변을 보냈어요. 고객에게 알림이 갑니다.");
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card title="고객 문의">
        {st.inquiries.map((q) => (
          <div key={q.id} style={{ padding: "12px 0", borderBottom: `1px solid ${C.line}` }}>
            <div className="flex items-center justify-between"><span style={{ fontWeight: 800, fontSize: 13.5, color: C.ink }}>{q.who}</span><span style={{ fontSize: 12, color: C.sub }}>{q.at}</span></div>
            <div style={{ fontSize: 14, color: C.text, marginTop: 4 }}>{q.text}</div>
            {q.reply ? (
              <div style={{ background: C.violetSoft, borderRadius: 10, padding: "9px 12px", fontSize: 13.5, color: C.violet, marginTop: 8 }}><b>답변</b> · {q.reply}</div>
            ) : (
              <div className="flex gap-2" style={{ marginTop: 8 }}>
                <input className="pv-input" placeholder="답변을 입력하세요 (1시간 내 응답 권장)" value={reply[q.id] || ""} onChange={(e) => setReply({ ...reply, [q.id]: e.target.value })} onKeyDown={(e) => e.key === "Enter" && send(q.id)} />
                <button className="pv-btn pv-primary" style={{ padding: "0 16px", borderRadius: 11, flexShrink: 0 }} onClick={() => send(q.id)} aria-label="답변 보내기"><Send size={14} /></button>
              </div>
            )}
          </div>
        ))}
      </Card>
      <Card title="후기">
        {st.reviews.length === 0 ? (
          <div style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.6 }}>아직 후기가 없어요. 이용 완료 후 2~3시간 안에 후기 요청 메시지를 보내면 응답률이 가장 높습니다. 후기에는 꼭 답글을 남겨주세요 — 다음 고객은 호스트의 답글을 보고 판단합니다.</div>
        ) : st.reviews.map((r) => <div key={r.id}>{r.text}</div>)}
      </Card>
    </div>
  );
}

/* ---------- 설정 ---------- */
function SettingsTab({ st, upd, notify, logout }) {
  const h = st.host;
  const set = (k) => (e) => upd({ host: { ...h, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value } });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card title="계정">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="이름"><input className="pv-input" value={h.name || ""} onChange={set("name")} /></Field>
          <Field label="이메일 (로그인 ID)"><input className="pv-input" value={h.email || ""} readOnly style={{ background: C.bg }} /></Field>
          <Field label="연락처"><input className="pv-input" value={h.phone || ""} onChange={set("phone")} placeholder="010-0000-0000" /></Field>
          <Field label="정산 계좌" hint="자체 결제 오픈 대비"><input className="pv-input" value={h.bank || ""} onChange={set("bank")} placeholder="은행 · 계좌번호 · 예금주" /></Field>
        </div>
        <button className="pv-btn pv-primary" style={{ padding: "10px 18px", borderRadius: 10, fontSize: 13.5, marginTop: 12 }} onClick={() => notify("저장했어요")}>저장</button>
      </Card>
      <Card title="알림">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Switch on={h.notifBooking !== false} onChange={(v) => upd({ host: { ...h, notifBooking: v } })} label="예약 요청 알림" desc="문자·이메일로 즉시 받기" />
          <Switch on={h.notifInquiry !== false} onChange={(v) => upd({ host: { ...h, notifInquiry: v } })} label="고객 문의 알림" />
          <Switch on={h.autoConfirm === true} onChange={(v) => upd({ host: { ...h, autoConfirm: v } })} label="예약 자동 확정" desc="빈 시간대 요청을 자동으로 확정 (자체 결제 오픈 시 활성화)" />
          <Switch on={h.notifNews !== false} onChange={(v) => upd({ host: { ...h, notifNews: v } })} label="핫딜·상품 소식" desc="유료 상품 오픈, 운영 팁" />
        </div>
      </Card>
      <Card title="운영 상태">
        <div className="flex items-center justify-between">
          <div><div style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>전체 공간 노출</div><div style={{ fontSize: 12.5, color: C.sub }}>휴업·리모델링 시 끄면 모든 공간이 고객 화면에서 내려갑니다</div></div>
          <button className={`pv-switch ${st.spaces.every((s) => s.open) ? "on" : ""}`} aria-label="전체 노출" onClick={() => { const on = !st.spaces.every((s) => s.open); upd({ spaces: st.spaces.map((s) => ({ ...s, open: on })) }); notify(on ? "전체 노출 ON" : "전체 노출 OFF"); }} />
        </div>
      </Card>
      <Card title="탈퇴">
        <div style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.6 }}>탈퇴 요청 즉시 고객 화면에서 내려가고, 등록 정보는 관련 법령에 따른 보관 기간 후 삭제됩니다.</div>
        <button className="pv-btn pv-ghost" style={{ padding: "10px 16px", borderRadius: 10, fontSize: 13.5, marginTop: 10, color: C.coral }} onClick={() => { if (confirm("호스트 센터에서 나가고 이 기기의 데모 데이터를 지울까요?")) { logout(); } }}>탈퇴 요청 (데모: 로그아웃)</button>
      </Card>
    </div>
  );
}

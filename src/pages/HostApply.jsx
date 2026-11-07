import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, ArrowLeft, Upload, CheckCircle2, Save, Trash2, Lock, Info, ImageIcon, X } from "lucide-react";
import { C } from "../styles/tokens.js";
import { Link, useRoute } from "../lib/router.jsx";
import { useApp } from "../lib/app-context.jsx";
import { CAT1 } from "../lib/data.js";
import { useSEO, ld } from "../lib/seo.jsx";
import { Container, Field, Steps, CheckRow, Switch, Breadcrumb } from "../components/ui.jsx";
import { PRIVACY_CHECKS, AMENITIES, PRICE_MODELS, CANCEL_POLICIES, BOOKING_CHANNELS } from "../content/host.js";
import { load, save, remove, makeRef, postApi } from "../lib/store.js";

const STEPS = ["프라이빗 기준", "사업자·대표", "공간 정보", "요금·정책", "채널·사진", "검토·제출"];
const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

const EMPTY = {
  step: 0,
  checks: {},
  basic: { name: "", owner: "", phone: "", email: "", bizNo: "", addr: "", addrDetail: "", claimId: "" },
  space: { c1: "", c3: "", minPeople: 2, maxPeople: 8, area: "", open: "10:00", close: "24:00", days: ["월", "화", "수", "목", "금", "토", "일"], amenities: {}, facilities: "", intro: "", privacyDesc: "" },
  price: { model: "hour", base: "", weekend: "", minHours: 2, extraPerson: "", night: "", deposit: "", cancel: "std", cancelCustom: "", channels: ["pvit"] },
  links: { naver: "", reserve: "", home: "", insta: "", kakao: "", photos: [] },
  agree: { truth: false, contact: false, privacy: false },
};

export function HostApplyPage() {
  const { data, notify, setHostSession } = useApp();
  const { query } = useRoute();
  const [f, setF] = useState(() => {
    const draft = load("apply-draft", null);
    const base = draft || EMPTY;
    if (query.claim && data.byId[query.claim] && !base.basic.claimId) {
      const s = data.byId[query.claim];
      return { ...base, basic: { ...base.basic, name: s.n, claimId: s.id, addr: `${s.s} ${s.g}` }, space: { ...base.space, c1: s.kind.c1, c3: s.kind.c3 } };
    }
    return base;
  });
  const [err, setErr] = useState({});
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState("");
  const fileRef = useRef(null);

  useSEO({
    title: "공간 등록 신청 — 호스트 입점 신청서",
    description: "프빗 호스트 입점 신청. 프라이빗 기준 자가진단, 사업자·공간·요금·채널 정보를 입력하면 영업일 2~3일 내 검수 결과를 안내합니다.",
    path: "/host/apply",
    noindex: true,
    jsonLd: [ld.breadcrumb([{ name: "홈", path: "/" }, { name: "호스트 입점", path: "/host" }, { name: "등록 신청", path: "/host/apply" }])],
  });

  // 자동 저장 (사진 미리보기는 용량 문제로 제외)
  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => {
      save("apply-draft", { ...f, links: { ...f.links, photos: f.links.photos.map((p) => ({ name: p.name, size: p.size })) } });
      setSavedAt(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }));
    }, 600);
    return () => clearTimeout(t);
  }, [f, done]);

  const up = (sec, k, v) => setF((p) => ({ ...p, [sec]: { ...p[sec], [k]: v } }));
  const set = (sec, k) => (e) => up(sec, k, e.target.type === "checkbox" ? e.target.checked : e.target.value);
  const kindsIn = (c1) => data.kinds.filter((k) => k.c1 === c1);

  const validate = (step) => {
    const e = {};
    if (step === 0) {
      PRIVACY_CHECKS.filter((c) => c.required).forEach((c) => { if (!f.checks[c.id]) e.checks = "필수 기준 4가지를 모두 충족해야 입점할 수 있어요"; });
    }
    if (step === 1) {
      if (!f.basic.name.trim()) e.name = "공간명을 입력해 주세요";
      if (!f.basic.owner.trim()) e.owner = "대표자명을 입력해 주세요";
      if (!/^[0-9\-+ ]{9,}$/.test(f.basic.phone)) e.phone = "연락 가능한 번호를 입력해 주세요";
      if (!/^\S+@\S+\.\S+$/.test(f.basic.email)) e.email = "이메일 형식을 확인해 주세요";
      if (!f.basic.addr.trim()) e.addr = "공간 주소를 입력해 주세요";
    }
    if (step === 2) {
      if (!f.space.c1) e.c1 = "카테고리를 선택해 주세요";
      if (!f.space.intro.trim() || f.space.intro.trim().length < 20) e.intro = "20자 이상 소개를 적어주세요";
      if (!f.space.privacyDesc.trim()) e.privacyDesc = "프라이빗 이용 방식을 한 줄로 적어주세요";
      if (Number(f.space.maxPeople) < Number(f.space.minPeople)) e.people = "최대 인원이 최소 인원보다 작아요";
    }
    if (step === 3) {
      if (!f.price.base.trim()) e.base = "기본 요금을 적어주세요 (예: 평일 시간당 3만원)";
      if (f.price.cancel === "custom" && !f.price.cancelCustom.trim()) e.cancelCustom = "취소·환불 정책을 적어주세요";
      if (!f.price.channels.length) e.channels = "예약 접수 방식을 하나 이상 선택해 주세요";
    }
    if (step === 4) {
      if (!f.links.naver && !f.links.reserve && !f.links.home && !f.links.insta && !f.links.kakao) e.links = "검수를 위해 채널 링크를 하나 이상 입력해 주세요";
    }
    if (step === 5) {
      if (!f.agree.truth || !f.agree.contact || !f.agree.privacy) e.agree = "세 가지 항목에 모두 동의해 주세요";
    }
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(f.step)) { setF((p) => ({ ...p, step: p.step + 1 })); window.scrollTo({ top: 0, behavior: "smooth" }); } };
  const prev = () => { setErr({}); setF((p) => ({ ...p, step: Math.max(0, p.step - 1) })); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const addPhotos = (files) => {
    const list = Array.from(files || []).slice(0, 10 - f.links.photos.length);
    list.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => setF((p) => ({ ...p, links: { ...p.links, photos: [...p.links.photos, { name: file.name, size: file.size, url: reader.result }].slice(0, 10) } }));
      reader.readAsDataURL(file);
    });
  };

  const submit = async () => {
    if (!validate(5)) return;
    setBusy(true);
    const ref = makeRef("PV");
    const payload = {
      ref, createdAt: new Date().toISOString(),
      checks: f.checks, basic: f.basic, space: f.space, price: f.price,
      links: { ...f.links, photos: f.links.photos.map((p) => p.name) },
      photoCount: f.links.photos.length,
    };
    const r = await postApi("/api/host/apply", payload);
    save("applications", [{ ...payload, stored: r.stored, status: "review" }, ...load("applications", [])].slice(0, 20));
    setHostSession({ email: f.basic.email, name: f.basic.owner, spaceName: f.basic.name, ref, since: payload.createdAt });
    remove("apply-draft");
    setBusy(false);
    setDone({ ref, stored: r.stored });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => { if (confirm("작성 중인 내용을 모두 지울까요?")) { remove("apply-draft"); setF(EMPTY); setErr({}); notify("신청서를 초기화했어요"); } };

  if (done) {
    return (
      <Container className="py-16">
        <div style={{ maxWidth: 560, margin: "0 auto", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 24, padding: "44px 28px", textAlign: "center" }} className="pv-up">
          <span style={{ width: 66, height: 66, borderRadius: 999, display: "grid", placeItems: "center", background: "rgba(18,183,106,.12)", margin: "0 auto 18px" }}><CheckCircle2 size={32} color={C.green} /></span>
          <h1 style={{ fontSize: 23, fontWeight: 900, color: C.ink, margin: 0 }}>입점 신청이 접수됐어요</h1>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.violet, marginTop: 8 }}>접수번호 {done.ref}</div>
          <p style={{ fontSize: 14.5, color: C.sub, lineHeight: 1.7, marginTop: 12 }}>
            영업일 기준 2~3일 안에 <b style={{ color: C.ink }}>{f.basic.email}</b> 로 검수 결과를 보내드립니다.<br />
            승인되면 <b style={{ color: C.green }}>호스트 인증</b> 뱃지와 함께 노출이 시작됩니다.
          </p>
          <div style={{ background: C.bg, borderRadius: 14, padding: "14px 16px", fontSize: 13, color: C.sub, textAlign: "left", lineHeight: 1.7, marginTop: 20 }}>
            <b style={{ color: C.ink }}>다음 단계</b><br />
            1. 호스트 센터에서 검수 진행 상황을 확인하세요.<br />
            2. 사진을 6장 이상 올려두면 승인과 동시에 노출됩니다.<br />
            3. 요금표·취소 정책은 언제든 수정 요청할 수 있어요.
          </div>
          {!done.stored && <div style={{ fontSize: 12, color: C.sub, marginTop: 12, display: "flex", gap: 6, textAlign: "left" }}><Info size={13} style={{ flexShrink: 0, marginTop: 2 }} /> 신청 내용은 이 기기에 저장됐습니다. 서버 연동 전이라면 접수번호와 함께 운영자에게 전달해 주세요.</div>}
          <div className="flex gap-2 justify-center" style={{ marginTop: 20 }}>
            <Link to="/host/center" className="pv-btn pv-primary" style={{ padding: "13px 22px", borderRadius: 12, fontSize: 14.5 }}>호스트 센터 가기 <ArrowRight size={15} /></Link>
            <Link to="/host/guide" className="pv-btn pv-ghost" style={{ padding: "13px 22px", borderRadius: 12, fontSize: 14.5 }}>운영 가이드</Link>
          </div>
        </div>
      </Container>
    );
  }

  const Nav = () => (
    <div className="flex items-center justify-between" style={{ marginTop: 26, gap: 8 }}>
      <div className="flex items-center gap-2">
        {f.step > 0 && <button className="pv-btn pv-ghost" style={{ padding: "12px 18px", borderRadius: 12, fontSize: 14 }} onClick={prev}><ArrowLeft size={15} /> 이전</button>}
        <button className="pv-btn" style={{ padding: "12px 10px", borderRadius: 12, fontSize: 13, background: "transparent", color: C.sub }} onClick={reset}><Trash2 size={14} /> 초기화</button>
      </div>
      <div className="flex items-center gap-3">
        {savedAt && <span className="hidden sm:flex items-center gap-1" style={{ fontSize: 12, color: C.sub }}><Save size={12} /> {savedAt} 자동 저장</span>}
        {f.step < 5 ? (
          <button className="pv-btn pv-primary" style={{ padding: "12px 22px", borderRadius: 12, fontSize: 14.5 }} onClick={next}>다음 <ArrowRight size={15} /></button>
        ) : (
          <button className="pv-btn pv-primary" disabled={busy} style={{ padding: "12px 22px", borderRadius: 12, fontSize: 14.5 }} onClick={submit}>{busy ? "제출 중…" : "입점 신청 제출"} <ArrowRight size={15} /></button>
        )}
      </div>
    </div>
  );

  const Err = ({ k }) => err[k] ? <div style={{ fontSize: 13, color: C.coral, fontWeight: 700, marginTop: 10 }}>{err[k]}</div> : null;
  const H = ({ t, d }) => (<div style={{ marginBottom: 18 }}><h2 style={{ fontSize: 20, fontWeight: 900, color: C.ink, margin: 0 }}>{t}</h2>{d && <p style={{ fontSize: 14, color: C.sub, marginTop: 6, lineHeight: 1.6 }}>{d}</p>}</div>);

  return (
    <Container className="py-8">
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <Breadcrumb items={[{ name: "홈", to: "/" }, { name: "호스트 입점", to: "/host" }, { name: "등록 신청" }]} />
        <h1 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 900, color: C.ink, margin: "0 0 6px", letterSpacing: "-0.02em" }}>공간 등록 신청</h1>
        <p style={{ fontSize: 14, color: C.sub, marginBottom: 18 }}>6단계, 약 10분. 작성 중인 내용은 이 기기에 자동 저장됩니다.</p>
        <Steps steps={STEPS} current={f.step} />

        <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 22, padding: "clamp(20px, 4vw, 32px)", marginTop: 18 }}>
          {f.step === 0 && (
            <div>
              <H t="1. 프라이빗 기준 자가진단" d="프빗은 분위기가 아니라 구조로 '프라이빗'을 판단합니다. 아래 항목 중 필수(*) 4가지에 해당해야 입점할 수 있어요." />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {PRIVACY_CHECKS.map((c) => (
                  <CheckRow key={c.id} on={!!f.checks[c.id]} onChange={(v) => up("checks", c.id, v)} label={c.label} desc={c.desc} required={c.required} />
                ))}
              </div>
              <Err k="checks" />
              <div style={{ background: C.violetSoft, borderRadius: 12, padding: "12px 14px", fontSize: 13, color: C.violet, marginTop: 14, display: "flex", gap: 8 }}><Lock size={14} style={{ flexShrink: 0, marginTop: 2 }} /> 기준에 맞지 않는 공간도 '준비 중' 상태로 신청을 남길 수 있어요. 구조를 바꾸신 뒤 다시 검수를 요청하면 됩니다.</div>
              <Nav />
            </div>
          )}

          {f.step === 1 && (
            <div>
              <H t="2. 사업자·대표 정보" d="검수와 연락에만 사용되며 고객에게 공개되지 않습니다. 공개 연락처는 다음 단계의 '채널'에서 따로 입력해요." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="공간명" required error={err.name}><input className={`pv-input ${err.name ? "err" : ""}`} placeholder="예: 스파 더 프라이빗 강남점" value={f.basic.name} onChange={set("basic", "name")} /></Field>
                <Field label="대표자명" required error={err.owner}><input className={`pv-input ${err.owner ? "err" : ""}`} placeholder="홍길동" value={f.basic.owner} onChange={set("basic", "owner")} /></Field>
                <Field label="연락처" required error={err.phone} hint="검수 연락용"><input className={`pv-input ${err.phone ? "err" : ""}`} placeholder="010-0000-0000" value={f.basic.phone} onChange={set("basic", "phone")} inputMode="tel" /></Field>
                <Field label="이메일" required error={err.email} hint="호스트 센터 로그인 ID"><input className={`pv-input ${err.email ? "err" : ""}`} placeholder="host@example.com" value={f.basic.email} onChange={set("basic", "email")} inputMode="email" /></Field>
                <Field label="사업자등록번호" hint="선택 · 인증 시 우대"><input className="pv-input" placeholder="000-00-00000" value={f.basic.bizNo} onChange={set("basic", "bizNo")} /></Field>
                <Field label="공간 주소" required error={err.addr} full><input className={`pv-input ${err.addr ? "err" : ""}`} placeholder="도로명 주소" value={f.basic.addr} onChange={set("basic", "addr")} /></Field>
                <Field label="상세 주소" full><input className="pv-input" placeholder="층·호수, 건물명" value={f.basic.addrDetail} onChange={set("basic", "addrDetail")} /></Field>
              </div>
              {f.basic.claimId && <div style={{ fontSize: 12.5, color: C.sub, marginTop: 12 }}>기존 등록 공간 <b>{f.basic.claimId}</b> 의 운영자 등록으로 진행됩니다.</div>}
              <Nav />
            </div>
          )}

          {f.step === 2 && (
            <div>
              <H t="3. 공간 정보" d="고객이 검색 필터로 고르는 항목입니다. 정확하게 적을수록 맞는 고객이 찾아옵니다." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="카테고리" required error={err.c1}>
                  <select className={`pv-select ${err.c1 ? "err" : ""}`} value={f.space.c1} onChange={(e) => { up("space", "c1", e.target.value); up("space", "c3", ""); }}>
                    <option value="">선택</option>
                    {Object.keys(CAT1).map((c) => <option key={c}>{c}</option>)}
                    <option value="기타">기타 (룸식당·독채·촬영·반려동물 등)</option>
                  </select>
                </Field>
                <Field label="세부 유형">
                  {f.space.c1 && f.space.c1 !== "기타" ? (
                    <select className="pv-select" value={f.space.c3} onChange={set("space", "c3")}>
                      <option value="">선택</option>
                      {kindsIn(f.space.c1).map((k) => <option key={k.c3}>{k.c3}</option>)}
                    </select>
                  ) : (
                    <input className="pv-input" placeholder="예: 룸식당, 독채 풀빌라, 셀프스튜디오" value={f.space.c3} onChange={set("space", "c3")} />
                  )}
                </Field>
                <Field label="이용 인원" required error={err.people}>
                  <div className="flex items-center gap-2">
                    <input type="number" min={1} className="pv-input" value={f.space.minPeople} onChange={set("space", "minPeople")} aria-label="최소 인원" />
                    <span style={{ color: C.sub }}>~</span>
                    <input type="number" min={1} className="pv-input" value={f.space.maxPeople} onChange={set("space", "maxPeople")} aria-label="최대 인원" />
                    <span style={{ color: C.sub, fontSize: 13, flexShrink: 0 }}>명</span>
                  </div>
                </Field>
                <Field label="면적" hint="선택"><input className="pv-input" placeholder="예: 15평 / 50㎡" value={f.space.area} onChange={set("space", "area")} /></Field>
                <Field label="운영 시간" required>
                  <div className="flex items-center gap-2">
                    <input type="time" className="pv-input" value={f.space.open} onChange={set("space", "open")} aria-label="오픈" />
                    <span style={{ color: C.sub }}>~</span>
                    <input type="time" className="pv-input" value={f.space.close} onChange={set("space", "close")} aria-label="마감" />
                  </div>
                </Field>
                <Field label="운영 요일">
                  <div className="flex gap-1.5 flex-wrap">
                    {DAYS.map((d) => (
                      <button key={d} type="button" className={`pv-chip ${f.space.days.includes(d) ? "on" : ""}`} style={{ padding: "7px 12px" }} onClick={() => up("space", "days", f.space.days.includes(d) ? f.space.days.filter((x) => x !== d) : [...f.space.days, d])}>{d}</button>
                    ))}
                  </div>
                </Field>
              </div>
              <div style={{ marginTop: 18 }}>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink, marginBottom: 8 }}>시설·조건 <span style={{ fontWeight: 500, color: C.sub, fontSize: 12 }}>검색 필터와 동일한 항목입니다</span></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AMENITIES.map(([id, label]) => (
                    <button key={id} type="button" className={`pv-chip ${f.space.amenities[id] ? "on" : ""}`} style={{ justifyContent: "center" }} onClick={() => up("space", "amenities", { ...f.space.amenities, [id]: !f.space.amenities[id] })}>{label}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4" style={{ marginTop: 18 }}>
                <Field label="주요 시설" hint="쉼표로 구분"><input className="pv-input" placeholder="예: 히노끼탕, 샤워실 2개, 빔프로젝터, 무선 마이크 2개, 주차 2대" value={f.space.facilities} onChange={set("space", "facilities")} /></Field>
                <Field label="공간 소개" required error={err.intro} hint="20자 이상"><textarea className={`pv-textarea ${err.intro ? "err" : ""}`} rows={4} placeholder="어떤 모임에 맞는지, 무엇이 특별한지 고객에게 말하듯 적어주세요." value={f.space.intro} onChange={set("space", "intro")} /></Field>
                <Field label="프라이빗 이용 방식" required error={err.privacyDesc} hint="상세 페이지 '이 공간이 프라이빗한 이유'에 표시"><input className={`pv-input ${err.privacyDesc ? "err" : ""}`} placeholder="예: 룸 전체 단독 대관, 예약 시간 내 외부인 출입 없음, 룸 내 전용 화장실" value={f.space.privacyDesc} onChange={set("space", "privacyDesc")} /></Field>
              </div>
              <Nav />
            </div>
          )}

          {f.step === 3 && (
            <div>
              <H t="4. 요금·예약 정책" d="고객이 계산할 수 있게 적어주세요. '문의 주세요'보다 범위라도 적는 쪽이 문의가 많습니다." />
              <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink, marginBottom: 8 }}>요금 체계</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" style={{ marginBottom: 16 }}>
                {PRICE_MODELS.map((m) => (
                  <button key={m.id} type="button" onClick={() => up("price", "model", m.id)} style={{ background: f.price.model === m.id ? C.violetSoft : "#fff", border: `1.5px solid ${f.price.model === m.id ? C.violet : C.line}`, borderRadius: 12, padding: "10px 12px", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink }}>{m.name}</div>
                    <div style={{ fontSize: 11.5, color: C.sub, marginTop: 2 }}>{m.desc}</div>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="기본 요금" required error={err.base} full><input className={`pv-input ${err.base ? "err" : ""}`} placeholder="예: 평일 시간당 3만원 (최소 2시간) / 코스별 6~12만원" value={f.price.base} onChange={set("price", "base")} /></Field>
                <Field label="주말·공휴일 요금"><input className="pv-input" placeholder="예: 시간당 4만원" value={f.price.weekend} onChange={set("price", "weekend")} /></Field>
                <Field label="최소 이용 시간"><select className="pv-select" value={f.price.minHours} onChange={set("price", "minHours")}>{[1, 1.5, 2, 3, 4].map((h) => <option key={h} value={h}>{h}시간</option>)}</select></Field>
                <Field label="추가 인원 요금"><input className="pv-input" placeholder="예: 기준 6인, 추가 1인당 5천원" value={f.price.extraPerson} onChange={set("price", "extraPerson")} /></Field>
                <Field label="심야·추가 요금"><input className="pv-input" placeholder="예: 22시 이후 시간당 +1만원" value={f.price.night} onChange={set("price", "night")} /></Field>
                <Field label="보증금" full><input className="pv-input" placeholder="예: 없음 / 5만원 (퇴실 확인 후 환불)" value={f.price.deposit} onChange={set("price", "deposit")} /></Field>
              </div>
              <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink, margin: "18px 0 8px" }}>취소·환불 정책</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {CANCEL_POLICIES.map((p) => (
                  <CheckRow key={p.id} on={f.price.cancel === p.id} onChange={() => up("price", "cancel", p.id)} label={p.name} desc={p.desc} />
                ))}
              </div>
              {f.price.cancel === "custom" && <div style={{ marginTop: 8 }}><Field error={err.cancelCustom} label="정책 내용"><textarea className={`pv-textarea ${err.cancelCustom ? "err" : ""}`} rows={2} value={f.price.cancelCustom} onChange={set("price", "cancelCustom")} /></Field></div>}
              <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink, margin: "18px 0 8px" }}>예약 접수 방식 <span style={{ fontWeight: 500, color: C.sub, fontSize: 12 }}>복수 선택</span></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {BOOKING_CHANNELS.map((ch) => (
                  <Switch key={ch.id} on={f.price.channels.includes(ch.id)} onChange={(v) => up("price", "channels", v ? [...f.price.channels, ch.id] : f.price.channels.filter((x) => x !== ch.id))} label={ch.name} desc={ch.desc} />
                ))}
              </div>
              <Err k="channels" />
              <Nav />
            </div>
          )}

          {f.step === 4 && (
            <div>
              <H t="5. 채널·사진" d="검수는 상호명·주소·지도 URL·공개 연락처 중 3개 이상 일치로 진행됩니다. 링크를 하나 이상 넣어주세요." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="네이버지도 장소 URL" hint="가장 중요"><input className="pv-input" placeholder="https://map.naver.com/p/entry/place/..." value={f.links.naver} onChange={set("links", "naver")} /></Field>
                <Field label="네이버예약 / 예약 페이지 URL"><input className="pv-input" placeholder="https://booking.naver.com/..." value={f.links.reserve} onChange={set("links", "reserve")} /></Field>
                <Field label="공식 홈페이지"><input className="pv-input" placeholder="https://" value={f.links.home} onChange={set("links", "home")} /></Field>
                <Field label="인스타그램"><input className="pv-input" placeholder="@id 또는 URL" value={f.links.insta} onChange={set("links", "insta")} /></Field>
                <Field label="카카오톡 채널" full><input className="pv-input" placeholder="https://pf.kakao.com/..." value={f.links.kakao} onChange={set("links", "kakao")} /></Field>
              </div>
              <Err k="links" />
              <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink, margin: "18px 0 8px" }}>사진 <span style={{ fontWeight: 500, color: C.sub, fontSize: 12 }}>최대 10장 · 가로 권장 · 지금 안 올려도 호스트 센터에서 등록 가능</span></div>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => addPhotos(e.target.files)} />
              <div onClick={() => fileRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addPhotos(e.dataTransfer.files); }}
                style={{ border: `2px dashed ${C.line}`, borderRadius: 16, padding: "26px 18px", textAlign: "center", cursor: "pointer", background: C.bg }}>
                <Upload size={26} color={C.sub} style={{ margin: "0 auto 8px" }} />
                <div style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>사진 선택 또는 드래그</div>
                <div style={{ fontSize: 12.5, color: C.sub, marginTop: 4 }}>대표 사진(낮·밤), 인원별 세팅, 설비, 화장실, 입구</div>
              </div>
              {f.links.photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2" style={{ marginTop: 12 }}>
                  {f.links.photos.map((p, i) => (
                    <div key={i} style={{ position: "relative", borderRadius: 10, overflow: "hidden", background: C.line, aspectRatio: "4/3" }}>
                      {p.url ? <img src={p.url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ display: "grid", placeItems: "center", height: "100%" }}><ImageIcon size={20} color={C.sub} /></div>}
                      <button type="button" aria-label="삭제" onClick={() => up("links", "photos", f.links.photos.filter((_, j) => j !== i))} style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: 999, border: "none", background: "rgba(10,14,26,.6)", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}><X size={12} /></button>
                      {i === 0 && <span style={{ position: "absolute", bottom: 4, left: 4, fontSize: 10, fontWeight: 800, background: C.violet, color: "#fff", padding: "2px 6px", borderRadius: 999 }}>대표</span>}
                    </div>
                  ))}
                </div>
              )}
              <Nav />
            </div>
          )}

          {f.step === 5 && (
            <div>
              <H t="6. 검토·제출" d="입력하신 내용을 확인하고 제출해 주세요. 제출 후에도 호스트 센터에서 수정 요청할 수 있습니다." />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["공간", `${f.basic.name} · ${f.space.c1}${f.space.c3 ? " / " + f.space.c3 : ""} · ${f.space.minPeople}~${f.space.maxPeople}명`],
                  ["주소", `${f.basic.addr} ${f.basic.addrDetail}`],
                  ["대표·연락", `${f.basic.owner} · ${f.basic.phone} · ${f.basic.email}`],
                  ["운영", `${f.space.days.join("")} ${f.space.open}~${f.space.close}`],
                  ["시설", Object.entries(f.space.amenities).filter(([, v]) => v).map(([k]) => AMENITIES.find((a) => a[0] === k)?.[1]).join(", ") || "-"],
                  ["요금", `${PRICE_MODELS.find((m) => m.id === f.price.model)?.name} · ${f.price.base}${f.price.weekend ? " / 주말 " + f.price.weekend : ""}`],
                  ["취소 정책", f.price.cancel === "custom" ? f.price.cancelCustom : CANCEL_POLICIES.find((p) => p.id === f.price.cancel)?.desc],
                  ["예약 접수", f.price.channels.map((c) => BOOKING_CHANNELS.find((b) => b.id === c)?.name).join(", ")],
                  ["채널", [f.links.naver && "네이버지도", f.links.reserve && "예약", f.links.home && "홈페이지", f.links.insta && "인스타", f.links.kakao && "카카오채널"].filter(Boolean).join(", ") || "-"],
                  ["사진", `${f.links.photos.length}장`],
                  ["프라이빗", f.space.privacyDesc],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-4 gap-3" style={{ fontSize: 14, padding: "10px 0", borderBottom: `1px solid ${C.line}` }}>
                    <div style={{ color: C.sub, fontWeight: 700 }}>{k}</div>
                    <div className="col-span-3" style={{ color: C.ink, lineHeight: 1.5, wordBreak: "break-all" }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 18 }}>
                <CheckRow on={f.agree.truth} onChange={(v) => up("agree", "truth", v)} label="입력한 정보가 사실이며, 내가 소유·운영하거나 등록 권한이 있는 공간입니다" required />
                <CheckRow on={f.agree.contact} onChange={(v) => up("agree", "contact", v)} label="검수와 안내를 위한 연락(전화·문자·이메일)에 동의합니다" required />
                <CheckRow on={f.agree.privacy} onChange={(v) => up("agree", "privacy", v)} label="프빗의 프라이빗 기준을 유지하고, 개인정보처리방침에 동의합니다" required desc="예약 시간 내 다른 팀을 받거나 구조가 등록 내용과 다르면 인증이 보류될 수 있습니다" />
              </div>
              <Err k="agree" />
              <Nav />
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

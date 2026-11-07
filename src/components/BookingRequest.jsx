import React, { useState } from "react";
import { CalendarDays, Copy, MapPin, Phone, CheckCircle2, Info, ExternalLink } from "lucide-react";
import { C } from "../styles/tokens.js";
import { useApp } from "../lib/app-context.jsx";
import { telUrl } from "../lib/data.js";
import { load, save, makeRef, postApi } from "../lib/store.js";
import { Modal, Field } from "./ui.jsx";

const HOURS = Array.from({ length: 16 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

/* 고객 → 호스트 예약 요청. 자체 결제 전까지는 '요청서' 를 만들어 호스트 센터와 서버(API)에 전달하고,
   미인증 공간이면 요청 내용을 복사해 공식 채널로 직접 문의할 수 있게 한다. */
export function BookingRequest({ space, open, onClose }) {
  const { notify } = useApp();
  const verified = space.grade === "A" || space.grade === "B";
  const today = new Date();
  const minDate = today.toISOString().slice(0, 10);
  const [f, setF] = useState({ date: "", start: "19:00", hours: 3, people: 4, purpose: space.kind.tags[0] || "", name: "", phone: "", memo: "", agree: false });
  const [err, setErr] = useState({});
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const validate = () => {
    const e = {};
    if (!f.date) e.date = "이용 날짜를 선택해 주세요";
    if (!f.name.trim()) e.name = "이름을 입력해 주세요";
    if (!/^[0-9\-+ ]{9,}$/.test(f.phone)) e.phone = "연락 가능한 번호를 입력해 주세요";
    if (!f.agree) e.agree = "예약 요청 전달을 위한 정보 제공에 동의해 주세요";
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const summary = (ref) =>
    `[프빗 예약 요청 ${ref}]\n공간: ${space.n} (${space.s} ${space.g})\n일시: ${f.date} ${f.start} 부터 ${f.hours}시간\n인원: ${f.people}명 / 목적: ${f.purpose}\n이름: ${f.name} / 연락처: ${f.phone}\n요청사항: ${f.memo || "없음"}`;

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    const ref = makeRef("BK");
    const payload = { ref, spaceId: space.id, spaceName: space.n, region: `${space.s} ${space.g}`, ...f, createdAt: new Date().toISOString(), verified };
    const r = await postApi("/api/booking/request", payload);
    const list = load("bookings", []);
    save("bookings", [{ ...payload, stored: r.stored, status: "req" }, ...list].slice(0, 50));
    setBusy(false);
    setDone({ ref, stored: r.stored });
  };

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); notify("요청 내용을 복사했어요"); } catch { notify("복사가 지원되지 않는 브라우저예요"); }
  };

  return (
    <Modal open={open} onClose={onClose} title={done ? "예약 요청 완료" : "예약 요청"} width={560}>
      {done ? (
        <div className="pv-up">
          <div style={{ textAlign: "center", padding: "6px 0 16px" }}>
            <span style={{ width: 58, height: 58, borderRadius: 999, display: "grid", placeItems: "center", background: "rgba(18,183,106,.12)", margin: "0 auto 12px" }}><CheckCircle2 size={28} color={C.green} /></span>
            <div style={{ fontWeight: 900, fontSize: 18, color: C.ink }}>요청번호 {done.ref}</div>
            <div style={{ fontSize: 13.5, color: C.sub, marginTop: 6, lineHeight: 1.6 }}>
              {verified
                ? "호스트에게 요청이 전달됐습니다. 보통 1시간 안에 확정·안내 연락이 갑니다."
                : "이 공간은 아직 호스트 인증 전이라 직접 전달이 되지 않습니다. 아래 요청 내용을 복사해 네이버지도·전화로 문의해 주세요. 호스트가 입점하면 요청이 자동으로 전달됩니다."}
            </div>
          </div>
          <pre style={{ background: C.bg, borderRadius: 12, padding: 14, fontSize: 12.5, lineHeight: 1.6, whiteSpace: "pre-wrap", color: C.text, fontFamily: "inherit", margin: 0 }}>{summary(done.ref)}</pre>
          <div className="grid grid-cols-2 gap-2" style={{ marginTop: 12 }}>
            <button className="pv-btn pv-ghost" style={{ padding: 12, borderRadius: 12, fontSize: 13.5 }} onClick={() => copy(summary(done.ref))}><Copy size={14} /> 내용 복사</button>
            <a href={space.naver} target="_blank" rel="noopener noreferrer nofollow" className="pv-btn pv-naver" style={{ padding: 12, borderRadius: 12, fontSize: 13.5 }}><MapPin size={14} /> 네이버지도</a>
            {space.tel && <a href={telUrl(space.tel)} className="pv-btn pv-ghost" style={{ padding: 12, borderRadius: 12, fontSize: 13.5 }}><Phone size={14} /> 전화 문의</a>}
            {space.reserve && <a href={space.reserve} target="_blank" rel="noopener noreferrer nofollow" className="pv-btn pv-primary" style={{ padding: 12, borderRadius: 12, fontSize: 13.5 }}><ExternalLink size={14} /> 예약 페이지</a>}
          </div>
          {!done.stored && (
            <div style={{ fontSize: 12, color: C.sub, marginTop: 10, display: "flex", gap: 6 }}><Info size={13} style={{ flexShrink: 0, marginTop: 2 }} /> 요청 내용은 이 기기에 저장됐습니다. 결제는 호스트의 안내에 따라 진행됩니다. (프빗 자체 결제 준비 중)</div>
          )}
          <button className="pv-btn pv-ink w-full" style={{ padding: 13, borderRadius: 12, fontSize: 14.5, marginTop: 12 }} onClick={onClose}>닫기</button>
        </div>
      ) : (
        <div>
          <div style={{ background: C.bg, borderRadius: 12, padding: "10px 14px", fontSize: 13, color: C.sub, marginBottom: 14, lineHeight: 1.5 }}>
            <b style={{ color: C.ink }}>{space.n}</b> · {space.s} {space.g} · {space.kind.price}
            {!verified && <div style={{ marginTop: 4, color: "#8A6100" }}>인증 전 공간입니다. 요청서를 만들어 공식 채널로 직접 문의하는 방식으로 진행됩니다.</div>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="이용 날짜" required error={err.date}><input type="date" min={minDate} className={`pv-input ${err.date ? "err" : ""}`} value={f.date} onChange={set("date")} /></Field>
            <Field label="시작 시간" required>
              <select className="pv-select" value={f.start} onChange={set("start")}>{HOURS.map((h) => <option key={h}>{h}</option>)}</select>
            </Field>
            <Field label="이용 시간" required>
              <select className="pv-select" value={f.hours} onChange={set("hours")}>{[1, 2, 3, 4, 5, 6, 8, 10, 12].map((h) => <option key={h} value={h}>{h}시간</option>)}</select>
            </Field>
            <Field label="인원" required><input type="number" min={1} max={100} className="pv-input" value={f.people} onChange={set("people")} /></Field>
            <Field label="이용 목적" full>
              <select className="pv-select" value={f.purpose} onChange={set("purpose")}>
                {space.kind.tags.map((t) => <option key={t}>{t}</option>)}
                <option>기타</option>
              </select>
            </Field>
            <Field label="이름" required error={err.name}><input className={`pv-input ${err.name ? "err" : ""}`} placeholder="홍길동" value={f.name} onChange={set("name")} /></Field>
            <Field label="연락처" required error={err.phone}><input className={`pv-input ${err.phone ? "err" : ""}`} placeholder="010-0000-0000" value={f.phone} onChange={set("phone")} inputMode="tel" /></Field>
            <Field label="요청사항" full><textarea className="pv-textarea" rows={2} placeholder="예: 케이크 반입 가능한지, 주차 2대 가능한지" value={f.memo} onChange={set("memo")} /></Field>
          </div>
          <label className="flex items-start gap-2.5" style={{ cursor: "pointer", marginTop: 14, fontSize: 13, color: C.sub, lineHeight: 1.5 }}>
            <input type="checkbox" checked={f.agree} onChange={set("agree")} style={{ width: 17, height: 17, accentColor: C.violet, marginTop: 2 }} />
            <span>예약 요청 전달을 위해 이름·연락처·이용 정보를 해당 공간 호스트에게 제공하는 데 동의합니다. {err.agree && <span style={{ color: C.coral, fontWeight: 700 }}>{err.agree}</span>}</span>
          </label>
          <button className="pv-btn pv-primary w-full" disabled={busy} style={{ padding: 14, borderRadius: 13, fontSize: 15, marginTop: 14 }} onClick={submit}>
            <CalendarDays size={16} /> {busy ? "전송 중…" : "예약 요청 보내기"}
          </button>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 8, textAlign: "center" }}>요청은 예약 확정이 아닙니다. 호스트 확인 후 안내가 갑니다.</div>
        </div>
      )}
    </Modal>
  );
}

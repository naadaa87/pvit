/* ------------------------------------------------------------
   브라우저 로컬 저장소 (localStorage) 래퍼
   - 찜 목록, 입점 신청서 임시저장, 호스트 세션(데모), 예약 요청(데모)
   - 서버 DB 연동 전까지의 임시 저장소. 실제 운영 데이터는 /api 로 전송된다.
   ------------------------------------------------------------ */

const isBrowser = typeof window !== "undefined";
const NS = "pvit:";

export function load(key, fallback) {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(NS + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(NS + key, JSON.stringify(value));
  } catch {
    /* 사생활 보호 모드 등에서는 조용히 무시 */
  }
}

export function remove(key) {
  if (!isBrowser) return;
  try { window.localStorage.removeItem(NS + key); } catch { /* noop */ }
}

/* 접수번호: PV-20261107-A3K9 */
export function makeRef(prefix = "PV") {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let tail = "";
  for (let i = 0; i < 4; i++) tail += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${ymd}-${tail}`;
}

/* ---------- API 전송 (Cloudflare Pages Functions) ----------
   /functions/api/... 가 배포되어 있으면 서버에 저장되고,
   아니면(정적 업로드 배포 등) 로컬에만 저장된다. 어느 쪽이든 사용자 흐름은 끊기지 않는다. */
export async function postApi(path, payload) {
  if (!isBrowser) return { ok: false, stored: false, offline: true };
  try {
    const r = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json().catch(() => ({}));
    return { ok: true, stored: !!j.stored, ...j };
  } catch {
    return { ok: false, stored: false, offline: true };
  }
}

/* ---------- 데모 데이터 (호스트 센터 첫 화면용) ---------- */
export function demoHostState(spaceName = "내 공간") {
  const today = new Date();
  const d = (offset, h) => {
    const x = new Date(today);
    x.setDate(x.getDate() + offset);
    return `${x.getMonth() + 1}/${x.getDate()} ${h}`;
  };
  return {
    host: { name: "호스트", email: "", plan: "free", since: today.toISOString().slice(0, 10) },
    spaces: [
      { id: "H-001", name: spaceName, c1: "파티·모임", c3: "올인원 파티룸", status: "review", step: 2, sido: "서울", gu: "마포구", photos: 0, priceNote: "시간당 3~6만원", open: true },
    ],
    bookings: [
      { id: "B-1001", space: spaceName, who: "김*연", phone: "010-****-1234", when: d(1, "19:00"), hours: 3, people: 8, purpose: "생일 파티", status: "req", memo: "케이크 반입 가능한지 궁금해요", amount: 150000 },
      { id: "B-1002", space: spaceName, who: "박*호", phone: "010-****-5678", when: d(2, "14:00"), hours: 4, people: 12, purpose: "워크숍", status: "ok", memo: "", amount: 200000 },
      { id: "B-1003", space: spaceName, who: "이*진", phone: "010-****-9012", when: d(-3, "18:00"), hours: 3, people: 6, purpose: "친구 모임", status: "done", memo: "", amount: 150000 },
      { id: "B-1004", space: spaceName, who: "최*영", phone: "010-****-3456", when: d(-6, "13:00"), hours: 2, people: 4, purpose: "브라이덜샤워", status: "cancel", memo: "일정 변경", amount: 100000 },
    ],
    inquiries: [
      { id: "Q-1", who: "방문 예정 고객", text: "주차는 몇 대까지 가능한가요? 건물 주차장인지 궁금합니다.", at: d(0, "10:21"), reply: "" },
      { id: "Q-2", who: "방문 예정 고객", text: "노래방 기기 있나요? 마이크 2개면 충분한데요.", at: d(-1, "22:04"), reply: "네, 무선 마이크 2개 비치되어 있습니다." },
    ],
    reviews: [],
    deals: [],
    notes: { todo: ["대표 사진 6장 이상 등록", "요금표·추가 인원 요금 확인", "취소·환불 정책 선택"] },
  };
}

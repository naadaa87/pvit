import { json, readBody, sanitize, persist } from "../../_lib.js";

/* POST /api/booking/request — 고객 예약 요청 접수 (호스트 알림은 웹훅/추후 메일 연동) */
export async function onRequestPost({ request, env }) {
  const body = await readBody(request);
  if (!body || !body.spaceId || !body.name || !body.phone || !body.date) return json({ ok: false, error: "필수 항목 누락" }, 400);
  const id = String(body.ref || "BK-" + Date.now()).slice(0, 32);
  const { stored } = await persist(env, "booking", id, sanitize(body));
  return json({ ok: true, id, stored });
}

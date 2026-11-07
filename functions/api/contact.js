import { json, readBody, sanitize, persist } from "../_lib.js";

/* POST /api/contact — 광고·제휴 문의, 정보 수정 요청, 핫딜 신청, 관심 등록 등 (type 으로 구분) */
export async function onRequestPost({ request, env }) {
  const body = await readBody(request);
  if (!body || !body.type) return json({ ok: false, error: "type 누락" }, 400);
  const id = String(body.ref || body.id || `${body.type}-${Date.now()}`).slice(0, 48);
  const { stored } = await persist(env, "contact", id, sanitize(body));
  return json({ ok: true, id, stored });
}

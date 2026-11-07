import { json, readBody, sanitize, persist } from "../../_lib.js";

/* POST /api/host/apply — 호스트 입점 신청 접수 */
export async function onRequestPost({ request, env }) {
  const body = await readBody(request);
  if (!body || !body.basic?.name || !body.basic?.email || !body.basic?.phone) return json({ ok: false, error: "필수 항목 누락" }, 400);
  const id = String(body.ref || "PV-" + Date.now()).slice(0, 32);
  const { stored } = await persist(env, "apply", id, sanitize(body));
  return json({ ok: true, id, stored });
}

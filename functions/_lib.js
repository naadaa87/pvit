/* Cloudflare Pages Functions 공통 유틸
   - KV 바인딩(PVIT_KV)이 있으면 저장, 없으면 stored:false 로 응답 (프론트는 로컬 저장으로 이어감)
   - NOTIFY_WEBHOOK 환경변수가 있으면 접수 내용을 웹훅(Slack·Discord·Make 등)으로 전송 */

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });

export async function readBody(request) {
  try { return await request.json(); } catch { return null; }
}

const strip = (v, max = 2000) => (typeof v === "string" ? v.slice(0, max) : v);

export function sanitize(obj, depth = 0) {
  if (depth > 4 || obj === null || typeof obj !== "object") return strip(obj);
  if (Array.isArray(obj)) return obj.slice(0, 50).map((v) => sanitize(v, depth + 1));
  const out = {};
  for (const [k, v] of Object.entries(obj)) if (k.length <= 64) out[k] = sanitize(v, depth + 1);
  return out;
}

export async function persist(env, prefix, id, payload) {
  const record = { id, receivedAt: new Date().toISOString(), ...payload };
  let stored = false;
  if (env.PVIT_KV) {
    try {
      await env.PVIT_KV.put(`${prefix}:${id}`, JSON.stringify(record), { expirationTtl: 60 * 60 * 24 * 365 });
      const idxKey = `${prefix}:_index`;
      const idx = JSON.parse((await env.PVIT_KV.get(idxKey)) || "[]");
      idx.unshift({ id, at: record.receivedAt });
      await env.PVIT_KV.put(idxKey, JSON.stringify(idx.slice(0, 5000)));
      stored = true;
    } catch (e) { console.error("KV 저장 실패", e); }
  }
  if (env.NOTIFY_WEBHOOK) {
    try {
      await fetch(env.NOTIFY_WEBHOOK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: `[PVIT ${prefix}] ${id}\n` + JSON.stringify(record, null, 1).slice(0, 3500), content: `[PVIT ${prefix}] ${id}` }) });
    } catch (e) { console.error("웹훅 전송 실패", e); }
  }
  return { stored };
}

export function rateLimitKey(request) {
  return request.headers.get("CF-Connecting-IP") || "anon";
}

import { json } from "../_lib.js";
export const onRequestGet = ({ env }) => json({ ok: true, kv: !!env.PVIT_KV, webhook: !!env.NOTIFY_WEBHOOK, time: new Date().toISOString() });

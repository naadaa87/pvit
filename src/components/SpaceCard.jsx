import React from "react";
import { MapPin, Navigation, Phone, Heart } from "lucide-react";
import { C } from "../styles/tokens.js";
import { Link } from "../lib/router.jsx";
import { useApp } from "../lib/app-context.jsx";
import { cat1Of, telUrl } from "../lib/data.js";
import { SpaceImg, VerifyBadge, PrivacyTag } from "./ui.jsx";

export function SpaceCard({ space, compact }) {
  const { wish, toggleWish } = useApp();
  const liked = wish.has(space.id);
  const k = space.kind;
  const to = `/space/${space.id}`;
  return (
    <article className="pv-card pv-up" style={{ background: "#fff", borderRadius: 18, overflow: "hidden", border: `1px solid ${C.line}`, display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative" }}>
        <Link to={to} aria-label={`${space.n} 상세 보기`} style={{ display: "block" }}>
          <SpaceImg space={space} style={{ height: compact ? 140 : 168 }} />
        </Link>
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6, pointerEvents: "none" }}>
          <VerifyBadge grade={space.grade} />
        </div>
        <button
          onClick={(e) => { e.preventDefault(); toggleWish(space.id); }}
          aria-label={liked ? "찜 해제" : "찜하기"}
          style={{ position: "absolute", top: 10, right: 10, width: 34, height: 34, borderRadius: 999, border: "none", cursor: "pointer", display: "grid", placeItems: "center", background: "rgba(10,14,26,.42)", backdropFilter: "blur(4px)" }}>
          <Heart size={16} color={liked ? C.coral : "#fff"} fill={liked ? C.coral : "none"} strokeWidth={2.2} />
        </button>
        <div style={{ position: "absolute", bottom: 10, left: 10, pointerEvents: "none" }}>
          <PrivacyTag form={k.form} dark />
        </div>
      </div>
      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.sub, fontWeight: 700 }}>
          <span style={{ color: cat1Of(k.c1).color }}>{k.c3}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><MapPin size={11} /> {space.s} {space.g}</span>
        </div>
        <h3 className="pv-clamp1" style={{ fontSize: 16.5, fontWeight: 800, color: C.ink, margin: "6px 0 4px" }}>
          <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>{space.n}</Link>
        </h3>
        <p className="pv-clamp2" style={{ fontSize: 13, color: C.sub, lineHeight: 1.55, margin: 0, minHeight: compact ? 0 : 40 }}>
          {space.desc}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, margin: "10px 0" }}>
          {k.tags.slice(0, 3).map((t) => (
            <span key={t} style={{ fontSize: 11.5, fontWeight: 700, color: C.violet, background: C.violetSoft, padding: "3px 9px", borderRadius: 999 }}>#{t}</span>
          ))}
        </div>
        <div style={{ marginTop: "auto" }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: C.ink, marginBottom: 10 }}>
            {k.price} <span style={{ fontSize: 12, fontWeight: 600, color: C.sub }}>· 예상 금액대</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: space.tel ? "1fr 1fr 1fr" : "1fr 1fr", gap: 7 }}>
            <a href={space.naver} target="_blank" rel="noopener noreferrer nofollow" className="pv-btn pv-naver" style={{ padding: "10px 6px", borderRadius: 11, fontSize: 12.5 }}>
              <MapPin size={13} /> 네이버지도
            </a>
            <a href={space.google} target="_blank" rel="noopener noreferrer nofollow" className="pv-btn pv-goog" style={{ padding: "10px 6px", borderRadius: 11, fontSize: 12.5 }}>
              <Navigation size={13} /> 구글지도
            </a>
            {space.tel && (
              <a href={telUrl(space.tel)} className="pv-btn pv-ghost" style={{ padding: "10px 6px", borderRadius: 11, fontSize: 12.5 }}>
                <Phone size={13} /> 전화
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

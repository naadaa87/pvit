import React, { useState, useMemo } from "react";
import { MapPin, Navigation, Phone, Heart, Globe, CalendarDays, ShieldCheck, Check, CheckCircle2, MessageCircle, ArrowRight, ChevronDown, ChevronUp, Info, Wallet, Lock, Sparkles, Flag, Instagram } from "lucide-react";
import { C } from "../styles/tokens.js";
import { Link, useRoute } from "../lib/router.jsx";
import { useApp } from "../lib/app-context.jsx";
import { CONFIG, cat1Of, telUrl, regionSlug } from "../lib/data.js";
import { useSEO, ld } from "../lib/seo.jsx";
import { Container, SpaceImg, VerifyBadge, PrivacyTag, VerifyNotice, Breadcrumb, SectionHead } from "../components/ui.jsx";
import { SpaceCard } from "../components/SpaceCard.jsx";
import { BookingRequest } from "../components/BookingRequest.jsx";
import { GUIDES_BY_CAT, guideBySlug } from "../content/guides.js";
import { NotFoundPage } from "./StaticPages.jsx";

export function DetailPage({ id }) {
  const { data, wish, toggleWish, notify } = useApp();
  const s = data.byId[id];
  if (!s) return <NotFoundPage />;
  return <Detail s={s} data={data} wish={wish} toggleWish={toggleWish} notify={notify} />;
}

function Detail({ s, data, wish, toggleWish, notify }) {
  const k = s.kind;
  const meta = cat1Of(k.c1);
  const cat = cat1Of(k.c1);
  const liked = wish.has(s.id);
  const verified = s.grade === "A" || s.grade === "B";
  const [qa, setQa] = useState(null);
  const [booking, setBooking] = useState(false);

  const similar = useMemo(() => {
    const same = data.spaces.filter((x) => x.k === s.k && x.id !== s.id);
    const local = same.filter((x) => x.s === s.s);
    return [...local, ...same.filter((x) => x.s !== s.s)].slice(0, 4);
  }, [data, s]);

  const guides = (GUIDES_BY_CAT[k.c1] || []).map(guideBySlug).filter(Boolean);
  const desc = `${s.n} — ${s.s} ${s.g}의 ${k.c3}. ${k.form}, ${k.price}. ${s.desc} 네이버지도·구글지도로 위치와 최신 정보를 확인하고 공식 채널로 예약하세요.`;

  useSEO({
    title: `${s.n} — ${s.s} ${s.g} ${k.c3}`,
    description: desc.slice(0, 155),
    path: `/space/${s.id}`,
    image: s.img,
    noindex: !verified && !CONFIG.INDEX_UNVERIFIED,
    jsonLd: [
      ld.breadcrumb([{ name: "홈", path: "/" }, { name: k.c1, path: `/category/${cat.slug}` }, { name: `${s.s}`, path: `/region/${regionSlug(s.s)}` }, { name: s.n, path: `/space/${s.id}` }]),
      ...(verified ? [ld.place(s)] : []),
    ],
  });

  const privacyPoints = [k.form, "예약 시간 내 우리 일행만 이용", "외부인과 동선이 겹치지 않는 독립 구조", "예약제 기반 운영"];
  const faqs = [
    ["정말 우리 일행만 쓰는 건가요?", `이 공간의 이용 방식은 "${k.form}"으로 분류되어 있어요. 예약 시간 동안 다른 팀과 공간이 겹치지 않는 구조인지, 예약 전 지도·전화로 한 번 더 확인하시길 권해요.`],
    ["가격은 정확한가요?", `표시된 "${k.price}"은 동일 유형 공간의 일반적인 금액대예요. 요일·시간·인원에 따라 달라질 수 있으니 예약 채널에서 최종 확인해 주세요.`],
    ["예약은 어떻게 하나요?", verified ? "아래 '예약 요청' 버튼으로 날짜·시간·인원을 보내면 호스트가 확인 후 안내합니다. 네이버예약·전화 등 기존 채널로도 예약할 수 있어요." : "네이버지도에서 해당 공간을 찾은 뒤 네이버예약·전화·홈페이지 등 공식 채널로 예약하시면 됩니다. '예약 요청' 버튼으로 요청서를 만들어 문의에 활용할 수도 있어요."],
  ];

  const CTA = ({ full }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button className="pv-btn pv-primary w-full" style={{ padding: "13px", borderRadius: 13, fontSize: 14.5 }} onClick={() => setBooking(true)}>
        <CalendarDays size={16} /> 예약 요청하기
      </button>
      {s.reserve && (
        <a href={s.reserve} target="_blank" rel="noopener noreferrer nofollow" className="pv-btn pv-ghost w-full" style={{ padding: "13px", borderRadius: 13, fontSize: 14.5 }}>
          <Globe size={16} /> 네이버예약·예약 페이지
        </a>
      )}
      <a href={s.naver} target="_blank" rel="noopener noreferrer nofollow" className="pv-btn pv-naver w-full" style={{ padding: "13px", borderRadius: 13, fontSize: 14.5 }}>
        <MapPin size={16} /> 네이버지도에서 보기
      </a>
      <a href={s.google} target="_blank" rel="noopener noreferrer nofollow" className="pv-btn pv-goog w-full" style={{ padding: "13px", borderRadius: 13, fontSize: 14.5 }}>
        <Navigation size={16} /> 구글지도에서 보기
      </a>
      {s.tel ? (
        <a href={telUrl(s.tel)} className="pv-btn pv-ghost w-full" style={{ padding: "13px", borderRadius: 13, fontSize: 14.5 }}>
          <Phone size={16} /> 전화 문의 ({s.tel})
        </a>
      ) : (
        <div style={{ fontSize: 12.5, color: C.sub, textAlign: "center", padding: "9px 10px", background: C.bg, borderRadius: 11, lineHeight: 1.5 }}>
          <Phone size={12} style={{ display: "inline", verticalAlign: "-1px" }} /> 전화번호 확인 중 — 지도에서 연락처를 확인해 주세요
        </div>
      )}
      {s.insta && <a href={s.insta} target="_blank" rel="noopener noreferrer nofollow" className="pv-btn pv-ghost w-full" style={{ padding: "13px", borderRadius: 13, fontSize: 14.5 }}><Instagram size={16} /> 인스타그램</a>}
      {s.home && <a href={s.home} target="_blank" rel="noopener noreferrer nofollow" className="pv-btn pv-ghost w-full" style={{ padding: "13px", borderRadius: 13, fontSize: 14.5 }}><Globe size={16} /> 공식 홈페이지</a>}
      {full && (
        <button className="pv-btn pv-ghost w-full" style={{ padding: "13px", borderRadius: 13, fontSize: 14.5 }} onClick={() => toggleWish(s.id)}>
          <Heart size={16} fill={liked ? C.coral : "none"} color={liked ? C.coral : C.text} /> {liked ? "찜 해제" : "찜하기"}
        </button>
      )}
    </div>
  );

  const Fact = ({ icon: Icon, label, value }) => (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", background: `${meta.color}14`, flexShrink: 0 }}><Icon size={16} color={meta.color} /></span>
      <div>
        <div style={{ fontSize: 11.5, color: C.sub, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 14, color: C.ink, fontWeight: 800, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );

  return (
    <Container className="py-7">
      <Breadcrumb items={[{ name: "홈", to: "/" }, { name: k.c1, to: `/category/${cat.slug}` }, { name: s.s, to: `/region/${regionSlug(s.s)}` }, { name: s.n }]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        <div className="lg:col-span-2">
          <SpaceImg space={s} style={{ height: "clamp(220px, 38vw, 380px)", borderRadius: 20 }} iconSize={72} />
          {!s.img && (
            <div style={{ fontSize: 12, color: C.sub, marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <Info size={13} /> 대표 사진 준비 중 — 호스트 등록 시 실제 공간 사진이 표시됩니다.
            </div>
          )}

          <div style={{ marginTop: 18 }}>
            <div className="flex items-center gap-2" style={{ flexWrap: "wrap" }}>
              <VerifyBadge grade={s.grade} size="lg" />
              <PrivacyTag form={k.form} />
            </div>
            <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 900, color: C.ink, letterSpacing: "-0.02em", margin: "12px 0 6px" }}>{s.n}</h1>
            <div className="flex items-center gap-2" style={{ fontSize: 14, color: C.sub, fontWeight: 600, flexWrap: "wrap" }}>
              <Link to={`/category/${cat.slug}`} style={{ color: meta.color, fontWeight: 800, textDecoration: "none" }}>{k.c3}</Link>
              <span>·</span>
              <Link to={`/region/${regionSlug(s.s)}`} className="flex items-center gap-1" style={{ color: C.sub, textDecoration: "none" }}><MapPin size={13} /> {s.s} {s.g}</Link>
              <span>·</span>
              <span>{s.id}</span>
            </div>
          </div>

          <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 18, padding: 20, marginTop: 18 }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Fact icon={Wallet} label="예상 금액대" value={k.price} />
              <Fact icon={Lock} label="이용 방식" value={k.form} />
              <Fact icon={MapPin} label="위치" value={`${s.s} ${s.g}`} />
              <Fact icon={Sparkles} label="세부 유형" value={k.c3} />
            </div>
          </div>

          <section style={{ marginTop: 26 }}>
            <h2 style={{ fontSize: 19, fontWeight: 900, color: C.ink, marginBottom: 10 }}>공간 소개</h2>
            <p style={{ fontSize: 15, color: C.text, lineHeight: 1.75 }}>{s.desc}</p>
            <div className="flex flex-wrap gap-1.5" style={{ marginTop: 12 }}>
              {k.tags.map((t) => <Link key={t} to="/search" query={{ tag: t }} className="pv-chip">#{t}</Link>)}
            </div>
          </section>

          <section style={{ background: `linear-gradient(135deg, ${C.ink}, #17103A)`, borderRadius: 20, padding: "clamp(20px, 3.5vw, 30px)", marginTop: 26 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
              <ShieldCheck size={20} color={C.violet2} />
              <h2 style={{ fontSize: 18.5, fontWeight: 900, color: "#fff", margin: 0 }}>이 공간이 프라이빗한 이유</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {privacyPoints.map((p) => (
                <div key={p} className="flex items-center gap-2.5" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, padding: "12px 14px" }}>
                  <Check size={15} color={C.green} strokeWidth={3} style={{ flexShrink: 0 }} />
                  <span style={{ color: "#fff", fontSize: 13.5, fontWeight: 700 }}>{p}</span>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginTop: 26 }}>
            <h2 style={{ fontSize: 19, fontWeight: 900, color: C.ink, marginBottom: 6 }}>예약 전 체크포인트</h2>
            <p style={{ fontSize: 13.5, color: C.sub, marginBottom: 12 }}>이 유형의 공간을 고를 때 꼭 확인하면 좋은 항목이에요. 지도·전화로 문의 시 참고하세요.</p>
            <div className="flex flex-wrap gap-2">
              {k.checks.map((c) => (
                <span key={c} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 12, background: "#fff", border: `1.5px solid ${C.line}`, fontSize: 13.5, fontWeight: 700, color: C.text }}>
                  <CheckCircle2 size={14} color={meta.color} /> {c}
                </span>
              ))}
            </div>
          </section>

          {guides.length > 0 && (
            <section style={{ marginTop: 26 }}>
              <h2 style={{ fontSize: 19, fontWeight: 900, color: C.ink, marginBottom: 10 }}>이 유형을 고를 때 읽으면 좋은 글</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {guides.map((g) => (
                  <Link key={g.slug} to={`/guide/${g.slug}`} className="pv-card" style={{ display: "block", textDecoration: "none", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 14, padding: "13px 16px" }}>
                    <div style={{ fontWeight: 800, fontSize: 14.5, color: C.ink }}>{g.title}</div>
                    <div className="pv-clamp1" style={{ fontSize: 12.5, color: C.sub, marginTop: 3 }}>{g.description}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section style={{ marginTop: 26 }}>
            <h2 style={{ fontSize: 19, fontWeight: 900, color: C.ink, marginBottom: 10 }}>이용 후기</h2>
            <div style={{ background: "#fff", border: `1.5px dashed ${C.line}`, borderRadius: 16, padding: "26px 20px", textAlign: "center" }}>
              <MessageCircle size={26} color={C.sub} style={{ margin: "0 auto 8px" }} />
              <div style={{ fontWeight: 800, fontSize: 15, color: C.ink }}>아직 등록된 후기가 없어요</div>
              <div style={{ fontSize: 13.5, color: C.sub, marginTop: 5 }}>다녀오셨다면 커뮤니티에 첫 후기를 남겨주세요.</div>
              <Link to="/community" className="pv-btn pv-ghost" style={{ padding: "10px 20px", borderRadius: 11, fontSize: 13.5, marginTop: 14 }}>커뮤니티에 후기 쓰기 <ArrowRight size={14} /></Link>
            </div>
          </section>

          <section style={{ marginTop: 26 }}>
            <h2 style={{ fontSize: 19, fontWeight: 900, color: C.ink, marginBottom: 10 }}>자주 묻는 질문</h2>
            {faqs.map(([q, a], i) => (
              <div key={i} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 14, marginBottom: 8, overflow: "hidden" }}>
                <button onClick={() => setQa(qa === i ? null : i)} className="w-full flex items-center justify-between" style={{ background: "none", border: "none", cursor: "pointer", padding: "15px 18px", textAlign: "left" }} aria-expanded={qa === i}>
                  <span style={{ fontWeight: 800, fontSize: 14.5, color: C.ink }}>Q. {q}</span>
                  {qa === i ? <ChevronUp size={17} color={C.sub} /> : <ChevronDown size={17} color={C.sub} />}
                </button>
                {qa === i && <div className="pv-up" style={{ padding: "0 18px 16px", fontSize: 14, color: C.sub, lineHeight: 1.7 }}>{a}</div>}
              </div>
            ))}
          </section>

          <div style={{ marginTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, fontSize: 12.5, color: C.sub }}>
            <span>이 공간을 운영하시나요? <Link to="/host/apply" query={{ claim: s.id }} className="pv-link">호스트로 등록하고 정보를 직접 관리하세요</Link></span>
            <button className="pv-link flex items-center gap-1" style={{ fontSize: 12.5, color: C.sub }} onClick={() => notify("정보 수정 제안이 접수됐어요. 확인 후 반영할게요.")}><Flag size={12} /> 정보 수정 제안</button>
          </div>
        </div>

        <aside className="hidden lg:block">
          <div style={{ position: "sticky", top: 84 }}>
            <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 20, padding: 20, boxShadow: "0 12px 34px rgba(16,22,43,.08)" }}>
              <div style={{ fontSize: 12.5, color: C.sub, fontWeight: 700 }}>예상 금액대</div>
              <div style={{ fontSize: 23, fontWeight: 900, color: C.ink, margin: "4px 0 14px" }}>{k.price}</div>
              <CTA full />
              <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 16, paddingTop: 13, fontSize: 12, color: C.sub, lineHeight: 1.6 }}>
                지도 버튼은 <b>{s.q}</b> 검색 결과로 연결됩니다. 실제 운영 여부·가격을 꼭 확인하세요.
              </div>
            </div>
            {!verified && <div style={{ marginTop: 12 }}><VerifyNotice compact /></div>}
          </div>
        </aside>
      </div>

      {/* 모바일 하단 고정 CTA */}
      <div className="lg:hidden" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90, background: "rgba(255,255,255,.94)", backdropFilter: "blur(10px)", borderTop: `1px solid ${C.line}`, padding: "10px 14px calc(10px + env(safe-area-inset-bottom))" }}>
        <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 1fr", gap: 8 }}>
          <button onClick={() => toggleWish(s.id)} className="pv-btn pv-ghost" style={{ borderRadius: 12, padding: 0 }} aria-label="찜">
            <Heart size={17} fill={liked ? C.coral : "none"} color={liked ? C.coral : C.text} />
          </button>
          <button className="pv-btn pv-primary" style={{ padding: "12px 6px", borderRadius: 12, fontSize: 13.5 }} onClick={() => setBooking(true)}><CalendarDays size={15} /> 예약 요청</button>
          <a href={s.naver} target="_blank" rel="noopener noreferrer nofollow" className="pv-btn pv-naver" style={{ padding: "12px 6px", borderRadius: 12, fontSize: 13.5 }}><MapPin size={15} /> 네이버지도</a>
        </div>
      </div>
      <div className="lg:hidden" style={{ height: 66 }} />

      {similar.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <SectionHead eyebrow="SIMILAR" title="비슷한 공간 더 보기" action={`${k.c3} 전체`} to={`/category/${cat.slug}`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similar.map((x) => <SpaceCard key={x.id} space={x} compact />)}
          </div>
        </div>
      )}

      <BookingRequest space={s} open={booking} onClose={() => setBooking(false)} />
    </Container>
  );
}

import React, { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal, List, Map as MapIcon, X, ChevronDown, MapPin, Info } from "lucide-react";
import { C } from "../styles/tokens.js";
import { useRoute, buildUrl } from "../lib/router.jsx";
import { useApp } from "../lib/app-context.jsx";
import { CONFIG, filterSpaces, fmtN } from "../lib/data.js";
import { useSEO, ld } from "../lib/seo.jsx";
import { Container, VerifyNotice, Empty } from "../components/ui.jsx";
import { SpaceCard } from "../components/SpaceCard.jsx";

function FauxMap({ items }) {
  const pins = items.slice(0, 12);
  return (
    <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", border: `1px solid ${C.line}`, background: "linear-gradient(135deg, #E8ECF6, #F3F0FA)", minHeight: 420 }}>
      {[...Array(6)].map((_, i) => <div key={"h" + i} style={{ position: "absolute", left: 0, right: 0, top: `${(i + 1) * 14}%`, height: 1, background: "rgba(109,91,255,.1)" }} />)}
      {[...Array(6)].map((_, i) => <div key={"v" + i} style={{ position: "absolute", top: 0, bottom: 0, left: `${(i + 1) * 14}%`, width: 1, background: "rgba(109,91,255,.1)" }} />)}
      {pins.map((s, i) => (
        <a key={s.id} href={s.naver} target="_blank" rel="noopener noreferrer nofollow" style={{ position: "absolute", left: `${12 + (i * 37) % 72}%`, top: `${14 + (i * 23) % 68}%`, textDecoration: "none" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: C.ink, color: "#fff", fontSize: 11.5, fontWeight: 800, padding: "6px 10px", borderRadius: 999, boxShadow: "0 6px 16px rgba(10,14,26,.3)", whiteSpace: "nowrap" }}>
            <MapPin size={11} color={C.violet2} /> {s.n.length > 10 ? s.n.slice(0, 10) + "…" : s.n}
          </span>
        </a>
      ))}
      <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, background: "rgba(255,255,255,.92)", backdropFilter: "blur(6px)", borderRadius: 12, padding: "10px 14px", fontSize: 12.5, color: C.sub, display: "flex", gap: 8, alignItems: "center" }}>
        <Info size={14} color={C.violet} style={{ flexShrink: 0 }} />
        데모 지도입니다. 핀을 누르면 해당 공간의 네이버지도 검색으로 이동합니다. (정식 버전: 지도 API 연동 예정)
      </div>
    </div>
  );
}

/* 검색 페이지 — 필터 상태를 URL 쿼리와 동기화해 공유·북마크·검색엔진 색인이 가능하다. */
export function SearchPage({ fixed = {} }) {
  const { data } = useApp();
  const { query, navigate, pathname } = useRoute();
  const init = { q: "", c1: "", c3: "", sido: "", gu: "", price: "", tag: "", sort: "기본", ...query, ...fixed };
  const [f, setF] = useState(init);
  const [view, setView] = useState("list");
  const [limit, setLimit] = useState(CONFIG.PAGE_SIZE);
  const [mobileFilter, setMobileFilter] = useState(false);

  useEffect(() => { setF((p) => ({ ...p, ...query, ...fixed })); setLimit(CONFIG.PAGE_SIZE); }, [JSON.stringify(query), JSON.stringify(fixed)]);

  const set = (k, v) => {
    const nx = { ...f, [k]: v, ...(k === "c1" ? { c3: "" } : {}), ...(k === "sido" ? { gu: "" } : {}) };
    setF(nx); setLimit(CONFIG.PAGE_SIZE);
    if (!fixed.c1 && !fixed.sido && !fixed.c3) {
      const { sort, ...rest } = nx;
      navigate(buildUrl("/search", { ...rest, ...(sort !== "기본" ? { sort } : {}) }), { replace: true, keepScroll: true });
    }
  };

  const kindsInC1 = f.c1 ? data.kinds.filter((k) => k.c1 === f.c1) : data.kinds;
  const priceList = [...new Set(data.kinds.map((k) => k.price))];
  const tagList = [...new Set(data.kinds.flatMap((k) => k.tags))];
  const results = useMemo(() => filterSpaces(data, f), [data, f]);

  const titleBits = [f.sido, f.gu, f.c3 || f.c1, f.tag && `#${f.tag}`, f.q && `'${f.q}'`].filter(Boolean);
  const embedded = Object.keys(fixed).length > 0; // 카테고리·지역 랜딩 안에 포함된 경우 메타는 상위 페이지가 담당
  useSEO({
    skip: embedded,
    title: titleBits.length ? `${titleBits.join(" ")} 프라이빗 공간 검색` : "프라이빗 공간 찾기",
    description: titleBits.length
      ? `${titleBits.join(" ")} 조건의 프라이빗 공간 ${fmtN(results.length)}곳. 지도·전화·예약 링크로 바로 연결됩니다.`
      : `전국 ${fmtN(data.total)}곳의 프라이빗 공간을 지역·카테고리·금액대·이용 목적으로 검색하세요.`,
    path: "/search",
    noindex: Object.keys(query).length > 0, // 필터 조합 페이지는 색인 제외(카테고리·지역 랜딩이 대표 URL)
    jsonLd: [ld.breadcrumb([{ name: "홈", path: "/" }, { name: "공간찾기", path: "/search" }])],
  });

  const FilterPanel = ({ mobile }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {!fixed.c1 && (
        <div>
          <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink, marginBottom: 9 }}>카테고리</div>
          <div className="flex flex-wrap gap-1.5">
            <button className={`pv-chip ${!f.c1 ? "on" : ""}`} onClick={() => set("c1", "")}>전체</button>
            {data.cat1List.map((c) => <button key={c} className={`pv-chip ${f.c1 === c ? "on" : ""}`} onClick={() => set("c1", c)}>{c}</button>)}
          </div>
        </div>
      )}
      {!fixed.c3 && (
        <div>
          <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink, marginBottom: 9 }}>세부 유형</div>
          <div className="flex flex-wrap gap-1.5">
            <button className={`pv-chip ${!f.c3 ? "on" : ""}`} onClick={() => set("c3", "")}>전체</button>
            {kindsInC1.map((k) => <button key={k.c3} className={`pv-chip ${f.c3 === k.c3 ? "on" : ""}`} onClick={() => set("c3", k.c3)}>{k.c3}</button>)}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {!fixed.sido && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink, marginBottom: 8 }}>지역</div>
            <select className="pv-select" value={f.sido} onChange={(e) => set("sido", e.target.value)}>
              <option value="">전체</option>
              {Object.keys(data.regionIndex).sort().map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
        <div className={fixed.sido ? "col-span-2" : ""}>
          <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink, marginBottom: 8 }}>시군구</div>
          <select className="pv-select" value={f.gu} onChange={(e) => set("gu", e.target.value)} disabled={!f.sido}>
            <option value="">{f.sido ? "전체" : "지역 먼저 선택"}</option>
            {(data.regionIndex[f.sido] || []).map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink, marginBottom: 8 }}>금액대</div>
        <select className="pv-select" value={f.price} onChange={(e) => set("price", e.target.value)}>
          <option value="">전체</option>
          {priceList.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 13.5, color: C.ink, marginBottom: 9 }}>이용 목적</div>
        <div className="flex flex-wrap gap-1.5">
          <button className={`pv-chip ${!f.tag ? "on" : ""}`} onClick={() => set("tag", "")}>전체</button>
          {tagList.map((t) => <button key={t} className={`pv-chip ${f.tag === t ? "on" : ""}`} onClick={() => set("tag", t)}>#{t}</button>)}
        </div>
      </div>
      <div>
        <button className={`pv-chip ${f.grade ? "on" : ""}`} onClick={() => set("grade", f.grade ? "" : "1")}>인증 공간만 보기</button>
      </div>
      {mobile && (
        <button className="pv-btn pv-primary w-full" style={{ padding: 13, borderRadius: 12, fontSize: 15 }} onClick={() => setMobileFilter(false)}>
          {fmtN(results.length)}개 결과 보기
        </button>
      )}
    </div>
  );

  return (
    <Container className="py-7">
      {!fixed.c1 && !fixed.sido && !fixed.c3 && (
        <div style={{ marginBottom: 14 }}>
          <h1 style={{ fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 900, color: C.ink, margin: 0 }}>
            공간찾기 <span style={{ color: C.violet }}>{fmtN(results.length)}</span><span style={{ fontSize: 15, fontWeight: 600, color: C.sub }}> / {fmtN(data.total)}곳</span>
          </h1>
        </div>
      )}
      <VerifyNotice compact />

      <div className="flex items-center gap-2" style={{ margin: "14px 0" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={16} color={C.sub} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
          <input className="pv-input" style={{ paddingLeft: 38 }} placeholder="공간명·설명·목적으로 검색" value={f.q} onChange={(e) => set("q", e.target.value)} aria-label="검색어" />
        </div>
        <select className="pv-select" style={{ width: 108, flexShrink: 0 }} value={f.sort} onChange={(e) => set("sort", e.target.value)} aria-label="정렬">
          {["기본", "인증순", "이름순", "지역순"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="pv-btn pv-ghost lg:hidden" style={{ padding: "11px 13px", borderRadius: 12, flexShrink: 0 }} onClick={() => setMobileFilter(true)} aria-label="필터 열기">
          <SlidersHorizontal size={16} />
        </button>
        <div className="hidden sm:flex" style={{ background: "#fff", border: `1.5px solid ${C.line}`, borderRadius: 12, padding: 3, flexShrink: 0 }}>
          {[["list", List], ["map", MapIcon]].map(([v, I]) => (
            <button key={v} onClick={() => setView(v)} aria-label={v === "list" ? "목록 보기" : "지도 보기"} style={{ border: "none", cursor: "pointer", borderRadius: 9, padding: "7px 11px", background: view === v ? C.ink : "transparent" }}>
              <I size={15} color={view === v ? "#fff" : C.sub} />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="hidden lg:block">
          <div style={{ position: "sticky", top: 80, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 18, padding: 18, maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
            <FilterPanel />
          </div>
        </aside>
        <div className="lg:col-span-3">
          <div style={{ fontSize: 13.5, color: C.sub, fontWeight: 700, marginBottom: 10 }}>{fmtN(results.length)}곳</div>
          {view === "map" ? (
            <FauxMap items={results} />
          ) : results.length === 0 ? (
            <Empty icon={Search} title="조건에 맞는 공간이 없어요" desc="필터를 조금 넓혀서 다시 찾아보세요." action="필터 초기화" to="/search" />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {results.slice(0, limit).map((s) => <SpaceCard key={s.id} space={s} compact />)}
              </div>
              {limit < results.length && (
                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <button className="pv-btn pv-ghost" style={{ padding: "13px 34px", borderRadius: 13, fontSize: 14.5 }} onClick={() => setLimit((l) => l + CONFIG.PAGE_SIZE)}>
                    더 보기 ({fmtN(results.length - limit)}개 남음) <ChevronDown size={15} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {mobileFilter && (
        <div style={{ position: "fixed", inset: 0, zIndex: 150 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(10,14,26,.5)" }} onClick={() => setMobileFilter(false)} />
          <div className="pv-up" style={{ position: "absolute", bottom: 0, left: 0, right: 0, maxHeight: "82vh", overflowY: "auto", background: "#fff", borderRadius: "22px 22px 0 0", padding: "20px 18px 26px" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 900, fontSize: 17, color: C.ink }}>필터</div>
              <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setMobileFilter(false)} aria-label="닫기"><X size={22} color={C.ink} /></button>
            </div>
            <FilterPanel mobile />
          </div>
        </div>
      )}
    </Container>
  );
}

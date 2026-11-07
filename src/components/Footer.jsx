import React from "react";
import { C } from "../styles/tokens.js";
import { Link } from "../lib/router.jsx";
import { useApp } from "../lib/app-context.jsx";
import { CAT1, regionSlug } from "../lib/data.js";
import { Container, Logo } from "./ui.jsx";

/* 푸터는 검색엔진이 전체 구조를 파악하는 핵심 내부 링크 묶음이기도 하다. */
export function Footer() {
  const { data } = useApp();
  const regions = data ? Object.keys(data.regionCount).sort((a, b) => data.regionCount[b] - data.regionCount[a]).slice(0, 8) : [];
  const col = { fontWeight: 800, fontSize: 14, marginBottom: 12, color: "#fff" };
  const item = { display: "block", color: C.subDark, fontSize: 13.5, padding: "5px 0", textDecoration: "none" };
  return (
    <footer style={{ background: C.ink, color: "#fff", marginTop: 80 }}>
      <Container className="py-12 sm:py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Logo dark />
            <p style={{ color: C.subDark, marginTop: 14, fontSize: 13.5, lineHeight: 1.7 }}>
              파티룸부터 프라이빗 스파, 룸식당, 독채 숙소, 키즈룸까지. 남들과 섞이지 않는 프라이빗 공간을 한 곳에서.
            </p>
          </div>
          <div>
            <div style={col}>서비스</div>
            <Link to="/search" style={item}>공간찾기</Link>
            <Link to="/hotdeal" style={item}>핫딜·타임딜</Link>
            <Link to="/guide" style={item}>프라이빗 공간 가이드</Link>
            <Link to="/community" style={item}>커뮤니티</Link>
            <Link to="/faq" style={item}>자주 묻는 질문</Link>
            <Link to="/about" style={item}>PVIT 소개</Link>
          </div>
          <div>
            <div style={col}>카테고리</div>
            {Object.entries(CAT1).map(([name, m]) => (
              <Link key={name} to={`/category/${m.slug}`} style={item}>{name}</Link>
            ))}
          </div>
          <div>
            <div style={col}>지역별</div>
            {regions.map((r) => (
              <Link key={r} to={`/region/${regionSlug(r)}`} style={item}>{r} 프라이빗 공간</Link>
            ))}
          </div>
          <div>
            <div style={col}>호스트</div>
            <Link to="/host" style={item}>입점 안내</Link>
            <Link to="/host/apply" style={item}>공간 등록 신청</Link>
            <Link to="/host/center" style={item}>호스트 센터</Link>
            <Link to="/host/guide" style={item}>호스트 운영 가이드</Link>
            <Link to="/host" query={{ section: "ads" }} style={item}>광고·제휴 문의</Link>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.1)", marginTop: 36, paddingTop: 20, display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", fontSize: 12.5, color: "rgba(255,255,255,.42)" }}>
          <div className="flex flex-wrap gap-4">
            <Link to="/terms" style={{ color: "inherit", textDecoration: "none" }}>이용약관</Link>
            <Link to="/privacy" style={{ color: "inherit", textDecoration: "none", fontWeight: 700 }}>개인정보처리방침</Link>
            <span>현재 목록은 1차 수집 데이터로 검증이 진행 중입니다.</span>
          </div>
          <span>© 2026 PVIT · 우리끼리 쓰는 모든 공간</span>
        </div>
      </Container>
    </footer>
  );
}

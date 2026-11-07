import React, { useState } from "react";
import { Menu, X, Search, Building2, LayoutDashboard } from "lucide-react";
import { C } from "../styles/tokens.js";
import { Link, useRoute } from "../lib/router.jsx";
import { useApp } from "../lib/app-context.jsx";
import { Container, Logo } from "./ui.jsx";

const NAV = [
  ["/search", "공간찾기"],
  ["/hotdeal", "핫딜"],
  ["/guide", "가이드"],
  ["/community", "커뮤니티"],
  ["/host", "호스트 입점"],
  ["/about", "PVIT 소개"],
];

export function Header() {
  const { pathname } = useRoute();
  const { hostSession } = useApp();
  const [open, setOpen] = useState(false);
  const active = (p) => pathname === p || (p !== "/" && pathname.startsWith(p + "/")) || (p === "/host" && pathname.startsWith("/host"));

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,.88)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${C.line}` }}>
      <Container className="flex items-center justify-between">
        <div className="flex items-center gap-8" style={{ height: 64 }}>
          <Logo />
          <nav className="hidden lg:flex items-center gap-1" aria-label="주 메뉴">
            {NAV.map(([to, label]) => (
              <Link key={to} to={to} className="pv-btn" style={{ background: active(to) ? C.violetSoft : "transparent", color: active(to) ? C.violet : C.text, padding: "8px 14px", borderRadius: 10, fontSize: 14.5 }}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="hidden lg:flex items-center gap-2">
          {hostSession ? (
            <Link to="/host/center" className="pv-btn pv-ghost" style={{ padding: "9px 16px", borderRadius: 11, fontSize: 13.5 }}>
              <LayoutDashboard size={15} /> 호스트 센터
            </Link>
          ) : (
            <Link to="/host/apply" className="pv-btn pv-ghost" style={{ padding: "9px 16px", borderRadius: 11, fontSize: 13.5 }}>
              <Building2 size={15} /> 공간 등록
            </Link>
          )}
          <Link to="/search" className="pv-btn pv-primary" style={{ padding: "9px 18px", borderRadius: 11, fontSize: 13.5 }}>
            <Search size={15} /> 공간 찾기
          </Link>
        </div>
        <button className="lg:hidden" aria-label="메뉴" style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }} onClick={() => setOpen(!open)}>
          {open ? <X size={24} color={C.ink} /> : <Menu size={24} color={C.ink} />}
        </button>
      </Container>
      {open && (
        <div className="lg:hidden pv-up" style={{ borderTop: `1px solid ${C.line}`, background: "#fff" }}>
          <Container className="py-3">
            {NAV.map(([to, label]) => (
              <Link key={to} to={to} onClick={() => setOpen(false)} className="pv-btn w-full" style={{ justifyContent: "flex-start", background: active(to) ? C.violetSoft : "transparent", color: active(to) ? C.violet : C.text, padding: "13px 12px", borderRadius: 10, fontSize: 15.5 }}>
                {label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-2" style={{ marginTop: 8 }}>
              <Link to={hostSession ? "/host/center" : "/host/apply"} onClick={() => setOpen(false)} className="pv-btn pv-ghost" style={{ padding: "13px", borderRadius: 12, fontSize: 14.5 }}>
                {hostSession ? "호스트 센터" : "공간 등록"}
              </Link>
              <Link to="/search" onClick={() => setOpen(false)} className="pv-btn pv-primary" style={{ padding: "13px", borderRadius: 12, fontSize: 14.5 }}>
                <Search size={16} /> 공간 찾기
              </Link>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}

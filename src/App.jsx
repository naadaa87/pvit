import React, { useState, useRef, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { C } from "./styles/tokens.js";
import { RouterProvider, useRoute, Switch } from "./lib/router.jsx";
import { AppCtx } from "./lib/app-context.jsx";
import { useSpaces } from "./lib/data.js";
import { load, save, remove } from "./lib/store.js";
import { Container, Toast, VerifyNotice } from "./components/ui.jsx";
import { Header } from "./components/Header.jsx";
import { Footer } from "./components/Footer.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { SearchPage } from "./pages/SearchPage.jsx";
import { DetailPage } from "./pages/DetailPage.jsx";
import { CategoryPage, RegionPage } from "./pages/LandingPages.jsx";
import { GuideIndexPage, GuideArticlePage } from "./pages/GuidePages.jsx";
import { CommunityPage, PostPage } from "./pages/CommunityPages.jsx";
import { HotDealPage, AboutPage, FaqPage, LegalPage, NotFoundPage } from "./pages/StaticPages.jsx";
import { HostLandingPage } from "./pages/HostLanding.jsx";
import { HostApplyPage } from "./pages/HostApply.jsx";
import { HostCenterPage } from "./pages/HostCenter.jsx";
import { HostGuidePage } from "./pages/HostGuide.jsx";

/* ------------------------------------------------------------
   PVIT / 프빗 — 라우트 테이블
   ------------------------------------------------------------ */
export const ROUTES = [
  { path: "/", render: () => <HomePage /> },
  { path: "/search", render: () => <SearchPage /> },
  { path: "/space/:id", render: (p) => <DetailPage id={p.id} /> },
  { path: "/category/:slug", render: (p) => <CategoryPage slug={p.slug} /> },
  { path: "/region/:slug", render: (p) => <RegionPage slug={p.slug} /> },
  { path: "/guide", render: () => <GuideIndexPage /> },
  { path: "/guide/:slug", render: (p) => <GuideArticlePage slug={p.slug} /> },
  { path: "/hotdeal", render: () => <HotDealPage /> },
  { path: "/community", render: () => <CommunityPage /> },
  { path: "/community/:id", render: (p) => <PostPage id={p.id} /> },
  { path: "/host", render: () => <HostLandingPage /> },
  { path: "/host/apply", render: () => <HostApplyPage /> },
  { path: "/host/center", render: () => <HostCenterPage /> },
  { path: "/host/guide", render: () => <HostGuidePage /> },
  { path: "/about", render: () => <AboutPage /> },
  { path: "/faq", render: () => <FaqPage /> },
  { path: "/terms", render: () => <LegalPage kind="terms" /> },
  { path: "/privacy", render: () => <LegalPage kind="privacy" /> },
  { path: "*", render: () => <NotFoundPage /> },
];

function LoadingScreen() {
  return (
    <div id="pvit" style={{ background: C.bg, minHeight: "100vh" }}>
      <div style={{ height: 64, background: "#fff", borderBottom: `1px solid ${C.line}` }} />
      <Container className="py-10">
        <div className="pv-skel" style={{ height: 44, width: "50%", maxWidth: 380 }} />
        <div className="pv-skel" style={{ height: 20, width: "70%", maxWidth: 520, marginTop: 14 }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginTop: 30 }}>
          {[...Array(8)].map((_, i) => <div key={i} className="pv-skel" style={{ height: 300 }} />)}
        </div>
        <div style={{ textAlign: "center", color: C.sub, fontSize: 13.5, marginTop: 26, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
          <RefreshCw size={14} className="pv-spin" /> 프라이빗 공간을 불러오는 중…
        </div>
      </Container>
    </div>
  );
}

function Shell({ data }) {
  const { pathname } = useRoute();
  const [toast, setToast] = useState("");
  const [wish, setWish] = useState(() => new Set(load("wish", [])));
  const [hostSession, setHostSessionState] = useState(() => load("host-session", null));
  const timer = useRef(null);

  const notify = (m) => { setToast(m); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(""), 2600); };
  const toggleWish = (id) => {
    setWish((prev) => {
      const nx = new Set(prev);
      if (nx.has(id)) { nx.delete(id); notify("찜 목록에서 뺐어요"); } else { nx.add(id); notify("찜 목록에 담았어요 ♥"); }
      save("wish", [...nx]);
      return nx;
    });
  };
  const setHostSession = (s) => { setHostSessionState(s); if (s) save("host-session", s); else remove("host-session"); };

  // 상세 페이지의 모바일 고정 바 때문에 하단 여백이 필요한 경우 등, 라우트 변경 시 초기화할 것이 있으면 여기서
  useEffect(() => { setToast(""); }, [pathname]);

  return (
    <AppCtx.Provider value={{ data, wish, toggleWish, notify, hostSession, setHostSession }}>
      <div id="pvit" style={{ background: C.bg, minHeight: "100vh" }} data-ready="1">
        <Header />
        <main>
          {data.isFallback && (
            <Container className="pt-4"><VerifyNotice compact /></Container>
          )}
          <Switch routes={ROUTES} pathname={pathname} />
        </main>
        <Footer />
        <Toast msg={toast} />
      </div>
    </AppCtx.Provider>
  );
}

/* initialData / initialUrl 은 서버 사전 렌더링에서만 넘어온다. */
export default function App({ initialData, initialUrl }) {
  const { loading, data } = useSpaces(initialData);
  return (
    <RouterProvider initialUrl={initialUrl}>
      {loading || !data ? <LoadingScreen /> : <Shell data={data} />}
    </RouterProvider>
  );
}

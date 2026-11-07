import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

/* ------------------------------------------------------------
   초경량 URL 라우터 (History API)
   - 서버 사전 렌더링(SSR)과 브라우저 양쪽에서 동작
   - 라우트 패턴: "/space/:id" 형태, ":param" 지원
   ------------------------------------------------------------ */

const RouterCtx = createContext(null);
const isBrowser = typeof window !== "undefined";

export function parseLocation(url) {
  const [pathAndQuery, hash = ""] = url.split("#");
  const [pathname, search = ""] = pathAndQuery.split("?");
  const query = {};
  if (search) {
    for (const part of search.split("&")) {
      if (!part) continue;
      const [k, v = ""] = part.split("=");
      query[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, " "));
    }
  }
  return { pathname: normalize(pathname), search: search ? "?" + search : "", query, hash };
}

function normalize(p) {
  if (!p) return "/";
  let out = decodeURIComponent(p);
  if (out.length > 1 && out.endsWith("/")) out = out.slice(0, -1);
  return out || "/";
}

export function matchRoute(pattern, pathname) {
  const pp = pattern.split("/").filter(Boolean);
  const cp = pathname.split("/").filter(Boolean);
  if (pattern === "*") return {};
  if (pp.length !== cp.length) return null;
  const params = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(":")) params[pp[i].slice(1)] = cp[i];
    else if (pp[i] !== cp[i]) return null;
  }
  return params;
}

export function buildUrl(path, query) {
  if (!query) return path;
  const qs = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v))
    .join("&");
  return qs ? path + "?" + qs : path;
}

export function RouterProvider({ initialUrl, children }) {
  const [loc, setLoc] = useState(() => parseLocation(isBrowser ? window.location.pathname + window.location.search + window.location.hash : initialUrl || "/"));

  useEffect(() => {
    if (!isBrowser) return;
    const onPop = () => setLoc(parseLocation(window.location.pathname + window.location.search + window.location.hash));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((to, opts = {}) => {
    const url = typeof to === "string" ? to : buildUrl(to.path, to.query);
    if (!isBrowser) return;
    if (opts.replace) window.history.replaceState({}, "", url);
    else window.history.pushState({}, "", url);
    setLoc(parseLocation(url));
    if (!opts.keepScroll) window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return <RouterCtx.Provider value={{ ...loc, navigate }}>{children}</RouterCtx.Provider>;
}

export function useRoute() {
  return useContext(RouterCtx);
}

/* <Link to="/search" query={{c1:"파티·모임"}}> — 실제 <a href> 로 렌더되어 검색엔진이 따라갈 수 있다. */
export function Link({ to, query, children, className, style, onClick, replace, ...rest }) {
  const { navigate } = useRoute();
  const href = buildUrl(to, query);
  const handle = (e) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    navigate(href, { replace });
  };
  return (
    <a href={href} className={className} style={style} onClick={handle} {...rest}>
      {children}
    </a>
  );
}

/* 라우트 테이블 매칭: routes = [{ path, render }] */
export function Switch({ routes, pathname }) {
  for (const r of routes) {
    const params = matchRoute(r.path, pathname);
    if (params) return r.render(params);
  }
  return null;
}

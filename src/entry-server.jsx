import React from "react";
import { renderToString } from "react-dom/server";
import App from "./App.jsx";
import { SeoProvider, renderHeadTags } from "./lib/seo.jsx";
import { enrich } from "./lib/data.js";

/* 빌드 시 scripts/prerender.mjs 가 호출. 라우트별 HTML 과 <head> 태그를 돌려준다. */
export function render(url, rawData) {
  const data = enrich(rawData);
  const collector = { current: null };
  const html = renderToString(
    <SeoProvider collector={collector}>
      <App initialData={data} initialUrl={url} />
    </SeoProvider>
  );
  return { html, head: renderHeadTags(collector.current), seo: collector.current };
}

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/pvit.css";

/* 사전 렌더링된 HTML 위에 클라이언트 앱을 올린다.
   (hydrateRoot 대신 render 를 쓰는 이유: 데이터 fetch 전 로딩 화면과 서버 출력이 달라 불일치 경고를 피하기 위함) */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

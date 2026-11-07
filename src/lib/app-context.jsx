import { createContext, useContext } from "react";

/* 전역 컨텍스트: data(공간 데이터), wish(찜), notify(토스트), hostSession(호스트 데모 세션) */
export const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

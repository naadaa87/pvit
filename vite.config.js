import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "/" — Cloudflare Pages 루트 배포 기준. 하위 경로 배포 시 변경.
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    sourcemap: false,
  },
  ssr: {
    noExternal: ["lucide-react"],
  },
});

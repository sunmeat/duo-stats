import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Публичное API Duolingo (www.duolingo.com/2017-06-30/users) не отдаёт
// CORS-заголовки, поэтому браузер напрямую его дёргать не может.
// Решение — локальный dev-прокси: браузер стучится в /duoapi/...,
// vite-сервер сам ходит на duolingo.com и отдаёт ответ обратно.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/duoapi": {
        target: "https://www.duolingo.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/duoapi/, ""),
      },
    },
  },
});

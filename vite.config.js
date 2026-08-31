import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
      "/duoimg": {
        target: "https://d3gq3s1iyyx31w.cloudfront.net",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/duoimg/, ""),
      },
      "/duocdn": {
        target: "https://s2.duolingo.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/duocdn/, ""),
      },
    },
  },
});
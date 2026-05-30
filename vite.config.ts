import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// カスタムドメイン使用時は BASE_URL=/ を設定してビルド
// GitHub Pages (github.io) のまま使う場合はデフォルト値のまま
const base = process.env.BASE_URL ?? "/Web_QRtoDXF/";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base,
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});

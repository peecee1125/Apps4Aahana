/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync } from "fs";

const { version } = JSON.parse(readFileSync("./package.json", "utf-8"));

/** ISO YYYY-MM-DD; override in CI with RELEASE_DATE=2026-05-21 */
const releaseDate =
  process.env.RELEASE_DATE?.trim() ||
  new Date().toISOString().slice(0, 10);

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __RELEASE_DATE__: JSON.stringify(releaseDate),
  },
  build: { outDir: "dist", assetsDir: "assets" },
  server: { port: Number(process.env.PORT) || 5174 },
  test: {
    globals: false,
    environment: "node",
    include: ["src/**/*.test.js"],
  },
});

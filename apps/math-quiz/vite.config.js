/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync } from "fs";

const { version } = JSON.parse(readFileSync("./package.json", "utf-8"));

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  define: { __APP_VERSION__: JSON.stringify(version) },
  build: { outDir: "dist", assetsDir: "assets" },
  server: { port: Number(process.env.PORT) || 5174 },
  test: {
    globals: false,
    environment: "node",
    include: ["src/**/*.test.js"],
  },
});

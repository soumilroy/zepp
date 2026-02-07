import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { configDefaults } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: "0.0.0.0",
  },
  // @ts-expect-error - Vitest extends Vite config with `test`, but our config is typed as Vite's `UserConfig`.
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    globals: true,
    css: true,
    include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    exclude: [...configDefaults.exclude, "playwright/**"],
  },
});

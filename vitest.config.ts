import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "lib/**/*.test.ts",
      "arena/**/*.test.ts",
      "examples/**/*.test.ts",
      "components/**/*.test.tsx",
      "agents/**/*.test.ts",
    ],
    environment: "node",
    pool: "forks",
    testTimeout: 30_000,
    environmentMatchGlobs: [
      ["components/**/*.test.tsx", "happy-dom"],
    ],
  },
  resolve: {
    alias: {
      "@": new URL("./", import.meta.url).pathname,
    },
  },
});

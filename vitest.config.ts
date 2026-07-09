import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts", "arena/**/*.test.ts", "examples/**/*.test.ts"],
    environment: "node",
    pool: "forks",
    testTimeout: 30_000,
  },
  resolve: {
    alias: {
      "@": new URL("./", import.meta.url).pathname,
    },
  },
});

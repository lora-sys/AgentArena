import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts", "arena/**/*.test.ts", "examples/**/*.test.ts", "agents/**/*.test.ts"],
    environment: "node",
    pool: "forks",
    testTimeout: 30_000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      reportsDirectory: "./coverage",
      include: ["lib/runtime/**/*.ts", "arena/**/*.ts", "agents/**/*.ts"],
      exclude: ["**/*.test.ts", "agents/**/agent.ts", "agents/**/tools/**", "lib/runtime/contract.ts"],
      thresholds: {
        "arena/engine/**/*.ts": { lines: 80, branches: 70, functions: 75 },
        "arena/schemas/**/*.ts": { lines: 95, branches: 90, functions: 95 },
        "lib/runtime/**/*.ts": { lines: 80, branches: 55, functions: 75 },
        lines: 40,
        statements: 40,
        functions: 40,
        branches: 40,
        perFile: true,
      },
    },
  },
  resolve: { alias: { "@": new URL("./", import.meta.url).pathname } },
});

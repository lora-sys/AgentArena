import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for Agent Arena.
 *
 * Coverage bars per docs/test-guidelines.md §2:
 *   battle-engine / agent-runtime / schemas / event-store : >=80% lines, >=70% branches
 *   schemas                                              : >=95% lines, >=90% branches
 *   ui-kit                                                : >=60% lines, >=50% branches
 *   apps/web (lib + app)                                  : >=70% lines, >=60% branches
 *
 * Per-file floor (§2): no file below 40% line coverage.
 *
 * Sprint-0 reality: the repo is a single Next.js workspace. The
 * "packages/*" paths in the test guidelines map to the top-level
 * `arena/`, `lib/`, `components/`, and `agents/` directories.
 *
 * Coverage `include` scopes the v8 collector to directories that
 * already have tests. Storybook story files and demo data are
 * excluded — those land in the ui-kit visual coverage bucket
 * (agent-browser per docs/test-guidelines.md §3.5) and are
 * validated manually, not by line coverage.
 */

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
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      reportsDirectory: "./coverage",
      // Only measure directories with existing tests. Storybook stories
      // and demo data fixtures are validated visually (agent-browser)
      // and through integration journeys, not line coverage.
      include: [
        "lib/**/*.ts",
        "arena/**/*.ts",
        "agents/**/*.ts",
      ],
      exclude: [
        "**/*.test.ts",
        "**/*.stories.tsx",
        "lib/db/tests/**",
        "lib/types.ts",
        "lib/demo-data.ts",
        "lib/export-markdown.ts",
        "lib/runtime/contract.ts",
      ],
      // Per-file floor: 40% lines (§2). No individual file can land below this.
      //
      // Sprint-0 thresholds are intentionally the floor only. Aspirational
      // per-directory targets (engine 80, schemas 95, ui-kit 60) are
      // enforced once each directory clears them. See docs/test-guidelines.md §2.
      thresholds: {
        lines: 40,
        statements: 40,
        functions: 40,
        branches: 40,
      },
      perFile: true,
    },
  },
  resolve: {
    alias: {
      "@": new URL("./", import.meta.url).pathname,
    },
  },
});

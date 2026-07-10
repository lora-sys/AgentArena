import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration for Agent Arena.
 *
 * Browser matrix: Chromium + WebKit (mobile profile).
 * Viewport matrix: 1440x900 (desktop) + 390x844 (mobile).
 * Firefox deferred to P1 per docs/test-guidelines.md §3.4.
 *
 * Each project runs both viewports as separate test executions
 * (projects are composed of base browser + viewport), so every
 * journey executes at desktop and mobile without duplication in
 * the spec file itself.
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [
        ["github"],
        ["list"],
        ["junit", { outputFile: "coverage/e2e/junit.xml" }],
      ]
    : "list",

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    // Chromium desktop
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    // Chromium mobile (iPhone 14 Pro viewport)
    {
      name: "chromium-mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 3,
      },
    },
    // WebKit desktop (Safari parity)
    {
      name: "webkit-desktop",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1440, height: 900 },
      },
    },
    // WebKit mobile
    {
      name: "webkit-mobile",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 3,
      },
    },
  ],

  // Spin up the Next.js dev server if none is running. In CI the
  // e2e job starts the server externally (see .github/workflows/ci.yml)
  // CI: server is started by the workflow (after `pnpm build`).
  // Local: Playwright spawns `pnpm dev` for us.
  webServer: process.env.CI
    ? undefined
    : {
        command: "pnpm dev",
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 60_000,
      },
});

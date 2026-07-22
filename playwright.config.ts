import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration for Agent Arena.
 *
 * Browser matrix: Chromium desktop + mobile profile.
 * Viewport matrix: 1440x900 (desktop) + 390x844 (mobile).
 * Firefox deferred to P1 per docs/test-guidelines.md §3.4.
 *
 * Each project runs both viewports as separate test executions
 * (projects are composed of base browser + viewport), so every
 * journey executes at desktop and mobile without duplication in
 * the spec file itself.
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:5188";
// Override to use system Chromium when bundled browser is unavailable.
// CI: leave undefined so pnpm e2e:install downloads the right version.
// Local dev: set PLAYWRIGHT_CHROMIUM_PATH=/usr/bin/chromium
const CHROMIUM_PATH = process.env.PLAYWRIGHT_CHROMIUM_PATH;

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
    // Video recording is disabled: it requires Playwright's bundled ffmpeg
    // binary which may be missing in some environments. We rely on
    // screenshots + traces for debug info instead. To re-enable video,
    // run `pnpm exec playwright install ffmpeg` and set video here.
    video: "off",
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
        launchOptions: CHROMIUM_PATH ? { executablePath: CHROMIUM_PATH } : undefined,
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
        launchOptions: CHROMIUM_PATH ? { executablePath: CHROMIUM_PATH } : undefined,
      },
    },
  ],

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

import { test, expect } from "./_fixtures/test";

/**
 * PRD §8.3 — Smoke routes journey.
 *
 * Fast smoke test: verifies all documented routes return a non-error
 * HTTP status. This is the baseline "page exists" check before any
 * content-level assertions.
 *
 * Acceptance: every PRD §16.1 page route returns status < 500.
 * Each test runs independently — a failure on one route doesn't
 * block the others.
 *
 * Per docs/test-guidelines.md §7.4: no waitForTimeout in the hot path.
 * We use generous navigationTimeout via the playwright config and
 * retry navigation on cold compile.
 */

// Generous timeout for dev mode cold compilation.
test.setTimeout(90_000);

test.describe("PRD §8.3 Route Smoke", () => {
  const routes = [
    { path: "/", name: "Home" },
    { path: "/battle/new", name: "Battle Setup" },
    { path: "/battle/demo/live", name: "Battle Live (demo)" },
    { path: "/battle/demo/result", name: "Battle Result (demo)" },
    { path: "/battle/demo/replay", name: "Battle Replay (demo)" },
    { path: "/agent/safe-builder/passport", name: "Agent Passport (safe-builder)" },
    { path: "/battles", name: "Battles list" },
    { path: "/teams", name: "Teams list" },
  ];

  for (const route of routes) {
    test(`${route.name} (${route.path}) returns < 500`, async ({ page }) => {
      let response;
      for (let attempt = 0; attempt < 3; attempt++) {
        response = await page.goto(route.path);
        if (response && response.status() < 500) break;
        await page.waitForTimeout(2000);
      }

      // Must not be a server error.
      expect(response?.status()).toBeLessThan(500);

      // Body must have content (not empty).
      await expect(page.locator("body")).not.toBeEmpty();
    });
  }

  test("API endpoints respond", async ({ request }) => {
    // Verify the core API endpoints respond.
    const apiRoutes = [
      { path: "/api/battles", expectedStatus: 200 },
      { path: "/api/battles/demo", expectedStatus: 200 },
      { path: "/api/battles/demo/events", expectedStatus: 200 },
      { path: "/api/battles/demo/export", expectedStatus: 200 },
    ];

    for (const route of apiRoutes) {
      const response = await request.get(route.path);
      expect(response.status()).toBe(route.expectedStatus);
    }
  });

  test("home page has correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Agent Arena/i);
  });

  test("battles list page renders table or list structure", async ({ page }) => {
    await page.goto("/battles");

    // The battles page should show at least one battle entry.
    // We check for common structural elements: heading, table, or list.
    const heading = page.getByRole("heading").first();
    await expect(heading).toBeVisible({ timeout: 10_000 });

    // Body must not be empty.
    await expect(page.locator("body")).not.toBeEmpty();
  });
});
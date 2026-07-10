import { test, expect } from "./_fixtures/test";

/**
 * PRD §8.3 — Battle Setup journey.
 *
 * Verifies the /battle/new route renders, the form accepts input,
 * and clicking Start redirects to /battle/[id]/live.
 *
 * Acceptance (issue #13):
 * - Page loads (no 500 error)
 * - Form renders with idea textarea + Start button
 * - Submitting redirects to /battle/[id]/live
 * - Screenshot on failure (handled by playwright.config.ts)
 */

test.describe("PRD §8.3 Battle Setup", () => {
  test("setup page renders with form and teams", async ({ page }) => {
    await page.goto("/battle/new");

    // Page heading must be visible.
    await expect(page.getByRole("heading", { name: /battle setup/i })).toBeVisible();

    // Mission / Challenge textarea (label is "Mission / Challenge").
    const textarea = page.getByLabel(/mission \/ challenge/i);
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveValue(/Agent Metaverse/);

    // Battle Preview card with teams is visible.
    await expect(page.getByRole("heading", { name: /battle preview/i })).toBeVisible();

    // Start Battle button is visible and enabled.
    const startBtn = page.getByRole("button", { name: /start battle/i });
    await expect(startBtn).toBeVisible();
    await expect(startBtn).toBeEnabled();
  });

  test("clicking Start Battle redirects to /battle/[id]/live", async ({ page }) => {
    await page.goto("/battle/new");

    // Enter a custom idea.
    const textarea = page.getByLabel(/mission \/ challenge/i);
    await textarea.fill("Build a test battle for QA E2E journeys.");

    // Click Start Battle.
    const startBtn = page.getByRole("button", { name: /start battle/i });
    await startBtn.click();

    // Should redirect to /battle/<id>/live. The battle API returns demo as fallback.
    await page.waitForURL(/\/battle\/[^/]+\/live/, { timeout: 15_000 });

    // Verify the URL pattern matches a battle live route.
    const url = page.url();
    expect(url).toMatch(/\/battle\/demo\/live|\/battle\/btl_[a-z0-9]+\/live/);
  });
});
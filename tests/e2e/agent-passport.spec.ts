import { test, expect } from "./_fixtures/test";

/**
 * PRD §8.3 — Agent Passport page journey.
 *
 * Verifies the /agent/[id]/passport route renders, the weaknesses
 * column is visible (PRD §12.3 invariant), and key passport sections
 * are present.
 *
 * Acceptance (issue #13):
 * - Page loads (no 500 error)
 * - Weaknesses column visible
 * - Strengths section visible
 * - Screenshot on failure (handled by playwright.config.ts)
 */

test.describe("PRD §8.3 Agent Passport", () => {
  test("passport page renders with weaknesses column", async ({ page }) => {
    await page.goto("/agent/safe-builder/passport");

    // Wait for the passport layout to render.
    await expect(page.locator(".passport-layout")).toBeVisible({ timeout: 15_000 });

    // Weaknesses column (data-testid="weaknesses-column") must be visible.
    // PRD §12.3: weaknesses column is NEVER empty.
    const weaknessesCol = page.getByTestId("weaknesses-column");
    await expect(weaknessesCol).toBeVisible();

    // At least one weakness pill is rendered.
    const weaknessPills = weaknessesCol.locator(".soft-pill.red");
    const pillCount = await weaknessPills.count();
    expect(pillCount).toBeGreaterThanOrEqual(1);

    // Strengths section heading is visible.
    await expect(page.getByRole("heading", { name: /strengths/i })).toBeVisible();

    // Contribution Summary section is visible.
    await expect(page.getByRole("heading", { name: /contribution summary/i })).toBeVisible();
  });
});
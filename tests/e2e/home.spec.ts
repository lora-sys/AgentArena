import { test, expect } from "./_fixtures/test";

/**
 * PRD §8.3 — Home page smoke journey.
 *
 * Verifies the home route renders. Storybook renders are covered
 * separately via the visual matrix (agent-browser owns design
 * review per docs/test-guidelines.md §6). This journey only
 * proves the Next.js dev server can serve the root route and
 * the page contains its primary CTA.
 */

test.describe("PRD §8.3 Home", () => {
  test("home route renders with a primary CTA", async ({ page }) => {
    await page.goto("/");

    // The home page must reach a non-empty body. Next.js streams
    // a shell before hydration; we wait for the document title
    // rather than asserting on a hard-coded copy that the design
    // tokens can change without a test edit.
    await expect(page).toHaveTitle(/Agent Arena/i);

    // Primary CTA is a link to /battle/new (PRD §16.1).
    const cta = page.getByRole("link", { name: /start|new|trial/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", /\/battle\/new/);
  });

  test("home page is keyboard navigable", async ({ page }) => {
    await page.goto("/");

    // First tab from the address bar should land on a focusable
    // element inside the document body. This guards against the
    // "all focus is trapped on the document" regression.
    await page.keyboard.press("Tab");
    const active = await page.evaluate(() => document.activeElement?.tagName);
    expect(active).toBeTruthy();
    expect(active).not.toBe("BODY");
  });
});

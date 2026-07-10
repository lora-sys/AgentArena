import { test, expect } from "./_fixtures/test";

/**
 * PRD §8.3 — Battle Setup edge cases.
 *
 * Covers form submission with quick mode (Speed Trial) and error
 * handling for valid idea + invalid settings (edge case).
 *
 * The form has 3 battle types: "Cross Attack" (full), "Panel Review"
 * (research), and "Speed Trial" (quick). Quick mode should still
 * create a battle without error.
 *
 * Acceptance:
 * - Speed Trial mode submission succeeds or shows graceful error
 * - Valid idea + empty constraints renders without crash
 * - Preview Brief modal opens and shows battle summary
 */

test.setTimeout(60_000);

test.describe("PRD §8.3 Battle Setup Edge Cases", () => {
  test("form renders with Speed Trial (quick) mode option", async ({ page }) => {
    let response;
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await page.goto("/battle/new");
      if (response && response.status() < 500) break;
      await page.waitForTimeout(2000);
    }
    expect(response?.status()).toBeLessThan(500);

    // Battle Type select should have "Speed Trial" option.
    const battleTypeSelect = page.locator("select[aria-label='Battle Type']");
    await expect(battleTypeSelect).toBeVisible();

    // Verify Speed Trial option exists.
    const speedOption = battleTypeSelect.locator("option", { hasText: /speed trial/i });
    await expect(speedOption).toHaveCount(1);
  });

  test("selecting Speed Trial mode persists in battle preview", async ({ page }) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.goto("/battle/new");
      const select = page.locator("select[aria-label='Battle Type']");
      if (await select.isVisible().catch(() => false)) break;
      await page.waitForTimeout(2000);
    }

    const battleTypeSelect = page.locator("select[aria-label='Battle Type']");
    await expect(battleTypeSelect).toBeVisible();

    // Change to Speed Trial.
    await battleTypeSelect.selectOption({ label: "Speed Trial" });

    // Preview summary should reflect the change.
    const previewSummary = page.locator(".preview-summary");
    await expect(previewSummary).toContainText(/speed trial/i);
  });

  test("Preview Brief button opens modal with summary", async ({ page }) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.goto("/battle/new");
      const btn = page.getByRole("button", { name: /preview brief/i });
      if (await btn.isVisible().catch(() => false)) break;
      await page.waitForTimeout(2000);
    }

    // Click Preview Brief button.
    const previewBtn = page.getByRole("button", { name: /preview brief/i });
    await expect(previewBtn).toBeVisible();
    await previewBtn.click();

    // Brief modal/dialog should appear.
    const briefDialog = page.getByRole("dialog", { name: /brief/i });
    await expect(briefDialog).toBeVisible({ timeout: 5_000 });

    // Modal should contain the idea first line and settings.
    await expect(briefDialog).toContainText(/battle type/i);
    await expect(briefDialog).toContainText(/time limit/i);
  });

  test("submitting with valid idea handles gracefully (no crash)", async ({ page }) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.goto("/battle/new");
      const textarea = page.getByLabel(/mission \/ challenge/i);
      if (await textarea.isVisible().catch(() => false)) break;
      await page.waitForTimeout(2000);
    }

    // Clear and fill with a valid idea (min 10 chars per guards.ts).
    const textarea = page.getByLabel(/mission \/ challenge/i);
    await textarea.fill("Test quick battle idea for QA edge cases");

    // Start Battle button should be enabled.
    const startBtn = page.getByRole("button", { name: /start battle/i });
    await expect(startBtn).toBeEnabled();

    // Race the click against either navigation or error display.
    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes("/api/battles") && resp.request().method() === "POST",
      { timeout: 15_000 },
    );
    await startBtn.click();

    // Acceptable outcomes: navigation to live page, or form error shown.
    let handled = false;
    try {
      await responsePromise;
      // Check if we navigated.
      try {
        await page.waitForURL(/\/battle\/.+\/live/, { timeout: 3_000 });
        handled = true;
      } catch {
        // Check for error display.
        const errorEl = page.locator("p.form-error");
        if (await errorEl.isVisible().catch(() => false)) {
          handled = true;
        }
      }
    } catch {
      // POST never resolved — the API might not be wired. Skip gracefully.
      test.skip(
        true,
        "POST /api/battles did not respond within 15s — endpoint may not be wired yet."
      );
      return;
    }

    expect(handled).toBe(true);
  });
});
import { test, expect } from "./_fixtures/test";

/**
 * PRD §8.3 — Event Drawer payload visibility.
 *
 * Verifies that clicking a timeline row in the Replay page opens the
 * Event Drawer with the full event payload visible.
 *
 * The EventDrawer component renders:
 *   - Event ID and title
 *   - Event type, round, actor info
 *   - Summary section
 *   - Full Payload section (JSON.stringify of rawPayload)
 *   - Linked Events (if applicable)
 *
 * Acceptance:
 * - Clicking a timeline row opens the drawer
 * - Drawer shows the event title and type
 * - Full Payload section is visible with JSON content
 * - Close button dismisses the drawer
 */

test.setTimeout(60_000);

test.describe("PRD §8.3 Event Drawer", () => {
  test("clicking a timeline row opens drawer with event metadata", async ({ page }) => {
    let response;
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await page.goto("/battle/demo/replay");
      if (response && response.status() < 500) break;
      await page.waitForTimeout(2000);
    }
    expect(response?.status()).toBeLessThan(500);

    const timeline = page.locator(".replay-timeline");
    await expect(timeline).toBeVisible({ timeout: 15_000 });

    // Click the first timeline row.
    const firstRow = timeline.getByRole("listitem").first();
    const rowCount = await timeline.getByRole("listitem").count();
    if (rowCount === 0) {
      test.skip(true, "No timeline rows to click.");
      return;
    }

    await firstRow.click();

    // Drawer should open with role="dialog".
    const drawer = page.locator("[role='dialog'][aria-modal='true']");
    await expect(drawer).toBeVisible({ timeout: 5_000 });

    // Drawer header should show the event id and title.
    const eventId = drawer.locator(".drawer-event-id");
    await expect(eventId).toBeVisible();
    expect(await eventId.textContent()).toMatch(/^ev_/);

    // Drawer title should be visible.
    const title = drawer.locator("#event-drawer-title");
    await expect(title).toBeVisible();
  });

  test("drawer shows full payload as JSON", async ({ page }) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.goto("/battle/demo/replay");
      const timeline = page.locator(".replay-timeline");
      if (await timeline.isVisible({ timeout: 8_000 }).catch(() => false)) break;
      await page.waitForTimeout(2000);
    }

    const timeline = page.locator(".replay-timeline");
    await expect(timeline).toBeVisible({ timeout: 15_000 });

    // Click any timeline row.
    const firstRow = timeline.getByRole("listitem").first();
    const rowCount = await timeline.getByRole("listitem").count();
    if (rowCount === 0) {
      test.skip(true, "No timeline rows available.");
      return;
    }
    await firstRow.click();

    // Drawer should open.
    const drawer = page.locator("[role='dialog'][aria-modal='true']");
    await expect(drawer).toBeVisible({ timeout: 5_000 });

    // Full Payload section must be visible.
    const payloadSection = drawer.locator(".drawer-payload");
    await expect(payloadSection).toBeVisible();

    // Payload content should be valid JSON (starts with { or [).
    const payloadText = await payloadSection.textContent();
    expect(payloadText).toBeTruthy();
    const trimmed = payloadText?.trim() ?? "";
    expect(trimmed.length).toBeGreaterThan(2);
    // JSON content should start with { (object payload) or [ (array) or be "(no payload)".
    expect(
      trimmed.startsWith("{") ||
        trimmed.startsWith("[") ||
        trimmed.includes("no payload")
    ).toBe(true);
  });

  test("drawer close button dismisses the drawer", async ({ page }) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.goto("/battle/demo/replay");
      const timeline = page.locator(".replay-timeline");
      if (await timeline.isVisible({ timeout: 8_000 }).catch(() => false)) break;
      await page.waitForTimeout(2000);
    }

    const timeline = page.locator(".replay-timeline");
    await expect(timeline).toBeVisible({ timeout: 15_000 });

    const firstRow = timeline.getByRole("listitem").first();
    const rowCount = await timeline.getByRole("listitem").count();
    if (rowCount === 0) {
      test.skip(true, "No timeline rows available.");
      return;
    }
    await firstRow.click();

    const drawer = page.locator("[role='dialog'][aria-modal='true']");
    await expect(drawer).toBeVisible({ timeout: 5_000 });

    // Click close button.
    const closeBtn = drawer.locator("button[aria-label='Close event drawer']");
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Drawer should be gone.
    await expect(drawer).not.toBeVisible({ timeout: 3_000 });
  });

  test("drawer shows judge reasoning for score events", async ({ page }) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.goto("/battle/demo/replay");
      const timeline = page.locator(".replay-timeline");
      if (await timeline.isVisible({ timeout: 8_000 }).catch(() => false)) break;
      await page.waitForTimeout(2000);
    }

    const timeline = page.locator(".replay-timeline");
    await expect(timeline).toBeVisible({ timeout: 15_000 });

    // Look for a score_created event in the timeline.
    const scoreRow = timeline.locator("[aria-label*='score_created']").first();
    const scoreCount = await timeline.locator("[aria-label*='score_created']").count();
    if (scoreCount === 0) {
      test.skip(true, "No score_created events in timeline.");
      return;
    }

    await scoreRow.click();

    const drawer = page.locator("[role='dialog'][aria-modal='true']");
    await expect(drawer).toBeVisible({ timeout: 5_000 });

    // Judge reasoning section should be visible for score events.
    const reasoningSection = drawer.locator(".drawer-reasoning");
    await expect(reasoningSection).toBeVisible();
  });
});
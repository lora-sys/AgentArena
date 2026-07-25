import { expect, test } from "@playwright/test";

test("landing can enter the verified Live Arena", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("AI AGENTS");
  await expect(page.getByRole("region", { name: "Live agent battle" }).locator("article")).toHaveCount(3);

  await page.goto("/battle/BA-2026-0024?mode=verified_replay");
  await expect(page.getByText("已验证演示", { exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Live agent battle" }).locator("article")).toHaveCount(3);
  await expect(page.getByText("Battle BA-2026-0024")).toBeVisible();
});

test("golden fatal takeover is replayable three times", async ({ page }) => {
  test.setTimeout(45_000);
  await page.goto("/battle/BA-2026-0024?mode=verified_replay");
  const arena = page.getByRole("region", { name: "Live agent battle" });
  await arena.getByRole("button", { name: "1×" }).click();
  await arena.getByRole("button", { name: "1.5×" }).click();

  for (let run = 0; run < 3; run += 1) {
    await arena.getByRole("button", { name: "回放" }).click();
    const takeover = page.getByRole("alertdialog", { name: "致命攻击" });
    await expect(takeover).toBeVisible({ timeout: 7_000 });
    await expect(takeover.getByText("attack_031", { exact: true })).toBeVisible();
    await expect(arena.locator(".hp-label b")).toHaveText(["72/100", "38/100", "81/100"]);
    await takeover.getByRole("button", { name: "关闭" }).click();
    await page.keyboard.press("Escape");
  }
});

test("mobile routes do not create page-level horizontal overflow", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "mobile-only contract");
  for (const route of ["/", "/battle/BA-2026-0024?mode=verified_replay"]) {
    await page.goto(route);
    const dimensions = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(dimensions.scroll).toBe(dimensions.client);
  }
});

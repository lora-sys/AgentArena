import { expect, test } from "@playwright/test";

test("four-route product shell stays navigable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("AI AGENTS");
  await expect(page.getByRole("region", { name: "Live agent battle" }).locator("article")).toHaveCount(3);

  await page.goto("/battles");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome back");

  await page.goto("/agent/infra-hacker/passport");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Evidence over biography");
  await expect(page.getByText("WEAKNESSES")).toBeVisible();

  await page.goto("/battle/demo");
  await expect(page.getByText("VERIFIED FIXTURE")).toBeVisible();
  await expect(page.getByRole("region", { name: "Live agent battle" }).locator("article")).toHaveCount(3);
});

test("example battle reaches the same champion state three times", async ({ page }) => {
  test.setTimeout(45_000);
  await page.goto("/battle/demo");
  const arena = page.getByRole("region", { name: "Live agent battle" });
  await arena.getByRole("button", { name: "1×" }).click();
  await arena.getByRole("button", { name: "1.5×" }).click();

  for (let run = 0; run < 3; run += 1) {
    await arena.getByRole("button", { name: "REPLAY" }).click();
    await expect(arena.getByRole("heading", { name: "CHAMPION REVEAL" })).toBeVisible({ timeout: 7_000 });
    await expect(arena.locator(".hp-label b")).toHaveText(["55/100", "95/100", "55/100"]);
  }
});

test("mobile routes do not create page-level horizontal overflow", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "mobile-only contract");
  for (const route of ["/", "/battle/demo", "/battles", "/agent/infra-hacker/passport"]) {
    await page.goto(route);
    const dimensions = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(dimensions.scroll).toBe(dimensions.client);
  }
});

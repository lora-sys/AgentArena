import { expect, test } from "@playwright/test";

const GOLDEN_BATTLE = "/battle/BA-2026-0024?mode=verified_replay";

test("三个中文主页面形成完整黄金演示闭环", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("智能体参赛");
  await expect(page.getByRole("region", { name: "战斗直播" }).locator("article")).toHaveCount(3);

  await page.getByRole("link", { name: "观看 90 秒已验证演示" }).click();
  await expect(page).toHaveURL(/BA-2026-0024.*verified_replay/);
  await expect(page.getByTestId("live-arena-page")).toBeVisible();
  await expect(page.getByTestId("hp-number")).toHaveText(["70", "68", "100"]);

  await page.goto("/battle/BA-2026-0024/champion");
  await expect(page.getByTestId("champion-page")).toContainText("传播设计师");
  await expect(page.getByTestId("champion-page")).toContainText("87/100");
  await expect(page.getByTestId("team-passport")).toContainText("弱点");
  await expect(page.getByTestId("team-passport")).toContainText("战斗旅程");
});

test("黄金 Live Arena 覆盖 Fatal、Evidence 与 Artifact 交互", async ({ page }) => {
  await page.goto(GOLDEN_BATTLE);

  await page.getByRole("button", { name: "查看证据 传播设计师" }).click();
  await expect(page.getByTestId("evidence-lens-modal")).toHaveAttribute("data-state", "full_breakdown");
  await expect(page.getByTestId("evidence-lens-modal")).toContainText("23/25");
  await page.getByRole("button", { name: "关闭" }).click();

  await page.getByRole("button", { name: "查看作品" }).first().click();
  await expect(page.getByTestId("artifact-modal")).toHaveAttribute("data-tab", "versions");
  await page.getByRole("tab", { name: "补丁差异" }).click();
  await expect(page.getByTestId("patch-diff")).toBeVisible();
  await page.getByRole("tab", { name: "测试结果" }).click();
  await expect(page.getByTestId("test-results")).toContainText("test_052");
  await page.getByRole("tab", { name: "关联证据" }).click();
  await expect(page.getByTestId("evidence-links")).toContainText("attack_031");

  await page.goto(`${GOLDEN_BATTLE}&fatal=1`);
  const fatal = page.getByTestId("fatal-takeover");
  await expect(fatal).toBeVisible();
  await expect(fatal).toContainText("88");
  await expect(fatal).toContainText("-50");
  await expect(fatal).toContainText("38");
});

test("实时模式失败时诚实进入证据不足态", async ({ page }) => {
  await page.route("**/api/battles", async (route) => {
    await route.fulfill({ status: 501, contentType: "application/json", body: JSON.stringify({ error: "disabled" }) });
  });
  await page.goto("/");
  await page.getByLabel("你的创意").fill("用于端到端验证的创意");
  await page.getByRole("button", { name: "实时开战" }).click();
  await expect(page).toHaveURL(/mode=demo_fallback/);
  await expect(page.getByText("实时 AI 证据不足")).toBeVisible();
  await expect(page.getByText("当前内容不会被包装成已验证结果")).toBeVisible();
});

test("三个主页面在 390px 不产生页面级横向溢出", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "仅验证移动端契约");
  for (const route of ["/", GOLDEN_BATTLE, "/battle/BA-2026-0024/champion"]) {
    await page.goto(route);
    const dimensions = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scroll).toBe(dimensions.client);
  }
});

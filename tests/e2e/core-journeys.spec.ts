import { expect, test } from "@playwright/test";

const GOLDEN_BATTLE = "/battle/BA-2026-0024?mode=verified_replay&replay=complete";

const LIVE_SUCCESS_EVENTS = [
  { id: "evt_brief", battleId: "live_e2e", round: "briefing", eventType: "brief_created", title: "简报下发", content: "用户创意：可恢复城市运动伙伴", createdAt: "2026-07-25T00:00:00.000Z", rawPayload: { idea: "可恢复城市运动伙伴" } },
  { id: "evt_team_infra", battleId: "live_e2e", round: "team_generation", actorId: "agent_infra_hacker_lead", eventType: "team_created", title: "架构黑客入场", content: "已就位", createdAt: "2026-07-25T00:00:00.100Z", rawPayload: { teamId: "team_infra_v1" } },
  { id: "evt_proposal_safe", battleId: "live_e2e", round: "proposal_round", actorId: "agent_safe_builder_lead", eventType: "proposal_created", title: "稳行提案", content: "离线可靠路线", createdAt: "2026-07-25T00:00:00.700Z", rawPayload: { teamId: "team_safe_v1", productName: "稳行", oneLiner: "离线可靠路线", technicalHighlight: "离线兜底" } },
  { id: "evt_proposal_viral", battleId: "live_e2e", round: "proposal_round", actorId: "agent_viral_designer_lead", eventType: "proposal_created", title: "热浪提案", content: "可传播任务卡", createdAt: "2026-07-25T00:00:00.800Z", rawPayload: { teamId: "team_viral_v1", productName: "热浪", oneLiner: "可传播任务卡", technicalHighlight: "分享闭环" } },
  { id: "evt_proposal_infra", battleId: "live_e2e", round: "proposal_round", actorId: "agent_infra_hacker_lead", eventType: "proposal_created", title: "动卡提案", content: "可验证运动伙伴", createdAt: "2026-07-25T00:00:01.000Z", rawPayload: { teamId: "team_infra_v1", productName: "动卡", oneLiner: "可验证运动伙伴", technicalHighlight: "证据锚定" } },
  { id: "evt_attack", battleId: "live_e2e", round: "cross_attack_round", actorId: "agent_safe_builder_lead", targetId: "team_infra_v1", eventType: "attack_created", title: "稳健构建者攻击架构黑客", content: "缺少真实数据", createdAt: "2026-07-25T00:00:02.000Z", rawPayload: { id: "attack_live", attackerTeamId: "team_safe_v1", targetTeamId: "team_infra_v1", severity: "medium", evidence: "缺少真实数据" } },
  { id: "evt_defense", battleId: "live_e2e", round: "defense_round", actorId: "agent_infra_hacker_lead", targetId: "team_safe_v1", eventType: "defense_created", title: "架构黑客防守", content: "补充数据链路", createdAt: "2026-07-25T00:00:03.000Z", rawPayload: { id: "defense_live", attackId: "attack_live", teamId: "team_infra_v1", acceptedAttack: true, revision: "补充数据链路" } },
  { id: "evt_defense_safe", battleId: "live_e2e", round: "defense_round", actorId: "agent_safe_builder_lead", eventType: "defense_created", title: "稳健构建者防守", content: "增加离线缓存", createdAt: "2026-07-25T00:00:03.100Z", rawPayload: { id: "defense_safe", attackId: "attack_safe", teamId: "team_safe_v1", acceptedAttack: true, revision: "增加离线缓存" } },
  { id: "evt_defense_viral", battleId: "live_e2e", round: "defense_round", actorId: "agent_viral_designer_lead", eventType: "defense_created", title: "传播设计师防守", content: "增加分享战报", createdAt: "2026-07-25T00:00:03.200Z", rawPayload: { id: "defense_viral", attackId: "attack_viral", teamId: "team_viral_v1", acceptedAttack: true, revision: "增加分享战报" } },
  { id: "evt_score", battleId: "live_e2e", round: "judging_round", actorId: "judge_panel", targetId: "team_infra_v1", eventType: "score_created", title: "架构黑客得分", content: "证据充分", createdAt: "2026-07-25T00:00:04.000Z", evidenceEventIds: ["evt_proposal_infra", "evt_attack", "evt_defense"], rawPayload: { teamId: "team_infra_v1", scores: { novelty: 8, feasibility: 9, demoWow: 8, technicalDepth: 9, userValue: 8, longTermPotential: 8 }, judgeComments: ["证据充分"], winningReason: "证据链完整" } },
  { id: "evt_champion", battleId: "live_e2e", round: "judging_round", actorId: "judge_panel", targetId: "team_infra_v1", eventType: "champion_selected", title: "冠军 · 架构黑客", content: "证据链完整", createdAt: "2026-07-25T00:00:05.000Z", evidenceEventIds: ["evt_score"], rawPayload: { winnerTeamId: "team_infra_v1" } },
  { id: "evt_artifact", battleId: "live_e2e", round: "artifact_generation", actorId: "artifact_writer", targetId: "team_infra_v1", eventType: "artifact_created", title: "动卡 产品简报", content: "冠军作品与可交互验收", createdAt: "2026-07-25T00:00:06.000Z", evidenceEventIds: ["evt_proposal_infra", "evt_score"], rawPayload: { id: "artifact_live", teamId: "team_infra_v1", passed: true, sourceEventIds: ["evt_proposal_infra", "evt_attack", "evt_defense", "evt_score"] } },
];

test("三个中文主页面形成完整黄金演示闭环", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("智能体参赛");
  await expect(page.getByRole("region", { name: "战斗直播" }).locator("article")).toHaveCount(3);

  await page.getByRole("link", { name: "观看 90 秒已验证演示" }).click();
  await expect(page).toHaveURL(/BA-2026-0024.*verified_replay/);
  await expect(page.getByTestId("live-arena-page")).toBeVisible();
  await expect(page.getByText("证据事件正在回放")).toBeVisible();
  await expect(page.getByTestId("hp-number")).toHaveText(["100", "88", "100"]);
  await expect(page.getByText("回放完成")).toBeVisible({ timeout: 45_000 });
  await expect(page.getByTestId("hp-number")).toHaveText(["70", "68", "100"]);

  await page.getByRole("button", { name: "查看冠军护照" }).click();
  await expect(page.getByTestId("champion-page")).toContainText("传播设计师");
  await expect(page.getByTestId("champion-page")).toContainText("87/100");
  await expect(page.getByTestId("team-passport")).toContainText("弱点");
  await expect(page.getByTestId("team-passport")).toContainText("战斗旅程");
});

test("已验证演示从入场事件开始渐进回放", async ({ page }) => {
  await page.goto("/battle/BA-2026-0024?mode=verified_replay");
  await expect(page.getByText("证据事件正在回放")).toBeVisible();
  await expect(page.getByTestId("hp-number")).toHaveText(["100", "88", "100"]);
  await expect(page.getByText("提案", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "暂停" }).click();
  await expect(page.getByRole("button", { name: "继续" })).toBeVisible();
});

test("产品严格收敛为三个页面，旧路由回到首页", async ({ page }) => {
  await page.goto("/battles");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("智能体参赛");

  await page.goto("/agent/infra-hacker/passport");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("navigation").getByRole("link")).toHaveCount(3);
});

test("黄金 Live Arena 覆盖 Fatal、Evidence 与 Artifact 交互", async ({ page }) => {
  await page.goto(GOLDEN_BATTLE);

  await page.getByRole("button", { name: "查看证据 传播设计师" }).click();
  await expect(page.getByTestId("evidence-lens-modal")).toHaveAttribute("data-state", "full_breakdown");
  await expect(page.getByTestId("evidence-lens-modal")).toContainText("23/25");
  await page.getByRole("button", { name: "关闭" }).click();

  const goldenArtifactButtons = page.getByRole("button", { name: /^查看作品 / });
  await goldenArtifactButtons.nth(0).click();
  await expect(page.getByTestId("artifact-modal")).toContainText("StudyGuard · 队伍方案快照");
  await expect(page.getByTestId("artifact-modal")).not.toContainText("ClashQuiz 交付物");
  await page.getByRole("button", { name: "关闭" }).click();

  await goldenArtifactButtons.nth(1).click();
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

test("成功实时模式自动覆盖 SSE、刷新恢复、作品、证据与冠军", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "桌面端覆盖完整成功实时链，移动端由三页面溢出测试覆盖");
  const streamBody = `${LIVE_SUCCESS_EVENTS.map((event) => `event: battle\ndata: ${JSON.stringify(event)}\n\n`).join("")}event: done\ndata: {}\n\n`;
  await page.route("**/api/battles/live_e2e/stream", (route) => route.fulfill({ status: 200, contentType: "text/event-stream", body: streamBody }));
  await page.route("**/api/battles/live_e2e/events", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ source: "local-event-store", status: "completed", events: LIVE_SUCCESS_EVENTS }) }));

  await page.goto("/battle/live_e2e?mode=live_runtime");
  await expect(page.getByText("实时 AI 竞技 · 证据与作品已封存")).toBeVisible();
  await expect(page.getByText("可恢复城市运动伙伴", { exact: false }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByText("可恢复城市运动伙伴", { exact: false }).first()).toBeVisible();

  const teamArtifactButtons = page.getByRole("button", { name: /^查看作品 / });
  await expect(teamArtifactButtons).toHaveCount(3);
  await teamArtifactButtons.nth(0).click();
  await expect(page.getByTestId("artifact-modal")).toContainText("稳行 · 队伍方案快照");
  await expect(page.getByTestId("version-compare")).toContainText("增加离线缓存");
  await expect(page.getByTestId("artifact-modal")).not.toContainText("动卡 产品简报");
  await page.getByRole("button", { name: "关闭" }).click();
  await teamArtifactButtons.nth(1).click();
  await expect(page.getByTestId("artifact-modal")).toContainText("热浪 · 队伍方案快照");
  await expect(page.getByTestId("version-compare")).toContainText("增加分享战报");
  await page.getByRole("button", { name: "关闭" }).click();
  await teamArtifactButtons.nth(2).click();
  await expect(page.getByTestId("artifact-modal")).toContainText("动卡 产品简报");
  await page.getByRole("button", { name: "关闭" }).click();

  await page.getByRole("button", { name: "打开冠军作品与交互演示" }).click();
  await expect(page.getByTestId("artifact-modal")).toContainText("动卡 产品简报");
  await page.getByRole("tab", { name: "关联证据" }).click();
  await expect(page.getByTestId("evidence-links")).toContainText("evt_proposal_infra");
  await expect(page.getByTestId("evidence-links")).not.toContainText("attack_031");
  await page.getByRole("button", { name: "关闭" }).click();

  await page.getByRole("button", { name: "查看证据 架构黑客" }).click();
  await expect(page.getByTestId("evidence-lens-modal")).toHaveAttribute("data-state", "full_breakdown");
  await page.getByRole("button", { name: /动卡提案 · 提案/ }).click();
  await expect(page.getByTestId("evidence-lens-modal")).toContainText("evt_proposal_infra");
  await page.getByRole("button", { name: "关闭" }).click();
  await page.getByRole("button", { name: "查看冠军护照" }).click();
  await expect(page).toHaveURL(/live_e2e\/champion.*live_runtime/);
  await expect(page.getByTestId("champion-page")).toContainText("架构黑客");
  await expect(page.getByTestId("team-passport")).toContainText("弱点");
  await expect(page.getByTestId("team-passport")).not.toContainText("稳健构建者防守");
  await expect(page.getByTestId("team-passport")).not.toContainText("传播设计师防守");
  await page.getByRole("button", { name: "查看战斗回放" }).first().click();
  await expect(page).toHaveURL(/live_e2e.*mode=live_runtime.*replay=1/);
  await expect(page.getByTestId("runtime-mode-badge")).toContainText("实时战斗回放");
  await expect(page.getByText("证据事件正在回放", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "暂停" }).click();
  await expect(page.getByText("回放完成", { exact: false })).toHaveCount(0);
  await page.getByRole("button", { name: "查看证据 架构黑客" }).click();
  await expect(page.getByTestId("evidence-lens-modal")).toHaveAttribute("data-state", "insufficient");
  await expect(page.getByTestId("evidence-lens-modal")).not.toContainText("evt_artifact");
  await page.getByRole("button", { name: "关闭" }).click();
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

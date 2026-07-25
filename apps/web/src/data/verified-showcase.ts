import type { ArtifactBundle, BattleEvent, TeamPassport } from "@agent-arena/contracts";
import fixture from "../../../../examples/fixtures/verified-showcase.json";
import { t } from "../i18n/zh";

export const VERIFIED_SHOWCASE_ID = "BA-2026-0024";

/** #39 Evidence Lens 与 #40 Team Passport 共用的唯一六维展示数据。 */
export const verifiedShowcasePassport: TeamPassport = {
  teamId: "viral_designer",
  teamName: "传播设计师",
  accentColor: "champion",
  totalScore: 87,
  scores: {
    feasibility_zh: { score: 23, max: 25, completeness: "full_breakdown", breakdown: [{ label: "48 小时范围可落地", delta: 25, evidenceEventIds: ["evt_004"] }, { label: "社交渠道收窄", delta: -2, evidenceEventIds: ["evt_012"] }] },
    originality: { score: 20, max: 25, completeness: "full_breakdown", breakdown: [{ label: "游戏化传播路径", delta: 22, evidenceEventIds: ["evt_004"] }, { label: "玩法参考较多", delta: -2, evidenceEventIds: ["evt_004"] }] },
    demoPower: { score: 19, max: 25, completeness: "full_breakdown", breakdown: [{ label: "分享卡演示记忆点", delta: 22, evidenceEventIds: ["evt_006"] }, { label: "Safari 初跑失败", delta: -3, evidenceEventIds: ["evt_006", "evt_008"] }] },
    technicalDepth: { score: 13, max: 15, completeness: "full_breakdown", breakdown: [{ label: "SVG 降级修复", delta: 14, evidenceEventIds: ["evt_013"] }, { label: "架构深度有限", delta: -1, evidenceEventIds: ["evt_004"] }] },
    clarity: { score: 8, max: 10, completeness: "full_breakdown", breakdown: [{ label: "叙事清晰", delta: 9, evidenceEventIds: ["evt_004"] }, { label: "边界说明不足", delta: -1, evidenceEventIds: ["evt_012"] }] },
    riskControl: { score: 4, max: 5, completeness: "full_breakdown", breakdown: [{ label: "致命攻击后恢复", delta: 5, evidenceEventIds: ["evt_011", "evt_016"] }, { label: "初始兼容风险", delta: -1, evidenceEventIds: ["evt_008"] }] },
  },
  strengths: ["演示力与传播路径清晰", "致命攻击后快速承认并修复", "补丁与回归测试形成完整证据闭环"],
  weaknesses: ["初版遗漏 Safari 16.4 兼容性", "技术深度仍弱于架构黑客", "真实社交渠道未在 48 小时内接入"],
  improvementSuggestions: ["把跨浏览器测试前移到提案阶段", "为分享卡建立无 Canvas 的默认渲染路径", "补充题目质量与隐私风险验证"],
  journey: [
    { round: "第 1 回合 · 提案", eventId: "evt_004", title: "ClashQuiz 游戏化提案" },
    { round: "交叉攻击", eventId: "evt_008", title: "attack_031 暴露 Safari 致命缺陷" },
    { round: "防守修正", eventId: "evt_013", title: "patch_048 切换 SVG 降级路径" },
    { round: "裁决", eventId: "evt_018", title: "传播设计师以 87/100 夺冠" },
  ],
  evidenceCompleteness: "full_breakdown",
};

const teamIds: Record<string, string> = {
  team_safe_v1: "safe_builder",
  team_viral_v1: "viral_designer",
  team_infra_v1: "infra_hacker",
};
export const verifiedShowcaseStandings = fixture.teams.map((team) => ({ teamId: teamIds[team.id] ?? team.id, score: Math.round(team.score * 10) }));

/**
 * verified_replay 的浏览器侧只读适配器。
 * 数据仍来自 P2 验证过的黄金 fixture；这里只做 UI 使用的 team id 归一化。
 */
export function verifiedShowcaseEvents(): BattleEvent[] {
  return fixture.events.map((event, index) => {
    const payload = event.rawPayload as Record<string, unknown> | undefined;
    const rawPayload = payload
      ? {
          ...payload,
          ...(typeof payload.teamId === "string" ? { teamId: teamIds[payload.teamId] ?? payload.teamId } : {}),
          ...(typeof payload.attackerTeamId === "string" ? { attackerTeamId: teamIds[payload.attackerTeamId] ?? payload.attackerTeamId } : {}),
          ...(typeof payload.targetTeamId === "string" ? { targetTeamId: teamIds[payload.targetTeamId] ?? payload.targetTeamId } : {}),
        }
      : undefined;
    return {
      id: event.id,
      battleId: VERIFIED_SHOWCASE_ID,
      round: event.round,
      actorId: event.actorId ? teamIds[event.actorId] ?? event.actorId : undefined,
      targetId: event.targetId ? teamIds[event.targetId] ?? event.targetId : undefined,
      eventType: event.eventType as BattleEvent["eventType"],
      title: event.title,
      content: event.content,
      rawPayload,
      createdAt: event.createdAt,
      sequence: index + 1,
    };
  });
}

function restoreVersionsFromUnifiedDiff(diffText: string) {
  const before: string[] = [];
  const after: string[] = [];
  for (const line of diffText.split("\n")) {
    if (line.startsWith("---") || line.startsWith("+++") || line.startsWith("@@")) continue;
    if (!line.startsWith("+")) before.push(line.startsWith("-") || line.startsWith(" ") ? line.slice(1) : line);
    if (!line.startsWith("-")) after.push(line.startsWith("+") || line.startsWith(" ") ? line.slice(1) : line);
  }
  return { before: before.join("\n").trim(), after: after.join("\n").trim() };
}

/** Artifact Viewer 的已验证作品包，仅从黄金 fixture 的 patch_048 事件还原。 */
export function verifiedShowcaseArtifactBundle(teamId?: string): ArtifactBundle | undefined {
  if (teamId !== "viral_designer") return undefined;
  const initialEvent = fixture.events.find((event) => event.id === "evt_006");
  const patchEvent = fixture.events.find((event) => event.id === "evt_013");
  const payload = patchEvent?.rawPayload as { artifactId?: string; diffText?: string } | undefined;
  if (!initialEvent || !patchEvent || !payload?.artifactId || !payload.diffText) return undefined;
  const restored = restoreVersionsFromUnifiedDiff(payload.diffText);
  const verifiedTestIds = new Set(["test_022", "test_032", "test_052"]);
  const testEvents = fixture.events.filter((event) => {
    const eventPayload = event.rawPayload as { id?: string; name?: string; passed?: boolean } | undefined;
    return eventPayload?.id && verifiedTestIds.has(eventPayload.id) && typeof eventPayload.name === "string" && typeof eventPayload.passed === "boolean";
  });
  const testResults = testEvents.map((event) => {
    const eventPayload = event.rawPayload as { id: string; teamId: string; name: string; passed: boolean; linkedEventIds?: string[] };
    return { ...eventPayload, teamId: teamIds[eventPayload.teamId] ?? eventPayload.teamId };
  });
  const linkedPayloadIds = new Set(["attack_031", "defense_041", "patch_048", "patch_049", "test_022", "test_032", "test_052"]);
  const linkedEvidenceEventIds = fixture.events.filter((event) => linkedPayloadIds.has((event.rawPayload as { id?: string } | undefined)?.id ?? "")).map((event) => event.id);
  return {
    artifactId: payload.artifactId,
    teamId,
    title: payload.artifactId,
    currentVersion: 2,
    versions: [
      { version: 1, label: t("artifact.version.v1"), contentText: restored.before, createdAt: initialEvent.createdAt, linkedEventId: initialEvent.id },
      { version: 2, label: t("artifact.version.v2"), contentText: restored.after, createdAt: patchEvent.createdAt, linkedEventId: patchEvent.id },
    ],
    patchDiffText: payload.diffText,
    testResults,
    linkedEvidenceEventIds,
  };
}

import type { BattleEvent } from "@agent-arena/contracts";
import fixture from "../../../../examples/fixtures/verified-showcase.json";

export const VERIFIED_SHOWCASE_ID = "BA-2026-0024";

const teamIds: Record<string, string> = {
  team_safe_v1: "safe_builder",
  team_viral_v1: "viral_designer",
  team_infra_v1: "infra_hacker",
};

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

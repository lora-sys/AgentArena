import type { ArtifactBundle, BattleEvent } from "@agent-arena/contracts";
import fixture from "../../../../examples/fixtures/verified-showcase.json";
import { t } from "../i18n/zh";

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
    testResults: [],
    linkedEvidenceEventIds: [initialEvent.id, patchEvent.id],
  };
}

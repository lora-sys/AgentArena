import { battleStatuses, type Battle, type BattleStatus } from "../schemas";

export const battleStateFlow: BattleStatus[] = [
  "idle",
  "briefing",
  "team_generation",
  "proposal_round",
  "cross_attack_round",
  "defense_round",
  "judging_round",
  "artifact_generation",
  "replay_generation",
  "completed",
];

export function getNextBattleStatus(status: BattleStatus): BattleStatus | undefined {
  const currentIndex = battleStateFlow.indexOf(status);
  return currentIndex === -1 ? undefined : battleStateFlow[currentIndex + 1];
}

export function canTransitionBattleStatus(from: BattleStatus, to: BattleStatus): boolean {
  if (!battleStatuses.includes(from) || !battleStatuses.includes(to)) {
    return false;
  }

  if (to === "failed" || to === "retrying" || to === "cancelled") {
    return true;
  }

  return getNextBattleStatus(from) === to;
}

export function advanceBattleStatus(battle: Battle, status: BattleStatus, updatedAt: string): Battle {
  if (!canTransitionBattleStatus(battle.status, status)) {
    throw new Error(`Invalid battle status transition from ${battle.status} to ${status}`);
  }

  return {
    ...battle,
    status,
    updatedAt,
  };
}

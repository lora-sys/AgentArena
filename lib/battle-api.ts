import {
  battleTypes,
  defaultBattleSettings,
  outputTargets,
  preferences,
  runDemoBattle,
  timeLimits,
  type BattleSettings,
  type CompletedBattleBundle,
  type OutputTarget,
} from "@/arena";

type BattleCreateInput = {
  idea?: unknown;
  settings?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isOneOf = <T extends readonly string[]>(value: unknown, options: T): value is T[number] =>
  typeof value === "string" && options.includes(value);

const normalizeOutputTargets = (value: unknown): OutputTarget[] => {
  if (!Array.isArray(value)) {
    return [...defaultBattleSettings.outputTargets];
  }

  const targets = value.filter((target): target is OutputTarget => isOneOf(target, outputTargets));
  return targets.length > 0 ? Array.from(new Set(targets)) : [...defaultBattleSettings.outputTargets];
};

export const normalizeBattleCreateInput = (payload: BattleCreateInput) => {
  const settings = isRecord(payload.settings) ? payload.settings : {};
  const idea =
    typeof payload.idea === "string" && payload.idea.trim().length > 0
      ? payload.idea.trim()
      : undefined;

  return {
    idea,
    settings: {
      battleType: isOneOf(settings.battleType, battleTypes) ? settings.battleType : defaultBattleSettings.battleType,
      timeLimit: isOneOf(settings.timeLimit, timeLimits) ? settings.timeLimit : defaultBattleSettings.timeLimit,
      preference: isOneOf(settings.preference, preferences) ? settings.preference : defaultBattleSettings.preference,
      outputTargets: normalizeOutputTargets(settings.outputTargets),
    } satisfies BattleSettings,
  };
};

export const makeBattleId = (idea: string | undefined) => {
  const seed = idea ?? "agent-arena-demo";
  const hash = Array.from(seed).reduce((sum, character) => (sum * 31 + character.charCodeAt(0)) >>> 0, 7);
  return `battle-${hash.toString(36)}`;
};

export const runBattleFromPayload = (payload: BattleCreateInput, battleId?: string): CompletedBattleBundle => {
  const input = normalizeBattleCreateInput(payload);
  return runDemoBattle({
    battleId: battleId ?? makeBattleId(input.idea),
    idea: input.idea,
    settings: input.settings,
    startAt: "2026-07-04T18:30:00.000Z",
  });
};

export const summarizeBattleBundle = (bundle: CompletedBattleBundle) => {
  const winner = bundle.teams.find((team) => team.id === bundle.battle.winnerTeamId);
  const winnerScore = bundle.scores.find((score) => score.teamId === bundle.battle.winnerTeamId);

  return {
    id: bundle.battle.id,
    title: bundle.battle.title,
    idea: bundle.battle.idea,
    status: bundle.battle.status,
    type: bundle.battle.type,
    winnerTeamId: bundle.battle.winnerTeamId,
    winnerName: winner?.name,
    winnerScore: winnerScore?.totalScore,
    teamCount: bundle.teams.length,
    eventCount: bundle.events.length,
    artifactCount: bundle.artifacts.length,
    passportCount: bundle.passports.length,
    createdAt: bundle.battle.createdAt,
    updatedAt: bundle.battle.updatedAt,
  };
};

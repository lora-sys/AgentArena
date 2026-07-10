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

// Crockford base32 alphabet: 0-9 A-Z, excluding I, L, O, U.
// See PRD §8: battle IDs follow `btl_<8-char base32>` (40 bits of entropy).
const CROCKFORD_BASE32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

const toBase32Eight = (input: string): string => {
  // FNV-1a 32-bit hash → 5 bytes of entropy → 8 base32 chars.
  // FNV offset basis and prime per http://www.isthe.com/chongo/tech/comp/fnv/
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    // 32-bit FNV prime: 16777619
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  // Encode 32 bits (hash) as 8 base32 characters (ceil(32 / 5) = 7, round up to 8).
  // Mix in a second pass over the input to add more entropy for longer seeds.
  let hash2 = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash2 ^= input.charCodeAt(i);
    hash2 = Math.imul(hash2, 0x01000193) >>> 0;
  }
  // Combine: 32 bits from hash1 + 8 bits from hash2 = 40 bits → exactly 8 base32 chars.
  const combined = (BigInt(hash) << 8n) | BigInt(hash2 & 0xff);
  let out = "";
  let value = combined;
  for (let i = 0; i < 8; i += 1) {
    const index = Number(value & 0x1fn);
    out = CROCKFORD_BASE32[index] + out;
    value >>= 5n;
  }
  return out;
};

export const makeBattleId = (idea: string | undefined) => {
  const seed = idea ?? "agent-arena-demo";
  return `btl_${toBase32Eight(seed)}`;
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

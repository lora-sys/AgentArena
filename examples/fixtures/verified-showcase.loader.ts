import json from "./verified-showcase.json";
import {
  assertAgentPassport,
  assertArtifact,
  assertAttack,
  assertBattle,
  assertBattleBrief,
  assertBattleEvent,
  assertDefense,
  assertProposal,
  assertScore,
  assertTeam,
} from "../../arena/schemas/validators";
import type {
  AgentPassport,
  Artifact,
  Attack,
  BattleEvent,
  BattleReplay,
  CalculatedScore,
  CompletedBattleBundle,
  Defense,
  EveAgentDefinition,
  Proposal,
  Team,
} from "../../arena/schemas/types";

function assertNoFailure(label: string, fn: () => void): void {
  try {
    fn();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`verified-showcase (BA-2026-0024) fixture invalid at ${label}: ${message}`);
  }
}

/**
 * Loader for the golden verified_replay storyline.
 *
 * Frozen invariants (write-locked in docs/DEV-STANDARDS.md §8):
 *  - battle id = BA-2026-0024
 *  - champion = team_viral_v1 (传播设计师) 87/100
 *  - team totals: safe 78 / viral 87 / infra 84
 *  - fatal attack_031 → viral HP 88 → 38
 *  - defense_041 accepted + test_052 passed → viral HP 38 → 68 (60% of fatal 50 = 30)
 *  - patch_048 + patch_049 ship the SVG fallback diff + the Safari 16.4 regression test
 */
export function loadVerifiedShowcase(): CompletedBattleBundle {
  const bundle = json as CompletedBattleBundle;

  assertNoFailure("battle", () => assertBattle(bundle.battle));
  assertNoFailure("brief", () => assertBattleBrief(bundle.brief));

  if (bundle.battle.id !== "BA-2026-0024") {
    throw new Error(`verified-showcase fixture invalid at battle.id: expected BA-2026-0024, got ${bundle.battle.id}`);
  }
  if (bundle.battle.winnerTeamId !== "team_viral_v1") {
    throw new Error(`verified-showcase fixture invalid at battle.winnerTeamId: expected team_viral_v1, got ${bundle.battle.winnerTeamId}`);
  }

  for (const [i, team] of (bundle.teams as Team[]).entries()) {
    assertNoFailure(`teams[${i}]`, () => assertTeam(team));
  }
  for (const [i, proposal] of (bundle.proposals as Proposal[]).entries()) {
    assertNoFailure(`proposals[${i}]`, () => assertProposal(proposal));
  }
  for (const [i, attack] of (bundle.attacks as Attack[]).entries()) {
    assertNoFailure(`attacks[${i}]`, () => assertAttack(attack));
  }
  for (const [i, defense] of (bundle.defenses as Defense[]).entries()) {
    assertNoFailure(`defenses[${i}]`, () => assertDefense(defense));
  }
  for (const [i, score] of (bundle.scores as CalculatedScore[]).entries()) {
    assertNoFailure(`scores[${i}]`, () => assertScore(score));
  }
  for (const [i, artifact] of (bundle.artifacts as Artifact[]).entries()) {
    assertNoFailure(`artifacts[${i}]`, () => assertArtifact(artifact));
  }
  for (const [i, passport] of (bundle.passports as AgentPassport[]).entries()) {
    assertNoFailure(`passports[${i}]`, () => assertAgentPassport(passport));
  }
  for (const [i, event] of (bundle.events as BattleEvent[]).entries()) {
    assertNoFailure(`events[${i}]`, () => assertBattleEvent(event));
  }

  const replay: BattleReplay = bundle.replay;
  if (!replay || typeof replay !== "object" || !Array.isArray(replay.segments)) {
    throw new Error("verified-showcase fixture invalid at replay: replay must have segments array");
  }

  const agentDefinitions: EveAgentDefinition[] = bundle.agentDefinitions;
  if (!Array.isArray(agentDefinitions)) {
    throw new Error("verified-showcase fixture invalid at agentDefinitions: must be an array");
  }

  if (typeof bundle.exportMarkdown !== "string") {
    throw new Error("verified-showcase fixture invalid at exportMarkdown: must be a string");
  }

  // ---- Golden-storyline structural invariants (write-locked) ----------------
  const events = bundle.events as BattleEvent[];
  const fatalAttack = events.find(
    (event) =>
      event.eventType === "attack_created" &&
      typeof event.rawPayload === "object" &&
      event.rawPayload !== null &&
      (event.rawPayload as { id?: string }).id === "attack_031",
  );
  if (!fatalAttack) throw new Error("verified-showcase fixture: missing fatal attack_031 event");
  const fatalSeverity = (fatalAttack.rawPayload as { severity?: string }).severity;
  if (fatalSeverity !== "fatal") {
    throw new Error(`verified-showcase fixture: attack_031 severity must be "fatal", got ${fatalSeverity}`);
  }

  const defense041 = events.find(
    (event) =>
      event.eventType === "defense_created" &&
      typeof event.rawPayload === "object" &&
      event.rawPayload !== null &&
      (event.rawPayload as { id?: string }).id === "defense_041",
  );
  if (!defense041) throw new Error("verified-showcase fixture: missing defense_041 event");
  if ((defense041.rawPayload as { acceptedAttack?: boolean }).acceptedAttack !== true) {
    throw new Error("verified-showcase fixture: defense_041 must be acceptedAttack=true");
  }

  const testIds = new Set(
    events
      .filter((event) => event.eventType === "artifact_created")
      .map((event) => (event.rawPayload as { id?: string } | null)?.id)
      .filter((id): id is string => typeof id === "string"),
  );
  for (const required of ["test_022", "test_032", "test_052", "patch_048", "patch_049"]) {
    if (!testIds.has(required)) {
      throw new Error(`verified-showcase fixture: missing required artifact/test event ${required}`);
    }
  }

  return bundle;
}

import json from "./hackathon-001.json";
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
  Battle,
  BattleBrief,
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
    throw new Error(`hackathon-001 fixture invalid at ${label}: ${message}`);
  }
}

export function loadHackathon001(): CompletedBattleBundle {
  const bundle = json as CompletedBattleBundle;

  assertNoFailure("battle", () => assertBattle(bundle.battle));
  assertNoFailure("brief", () => assertBattleBrief(bundle.brief));

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
    throw new Error("hackathon-001 fixture invalid at replay: replay must have segments array");
  }

  const agentDefinitions: EveAgentDefinition[] = bundle.agentDefinitions;
  if (!Array.isArray(agentDefinitions)) {
    throw new Error("hackathon-001 fixture invalid at agentDefinitions: must be an array");
  }

  if (typeof bundle.exportMarkdown !== "string") {
    throw new Error("hackathon-001 fixture invalid at exportMarkdown: must be a string");
  }

  return bundle;
}
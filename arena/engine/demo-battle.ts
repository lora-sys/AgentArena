import { InMemoryBattleEventStore } from "../events/event-store";
import {
  type Battle,
  type BattleActorType,
  type BattleEvent,
  type BattleEventType,
  type BattleSettings,
  type CompletedBattleBundle,
} from "../schemas";
import { advanceBattleStatus } from "./battle-state";
import { generateArtifactsForChampion, packageArtifactsAsMarkdown } from "./artifacts";
import {
  createDemoAgentDefinitions,
  createDemoAttacks,
  createDemoBattle,
  createDemoBattleBrief,
  createDemoDefenses,
  createDemoFixtureRuntime,
  createDemoProposals,
  createDemoScores,
  createDemoTeams,
  demoBattleIdea,
  normalizeBattleSettings,
  type DemoFixtureRuntime,
} from "./fixtures";
import { generateAgentPassports } from "./passport";
import { generateReplayFromEvents } from "./replay";
import { attachCalculatedScores, selectChampion } from "./scoring";

export type RunDemoBattleInput = {
  battleId?: string;
  idea?: string;
  settings?: Partial<BattleSettings>;
  startAt?: string;
};

type EmitEventInput = {
  round: string;
  actorType: BattleActorType;
  actorId?: string;
  targetId?: string;
  eventType: BattleEventType;
  title: string;
  content: string;
  rawPayload?: unknown;
};

const emitBattleEvent = (
  store: InMemoryBattleEventStore,
  runtime: DemoFixtureRuntime,
  battle: Battle,
  input: EmitEventInput,
): BattleEvent =>
  store.append({
    id: runtime.nextId("event"),
    battleId: battle.id,
    round: input.round,
    actorType: input.actorType,
    actorId: input.actorId,
    targetId: input.targetId,
    eventType: input.eventType,
    title: input.title,
    content: input.content,
    rawPayload: input.rawPayload,
    createdAt: runtime.now(),
  });

export function runDemoBattle(input: RunDemoBattleInput = {}): CompletedBattleBundle {
  const runtime = createDemoFixtureRuntime({ startAt: input.startAt });
  const settings = normalizeBattleSettings(input.settings);
  const store = new InMemoryBattleEventStore();
  let battle = createDemoBattle(
    {
      id: input.battleId,
      idea: input.idea ?? demoBattleIdea,
      settings,
    },
    runtime,
  );

  battle = advanceBattleStatus(battle, "briefing", runtime.now());
  const brief = createDemoBattleBrief(battle.idea, settings);
  emitBattleEvent(store, runtime, battle, {
    round: "briefing",
    actorType: "system",
    eventType: "brief_created",
    title: "Battle brief created",
    content: brief.goal,
    rawPayload: brief,
  });

  battle = advanceBattleStatus(battle, "team_generation", runtime.now());
  const teams = createDemoTeams(battle.id);
  const agentDefinitions = createDemoAgentDefinitions(teams);
  for (const team of teams) {
    emitBattleEvent(store, runtime, battle, {
      round: "team_generation",
      actorType: "system",
      actorId: team.id,
      eventType: "team_created",
      title: `${team.name} entered battle`,
      content: team.strategy,
      rawPayload: team,
    });
  }

  battle = advanceBattleStatus(battle, "proposal_round", runtime.now());
  const proposals = createDemoProposals(teams);
  for (const proposal of proposals) {
    emitBattleEvent(store, runtime, battle, {
      round: "proposal_round",
      actorType: "team",
      actorId: proposal.teamId,
      eventType: "proposal_created",
      title: `${proposal.productName} proposed`,
      content: proposal.oneLiner,
      rawPayload: proposal,
    });
  }

  battle = advanceBattleStatus(battle, "cross_attack_round", runtime.now());
  const attacks = createDemoAttacks();
  for (const attack of attacks) {
    emitBattleEvent(store, runtime, battle, {
      round: "cross_attack_round",
      actorType: "team",
      actorId: attack.attackerTeamId,
      targetId: attack.targetTeamId,
      eventType: "attack_created",
      title: `${attack.attackerTeamId} attacked ${attack.targetTeamId}`,
      content: attack.claim,
      rawPayload: attack,
    });
  }

  battle = advanceBattleStatus(battle, "defense_round", runtime.now());
  const defenses = createDemoDefenses(attacks);
  for (const defense of defenses) {
    emitBattleEvent(store, runtime, battle, {
      round: "defense_round",
      actorType: "team",
      actorId: defense.teamId,
      eventType: "defense_created",
      title: `${defense.teamId} defended`,
      content: defense.revision,
      rawPayload: defense,
    });
  }

  battle = advanceBattleStatus(battle, "judging_round", runtime.now());
  const scores = attachCalculatedScores(createDemoScores());
  for (const score of scores) {
    emitBattleEvent(store, runtime, battle, {
      round: "judging_round",
      actorType: "judge",
      actorId: "judge_panel",
      targetId: score.teamId,
      eventType: "score_created",
      title: `${score.teamId} scored ${score.totalScore.toFixed(2)}`,
      content: score.judgeComments.join(" "),
      rawPayload: score,
    });
  }

  const championScore = selectChampion(
    scores,
    teams.map((team) => team.id),
  );
  const championProposal = proposals.find((proposal) => proposal.teamId === championScore.teamId);
  if (championProposal === undefined) {
    throw new Error(`Champion proposal missing for team ${championScore.teamId}`);
  }

  battle = {
    ...battle,
    winnerTeamId: championScore.teamId,
    updatedAt: runtime.now(),
  };
  const scoredTeams = teams.map((team) => ({
    ...team,
    score: scores.find((score) => score.teamId === team.id)?.totalScore,
  }));

  emitBattleEvent(store, runtime, battle, {
    round: "judging_round",
    actorType: "system",
    actorId: "battle_engine",
    targetId: championScore.teamId,
    eventType: "champion_selected",
    title: `${championProposal.productName} wins`,
    content: `${championProposal.productName} won with a calculated score of ${championScore.totalScore.toFixed(2)}.`,
    rawPayload: {
      winnerTeamId: championScore.teamId,
      totalScore: championScore.totalScore,
      winningReason: championScore.winningReason,
    },
  });

  battle = advanceBattleStatus(battle, "artifact_generation", runtime.now());
  const artifacts = generateArtifactsForChampion({
    battle,
    settings,
    championProposal,
    championScore,
    nextId: runtime.nextId,
  });
  for (const artifact of artifacts) {
    emitBattleEvent(store, runtime, battle, {
      round: "artifact_generation",
      actorType: "system",
      actorId: "artifact_writer",
      eventType: "artifact_created",
      title: `${artifact.title} generated`,
      content: artifact.content.split("\n").find((line) => line.trim().length > 0) ?? artifact.title,
      rawPayload: artifact,
    });
  }

  battle = advanceBattleStatus(battle, "replay_generation", runtime.now());
  const replay = generateReplayFromEvents({
    battle,
    events: store.list(battle.id),
    nextId: runtime.nextId,
    now: runtime.now,
  });
  emitBattleEvent(store, runtime, battle, {
    round: "replay_generation",
    actorType: "system",
    actorId: "battle_engine",
    eventType: "replay_created",
    title: "Battle replay generated",
    content: replay.summary,
    rawPayload: replay,
  });

  const passports = generateAgentPassports({
    battleId: battle.id,
    teams: scoredTeams,
    agentDefinitions,
    proposals,
    attacks,
    defenses,
    scores,
    nextId: runtime.nextId,
  });
  emitBattleEvent(store, runtime, battle, {
    round: "replay_generation",
    actorType: "system",
    actorId: "battle_engine",
    eventType: "passport_created",
    title: "Agent passport snapshot generated",
    content: `${passports.length} passports generated from proposals, attacks, defenses, and scores.`,
    rawPayload: passports,
  });

  battle = advanceBattleStatus(battle, "completed", runtime.now());

  return {
    battle,
    settings,
    brief,
    teams: scoredTeams,
    agentDefinitions,
    proposals,
    attacks,
    defenses,
    scores,
    artifacts,
    replay,
    passports,
    events: store.list(battle.id),
    exportMarkdown: packageArtifactsAsMarkdown(artifacts),
  };
}

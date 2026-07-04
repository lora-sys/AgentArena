import {
  assertAttack,
  assertBattle,
  assertBattleBrief,
  assertDefense,
  assertProposal,
  assertScore,
  assertTeam,
  defaultBattleSettings,
  type Attack,
  type Battle,
  type BattleBrief,
  type BattleSettings,
  type Defense,
  type EveAgentDefinition,
  type Proposal,
  type Score,
  type Team,
} from "../schemas";

export const demoBattleIdea =
  "I want to build a product around the agent metaverse for a hackathon. It should be fun, technically interesting, and not just another multi-agent workspace.";

export type DemoFixtureRuntime = {
  nextId: (prefix: string) => string;
  now: () => string;
};

export type DemoFixtureRuntimeOptions = {
  startAt?: string;
};

export function createDemoFixtureRuntime(options: DemoFixtureRuntimeOptions = {}): DemoFixtureRuntime {
  const counters = new Map<string, number>();
  const startMs = Date.parse(options.startAt ?? "2026-01-01T00:00:00.000Z");
  let tick = 0;

  return {
    nextId(prefix: string): string {
      const nextValue = (counters.get(prefix) ?? 0) + 1;
      counters.set(prefix, nextValue);
      return `${prefix}_${String(nextValue).padStart(3, "0")}`;
    },
    now(): string {
      const timestamp = new Date(startMs + tick * 1000).toISOString();
      tick += 1;
      return timestamp;
    },
  };
}

export function normalizeBattleSettings(settings: Partial<BattleSettings> = {}): BattleSettings {
  return {
    battleType: settings.battleType ?? defaultBattleSettings.battleType,
    timeLimit: settings.timeLimit ?? defaultBattleSettings.timeLimit,
    preference: settings.preference ?? defaultBattleSettings.preference,
    outputTargets: settings.outputTargets ?? [...defaultBattleSettings.outputTargets],
  };
}

export type CreateDemoBattleInput = {
  id?: string;
  idea?: string;
  settings?: Partial<BattleSettings>;
};

export function createDemoBattle(input: CreateDemoBattleInput = {}, runtime = createDemoFixtureRuntime()): Battle {
  const settings = normalizeBattleSettings(input.settings);
  const createdAt = runtime.now();
  const battle: Battle = {
    id: input.id ?? runtime.nextId("battle"),
    title: "Agent Metaverse Hackathon Battle",
    idea: input.idea ?? demoBattleIdea,
    type: settings.battleType,
    status: "idle",
    constraints: {
      timeLimit: settings.timeLimit,
      outputTargets: [...settings.outputTargets],
      preference: settings.preference,
    },
    createdAt,
    updatedAt: createdAt,
  };

  assertBattle(battle);
  return battle;
}

export function createDemoBattleBrief(idea: string, settings: BattleSettings): BattleBrief {
  const brief: BattleBrief = {
    goal: `Turn the messy idea into a ${settings.timeLimit} hackathon project direction: ${idea}`,
    constraints: [
      "Must avoid becoming a generic multi-agent workspace.",
      "Must produce a demoable champion plan and replayable evidence.",
      "Must keep agent execution mocked and deterministic for the MVP skeleton.",
      `Preference mode: ${settings.preference}.`,
    ],
    targetUser: "Hackathon builders who need a memorable, buildable AI-agent product direction quickly.",
    successCriteria: [
      "Three distinct Eve-style teams propose competing directions.",
      "Every team receives cross attacks and responds with a defense or revision.",
      "Scores are calculated by code using the MVP weights.",
      "Champion artifacts, replay, and passport snapshots are generated from product data.",
    ],
    requiredArtifacts: Array.from(new Set(["product_brief", ...settings.outputTargets])),
  };

  assertBattleBrief(brief);
  return brief;
}

export function createDemoTeams(battleId: string): Team[] {
  const teams: Team[] = [
    {
      id: "safe_builder",
      battleId,
      name: "Safe Builder",
      strategy: "Make the safest, most feasible, most buildable hackathon project.",
      riskProfile: "safe",
      eveAgentDirectory: "agents/safe-builder",
    },
    {
      id: "viral_designer",
      battleId,
      name: "Viral Designer",
      strategy: "Make the most memorable, screenshot-worthy, story-driven hackathon project.",
      riskProfile: "aggressive",
      eveAgentDirectory: "agents/viral-designer",
    },
    {
      id: "infra_hacker",
      battleId,
      name: "Infra Hacker",
      strategy: "Make the most technically deep and future-facing hackathon project.",
      riskProfile: "balanced",
      eveAgentDirectory: "agents/infra-hacker",
    },
  ];

  teams.forEach(assertTeam);
  return teams;
}

export function createDemoAgentDefinitions(teams: Team[]): EveAgentDefinition[] {
  return teams.map((team) => ({
    id: `${team.id}_agent`,
    name: team.name,
    role: team.strategy,
    teamId: team.id,
    directoryPath: team.eveAgentDirectory,
    instructionsPath: `${team.eveAgentDirectory}/instructions.md`,
    skills:
      team.id === "safe_builder"
        ? ["mvp-scoping", "feasibility-check", "demo-stability"]
        : team.id === "viral_designer"
          ? ["novelty-detection", "viral-hook", "story-framing", "share-loop"]
          : ["protocol-design", "runtime-design", "evidence-chain", "future-architecture"],
    tools: ["format_proposal"],
    model: "mocked-eve-mvp",
  }));
}

export function createDemoProposals(teams: Team[]): Proposal[] {
  const teamIds = new Set(teams.map((team) => team.id));
  const proposals: Proposal[] = [
    {
      teamId: "safe_builder",
      productName: "Proof Sprint",
      oneLiner: "A focused 48-hour command center that turns a vague AI idea into a stable demo plan.",
      targetUser: "Small hackathon teams that need a practical build path before they chase spectacle.",
      problem: "Messy agent ideas sprawl into too many workflows, leaving teams with no reliable demo by judging time.",
      solution: "Run the idea through scoped planning, dependency checks, and a demo stability checklist before coding.",
      mvpFeatures: [
        "Idea intake and battle brief",
        "Feature triage board",
        "Demo risk checklist",
        "Artifact export pack",
      ],
      demoPlan: "Show a vague prompt becoming a scoped plan, risk board, and exportable build checklist in one pass.",
      technicalHighlight: "A deterministic state machine that prevents agent output from changing the battle order.",
      risks: ["May feel too close to ordinary planning tools.", "Needs a stronger public reveal moment."],
      whyThisCanWin: "It is the safest project to finish and the easiest for judges to understand.",
    },
    {
      teamId: "viral_designer",
      productName: "Agent Arena",
      oneLiner: "An AI debate arena where agent teams battle, get judged, and leave replayable proof of their work.",
      targetUser: "Hackathon builders and agent developers who want a memorable way to compare product directions.",
      problem: "People cannot tell which agent team is actually useful because every agent claims competence.",
      solution: "Make teams compete in public rounds with proposals, attacks, defenses, code-calculated scores, and replay.",
      mvpFeatures: [
        "Three Eve-style team entrances",
        "Proposal comparison stage",
        "Cross-attack timeline",
        "Judge scoreboard",
        "Replay and passport snapshot",
      ],
      demoPlan: "Start with a messy agent-metaverse idea, reveal three teams, show attacks live, then crown a champion.",
      technicalHighlight: "Event-sourced replay and passport data make every screenshot traceable to a battle event.",
      risks: ["Could over-index on showmanship.", "Needs seeded fallback data so the demo never stalls."],
      whyThisCanWin: "It is easy to remember, has strong screenshots, and turns agent evaluation into a story.",
    },
    {
      teamId: "infra_hacker",
      productName: "Agent Reputation Protocol",
      oneLiner: "A portable evidence layer that turns agent battle outcomes into reputation data.",
      targetUser: "Agent builders who want reputation that can move across tools, teams, and marketplaces.",
      problem: "Agent reputation is trapped in claims, leaderboards, or private logs that are hard to audit.",
      solution: "Emit normalized evidence events, derive passport claims, and expose a future-ready reputation surface.",
      mvpFeatures: [
        "Evidence event schema",
        "Passport generator",
        "Score provenance view",
        "Exportable agent card",
      ],
      demoPlan: "Show one battle producing portable passport records and a protocol-shaped evidence trail.",
      technicalHighlight: "A schema-first event log can become an A2A-ready reputation backbone later.",
      risks: ["Harder to explain quickly.", "Protocol depth may be more compelling after the hackathon."],
      whyThisCanWin: "It gives the project a serious technical spine and a believable long-term network path.",
    },
  ].filter((proposal) => teamIds.has(proposal.teamId));

  proposals.forEach(assertProposal);
  return proposals;
}

export function createDemoAttacks(): Attack[] {
  const attacks: Attack[] = [
    {
      id: "attack_viral_to_safe_generic",
      attackerTeamId: "viral_designer",
      targetTeamId: "safe_builder",
      attackType: "too_generic",
      claim: "Proof Sprint risks reading like a standard agent workspace with better packaging.",
      evidence: "Its strongest demo moment is scope control, not a surprising arena mechanic.",
      severity: "high",
      suggestedFix: "Add a public replay or proof layer so the planning output feels ownable.",
    },
    {
      id: "attack_infra_to_safe_depth",
      attackerTeamId: "infra_hacker",
      targetTeamId: "safe_builder",
      attackType: "weak_technical_depth",
      claim: "Proof Sprint does not show enough technical depth for an agent-metaverse hackathon.",
      evidence: "The proposal leans on planning boards and checklists instead of evidence or reputation infrastructure.",
      severity: "medium",
      suggestedFix: "Expose the battle state machine and event log as the technical centerpiece.",
    },
    {
      id: "attack_safe_to_viral_feasibility",
      attackerTeamId: "safe_builder",
      targetTeamId: "viral_designer",
      attackType: "poor_feasibility",
      claim: "Agent Arena could become too theatrical to ship in 48 hours.",
      evidence: "Team entrances, attacks, score reveals, replay, and passports are many surfaces for one hackathon.",
      severity: "medium",
      suggestedFix: "Use seeded fixtures and limit the live engine to the deterministic battle path.",
    },
    {
      id: "attack_infra_to_viral_passport",
      attackerTeamId: "infra_hacker",
      targetTeamId: "viral_designer",
      attackType: "weak_long_term_vision",
      claim: "Agent Arena needs to prove the passport is more than a fun end screen.",
      evidence: "The proposal is strongest as a demo spectacle, while reputation portability is only hinted at.",
      severity: "medium",
      suggestedFix: "Tie every passport claim back to accepted attacks, scores, and artifacts.",
    },
    {
      id: "attack_safe_to_infra_complexity",
      attackerTeamId: "safe_builder",
      targetTeamId: "infra_hacker",
      attackType: "too_complex",
      claim: "Agent Reputation Protocol is too abstract to demo convincingly in a hackathon slot.",
      evidence: "Protocol readiness and portable reputation require explanation before users feel the product value.",
      severity: "high",
      suggestedFix: "Show the protocol only through one completed battle and one passport snapshot.",
    },
    {
      id: "attack_viral_to_infra_demo",
      attackerTeamId: "viral_designer",
      targetTeamId: "infra_hacker",
      attackType: "weak_demo",
      claim: "Agent Reputation Protocol is technically strong but does not have an immediate wow moment.",
      evidence: "A schema and evidence chain are credible, but judges may not remember them after multiple demos.",
      severity: "high",
      suggestedFix: "Wrap the protocol in a visual battle replay that makes evidence feel alive.",
    },
  ];

  attacks.forEach(assertAttack);
  return attacks;
}

export function createDemoDefenses(attacks: Attack[]): Defense[] {
  const defenseByClaim: Record<string, Pick<Defense, "acceptedAttack" | "revision">> = {
    "Proof Sprint risks reading like a standard agent workspace with better packaging.": {
      acceptedAttack: true,
      revision: "Add a visible replay timeline and proof pack so the safe plan still feels native to Agent Arena.",
    },
    "Proof Sprint does not show enough technical depth for an agent-metaverse hackathon.": {
      acceptedAttack: false,
      revision: "Keep the technical depth intentionally narrow: deterministic state, event log, and exportable artifacts.",
    },
    "Agent Arena could become too theatrical to ship in 48 hours.": {
      acceptedAttack: true,
      revision: "Constrain the MVP to seeded teams, one deterministic battle, and generated champion artifacts.",
    },
    "Agent Arena needs to prove the passport is more than a fun end screen.": {
      acceptedAttack: false,
      revision: "Generate passport claims only from proposals, accepted attacks, defenses, scores, and artifacts.",
    },
    "Agent Reputation Protocol is too abstract to demo convincingly in a hackathon slot.": {
      acceptedAttack: true,
      revision: "Present the protocol as a derived layer from one battle rather than as a standalone spec.",
    },
    "Agent Reputation Protocol is technically strong but does not have an immediate wow moment.": {
      acceptedAttack: true,
      revision: "Use a replay-first visualization so the evidence chain has an obvious judge-facing reveal.",
    },
  };

  const defenses = attacks.map((attack) => ({
    id: `defense_${attack.id}`,
    attackId: attack.id,
    teamId: attack.targetTeamId,
    targetTeamId: attack.attackerTeamId,
    responseToAttack: attack.claim,
    ...(defenseByClaim[attack.claim] ?? {
      acceptedAttack: true,
      revision: attack.suggestedFix,
    }),
  }));

  defenses.forEach(assertDefense);
  return defenses;
}

export function createDemoScores(): Score[] {
  const scores: Score[] = [
    {
      teamId: "safe_builder",
      scores: {
        novelty: 5.5,
        feasibility: 9,
        demoWow: 5.5,
        technicalDepth: 5.5,
        userValue: 8,
        longTermPotential: 5.5,
      },
      judgeComments: [
        "Safest plan and easiest to execute in 48 hours.",
        "Needs a stronger differentiator from normal planning workspaces.",
      ],
      losingReason: "Feasibility was excellent, but the proposal lacked a memorable arena moment.",
    },
    {
      teamId: "viral_designer",
      scores: {
        novelty: 9,
        feasibility: 7,
        demoWow: 9.5,
        technicalDepth: 7,
        userValue: 8.5,
        longTermPotential: 8,
      },
      judgeComments: [
        "Most memorable and easiest to explain as a hackathon demo.",
        "The replay and passport loop makes agent evaluation feel tangible.",
      ],
      winningReason: "Best blend of novelty, demo wow, user value, and a credible event-log technical spine.",
    },
    {
      teamId: "infra_hacker",
      scores: {
        novelty: 7.5,
        feasibility: 5.5,
        demoWow: 6.5,
        technicalDepth: 9.5,
        userValue: 7,
        longTermPotential: 9.5,
      },
      judgeComments: [
        "Technically strong and future-facing.",
        "Harder to demo quickly without the battle surface around it.",
      ],
      losingReason: "The long-term protocol is strong, but the MVP is harder to understand in a live demo slot.",
    },
  ];

  scores.forEach(assertScore);
  return scores;
}

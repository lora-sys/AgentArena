import {
  assertAgentPassport,
  type AgentPassport,
  type Attack,
  type CalculatedScore,
  type Defense,
  type EveAgentDefinition,
  type PassportClaimEvidence,
  type Proposal,
  type ScoreCategory,
  type Team,
} from "../schemas";
import { scoreBreakdownToEntries } from "./scoring";

export type PassportGeneratorInput = {
  battleId: string;
  teams: Team[];
  agentDefinitions: EveAgentDefinition[];
  proposals: Proposal[];
  attacks: Attack[];
  defenses: Defense[];
  scores: CalculatedScore[];
  nextId?: (prefix: string) => string;
};

const scoreLabels: Record<ScoreCategory, string> = {
  novelty: "novelty",
  feasibility: "feasibility",
  demoWow: "demo wow",
  technicalDepth: "technical depth",
  userValue: "user value",
  longTermPotential: "long-term potential",
};

const getTeamDefenseForAttack = (defenses: Defense[], attack: Attack): Defense | undefined =>
  defenses.find((defense) => defense.attackId === attack.id && defense.teamId === attack.targetTeamId);

const createPassportClaimEvidence = (attack: Attack, defense: Defense): PassportClaimEvidence => ({
  claim: attack.claim,
  attackId: attack.id,
  defenseId: defense.id,
  acceptedAttack: defense.acceptedAttack,
  attackerTeamId: attack.attackerTeamId,
  defenderTeamId: attack.targetTeamId,
});

export function generateAgentPassports(input: PassportGeneratorInput): AgentPassport[] {
  const passports = input.teams.map((team) => {
    const agent = input.agentDefinitions.find((definition) => definition.teamId === team.id);
    const proposal = input.proposals.find((candidate) => candidate.teamId === team.id);
    const score = input.scores.find((candidate) => candidate.teamId === team.id);
    const incomingAttacks = input.attacks.filter((attack) => attack.targetTeamId === team.id);
    const claimEvidence = incomingAttacks.flatMap((attack) => {
      const defense = getTeamDefenseForAttack(input.defenses, attack);
      return defense === undefined ? [] : [createPassportClaimEvidence(attack, defense)];
    });
    const acceptedClaims = claimEvidence.filter((claim) => claim.acceptedAttack);
    const rejectedClaims = claimEvidence.filter((claim) => !claim.acceptedAttack);
    const acceptedWeaknesses = incomingAttacks.flatMap((attack) => {
      const defense = getTeamDefenseForAttack(input.defenses, attack);
      return defense?.acceptedAttack === true ? [`${attack.attackType}: ${attack.suggestedFix}`] : [];
    });
    const scoreEntries = score === undefined ? [] : scoreBreakdownToEntries(score.scores);
    const topScoreEntries = [...scoreEntries].sort((left, right) => right[1] - left[1]).slice(0, 2);
    const lowScoreEntries = [...scoreEntries].sort((left, right) => left[1] - right[1]).slice(0, 1);

    const passport: AgentPassport = {
      id: input.nextId?.("passport") ?? `passport_${input.battleId}_${team.id}`,
      agentId: agent?.id ?? `${team.id}_agent`,
      battleId: input.battleId,
      agentName: agent?.name ?? team.name,
      role: agent?.role ?? team.strategy,
      directoryPath: agent?.directoryPath ?? team.eveAgentDirectory,
      contributionSummary:
        proposal === undefined || score === undefined
          ? `${team.name} participated in the battle and produced normalized evidence.`
          : `${team.name} proposed ${proposal.productName} and earned a calculated score of ${score.totalScore.toFixed(2)}.`,
      acceptedClaims,
      rejectedClaims,
      strengths:
        proposal === undefined
          ? topScoreEntries.map(([category]) => `Strong judge score in ${scoreLabels[category]}.`)
          : [
              proposal.whyThisCanWin,
              ...topScoreEntries.map(([category]) => `Strong judge score in ${scoreLabels[category]}.`),
            ].slice(0, 3),
      weaknesses:
        acceptedWeaknesses.length > 0
          ? acceptedWeaknesses.slice(0, 3)
          : lowScoreEntries.map(([category]) => `Lowest judge score was ${scoreLabels[category]}.`),
      contributionScore: score?.totalScore ?? 0,
    };

    assertAgentPassport(passport);
    return passport;
  });

  return passports;
}

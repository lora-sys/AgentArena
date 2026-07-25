import type { BattleEvent } from "@agent-arena/contracts";
import { t } from "../i18n";

export const teams = [
  { id: "safe_builder", code: "SB", name: t("arena.demo.team.safe.name"), role: t("arena.demo.team.safe.role"), color: "cyan", hp: 72, portrait: "/assets/agents/safe-builder.png" },
  { id: "viral_designer", code: "VD", name: t("arena.demo.team.viral.name"), role: t("arena.demo.team.viral.role"), color: "pink", hp: 28, portrait: "/assets/agents/viral-designer.png" },
  { id: "infra_hacker", code: "IH", name: t("arena.demo.team.infra.name"), role: t("arena.demo.team.infra.role"), color: "amber", hp: 81, portrait: "/assets/agents/infra-hacker.png" },
] as const;

const common = { battleId: "demo", createdAt: "2026-07-04T12:04:00Z" };

export const demoEvents: BattleEvent[] = [
  { ...common, id: "p1", round: "proposal_round", actorId: "safe_builder", eventType: "proposal_created", title: t("arena.demo.proposal.safe.title"), content: t("arena.demo.proposal.safe.body") },
  { ...common, id: "p2", round: "proposal_round", actorId: "viral_designer", eventType: "proposal_created", title: t("arena.demo.proposal.viral.title"), content: t("arena.demo.proposal.viral.body") },
  { ...common, id: "p3", round: "proposal_round", actorId: "infra_hacker", eventType: "proposal_created", title: t("arena.demo.proposal.infra.title"), content: t("arena.demo.proposal.infra.body") },
  { ...common, id: "a1", round: "cross_attack_round", actorId: "infra_hacker", targetId: "viral_designer", eventType: "attack_created", title: t("arena.demo.attack.title"), content: t("arena.demo.attack.body"), rawPayload: { id: "a1", attackerTeamId: "infra_hacker", targetTeamId: "viral_designer", severity: "high", claim: t("arena.demo.attack.body") } },
  { ...common, id: "d1", round: "defense_round", actorId: "viral_designer", eventType: "defense_created", title: t("arena.demo.defense.title"), content: t("arena.demo.defense.body"), rawPayload: { id: "d1", attackId: "a1", teamId: "viral_designer", acceptedAttack: true, responseToAttack: t("arena.demo.defense.body") } },
  { ...common, id: "s1", round: "scoring_round", eventType: "score_created", title: t("arena.demo.score.title"), content: t("arena.demo.score.body") },
  { ...common, id: "c1", round: "champion_round", eventType: "champion_selected", title: t("arena.demo.champion.title"), content: t("arena.demo.champion.body") },
];

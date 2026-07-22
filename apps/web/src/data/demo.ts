import type { BattleEvent } from "@agent-arena/contracts";

export const teams = [
  { id: "safe_builder", code: "SB", name: "SAFE BUILDER", role: "FEASIBILITY", color: "cyan", hp: 72, portrait: "/assets/agents/safe-builder.png" },
  { id: "viral_designer", code: "VD", name: "VIRAL DESIGNER", role: "DEMO POWER", color: "pink", hp: 28, portrait: "/assets/agents/viral-designer.png" },
  { id: "infra_hacker", code: "IH", name: "INFRA HACKER", role: "TECHNICAL DEPTH", color: "amber", hp: 81, portrait: "/assets/agents/infra-hacker.png" },
] as const;

const common = { battleId: "demo", createdAt: "2026-07-04T12:04:00Z" };

export const demoEvents: BattleEvent[] = [
  { ...common, id: "p1", round: "proposal_round", actorId: "safe_builder", eventType: "proposal_created", title: "Safe proposal", content: "Scope the build to one reliable workflow and make the demo impossible to break." },
  { ...common, id: "p2", round: "proposal_round", actorId: "viral_designer", eventType: "proposal_created", title: "Viral proposal", content: "Turn every agent result into a shareable battle card built for screenshots." },
  { ...common, id: "p3", round: "proposal_round", actorId: "infra_hacker", eventType: "proposal_created", title: "Infra proposal", content: "Make every claim replayable through an evidence-bound event protocol." },
  { ...common, id: "a1", round: "cross_attack_round", actorId: "infra_hacker", targetId: "viral_designer", eventType: "attack_created", title: "Critical feasibility flaw exposed", content: "The visual-generation dependency has no deterministic fallback for a live demo.", rawPayload: { id: "a1", attackerTeamId: "infra_hacker", targetTeamId: "viral_designer", severity: "high", claim: "No deterministic fallback" } },
  { ...common, id: "d1", round: "defense_round", actorId: "viral_designer", eventType: "defense_created", title: "Viral Designer accepts the flaw", content: "Accepted. The current plan can fail live; the revised plan ships a deterministic fallback.", rawPayload: { id: "d1", attackId: "a1", teamId: "viral_designer", acceptedAttack: true, responseToAttack: "Accepted and revised" } },
  { ...common, id: "s1", round: "scoring_round", eventType: "score_created", title: "Evidence-bound scores sealed", content: "Judges bind every score to the proposal, attack, and accepted defense evidence chain." },
  { ...common, id: "c1", round: "champion_round", eventType: "champion_selected", title: "Infra Hacker wins", content: "Infra Hacker wins on technical depth after exposing the decisive feasibility risk." },
];

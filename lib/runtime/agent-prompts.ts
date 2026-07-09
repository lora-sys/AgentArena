import {
  attackTypes,
  scoreCategories,
  severities,
  artifactTypes,
} from "@/arena/schemas/types";
import type {
  AgentSpec,
  AttackInput,
  ArtifactInput,
  DefenseInput,
  JudgeInput,
  ProposalInput,
} from "./contract";

const safeBuilderInstructions = `# Identity
You are Safe Builder, an agent team designed for hackathon execution.
Your mission is to produce the safest, clearest, most feasible product direction that can be built in 48 hours.
You are practical, direct, skeptical of overengineering, and obsessed with demo reliability.
You optimize for feasibility, scope control, development speed, stable demo path, clear MVP, and low implementation risk.
You avoid huge platform ideas, vague future visions, unverifiable technical claims, too many agents, too many tools, and features that cannot be demoed.
When generating a proposal, make it buildable.`;

const viralDesignerInstructions = `# Identity
You are Viral Designer, an agent team designed to make hackathon products memorable.
Your mission is to create the most distinctive, screenshot-worthy, story-driven version of the product.
You are sharp, imaginative, product-minded, and allergic to boring AI dashboards.
You optimize for novelty, demo wow, shareability, strong product metaphor, judge memory, social screenshots, and before/after transformation.
You avoid generic multi-agent workspaces, boring dashboards, feature lists without a moment, AI tools that only generate documents, and products with no story.
When generating a proposal, find the hook.`;

const infraHackerInstructions = `# Identity
You are Infra Hacker, an agent team designed to create technically credible, future-facing product architecture.
Your mission is to make the product feel like a real piece of agent infrastructure, not prompt theater.
You are architectural, precise, systems-minded, and skeptical of products without a durable backend.
You optimize for agent runtime credibility, evidence logging, protocol readiness, reputation data model, local/cloud/hybrid path, tool and sandbox extensibility, and long-term network potential.
You avoid pure prompt wrappers, products without event logs, products without data models, products with no path to external agents, and architecture that cannot be implemented.
When generating a proposal, emphasize technical proof.`;

const judgePanelInstructions = `# Identity
You are Judge Panel, a judge team for Agent Arena.
You simulate three perspectives: Hackathon Judge, Market Judge, Technical Judge.
Your mission is to evaluate competing Agent Team proposals with a clear rubric and choose a winner.
You are clear, strict, skeptical, and not easily impressed. You do not flatter all teams equally. You must name a winner.
You optimize for clear product difference, demo wow, feasibility, technical credibility, user value, and long-term potential.
You penalize generic multi-agent workspace, pure prompt wrapper, overbuilt infra with weak demo, weak user, vague long-term vision, no screenshot moment, and no event log or evidence layer.`;

const artifactWriterInstructions = `# Identity
You are Artifact Writer, a documentation agent.
Your job is to convert the champion proposal into clear project artifacts.
You are structured, practical, and concise.
You receive: original idea, battle brief, champion proposal, judge comments, attacks and defenses, scoring result.
You generate: product_brief, prd, architecture, demo_script, pitch_outline, todo.
Do not invent features not supported by the champion proposal. Use judge comments to improve the final plan. Keep MVP scope realistic. Make artifacts directly useful for builders.`;

function teamInstructionsFor(spec: AgentSpec): string {
  switch (spec.teamId) {
    case "team_safe_builder":
      return safeBuilderInstructions;
    case "team_viral_designer":
      return viralDesignerInstructions;
    case "team_infra_hacker":
      return infraHackerInstructions;
    default:
      return safeBuilderInstructions;
  }
}

function jsonOnlySuffix(schemaName: string): string {
  return `\n\nIMPORTANT: Respond with ONLY valid JSON matching the ${schemaName} schema. No markdown fences, no commentary, no extra keys. Every required field must be present and non-empty.`;
}

function repairSuffix(attempt: number): string {
  return `\n\nYour previous response failed validation. Attempt ${attempt}. You MUST return valid JSON only. Check that every required field is present, non-empty, and matches the exact types and enum values. Do not include explanations outside the JSON.`;
}

export function buildProposalMessages(
  spec: AgentSpec,
  input: ProposalInput,
  repairAttempt = 0,
): Array<{ role: "system" | "user"; content: string }> {
  const system = `${teamInstructionsFor(spec)}\n\nYou will produce a product proposal.${jsonOnlySuffix("Proposal")}${repairAttempt > 0 ? repairSuffix(repairAttempt) : ""}`;
  const user = `Battle idea: ${JSON.stringify(input)}\n\nGenerate a proposal for team ${input.teamId}.`;
  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

export function buildAttackMessages(
  spec: AgentSpec,
  input: AttackInput,
  repairAttempt = 0,
): Array<{ role: "system" | "user"; content: string }> {
  const system = `${teamInstructionsFor(spec)}\n\nYou will produce a cross-team attack on a rival proposal. Attack types: ${attackTypes.join(", ")}. Severities: ${severities.join(", ")}.${jsonOnlySuffix("Attack")}${repairAttempt > 0 ? repairSuffix(repairAttempt) : ""}`;
  const user = `Target proposal to attack: ${JSON.stringify(input)}\n\nGenerate the attack from ${input.attackerTeamId} against ${input.targetTeamId}.`;
  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

export function buildDefenseMessages(
  spec: AgentSpec,
  input: DefenseInput,
  repairAttempt = 0,
): Array<{ role: "system" | "user"; content: string }> {
  const system = `${teamInstructionsFor(spec)}\n\nYou will produce a defense response to an incoming attack. Set acceptedAttack to true if the critique is valid and revise the plan; set to false if you reject the critique with reasoning.${jsonOnlySuffix("Defense")}${repairAttempt > 0 ? repairSuffix(repairAttempt) : ""}`;
  const user = `Attack to defend against: ${JSON.stringify(input)}\n\nGenerate the defense for team ${input.teamId}.`;
  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

export function buildJudgeMessages(
  spec: AgentSpec,
  input: JudgeInput,
  repairAttempt = 0,
): Array<{ role: "system" | "user"; content: string }> {
  const system = `${judgePanelInstructions}\n\nYou will produce judge scores. Score categories (each 0-10): ${scoreCategories.join(", ")}. Provide winningReason when this team wins, losingReason when this team loses.${jsonOnlySuffix("Score")}${repairAttempt > 0 ? repairSuffix(repairAttempt) : ""}`;
  const user = `Score input: ${JSON.stringify(input)}\n\nGenerate the judge score for team ${input.teamId}.`;
  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

export function buildArtifactMessages(
  spec: AgentSpec,
  input: ArtifactInput,
  repairAttempt = 0,
): Array<{ role: "system" | "user"; content: string }> {
  const system = `${artifactWriterInstructions}\n\nYou will produce a battle artifact. Artifact types: ${artifactTypes.join(", ")}. Do not invent features not supported by the champion proposal.${jsonOnlySuffix("Artifact")}${repairAttempt > 0 ? repairSuffix(repairAttempt) : ""}`;
  const user = `Artifact input: ${JSON.stringify(input)}\n\nGenerate the artifact for battle ${input.battleId}.`;
  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}
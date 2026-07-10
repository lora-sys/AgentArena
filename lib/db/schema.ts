// Drizzle ORM schema for AgentArena v0.4
// Covers all 12 tables from PRD §19 (数据模型).
// snake_case for all table and column names per CLAUDE.md §8.
// TypeScript identifiers are camelCase.
//
// Tables:
//   1. trial_template       — reusable battle config (rubric, round plan)
//   2. battle               — one full battle run, top-level entity
//   3. agent_definition     — agent spec (prompts, skills, tools, model)
//   4. battle_participant   — which agents are in a battle and their team/role
//   5. proposal             — a Proposal emission by an agent
//   6. attack               — cross-attack from one agent to another
//   7. defense              — defense/response from an agent to attacks
//   8. score                — judge score per agent, bound to events
//   9. artifact             — generated artifact (PRD, brief, etc.) tied to events
//  10. battle_event         — authoritative event log (event-store)
//  11. passport_snapshot    — reputation snapshot for one agent in one battle
//  12. model_call_log       — cost/latency audit trail for every LLM call
//
// This file is the single source of truth for table layout.
// Migrations are generated via `pnpm db:generate` (drizzle-kit).

import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums (snake_case values; cast through TypeScript unions)
// ---------------------------------------------------------------------------

export const battleStatusEnum = pgEnum("battle_status", [
  "idle",
  "briefing",
  "team_generation",
  "proposal_round",
  "cross_attack_round",
  "defense_round",
  "judging_round",
  "artifact_generation",
  "replay_generation",
  "completed",
  "failed",
  "retrying",
  "cancelled",
]);

export const actorTypeEnum = pgEnum("actor_type", [
  "system",
  "team",
  "agent",
  "judge",
]);

export const attackTypeEnum = pgEnum("attack_type", [
  "too_generic",
  "too_complex",
  "weak_demo",
  "weak_market",
  "weak_technical_depth",
  "no_viral_hook",
  "poor_feasibility",
  "unclear_user",
  "weak_long_term_vision",
]);

export const severityEnum = pgEnum("severity", [
  "low",
  "medium",
  "high",
  "fatal",
]);

export const artifactTypeEnum = pgEnum("artifact_type", [
  "product_brief",
  "prd",
  "architecture",
  "demo_script",
  "pitch_outline",
  "todo",
]);

export const participantResultEnum = pgEnum("participant_result", [
  "winner",
  "runner_up",
  "loser",
  "tied",
]);

export const modelCallStatusEnum = pgEnum("model_call_status", [
  "success",
  "validation_failed",
  "timeout",
  "error",
]);

// ---------------------------------------------------------------------------
// 1. trial_template
// ---------------------------------------------------------------------------
// Reusable battle configuration. Defines rubric, round plan, input schema.
// Enabled templates are the ones a user can pick from on /battle/new.

export const trialTemplate = pgTable(
  "trial_template",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 200 }).notNull(),
    version: integer("version").notNull().default(1),
    inputSchema: jsonb("input_schema").notNull(),
    roundConfig: jsonb("round_config").notNull(),
    rubricJson: jsonb("rubric_json").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("trial_template_name_version_idx").on(t.name, t.version),
    index("trial_template_enabled_idx").on(t.enabled),
  ],
);

// ---------------------------------------------------------------------------
// 2. battle
// ---------------------------------------------------------------------------
// One full battle run. Top-level entity every other table relates to.

export const battle = pgTable(
  "battle",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trialTemplateId: uuid("trial_template_id").references(
      () => trialTemplate.id,
      { onDelete: "set null" },
    ),
    title: varchar("title", { length: 300 }).notNull(),
    idea: text("idea").notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    status: battleStatusEnum("status").notNull().default("idle"),
    originalInput: jsonb("original_input").notNull(),
    settingsJson: jsonb("settings_json").notNull(),
    mode: varchar("mode", { length: 20 }).notNull().default("full"),
    championAgentId: uuid("champion_agent_id"),
    championTeamName: varchar("champion_team_name", { length: 200 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [
    index("battle_status_idx").on(t.status),
    index("battle_trial_template_id_idx").on(t.trialTemplateId),
    index("battle_type_idx").on(t.type),
    index("battle_created_at_idx").on(t.createdAt),
    uniqueIndex("battle_idea_idx").on(t.idea),
  ],
);

// ---------------------------------------------------------------------------
// 3. agent_definition
// ---------------------------------------------------------------------------
// Agent spec: prompts, skills, allowed tools, model binding. Versioned.
// agents/*/spec.yaml in the repo is the source for these rows.

export const agentDefinition = pgTable(
  "agent_definition",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 200 }).notNull(),
    role: varchar("role", { length: 100 }).notNull(),
    instructionsPath: varchar("instructions_path", { length: 500 }).notNull(),
    skillsJson: jsonb("skills_json").notNull().default(sql`'[]'::jsonb`),
    toolsJson: jsonb("tools_json").notNull().default(sql`'[]'::jsonb`),
    model: varchar("model", { length: 200 }),
    version: integer("version").notNull().default(1),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("agent_definition_name_version_idx").on(t.name, t.version),
    index("agent_definition_role_idx").on(t.role),
    index("agent_definition_enabled_idx").on(t.enabled),
  ],
);

// ---------------------------------------------------------------------------
// 4. battle_participant
// ---------------------------------------------------------------------------
// Links an agent_definition into a battle. Holds team metadata + result.

export const battleParticipant = pgTable(
  "battle_participant",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    battleId: uuid("battle_id")
      .notNull()
      .references(() => battle.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agentDefinition.id, { onDelete: "restrict" }),
    teamName: varchar("team_name", { length: 200 }).notNull(),
    strategy: text("strategy").notNull(),
    color: varchar("color", { length: 20 }),
    riskProfile: varchar("risk_profile", { length: 50 }),
    result: participantResultEnum("result"),
    totalScore: doublePrecision("total_score"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("battle_participant_battle_agent_idx").on(t.battleId, t.agentId),
    index("battle_participant_battle_id_idx").on(t.battleId),
    index("battle_participant_agent_id_idx").on(t.agentId),
  ],
);

// ---------------------------------------------------------------------------
// 5. proposal
// ---------------------------------------------------------------------------
// A Proposal emission. payload_json matches Zod ProposalSchema shape (PRD §21.1).

export const proposal = pgTable(
  "proposal",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    battleId: uuid("battle_id")
      .notNull()
      .references(() => battle.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agentDefinition.id, { onDelete: "restrict" }),
    payloadJson: jsonb("payload_json").notNull(),
    eventId: uuid("event_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("proposal_battle_id_idx").on(t.battleId),
    index("proposal_agent_id_idx").on(t.agentId),
    index("proposal_event_id_idx").on(t.eventId),
  ],
);

// ---------------------------------------------------------------------------
// 6. attack
// ---------------------------------------------------------------------------
// Cross-attack: one agent challenges another. Severity drives judge weighting.

export const attack = pgTable(
  "attack",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    battleId: uuid("battle_id")
      .notNull()
      .references(() => battle.id, { onDelete: "cascade" }),
    attackerAgentId: uuid("attacker_agent_id")
      .notNull()
      .references(() => agentDefinition.id, { onDelete: "restrict" }),
    targetAgentId: uuid("target_agent_id")
      .notNull()
      .references(() => agentDefinition.id, { onDelete: "restrict" }),
    attackType: attackTypeEnum("attack_type").notNull(),
    payloadJson: jsonb("payload_json").notNull(),
    eventId: uuid("event_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("attack_battle_id_idx").on(t.battleId),
    index("attack_attacker_agent_id_idx").on(t.attackerAgentId),
    index("attack_target_agent_id_idx").on(t.targetAgentId),
    index("attack_event_id_idx").on(t.eventId),
  ],
);

// ---------------------------------------------------------------------------
// 7. defense
// ---------------------------------------------------------------------------
// A defense response to attacks. One row per (battle, agent) per revision round.

export const defense = pgTable(
  "defense",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    battleId: uuid("battle_id")
      .notNull()
      .references(() => battle.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agentDefinition.id, { onDelete: "restrict" }),
    payloadJson: jsonb("payload_json").notNull(),
    eventId: uuid("event_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("defense_battle_id_idx").on(t.battleId),
    index("defense_agent_id_idx").on(t.agentId),
    index("defense_event_id_idx").on(t.eventId),
  ],
);

// ---------------------------------------------------------------------------
// 8. score
// ---------------------------------------------------------------------------
// Judge score. Every score must bind to >=1 evidenceEventId (CLAUDE.md §7).
// dimension_scores_json is a Record<ScoreCategory, number> per PRD §19.

export const score = pgTable(
  "score",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    battleId: uuid("battle_id")
      .notNull()
      .references(() => battle.id, { onDelete: "cascade" }),
    judgeId: varchar("judge_id", { length: 200 }).notNull(),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agentDefinition.id, { onDelete: "restrict" }),
    dimensionScoresJson: jsonb("dimension_scores_json").notNull(),
    totalScore: doublePrecision("total_score").notNull(),
    comments: text("comments"),
    evidenceEventIdsJson: jsonb("evidence_event_ids_json")
      .notNull()
      .default(sql`'[]'::jsonb`),
    eventId: uuid("event_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("score_battle_id_idx").on(t.battleId),
    index("score_agent_id_idx").on(t.agentId),
    index("score_judge_id_idx").on(t.judgeId),
    index("score_event_id_idx").on(t.eventId),
    // PRD invariant: every score must bind to >=1 evidence event.
    // Reject empty arrays and non-array values at the DB layer.
    check(
      "score_evidence_event_ids_non_empty",
      sql`jsonb_array_length(${t.evidenceEventIdsJson}) >= 1`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// 9. artifact
// ---------------------------------------------------------------------------
// Generated artifact (PRD, brief, architecture, etc). Cites source event IDs.

export const artifact = pgTable(
  "artifact",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    battleId: uuid("battle_id")
      .notNull()
      .references(() => battle.id, { onDelete: "cascade" }),
    type: artifactTypeEnum("type").notNull(),
    title: varchar("title", { length: 300 }).notNull(),
    markdown: text("markdown").notNull(),
    sourceAgentId: uuid("source_agent_id").references(
      () => agentDefinition.id,
      { onDelete: "set null" },
    ),
    sourceEventIdsJson: jsonb("source_event_ids_json")
      .notNull()
      .default(sql`'[]'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("artifact_battle_id_idx").on(t.battleId),
    index("artifact_type_idx").on(t.type),
    index("artifact_source_agent_id_idx").on(t.sourceAgentId),
  ],
);

// ---------------------------------------------------------------------------
// 10. battle_event
// ---------------------------------------------------------------------------
// Authoritative event log. Replay and Passport views ONLY read from here
// (CLAUDE.md §7). Append-only by convention — no UPDATE/DELETE in engine code.

export const battleEvent = pgTable(
  "battle_event",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    battleId: uuid("battle_id")
      .notNull()
      .references(() => battle.id, { onDelete: "cascade" }),
    sequence: bigint("sequence", { mode: "number" }).notNull(),
    round: varchar("round", { length: 100 }).notNull(),
    type: varchar("type", { length: 100 }).notNull(),
    actorType: actorTypeEnum("actor_type").notNull(),
    actorId: varchar("actor_id", { length: 200 }),
    targetId: varchar("target_id", { length: 200 }),
    payloadJson: jsonb("payload_json").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("battle_event_battle_seq_idx").on(t.battleId, t.sequence),
    index("battle_event_battle_id_idx").on(t.battleId),
    index("battle_event_type_idx").on(t.type),
    index("battle_event_round_idx").on(t.round),
    index("battle_event_actor_id_idx").on(t.actorId),
  ],
);

// ---------------------------------------------------------------------------
// 11. passport_snapshot
// ---------------------------------------------------------------------------
// Reputation snapshot: one per (battle, agent). snapshot_json matches PRD §21.4.

export const passportSnapshot = pgTable(
  "passport_snapshot",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    battleId: uuid("battle_id")
      .notNull()
      .references(() => battle.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agentDefinition.id, { onDelete: "restrict" }),
    snapshotJson: jsonb("snapshot_json").notNull(),
    totalScore: doublePrecision("total_score").notNull(),
    replayUrl: text("replay_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("passport_snapshot_battle_agent_idx").on(t.battleId, t.agentId),
    index("passport_snapshot_agent_id_idx").on(t.agentId),
    index("passport_snapshot_total_score_idx").on(t.totalScore),
  ],
);

// ---------------------------------------------------------------------------
// 12. model_call_log
// ---------------------------------------------------------------------------
// Audit trail for every LLM call: provider, model, tokens, latency, cost.
// All five agents + judge write here. Powers cost guard (PRD §22).

export const modelCallLog = pgTable(
  "model_call_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    battleId: uuid("battle_id").references(() => battle.id, {
      onDelete: "set null",
    }),
    agentId: uuid("agent_id").references(() => agentDefinition.id, {
      onDelete: "set null",
    }),
    provider: varchar("provider", { length: 100 }).notNull(),
    model: varchar("model", { length: 200 }).notNull(),
    tokensIn: integer("tokens_in").notNull().default(0),
    tokensOut: integer("tokens_out").notNull().default(0),
    latencyMs: integer("latency_ms").notNull().default(0),
    costEstimate: doublePrecision("cost_estimate").notNull().default(0),
    status: modelCallStatusEnum("status").notNull().default("success"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("model_call_log_battle_id_idx").on(t.battleId),
    index("model_call_log_agent_id_idx").on(t.agentId),
    index("model_call_log_provider_model_idx").on(t.provider, t.model),
    index("model_call_log_status_idx").on(t.status),
    index("model_call_log_created_at_idx").on(t.createdAt),
  ],
);

// ---------------------------------------------------------------------------
// Inferred row types (typed exports for repositories / tests)
// ---------------------------------------------------------------------------

export type TrialTemplate = typeof trialTemplate.$inferSelect;
export type NewTrialTemplate = typeof trialTemplate.$inferInsert;
export type Battle = typeof battle.$inferSelect;
export type NewBattle = typeof battle.$inferInsert;
export type AgentDefinition = typeof agentDefinition.$inferSelect;
export type NewAgentDefinition = typeof agentDefinition.$inferInsert;
export type BattleParticipant = typeof battleParticipant.$inferSelect;
export type NewBattleParticipant = typeof battleParticipant.$inferInsert;
export type Proposal = typeof proposal.$inferSelect;
export type NewProposal = typeof proposal.$inferInsert;
export type Attack = typeof attack.$inferSelect;
export type NewAttack = typeof attack.$inferInsert;
export type Defense = typeof defense.$inferSelect;
export type NewDefense = typeof defense.$inferInsert;
export type Score = typeof score.$inferSelect;
export type NewScore = typeof score.$inferInsert;
export type Artifact = typeof artifact.$inferSelect;
export type NewArtifact = typeof artifact.$inferInsert;
export type BattleEvent = typeof battleEvent.$inferSelect;
export type NewBattleEvent = typeof battleEvent.$inferInsert;
export type PassportSnapshot = typeof passportSnapshot.$inferSelect;
export type NewPassportSnapshot = typeof passportSnapshot.$inferInsert;
export type ModelCallLog = typeof modelCallLog.$inferSelect;
export type NewModelCallLog = typeof modelCallLog.$inferInsert;

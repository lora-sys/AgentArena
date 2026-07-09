import OpenAI from "openai";
import { z } from "zod";
import {
  ProposalSchema,
  AttackSchema,
  DefenseSchema,
  ScoreSchema,
  ArtifactSchema,
} from "@/arena/schemas/types";
import type {
  AgentSpec,
  ArenaAgentRuntime,
  ArtifactInput,
  ArtifactOutput,
  AttackInput,
  AttackOutput,
  DefenseInput,
  DefenseOutput,
  JudgeInput,
  JudgeOutput,
  ProposalInput,
  ProposalOutput,
} from "./contract";
import {
  buildProposalMessages,
  buildAttackMessages,
  buildDefenseMessages,
  buildJudgeMessages,
  buildArtifactMessages,
} from "./agent-prompts";

const DEFAULT_MODEL = "gpt-5";
const DEFAULT_MAX_RETRIES = 3;

export type SchemaRepairEvent = {
  type: "schema_repair_started" | "schema_repair_completed" | "low_confidence_judging";
  spec: AgentSpec;
  method: string;
  attempt: number;
  issues?: z.ZodIssue[];
};

export type MastraRuntimeOptions = {
  client?: OpenAI;
  model?: string;
  maxRetries?: number;
  onEvent?: (event: SchemaRepairEvent) => void;
};

type ChatMessage = { role: "system" | "user"; content: string };

export class MastraRuntime implements ArenaAgentRuntime {
  private readonly client: OpenAI;
  private readonly model: string;
  private readonly maxRetries: number;
  private readonly onEvent?: (event: SchemaRepairEvent) => void;

  constructor(options: MastraRuntimeOptions = {}) {
    this.client = options.client ?? new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.model = options.model ?? DEFAULT_MODEL;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.onEvent = options.onEvent;
  }

  async runProposal(spec: AgentSpec, input: ProposalInput): Promise<ProposalOutput> {
    return this.generateWithRepair(
      spec,
      "runProposal",
      ProposalSchema,
      input,
      (repairAttempt) => buildProposalMessages(spec, input, repairAttempt),
    );
  }

  async runAttack(spec: AgentSpec, input: AttackOutput): Promise<AttackOutput> {
    return this.generateWithRepair(
      spec,
      "runAttack",
      AttackSchema,
      input,
      (repairAttempt) => buildAttackMessages(spec, input, repairAttempt),
    );
  }

  async runDefense(spec: AgentSpec, input: DefenseInput): Promise<DefenseOutput> {
    return this.generateWithRepair(
      spec,
      "runDefense",
      DefenseSchema,
      input,
      (repairAttempt) => buildDefenseMessages(spec, input, repairAttempt),
    );
  }

  async runJudge(spec: AgentSpec, input: JudgeInput): Promise<JudgeOutput> {
    return this.generateWithRepair(
      spec,
      "runJudge",
      ScoreSchema,
      input,
      (repairAttempt) => buildJudgeMessages(spec, input, repairAttempt),
    );
  }

  async runArtifact(spec: AgentSpec, input: ArtifactInput): Promise<ArtifactOutput> {
    return this.generateWithRepair(
      spec,
      "runArtifact",
      ArtifactSchema,
      input,
      (repairAttempt) => buildArtifactMessages(spec, input, repairAttempt),
    );
  }

  private async generateWithRepair<T>(
    spec: AgentSpec,
    method: string,
    schema: z.ZodType<T>,
    _input: unknown,
    buildMessages: (repairAttempt: number) => ChatMessage[],
  ): Promise<T> {
    const retryBudget = spec.maxRetries ?? this.maxRetries;
    let lastIssues: z.ZodIssue[] = [];

    for (let attempt = 0; attempt <= retryBudget; attempt++) {
      const messages = buildMessages(attempt);
      const raw = await this.callOpenAI(spec, messages);
      const parsed = this.tryParseJson(raw);
      const result = schema.safeParse(parsed);

      if (result.success) {
        if (attempt > 0) {
          this.onEvent?.({
            type: "schema_repair_completed",
            spec,
            method,
            attempt,
          });
        }
        return result.data;
      }

      lastIssues = result.error.issues;

      if (attempt < retryBudget) {
        this.onEvent?.({
          type: "schema_repair_started",
          spec,
          method,
          attempt,
          issues: lastIssues,
        });
      }
    }

    this.onEvent?.({
      type: "low_confidence_judging",
      spec,
      method,
      attempt: retryBudget,
      issues: lastIssues,
    });

    throw new SchemaRepairExhaustedError(
      `Schema validation failed after ${retryBudget + 1} attempts for ${method}`,
      lastIssues,
    );
  }

  private async callOpenAI(_spec: AgentSpec, messages: ChatMessage[]): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      response_format: { type: "json_object" },
    });
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned empty content");
    }
    return content;
  }

  private tryParseJson(raw: string): unknown {
    const trimmed = raw.trim();
    try {
      return JSON.parse(trimmed);
    } catch {
      const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fenceMatch) {
        return JSON.parse(fenceMatch[1].trim());
      }
      throw new Error("Model output is not valid JSON");
    }
  }
}

export class SchemaRepairExhaustedError extends Error {
  readonly issues: z.ZodIssue[];
  constructor(message: string, issues: z.ZodIssue[]) {
    super(message);
    this.name = "SchemaRepairExhaustedError";
    this.issues = issues;
  }
}
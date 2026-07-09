CREATE TYPE "public"."actor_type" AS ENUM('system', 'team', 'agent', 'judge');--> statement-breakpoint
CREATE TYPE "public"."artifact_type" AS ENUM('product_brief', 'prd', 'architecture', 'demo_script', 'pitch_outline', 'todo');--> statement-breakpoint
CREATE TYPE "public"."attack_type" AS ENUM('too_generic', 'too_complex', 'weak_demo', 'weak_market', 'weak_technical_depth', 'no_viral_hook', 'poor_feasibility', 'unclear_user', 'weak_long_term_vision');--> statement-breakpoint
CREATE TYPE "public"."battle_status" AS ENUM('idle', 'briefing', 'team_generation', 'proposal_round', 'cross_attack_round', 'defense_round', 'judging_round', 'artifact_generation', 'replay_generation', 'completed', 'failed', 'retrying', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."model_call_status" AS ENUM('success', 'validation_failed', 'timeout', 'error');--> statement-breakpoint
CREATE TYPE "public"."participant_result" AS ENUM('winner', 'runner_up', 'loser', 'tied');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('low', 'medium', 'high', 'fatal');--> statement-breakpoint
CREATE TABLE "agent_definition" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"role" varchar(100) NOT NULL,
	"instructions_path" varchar(500) NOT NULL,
	"skills_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tools_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"model" varchar(200),
	"version" integer DEFAULT 1 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "artifact" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battle_id" uuid NOT NULL,
	"type" "artifact_type" NOT NULL,
	"title" varchar(300) NOT NULL,
	"markdown" text NOT NULL,
	"source_agent_id" uuid,
	"source_event_ids_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attack" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battle_id" uuid NOT NULL,
	"attacker_agent_id" uuid NOT NULL,
	"target_agent_id" uuid NOT NULL,
	"attack_type" "attack_type" NOT NULL,
	"payload_json" jsonb NOT NULL,
	"event_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "battle" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trial_template_id" uuid,
	"title" varchar(300) NOT NULL,
	"idea" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"status" "battle_status" DEFAULT 'idle' NOT NULL,
	"original_input" jsonb NOT NULL,
	"settings_json" jsonb NOT NULL,
	"champion_agent_id" uuid,
	"champion_team_name" varchar(200),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "battle_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battle_id" uuid NOT NULL,
	"sequence" bigint NOT NULL,
	"round" varchar(100) NOT NULL,
	"type" varchar(100) NOT NULL,
	"actor_type" "actor_type" NOT NULL,
	"actor_id" varchar(200),
	"target_id" varchar(200),
	"payload_json" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "battle_participant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battle_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"team_name" varchar(200) NOT NULL,
	"strategy" text NOT NULL,
	"color" varchar(20),
	"risk_profile" varchar(50),
	"result" "participant_result",
	"total_score" double precision,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "defense" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battle_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"payload_json" jsonb NOT NULL,
	"event_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model_call_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battle_id" uuid,
	"agent_id" uuid,
	"provider" varchar(100) NOT NULL,
	"model" varchar(200) NOT NULL,
	"tokens_in" integer DEFAULT 0 NOT NULL,
	"tokens_out" integer DEFAULT 0 NOT NULL,
	"latency_ms" integer DEFAULT 0 NOT NULL,
	"cost_estimate" double precision DEFAULT 0 NOT NULL,
	"status" "model_call_status" DEFAULT 'success' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passport_snapshot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battle_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"snapshot_json" jsonb NOT NULL,
	"total_score" double precision NOT NULL,
	"replay_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battle_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"payload_json" jsonb NOT NULL,
	"event_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "score" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battle_id" uuid NOT NULL,
	"judge_id" varchar(200) NOT NULL,
	"agent_id" uuid NOT NULL,
	"dimension_scores_json" jsonb NOT NULL,
	"total_score" double precision NOT NULL,
	"comments" text,
	"evidence_event_ids_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"event_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trial_template" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"input_schema" jsonb NOT NULL,
	"round_config" jsonb NOT NULL,
	"rubric_json" jsonb NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "artifact" ADD CONSTRAINT "artifact_battle_id_battle_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."battle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artifact" ADD CONSTRAINT "artifact_source_agent_id_agent_definition_id_fk" FOREIGN KEY ("source_agent_id") REFERENCES "public"."agent_definition"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attack" ADD CONSTRAINT "attack_battle_id_battle_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."battle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attack" ADD CONSTRAINT "attack_attacker_agent_id_agent_definition_id_fk" FOREIGN KEY ("attacker_agent_id") REFERENCES "public"."agent_definition"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attack" ADD CONSTRAINT "attack_target_agent_id_agent_definition_id_fk" FOREIGN KEY ("target_agent_id") REFERENCES "public"."agent_definition"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle" ADD CONSTRAINT "battle_trial_template_id_trial_template_id_fk" FOREIGN KEY ("trial_template_id") REFERENCES "public"."trial_template"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle_event" ADD CONSTRAINT "battle_event_battle_id_battle_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."battle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle_participant" ADD CONSTRAINT "battle_participant_battle_id_battle_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."battle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle_participant" ADD CONSTRAINT "battle_participant_agent_id_agent_definition_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_definition"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "defense" ADD CONSTRAINT "defense_battle_id_battle_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."battle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "defense" ADD CONSTRAINT "defense_agent_id_agent_definition_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_definition"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_call_log" ADD CONSTRAINT "model_call_log_battle_id_battle_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."battle"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_call_log" ADD CONSTRAINT "model_call_log_agent_id_agent_definition_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_definition"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passport_snapshot" ADD CONSTRAINT "passport_snapshot_battle_id_battle_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."battle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passport_snapshot" ADD CONSTRAINT "passport_snapshot_agent_id_agent_definition_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_definition"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_battle_id_battle_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."battle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_agent_id_agent_definition_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_definition"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score" ADD CONSTRAINT "score_battle_id_battle_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."battle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score" ADD CONSTRAINT "score_agent_id_agent_definition_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent_definition"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "agent_definition_name_version_idx" ON "agent_definition" USING btree ("name","version");--> statement-breakpoint
CREATE INDEX "agent_definition_role_idx" ON "agent_definition" USING btree ("role");--> statement-breakpoint
CREATE INDEX "agent_definition_enabled_idx" ON "agent_definition" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "artifact_battle_id_idx" ON "artifact" USING btree ("battle_id");--> statement-breakpoint
CREATE INDEX "artifact_type_idx" ON "artifact" USING btree ("type");--> statement-breakpoint
CREATE INDEX "artifact_source_agent_id_idx" ON "artifact" USING btree ("source_agent_id");--> statement-breakpoint
CREATE INDEX "attack_battle_id_idx" ON "attack" USING btree ("battle_id");--> statement-breakpoint
CREATE INDEX "attack_attacker_agent_id_idx" ON "attack" USING btree ("attacker_agent_id");--> statement-breakpoint
CREATE INDEX "attack_target_agent_id_idx" ON "attack" USING btree ("target_agent_id");--> statement-breakpoint
CREATE INDEX "attack_event_id_idx" ON "attack" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "battle_status_idx" ON "battle" USING btree ("status");--> statement-breakpoint
CREATE INDEX "battle_trial_template_id_idx" ON "battle" USING btree ("trial_template_id");--> statement-breakpoint
CREATE INDEX "battle_type_idx" ON "battle" USING btree ("type");--> statement-breakpoint
CREATE INDEX "battle_created_at_idx" ON "battle" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "battle_event_battle_seq_idx" ON "battle_event" USING btree ("battle_id","sequence");--> statement-breakpoint
CREATE INDEX "battle_event_battle_id_idx" ON "battle_event" USING btree ("battle_id");--> statement-breakpoint
CREATE INDEX "battle_event_type_idx" ON "battle_event" USING btree ("type");--> statement-breakpoint
CREATE INDEX "battle_event_round_idx" ON "battle_event" USING btree ("round");--> statement-breakpoint
CREATE INDEX "battle_event_actor_id_idx" ON "battle_event" USING btree ("actor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "battle_participant_battle_agent_idx" ON "battle_participant" USING btree ("battle_id","agent_id");--> statement-breakpoint
CREATE INDEX "battle_participant_battle_id_idx" ON "battle_participant" USING btree ("battle_id");--> statement-breakpoint
CREATE INDEX "battle_participant_agent_id_idx" ON "battle_participant" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "defense_battle_id_idx" ON "defense" USING btree ("battle_id");--> statement-breakpoint
CREATE INDEX "defense_agent_id_idx" ON "defense" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "defense_event_id_idx" ON "defense" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "model_call_log_battle_id_idx" ON "model_call_log" USING btree ("battle_id");--> statement-breakpoint
CREATE INDEX "model_call_log_agent_id_idx" ON "model_call_log" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "model_call_log_provider_model_idx" ON "model_call_log" USING btree ("provider","model");--> statement-breakpoint
CREATE INDEX "model_call_log_status_idx" ON "model_call_log" USING btree ("status");--> statement-breakpoint
CREATE INDEX "model_call_log_created_at_idx" ON "model_call_log" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "passport_snapshot_battle_agent_idx" ON "passport_snapshot" USING btree ("battle_id","agent_id");--> statement-breakpoint
CREATE INDEX "passport_snapshot_agent_id_idx" ON "passport_snapshot" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "passport_snapshot_total_score_idx" ON "passport_snapshot" USING btree ("total_score");--> statement-breakpoint
CREATE INDEX "proposal_battle_id_idx" ON "proposal" USING btree ("battle_id");--> statement-breakpoint
CREATE INDEX "proposal_agent_id_idx" ON "proposal" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "proposal_event_id_idx" ON "proposal" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "score_battle_id_idx" ON "score" USING btree ("battle_id");--> statement-breakpoint
CREATE INDEX "score_agent_id_idx" ON "score" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "score_judge_id_idx" ON "score" USING btree ("judge_id");--> statement-breakpoint
CREATE INDEX "score_event_id_idx" ON "score" USING btree ("event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "trial_template_name_version_idx" ON "trial_template" USING btree ("name","version");--> statement-breakpoint
CREATE INDEX "trial_template_enabled_idx" ON "trial_template" USING btree ("enabled");
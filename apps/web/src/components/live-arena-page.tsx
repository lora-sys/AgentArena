import { useEffect, useMemo, useState } from "react";
import type { BattleEvent, Severity } from "@agent-arena/contracts";
import { DAMAGE_MAP, RECOVERY_RATIO } from "@agent-arena/contracts";
import { t } from "../i18n";
import { HpBar, type HpBarHit } from "./hp-bar";
import { RoundProgress, type RoundStage } from "./round-progress";
import { RuntimeModeBadge, type RuntimeMode } from "./runtime-mode-badge";
import { ArenaHost } from "./arena-host";
import { TypewriterText } from "./typewriter-text";
import styles from "./live-arena-page.module.css";

export type LiveArenaTeam = {
  id: string;
  name: string;
  subtitle: string;
  accentColor: string;
  role: string;
};

export const V052_TEAMS: readonly LiveArenaTeam[] = [
  { id: "team_safe_v1", name: "稳健构建者", subtitle: "Safe Builders", accentColor: "var(--team-safe)", role: "可行性" },
  { id: "team_viral_v1", name: "传播设计师", subtitle: "Viral Designers", accentColor: "var(--team-viral)", role: "演示力" },
  { id: "team_infra_v1", name: "架构黑客", subtitle: "Infra Hackers", accentColor: "var(--team-infra)", role: "技术深度" },
];

const ROUND_TO_STAGE: Record<string, RoundStage> = {
  briefing: "brief",
  team_generation: "brief",
  proposal_round: "proposal",
  build_round: "build",
  cross_attack_round: "attack",
  defense_round: "defense",
  verify_round: "verify",
  judging_round: "judgment",
  artifact_generation: "judgment",
  replay_generation: "judgment",
};

export type LiveArenaPageProps = {
  battleId: string;
  idea: string;
  events: readonly BattleEvent[];
  mode: RuntimeMode;
  /** optional live elapsed ms (rendered as timer) */
  elapsedMs?: number;
  /** trigger: open artifact viewer modal for a team */
  onOpenArtifact?: (teamId: string) => void;
  /** trigger: open evidence lens modal for a team */
  onOpenEvidenceLens?: (teamId: string) => void;
  /** trigger: fatal attack takeover auto-opens evidence lens */
  onFatalAttack?: (event: BattleEvent) => void;
};

function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const mm = Math.floor(total / 60).toString().padStart(2, "0");
  const ss = (total % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

function lastFatalAttack(events: readonly BattleEvent[]): BattleEvent | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (event.eventType !== "attack_created") continue;
    const severity = (event.rawPayload as { severity?: string } | undefined)?.severity;
    if (severity === "fatal") return event;
  }
  return null;
}

function lastAcceptedDefenseFor(events: readonly BattleEvent[], attackId: string): BattleEvent | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (event.eventType !== "defense_created") continue;
    const payload = event.rawPayload as { attackId?: string; acceptedAttack?: boolean } | undefined;
    if (payload?.attackId === attackId && payload.acceptedAttack) return event;
  }
  return null;
}

export function LiveArenaPage({
  battleId,
  idea,
  events,
  mode,
  elapsedMs = 0,
  onOpenArtifact,
  onOpenEvidenceLens,
  onFatalAttack,
}: LiveArenaPageProps) {
  const [fatalTakeover, setFatalTakeover] = useState<BattleEvent | null>(null);
  const fatalAttack = useMemo(() => lastFatalAttack(events), [events]);
  const currentRound = events.length > 0 ? events[events.length - 1].round : "briefing";
  const currentStage: RoundStage = ROUND_TO_STAGE[currentRound] ?? "brief";

  // Trigger fatal takeover 5s when a fresh fatal attack appears and no defense yet
  useEffect(() => {
    if (!fatalAttack) return;
    const attackId = (fatalAttack.rawPayload as { id?: string }).id ?? "";
    if (lastAcceptedDefenseFor(events, attackId)) return;
    setFatalTakeover(fatalAttack);
    onFatalAttack?.(fatalAttack);
    const timer = setTimeout(() => setFatalTakeover(null), 5000);
    return () => clearTimeout(timer);
  }, [fatalAttack, events, onFatalAttack]);

  // Compute HP and last hits per team.
  // Mirrors contracts reduceArenaHp: damage on accepted attack; passing test
  // event recovers 60% of the most recent un-recovered accepted attack on
  // that team (each attack can only recover once).
  const { hpByTeam, lastHitByTeam } = useMemo(() => {
    const hp: Record<string, number> = Object.fromEntries(V052_TEAMS.map((team) => [team.id, 100]));
    const lastHit: Record<string, HpBarHit | null> = Object.fromEntries(V052_TEAMS.map((team) => [team.id, null]));
    const attacks = new Map<string, { severity: Severity; targetTeamId: string }>();
    const damageByAttack = new Map<string, { teamId: string; damage: number }>();
    const recoveredAttacks = new Set<string>();
    for (const event of events) {
      if (event.eventType === "attack_created") {
        const payload = event.rawPayload as { id?: string; severity?: Severity; targetTeamId?: string } | undefined;
        if (payload?.id && payload.severity && payload.targetTeamId) {
          attacks.set(payload.id, { severity: payload.severity, targetTeamId: payload.targetTeamId });
        }
        continue;
      }
      if (event.eventType === "defense_created") {
        const payload = event.rawPayload as { attackId?: string; teamId?: string; acceptedAttack?: boolean } | undefined;
        if (!payload?.acceptedAttack || !payload.attackId || !payload.teamId) continue;
        const attack = attacks.get(payload.attackId);
        if (!attack) continue;
        const damage = DAMAGE_MAP[attack.severity];
        hp[payload.teamId] = Math.max(0, (hp[payload.teamId] ?? 100) - damage);
        damageByAttack.set(payload.attackId, { teamId: payload.teamId, damage });
        lastHit[payload.teamId] = { severity: attack.severity, damage, hitId: payload.attackId };
        continue;
      }
      // Test pass events (artifact_created with rawPayload.passed === true)
      if (event.eventType === "artifact_created") {
        const payload = event.rawPayload as { id?: string; teamId?: string; passed?: boolean } | undefined;
        if (!payload?.passed || !payload.teamId) continue;
        // Find most recent un-recovered accepted attack against this team
        const entries = [...damageByAttack.entries()].reverse();
        for (const [attackId, record] of entries) {
          if (record.teamId !== payload.teamId) continue;
          if (recoveredAttacks.has(attackId)) continue;
          const heal = Math.round(record.damage * RECOVERY_RATIO);
          hp[payload.teamId] = Math.min(100, (hp[payload.teamId] ?? 100) + heal);
          recoveredAttacks.add(attackId);
          break;
        }
      }
    }
    return { hpByTeam: hp, lastHitByTeam: lastHit };
  }, [events]);

  // Current attack focus card: latest attack event
  const currentAttack = useMemo(() => {
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].eventType === "attack_created") return events[i];
    }
    return null;
  }, [events]);

  // Evidence chain: test/attack/defense/patch events
  const evidenceChain = useMemo(() => {
    return events.filter((event) => {
      if (event.eventType === "attack_created" || event.eventType === "defense_created") return true;
      if (event.eventType === "artifact_created") {
        const id = (event.rawPayload as { id?: string } | undefined)?.id ?? "";
        return id.startsWith("test_") || id.startsWith("patch_");
      }
      return false;
    });
  }, [events]);

  // Event stream: everything, latest first
  const eventStream = useMemo(() => [...events].reverse().slice(0, 12), [events]);

  return (
    <div className={styles.root} data-mode={mode} data-testid="live-arena-page">
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.battleId}>{t("arena.header.battle_label")} {battleId}</span>
          <span className={styles.liveDot} aria-label={t("arena.header.live")}>{t("arena.header.live")}</span>
          <span className={styles.timer}>{formatElapsed(elapsedMs)}</span>
        </div>
        <div className={styles.headerRight}>
          <button type="button" className={styles.headerButton}>{t("arena.header.rules")}</button>
          <button type="button" className={styles.headerButton}>{t("arena.header.share")}</button>
        </div>
      </header>

      <div className={styles.subhead}>
        <p className={styles.idea}>
          <span className={styles.ideaPrefix}>{t("arena.idea_prefix")}</span>
          {idea}
        </p>
        <RuntimeModeBadge mode={mode} />
      </div>

      <RoundProgress currentStage={currentStage} />

      <section className={styles.teams}>
        {V052_TEAMS.map((team) => (
          <article key={team.id} className={styles.teamCard} style={{ borderColor: team.accentColor }}>
            <header className={styles.teamHeader}>
              <div>
                <h3 className={styles.teamName} style={{ color: team.accentColor }}>{team.name}</h3>
                <span className={styles.teamSubtitle}>{team.subtitle}</span>
              </div>
              <button
                type="button"
                className={styles.evidenceButton}
                onClick={() => onOpenEvidenceLens?.(team.id)}
                aria-label={`${t("arena.agent_card.view_evidence")} ${team.name}`}
              >
                {t("arena.agent_card.view_evidence")}
              </button>
            </header>
            <HpBar
              hp={hpByTeam[team.id] ?? 100}
              teamColor={team.accentColor}
              teamName={team.name}
              lastHit={lastHitByTeam[team.id]}
            />
            <div className={styles.teamTags}>
              <span>{t("arena.agent_card.build")}</span>
              <span>{t("arena.agent_card.review")}</span>
              <span>{t("arena.agent_card.defend")}</span>
            </div>
            <button
              type="button"
              className={styles.artifactButton}
              onClick={() => onOpenArtifact?.(team.id)}
            >
              {t("arena.agent_card.view_artifact")}
            </button>
          </article>
        ))}
      </section>

      {currentAttack && (
        <section className={styles.attackFocus}>
          <h3 className={styles.sectionTitle}>{t("arena.current_attack.title")}</h3>
          <div className={styles.attackCard}>
            <div className={styles.attackMeta}>
              <span className={styles.attackLabel}>{t("arena.current_attack.attacker")}</span>
              <strong>{V052_TEAMS.find((team) => team.id === currentAttack.actorId)?.name ?? currentAttack.actorId}</strong>
              <span className={styles.attackLabel}>→</span>
              <span className={styles.attackLabel}>{t("arena.current_attack.target")}</span>
              <strong>{V052_TEAMS.find((team) => team.id === currentAttack.targetId)?.name ?? currentAttack.targetId}</strong>
            </div>
            <h4 className={styles.attackTitle}>{currentAttack.title}</h4>
            <TypewriterText text={currentAttack.content} speedMs={18} className={styles.attackContent} />
          </div>
        </section>
      )}

      <div className={styles.bottomGrid}>
        <section className={styles.evidenceChain}>
          <h3 className={styles.sectionTitle}>{t("arena.evidence_chain.title")}</h3>
          <ol className={styles.chainList}>
            {evidenceChain.map((event) => {
              const id = (event.rawPayload as { id?: string } | undefined)?.id ?? event.id;
              return (
                <li key={event.id} className={styles.chainItem} data-event-type={event.eventType}>
                  <span className={styles.chainDot} />
                  <span className={styles.chainId}>{id}</span>
                  <span className={styles.chainTitle}>{event.title}</span>
                </li>
              );
            })}
          </ol>
        </section>

        <section className={styles.eventStream}>
          <h3 className={styles.sectionTitle}>{t("arena.event_stream.title")}</h3>
          <ol className={styles.streamList}>
            {eventStream.map((event) => (
              <li key={event.id} className={styles.streamItem}>
                <span className={styles.streamTime}>{event.createdAt.slice(11, 19)}</span>
                <span className={styles.streamTitle}>{event.title}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <aside className={styles.hostCorner}>
        <ArenaHost round={currentRound} />
      </aside>

      {fatalTakeover && (
        <div className={styles.fatalOverlay} role="alert" data-testid="fatal-takeover">
          <div className={styles.fatalBanner}>{t("arena.fatal.banner")}</div>
          <div className={styles.fatalBody}>
            <div className={styles.fatalSide}>
              <span className={styles.fatalLabel}>{t("arena.fatal.attacker_side")}</span>
              <strong>{V052_TEAMS.find((team) => team.id === fatalTakeover.actorId)?.name ?? fatalTakeover.actorId}</strong>
            </div>
            <div className={styles.fatalCenter}>
              <div className={styles.fatalHp}>
                <span className={styles.fatalHpBefore}>
                  {(hpByTeam[fatalTakeover.targetId ?? ""] ?? 100) + (DAMAGE_MAP[((fatalTakeover.rawPayload as { severity?: Severity })?.severity ?? "fatal")] ?? 50)}
                </span>
                <span className={styles.fatalHpDelta}>
                  -{DAMAGE_MAP[((fatalTakeover.rawPayload as { severity?: Severity })?.severity ?? "fatal")] ?? 50}
                </span>
                <span className={styles.fatalHpAfter}>
                  {hpByTeam[fatalTakeover.targetId ?? ""] ?? 100}
                </span>
              </div>
              <p className={styles.fatalClaim}>{fatalTakeover.content}</p>
            </div>
            <div className={styles.fatalSide}>
              <span className={styles.fatalLabel}>{t("arena.fatal.defender_side")}</span>
              <strong>{V052_TEAMS.find((team) => team.id === fatalTakeover.targetId)?.name ?? fatalTakeover.targetId}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

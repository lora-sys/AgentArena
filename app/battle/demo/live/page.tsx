import Link from "next/link";
import { ArrowRight, Play, Swords, ShieldCheck, Trophy, Activity, AlertTriangle, Zap } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { BattleReplayPlayer, type BattlePlayerTeam } from "@/components/battle-replay-player";
import { getDemoBattle, getDemoBundle } from "@/lib/demo-data";
import type { Route } from "next";
import styles from "./page.module.css";
import { redirect } from "next/navigation";

/**
 * Live page — Hallmark Tabbed Long Document macrostructure.
 * Sticky status bar + tabbed doc + mono event feed.
 * The page IS the timeline.
 */
export function DemoLiveSurface() {
  const demoBattle = getDemoBattle();
  const bundle = getDemoBundle();
  const playerTeams: BattlePlayerTeam[] = bundle.teams.map((team) => ({
    id: team.id,
    name: team.name,
    initials: team.name.split(" ").map((part) => part[0]).join(""),
    color: team.id === "safe_builder" ? "#49D6C8" : team.id === "viral_designer" ? "#F5567E" : "#F2B84B",
    subtitle: team.strategy,
  }));

  // 12 most recent events for the feed.
  const recentEvents = demoBattle.events.slice(-12);

  const eventIcon = (type: string) => {
    if (type === "Attack") return <Swords size={12} />;
    if (type === "Defense") return <ShieldCheck size={12} />;
    if (type === "Score") return <Trophy size={12} />;
    if (type === "Champion") return <Zap size={12} />;
    if (type === "Artifact") return <AlertTriangle size={12} />;
    return <Activity size={12} />;
  };

  const eventTypeClass = (type: string) => {
    if (type === "Attack") return styles.feedTypeAttack;
    if (type === "Defense") return styles.feedTypeDefense;
    if (type === "Score") return styles.feedTypeScore;
    if (type === "Champion") return styles.feedTypeChampion;
    if (type === "Artifact") return styles.feedTypeArtifact;
    return styles.feedTypeArtifact;
  };

  return (
    <AppShell active="battle" showRail currentRound="cross_attack">
      <div className={styles.doc}>
        {/* ─── STICKY STATUS BAR (red-pulse mono) ──────── */}
        <header className={styles.statusBar}>
          <div className={styles.statusLeft}>
            <span className={styles.pulse} aria-hidden="true" />
            <span className={styles.liveTag}>LIVE</span>
            <span className={styles.sep}>·</span>
            <h1 className={styles.statusTitle}>{demoBattle.title}</h1>
          </div>
          <div className={styles.statusRight}>
            <span className={styles.roundPill}>Round 2 · Cross Attack</span>
            <span className={styles.timer}>
              <span aria-hidden="true">⏱</span>
              {demoBattle.elapsed}
            </span>
          </div>
        </header>

        {/* ─── TABS (Specimen-style numbered) ─────────── */}
        <nav className={styles.tabs} aria-label="Live document sections">
          <a className={`${styles.tab} ${styles.tabActive}`}>
            <span className={styles.tabNum}>01</span>
            <span>Stage</span>
          </a>
          <a className={styles.tab}>
            <span className={styles.tabNum}>02</span>
            <span>Event feed</span>
          </a>
          <a className={styles.tab}>
            <span className={styles.tabNum}>03</span>
            <span>Attacks</span>
          </a>
          <a className={styles.tab}>
            <span className={styles.tabNum}>04</span>
            <span>Defenses</span>
          </a>
          <a className={styles.tab}>
            <span className={styles.tabNum}>05</span>
            <span>Judge</span>
          </a>
        </nav>

        {/* Shared event-driven stage: static demo data uses the same playback path as SSE battles. */}
        <BattleReplayPlayer
          battleId="demo"
          title={demoBattle.title}
          brief={bundle.battle.idea}
          teams={playerTeams}
          events={bundle.events}
          connectionState="static"
        />

        {/* ─── EVENT FEED (mono timeline) ─────────────── */}
        <section className={styles.section} aria-label="Battle event timeline">
          <span className={styles.sectionEyebrow}>Section 02 · Event feed</span>
          <h2 className={styles.sectionTitle}>
            The last <em>{recentEvents.length} events.</em>
          </h2>
          <p className={styles.sectionSub}>
            Every event cited below is a real battle action &mdash; bound to a
            timestamp in the demo bundle. Click an event to inspect it in the
            replay.
          </p>

          <div className={styles.feed} data-testid="event-feed">
            {recentEvents.map((ev) => (
              <div key={ev.id} data-testid="feed-row" className={styles.feedRow}>
                <span className={styles.feedTime}>{ev.time}</span>
                <span className={`${styles.feedType} ${eventTypeClass(ev.type)}`}>
                  {eventIcon(ev.type)}
                  {ev.type}
                </span>
                <span className={styles.feedActor}>{ev.actor}</span>
                <span className={styles.feedSummary}>{ev.summary}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CALLOUT ────────────────────────────────── */}
        <div className={styles.callout}>
          <div>
            <h3 className={styles.calloutTitle}>
              Pause the live. Open the <em>replay</em>.
            </h3>
          </div>
          <div>
              <Link href={"/battle/demo?view=replay" as Route} className={styles.calloutCta}>
              <Play size={14} fill="currentColor" />
              Open Replay
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function LegacyDemoLivePage() {
  redirect("/battle/demo" as Route);
}

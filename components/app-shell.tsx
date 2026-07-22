"use client";

import type { Route } from "next";
import Link from "next/link";
import { BarChart3, Boxes, Compass, Flag, Play, ShieldCheck, Trophy } from "lucide-react";
import { HeaderActions } from "./header-actions";
import { usePathname } from "next/navigation";
import type { BattleRound } from "@/lib/types";

type RailItem = {
  round: BattleRound;
  label: string;
  time: string;
  icon: typeof Flag;
  href: Route;
};

type AppShellProps = {
  active: "battle" | "teams" | "battles" | "passport" | "explore" | "newbattle";
  showRail?: boolean;
  currentRound?: BattleRound;
  children: React.ReactNode;
};

export function AppShell({ active, showRail = false, currentRound = "cross_attack", children }: AppShellProps) {
  const pathname = usePathname();

  // Derive context from current route so navigation adapts automatically.
  const battleMatch = pathname.match(/^\/battle\/([^/]+)/);
  const currentBattleId = battleMatch?.[1] ?? null;
  const nav = [
    { id: "battle", label: "Home", href: "/" },
    { id: "battles", label: "Battles", href: "/battles" },
    { id: "newbattle", label: "Start Battle", href: "/battle/new" },
  ] as const;

  // Derive rail links from current battle context
  const currentBattleIdForRoute = (currentBattleId ?? "demo") as Route;
  const rail: readonly RailItem[] = [
    { round: "briefing", label: "Briefing", time: "18:30", icon: Flag, href: `/battle/${currentBattleIdForRoute}` as Route },
    { round: "proposal", label: "Proposal", time: "18:34", icon: Flag, href: `/battle/${currentBattleIdForRoute}` as Route },
    { round: "cross_attack", label: "Cross Attack", time: "18:38", icon: Boxes, href: `/battle/${currentBattleIdForRoute}` as Route },
    { round: "defense", label: "Defense", time: "19:02", icon: ShieldCheck, href: `/battle/${currentBattleIdForRoute}` as Route },
    { round: "judging", label: "Judging", time: "19:18", icon: BarChart3, href: `/battle/${currentBattleIdForRoute}?view=result` as Route },
    { round: "champion", label: "Evidence", time: "19:24", icon: Trophy, href: `/battle/${currentBattleIdForRoute}?view=evidence` as Route }
  ] as const;

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link href="/" className="brand" aria-label="Agent Arena home">
          <span className="brand-mark">
            <ShieldCheck size={24} strokeWidth={2.4} />
          </span>
          <span>Agent Arena</span>
        </Link>

        <nav className="nav-tabs" aria-label="Primary">
          {nav.map((item) => (
            <Link key={item.id} href={item.href as Route} className={active === item.id ? "active" : ""}>
              {item.label}
            </Link>
          ))}
        </nav>

        <HeaderActions />
      </header>

      {currentBattleId ? (
        <nav className="battle-context-nav" aria-label="Battle views">
          <Link href={`/battle/${currentBattleId}` as Route}>Arena</Link>
          <Link href={`/battle/${currentBattleId}?view=result` as Route}>Results</Link>
          <Link href={`/battle/${currentBattleId}?view=evidence` as Route}>Evidence</Link>
        </nav>
      ) : null}

      <div className={showRail ? "page-with-rail" : "page-no-rail"}>
        {showRail ? <BattleRail currentRound={currentRound} rail={rail} /> : null}
        <main className="page-main">{children}</main>
      </div>
    </div>
  );
}

function BattleRail({ currentRound, rail }: { currentRound: BattleRound; rail: readonly RailItem[] }) {
  const activeIndex = rail.findIndex((item) => item.round === currentRound);

  return (
    <aside className="battle-rail" aria-label="Battle flow">
      <p className="rail-title">Battle Flow</p>
      <ol>
        {rail.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.round === currentRound;
          const isPast = index < activeIndex;
          return (
            <li key={item.round} className={isActive ? "active" : isPast ? "past" : ""}>
              <Link href={item.href} className="rail-link">
                <span className="rail-node">
                  <Icon size={16} />
                </span>
                <span>
                  <strong>{item.label}</strong>
                  <small>{isPast || isActive ? item.time : "-"}</small>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

export function PrimaryAction({
  href,
  children,
  icon = "play"
}: {
  href: Route;
  children: React.ReactNode;
  icon?: "play" | "compass";
}) {
  const Icon = icon === "compass" ? Compass : Play;

  return (
    <Link href={href} className="primary-action">
      <Icon size={18} fill="currentColor" />
      {children}
    </Link>
  );
}

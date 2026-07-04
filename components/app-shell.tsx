import Link from "next/link";
import type { Route } from "next";
import { BarChart3, Boxes, Compass, Flag, Play, ShieldCheck, Trophy } from "lucide-react";
import { HeaderActions } from "./header-actions";
import type { BattleRound } from "@/lib/types";

type AppShellProps = {
  active: "battle" | "teams" | "battles" | "passport" | "explore";
  showRail?: boolean;
  currentRound?: BattleRound;
  children: React.ReactNode;
};

const nav = [
  { id: "battle", label: "Battle", href: "/" },
  { id: "teams", label: "Teams", href: "/teams" },
  { id: "battles", label: "Battles", href: "/battles" },
  { id: "passport", label: "Passport", href: "/agent/viral-designer/passport" },
  { id: "explore", label: "Explore", href: "/battle/demo/replay" }
] as const;

const rail = [
  { round: "briefing", label: "Briefing", time: "18:30", icon: Flag, href: "/battle/demo/live" },
  { round: "proposal", label: "Proposal", time: "18:34", icon: Flag, href: "/battle/demo/live" },
  { round: "cross_attack", label: "Cross Attack", time: "18:38", icon: Boxes, href: "/battle/demo/live" },
  { round: "defense", label: "Defense", time: "19:02", icon: ShieldCheck, href: "/battle/demo/live" },
  { round: "judging", label: "Judging", time: "19:18", icon: BarChart3, href: "/battle/demo/result" },
  { round: "champion", label: "Replay", time: "19:24", icon: Trophy, href: "/battle/demo/replay" }
] as const;

export function AppShell({ active, showRail = false, currentRound = "cross_attack", children }: AppShellProps) {
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
            <Link key={item.id} href={item.href} className={active === item.id ? "active" : ""}>
              {item.label}
            </Link>
          ))}
        </nav>

        <HeaderActions />
      </header>

      <div className={showRail ? "page-with-rail" : "page-no-rail"}>
        {showRail ? <BattleRail currentRound={currentRound} /> : null}
        <main className="page-main">{children}</main>
      </div>
    </div>
  );
}

function BattleRail({ currentRound }: { currentRound: BattleRound }) {
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

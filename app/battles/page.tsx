import { BarChart3, Play, ShieldCheck, Trophy } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MiniStat } from "@/components/arena-cards";
import { BattlesTable } from "@/components/battles-table";

export default function BattlesPage() {
  return (
    <AppShell active="battles" showRail currentRound="cross_attack">
      <div className="page-heading">
        <h1>Battles</h1>
        <p>View and analyze your past battles.</p>
      </div>
      <section className="stats-strip right-heavy">
        <MiniStat icon={<ShieldCheck size={22} />} label="Total Battles" value="42" note="12% vs last 30 days" />
        <MiniStat icon={<Play size={22} />} label="Replay Shares" value="18" note="8% vs last 30 days" />
        <MiniStat icon={<Trophy size={22} />} label="Top Team" value="Safe Builder" note="Win rate 61%" />
        <MiniStat icon={<BarChart3 size={22} />} label="Completion Rate" value="92%" note="6% vs last 30 days" />
      </section>
      <BattlesTable />
    </AppShell>
  );
}

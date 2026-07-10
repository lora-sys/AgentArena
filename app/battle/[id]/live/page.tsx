import { AppShell } from "@/components/app-shell";
import { LiveBattleClient } from "@/components/live-battle-client";

type LivePageProps = {
  params: Promise<{ id: string }>;
};

export default async function LiveBattlePage({ params }: LivePageProps) {
  const { id } = await params;

  return (
    <AppShell active="battle" showRail currentRound="cross_attack">
      <a href="#event-log" className="skip-link">
        Skip to event log
      </a>

      <LiveBattleClient battleId={id} />
    </AppShell>
  );
}
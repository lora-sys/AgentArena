import { notFound } from "next/navigation";
import { DemoLiveSurface } from "@/app/battle/demo/live/page";
import { DemoReplaySurface } from "@/app/battle/demo/replay/page";
import { DemoResultSurface } from "@/app/battle/demo/result/page";
import { BattleReplayClient } from "@/components/battle-replay-client";
import { ClientBattleResult } from "./result/page";
import { LiveBattleClient } from "@/components/live-battle-client";

type BattlePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string }>;
};

/** Canonical battle surface. The query selects a view without multiplying routes. */
export default async function BattlePage({ params, searchParams }: BattlePageProps) {
  const { id } = await params;
  const { view = "arena" } = await searchParams;

  if (!["arena", "result", "replay", "evidence"].includes(view)) notFound();

  if (id === "demo") {
    if (view === "result") return <DemoResultSurface />;
    if (view === "replay" || view === "evidence") return <DemoReplaySurface />;
    return <DemoLiveSurface />;
  }

  if (view === "result") return <ClientBattleResult params={Promise.resolve({ id })} />;
  if (view === "replay" || view === "evidence") return <BattleReplayClient battleId={id} />;
  return <LiveBattleClient battleId={id} />;
}

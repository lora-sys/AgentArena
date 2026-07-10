import { Suspense } from "react";
import { BattleReplayClient } from "@/components/battle-replay-client";

type BattleReplayPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BattleReplayPage({ params }: BattleReplayPageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <BattleReplayClient battleId={id} />
    </Suspense>
  );
}
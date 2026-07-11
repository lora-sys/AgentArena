import { LiveBattleClient } from "@/components/live-battle-client";

type LivePageProps = {
  params: Promise<{ id: string }>;
};

export default async function LiveBattlePage({ params }: LivePageProps) {
  const { id } = await params;

  return <LiveBattleClient battleId={id} />;
}

import { redirect } from "next/navigation";
import type { Route } from "next";

type BattleReplayPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BattleReplayPage({ params }: BattleReplayPageProps) {
  const { id } = await params;
  redirect(`/battle/${encodeURIComponent(id)}?view=replay` as Route);
}

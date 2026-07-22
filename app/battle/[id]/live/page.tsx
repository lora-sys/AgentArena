import { redirect } from "next/navigation";
import type { Route } from "next";

type LivePageProps = {
  params: Promise<{ id: string }>;
};

export default async function LiveBattlePage({ params }: LivePageProps) {
  const { id } = await params;

  redirect(`/battle/${encodeURIComponent(id)}` as Route);
}

import { AppShell } from "@/components/app-shell";
import { BattleSetupForm } from "@/components/battle-setup-form";

export default function NewBattlePage() {
  return (
    <AppShell active="battle">
      <div className="page-heading">
        <h1>Battle Setup</h1>
        <p>Create a mission and configure the rules. Let the best team win.</p>
      </div>
      <BattleSetupForm />
    </AppShell>
  );
}

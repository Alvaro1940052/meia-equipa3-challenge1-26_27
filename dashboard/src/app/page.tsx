import DroolsPanel from "@/components/engines/DroolsPanel";
import { resolveMode } from "@/components/engines/PrologModeSwitch";
import PrologPanel from "@/components/engines/PrologPanel";
import ReturnsPanel from "@/components/engines/ReturnsPanel";
import EngineNav from "@/components/shared/EngineNav";
import { resolveEngine } from "@/config/engines";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ motor?: string | string[]; modo?: string | string[] }>;
}) {
  const params = await searchParams;
  const engine = resolveEngine(params.motor);

  return (
    <main className="container">
      <header className="header">
        <div className="header-title">
          <h1>Sistema Especialista</h1>
          <p>Compare os motores de inferência sobre os mesmos cenários</p>
        </div>
      </header>
      <EngineNav active={engine.id} />
      {engine.id === "prolog" && <PrologPanel mode={resolveMode(params.modo)} />}
      {engine.id === "drools" && <DroolsPanel />}
      {engine.id === "returns" && <ReturnsPanel />}
    </main>
  );
}

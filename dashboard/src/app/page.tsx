import ReturnsPanel from "@/components/engines/ReturnsPanel";
import EngineNav from "@/components/shared/EngineNav";
import { resolveEngine } from "@/config/engines";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ motor?: string | string[] }>;
}) {
  const params = await searchParams;
  const engine = resolveEngine(params.motor);

  return (
    <main className="container">
      <header className="header">
        <div className="header-title">
          <h1>Sistema Especialista · Levi&apos;s</h1>
          <p>
            Avaliação e explicação de trocas e devoluções nos motores Drools e Prolog
          </p>
        </div>
      </header>
      <EngineNav active={engine.id} />
      <ReturnsPanel key={engine.id} engineId={engine.id} />
    </main>
  );
}

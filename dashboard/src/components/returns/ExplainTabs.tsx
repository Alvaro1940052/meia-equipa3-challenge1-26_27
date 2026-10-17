"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ApiClientError, api } from "@/client/api";
import ErrorBanner from "@/components/shared/ErrorBanner";
import {
  ELIGIBILITY,
  WHAT_IF_PRESETS,
  cause,
  cleanRuleCodes,
  label,
  moduleLabel,
} from "@/config/returnsLabels";
import type {
  CondicaoDto,
  DadosEmFaltaResponse,
  Elegibilidade,
  ExplicacaoComoResponse,
  ExplicacaoPorqueNaoConclusaoResponse,
  ExplicacaoPorqueResponse,
  ReturnRequest,
  SimulacaoResponse,
} from "@/types/returns";

const ExplainBaseContext = createContext<string>("/api/returns");
const LOCALE = "locale=pt-PT";

type TabId = "how" | "whynot" | "missing" | "whatif";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "how", label: "Como Chegou Aqui?", icon: "route" },
  { id: "whynot", label: "Porque Não...?", icon: "help_outline" },
  { id: "missing", label: "O Que Falta?", icon: "checklist" },
  { id: "whatif", label: "E Se...?", icon: "science" },
];

const messageOf = (err: unknown) =>
  err instanceof ApiClientError ? err.message : "Não foi possível obter a explicação do motor.";

/** Carrega um recurso ao montar e sempre que load mudar; devolve estado e repetição. */
function useRemote<T>(load: () => Promise<T>) {
  const [settled, setSettled] = useState<{
    source: () => Promise<T>;
    data: T | null;
    error: string | null;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    load()
      .then((data) => !cancelled && setSettled({ source: load, data, error: null }))
      .catch((err) => !cancelled && setSettled({ source: load, data: null, error: messageOf(err) }));
    return () => {
      cancelled = true;
    };
  }, [load, attempt]);

  const current = settled?.source === load ? settled : null;
  const retry = useCallback(() => {
    setSettled(null);
    setAttempt((value) => value + 1);
  }, []);

  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    loading: current === null,
    retry,
  };
}

function Status({
  loading,
  error,
  retry,
}: {
  loading: boolean;
  error: string | null;
  retry: () => void;
}) {
  if (error) return <ErrorBanner message={error} onRetry={retry} />;
  if (loading)
    return (
      <div className="flex items-center gap-2.5 p-4 rounded-xl bg-surface-container text-on-surface-variant text-sm font-medium animate-pulse">
        <span className="material-symbols-outlined text-primary text-[20px] animate-spin">sync</span>
        <span>A carregar explicação detalhada do motor...</span>
      </div>
    );
  return null;
}

function Conditions({ items }: { items: CondicaoDto[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-col gap-2 mt-2">
      {items.map((item, index) => (
        <li
          key={index}
          className={`flex items-start gap-2.5 p-2.5 rounded-xl text-xs ${
            item.cumprida
              ? "bg-emerald-50/70 border border-emerald-200 text-emerald-950"
              : "bg-rose-50/70 border border-rose-200 text-rose-950"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] shrink-0 ${
              item.cumprida ? "text-primary" : "text-error"
            }`}
          >
            {item.cumprida ? "check_circle" : "cancel"}
          </span>
          <div className="flex flex-col">
            <span className="font-medium">
              {cleanRuleCodes(item.descricao ?? item.nome) || "Critério de validação"}
            </span>
            {item.valor && (
              <span className="text-[11px] text-on-surface-variant font-mono mt-0.5">
                Valor avaliado: {item.valor}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function HowTab({ evaluationId }: { evaluationId: string }) {
  const base = useContext(ExplainBaseContext);
  const load = useCallback(
    () => api<ExplicacaoComoResponse>(`${base}/avaliacoes/${evaluationId}/explicacoes/como?${LOCALE}`),
    [base, evaluationId]
  );
  const { data, error, loading, retry } = useRemote(load);

  return (
    <div className="flex flex-col gap-4">
      <Status loading={loading} error={error} retry={retry} />
      {data && (
        <>
          {data.resumo && (
            <div className="p-4 rounded-2xl bg-surface-container-low border border-border-card text-on-surface font-body-md text-sm">
              {cleanRuleCodes(data.resumo)}
            </div>
          )}

          {data.paragem && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-[18px]">stop_circle</span>
              <span>O raciocínio concluiu em: {cleanRuleCodes(data.paragem)}</span>
            </div>
          )}

          <div className="flex flex-col gap-3 relative before:absolute before:top-4 before:bottom-4 before:left-5 before:w-0.5 before:bg-border-card before:z-0">
            {data.passos.map((step) => {
              const ruleTitle = cleanRuleCodes(step.nomeRegra) || moduleLabel(step.modulo);
              const message = cleanRuleCodes(step.mensagem);
              const isApproved = step.resultado === "PERMITIR";
              const isRejected = step.resultado === "RECUSAR";
              const isReview = step.resultado === "REVER";

              return (
                <div
                  key={step.ordem}
                  className="card-tactile p-4 bg-white border border-border-card rounded-2xl shadow-xs relative z-10 ml-0 sm:ml-2 flex items-start gap-3.5"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 shadow-xs ${
                      isApproved
                        ? "bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300"
                        : isRejected
                        ? "bg-rose-100 text-rose-800 ring-2 ring-rose-300"
                        : isReview
                        ? "bg-amber-100 text-amber-800 ring-2 ring-amber-300"
                        : "bg-surface-container text-on-surface ring-2 ring-border-card"
                    }`}
                  >
                    {step.ordem}
                  </div>

                  <div className="flex flex-col flex-1 gap-1">
                    <div className="flex items-center gap-2 flex-wrap justify-between">
                      <span className="font-headline-sm text-sm font-bold text-on-surface">
                        {ruleTitle}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {step.modulo && (
                          <span className="px-2.5 py-0.5 rounded-full bg-surface-container-low text-[10px] font-bold text-on-surface-variant border border-border-card">
                            {moduleLabel(step.modulo)}
                          </span>
                        )}
                        {step.resultado && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              isApproved
                                ? "bg-emerald-100 text-emerald-800"
                                : isRejected
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {ELIGIBILITY[step.resultado]?.label ?? step.resultado}
                          </span>
                        )}
                        {step.aValidar && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                            Requer validação
                          </span>
                        )}
                      </div>
                    </div>

                    {message && (
                      <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                        {message}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function WhyNotTab({
  evaluationId,
  obtained,
}: {
  evaluationId: string;
  obtained: Elegibilidade | null;
}) {
  const base = useContext(ExplainBaseContext);
  const targets = (Object.keys(ELIGIBILITY) as Elegibilidade[]).filter((value) => value !== obtained);
  const [target, setTarget] = useState<Elegibilidade>(targets[0] || "PERMITIR");

  const load = useCallback(
    () =>
      api<ExplicacaoPorqueNaoConclusaoResponse>(
        `${base}/avaliacoes/${evaluationId}/explicacoes/porque-nao?conclusao=${encodeURIComponent(
          `OUT-001:${target}`
        )}&${LOCALE}`
      ),
    [base, evaluationId, target]
  );
  const { data, error, loading, retry } = useRemote(load);

  return (
    <div className="flex flex-col gap-4">
      {/* Target Eligibility Selectors */}
      <div className="flex flex-wrap gap-2">
        {targets.map((value) => {
          const isActive = value === target;
          return (
            <button
              key={value}
              type="button"
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all cursor-pointer ${
                isActive
                  ? "bg-secondary text-white border-secondary shadow-[0_3px_0_#003E8A]"
                  : "bg-white text-on-surface border-border-card hover:bg-surface-container"
              }`}
              aria-pressed={isActive}
              onClick={() => setTarget(value)}
            >
              Porque não “{ELIGIBILITY[value].label}”?
            </button>
          );
        })}
      </div>

      <Status loading={loading} error={error} retry={retry} />

      {data && (
        <div className="flex flex-col gap-4">
          {data.resumo && (
            <div className="p-4 rounded-2xl bg-surface-container-low border border-border-card text-on-surface font-body-md text-sm">
              {cleanRuleCodes(data.resumo)}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            {data.regras.map((rule, index) => (
              <div
                key={index}
                className="card-tactile p-4 bg-white border border-border-card rounded-2xl flex flex-col gap-2 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-headline-sm text-sm font-bold text-on-surface">
                    {cause(rule.causa)}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-[11px] font-bold text-on-surface-variant">
                    Condição de Política
                  </span>
                </div>

                {rule.resumo && (
                  <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                    {cleanRuleCodes(rule.resumo)}
                  </p>
                )}

                <Conditions items={rule.condicoes} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MissingTab({ request }: { request: ReturnRequest }) {
  const base = useContext(ExplainBaseContext);
  const load = useCallback(
    () =>
      api<DadosEmFaltaResponse>(`${base}/dados-em-falta?${LOCALE}`, {
        method: "POST",
        body: request,
      }),
    [base, request]
  );
  const { data, error, loading, retry } = useRemote(load);
  const [why, setWhy] = useState<{
    code: string;
    data?: ExplicacaoPorqueResponse;
    error?: string;
  } | null>(null);

  async function askWhy(code: string) {
    setWhy({ code });
    try {
      const response = await api<ExplicacaoPorqueResponse>(
        `${base}/porque?dado=${encodeURIComponent(code)}&${LOCALE}`,
        { method: "POST", body: request }
      );
      setWhy({ code, data: response });
    } catch (err) {
      setWhy({ code, error: messageOf(err) });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Status loading={loading} error={error} retry={retry} />
      {data && (
        <>
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-medium ${
              data.completo
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] ${
                data.completo ? "text-primary" : "text-tertiary"
              }`}
            >
              {data.completo ? "verified" : "help_center"}
            </span>
            <span>
              {data.completo
                ? "O pedido tem todos os dados necessários para uma decisão completa e fundamentada."
                : "Existem dados em falta recomendados para assegurar a conformidade total."}{" "}
              {cleanRuleCodes(data.resumo)}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {data.dados.map((item) => (
              <div
                key={item.codigo}
                className="card-tactile p-4 bg-white border border-border-card rounded-2xl flex flex-col gap-2.5 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-headline-sm text-sm font-bold text-on-surface">
                    {item.descricao ?? "Dado complementar de balcão"}
                  </span>
                  {item.obrigatorio && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase tracking-wider">
                      Obrigatório
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => askWhy(item.codigo)}
                    className="btn-tactile-secondary px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary">help</span>
                    <span>Porque é necessário este dado?</span>
                  </button>
                </div>

                {why?.code === item.codigo && (
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-card text-xs flex flex-col gap-1.5 animate-in fade-in duration-150">
                    {why.error && <p className="text-error font-medium">{why.error}</p>}
                    {!why.data && !why.error && (
                      <p className="text-on-surface-variant font-medium">A consultar diretrizes...</p>
                    )}
                    {why.data?.pergunta && (
                      <p className="font-bold text-on-surface text-sm">{why.data.pergunta}</p>
                    )}
                    {why.data?.resumo && (
                      <p className="text-on-surface-variant">{cleanRuleCodes(why.data.resumo)}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function WhatIfTab({ evaluationId }: { evaluationId: string }) {
  const base = useContext(ExplainBaseContext);
  const [simulation, setSimulation] = useState<SimulacaoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState("");
  const [value, setValue] = useState("");

  async function simulate(changes: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      setSimulation(
        await api<SimulacaoResponse>(`${base}/avaliacoes/${evaluationId}/simulacoes?${LOCALE}`, {
          method: "POST",
          body: { alteracoes: changes },
        })
      );
    } catch (err) {
      setSimulation(null);
      setError(messageOf(err));
    } finally {
      setLoading(false);
    }
  }

  function customChange(): Record<string, unknown> {
    let parsed: unknown = value;
    try {
      parsed = JSON.parse(value);
    } catch {
      // Texto simples segue como string
    }
    return { [path.trim()]: parsed };
  }

  const simulated = simulation?.decisaoSimulada?.elegibilidade;

  return (
    <div className="flex flex-col gap-4">
      <p className="font-body-md text-on-surface-variant text-sm">
        Explore hipóteses e simule como a decisão mudaria caso um critério do cliente ou da peça fosse diferente:
      </p>

      {/* Preset simulation buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {WHAT_IF_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            disabled={loading}
            onClick={() => simulate(preset.changes)}
            className="p-3.5 rounded-2xl bg-white border-2 border-border-card border-b-4 border-b-border-card-bottom hover:border-secondary hover:bg-blue-50/40 text-left transition-all active:translate-y-0.5 cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-2 text-secondary font-bold text-xs uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[18px]">science</span>
              <span>Hipótese</span>
            </div>
            <span className="font-headline-sm text-xs sm:text-sm font-bold text-on-surface leading-snug block">
              {preset.label}
            </span>
          </button>
        ))}
      </div>

      {/* Advanced Custom Simulator */}
      <details className="group rounded-2xl border border-border-card bg-surface-container-low p-4">
        <summary className="font-label-md text-xs font-bold uppercase tracking-wider text-on-surface-variant cursor-pointer flex items-center justify-between">
          <span>Alteração Personalizada (Avançado)</span>
          <span className="material-symbols-outlined text-[18px] group-open:rotate-180 transition-transform">
            expand_more
          </span>
        </summary>
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-3 pt-3 border-t border-border-card">
          <input
            className="w-full sm:flex-1 px-3 py-2 rounded-xl bg-white border border-border-card text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Caminho do campo"
            placeholder="Ex: artigos[0].estado.condicaoUso"
            value={path}
            onChange={(event) => setPath(event.target.value)}
          />
          <input
            className="w-full sm:flex-1 px-3 py-2 rounded-xl bg-white border border-border-card text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Novo valor"
            placeholder="Ex: USADO"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <button
            type="button"
            className="btn-tactile-primary px-4 py-2 text-xs font-bold whitespace-nowrap cursor-pointer disabled:opacity-50"
            disabled={loading || !path.trim() || !value.trim()}
            onClick={() => simulate(customChange())}
          >
            Simular
          </button>
        </div>
      </details>

      {loading && (
        <div className="flex items-center gap-2 p-3 text-xs text-on-surface-variant font-medium animate-pulse">
          <span className="material-symbols-outlined text-primary text-[18px] animate-spin">sync</span>
          <span>A calcular simulação no motor de regras...</span>
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      {simulation && (
        <div className="card-tactile p-5 bg-white border border-border-card rounded-2xl shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="font-label-md text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Resultado da Simulação
            </span>
            {simulated && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                  simulated === "PERMITIR"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : simulated === "RECUSAR"
                    ? "bg-rose-100 text-rose-800 border-rose-300"
                    : "bg-amber-100 text-amber-800 border-amber-300"
                }`}
              >
                Decisão Simulada: {ELIGIBILITY[simulated]?.label ?? simulated}
              </span>
            )}
          </div>

          {simulation.resumo && (
            <p className="font-body-md text-xs sm:text-sm text-on-surface">
              {cleanRuleCodes(simulation.resumo)}
            </p>
          )}

          {simulation.diferencas.length > 0 ? (
            <div className="w-full overflow-x-auto rounded-xl border border-border-card shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-surface-container-low text-on-surface-variant font-bold border-b border-border-card">
                  <tr>
                    <th scope="col" className="p-2.5">Onde</th>
                    <th scope="col" className="p-2.5">Campo</th>
                    <th scope="col" className="p-2.5">Antes</th>
                    <th scope="col" className="p-2.5">Depois</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-card/50">
                  {simulation.diferencas.map((diff, index) => (
                    <tr key={index} className="hover:bg-surface-container-lowest">
                      <td className="p-2.5 font-bold text-on-surface">{diff.alvo ?? "—"}</td>
                      <td className="p-2.5 text-on-surface-variant">{label(diff.campo)}</td>
                      <td className="p-2.5 text-rose-700 font-medium">{label(diff.original)}</td>
                      <td className="p-2.5 text-emerald-700 font-bold">{label(diff.simulado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-on-surface-variant font-medium">
              Esta alteração não altera as conclusões de elegibilidade do veredito.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ExplainTabs({
  evaluationId,
  request,
  obtained,
  base = "/api/returns",
}: {
  evaluationId: string;
  request: ReturnRequest;
  obtained: Elegibilidade | null;
  base?: string;
}) {
  const [active, setActive] = useState<TabId>("how");

  return (
    <ExplainBaseContext.Provider value={base}>
      <section className="w-full flex flex-col gap-4" aria-label="Explicações da decisão">
        {/* Navigation Tabs Pill Bar */}
        <div
          role="tablist"
          className="flex flex-wrap gap-2 p-1.5 bg-surface-container rounded-2xl border border-border-card"
        >
          {TABS.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary-container text-white shadow-[0_2px_0_0_#059669]"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-white/60"
                }`}
                onClick={() => setActive(tab.id)}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div role="tabpanel" id="panel-how" aria-labelledby="tab-how" hidden={active !== "how"}>
          <HowTab evaluationId={evaluationId} />
        </div>
        <div role="tabpanel" id="panel-whynot" aria-labelledby="tab-whynot" hidden={active !== "whynot"}>
          <WhyNotTab evaluationId={evaluationId} obtained={obtained} />
        </div>
        <div role="tabpanel" id="panel-missing" aria-labelledby="tab-missing" hidden={active !== "missing"}>
          <MissingTab request={request} />
        </div>
        <div role="tabpanel" id="panel-whatif" aria-labelledby="tab-whatif" hidden={active !== "whatif"}>
          <WhatIfTab evaluationId={evaluationId} />
        </div>
      </section>
    </ExplainBaseContext.Provider>
  );
}

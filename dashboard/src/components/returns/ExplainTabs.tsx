"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiClientError, api } from "@/client/api";
import ErrorBanner from "@/components/shared/ErrorBanner";
import { ELIGIBILITY, WHAT_IF_PRESETS, cause, label } from "@/config/returnsLabels";
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

const BASE = "/api/returns";
const LOCALE = "locale=pt-PT";

type TabId = "how" | "whynot" | "missing" | "whatif";

const TABS: { id: TabId; label: string }[] = [
  { id: "how", label: "Como chegou aqui?" },
  { id: "whynot", label: "Porque não…?" },
  { id: "missing", label: "O que falta?" },
  { id: "whatif", label: "E se…?" },
];

const messageOf = (err: unknown) =>
  err instanceof ApiClientError ? err.message : "Não foi possível obter a explicação.";

/** Carrega um recurso ao montar e sempre que `load` mudar; devolve estado e repetição. */
function useRemote<T>(load: () => Promise<T>) {
  // O resultado fica etiquetado com o `load` que o produziu: se `load` mudar, volta a "a carregar".
  const [settled, setSettled] = useState<{ source: () => Promise<T>; data: T | null; error: string | null } | null>(null);
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

  return { data: current?.data ?? null, error: current?.error ?? null, loading: current === null, retry };
}

function Status({ loading, error, retry }: { loading: boolean; error: string | null; retry: () => void }) {
  if (error) return <ErrorBanner message={error} onRetry={retry} />;
  if (loading) return <p className="field-hint">A carregar...</p>;
  return null;
}

function Conditions({ items }: { items: CondicaoDto[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="condition-list">
      {items.map((item, index) => (
        <li key={index} className={item.cumprida ? "ok" : "fail"}>
          <span aria-hidden="true">{item.cumprida ? "✓" : "✗"}</span>
          <span className="sr-only">{item.cumprida ? "Cumprida: " : "Não cumprida: "}</span>
          {item.descricao ?? item.nome}
          {item.valor && <code>{item.valor}</code>}
        </li>
      ))}
    </ul>
  );
}

function HowTab({ evaluationId }: { evaluationId: string }) {
  const load = useCallback(
    () => api<ExplicacaoComoResponse>(`${BASE}/avaliacoes/${evaluationId}/explicacoes/como?${LOCALE}`),
    [evaluationId]
  );
  const { data, error, loading, retry } = useRemote(load);

  return (
    <>
      <Status loading={loading} error={error} retry={retry} />
      {data && (
        <>
          {data.resumo && <p className="result-line">{data.resumo}</p>}
          {data.paragem && <p className="result-line">O raciocínio parou em: {data.paragem}</p>}
          <ol className="step-trail">
            {data.passos.map((step) => (
              <li key={step.ordem}>
                <div className="step-trail-head">
                  <strong>{step.codigoRegra ?? step.nomeRegra}</strong>
                  {step.modulo && <span className="tag-module">{step.modulo}</span>}
                  {step.resultado && <span className="tag-result">{ELIGIBILITY[step.resultado]?.label ?? step.resultado}</span>}
                  {step.aValidar && <span className="tag-pending">a validar</span>}
                </div>
                {step.mensagem && <p>{step.mensagem}</p>}
              </li>
            ))}
          </ol>
        </>
      )}
    </>
  );
}

function WhyNotTab({ evaluationId, obtained }: { evaluationId: string; obtained: Elegibilidade | null }) {
  const targets = (Object.keys(ELIGIBILITY) as Elegibilidade[]).filter((value) => value !== obtained);
  const [target, setTarget] = useState<Elegibilidade>(targets[0]);
  const load = useCallback(
    () =>
      api<ExplicacaoPorqueNaoConclusaoResponse>(
        `${BASE}/avaliacoes/${evaluationId}/explicacoes/porque-nao?conclusao=${encodeURIComponent(
          `OUT-001:${target}`
        )}&${LOCALE}`
      ),
    [evaluationId, target]
  );
  const { data, error, loading, retry } = useRemote(load);

  return (
    <>
      <div className="presets-btns">
        {targets.map((value) => (
          <button
            key={value}
            type="button"
            className={`btn-preset ${value === target ? "active" : ""}`}
            aria-pressed={value === target}
            onClick={() => setTarget(value)}
          >
            Porque não “{ELIGIBILITY[value].label}”?
          </button>
        ))}
      </div>
      <Status loading={loading} error={error} retry={retry} />
      {data && (
        <div className="explain-body">
          {data.resumo && <p className="result-line">{data.resumo}</p>}
          {data.definidoPor && <p className="result-line">Decisão fixada pela regra {data.definidoPor}.</p>}
          {data.propostaPor.length > 0 && (
            <p className="result-line">Propuseram este resultado: {data.propostaPor.join(", ")}.</p>
          )}
          {data.regras.map((rule, index) => (
            <div key={index} className="rule-card">
              <div className="step-trail-head">
                <strong>{rule.codigoRegra}</strong>
                <span className="tag-result">{cause(rule.causa)}</span>
              </div>
              {rule.resumo && <p>{rule.resumo}</p>}
              {rule.regraResponsavel && <p className="field-hint">Regra responsável: {rule.regraResponsavel}</p>}
              <Conditions items={rule.condicoes} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function MissingTab({ request }: { request: ReturnRequest }) {
  const load = useCallback(
    () => api<DadosEmFaltaResponse>(`${BASE}/dados-em-falta?${LOCALE}`, { method: "POST", body: request }),
    [request]
  );
  const { data, error, loading, retry } = useRemote(load);
  const [why, setWhy] = useState<{ code: string; data?: ExplicacaoPorqueResponse; error?: string } | null>(null);

  async function askWhy(code: string) {
    setWhy({ code });
    try {
      const response = await api<ExplicacaoPorqueResponse>(
        `${BASE}/porque?dado=${encodeURIComponent(code)}&${LOCALE}`,
        { method: "POST", body: request }
      );
      setWhy({ code, data: response });
    } catch (err) {
      setWhy({ code, error: messageOf(err) });
    }
  }

  return (
    <>
      <Status loading={loading} error={error} retry={retry} />
      {data && (
        <>
          <p className="result-line">
            {data.completo ? "O pedido tem dados suficientes para decidir." : "Faltam dados para uma decisão completa."}{" "}
            {data.resumo}
          </p>
          <ul className="missing-list">
            {data.dados.map((item) => (
              <li key={item.codigo}>
                <div className="step-trail-head">
                  <strong>{item.descricao ?? item.codigo}</strong>
                  {item.obrigatorio && <span className="tag-pending">obrigatório</span>}
                </div>
                <code className="fact-raw">{item.caminho}</code>
                <button type="button" className="btn-action" onClick={() => askWhy(item.codigo)}>
                  Porque é preciso?
                </button>
                {why?.code === item.codigo && (
                  <div className="explain-body" aria-live="polite">
                    {why.error && <p className="field-error">{why.error}</p>}
                    {!why.data && !why.error && <p className="field-hint">A carregar...</p>}
                    {why.data?.pergunta && <p><strong>{why.data.pergunta}</strong></p>}
                    {why.data?.resumo && <p>{why.data.resumo}</p>}
                    {why.data && why.data.regrasQueDependem.length > 0 && (
                      <p className="field-hint">Regras que dependem deste dado: {why.data.regrasQueDependem.join(", ")}</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function WhatIfTab({ evaluationId }: { evaluationId: string }) {
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
        await api<SimulacaoResponse>(`${BASE}/avaliacoes/${evaluationId}/simulacoes?${LOCALE}`, {
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
      // Texto simples (ex.: COLOCADAS) segue como string.
    }
    return { [path.trim()]: parsed };
  }

  const simulated = simulation?.decisaoSimulada?.elegibilidade;

  return (
    <>
      <p className="result-line">Veja como a decisão mudaria se uma condição do pedido fosse diferente.</p>
      <div className="presets-btns">
        {WHAT_IF_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="btn-preset"
            disabled={loading}
            onClick={() => simulate(preset.changes)}
          >
            E se {preset.label.toLowerCase()}?
          </button>
        ))}
      </div>
      <details className="request-editor">
        <summary>Alteração personalizada (avançado)</summary>
        <div className="inline-form-row">
          <input
            className="form-input"
            aria-label="Caminho do campo"
            placeholder="artigos[0].estado.condicaoUso"
            value={path}
            onChange={(event) => setPath(event.target.value)}
          />
          <input
            className="form-input"
            aria-label="Novo valor"
            placeholder="USADO"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <button
            type="button"
            className="btn-action"
            disabled={loading || !path.trim() || !value.trim()}
            onClick={() => simulate(customChange())}
          >
            Simular
          </button>
        </div>
      </details>

      {loading && <p className="field-hint">A simular...</p>}
      {error && <ErrorBanner message={error} />}
      {simulation && (
        <div className="explain-body" aria-live="polite">
          {simulated && (
            <p className="result-line">
              Decisão simulada: <strong>{ELIGIBILITY[simulated]?.label ?? simulated}</strong>
            </p>
          )}
          {simulation.resumo && <p className="result-line">{simulation.resumo}</p>}
          {simulation.diferencas.length > 0 ? (
            <div className="table-container">
              <table className="plain-table">
                <caption className="sr-only">Diferenças face à decisão original</caption>
                <thead>
                  <tr>
                    <th scope="col">Onde</th>
                    <th scope="col">Campo</th>
                    <th scope="col">Antes</th>
                    <th scope="col">Depois</th>
                  </tr>
                </thead>
                <tbody>
                  {simulation.diferencas.map((diff, index) => (
                    <tr key={index}>
                      <td>{diff.alvo ?? "—"}</td>
                      <td>{label(diff.campo)}</td>
                      <td>{label(diff.original)}</td>
                      <td>{label(diff.simulado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="field-hint">Esta alteração não muda a decisão.</p>
          )}
          {simulation.regrasNovas.length > 0 && <p className="field-hint">Regras novas: {simulation.regrasNovas.join(", ")}</p>}
          {simulation.regrasRemovidas.length > 0 && (
            <p className="field-hint">Regras que deixam de disparar: {simulation.regrasRemovidas.join(", ")}</p>
          )}
        </div>
      )}
    </>
  );
}

export default function ExplainTabs({
  evaluationId,
  request,
  obtained,
}: {
  evaluationId: string;
  request: ReturnRequest;
  obtained: Elegibilidade | null;
}) {
  const [active, setActive] = useState<TabId>("how");

  return (
    <section className="explain" aria-label="Explicações da decisão">
      <div className="explain-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`panel-${tab.id}`}
            className={`subtab-btn ${active === tab.id ? "active" : ""}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Painéis sempre montados: cada um carrega uma vez por avaliação. */}
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
  );
}

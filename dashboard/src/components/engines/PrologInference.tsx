"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiClientError, api } from "@/client/api";
import { ENGINES } from "@/config/engines";
import {
  FACT_FORMAT,
  INFERENCE_STEPS,
  KNOWLEDGE_BASE,
  RULE_DESCRIPTIONS,
  WHY_NOT_SUGGESTIONS,
  describeFact,
  translateExplanation,
} from "@/config/prologInference";
import EmptyState from "@/components/shared/EmptyState";
import EngineWorkspace from "@/components/shared/EngineWorkspace";
import ErrorBanner from "@/components/shared/ErrorBanner";
import type { DerivedFact, GetFactsResponse, RunEngineResponse } from "@/types";
import type { ExplainResponse, LoadBaseResponse, ResetResponse } from "@/types/prolog";
import PrologModeSwitch from "./PrologModeSwitch";

const engine = ENGINES.find((item) => item.id === "prolog")!;

type Phase = "checking" | "empty" | "loaded" | "ran";

interface Explanation {
  title: string;
  lines: string[];
}

export default function PrologInference() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [facts, setFacts] = useState<GetFactsResponse["facts"]>([]);
  const [initialCount, setInitialCount] = useState<number | null>(null);
  const [derived, setDerived] = useState<Record<number, DerivedFact>>({});
  const [runNote, setRunNote] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [whyNot, setWhyNot] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const whyNotTrimmed = whyNot.trim();
  const whyNotInvalid = whyNotTrimmed !== "" && !FACT_FORMAT.test(whyNotTrimmed);
  const currentStep = phase === "ran" ? 2 : phase === "loaded" ? 1 : 0;

  const refreshFacts = useCallback(async () => {
    const data = await api<GetFactsResponse>("/api/prolog/facts");
    setFacts(data.facts);
    return data.facts_count;
  }, []);

  // A sessão do motor é partilhada: retoma o que já estiver carregado.
  useEffect(() => {
    let cancelled = false;
    api<GetFactsResponse>("/api/prolog/facts")
      .then((data) => {
        if (cancelled) return;
        setFacts(data.facts);
        setPhase(data.facts_count > 0 ? "loaded" : "empty");
      })
      .catch((err) => {
        if (cancelled) return;
        setPhase("empty");
        setError(err instanceof ApiClientError ? err.message : "Não foi possível contactar o motor.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function perform(name: string, action: () => Promise<void>) {
    setBusy(name);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "A operação falhou. Tente novamente.");
    } finally {
      setBusy(null);
    }
  }

  const loadBase = () =>
    perform("load", async () => {
      const response = await api<LoadBaseResponse>("/api/prolog/load", {
        method: "POST",
        body: { knowledge_base: KNOWLEDGE_BASE },
      });
      await refreshFacts();
      setInitialCount(response.initial_facts_count);
      setDerived({});
      setRunNote(null);
      setExplanation(null);
      setPhase("loaded");
    });

  const runInference = () =>
    perform("run", async () => {
      const response = await api<RunEngineResponse>("/api/prolog/run", { method: "POST" });
      await refreshFacts();
      setDerived((prev) => ({
        ...prev,
        ...Object.fromEntries(response.derived_facts.map((fact) => [fact.id, fact])),
      }));
      setRunNote(
        response.derived_facts_count > 0
          ? `O motor deduziu ${response.derived_facts_count} facto(s) novo(s).`
          : "Não há factos novos a deduzir: a inferência já estava completa."
      );
      setPhase("ran");
    });

  const askHow = (id: number, fact: string) =>
    perform(`how-${id}`, async () => {
      const response = await api<ExplainResponse>("/api/prolog/how", {
        method: "POST",
        body: { fact_id: id },
      });
      setExplanation({
        title: `Como se chegou a “${describeFact(fact)}”?`,
        lines: response.explanation.map(translateExplanation),
      });
    });

  const askWhyNot = (fact: string) =>
    perform("whynot", async () => {
      const response = await api<ExplainResponse>("/api/prolog/whynot", {
        method: "POST",
        body: { fact },
      });
      setExplanation({
        title: `Porque não se concluiu “${describeFact(fact)}”?`,
        lines: response.explanation.map(translateExplanation),
      });
    });

  const resetSession = () =>
    perform("reset", async () => {
      await api<ResetResponse>("/api/prolog/reset", { method: "POST" });
      setFacts([]);
      setDerived({});
      setInitialCount(null);
      setRunNote(null);
      setExplanation(null);
      setWhyNot("");
      setPhase("empty");
    });

  const disabled = busy !== null || phase === "checking";
  const hasBase = phase === "loaded" || phase === "ran";

  const input = (
    <>
      <h3 className="card-title">Sessão de inferência</h3>
      <p className="card-desc">
        O motor classifica veículos a partir de lotação, peso e tipo. Siga os passos pela ordem.
      </p>

      <section className="flow-step" aria-labelledby="step-base">
        <h4 id="step-base">1. Carregar a base de conhecimento</h4>
        <p>Carrega os factos iniciais e as 8 regras de classificação de veículos.</p>
        <button
          type="button"
          className={phase === "empty" ? "btn-primary" : "btn-action"}
          onClick={loadBase}
          disabled={disabled}
        >
          {busy === "load" ? "A carregar..." : hasBase ? "Recarregar base" : "Carregar base de veículos"}
        </button>
      </section>

      <section className="flow-step" aria-labelledby="step-run">
        <h4 id="step-run">2. Executar a inferência</h4>
        <p>O motor aplica as regras aos factos e deduz conclusões novas.</p>
        <button
          type="button"
          className={phase === "loaded" ? "btn-primary" : "btn-action"}
          onClick={runInference}
          disabled={disabled || !hasBase}
        >
          {busy === "run" ? "A executar..." : phase === "ran" ? "Executar de novo" : "Executar inferência"}
        </button>
        {!hasBase && phase !== "checking" && <p className="field-hint">Carregue a base primeiro.</p>}
      </section>

      <section className="flow-step" aria-labelledby="step-ask">
        <h4 id="step-ask">3. Perguntar “porque não?”</h4>
        <p>Escolha uma conclusão que não aconteceu para ver qual condição falhou.</p>
        <div className="presets-btns">
          {WHY_NOT_SUGGESTIONS.map((fact) => (
            <button
              key={fact}
              type="button"
              className="btn-preset"
              onClick={() => askWhyNot(fact)}
              disabled={disabled || !hasBase}
            >
              {describeFact(fact)}
            </button>
          ))}
        </div>
        <form
          className="inline-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!whyNotInvalid && whyNotTrimmed) void askWhyNot(whyNotTrimmed);
          }}
        >
          <label className="form-label" htmlFor="whynot-fact">
            Ou escreva um facto
          </label>
          <div className="inline-form-row">
            <input
              id="whynot-fact"
              className="form-input"
              placeholder="classe(meu_veiculo,ligeiro)"
              value={whyNot}
              onChange={(event) => setWhyNot(event.target.value)}
              aria-invalid={whyNotInvalid}
              aria-describedby="whynot-hint"
              disabled={!hasBase}
            />
            <button
              type="submit"
              className="btn-action"
              disabled={disabled || !hasBase || !whyNotTrimmed || whyNotInvalid}
            >
              Perguntar
            </button>
          </div>
          <p id="whynot-hint" className={`field-hint ${whyNotInvalid ? "field-error" : ""}`}>
            Formato: predicado(argumento,argumento), por exemplo classe(meu_veiculo,ligeiro).
          </p>
        </form>
      </section>

      <button type="button" className="btn-action" onClick={resetSession} disabled={disabled || phase === "empty"}>
        {busy === "reset" ? "A reiniciar..." : "Reiniciar sessão"}
      </button>
    </>
  );

  const result = (
    <>
      <h3 className="card-title">Memória de trabalho</h3>
      <p className="card-desc">Factos conhecidos pelo motor. Clique em “Como?” para ver a origem de um facto.</p>

      {error && <ErrorBanner message={error} />}
      {runNote && <p className="result-line">{runNote}</p>}

      {facts.length === 0 ? (
        <EmptyState
          title={phase === "checking" ? "A verificar a sessão..." : "Nenhuma base carregada"}
          hint={phase === "checking" ? undefined : "Carregue a base para ver os factos iniciais."}
        />
      ) : (
        <ul className="fact-list">
          {facts.map((fact) => {
            const origin = derived[fact.id];
            const isInitial = initialCount !== null && fact.id <= initialCount;
            return (
              <li key={fact.id} className={`fact-item ${origin ? "derived" : ""}`}>
                <div className="fact-main">
                  <span className="fact-id">{fact.id}</span>
                  <div>
                    <div className="fact-text">{describeFact(fact.fact)}</div>
                    <code className="fact-raw">{fact.fact}</code>
                    {origin && (
                      <div className="fact-origin">
                        Deduzido pela regra {origin.rule_id}
                        {RULE_DESCRIPTIONS[origin.rule_id] && `: ${RULE_DESCRIPTIONS[origin.rule_id]}`}
                      </div>
                    )}
                    {!origin && isInitial && <div className="fact-origin">Facto inicial</div>}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-action"
                  onClick={() => askHow(fact.id, fact.fact)}
                  disabled={disabled}
                  aria-label={`Como se chegou ao facto ${fact.id}?`}
                >
                  Como?
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {explanation && (
        <div className="result-box explanation" aria-live="polite">
          <div className="presets-label">Explicação</div>
          <p className="explanation-title">{explanation.title}</p>
          <ol className="trace-list">
            {explanation.lines.map((line, index) => (
              <li key={index}>{line.trim()}</li>
            ))}
          </ol>
        </div>
      )}
    </>
  );

  return (
    <EngineWorkspace
      engine={engine}
      steps={INFERENCE_STEPS}
      currentStep={currentStep}
      toolbar={<PrologModeSwitch active="inference" />}
      input={input}
      result={result}
    />
  );
}

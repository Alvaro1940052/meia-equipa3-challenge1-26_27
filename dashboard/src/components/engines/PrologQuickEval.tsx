"use client";

import { useState } from "react";
import { ApiClientError, api } from "@/client/api";
import { ENGINES } from "@/config/engines";
import EmptyState from "@/components/shared/EmptyState";
import EngineWorkspace from "@/components/shared/EngineWorkspace";
import ErrorBanner from "@/components/shared/ErrorBanner";
import ResultSummary from "@/components/shared/ResultSummary";
import type { DecisionType, EvaluationResponse } from "@/types";
import PrologModeSwitch from "./PrologModeSwitch";

const engine = ENGINES.find((item) => item.id === "prolog")!;

const PRESETS = [
  { value: 42, name: "Valor 42" },
  { value: 15, name: "Valor 15" },
];

const DECISION_LABELS: Record<DecisionType, { label: string; tone: "approved" | "rejected" | "info" }> = {
  approved: { label: "Aprovado", tone: "approved" },
  rejected: { label: "Rejeitado", tone: "rejected" },
  store_credit_only: { label: "Apenas crédito de loja", tone: "info" },
  manager_override: { label: "Requer decisão do gestor", tone: "info" },
  error: { label: "Erro na avaliação", tone: "rejected" },
};

interface Evaluation {
  value: number;
  response: EvaluationResponse;
  durationMs: number;
}

export default function PrologQuickEval() {
  const [text, setText] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const trimmed = text.trim();
  const value = Number(trimmed.replace(",", "."));
  const valid = trimmed !== "" && Number.isFinite(value);
  const invalid = trimmed !== "" && !valid;
  const currentStep = evaluation ? 3 : valid ? 1 : 0;

  async function run() {
    if (!valid) return;
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const response = await api<EvaluationResponse>("/api/prolog/evaluate", {
        method: "POST",
        body: { scenario: "test", value },
      });
      setEvaluation({ value, response, durationMs: Math.round(performance.now() - start) });
    } catch (err) {
      setEvaluation(null);
      setError(err instanceof ApiClientError ? err.message : "Não foi possível concluir a avaliação.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setText("");
    setEvaluation(null);
    setError(null);
  }

  const input = (
    <>
      <h3 className="card-title">1. Indique o valor</h3>
      <p className="card-desc">
        Avaliação de demonstração: o motor aplica uma regra simples sobre o valor e justifica a
        decisão.
      </p>

      <div className="presets-section">
        <div className="presets-label">Valores de exemplo</div>
        <div className="presets-btns">
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={`btn-preset ${valid && value === preset.value ? "active" : ""}`}
              onClick={() => {
                setText(String(preset.value));
                setEvaluation(null);
                setError(null);
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void run();
        }}
      >
        <div className="form-group">
          <label className="form-label" htmlFor="quick-value">
            Valor a avaliar
          </label>
          <input
            id="quick-value"
            className="form-input"
            inputMode="decimal"
            value={text}
            onChange={(event) => setText(event.target.value)}
            aria-invalid={invalid}
            aria-describedby="quick-value-hint"
          />
          <p id="quick-value-hint" className={`field-hint ${invalid ? "field-error" : ""}`}>
            {invalid ? "Escreva apenas um número, por exemplo 42." : "Escreva um número, por exemplo 42."}
          </p>
        </div>
        <button type="submit" className="btn-primary" disabled={loading || !valid}>
          {loading ? "A avaliar..." : "2. Avaliar valor"}
        </button>
      </form>
    </>
  );

  const response = evaluation?.response;
  const decision = response ? (DECISION_LABELS[response.decision] ?? DECISION_LABELS.error) : null;

  const result = (
    <>
      <h3 className="card-title">3. Resultado</h3>
      <p className="card-desc">Decisão do motor e a justificação.</p>

      {error && <ErrorBanner message={error} onRetry={run} />}

      {response && evaluation && decision ? (
        <>
          <ResultSummary
            eyebrow={`Decisão para o valor ${evaluation.value}`}
            headline={decision.label}
            tone={decision.tone}
            meta={`${evaluation.durationMs} ms`}
          >
            <div className="presets-label">Justificação</div>
            <ul className="justification-list">
              {response.justification.map((line) => (
                <li key={line} className="justification-item">
                  {line}
                </li>
              ))}
            </ul>
          </ResultSummary>
          <div className="btn-group-row">
            <button type="button" className="btn-action" onClick={run} disabled={loading}>
              {loading ? "A avaliar..." : "Reavaliar"}
            </button>
            <button type="button" className="btn-action" onClick={reset}>
              Nova avaliação
            </button>
          </div>
        </>
      ) : (
        !error && (
          <EmptyState
            title={loading ? "A executar a avaliação..." : "Sem resultado ainda"}
            hint={loading ? undefined : "Indique um valor e clique em “Avaliar valor”."}
          />
        )
      )}
    </>
  );

  return (
    <EngineWorkspace
      engine={engine}
      currentStep={currentStep}
      toolbar={<PrologModeSwitch active="evaluate" />}
      input={input}
      result={result}
    />
  );
}

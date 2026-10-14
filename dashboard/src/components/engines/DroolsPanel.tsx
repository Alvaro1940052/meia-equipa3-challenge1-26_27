"use client";

import { useState } from "react";
import { ApiClientError, api } from "@/client/api";
import {
  DIAGNOSIS_LABELS,
  EVIDENCE_GROUPS,
  EVIDENCE_LABELS,
  EVIDENCE_SCENARIOS,
  FALLBACK_RULE,
  HYPOTHESIS_LABELS,
  NO_SYMPTOMS,
  type EvidenceKey,
  type Symptoms,
} from "@/config/droolsEvidences";
import { ENGINES } from "@/config/engines";
import EmptyState from "@/components/shared/EmptyState";
import EngineWorkspace from "@/components/shared/EngineWorkspace";
import ErrorBanner from "@/components/shared/ErrorBanner";
import ResultSummary from "@/components/shared/ResultSummary";
import TraceList from "@/components/shared/TraceList";
import type { DroolsEvaluationResponse } from "@/types";

const engine = ENGINES.find((item) => item.id === "drools")!;

interface Evaluation {
  response: DroolsEvaluationResponse;
  durationMs: number;
}

/** O motor exige "yes"/"no" explícitos: os campos não confirmados vão como "no". */
function toPayload(symptoms: Symptoms): Record<EvidenceKey, "yes" | "no"> {
  return Object.fromEntries(
    Object.entries(symptoms).map(([key, present]) => [key, present ? "yes" : "no"])
  ) as Record<EvidenceKey, "yes" | "no">;
}

function answerLabel(value: unknown): string {
  return value === "yes" ? "Sim" : value === "no" ? "Não" : String(value);
}

export default function DroolsPanel() {
  const [symptoms, setSymptoms] = useState<Symptoms>(NO_SYMPTOMS);
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasSymptom = Object.values(symptoms).some(Boolean);
  const currentStep = evaluation ? 3 : hasSymptom ? 1 : 0;

  function setSymptom(key: EvidenceKey, present: boolean) {
    setScenarioId(null);
    setSymptoms((prev) => ({ ...prev, [key]: present }));
  }

  function applyScenario(id: string) {
    const scenario = EVIDENCE_SCENARIOS.find((item) => item.id === id);
    if (!scenario) return;
    setScenarioId(id);
    setSymptoms({
      ...NO_SYMPTOMS,
      ...Object.fromEntries(scenario.present.map((key) => [key, true])),
    });
    setEvaluation(null);
    setError(null);
  }

  function reset() {
    setSymptoms(NO_SYMPTOMS);
    setScenarioId(null);
    setEvaluation(null);
    setError(null);
  }

  async function evaluate() {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const response = await api<DroolsEvaluationResponse>("/api/drools/evaluate", {
        method: "POST",
        body: toPayload(symptoms),
      });
      setEvaluation({ response, durationMs: Math.round(performance.now() - start) });
    } catch (err) {
      setEvaluation(null);
      setError(
        err instanceof ApiClientError ? err.message : "Não foi possível concluir a avaliação."
      );
    } finally {
      setLoading(false);
    }
  }

  const input = (
    <>
      <h3 className="card-title">1. Indique os sintomas</h3>
      <p className="card-desc">
        Escolha um cenário pronto ou ajuste cada sintoma. Os sintomas por confirmar contam como
        &ldquo;Não&rdquo;.
      </p>

      <div className="presets-section">
        <div className="presets-label">Cenários prontos</div>
        <div className="presets-btns">
          {EVIDENCE_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              className={`btn-preset ${scenarioId === scenario.id ? "active" : ""}`}
              aria-pressed={scenarioId === scenario.id}
              onClick={() => applyScenario(scenario.id)}
            >
              {scenario.name}
            </button>
          ))}
        </div>
      </div>

      {EVIDENCE_GROUPS.map((group) => (
        <div key={group.title} className="evidence-group">
          <div className="presets-label">{group.title}</div>
          {group.items.map((item) => (
            <fieldset key={item.key} className="evidence-row">
              <legend>{item.label}</legend>
              <div className="yes-no-toggle">
                {[true, false].map((value) => (
                  <label key={String(value)} className={symptoms[item.key] === value ? "on" : ""}>
                    <input
                      type="radio"
                      name={item.key}
                      checked={symptoms[item.key] === value}
                      onChange={() => setSymptom(item.key, value)}
                    />
                    {value ? "Sim" : "Não"}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      ))}

      <button
        type="button"
        className="btn-primary"
        onClick={evaluate}
        disabled={loading || !hasSymptom}
      >
        {loading ? "A avaliar..." : "2. Avaliar sintomas"}
      </button>
      {!hasSymptom && <p className="field-hint">Marque pelo menos um sintoma como &ldquo;Sim&rdquo;.</p>}
    </>
  );

  const response = evaluation?.response;
  const inconclusive = response?.firedRules.includes(FALLBACK_RULE) ?? false;

  const result = (
    <>
      <h3 className="card-title">3. Resultado</h3>
      <p className="card-desc">Diagnóstico e as regras que o motor aplicou para chegar a ele.</p>

      {error && <ErrorBanner message={error} onRetry={evaluate} />}

      {response && evaluation ? (
        <>
          <ResultSummary
            eyebrow="Diagnóstico"
            tone={inconclusive ? "info" : "approved"}
            headline={
              inconclusive
                ? "Sem diagnóstico conclusivo"
                : (DIAGNOSIS_LABELS[response.primaryDiagnosis] ?? response.primaryDiagnosis)
            }
            meta={`${evaluation.durationMs} ms`}
          >
            {inconclusive && (
              <p className="result-line">
                Nenhuma regra se aplica a estes sintomas. O motor recomenda consultar um médico.
              </p>
            )}
            {response.hypothesis && (
              <p className="result-line">
                Classificação intermédia:{" "}
                <strong>{HYPOTHESIS_LABELS[response.hypothesis] ?? response.hypothesis}</strong>
              </p>
            )}
            <TraceList title="Regras aplicadas, por ordem" items={response.firedRules} />
          </ResultSummary>

          {response.evidencesEvaluated && (
            <details className="evidence-details">
              <summary>Evidências consideradas</summary>
              <ul>
                {Object.entries(response.evidencesEvaluated).map(([key, value]) => (
                  <li key={key}>
                    {EVIDENCE_LABELS[key as EvidenceKey] ?? key}: <strong>{answerLabel(value)}</strong>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <div className="btn-group-row">
            <button type="button" className="btn-action" onClick={evaluate} disabled={loading}>
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
            hint={loading ? undefined : "Escolha os sintomas e clique em “Avaliar sintomas”."}
          />
        )
      )}
    </>
  );

  return <EngineWorkspace engine={engine} currentStep={currentStep} input={input} result={result} />;
}

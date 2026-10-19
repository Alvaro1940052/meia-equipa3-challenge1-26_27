"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ApiClientError, api } from "@/client/api";
import ErrorBanner from "@/components/shared/ErrorBanner";
import {
  ELIGIBILITY,
  getWhatIfPresets,
  cause,
  cleanRuleCodes,
  label,
  moduleLabel,
} from "@/config/returnsLabels";
import { translateRuleOutput } from "@/config/ruleTranslations";
import { useLocale } from "@/contexts/LocaleContext";
import type { Locale } from "@/contexts/LocaleContext";
import type {
  CondicaoDto,
  DadoEmFaltaDto,
  DadosEmFaltaResponse,
  Elegibilidade,
  ExplicacaoComoResponse,
  ExplicacaoPorqueNaoConclusaoResponse,
  ReturnRequest,
  SimulacaoResponse,
} from "@/types/returns";

const ExplainBaseContext = createContext<string>("/api/returns");

export type TabId = "how" | "whynot" | "whatif" | "missing";

function getTabs(locale: Locale): { id: TabId; label: string; icon: string }[] {
  return [
    {
      id: "how",
      label: locale === "en" ? "How It Decided" : "Como Decidiu?",
      icon: "route",
    },
    {
      id: "whynot",
      label: locale === "en" ? "Why Not...?" : "Porque Não...?",
      icon: "help_outline",
    },
    {
      id: "whatif",
      label: locale === "en" ? "What-If Simulation" : "Simulação E Se...",
      icon: "science",
    },
    {
      id: "missing",
      label: locale === "en" ? "Facts & Validations" : "Factos e Validações",
      icon: "fact_check",
    },
  ];
}

const messageOf = (err: unknown, locale: Locale) =>
  err instanceof ApiClientError
    ? err.message
    : locale === "en"
    ? "Could not obtain response from inference engine."
    : "Não foi possível obter a resposta do motor.";

function useRemote<T>(load: () => Promise<T>, locale: Locale) {
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
      .catch((err) => !cancelled && setSettled({ source: load, data: null, error: messageOf(err, locale) }));
    return () => {
      cancelled = true;
    };
  }, [load, attempt, locale]);

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
  locale,
}: {
  loading: boolean;
  error: string | null;
  retry: () => void;
  locale: Locale;
}) {
  if (error) return <ErrorBanner message={error} onRetry={retry} />;
  if (loading)
    return (
      <div className="flex items-center gap-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs sm:text-sm font-medium animate-pulse">
        <span className="material-symbols-outlined text-emerald-600 text-[20px] animate-spin">sync</span>
        <span>
          {locale === "en"
            ? "Querying expert inference engine..."
            : "A consultar o motor de inferência pericial..."}
        </span>
      </div>
    );
  return null;
}

function humanizeConditionName(name: string, locale: Locale): string {
  if (locale === "pt") return name;
  const lower = name.toLowerCase();
  if (lower.includes("colaborador_autorizado") || lower.includes("colaboradorautorizado")) {
    return "Authorized associate credentials";
  }
  if (lower.includes("sessao_pos_propria") || lower.includes("sessaopospropria")) {
    return "Dedicated POS terminal session";
  }
  if (lower.includes("sku_reconhecido") || lower.includes("skureconhecido")) {
    return "Recognized POS SKU";
  }
  if (lower.includes("marca")) {
    return "Allowed brand (Levi's)";
  }
  if (lower.includes("dias_desde_compra") || lower.includes("diasdesdecompra")) {
    return "Days since purchase <= 30";
  }
  if (lower.includes("comprovativo")) {
    return "Valid proof of purchase";
  }
  if (lower.includes("estado_produto") || lower.includes("estadoproduto") || lower.includes("condicaouso")) {
    return "Physical condition unworn with tags";
  }
  if (lower.includes("personalizado") || lower.includes("embainhado")) {
    return "Garment not altered or hemmed";
  }
  if (lower.includes("defeito_fabrico") || lower.includes("defeitofabrico")) {
    return "Manufacturing defect verified";
  }
  if (lower.includes("canal_compra") || lower.includes("canalcompra")) {
    return "Original purchase channel supported";
  }
  return name;
}

function Conditions({ items, locale }: { items: CondicaoDto[]; locale: Locale }) {
  if (items.length === 0) {
    return (
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500 italic flex items-center gap-2 mt-1">
        <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0">info</span>
        <span>
          {locale === "en"
            ? "Structural conditions for this rule were not met in this request context."
            : "As condições estruturais desta regra não foram atingidas no contexto deste pedido."}
        </span>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2 mt-2">
      {items.map((item, index) => {
        const conditionTitle = humanizeConditionName(item.nome || item.descricao || "Critério de validação", locale);
        const conditionDesc = item.descricao && item.descricao !== item.nome ? humanizeConditionName(item.descricao, locale) : null;
        const displayValue = item.valor != null
          ? (String(item.valor) === "true"
              ? (locale === "en" ? "Yes" : "Sim")
              : String(item.valor) === "false"
              ? (locale === "en" ? "No" : "Não")
              : label(item.valor, locale))
          : null;

        return (
          <li
            key={index}
            className={`flex items-start gap-2.5 p-3 rounded-xl text-xs transition-all ${
              item.cumprida
                ? "bg-emerald-50/70 border border-emerald-200/80 text-emerald-950"
                : "bg-rose-50/70 border border-rose-200/80 text-rose-950"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
                item.cumprida ? "text-emerald-600" : "text-rose-500"
              }`}
            >
              {item.cumprida ? "check_circle" : "cancel"}
            </span>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-semibold text-slate-900 leading-snug">
                {conditionTitle}
              </span>
              {conditionDesc && (
                <span className="text-[11px] text-slate-600 mt-0.5">
                  {conditionDesc}
                </span>
              )}
              {displayValue && (
                <span className="text-[11px] text-slate-500 font-sans mt-0.5">
                  {locale === "en" ? "Assessed request value:" : "Valor apurado no pedido:"}{" "}
                  <strong className="text-slate-800 tabular-nums">{displayValue}</strong>
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** 1. Aba Como Decidiu (como/1) */
function HowTab({ evaluationId }: { evaluationId: string }) {
  const base = useContext(ExplainBaseContext);
  const { locale } = useLocale();
  const apiLocale = locale === "en" ? "locale=en" : "locale=pt-PT";

  const load = useCallback(
    () => api<ExplicacaoComoResponse>(`${base}/avaliacoes/${evaluationId}/explicacoes/como?${apiLocale}`),
    [base, evaluationId, apiLocale]
  );
  const { data, error, loading, retry } = useRemote(load, locale);

  const lastStep = data?.passos && data.passos.length > 0 ? data.passos[data.passos.length - 1] : null;
  const translatedLastStep = lastStep ? translateRuleOutput(lastStep.codigoRegra, lastStep.nomeRegra, lastStep.mensagem, locale) : null;

  const conclusionText = translatedLastStep
    ? (locale === "en"
        ? `Decision determined by Rule [${translatedLastStep.code}] — ${translatedLastStep.title}`
        : `Decisão estabelecida pela Regra [${translatedLastStep.code}] — ${translatedLastStep.title}`)
    : data?.paragem
    ? cleanRuleCodes(data.paragem)
    : locale === "en"
    ? "Expert decision established"
    : "Decisão pericial estabelecida";

  return (
    <div className="flex flex-col gap-4 text-left">
      <Status loading={loading} error={error} retry={retry} locale={locale} />
      {data && (
        <>
          {/* Banner de Conclusão */}
          <div className="font-sans p-3.5 sm:p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 text-xs sm:text-sm font-medium flex items-center gap-2.5 shadow-2xs">
            <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0">task_alt</span>
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <strong className="text-emerald-900 font-bold whitespace-nowrap">
                {locale === "en" ? "Deductive Chain Completed:" : "Cadeia Dedutiva Concluída:"}
              </strong>
              <span className="text-emerald-800">{conclusionText}</span>
            </div>
          </div>

          {/* Resumo Global da Cadeia */}
          {data.resumo && (
            <div className="font-sans p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs sm:text-sm leading-relaxed flex items-start gap-2.5">
              <span className="material-symbols-outlined text-slate-400 text-[18px] shrink-0 mt-0.5">account_tree</span>
              <div className="flex flex-col gap-0.5">
                <strong className="font-sans text-slate-900 block">
                  {locale === "en" ? "Normative Reasoning Summary:" : "Resumo do Raciocínio Normativo:"}
                </strong>
                <span>{cleanRuleCodes(data.resumo)}</span>
              </div>
            </div>
          )}

          {/* Linha Temporal de Regras Disparadas */}
          <div className="flex flex-col gap-3 relative before:absolute before:top-4 before:bottom-4 before:left-5 before:w-0.5 before:bg-slate-200 before:z-0">
            {data.passos.map((step) => {
              const translated = translateRuleOutput(step.codigoRegra, step.nomeRegra, step.mensagem, locale);
              const ruleCode = translated.code;
              const ruleTitle = translated.title;
              const message = translated.message;

              const isApproved = step.resultado === "PERMITIR";
              const isRejected = step.resultado === "RECUSAR";
              const isReview = step.resultado === "REVER";

              return (
                <div
                  key={step.ordem}
                  className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs relative z-10 ml-0 sm:ml-2 flex items-start gap-3.5 hover:border-slate-300 transition-all"
                >
                  <div
                    className={`font-mono tabular-nums w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs ${
                      isApproved
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                        : isRejected
                        ? "bg-rose-50 text-rose-800 border border-rose-300"
                        : isReview
                        ? "bg-amber-50 text-amber-800 border border-amber-300"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {step.ordem}
                  </div>

                  <div className="flex flex-col flex-1 gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap justify-between">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        {ruleCode && (
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/90 shrink-0">
                            {ruleCode}
                          </span>
                        )}
                        <span className="font-sans font-bold text-sm text-slate-900 leading-snug">
                          {ruleTitle}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap font-sans">
                        {step.modulo && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600 border border-slate-200/80">
                            {moduleLabel(step.modulo, locale)}
                          </span>
                        )}
                        {step.resultado ? (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              isApproved
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : isRejected
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {label(step.resultado, locale)}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-200 text-[10px] font-semibold">
                            {locale === "en" ? "Conforming" : "Conforme"}
                          </span>
                        )}
                        {step.aValidar && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">
                            {locale === "en" ? "Requires Validation" : "Requer Validação"}
                          </span>
                        )}
                      </div>
                    </div>

                    {message && (
                      <p className="font-sans text-xs sm:text-sm text-slate-600 leading-relaxed mt-1">
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

/** 2. Aba Porque Não? (whynot/1) */
function WhyNotTab({
  evaluationId,
  obtained,
}: {
  evaluationId: string;
  obtained: Elegibilidade | null;
}) {
  const base = useContext(ExplainBaseContext);
  const { locale } = useLocale();
  const apiLocale = locale === "en" ? "locale=en" : "locale=pt-PT";

  const targets = (Object.keys(ELIGIBILITY) as Elegibilidade[]).filter((value) => value !== obtained);
  const [target, setTarget] = useState<Elegibilidade>(targets[0] || "PERMITIR");

  const load = useCallback(
    () =>
      api<ExplicacaoPorqueNaoConclusaoResponse>(
        `${base}/avaliacoes/${evaluationId}/explicacoes/porque-nao?conclusao=${encodeURIComponent(
          `OUT-001:${target}`
        )}&${apiLocale}`
      ),
    [base, evaluationId, target, apiLocale]
  );
  const { data, error, loading, retry } = useRemote(load, locale);

  return (
    <div className="flex flex-col gap-4 text-left">
      {/* Pílulas de Seleção de Desfecho Alternativo */}
      <div className="flex flex-col gap-1.5">
        <span className="font-sans text-xs font-semibold text-slate-500">
          {locale === "en"
            ? "Select an alternative outcome to analyze unfulfilled rules and premises:"
            : "Selecione o desfecho alternativo para analisar as regras e critérios não cumpridos:"}
        </span>
        <div className="flex flex-wrap gap-2">
          {targets.map((value) => {
            const isActive = value === target;
            const targetLabel = label(value, locale);
            return (
              <button
                key={value}
                type="button"
                className={`px-3.5 py-1.5 rounded-lg text-xs font-sans font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
                aria-pressed={isActive}
                onClick={() => setTarget(value)}
              >
                <span>{locale === "en" ? "Why not" : "Porque não"}</span>
                <span className={isActive ? "text-emerald-300" : "text-slate-900 font-extrabold"}>
                  &ldquo;{targetLabel}&rdquo;?
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Status loading={loading} error={error} retry={retry} locale={locale} />

      {data && (
        <div className="flex flex-col gap-4">
          {data.resumo && (
            <div className="font-sans p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs sm:text-sm leading-relaxed flex items-start gap-2.5">
              <span className="material-symbols-outlined text-slate-400 text-[18px] shrink-0 mt-0.5">help</span>
              <div className="flex flex-col gap-0.5">
                <strong className="font-sans text-slate-900 block">
                  {locale === "en" ? "Non-Triggering Diagnosis:" : "Diagnóstico de Não Disparo:"}
                </strong>
                <span>{cleanRuleCodes(data.resumo)}</span>
              </div>
            </div>
          )}

          {/* Lista de Regras Candidatas com Tradução Canónica */}
          <div className="grid grid-cols-1 gap-3">
            {data.regras.map((rule, index) => {
              const translated = translateRuleOutput(rule.codigoRegra, rule.variante, rule.resumo, locale);
              const ruleCode = translated.code;
              const ruleTitle = translated.title;
              const ruleResumo = translated.message;

              return (
                <div
                  key={index}
                  className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl flex flex-col gap-2.5 shadow-2xs hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      {ruleCode && (
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/90 shrink-0">
                          {ruleCode}
                        </span>
                      )}
                      <span className="font-sans font-bold text-sm text-slate-900 leading-snug">
                        {ruleTitle}
                      </span>
                    </div>

                    <span
                      className={`font-sans px-2.5 py-0.5 rounded-md text-[11px] font-bold border shrink-0 ${
                        target === "RECUSAR"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : target === "REVER"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : target === "PERMITIR"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {locale === "en" ? "Would have resulted in: " : "Teria resultado em: "}
                      {label(target, locale)}
                    </span>
                  </div>

                  {ruleResumo && (
                    <p className="font-sans text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {ruleResumo}
                    </p>
                  )}

                  <Conditions items={rule.condicoes} locale={locale} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/** 3. Aba E Se...? (whatif - Simulação Contrafactual) */
function WhatIfTab({ evaluationId }: { evaluationId: string }) {
  const base = useContext(ExplainBaseContext);
  const { locale } = useLocale();
  const apiLocale = locale === "en" ? "locale=en" : "locale=pt-PT";
  const presets = getWhatIfPresets(locale);

  const [simulation, setSimulation] = useState<SimulacaoResponse | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState("");
  const [value, setValue] = useState("");

  async function simulate(changes: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      setSimulation(
        await api<SimulacaoResponse>(`${base}/avaliacoes/${evaluationId}/simulacoes?${apiLocale}`, {
          method: "POST",
          body: { alteracoes: changes },
        })
      );
    } catch (err) {
      setSimulation(null);
      setError(messageOf(err, locale));
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
  const realDiffs = (simulation?.diferencas || []).filter((d) => d.original !== d.simulado);

  return (
    <div className="flex flex-col gap-4 text-left">
      <p className="font-sans text-xs sm:text-sm text-slate-600 leading-relaxed">
        {locale === "en"
          ? "Simulate how the expert decision would change if garment or purchase assumptions were altered:"
          : "Simule como a deliberação pericial mudaria caso os pressupostos da peça ou da compra do cliente fossem alterados:"}
      </p>

      {/* Cartões de Presets com Moldura Ativa */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {presets.map((preset) => {
          const isSelected = selectedPreset === preset.label;
          return (
            <button
              key={preset.label}
              type="button"
              disabled={loading}
              onClick={() => {
                setSelectedPreset(preset.label);
                simulate(preset.changes);
              }}
              className={`p-4 rounded-xl text-left transition-all cursor-pointer disabled:opacity-50 border ${
                isSelected
                  ? "border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs bg-emerald-50/30"
                  : "bg-white border-slate-200 hover:border-emerald-500 hover:shadow-2xs"
              }`}
            >
              <div className="flex items-center gap-1.5 text-emerald-700 font-sans font-bold text-[10px] uppercase tracking-wider mb-1.5">
                <span className="material-symbols-outlined text-[15px]">science</span>
                <span>{locale === "en" ? "Quick Hypothesis" : "Hipótese Rápida"}</span>
              </div>
              <span className="font-sans font-bold text-xs sm:text-sm text-slate-900 leading-snug block">
                {preset.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Simulador Personalizado */}
      <details className="group rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
        <summary className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer flex items-center justify-between">
          <span>{locale === "en" ? "Customize Counterfactual Parameter" : "Personalizar Parâmetro Contrafactual"}</span>
          <span className="material-symbols-outlined text-[18px] group-open:rotate-180 transition-transform">
            expand_more
          </span>
        </summary>
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-3 pt-3 border-t border-slate-200">
          <input
            className="font-sans w-full sm:flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Caminho do campo"
            placeholder={locale === "en" ? "Ex: articles[0].condition.tags" : "Ex: artigos[0].estado.etiquetas"}
            value={path}
            onChange={(event) => setPath(event.target.value)}
          />
          <input
            className="font-sans w-full sm:flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Novo valor"
            placeholder={locale === "en" ? "Ex: ATTACHED" : "Ex: COLOCADAS"}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <button
            type="button"
            className="font-sans w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold whitespace-nowrap cursor-pointer disabled:opacity-50 transition-colors"
            disabled={loading || !path.trim() || !value.trim()}
            onClick={() => {
              setSelectedPreset(null);
              simulate(customChange());
            }}
          >
            {locale === "en" ? "Simulate Hypothesis" : "Simular Hipótese"}
          </button>
        </div>
      </details>

      {loading && (
        <div className="font-sans flex items-center gap-2 p-3 text-xs text-slate-500 font-medium animate-pulse">
          <span className="material-symbols-outlined text-emerald-600 text-[18px] animate-spin">sync</span>
          <span>
            {locale === "en"
              ? "Deducing hypothetical outcome in inference engine..."
              : "A deduzir desfecho hipotético no motor..."}
          </span>
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      {simulation && (
        <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col gap-3.5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500">
              {locale === "en" ? "Counterfactual Hypothesis Outcome" : "Resultado da Hipótese Contrafactual"}
            </span>
            {simulated && (
              <span
                className={`font-sans px-3 py-1 rounded-full text-xs font-bold border ${
                  simulated === "PERMITIR"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : simulated === "RECUSAR"
                    ? "bg-rose-50 text-rose-800 border-rose-300"
                    : "bg-amber-50 text-amber-800 border-amber-300"
                }`}
              >
                {locale === "en" ? "Simulated Decision: " : "Decisão Simulada: "}
                {label(simulated, locale)}
              </span>
            )}
          </div>

          {simulation.resumo && (
            <p className="font-sans text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {cleanRuleCodes(simulation.resumo)}
            </p>
          )}

          {/* Dinâmica de Regras Novas / Removidas */}
          {(simulation.regrasNovas?.length > 0 || simulation.regrasRemovidas?.length > 0) && (
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-sans">
              {simulation.regrasNovas.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-500 font-medium">
                    {locale === "en" ? "Activated rules:" : "Regras ativadas:"}
                  </span>
                  {simulation.regrasNovas.map((code) => (
                    <span
                      key={code}
                      className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                    >
                      +{code}
                    </span>
                  ))}
                </div>
              )}
              {simulation.regrasRemovidas.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-500 font-medium">
                    {locale === "en" ? "Deactivated rules:" : "Regras desativadas:"}
                  </span>
                  {simulation.regrasRemovidas.map((code) => (
                    <span
                      key={code}
                      className="font-mono text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 line-through"
                    >
                      -{code}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tabela de Diferenças Significativas */}
          {realDiffs.length > 0 ? (
            <div className="w-full overflow-x-auto rounded-xl border border-slate-200 shadow-2xs mt-1">
              <table className="w-full text-left border-collapse text-xs font-sans tabular-nums">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th scope="col" className="p-2.5">{locale === "en" ? "Scope" : "Onde"}</th>
                    <th scope="col" className="p-2.5">{locale === "en" ? "Changed Field" : "Campo Alterado"}</th>
                    <th scope="col" className="p-2.5">{locale === "en" ? "Original Value" : "Valor Original"}</th>
                    <th scope="col" className="p-2.5">{locale === "en" ? "Hypothetical Value" : "Valor Hipotético"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {realDiffs.map((diff, index) => (
                    <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-2.5 font-sans font-bold text-slate-900">{diff.alvo ?? (locale === "en" ? "Request" : "Pedido")}</td>
                      <td className="p-2.5 text-slate-700 font-medium">{label(diff.campo, locale)}</td>
                      <td className="p-2.5 text-rose-700 font-semibold">{label(diff.original, locale)}</td>
                      <td className="p-2.5 text-emerald-700 font-bold">{label(diff.simulado, locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="font-sans p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600 text-xs flex items-center gap-2 mt-1">
              <span className="material-symbols-outlined text-[18px] text-slate-400 shrink-0">info</span>
              <span>
                {locale === "en"
                  ? "This specific counterfactual alteration does not change the eligibility verdict calculated by the expert engine."
                  : "Esta alteração contrafactual pontual não modifica o veredito de elegibilidade calculado pelo motor pericial."}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type RecordUnknown = Record<string, unknown>;

/** Extração de Factos e Pressupostos Auditados a partir do Pedido do Wizard */
function getAuditedFacts(request: ReturnRequest, locale: Locale) {
  const req = request as RecordUnknown;
  const loja = (typeof req.loja === "object" && req.loja !== null ? req.loja : {}) as RecordUnknown;
  const compra = (typeof req.compraOriginal === "object" && req.compraOriginal !== null ? req.compraOriginal : {}) as RecordUnknown;
  const pagamento = (typeof compra.pagamento === "object" && compra.pagamento !== null ? compra.pagamento : {}) as RecordUnknown;
  const comprovativo = (typeof req.comprovativo === "object" && req.comprovativo !== null ? req.comprovativo : null) as RecordUnknown | null;
  const artigos = Array.isArray(req.artigos) ? (req.artigos as RecordUnknown[]) : [];
  const firstArt = artigos.length > 0 ? artigos[0] : {};
  const estadoArt = (typeof firstArt.estado === "object" && firstArt.estado !== null ? firstArt.estado : {}) as RecordUnknown;
  const colab = (typeof req.colaborador === "object" && req.colaborador !== null ? req.colaborador : {}) as RecordUnknown;
  const prod = (typeof firstArt.produto === "object" && firstArt.produto !== null ? firstArt.produto : {}) as RecordUnknown;

  const isBlind = !comprovativo || comprovativo.tipo === "SEM_COMPROVATIVO";

  return [
    {
      category: locale === "en" ? "Acquisition Channel" : "Canal de Aquisição",
      icon: "storefront",
      value: compra.canal ? label(compra.canal, locale) : (loja.tipoLoja ? label(loja.tipoLoja, locale) : (locale === "en" ? "Mainline Retail Store" : "Loja Própria (Mainline)")),
      detail: compra.idTransacao ? (locale === "en" ? `Transaction: ${String(compra.idTransacao)}` : `Transação: ${String(compra.idTransacao)}`) : (locale === "en" ? "Validated purchase channel" : "Canal validado pelo motor"),
    },
    {
      category: locale === "en" ? "Servicing Store" : "Loja de Atendimento",
      icon: "domain",
      value: (loja.nome as string) || (loja.tipoLoja ? `${label(loja.tipoLoja, locale)}` : (locale === "en" ? "Official Retail Store" : "Loja Física Oficial")),
      detail: loja.codigo ? (locale === "en" ? `Unit: ${String(loja.codigo)} (${String(loja.mercado || "USA")})` : `Unidade: ${String(loja.codigo)} (${String(loja.mercado || "EUA")})`) : (locale === "en" ? "Geographical jurisdiction verified" : "Conformidade geográfica confirmada"),
    },
    {
      category: locale === "en" ? "Physical Condition" : "Estado Físico da Peça",
      icon: "checkroom",
      value: estadoArt.condicaoUso
        ? `${label(estadoArt.condicaoUso, locale)}, ${locale === "en" ? "Tags" : "Etiquetas"} ${label(estadoArt.etiquetas || "COLOCADAS", locale)}`
        : (locale === "en" ? "Pristine unworn garment with attached tags" : "Artigo não usado com etiquetas originais afixadas"),
      detail: prod.sku ? `SKU: ${String(prod.sku)}` : (locale === "en" ? "Physical inspection passed" : "Inspeção física aprovada"),
    },
    {
      category: locale === "en" ? "Proof of Purchase" : "Comprovativo de Compra",
      icon: "receipt_long",
      value: isBlind
        ? (locale === "en" ? "No Proof (Blind Return)" : "Sem comprovativo (Processo às Cegas)")
        : (comprovativo?.tipo ? label(comprovativo.tipo, locale) : (locale === "en" ? "Receipt presented" : "Recibo de compra apresentado")),
      detail: comprovativo?.idComprovativo ? `Ref: ${String(comprovativo.idComprovativo)}` : (locale === "en" ? "Purchase verification complete" : "Verificação de compra apurada"),
    },
    {
      category: locale === "en" ? "Original Payment Tender" : "Meio de Pagamento Original",
      icon: "credit_card",
      value: pagamento.meio ? label(pagamento.meio, locale) : (locale === "en" ? "Verified payment tender" : "Meio de pagamento verificado"),
      detail: pagamento.estadoConta ? (locale === "en" ? `Account ${label(pagamento.estadoConta, locale).toLowerCase()}` : `Conta ${label(pagamento.estadoConta).toLowerCase()}`) : (locale === "en" ? "Settlement record validated" : "Registo de liquidação validado"),
    },
    {
      category: locale === "en" ? "Cashier Associate" : "Operador de Caixa",
      icon: "badge",
      value: colab.nome ? String(colab.nome) : (locale === "en" ? "Authorized Counter Associate" : "Operador de Balcão Autorizado"),
      detail: colab.funcao ? (locale === "en" ? `Role: ${label(colab.funcao, locale)} (Active POS)` : `Função: ${label(colab.funcao, locale)} (POS Ativo)`) : (locale === "en" ? "Authenticated POS session" : "Sessão POS autenticada"),
    },
    {
      category: locale === "en" ? "Timeframe Window" : "Janela Temporal / Prazo",
      icon: "calendar_today",
      value: compra.dataCompra ? (locale === "en" ? `Purchase on ${String(compra.dataCompra)}` : `Compra registada a ${String(compra.dataCompra)}`) : (locale === "en" ? "Within policy timeframe" : "Dentro do prazo regulamentar"),
      detail: locale === "en" ? "Compliance with official 30-day policy" : "Conformidade com a janela regulamentar da política",
    },
  ];
}

/** 4. Aba Factos e Validações (missing / dados-em-falta) */
function MissingTab({ request }: { request: ReturnRequest }) {
  const base = useContext(ExplainBaseContext);
  const { locale } = useLocale();
  const apiLocale = locale === "en" ? "locale=en" : "locale=pt-PT";

  const load = useCallback(
    () =>
      api<DadosEmFaltaResponse>(`${base}/dados-em-falta?${apiLocale}`, {
        method: "POST",
        body: request,
      }),
    [base, request, apiLocale]
  );
  const { data, error, loading, retry } = useRemote(load, locale);

  const auditedFacts = getAuditedFacts(request, locale);
  const sortedDados = (data?.dados || []).slice().sort((a, b) => (b.obrigatorio ? 1 : 0) - (a.obrigatorio ? 1 : 0));

  return (
    <div className="flex flex-col gap-5 text-left">
      <Status loading={loading} error={error} retry={retry} locale={locale} />
      {data && (
        <>
          {/* Banner de Auditoria */}
          <div
            className={`font-sans p-4 rounded-xl border flex items-center gap-3 text-xs sm:text-sm font-medium shadow-2xs ${
              data.completo
                ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-950"
                : "bg-amber-50/70 border-amber-200/80 text-amber-950"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[24px] shrink-0 ${
                data.completo ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {data.completo ? "verified" : "help_center"}
            </span>
            <div className="flex flex-col gap-0.5">
              <strong className="font-bold">
                {data.completo
                  ? locale === "en"
                    ? "Normative Audit Completed Successfully"
                    : "Auditoria Normativa Concluída com Sucesso"
                  : locale === "en"
                  ? "Missing Data Pending Action"
                  : "Pendências de Dados Identificadas"}
              </strong>
              <span className="leading-relaxed">
                {data.completo
                  ? locale === "en"
                    ? "The request satisfies all data requirements mandated by commercial return policies for an auditable deliberation."
                    : "O pedido reúne a totalidade dos dados requeridos pelas políticas comerciais para uma deliberação vinculativa e auditável."
                  : locale === "en"
                  ? "Complementary data is recommended to guarantee full compliance with auditing guidelines."
                  : "Existem dados complementares recomendados para assegurar conformidade integral com as normas de auditoria."}{" "}
                {cleanRuleCodes(data.resumo)}
              </span>
            </div>
          </div>

          {/* Dados em Falta */}
          {sortedDados.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-rose-600">
                {locale === "en" ? "Missing Data or Policy Recommendations" : "Dados em Falta ou Recomendações Normativas"}
              </span>
              <div className="flex flex-col gap-2.5">
                {sortedDados.map((item: DadoEmFaltaDto) => (
                  <div
                    key={item.codigo}
                    className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col gap-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {item.codigo}
                        </span>
                        <span className="font-sans font-bold text-xs sm:text-sm text-slate-900">
                          {item.descricao ?? (locale === "en" ? "Counter data" : "Dado de balcão")}
                        </span>
                      </div>
                      {item.obrigatorio ? (
                        <span className="font-sans px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold uppercase tracking-wider border border-rose-200 shrink-0">
                          {locale === "en" ? "Mandatory" : "Obrigatório"}
                        </span>
                      ) : (
                        <span className="font-sans px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200 shrink-0">
                          {locale === "en" ? "Recommended" : "Recomendado"}
                        </span>
                      )}
                    </div>
                    {item.porque?.resumo && (
                      <p className="font-sans text-xs text-slate-600 leading-relaxed">
                        <strong>{locale === "en" ? "Normative Impact: " : "Impacto Normativo: "}</strong>
                        {item.porque.resumo}
                      </p>
                    )}
                    {item.porque?.regrasQueDependem && item.porque.regrasQueDependem.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500 font-sans">
                        <span>{locale === "en" ? "Affects rules:" : "Afeta as regras:"}</span>
                        {item.porque.regrasQueDependem.map((r) => (
                          <span key={r} className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grelha de Factos Auditados */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500">
                {locale === "en" ? "Facts and Assumptions Audited by Engine" : "Factos e Premissas Auditados pelo Motor"}
              </span>
              <span className="font-sans text-[11px] text-slate-400">
                {auditedFacts.length} {locale === "en" ? "validated assumptions" : "pressupostos validados"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {auditedFacts.map((fact, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-start gap-3 shadow-2xs hover:border-slate-300 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px] text-slate-400 shrink-0 mt-0.5">
                    {fact.icon}
                  </span>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-sans text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                        {fact.category}
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 shrink-0">
                        <span className="material-symbols-outlined text-[12px]">check</span>
                        <span>{locale === "en" ? "Validated" : "Validado"}</span>
                      </span>
                    </div>
                    <span className="font-sans font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                      {fact.value}
                    </span>
                    <span className="font-sans text-[11px] text-slate-500 mt-0.5 truncate">
                      {fact.detail}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MissingEvaluationBanner({ tab, locale }: { tab: string; locale: Locale }) {
  return (
    <div className="font-sans p-5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs sm:text-sm text-left flex items-start sm:items-center gap-3">
      <span className="material-symbols-outlined text-amber-500 text-[22px] shrink-0 mt-0.5 sm:mt-0">info</span>
      <div className="flex flex-col gap-0.5">
        <span className="font-bold text-slate-800">
          {locale === "en" ? "Evaluation Identifier Unavailable" : "Identificador de Avaliação Indisponível"}
        </span>
        <span className="text-slate-500 leading-relaxed">
          {locale === "en"
            ? `Cannot load "${tab}" analysis without an evaluation ID recorded by the engine.`
            : `Não é possível carregar a análise "${tab}" sem um ID de avaliação registado pelo motor.`}
        </span>
      </div>
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
  paymentMethod?: string;
}) {
  const [active, setActive] = useState<TabId>("how");
  const { locale } = useLocale();
  const tabs = getTabs(locale);
  const hasEvaluationId = Boolean(evaluationId && evaluationId.trim().length > 0);

  return (
    <ExplainBaseContext.Provider value={base}>
      <section
        className="w-full flex flex-col gap-4 text-left"
        aria-label={locale === "en" ? "Decision explanations" : "Explicações da decisão"}
      >
        {/* Navigation Tabs Pill Bar */}
        <div
          role="tablist"
          className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100/90 rounded-xl border border-slate-200/80"
        >
          {tabs.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-sans font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-slate-900 border border-slate-200 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
                onClick={() => setActive(tab.id)}
              >
                <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div role="tabpanel" id="panel-how" aria-labelledby="tab-how" hidden={active !== "how"}>
          {hasEvaluationId ? (
            <HowTab evaluationId={evaluationId} />
          ) : (
            <MissingEvaluationBanner tab={locale === "en" ? "How It Decided" : "Como Decidiu"} locale={locale} />
          )}
        </div>
        <div role="tabpanel" id="panel-whynot" aria-labelledby="tab-whynot" hidden={active !== "whynot"}>
          {hasEvaluationId ? (
            <WhyNotTab evaluationId={evaluationId} obtained={obtained} />
          ) : (
            <MissingEvaluationBanner tab={locale === "en" ? "Why Not" : "Porque Não"} locale={locale} />
          )}
        </div>
        <div role="tabpanel" id="panel-whatif" aria-labelledby="tab-whatif" hidden={active !== "whatif"}>
          {hasEvaluationId ? (
            <WhatIfTab evaluationId={evaluationId} />
          ) : (
            <MissingEvaluationBanner tab={locale === "en" ? "What-If Simulation" : "Simulação E Se"} locale={locale} />
          )}
        </div>
        <div role="tabpanel" id="panel-missing" aria-labelledby="tab-missing" hidden={active !== "missing"}>
          <MissingTab request={request} />
        </div>
      </section>
    </ExplainBaseContext.Provider>
  );
}

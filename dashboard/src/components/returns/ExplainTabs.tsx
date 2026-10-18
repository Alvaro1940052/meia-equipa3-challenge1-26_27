"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
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

export type TabId = "how" | "whynot" | "faq" | "whatif" | "missing";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "how", label: "Como Decidiu? (como/1)", icon: "route" },
  { id: "whynot", label: "Porque Não...? (whynot/1)", icon: "help_outline" },
  { id: "faq", label: "Perguntas de Balcão (ACM)", icon: "contact_support" },
  { id: "whatif", label: "E Se...? (Simulação)", icon: "science" },
  { id: "missing", label: "Factos e Validações", icon: "fact_check" },
];

const messageOf = (err: unknown) =>
  err instanceof ApiClientError ? err.message : "Não foi possível obter a resposta do motor.";

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
      <div className="flex items-center gap-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs sm:text-sm font-medium animate-pulse">
        <span className="material-symbols-outlined text-emerald-600 text-[20px] animate-spin">sync</span>
        <span>A consultar o motor de inferência...</span>
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
          className={`flex items-start gap-2.5 p-3 rounded-xl text-xs transition-all ${
            item.cumprida
              ? "bg-emerald-50/70 border border-emerald-200/80 text-emerald-950"
              : "bg-rose-50/70 border border-rose-200/80 text-rose-950"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
              item.cumprida ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {item.cumprida ? "check_circle" : "cancel"}
          </span>
          <div className="flex flex-col flex-1">
            <span className="font-semibold text-slate-900 leading-snug">
              {cleanRuleCodes(item.descricao ?? item.nome) || "Critério de validação"}
            </span>
            {item.valor && (
              <span className="text-[11px] text-slate-500 font-sans mt-0.5">
                Valor apurado no pedido: <strong className="text-slate-800 tabular-nums">{item.valor}</strong>
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** 1. Aba Como Decidiu (como/1) */
function HowTab({ evaluationId }: { evaluationId: string }) {
  const base = useContext(ExplainBaseContext);
  const load = useCallback(
    () => api<ExplicacaoComoResponse>(`${base}/avaliacoes/${evaluationId}/explicacoes/como?${LOCALE}`),
    [base, evaluationId]
  );
  const { data, error, loading, retry } = useRemote(load);

  return (
    <div className="flex flex-col gap-4 text-left">
      <Status loading={loading} error={error} retry={retry} />
      {data && (
        <>
          {data.resumo && (
            <div className="font-sans p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs sm:text-sm leading-relaxed">
              <strong className="font-sans text-slate-900 block mb-0.5">Resumo da Cadeia Dedutiva:</strong>
              {cleanRuleCodes(data.resumo)}
            </div>
          )}

          {data.paragem && (
            <div className="font-sans p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-[18px]">stop_circle</span>
              <span>O encadeamento concluiu em: {cleanRuleCodes(data.paragem)}</span>
            </div>
          )}

          <div className="flex flex-col gap-3 relative before:absolute before:top-4 before:bottom-4 before:left-5 before:w-0.5 before:bg-slate-200 before:z-0">
            {data.passos.map((step) => {
              const ruleTitle = cleanRuleCodes(step.nomeRegra) || moduleLabel(step.modulo);
              const message = cleanRuleCodes(step.mensagem);
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

                  <div className="flex flex-col flex-1 gap-1">
                    <div className="flex items-center gap-2 flex-wrap justify-between">
                      <span className="font-sans font-bold text-sm text-slate-900">
                        {ruleTitle}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap font-sans">
                        {step.modulo && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600 border border-slate-200/80">
                            {moduleLabel(step.modulo)}
                          </span>
                        )}
                        {step.resultado && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              isApproved
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : isRejected
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {ELIGIBILITY[step.resultado]?.label ?? step.resultado}
                          </span>
                        )}
                        {step.aValidar && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">
                            Requer PIN / Validação
                          </span>
                        )}
                      </div>
                    </div>

                    {message && (
                      <p className="font-sans text-xs sm:text-sm text-slate-600 leading-relaxed mt-0.5">
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
    <div className="flex flex-col gap-4 text-left">
      <div className="flex flex-col gap-1.5">
        <span className="font-sans text-xs font-semibold text-slate-500">
          Selecione o desfecho alternativo para analisar as pré-condições que falharam:
        </span>
        <div className="flex flex-wrap gap-2">
          {targets.map((value) => {
            const isActive = value === target;
            return (
              <button
                key={value}
                type="button"
                className={`px-3.5 py-1.5 rounded-lg text-xs font-sans font-bold border transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
                aria-pressed={isActive}
                onClick={() => setTarget(value)}
              >
                Porque não &ldquo;{ELIGIBILITY[value].label}&rdquo;?
              </button>
            );
          })}
        </div>
      </div>

      <Status loading={loading} error={error} retry={retry} />

      {data && (
        <div className="flex flex-col gap-4">
          {data.resumo && (
            <div className="font-sans p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs sm:text-sm leading-relaxed">
              <strong className="font-sans text-slate-900 block mb-0.5">Diagnóstico de Falha:</strong>
              {cleanRuleCodes(data.resumo)}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            {data.regras.map((rule, index) => (
              <div
                key={index}
                className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col gap-2 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-sans font-bold text-sm text-slate-900">
                    {cause(rule.causa)}
                  </span>
                  <span className="font-sans px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600 border border-slate-200/80">
                    Condição de Política
                  </span>
                </div>

                {rule.resumo && (
                  <p className="font-sans text-xs sm:text-sm text-slate-600">
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

/** 3. Aba Perguntas Frequentes de Balcão (ACM - MI_Perguntas_ACM) */
function CounterFaqTab({
  obtained,
  paymentMethod,
}: {
  obtained: Elegibilidade | null;
  paymentMethod?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState("");

  const faqs = [
    {
      q: "O que fazer se o cliente contestar o veredito ao balcão?",
      tags: ["EX-002", "EX-003", "EX-004", "Contestação"],
      a: "Segundo a norma EX-002, o colaborador deve começar por explicar a política de loja com clareza e empatia, oferecendo a melhor alternativa conforme (ex.: troca por tamanho idêntico ou crédito de loja). Se o cliente se mantiver agitado ou causar perturbação no balcão, a norma EX-003 instrui o escalonamento imediato para o responsável sénior de turno. Nota: a agitação do cliente por si só não concede elegibilidade à devolução; o líder sénior apenas aprovará exceção se não houver paragens obrigatórias violadas e o risco de fraude for diminuto (EX-004).",
    },
    {
      q: "Qual o destino físico exato que devo dar ao produto em loja?",
      tags: ["OUT-007", "CT-008", "EP-005", "PC-008", "Destino"],
      a: "O destino do artigo depende estritamente do seu estado físico e canal: se a peça estiver perfeita e com etiquetas originais, inspecione códigos e RFID e devolva à área de vendas (CT-008). Peças sem etiqueta ou de outros canais vão para a secção de saldos com redução de 20% (EP-006). Artigos com defeito de fabrico comprovado sofrem baixa por dano de imediato (PC-006). Artigos sujos, com odor ou insalubres são obrigatoriamente colocados em saco de risco biológico, datados e armazenados em reserva até ordem de destruição (PC-008 / BW-004).",
    },
    {
      q: "Quais são as assinaturas e registos documentais obrigatórios?",
      tags: ["OUT-008", "CT-005", "CT-006", "CT-007", "Auditoria"],
      a: "De acordo com a norma CT-005, todas as devoluções concluídas exigem obrigatoriamente: 1) Assinatura do cliente (se recusar, o operador escreve 'Recusado'); 2) Assinatura do próprio operador processador; 3) Assinatura de testemunha (ou indicação 'SSC' se estiver em cobertura de colaborador único). O recibo original do cliente deve ser agrafado ao exemplar da loja (CT-006). Todo o suporte físico ou digital deve ser mantido em arquivo de retenção durante 90 dias para auditoria interna (CT-007).",
    },
    {
      q: "Porque é que o Afterpay ou métodos digitais têm regras rígidas?",
      tags: ["HS-005", "TN-008", "TN-010", "Afterpay", "Pagamento"],
      a: "Pelas regras HS-005 e TN-010, compras online ou em loja pagas através de Afterpay ou aplicações financeiras não admitem qualquer exceção ao meio de reembolso (é terminantemente proibido devolver em numerário, cartão de oferta ou outro cartão bancário). O cliente deve aceder à aplicação para leitura do código de devolução e o estorno é processado integralmente através da plataforma parceira.",
    },
    {
      q: "Como funciona a política para artigos de vestuário interior (Bodywear)?",
      tags: ["PC-007", "BW-001", "BW-002", "BW-003", "Bodywear"],
      a: "Pela norma PC-007, peças de roupa íntima e bodywear são sempre aceites para devolução ao balcão para garantir a satisfação do consumidor. Contudo, para proteção sanitária, o destino do artigo em loja obedece a critérios rigorosos: apenas peças não usadas com embalagem original selada voltam à venda (BW-001); embalagens abertas mas com artigos não usados vão para saldos a 50% com código riscado (BW-002); peças usadas sofrem baixa por dano imediata (BW-003) ou isolamento biológico (BW-004).",
    },
    {
      q: "Porque é que o colaborador tem de usar credenciais próprias do início ao fim?",
      tags: ["CT-001", "CT-003", "Segurança POS"],
      a: "A norma CT-003 estabelece que cada atendimento de devolução ou troca deve ser autenticado com o utilizador e palavra-passe do colaborador que atende o cliente, do início ao fim da transação. É expressamente proibido partilhar credenciais ou concluir devoluções na sessão de outro colega, garantindo rastreabilidade e prevenção de perdas.",
    },
    {
      q: "Como proceder quando o cliente solicita um ajuste de preço?",
      tags: ["PT-007", "PT-008", "Ajuste de Preço"],
      a: "O ajuste de preço só é permitido uma única vez por artigo, no prazo máximo de 14 dias após a compra em loja física, mediante apresentação do recibo original (PT-007). O sistema POS calcula a diferença face ao preço promocional atual. Fora deste prazo ou sem recibo original, o ajuste é expressamente recusado (PT-008).",
    },
  ];

  const filteredFaqs = faqs.filter(
    (item) =>
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h4 className="font-sans font-bold text-sm text-slate-900">Perguntas Rápidas de Balcão e Políticas Oficiais</h4>
          <p className="font-sans text-xs text-slate-500 mt-0.5">
            Respostas imediatas baseadas na base de conhecimento e normas de atendimento:
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[16px] text-slate-400">
            search
          </span>
          <input
            type="text"
            placeholder="Pesquisar pergunta ou norma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="font-sans w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0">
                    help_outline
                  </span>
                  <span className="font-sans font-bold text-xs sm:text-sm text-slate-900">
                    {faq.q}
                  </span>
                </div>
                <span className="material-symbols-outlined text-[18px] text-slate-400 shrink-0 transition-transform duration-200" style={{ transform: isOpen ? "rotate(180deg)" : "none" }}>
                  expand_more
                </span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2.5">
                  <p className="font-sans text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {faq.a}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-sans text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Regras associadas:
                    </span>
                    {faq.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono tabular-nums px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[10px] font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 4. Aba E Se...? (whatif - Simulação) */
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
    <div className="flex flex-col gap-4 text-left">
      <p className="font-sans text-xs sm:text-sm text-slate-600">
        Simule como a decisão do motor mudaria caso um critério da peça ou da compra do cliente fosse diferente:
      </p>

      {/* Preset simulation buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {WHAT_IF_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            disabled={loading}
            onClick={() => simulate(preset.changes)}
            className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-600 hover:shadow-2xs text-left transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-1.5 text-emerald-700 font-sans font-bold text-[10px] uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[15px]">science</span>
              <span>Hipótese</span>
            </div>
            <span className="font-sans font-bold text-xs sm:text-sm text-slate-900 leading-snug block">
              {preset.label}
            </span>
          </button>
        ))}
      </div>

      {/* Custom Simulator */}
      <details className="group rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
        <summary className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer flex items-center justify-between">
          <span>Personalizar Parâmetro Contrafactual</span>
          <span className="material-symbols-outlined text-[18px] group-open:rotate-180 transition-transform">
            expand_more
          </span>
        </summary>
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-3 pt-3 border-t border-slate-200">
          <input
            className="font-sans w-full sm:flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Caminho do campo"
            placeholder="Ex: artigos[0].estado.etiquetas"
            value={path}
            onChange={(event) => setPath(event.target.value)}
          />
          <input
            className="font-sans w-full sm:flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Novo valor"
            placeholder="Ex: COLOCADAS"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <button
            type="button"
            className="font-sans w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold whitespace-nowrap cursor-pointer disabled:opacity-50 transition-colors"
            disabled={loading || !path.trim() || !value.trim()}
            onClick={() => simulate(customChange())}
          >
            Simular Hipótese
          </button>
        </div>
      </details>

      {loading && (
        <div className="font-sans flex items-center gap-2 p-3 text-xs text-slate-500 font-medium animate-pulse">
          <span className="material-symbols-outlined text-emerald-600 text-[18px] animate-spin">sync</span>
          <span>A deduzir desfecho hipotético no motor...</span>
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      {simulation && (
        <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col gap-3.5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500">
              Resultado da Hipótese
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
                Decisão Simulada: {ELIGIBILITY[simulated]?.label ?? simulated}
              </span>
            )}
          </div>

          {simulation.resumo && (
            <p className="font-sans text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {cleanRuleCodes(simulation.resumo)}
            </p>
          )}

          {simulation.diferencas.length > 0 ? (
            <div className="w-full overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
              <table className="w-full text-left border-collapse text-xs font-sans tabular-nums">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th scope="col" className="p-2.5">Onde</th>
                    <th scope="col" className="p-2.5">Campo</th>
                    <th scope="col" className="p-2.5">Antes</th>
                    <th scope="col" className="p-2.5">Depois</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {simulation.diferencas.map((diff, index) => (
                    <tr key={index} className="hover:bg-slate-50/60">
                      <td className="p-2.5 font-sans font-bold text-slate-900">{diff.alvo ?? "—"}</td>
                      <td className="p-2.5 text-slate-600">{label(diff.campo)}</td>
                      <td className="p-2.5 text-rose-700 font-medium">{label(diff.original)}</td>
                      <td className="p-2.5 text-emerald-700 font-bold">{label(diff.simulado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="font-sans text-xs text-slate-500 italic">
              Esta alteração pontual não modifica o veredito de elegibilidade calculado.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** 5. Aba Factos e Validações (missing / dados-em-falta) */
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

  return (
    <div className="flex flex-col gap-4 text-left">
      <Status loading={loading} error={error} retry={retry} />
      {data && (
        <>
          <div
            className={`font-sans p-4 rounded-xl border flex items-center gap-3 text-xs sm:text-sm font-medium ${
              data.completo
                ? "bg-emerald-50/70 border-emerald-200/80 text-emerald-950"
                : "bg-amber-50/70 border-amber-200/80 text-amber-950"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] ${
                data.completo ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {data.completo ? "verified" : "help_center"}
            </span>
            <span>
              {data.completo
                ? "O pedido tem todos os dados necessários para uma decisão pericial completa e auditável."
                : "Existem dados complementares recomendados para assegurar conformidade integral."}{" "}
              {cleanRuleCodes(data.resumo)}
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {data.dados.map((item) => (
              <div
                key={item.codigo}
                className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-sans font-bold text-xs sm:text-sm text-slate-900 truncate">
                    {item.descricao ?? "Dado de balcão"}
                  </span>
                  <span className="text-[11px] text-slate-500 font-sans">
                    Código: <span className="font-mono tabular-nums">{item.codigo}</span>
                  </span>
                </div>
                {item.obrigatorio ? (
                  <span className="font-sans px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold uppercase tracking-wider border border-rose-200 shrink-0">
                    Obrigatório
                  </span>
                ) : (
                  <span className="font-sans px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200 shrink-0">
                    Opcional
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ExplainTabs({
  evaluationId,
  request,
  obtained,
  base = "/api/returns",
  paymentMethod,
}: {
  evaluationId: string;
  request: ReturnRequest;
  obtained: Elegibilidade | null;
  base?: string;
  paymentMethod?: string;
}) {
  const [active, setActive] = useState<TabId>("how");

  return (
    <ExplainBaseContext.Provider value={base}>
      <section className="w-full flex flex-col gap-4 text-left" aria-label="Explicações da decisão">
        {/* Navigation Tabs Pill Bar */}
        <div
          role="tablist"
          className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100/90 rounded-xl border border-slate-200/80"
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
          <HowTab evaluationId={evaluationId} />
        </div>
        <div role="tabpanel" id="panel-whynot" aria-labelledby="tab-whynot" hidden={active !== "whynot"}>
          <WhyNotTab evaluationId={evaluationId} obtained={obtained} />
        </div>
        <div role="tabpanel" id="panel-faq" aria-labelledby="tab-faq" hidden={active !== "faq"}>
          <CounterFaqTab obtained={obtained} paymentMethod={paymentMethod} />
        </div>
        <div role="tabpanel" id="panel-whatif" aria-labelledby="tab-whatif" hidden={active !== "whatif"}>
          <WhatIfTab evaluationId={evaluationId} />
        </div>
        <div role="tabpanel" id="panel-missing" aria-labelledby="tab-missing" hidden={active !== "missing"}>
          <MissingTab request={request} />
        </div>
      </section>
    </ExplainBaseContext.Provider>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import ResultCard from "@/components/ui/ResultCard";
import ExplainTabs from "@/components/returns/ExplainTabs";
import DecisionSummary from "@/components/returns/DecisionSummary";
import { api } from "@/client/api";
import {
  ELIGIBILITY,
  cleanRuleCodes,
  moduleLabel,
  label,
  money,
} from "@/config/returnsLabels";
import type {
  DecisaoResponse,
  ExplicacaoComoResponse,
  PassoExplicacaoDto,
  ReturnRequest,
} from "@/types/returns";
import type { EngineId } from "@/config/gateway";
import { useRouter } from "next/navigation";

export interface VerdictScreenProps {
  result: DecisaoResponse;
  request?: ReturnRequest;
  engine?: EngineId;
  durationMs?: number;
  currency?: string;
  onReset: () => void;
}

export default function VerdictScreen({
  result,
  request = {},
  engine = "returns",
  durationMs = 0,
  currency = "USD",
  onReset,
}: VerdictScreenProps) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [comoData, setComoData] = useState<ExplicacaoComoResponse | null>(null);
  const [comoLoading, setComoLoading] = useState<boolean>(false);
  const [comoError, setComoError] = useState<string | null>(null);

  const baseEndpoint = engine === "prolog" ? "/api/prolog" : "/api/returns";

  // Carregar a timeline oficial "Como Decidimos" através da API de explicabilidade
  const fetchComo = useCallback(async () => {
    if (!result.avaliacaoId) return;
    setComoLoading(true);
    setComoError(null);
    try {
      const data = await api<ExplicacaoComoResponse>(
        `${baseEndpoint}/avaliacoes/${result.avaliacaoId}/explicacoes/como?locale=pt-PT`
      );
      setComoData(data);
    } catch {
      // Falha silenciosa com fallback automático para result.regras
      setComoError("Informação de auditoria carregada localmente.");
    } finally {
      setComoLoading(false);
    }
  }, [baseEndpoint, result.avaliacaoId]);

  useEffect(() => {
    fetchComo();
  }, [fetchComo]);

  // Extrair valor numérico
  const refundVal =
    typeof result.valorDevolucao === "number"
      ? result.valorDevolucao
      : typeof result.valorDevolucao === "string"
      ? parseFloat(result.valorDevolucao)
      : undefined;

  // Encontrar a melhor explicação em linguagem natural, sem códigos técnicos
  const getHumanExplanation = (): string => {
    // 1. Procurar regra com resultado coincidente
    const matchingRule = result.regras?.find(
      (r) => r.resultado === result.elegibilidade && r.mensagem
    );
    if (matchingRule?.mensagem) {
      const cleaned = cleanRuleCodes(matchingRule.mensagem);
      if (cleaned.length > 10) return cleaned;
    }

    // 2. Procurar qualquer regra com mensagem relevante
    const anyMessageRule = result.regras
      ?.slice()
      .reverse()
      .find((r) => r.mensagem && !r.mensagem.includes("conclui a transação"));
    if (anyMessageRule?.mensagem) {
      const cleaned = cleanRuleCodes(anyMessageRule.mensagem);
      if (cleaned.length > 10) return cleaned;
    }

    // 3. Fallbacks padronizados por elegibilidade
    if (result.elegibilidade === "PERMITIR") {
      return "Devolução aprovada. O artigo cumpre todos os requisitos de condição física, comprovativo de compra e janela temporal permitida.";
    }
    if (result.elegibilidade === "RECUSAR") {
      return "Devolução não permitida. O pedido não cumpre os critérios da política comercial para o canal e condições apresentadas.";
    }
    if (result.elegibilidade === "REVER") {
      return "O atendimento requer aprovação ou confirmação presencial do responsável de loja antes da liquidação.";
    }
    return "Avaliação concluída de acordo com as diretrizes de balcão.";
  };

  const explanation = getHumanExplanation();

  // Determinar passos a mostrar na timeline (prioridade: comoData.passos, fallback: result.regras)
  const stepsToRender: PassoExplicacaoDto[] =
    comoData?.passos && comoData.passos.length > 0
      ? comoData.passos
      : (result.regras || []).map((r) => ({
          ordem: r.ordem,
          modulo: r.modulo,
          codigoRegra: r.codigoRegra,
          nomeRegra: r.nomeRegra,
          artigoId: r.artigoId,
          resultado: r.resultado,
          mensagem: r.mensagem,
          aValidar: r.aValidar,
        }));

  // Filtrar passos mais significativos para o operador (eliminar regras repetitivas de credencial POS)
  const userSteps = stepsToRender.filter((step) => {
    const raw = `${step.nomeRegra || ""} ${step.mensagem || ""}`;
    return !raw.includes("Mesmo colaborador do início") && !raw.includes("credenciais próprias");
  });

  const finalSteps = userSteps.length > 0 ? userSteps : stepsToRender;

  const currencySymbol = currency === "CAD" ? "CAD $" : "USD $";

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      {/* 1. Card Principal de Veredito */}
      <ResultCard
        eligibility={result.elegibilidade ?? "REVER"}
        refundValue={refundVal}
        explanation={explanation}
        remedy={
          result.meioReembolso
            ? label(result.meioReembolso)
            : result.tipoTransacao
            ? label(result.tipoTransacao)
            : undefined
        }
        paymentMethod={label(result.meioReembolso)}
        storeCredit={result.meioReembolso === "CARTAO_OFERTA" || result.meioReembolso === "CREDITO_LOJA"}
        actions={
          <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-card/60">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="btn-tactile-secondary px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {showDetails ? "expand_less" : "analytics"}
              </span>
              <span>{showDetails ? "Ocultar Detalhes Técnicos" : "Ver Análise Detalhada"}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-tactile-secondary px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Imprimir Recibo</span>
              </button>

              <button
                type="button"
                onClick={onReset}
                className="btn-tactile-primary px-6 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Novo Atendimento</span>
              </button>
            </div>
          </div>
        }
      />

      {/* 2. Timeline Tátil "Como Decidimos" */}
      <div className="card-tactile p-6 bg-white w-full flex flex-col gap-5 border border-border-card shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">route</span>
              <h3 className="font-headline-sm text-on-surface text-lg font-bold">
                Como Decidimos Este Caso
              </h3>
            </div>
            <p className="font-body-md text-on-surface-variant text-xs sm:text-sm mt-0.5">
              Critérios de conformidade analisados sequencialmente pelo motor de balcão:
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-surface-container-low text-xs font-bold text-on-surface-variant border border-border-card">
              Motor: {engine === "prolog" ? "Prolog (Dedução Lógica)" : "Drools (Regras)"}
            </span>
            {durationMs > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                {durationMs} ms
              </span>
            )}
          </div>
        </div>

        {comoLoading ? (
          <div className="flex flex-col gap-3 py-4">
            <div className="h-16 rounded-2xl bg-surface-container animate-pulse" />
            <div className="h-16 rounded-2xl bg-surface-container animate-pulse" />
            <div className="h-16 rounded-2xl bg-surface-container animate-pulse" />
          </div>
        ) : finalSteps.length > 0 ? (
          <div className="flex flex-col gap-3">
            {finalSteps.map((step, idx) => {
              const ruleTitle = cleanRuleCodes(step.nomeRegra) || moduleLabel(step.modulo);
              const message = cleanRuleCodes(step.mensagem);
              const isAllowed = step.resultado === "PERMITIR";
              const isRejected = step.resultado === "RECUSAR";
              const isReview = step.resultado === "REVER";

              const badgeColor = isAllowed
                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                : isRejected
                ? "bg-rose-50 border-rose-200 text-rose-950"
                : isReview
                ? "bg-amber-50 border-amber-200 text-amber-950"
                : "bg-surface-container-low border-border-card text-on-surface";

              const icon = isAllowed
                ? "check_circle"
                : isRejected
                ? "cancel"
                : isReview
                ? "warning"
                : "verified";

              const iconColor = isAllowed
                ? "text-primary"
                : isRejected
                ? "text-error"
                : isReview
                ? "text-tertiary"
                : "text-primary";

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all shadow-2xs ${badgeColor}`}
                >
                  <div className="pt-0.5 shrink-0">
                    <span className={`material-symbols-outlined text-[24px] ${iconColor}`}>
                      {icon}
                    </span>
                  </div>

                  <div className="flex flex-col flex-1 gap-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-headline-sm text-sm font-bold text-on-surface">
                        {ruleTitle}
                      </span>
                      {step.modulo && (
                        <span className="px-2.5 py-0.5 rounded-full bg-white/80 text-[10px] font-bold text-on-surface-variant border border-border-card shadow-2xs">
                          {moduleLabel(step.modulo)}
                        </span>
                      )}
                    </div>

                    {message && (
                      <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                        {message}
                      </p>
                    )}

                    {step.aValidar && (
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-800 font-bold">
                        <span className="material-symbols-outlined text-[14px]">info</span>
                        <span>Requer confirmação complementar na caixa</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="material-symbols-outlined text-primary text-[22px]">check_circle</span>
              <span className="font-body-md text-emerald-950 font-medium text-sm">
                Elegibilidade da peça e verificação de etiquetas confirmada.
              </span>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="material-symbols-outlined text-primary text-[22px]">check_circle</span>
              <span className="font-body-md text-emerald-950 font-medium text-sm">
                Janela temporal e comprovativo de compra validados com sucesso.
              </span>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="material-symbols-outlined text-primary text-[22px]">check_circle</span>
              <span className="font-body-md text-emerald-950 font-medium text-sm">
                Meio de liquidação aprovado para emissão no terminal POS.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Secção Expandida: Resumo de Decisão e Abas de Explicabilidade */}
      {showDetails && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-200">
          {/* Resumo da Decisão */}
          <DecisionSummary decision={result} durationMs={durationMs} />

          {/* Abas Completas de Explicabilidade (ExplainTabs com design tátil) */}
          <div className="card-tactile p-6 bg-white w-full flex flex-col gap-4 border border-border-card shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">psychology</span>
              <h3 className="font-headline-sm text-on-surface text-lg font-bold">
                Motor de Explicação e Simulações
              </h3>
            </div>

            <ExplainTabs
              evaluationId={result.avaliacaoId || ""}
              request={request}
              obtained={result.elegibilidade ?? null}
              base={baseEndpoint}
            />
          </div>
        </div>
      )}

      {/* 4. Rodapé de Ações Finais */}
      <div className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-border-card gap-4 flex-wrap">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="btn-tactile-secondary px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          <span>Voltar ao Painel Principal</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-tactile-secondary px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Imprimir Recibo</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="btn-tactile-primary px-6 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Novo Atendimento</span>
          </button>
        </div>
      </div>
    </div>
  );
}

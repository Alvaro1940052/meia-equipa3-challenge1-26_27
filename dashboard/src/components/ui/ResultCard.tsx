"use client";

import React, { ReactNode } from "react";
import { Elegibilidade } from "@/types/returns";

export interface ResultCardProps {
  eligibility: Elegibilidade;
  refundValue?: number;
  explanation: string;
  remedy?: string;
  paymentMethod?: string;
  storeCredit?: boolean;
  currency?: string;
  operationalAction?: string;
  onNewRequest?: () => void;
  onPrint?: () => void;
  actions?: ReactNode;
  className?: string;
}

export default function ResultCard({
  eligibility,
  refundValue,
  explanation,
  remedy,
  paymentMethod,
  storeCredit = false,
  currency = "USD",
  operationalAction,
  onNewRequest,
  onPrint,
  actions,
  className = "",
}: ResultCardProps) {
  const isApproved = eligibility === "PERMITIR";
  const isRejected = eligibility === "RECUSAR";
  const isReview = eligibility === "REVER";
  const isRoute = eligibility === "ENCAMINHAR";

  const statusConfig = isApproved
    ? {
        label: "Devolução Aprovada",
        eyebrow: "Conformidade Validada",
        subtitle: "Todos os critérios de elegibilidade foram validados com sucesso no motor de inferência.",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        iconContainerClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
        icon: "check_circle",
      }
    : isRejected
    ? {
        label: "Devolução Recusada",
        eyebrow: "Recusa Obrigatória de Política",
        subtitle: "O pedido não cumpre os critérios normativos da política comercial padrão da loja.",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200/80",
        iconContainerClass: "bg-rose-50 text-rose-700 border-rose-200/60",
        icon: "cancel",
      }
    : isReview
    ? {
        label: "Requer Análise de Exceção",
        eyebrow: "Critério de Gestão Necessário",
        subtitle: "A situação apresentada exige validação presencial do gestor de loja antes da liquidação.",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80",
        iconContainerClass: "bg-amber-50 text-amber-700 border-amber-200/60",
        icon: "shield",
      }
    : {
        label: "Encaminhamento de Pedido",
        eyebrow: "Processo Obrigatório Separado",
        subtitle: "A transação deve ser processada através do canal específico dedicado.",
        badgeClass: "bg-sky-50 text-sky-700 border-sky-200/80",
        iconContainerClass: "bg-sky-50 text-sky-700 border-sky-200/60",
        icon: "forward",
      };

  const currencyPrefix = currency === "CAD" ? "CAD $" : currency === "EUR" ? "€" : "$";

  const resolutionMode =
    remedy ||
    (storeCredit
      ? "Cartão-Oferta / Crédito de Loja"
      : isApproved
      ? "Reembolso Original"
      : isRejected
      ? "Sem Devolução Autorizada"
      : "A Decidir pela Gestão");

  const resolutionSubtext = isApproved
    ? storeCredit
      ? "Validade de 1 ano em todas as lojas físicas e online"
      : "Creditado automaticamente na conta de origem"
    : isRejected
    ? "Devolver artigo ao cliente com comprovativo"
    : "Conforme avaliação do gestor de turno";

  const resolvedAction =
    operationalAction ||
    (isApproved
      ? "Concluir transação no terminal POS regular"
      : isRejected
      ? "Devolver artigo ao cliente e emitir comprovativo de recusa"
      : isReview
      ? "Solicitar PIN ou assinatura de autorização do gestor"
      : "Iniciar processo obrigatório na aplicação dedicada");

  return (
    <div
      role="region"
      aria-label="Veredito oficial da devolução"
      className={`rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col gap-6 text-left transition-all ${className}`}
    >
      {/* 1. Header Minimalista do Veredito Oficial */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${statusConfig.iconContainerClass}`}
          >
            <span className="material-symbols-outlined text-[26px]">
              {statusConfig.icon}
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`font-sans inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${statusConfig.badgeClass}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {statusConfig.eyebrow}
              </span>
            </div>
            <h2 className="font-sans font-bold text-slate-900 text-xl sm:text-2xl tracking-tight mt-1">
              {statusConfig.label}
            </h2>
            <p className="font-sans text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
              {statusConfig.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Grid Operacional de Balcão (4 Factos Cruciais para o Operador) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Valor Autorizado */}
        <div className="rounded-xl p-4 bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="font-sans font-bold"><span className="font-mono tabular-nums">01</span> / Valor</span>
            <span className="material-symbols-outlined text-[16px] text-slate-400">payments</span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="font-sans tabular-nums text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {refundValue !== undefined ? refundValue.toFixed(2) : "0.00"}
            </span>
            <span className="font-sans text-sm font-bold text-slate-500">
              {currencyPrefix}
            </span>
          </div>
          <span className="font-sans text-[11px] text-slate-500 font-medium truncate">
            {paymentMethod ? `Via ${paymentMethod}` : "Valor elegível de balcão"}
          </span>
        </div>

        {/* Card 2: Modalidade de Resolução */}
        <div className="rounded-xl p-4 bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="font-sans font-bold"><span className="font-mono tabular-nums">02</span> / Transação</span>
            <span className="material-symbols-outlined text-[16px] text-slate-400">swap_horiz</span>
          </div>
          <span className="font-sans font-bold text-slate-900 text-sm sm:text-base leading-snug my-1 line-clamp-2">
            {resolutionMode}
          </span>
          <span className="font-sans text-[11px] text-slate-500 font-medium truncate" title={resolutionSubtext}>
            {resolutionSubtext}
          </span>
        </div>

        {/* Card 3: Meio de Liquidação */}
        <div className="rounded-xl p-4 bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="font-sans font-bold"><span className="font-mono tabular-nums">03</span> / Liquidação</span>
            <span className="material-symbols-outlined text-[16px] text-slate-400">credit_card</span>
          </div>
          <span className="font-sans font-bold text-slate-900 text-sm sm:text-base leading-snug my-1 truncate">
            {paymentMethod || (storeCredit ? "Crédito de Loja" : "Meio Original")}
          </span>
          <span className="font-sans text-[11px] text-slate-500 font-medium truncate">
            {isApproved ? "Estorno seguro por tokenização" : "Processamento conforme política"}
          </span>
        </div>

        {/* Card 4: Ação Imediata do Operador */}
        <div className="rounded-xl p-4 bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="font-sans font-bold"><span className="font-mono tabular-nums">04</span> / Ação Imediata</span>
            <span className="material-symbols-outlined text-[16px] text-slate-400">point_of_sale</span>
          </div>
          <span className="font-sans font-bold text-slate-900 text-sm leading-snug my-1 line-clamp-2">
            {resolvedAction}
          </span>
          <span className="font-sans text-[11px] text-slate-500 font-medium truncate">
            {isReview ? "PIN obrigatório no POS" : "Executar no fluxo padrão"}
          </span>
        </div>
      </div>

      {/* 3. Justificação da Decisão em Linguagem Natural */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col gap-2">
        <div className="font-sans flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-[16px] text-emerald-600">gavel</span>
          <span>Justificação da Política Comercial</span>
        </div>
        <p className="font-sans text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          {explanation}
        </p>
      </div>

      {/* 4. Alerta Operacional quando Exige Revisão do Gestor (REVER) */}
      {isReview && (
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 flex items-start gap-3">
          <span className="material-symbols-outlined text-[20px] text-amber-600 mt-0.5 shrink-0">
            notification_important
          </span>
          <div className="flex flex-col gap-0.5 text-xs">
            <span className="font-sans font-bold text-amber-950">Atenção ao Operador de Caixa:</span>
            <p className="font-sans text-amber-900 leading-relaxed">
              Esta decisão requer confirmação presencial do supervisor de turno ou gestor de loja através de PIN de autorização no terminal POS antes da emissão do crédito.
            </p>
          </div>
        </div>
      )}

      {/* 5. Ações Injetadas ou Rodapé Interno */}
      {actions && <div className="w-full pt-1">{actions}</div>}
    </div>
  );
}


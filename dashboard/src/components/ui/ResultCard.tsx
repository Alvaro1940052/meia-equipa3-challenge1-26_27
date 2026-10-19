"use client";

import React, { ReactNode } from "react";
import { Elegibilidade } from "@/types/returns";
import {
  formatResolutionSubtext,
  formatTenderSubtext,
  formatOperationalAction,
} from "@/config/returnsLabels";
import { useLocale } from "@/contexts/LocaleContext";

export interface ResultCardProps {
  eligibility: Elegibilidade;
  refundValue?: number;
  explanation?: string;
  remedy?: string;
  remedySubtext?: string;
  paymentMethod?: string;
  tenderSubtext?: string;
  storeCredit?: boolean;
  currency?: string;
  operationalAction?: string;
  operationalHint?: string;
  rawTransactionType?: string | null;
  rawRefundMethod?: string | null;
  rawOriginalPaymentMethod?: string | null;
  rawProcess?: string | null;
  rawApproval?: string | null;
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
  remedySubtext,
  paymentMethod,
  tenderSubtext,
  storeCredit = false,
  currency = "USD",
  operationalAction,
  operationalHint,
  rawTransactionType,
  rawRefundMethod,
  rawOriginalPaymentMethod,
  rawProcess,
  rawApproval,
  actions,
  className = "",
}: ResultCardProps) {
  const { locale } = useLocale();
  const isApproved = eligibility === "PERMITIR";
  const isRejected = eligibility === "RECUSAR";
  const isReview = eligibility === "REVER";

  const effectiveExplanation = explanation && explanation.trim().length > 0
    ? explanation.trim()
    : null;

  const statusConfig = isApproved
    ? {
        label: locale === "en" ? "Return Approved" : "Devolução Aprovada",
        subtitle:
          effectiveExplanation ||
          (locale === "en"
            ? "All eligibility criteria successfully validated by the inference engine."
            : "Todos os critérios de elegibilidade foram validados com sucesso no motor de inferência."),
        iconContainerClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
        icon: "check_circle",
      }
    : isRejected
    ? {
        label: locale === "en" ? "Return Denied" : "Devolução Recusada",
        subtitle:
          effectiveExplanation ||
          (locale === "en"
            ? "The request does not comply with standard store commercial policy criteria."
            : "O pedido não cumpre os critérios normativos da política comercial padrão da loja."),
        iconContainerClass: "bg-rose-50 text-rose-700 border-rose-200/60",
        icon: "cancel",
      }
    : isReview
    ? {
        label: locale === "en" ? "Manager Exception Review" : "Requer Análise de Exceção",
        subtitle:
          effectiveExplanation ||
          (locale === "en"
            ? "This situation requires in-person store manager validation before settlement."
            : "A situação apresentada exige validação presencial do gestor de loja antes da liquidação."),
        iconContainerClass: "bg-amber-50 text-amber-700 border-amber-200/60",
        icon: "shield",
      }
    : {
        label: locale === "en" ? "Escalate Request" : "Encaminhamento de Pedido",
        subtitle:
          effectiveExplanation ||
          (locale === "en"
            ? "Transaction must be processed via dedicated specialized channel."
            : "A transação deve ser processada através do canal específico dedicado."),
        iconContainerClass: "bg-sky-50 text-sky-700 border-sky-200/60",
        icon: "forward",
      };

  const currencyPrefix = currency === "CAD" ? "CAD $" : currency === "EUR" ? "€" : "$";

  const resolutionMode =
    remedy ||
    (storeCredit
      ? (locale === "en" ? "Gift Card / Store Credit" : "Cartão-Oferta / Crédito de Loja")
      : isApproved
      ? (locale === "en" ? "Original Tender Refund" : "Reembolso Original")
      : isRejected
      ? (locale === "en" ? "No Return Authorized" : "Sem Devolução Autorizada")
      : (locale === "en" ? "Management Discretion" : "A Decidir pela Gestão"));

  const effectiveResolutionSubtext =
    remedySubtext ||
    formatResolutionSubtext(
      rawTransactionType ?? remedy ?? (storeCredit ? "CREDITO_LOJA" : undefined),
      rawRefundMethod ?? paymentMethod ?? (storeCredit ? "CARTAO_OFERTA" : undefined),
      eligibility,
      rawOriginalPaymentMethod,
      locale
    );

  const tenderMode =
    paymentMethod || (storeCredit ? (locale === "en" ? "Store Credit" : "Crédito de Loja") : isApproved ? (locale === "en" ? "Original Tender" : "Meio Original") : (locale === "en" ? "None" : "Nenhum"));

  const effectiveTenderSubtext =
    tenderSubtext ||
    formatTenderSubtext(
      rawRefundMethod ?? paymentMethod ?? (storeCredit ? "CARTAO_OFERTA" : undefined),
      rawTransactionType ?? remedy ?? (storeCredit ? "CREDITO_LOJA" : undefined),
      eligibility,
      rawOriginalPaymentMethod,
      locale
    );

  const defaultOp = formatOperationalAction(rawProcess, rawApproval, eligibility, locale);
  const resolvedAction = operationalAction || defaultOp.action;
  const resolvedHint = operationalHint || defaultOp.hint;

  return (
    <div
      role="region"
      aria-label={locale === "en" ? "Official return verdict" : "Veredito oficial da devolução"}
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
            <h2 className="font-sans font-bold text-slate-900 text-xl sm:text-2xl tracking-tight">
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
            <span className="font-sans font-bold"><span className="font-mono tabular-nums">01</span> / {locale === "en" ? "Amount" : "Valor"}</span>
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
            {paymentMethod ? (locale === "en" ? `Via ${paymentMethod}` : `Via ${paymentMethod}`) : (locale === "en" ? "Eligible counter amount" : "Valor elegível de balcão")}
          </span>
        </div>

        {/* Card 2: Modalidade de Resolução */}
        <div className="rounded-xl p-4 bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="font-sans font-bold"><span className="font-mono tabular-nums">02</span> / {locale === "en" ? "Transaction" : "Transação"}</span>
            <span className="material-symbols-outlined text-[16px] text-slate-400">swap_horiz</span>
          </div>
          <span className="font-sans font-bold text-slate-900 text-sm sm:text-base leading-snug my-1 line-clamp-2" title={resolutionMode}>
            {resolutionMode}
          </span>
          <span className="font-sans text-[11px] text-slate-500 font-medium truncate" title={effectiveResolutionSubtext}>
            {effectiveResolutionSubtext}
          </span>
        </div>

        {/* Card 3: Meio de Liquidação */}
        <div className="rounded-xl p-4 bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="font-sans font-bold"><span className="font-mono tabular-nums">03</span> / {locale === "en" ? "Tender" : "Liquidação"}</span>
            <span className="material-symbols-outlined text-[16px] text-slate-400">credit_card</span>
          </div>
          <span className="font-sans font-bold text-slate-900 text-sm sm:text-base leading-snug my-1 truncate" title={tenderMode}>
            {tenderMode}
          </span>
          <span className="font-sans text-[11px] text-slate-500 font-medium truncate" title={effectiveTenderSubtext}>
            {effectiveTenderSubtext}
          </span>
        </div>

        {/* Card 4: Ação Imediata do Operador */}
        <div className="rounded-xl p-4 bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="font-sans font-bold"><span className="font-mono tabular-nums">04</span> / {locale === "en" ? "Immediate Action" : "Ação Imediata"}</span>
            <span className="material-symbols-outlined text-[16px] text-slate-400">point_of_sale</span>
          </div>
          <span className="font-sans font-bold text-slate-900 text-sm leading-snug my-1 line-clamp-2" title={resolvedAction}>
            {resolvedAction}
          </span>
          <span className="font-sans text-[11px] text-slate-500 font-medium truncate" title={resolvedHint}>
            {resolvedHint}
          </span>
        </div>
      </div>

      {/* 4. Alerta Operacional quando Exige Revisão do Gestor (REVER) */}
      {isReview && (
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 flex items-start gap-3">
          <span className="material-symbols-outlined text-[20px] text-amber-600 mt-0.5 shrink-0">
            notification_important
          </span>
          <div className="flex flex-col gap-0.5 text-xs">
            <span className="font-sans font-bold text-amber-950">
              {locale === "en" ? "Attention POS Operator:" : "Atenção ao Operador de Caixa:"}
            </span>
            <p className="font-sans text-amber-900 leading-relaxed">
              {locale === "en"
                ? "This decision requires in-person confirmation from shift supervisor or store manager via POS authorization credential PIN before issuing tender."
                : "Esta decisão requer confirmação presencial do supervisor de turno ou gestor de loja através de PIN de autorização no terminal POS antes da emissão do crédito."}
            </p>
          </div>
        </div>
      )}

      {/* 5. Ações Injetadas ou Rodapé Interno */}
      {actions && <div className="w-full pt-1">{actions}</div>}
    </div>
  );
}


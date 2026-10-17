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
  onNewRequest,
  onPrint,
  actions,
  className = "",
}: ResultCardProps) {
  const isApproved = eligibility === "PERMITIR";
  const isRejected = eligibility === "RECUSAR";
  const isReview = eligibility === "REVER";

  const statusBg = isApproved
    ? "!bg-emerald-50/90 !border-emerald-300"
    : isRejected
    ? "!bg-rose-50/90 !border-rose-300"
    : "!bg-amber-50/90 !border-amber-300";

  const statusColor = isApproved
    ? "text-primary"
    : isRejected
    ? "text-error"
    : "text-tertiary";

  const statusLabel = isApproved
    ? "Devolução Aprovada"
    : isRejected
    ? "Devolução Não Elegível"
    : "Requer Análise de Exceção";

  const statusSubtitle = isApproved
    ? "Todos os critérios de elegibilidade foram validados com sucesso."
    : isRejected
    ? "O pedido não cumpre a política comercial padrão da loja."
    : "A situação apresentada exige validação presencial do gerente de loja.";

  const iconName = isApproved
    ? "check_circle"
    : isRejected
    ? "cancel"
    : "report";

  return (
    <div
      role="region"
      aria-label="Veredito oficial da devolução"
      className={`card-tactile relative overflow-hidden p-6 md:p-8 w-full flex flex-col gap-6 border-2 shadow-lg ${statusBg} ${className}`}
    >
      {/* Subtle celebratory confetti particles on approval */}
      {isApproved && (
        <div aria-hidden="true" className="absolute top-0 right-6 pointer-events-none overflow-hidden h-20 w-44">
          <span className="absolute top-1 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-confetti" style={{ animationDelay: "100ms" }} />
          <span className="absolute top-2 right-12 w-2.5 h-1.5 rounded-sm bg-amber-400 rotate-45 animate-confetti" style={{ animationDelay: "300ms" }} />
          <span className="absolute top-1 right-20 w-2 h-2 rounded-full bg-blue-500 animate-confetti" style={{ animationDelay: "200ms" }} />
          <span className="absolute top-3 right-28 w-1.5 h-2.5 rounded-sm bg-emerald-400 -rotate-12 animate-confetti" style={{ animationDelay: "450ms" }} />
          <span className="absolute top-2 right-36 w-2 h-2 rounded-full bg-yellow-400 animate-confetti" style={{ animationDelay: "250ms" }} />
        </div>
      )}

      {/* Header with status badge & icon */}
      <div className="flex items-start gap-4">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-md ${
            isApproved
              ? "bg-primary-container shadow-[0_4px_0_#059669] animate-pop-success"
              : isRejected
              ? "bg-error shadow-[0_4px_0_#93000A]"
              : "bg-tertiary-container shadow-[0_4px_0_#B45309]"
          }`}
        >
          <span
            className="material-symbols-outlined text-[34px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {iconName}
          </span>
        </div>
        <div className="flex flex-col flex-1">
          <span className="font-label-md text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Veredito Oficial RetailFlow
          </span>
          <h2 className={`font-headline-lg ${statusColor} tracking-tight`}>
            {statusLabel}
          </h2>
          <p className="font-body-md text-on-surface-variant text-sm mt-0.5">
            {statusSubtitle}
          </p>
        </div>
      </div>

      {/* Refund value and resolution highlight */}
      {(refundValue !== undefined || remedy || storeCredit) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {refundValue !== undefined && (
            <div className="p-4 rounded-2xl bg-white border border-border-card shadow-sm flex flex-col justify-between">
              <span className="font-label-md text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                Valor Autorizado
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-headline-lg text-primary font-extrabold text-3xl">
                  {refundValue.toFixed(2)}
                </span>
                <span className="font-headline-sm text-primary">€</span>
              </div>
              {paymentMethod && (
                <span className="text-xs text-on-surface-variant font-medium mt-1">
                  Via {paymentMethod}
                </span>
              )}
            </div>
          )}

          {(remedy || storeCredit) && (
            <div className="p-4 rounded-2xl bg-white border border-border-card shadow-sm flex flex-col justify-between">
              <span className="font-label-md text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                Modalidade de Resolução
              </span>
              <span className="font-headline-sm text-on-surface mt-1">
                {remedy || (storeCredit ? "Cartão Presente / Crédito Loja" : "Reembolso Original")}
              </span>
              <span className="text-xs text-on-surface-variant font-medium mt-1">
                {storeCredit ? "Validade de 1 ano em todas as lojas" : "Creditado na conta de origem"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Plain text explanation (no codes) */}
      <div className="p-5 rounded-2xl bg-white/90 border border-border-card shadow-sm">
        <h3 className="font-label-md text-xs font-bold uppercase text-on-surface-variant mb-1.5 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-primary">info</span>
          <span>Justificação da Decisão</span>
        </h3>
        <p className="font-body-lg text-on-surface leading-relaxed text-sm md:text-base">
          {explanation}
        </p>
      </div>

      {/* Review notice if manual exception needed */}
      {isReview && (
        <div className="p-4 rounded-xl bg-amber-100/70 border border-amber-300 text-tertiary-container flex items-start gap-3">
          <span className="material-symbols-outlined text-[20px] text-tertiary mt-0.5">
            notification_important
          </span>
          <p className="text-xs font-medium text-tertiary leading-relaxed">
            Esta decisão requer confirmação do supervisor de turno através de PIN de autorização no terminal POS.
          </p>
        </div>
      )}

      {/* Custom injected actions or default buttons */}
      {actions ? (
        <div className="w-full">{actions}</div>
      ) : (
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="btn-tactile-secondary px-5 py-2.5 text-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>Imprimir Recibo</span>
            </button>
          )}
          {onNewRequest && (
            <button
              type="button"
              onClick={onNewRequest}
              className="btn-tactile-primary px-6 py-2.5 text-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Novo Atendimento</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

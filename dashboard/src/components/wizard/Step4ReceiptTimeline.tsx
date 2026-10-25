"use client";

import React from "react";
import { useWizard } from "./WizardContext";
import { useLocale } from "@/contexts/LocaleContext";

interface RequestTypeItem {
  id: "DEVOLUCAO" | "TROCA" | "GIFT" | "AJUSTE_PRECO";
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
}

const REQUEST_TYPES_PT: RequestTypeItem[] = [
  {
    id: "DEVOLUCAO",
    title: "Devolução Standard",
    subtitle: "Reembolso monetário regular pelo meio de pagamento utilizado",
    badge: "Padrão",
    icon: "assignment_return",
  },
  {
    id: "TROCA",
    title: "Troca por Artigo",
    subtitle: "Substituição por outro tamanho, modelo ou cor de artigo em loja",
    badge: "Troca",
    icon: "swap_horiz",
  },
  {
    id: "GIFT",
    title: "Devolução de Oferta",
    subtitle: "Apresentação de recibo de presente; emissão de vale ou crédito de loja",
    badge: "Oferta",
    icon: "featured_seasonal_and_gifts",
  },
  {
    id: "AJUSTE_PRECO",
    title: "Ajuste de Preço",
    subtitle: "Reembolso da diferença de promoção ou desconto posterior de loja",
    badge: "Acerto",
    icon: "price_change",
  },
];

const REQUEST_TYPES_EN: RequestTypeItem[] = [
  {
    id: "DEVOLUCAO",
    title: "Standard Return",
    subtitle: "Regular monetary refund to the original payment method used",
    badge: "Standard",
    icon: "assignment_return",
  },
  {
    id: "TROCA",
    title: "Item Exchange",
    subtitle: "Exchange for another size, model, or color in store",
    badge: "Exchange",
    icon: "swap_horiz",
  },
  {
    id: "GIFT",
    title: "Gift Return",
    subtitle: "Gift receipt presented; issuance of store credit or gift card",
    badge: "Gift",
    icon: "featured_seasonal_and_gifts",
  },
  {
    id: "AJUSTE_PRECO",
    title: "Price Adjustment",
    subtitle: "Refund of price difference for post-purchase store discount",
    badge: "Adjustment",
    icon: "price_change",
  },
];

interface ProofOfPurchaseItem {
  id: "RECIBO_ORIGINAL" | "CONFIRMACAO_ONLINE" | "RECIBO_OFERTA" | "CONSULTA_POS" | "SEM_COMPROVATIVO";
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
}

const PROOFS_OF_PURCHASE_PT: ProofOfPurchaseItem[] = [
  {
    id: "RECIBO_ORIGINAL",
    title: "Recibo Original",
    subtitle: "Talão de caixa impresso com código de barras e NIF",
    badge: "Físico",
    icon: "receipt_long",
  },
  {
    id: "CONFIRMACAO_ONLINE",
    title: "Confirmação Online",
    subtitle: "Email de confirmação de encomenda ou fatura digital da app",
    badge: "Digital",
    icon: "mark_email_read",
  },
  {
    id: "RECIBO_OFERTA",
    title: "Recibo de Oferta",
    subtitle: "Talão emitido no momento da compra sem valor monetário visível",
    badge: "Gift",
    icon: "redeem",
  },
  {
    id: "CONSULTA_POS",
    title: "Consulta no POS",
    subtitle: "Pesquisa no sistema pelo cartão de pagamento ou cliente",
    badge: "Sistema",
    icon: "point_of_sale",
  },
  {
    id: "SEM_COMPROVATIVO",
    title: "Sem Comprovativo",
    subtitle: "O cliente não apresenta qualquer talão físico ou registo digital de compra",
    badge: "Exceção",
    icon: "block",
  },
];

const PROOFS_OF_PURCHASE_EN: ProofOfPurchaseItem[] = [
  {
    id: "RECIBO_ORIGINAL",
    title: "Original Receipt",
    subtitle: "Printed register receipt with barcode and tax ID",
    badge: "Physical",
    icon: "receipt_long",
  },
  {
    id: "CONFIRMACAO_ONLINE",
    title: "Online Confirmation",
    subtitle: "Order confirmation email or digital app invoice",
    badge: "Digital",
    icon: "mark_email_read",
  },
  {
    id: "RECIBO_OFERTA",
    title: "Gift Receipt",
    subtitle: "Receipt issued at time of purchase without visible monetary values",
    badge: "Gift",
    icon: "redeem",
  },
  {
    id: "CONSULTA_POS",
    title: "POS Lookup",
    subtitle: "System lookup using customer tender card or account",
    badge: "Lookup",
    icon: "point_of_sale",
  },
  {
    id: "SEM_COMPROVATIVO",
    title: "No Proof of Purchase",
    subtitle: "Customer presents no physical receipt or digital record of purchase",
    badge: "Exception",
    icon: "block",
  },
];

// Três faixas de prazo: o ajuste de preço (PT-007/PT-008) usa os 14 dias e a devolução (PT-003/PT-004) os 30.
// Cada faixa envia um valor do seu interior, para a decisão não depender do dia-limite (A-22).
interface TimelineItem {
  id: "ATE_14" | "DE_15_A_30" | "MAIS_30";
  days: number;
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  tone: "emerald" | "amber";
}

const TIMELINE_PT: TimelineItem[] = [
  {
    id: "ATE_14",
    days: 10,
    title: "Até 14 Dias",
    subtitle: "Dentro do prazo de devolução de 30 dias e do ajuste de preço único de 14 dias",
    badge: "Janela Regular",
    icon: "schedule",
    tone: "emerald",
  },
  {
    id: "DE_15_A_30",
    days: 20,
    title: "15 a 30 Dias",
    subtitle: "Dentro do prazo de devolução de 30 dias; já fora do prazo de ajuste de preço",
    badge: "Janela Regular",
    icon: "date_range",
    tone: "emerald",
  },
  {
    id: "MAIS_30",
    days: 45,
    title: "Mais de 30 Dias",
    subtitle: "Sem reembolso automático: a gestão decide e pode aprovar crédito de loja",
    badge: "Revisão da Gestão",
    icon: "history_toggle_off",
    tone: "amber",
  },
];

const TIMELINE_EN: TimelineItem[] = [
  {
    id: "ATE_14",
    days: 10,
    title: "Up to 14 Days",
    subtitle: "Within the 30-day return window and the one-time 14-day price adjustment",
    badge: "Standard Window",
    icon: "schedule",
    tone: "emerald",
  },
  {
    id: "DE_15_A_30",
    days: 20,
    title: "15 to 30 Days",
    subtitle: "Within the 30-day return window; past the price adjustment window",
    badge: "Standard Window",
    icon: "date_range",
    tone: "emerald",
  },
  {
    id: "MAIS_30",
    days: 45,
    title: "Over 30 Days",
    subtitle: "No automatic refund: management decides and may approve store credit",
    badge: "Management Review",
    icon: "history_toggle_off",
    tone: "amber",
  },
];

function timelineIdFor(days: number | null): TimelineItem["id"] | null {
  if (days === null) return null;
  if (days <= 14) return "ATE_14";
  if (days <= 30) return "DE_15_A_30";
  return "MAIS_30";
}

export default function Step4ReceiptTimeline() {
  const { state, setField } = useWizard();
  const { locale } = useLocale();

  const isEn = locale === "en";
  const requestTypes = isEn ? REQUEST_TYPES_EN : REQUEST_TYPES_PT;
  const proofsOfPurchase = isEn ? PROOFS_OF_PURCHASE_EN : PROOFS_OF_PURCHASE_PT;
  const timelineOptions = isEn ? TIMELINE_EN : TIMELINE_PT;
  const selectedTimeline = timelineIdFor(state.daysSincePurchase);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Tipo de Pedido */}
      <div className="w-full flex flex-col gap-3">
        {/* Typographic Section Header */}
        <div className="flex items-center gap-2 px-1">
          <span className="font-mono tabular-nums text-xs font-bold text-slate-400 select-none">01</span>
          <span className="text-slate-300">/</span>
          <h3 className="font-sans text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {isEn ? "Request Type" : "Tipo de Pedido"}
          </h3>
          {state.requestType ? (
            <span className="font-sans inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 select-none">
              <span className="material-symbols-outlined text-[13px] font-bold">check</span>
              {isEn ? "Selected" : "Definido"}
            </span>
          ) : (
            <span className="font-sans inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {isEn ? "Required" : "Obrigatório"}
            </span>
          )}
        </div>

        {/* Minimalist Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {requestTypes.map((item) => {
            const isSelected = state.requestType === item.id;
            const isAjustePreco = item.id === "AJUSTE_PRECO";
            const isAjusteRecusado =
              isAjustePreco &&
              ((state.daysSincePurchase !== null && state.daysSincePurchase > 14) ||
                (state.proofOfPurchase && state.proofOfPurchase !== "RECIBO_ORIGINAL"));

            const handleSelect = () => {
              setField("requestType", item.id);
            };

            const borderClass = isSelected
              ? isAjusteRecusado
                ? "border-2 border-rose-500"
                : "border-2 border-emerald-600"
              : "border border-slate-200 hover:border-slate-300";

            const iconClass = isSelected
              ? isAjusteRecusado
                ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              : "bg-slate-100 text-slate-500 border border-slate-200/60";

            const radioClass = isSelected
              ? isAjusteRecusado
                ? "bg-rose-500 text-white"
                : "bg-emerald-600 text-white"
              : "border-2 border-slate-300";

            return (
              <div
                key={item.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={handleSelect}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect();
                  }
                }}
                className={`group rounded-xl p-4 sm:p-5 cursor-pointer flex items-center justify-between gap-4 transition-all duration-150 focus-visible:outline-2 bg-white ${isAjusteRecusado && isSelected
                    ? "focus-visible:outline-rose-500"
                    : "focus-visible:outline-emerald-600"
                  } ${borderClass}`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${iconClass}`}
                  >
                    <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-sans font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                        {item.title}
                      </h4>
                      <span className="font-sans text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                        {item.badge}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div
                  aria-hidden="true"
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${radioClass}`}
                >
                  {isSelected && (
                    <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Comprovativo de Compra */}
      <div className="w-full flex flex-col gap-3">
        {/* Typographic Section Header */}
        <div className="flex items-center gap-2 px-1">
          <span className="font-mono tabular-nums text-xs font-bold text-slate-400 select-none">02</span>
          <span className="text-slate-300">/</span>
          <h3 className="font-sans text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {isEn ? "Proof of Purchase" : "Comprovativo de Compra"}
          </h3>
          {state.proofOfPurchase ? (
            <span className="font-sans inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 select-none">
              <span className="material-symbols-outlined text-[13px] font-bold">check</span>
              {isEn ? "Selected" : "Definido"}
            </span>
          ) : (
            <span className="font-sans inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {isEn ? "Required" : "Obrigatório"}
            </span>
          )}
        </div>

        {/* Minimalist Cards Grid alinhado em 2 colunas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {proofsOfPurchase.map((item) => {
            const isSelected = state.proofOfPurchase === item.id;
            const isFullWidth = item.id === "SEM_COMPROVATIVO";
            const isAmber = item.id === "SEM_COMPROVATIVO";

            const borderClass = isSelected
              ? isAmber
                ? "border-2 border-amber-500"
                : "border-2 border-emerald-600"
              : "border border-slate-200 hover:border-slate-300";

            const iconClass = isSelected
              ? isAmber
                ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              : "bg-slate-100 text-slate-500 border border-slate-200/60";

            const radioClass = isSelected
              ? isAmber
                ? "bg-amber-500 text-white"
                : "bg-emerald-600 text-white"
              : "border-2 border-slate-300";

            return (
              <div
                key={item.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => setField("proofOfPurchase", item.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setField("proofOfPurchase", item.id);
                  }
                }}
                className={`group rounded-xl p-4 sm:p-5 cursor-pointer flex items-center justify-between gap-4 transition-all duration-150 focus-visible:outline-2 bg-white ${isAmber ? "focus-visible:outline-amber-500" : "focus-visible:outline-emerald-600"
                  } ${isFullWidth ? "sm:col-span-2" : ""
                  } ${borderClass}`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${iconClass}`}
                  >
                    <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-sans font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                        {item.title}
                      </h4>
                      <span className="font-sans text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                        {item.badge}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div
                  aria-hidden="true"
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${radioClass}`}
                >
                  {isSelected && (
                    <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Janela Temporal desde a Compra */}
      <div className="w-full flex flex-col gap-3">
        {/* Typographic Section Header */}
        <div className="flex items-center gap-2 px-1">
          <span className="font-mono tabular-nums text-xs font-bold text-slate-400 select-none">03</span>
          <span className="text-slate-300">/</span>
          <h3 className="font-sans text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {isEn ? "Timeline Since Purchase" : "Janela Temporal desde a Compra"}
          </h3>
          {selectedTimeline !== null ? (
            selectedTimeline !== "MAIS_30" ? (
              <span className="font-sans inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 select-none">
                <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                {isEn ? "Regular (≤ 30d)" : "Regular (≤ 30d)"}
              </span>
            ) : (
              <span className="font-sans inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 select-none">
                <span className="material-symbols-outlined text-[13px] font-bold">warning</span>
                {isEn ? "Management review (> 30d)" : "Revisão da gestão (> 30d)"}
              </span>
            )
          ) : (
            <span className="font-sans inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {isEn ? "Required" : "Obrigatório"}
            </span>
          )}
        </div>

        {/* Minimalist Cards Grid em 3 colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
          {timelineOptions.map((item) => {
            const isSelected = selectedTimeline === item.id;
            const isAmber = item.tone === "amber";

            const borderClass = isSelected
              ? isAmber
                ? "border-2 border-amber-500"
                : "border-2 border-emerald-600"
              : "border border-slate-200 hover:border-slate-300";

            const iconClass = isSelected
              ? isAmber
                ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              : "bg-slate-100 text-slate-500 border border-slate-200/60";

            const radioClass = isSelected
              ? isAmber
                ? "bg-amber-500 text-white"
                : "bg-emerald-600 text-white"
              : "border-2 border-slate-300";

            return (
              <div
                key={item.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => setField("daysSincePurchase", item.days)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setField("daysSincePurchase", item.days);
                  }
                }}
                className={`group rounded-xl p-4 sm:p-5 cursor-pointer flex items-center justify-between gap-4 transition-all duration-150 focus-visible:outline-2 bg-white ${isAmber ? "focus-visible:outline-amber-500" : "focus-visible:outline-emerald-600"
                  } ${borderClass}`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${iconClass}`}
                  >
                    <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-sans font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                        {item.title}
                      </h4>
                      <span className="font-sans text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                        {item.badge}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div
                  aria-hidden="true"
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${radioClass}`}
                >
                  {isSelected && (
                    <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

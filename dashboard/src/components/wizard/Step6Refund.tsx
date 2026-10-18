"use client";

import React, { useState } from "react";
import { useWizard } from "./WizardContext";
import SlickSlider from "@/components/ui/SlickSlider";

interface PaymentOption {
  id: "CREDITO" | "DEBITO" | "APPLE_PAY" | "NUMERARIO" | "CARTAO_OFERTA" | "PAYPAL" | "AFTERPAY" | "INTERAC";
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
  canadaOnly?: boolean;
}

const PRICE_PRESETS = [
  { value: 39.99, label: "Outlet / Promoção" },
  { value: 69.50, label: "Peça em Saldo" },
  { value: 89.90, label: "Levi's 501 Original" },
  { value: 98.00, label: "PVP Padrão" },
  { value: 148.00, label: "Premium / Selvedge" },
];

const PAYMENT_METHODS: PaymentOption[] = [
  {
    id: "CREDITO",
    title: "Cartão de Crédito",
    subtitle: "Visa, Mastercard, Amex. Estorno tokenizado automático no terminal",
    badge: "Padrão POS",
    icon: "credit_card",
  },
  {
    id: "DEBITO",
    title: "Cartão de Débito",
    subtitle: "Débito bancário. Proibida emissão de numerário sem tentativa prévia no cartão",
    badge: "Débito",
    icon: "payments",
  },
  {
    id: "APPLE_PAY",
    title: "Apple Pay / Google Pay",
    subtitle: "Pagamento contactless tokenizado. Reembolso reverte para a conta associada",
    badge: "Contactless",
    icon: "contactless",
  },
  {
    id: "NUMERARIO",
    title: "Numerário (Cash)",
    subtitle: "Compra paga em dinheiro vivo na caixa. Reembolso direto em numerário",
    badge: "Caixa Físico",
    icon: "attach_money",
  },
  {
    id: "CARTAO_OFERTA",
    title: "Cartão de Oferta / Gift Card",
    subtitle: "Pago com saldo de vale ou gift card. Reembolso reverte para cartão de oferta",
    badge: "Gift Card",
    icon: "card_giftcard",
  },
  {
    id: "PAYPAL",
    title: "PayPal ou Venmo",
    subtitle: "Cliente deve aceder à aplicação para estorno; proibido substituir meio em loja",
    badge: "Fluxo App",
    icon: "account_balance_wallet",
  },
  {
    id: "AFTERPAY",
    title: "Afterpay (BNPL)",
    subtitle: "Pagamento parcelado. Reembolso restrito à plataforma Afterpay sem exceções",
    badge: "BNPL Estrito",
    icon: "shopping_bag",
  },
  {
    id: "INTERAC",
    title: "Interac (Canadá)",
    subtitle: "Rede de débito canadiana. Exige obrigatoriamente a presença do cartão físico",
    badge: "Canadá",
    icon: "local_atm",
    canadaOnly: true,
  },
];

export default function Step6Refund() {
  const { state, setField } = useWizard();

  const currencySymbol = state.currency === "CAD" ? "CAD $" : "USD $";
  const isCanada = state.marketJurisdiction === "CA";

  const [priceInput, setPriceInput] = useState<string>(
    typeof state.totalPrice === "number" ? state.totalPrice.toFixed(2) : ""
  );
  const [prevTotalPrice, setPrevTotalPrice] = useState<number | null>(state.totalPrice);

  if (state.totalPrice !== prevTotalPrice) {
    setPrevTotalPrice(state.totalPrice);
    setPriceInput(state.totalPrice !== null ? state.totalPrice.toFixed(2) : "");
  }

  // Filtrar meios: destacar ou permitir Interac se Canadá
  const availableMethods = PAYMENT_METHODS.filter(
    (m) => !m.canadaOnly || isCanada
  );

  const getAccountStateBadge = () => {
    switch (state.accountState) {
      case "ATIVA_CARTAO_PERDIDO":
        return "Cartão Perdido (Conta Ativa)";
      case "ENCERRADA":
        return "Conta Encerrada";
      case "ATIVA":
        return "Conta Ativa";
      default:
        return "";
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Banner Minimalista com Total a Devolver */}
      <div className="w-full rounded-xl p-4 sm:p-5 bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-sans font-bold text-slate-900 text-sm sm:text-base tracking-tight leading-snug">
                Pagamento Original &amp; Liquidação
              </h4>
              <span className="font-sans text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                Meio de Reembolso
              </span>
            </div>
            <p className="font-sans text-xs text-slate-500 mt-0.5 leading-relaxed">
              Indique os factos do talão original. Os motores deduzirão as regras de estorno e liquidação aplicáveis
            </p>

            {/* Pills de Seleção Rápida de Catálogo Levi's */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className="font-sans text-[11px] font-semibold text-slate-400 select-none mr-0.5">
                Presets:
              </span>
              {PRICE_PRESETS.map((preset) => {
                const isSelected = state.totalPrice !== null && Math.abs(state.totalPrice - preset.value) < 0.001;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      setField("totalPrice", preset.value);
                      setPriceInput(preset.value.toFixed(2));
                    }}
                    className={`font-sans inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-600 font-bold"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 hover:border-slate-300"
                    }`}
                    title={preset.label}
                  >
                    <span className="font-sans font-bold tabular-nums">${preset.value.toFixed(2)}</span>
                    <span className="font-sans text-[10px] text-slate-400 hidden sm:inline font-normal">
                      ({preset.label})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Input Badge Integrado */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-lg shrink-0 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <span className="font-sans text-xs font-semibold text-slate-500 select-none">Valor original:</span>
          <div className="flex items-center">
            <span className="font-sans tabular-nums text-base sm:text-lg font-black text-slate-900 tracking-tight mr-1 select-none">
              {currencySymbol}
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={priceInput}
              onChange={(e) => {
                const raw = e.target.value;
                setPriceInput(raw);
                const parsed = parseFloat(raw);
                if (!isNaN(parsed) && parsed >= 0) {
                  setField("totalPrice", parsed);
                } else if (raw === "") {
                  setField("totalPrice", null as unknown as number);
                }
              }}
              onBlur={() => {
                const parsed = parseFloat(priceInput);
                if (!isNaN(parsed) && parsed >= 0) {
                  setPriceInput(parsed.toFixed(2));
                  setField("totalPrice", parsed);
                } else if (state.totalPrice !== null) {
                  setPriceInput(state.totalPrice.toFixed(2));
                } else {
                  setPriceInput("");
                }
              }}
              className="font-sans tabular-nums w-20 sm:w-24 bg-transparent text-base sm:text-lg font-black text-slate-900 tracking-tight outline-none border-none p-0 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.00"
              aria-label="Valor original da transação"
            />
          </div>
        </div>
      </div>

      {/* 1. Meio de Pagamento Original da Compra */}
      <div className="w-full flex flex-col gap-3">
        {/* Typographic Section Header */}
        <div className="flex items-center gap-2 px-1">
          <span className="font-mono tabular-nums text-xs font-bold text-slate-400 select-none">01</span>
          <span className="text-slate-300">/</span>
          <h3 className="font-sans text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Meio de Pagamento Original no Talão
          </h3>
          {state.originalPaymentMethod ? (
            <span
              className={`font-sans inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold select-none ${
                state.originalPaymentMethod === "AFTERPAY" &&
                state.purchaseChannel === "ONLINE_BACKPOCKET" &&
                state.requestType === "TROCA"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : (state.originalPaymentMethod === "INTERAC" && state.physicalCardPresent === false) ||
                    (state.originalPaymentMethod === "PAYPAL" && state.paymentAppAccessible === false)
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              }`}
            >
              <span className="material-symbols-outlined text-[13px] font-bold">check</span>
              {PAYMENT_METHODS.find((m) => m.id === state.originalPaymentMethod)?.title || "Definido"}
            </span>
          ) : (
            <span className="font-sans inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Obrigatório
            </span>
          )}
        </div>

        {/* Minimalist Cards Grid em 2 colunas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {availableMethods.map((item) => {
            const isSelected = state.originalPaymentMethod === item.id;
            const isAfterpayBlocked =
              item.id === "AFTERPAY" &&
              state.purchaseChannel === "ONLINE_BACKPOCKET" &&
              state.requestType === "TROCA";
            const isInteracWarning =
              item.id === "INTERAC" && state.physicalCardPresent === false;
            const isPaypalWarning =
              item.id === "PAYPAL" && state.paymentAppAccessible === false;

            const badgeText = isAfterpayBlocked ? "Exceção Proibida" : item.badge;
            const badgeClassName = isAfterpayBlocked
              ? "font-sans text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded shrink-0"
              : isSelected && (isInteracWarning || isPaypalWarning)
              ? "font-sans text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded shrink-0"
              : "font-sans text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0";

            const borderClassName = isSelected
              ? isAfterpayBlocked
                ? "border-2 border-rose-500"
                : isInteracWarning || isPaypalWarning
                ? "border-2 border-amber-500"
                : "border-2 border-emerald-600"
              : isAfterpayBlocked
              ? "border border-rose-200 hover:border-rose-300"
              : "border border-slate-200 hover:border-slate-300";

            const iconClassName = isSelected
              ? isAfterpayBlocked
                ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                : isInteracWarning || isPaypalWarning
                ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              : "bg-slate-100 text-slate-500 border border-slate-200/60";

            const radioClassName = isSelected
              ? isAfterpayBlocked
                ? "bg-rose-500 text-white"
                : isInteracWarning || isPaypalWarning
                ? "bg-amber-500 text-white"
                : "bg-emerald-600 text-white"
              : "border-2 border-slate-300";

            return (
              <div
                key={item.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => setField("originalPaymentMethod", item.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setField("originalPaymentMethod", item.id);
                  }
                }}
                className={`group rounded-xl p-4 sm:p-5 cursor-pointer flex items-center justify-between gap-4 transition-all duration-150 focus-visible:outline-2 bg-white ${
                  isAfterpayBlocked && isSelected
                    ? "focus-visible:outline-rose-500"
                    : isSelected && (isInteracWarning || isPaypalWarning)
                    ? "focus-visible:outline-amber-500"
                    : "focus-visible:outline-emerald-600"
                } ${borderClassName}`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${iconClassName}`}>
                    <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-sans font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                        {item.title}
                      </h4>
                      <span className={badgeClassName}>
                        {badgeText}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div
                  aria-hidden="true"
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${radioClassName}`}
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

      {/* 2. Estado da Conta e do Cartão */}
      <div className="w-full flex flex-col gap-3">
        {/* Typographic Section Header */}
        <div className="flex items-center gap-2 px-1">
          <span className="font-mono tabular-nums text-xs font-bold text-slate-400 select-none">02</span>
          <span className="text-slate-300">/</span>
          <h3 className="font-sans text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Estado da Conta e Cartão do Cliente
          </h3>
          {state.accountState ? (
            <span
              className={`font-sans inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold select-none ${
                state.accountState === "ENCERRADA"
                  ? "bg-amber-50 text-amber-700 border border-amber-200/80"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              }`}
            >
              <span className="material-symbols-outlined text-[13px] font-bold">check</span>
              {getAccountStateBadge()}
            </span>
          ) : (
            <span className="font-sans inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Obrigatório
            </span>
          )}
        </div>

        {/* Minimalist Cards Grid em 2 colunas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Card: Conta Ativa / Normal */}
          <div
            role="radio"
            aria-checked={state.accountState === "ATIVA"}
            tabIndex={0}
            onClick={() => setField("accountState", "ATIVA")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setField("accountState", "ATIVA");
              }
            }}
            className={`group rounded-xl p-4 sm:p-5 cursor-pointer flex items-center justify-between gap-4 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-emerald-600 bg-white ${
              state.accountState === "ATIVA"
                ? "border-2 border-emerald-600"
                : "border border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  state.accountState === "ATIVA"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    : "bg-slate-100 text-slate-500 border border-slate-200/60"
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">verified</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-sans font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                    Conta Ativa / Regular
                  </h4>
                  <span className="font-sans text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                    Tokenizado
                  </span>
                </div>
                <p className="font-sans text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Cartão ou conta operacional. Estorno tokenizado direto sem pedir cartão
                </p>
              </div>
            </div>

            <div
              aria-hidden="true"
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                state.accountState === "ATIVA"
                  ? "bg-emerald-600 text-white"
                  : "border-2 border-slate-300"
              }`}
            >
              {state.accountState === "ATIVA" && (
                <span className="material-symbols-outlined text-[13px] font-bold">check</span>
              )}
            </div>
          </div>

          {/* Card: Cartão Perdido ou Roubado */}
          <div
            role="radio"
            aria-checked={state.accountState === "ATIVA_CARTAO_PERDIDO"}
            tabIndex={0}
            onClick={() => setField("accountState", "ATIVA_CARTAO_PERDIDO")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setField("accountState", "ATIVA_CARTAO_PERDIDO");
              }
            }}
            className={`group rounded-xl p-4 sm:p-5 cursor-pointer flex items-center justify-between gap-4 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-emerald-600 bg-white ${
              state.accountState === "ATIVA_CARTAO_PERDIDO"
                ? "border-2 border-emerald-600"
                : "border border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  state.accountState === "ATIVA_CARTAO_PERDIDO"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    : "bg-slate-100 text-slate-500 border border-slate-200/60"
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">credit_card_off</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-sans font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                    Cartão Perdido / Roubado
                  </h4>
                  <span className="font-sans text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                    Token Ativo
                  </span>
                </div>
                <p className="font-sans text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Cartão físico cancelado, mas a conta bancária subjacente continua ativa
                </p>
              </div>
            </div>

            <div
              aria-hidden="true"
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                state.accountState === "ATIVA_CARTAO_PERDIDO"
                  ? "bg-emerald-600 text-white"
                  : "border-2 border-slate-300"
              }`}
            >
              {state.accountState === "ATIVA_CARTAO_PERDIDO" && (
                <span className="material-symbols-outlined text-[13px] font-bold">check</span>
              )}
            </div>
          </div>

          {/* Card: Conta Encerrada */}
          <div
            role="radio"
            aria-checked={state.accountState === "ENCERRADA"}
            tabIndex={0}
            onClick={() => setField("accountState", "ENCERRADA")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setField("accountState", "ENCERRADA");
              }
            }}
            className={`group rounded-xl p-4 sm:p-5 cursor-pointer flex items-center justify-between gap-4 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-emerald-600 sm:col-span-2 bg-white ${
              state.accountState === "ENCERRADA"
                ? "border-2 border-amber-500"
                : "border border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  state.accountState === "ENCERRADA"
                    ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                    : "bg-slate-100 text-slate-500 border border-slate-200/60"
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">domain_disabled</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-sans font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                    Conta Bancária Encerrada
                  </h4>
                  <span className="font-sans text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded shrink-0">
                    Conta Encerrada
                  </span>
                </div>
                <p className="font-sans text-xs text-slate-500 mt-0.5 leading-relaxed">
                  O cliente encerrou a conta bancária. Tentar primeiro o cartão original; só após recusa o motor autoriza meio alternativo
                </p>
              </div>
            </div>

            <div
              aria-hidden="true"
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                state.accountState === "ENCERRADA"
                  ? "bg-amber-500 text-white"
                  : "border-2 border-slate-300"
              }`}
            >
              {state.accountState === "ENCERRADA" && (
                <span className="material-symbols-outlined text-[13px] font-bold">check</span>
              )}
            </div>
          </div>
        </div>

        {/* Sub-condição interativa: Tentativa recusada quando conta encerrada */}
        {state.accountState === "ENCERRADA" && (
          <div className="rounded-xl p-4 sm:p-5 bg-white border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-150 mt-1">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">sync_problem</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-sans font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                    A tentativa no terminal POS já foi recusada pelo banco?
                  </h4>
                  {state.originalRefundRefused === true ? (
                    <span className="font-sans text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                      Recusa Confirmada
                    </span>
                  ) : state.originalRefundRefused === false ? (
                    <span className="font-sans text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full shrink-0">
                      Não Recusada
                    </span>
                  ) : (
                    <span className="font-sans inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shrink-0 select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Obrigatório
                    </span>
                  )}
                </div>
                <p className="font-sans text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Se o terminal acusar recusa de estorno na conta encerrada, o motor autoriza meio alternativo (numerário, vale ou outro cartão)
                </p>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <SlickSlider
                options={[
                  { label: "Não Recusada", value: false, tone: "info", icon: "pending" },
                  { label: "Sim, Recusada", value: true, tone: "danger", icon: "cancel" },
                ]}
                value={state.originalRefundRefused}
                onChange={(val) => setField("originalRefundRefused", val)}
                ariaLabel="Tentativa de estorno recusada"
                width="w-full sm:w-[220px]"
              />
            </div>
          </div>
        )}

        {/* Sub-condição interativa: Cartão Interac presente quando meio for Interac */}
        {state.originalPaymentMethod === "INTERAC" && (
          <div className="rounded-xl p-4 sm:p-5 bg-white border border-indigo-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-150 mt-1">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">credit_card</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-sans font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                    O cartão físico Interac original está presente em loja?
                  </h4>
                  {state.physicalCardPresent === true ? (
                    <span className="font-sans text-[11px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full shrink-0">
                      Cartão Presente
                    </span>
                  ) : state.physicalCardPresent === false ? (
                    <span className="font-sans text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full shrink-0">
                      Sem Cartão
                    </span>
                  ) : (
                    <span className="font-sans inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shrink-0 select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Obrigatório
                    </span>
                  )}
                </div>
                <p className="font-sans text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Os terminais Interac canadianos não suportam tokenização. Sem o cartão físico, o pedido exige revisão sénior
                </p>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <SlickSlider
                options={[
                  { label: "Sem Cartão", value: false, tone: "danger", icon: "close" },
                  { label: "Cartão Presente", value: true, tone: "success", icon: "check" },
                ]}
                value={state.physicalCardPresent}
                onChange={(val) => setField("physicalCardPresent", val)}
                ariaLabel="Cartão Interac presente"
                width="w-full sm:w-[220px]"
              />
            </div>
          </div>
        )}

        {/* Sub-condição interativa: Validação na app PayPal/Venmo quando meio for PayPal */}
        {state.originalPaymentMethod === "PAYPAL" && (
          <div className="rounded-xl p-4 sm:p-5 bg-white border border-sky-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-150 mt-1">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">smartphone</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-sans font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                    O cliente consegue aceder à aplicação no smartphone?
                  </h4>
                  {state.paymentAppAccessible === true ? (
                    <span className="font-sans text-[11px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full shrink-0">
                      Acesso Confirmado
                    </span>
                  ) : state.paymentAppAccessible === false ? (
                    <span className="font-sans text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full shrink-0">
                      Sem Acesso
                    </span>
                  ) : (
                    <span className="font-sans inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shrink-0 select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Obrigatório
                    </span>
                  )}
                </div>
                <p className="font-sans text-xs text-slate-600 mt-0.5 leading-relaxed">
                  O estorno PayPal/Venmo exige validação na app do cliente. Sem acesso, o pedido requer revisão sénior.
                </p>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <SlickSlider
                options={[
                  { label: "Sem Acesso", value: false, tone: "danger", icon: "close" },
                  { label: "Acesso Confirmado", value: true, tone: "success", icon: "check" },
                ]}
                value={state.paymentAppAccessible}
                onChange={(val) => setField("paymentAppAccessible", val)}
                ariaLabel="Acesso à aplicação PayPal"
                width="w-full sm:w-[220px]"
              />
            </div>
          </div>
        )}

        {/* Sub-condição de Paragem Obrigatória: Afterpay Online com Pedido de Troca */}
        {state.originalPaymentMethod === "AFTERPAY" &&
          state.purchaseChannel === "ONLINE_BACKPOCKET" &&
          state.requestType === "TROCA" && (
            <div className="rounded-xl p-4 sm:p-5 bg-white border border-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-150 mt-1">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">block</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-sans font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                      Troca em Loja Não Permitida para Afterpay Online
                    </h4>
                    <span className="font-sans text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full shrink-0">
                      Exceção Proibida
                    </span>
                  </div>
                  <p className="font-sans text-xs text-slate-600 mt-0.5 leading-relaxed">
                    As exceções ao meio de pagamento Afterpay são proibidas para compras online. O reembolso deve ser efetuado exclusivamente no método original via BackPocket.
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

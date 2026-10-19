"use client";

import React from "react";
import { useWizard } from "./WizardContext";
import { useLocale } from "@/contexts/LocaleContext";
import SlickSlider from "@/components/ui/SlickSlider";

interface PhysicalConditionItem {
  id: "NOVO_ETIQUETAS" | "NOVO_ETIQUETAS_SOLTAS" | "NOVO_SEM_ETIQUETAS" | "USADO" | "LAVADO" | "MANCHADO";
  title: string;
  subtitle: string;
  badge: string;
  icon: string;
}

const PHYSICAL_CONDITIONS_PT: PhysicalConditionItem[] = [
  {
    id: "NOVO_ETIQUETAS",
    title: "Não usado, intacto",
    subtitle: "Em perfeito estado de loja, com etiquetas presas",
    badge: "Perfeito",
    icon: "new_releases",
  },
  {
    id: "NOVO_ETIQUETAS_SOLTAS",
    title: "Não usado, etiquetas soltas",
    subtitle: "Sem uso evidente, etiquetas entregues à mão",
    badge: "Soltas",
    icon: "label",
  },
  {
    id: "NOVO_SEM_ETIQUETAS",
    title: "Não usado, sem etiquetas",
    subtitle: "Sem sinais de uso, etiquetas ausentes",
    badge: "Sem etiquetas",
    icon: "label_off",
  },
  {
    id: "USADO",
    title: "Claramente usado",
    subtitle: "Sinais de uso pessoal prolongado ou vincos",
    badge: "Usado",
    icon: "checkroom",
  },
  {
    id: "LAVADO",
    title: "Peça lavada",
    subtitle: "Lavagem detetada ou cheiro a amaciador",
    badge: "Lavado",
    icon: "local_laundry_service",
  },
  {
    id: "MANCHADO",
    title: "Sujo ou danificado",
    subtitle: "Manchas, odores a tabaco ou marcas irreversíveis",
    badge: "Inapto",
    icon: "warning",
  },
];

const PHYSICAL_CONDITIONS_EN: PhysicalConditionItem[] = [
  {
    id: "NOVO_ETIQUETAS",
    title: "Unworn, intact",
    subtitle: "In mint store condition, with attached tags",
    badge: "Mint",
    icon: "new_releases",
  },
  {
    id: "NOVO_ETIQUETAS_SOLTAS",
    title: "Unworn, loose tags",
    subtitle: "No visible wear, tags handed in loose",
    badge: "Loose tags",
    icon: "label",
  },
  {
    id: "NOVO_SEM_ETIQUETAS",
    title: "Unworn, no tags",
    subtitle: "No visible wear, tags missing",
    badge: "No tags",
    icon: "label_off",
  },
  {
    id: "USADO",
    title: "Clearly worn",
    subtitle: "Evidence of prolonged personal wear or heavy creasing",
    badge: "Worn",
    icon: "checkroom",
  },
  {
    id: "LAVADO",
    title: "Laundered item",
    subtitle: "Washing detected or detergent / fabric softener scent",
    badge: "Laundered",
    icon: "local_laundry_service",
  },
  {
    id: "MANCHADO",
    title: "Soiled or damaged",
    subtitle: "Stains, tobacco odors, or irreversible damage",
    badge: "Unacceptable",
    icon: "warning",
  },
];

export default function Step3ProductEligibility() {
  const { state, setField } = useWizard();
  const { locale } = useLocale();

  const isEn = locale === "en";
  const physicalConditions = isEn ? PHYSICAL_CONDITIONS_EN : PHYSICAL_CONDITIONS_PT;

  // Regras de Paragem Obrigatória (HS-001, HS-002, HS-003 do RPAC)
  const isBarcodeBlocked = state.barcodeRecognized === false;
  const isBarcodeApproved = state.barcodeRecognized === true;

  const isBrandBlocked = state.brandAllowed === false;
  const isBrandApproved = state.brandAllowed === true;

  const isAlteredBlocked = state.alteredOrHemmed === true;
  const isAlteredApproved = state.alteredOrHemmed === false;

  const hasHardStop = isBarcodeBlocked || isBrandBlocked || isAlteredBlocked;
  const isInitialSectionComplete =
    state.barcodeRecognized !== null &&
    state.brandAllowed !== null &&
    state.alteredOrHemmed !== null;

  const isResellApplicable =
    state.physicalCondition === "NOVO_ETIQUETAS_SOLTAS" ||
    state.physicalCondition === "NOVO_SEM_ETIQUETAS";

  const handleSelectCondition = (condId: PhysicalConditionItem["id"]) => {
    setField("physicalCondition", condId);
    if (condId !== "NOVO_ETIQUETAS_SOLTAS" && condId !== "NOVO_SEM_ETIQUETAS") {
      setField("readyToResell", null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Validação Inicial da Peça */}
      <div className="w-full flex flex-col gap-3">
        {/* Typographic Section Header */}
        <div className="flex items-center gap-2 px-1">
          <span className="font-mono tabular-nums text-xs font-bold text-slate-400 select-none">01</span>
          <span className="text-slate-300">/</span>
          <h3 className="font-sans text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {isEn ? "Initial Item Eligibility" : "Validação Inicial da Peça"}
          </h3>
          {hasHardStop ? (
            <span className="font-sans inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              {isEn ? "Hard Stop / Refusal" : "Recusa Obrigatória"}
            </span>
          ) : isInitialSectionComplete ? (
            <span className="font-sans inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 select-none">
              <span className="material-symbols-outlined text-[13px] font-bold">check</span>
              {isEn ? "Validated" : "Validado"}
            </span>
          ) : (
            <span className="font-sans inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {isEn ? "Required" : "Obrigatório"}
            </span>
          )}
        </div>

        {/* Minimalist Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Card: Código de barras */}
          <div
            className={`rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 bg-white ${isBarcodeBlocked
                ? "border-2 border-rose-500"
                : "border border-slate-200 hover:border-slate-300"
              }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isBarcodeBlocked
                    ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                    : isBarcodeApproved
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                      : "bg-slate-100 text-slate-500 border border-slate-200/60"
                  }`}
              >
                <span className="material-symbols-outlined text-[22px]">barcode_scanner</span>
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="font-sans font-bold text-slate-900 text-sm sm:text-base tracking-tight leading-snug">
                  {isEn ? "Barcode recognized in system?" : "Código de barras reconhecido?"}
                </h4>
                <p className="font-sans text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {isEn ? "Scanned or entered manually at POS terminal" : "Lido com leitor ótico ou código manual no POS"}
                </p>
              </div>
            </div>
            <SlickSlider
              options={[
                { label: isEn ? "Yes" : "Sim", value: true, tone: "success", icon: "check" },
                { label: isEn ? "No" : "Não", value: false, tone: "danger", icon: "close" },
              ]}
              value={state.barcodeRecognized}
              onChange={(val) => setField("barcodeRecognized", val)}
              ariaLabel={isEn ? "Barcode recognized" : "Código de barras reconhecido"}
              width="w-full sm:w-[192px]"
            />
          </div>

          {/* Card: Marca permitida */}
          <div
            className={`rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 bg-white ${isBrandBlocked
                ? "border-2 border-rose-500"
                : "border border-slate-200 hover:border-slate-300"
              }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isBrandBlocked
                    ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                    : isBrandApproved
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                      : "bg-slate-100 text-slate-500 border border-slate-200/60"
                  }`}
              >
                <span className="material-symbols-outlined text-[22px]">verified</span>
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="font-sans font-bold text-slate-900 text-sm sm:text-base tracking-tight leading-snug">
                  {isEn ? "Brand allowed in this store?" : "Marca permitida na loja?"}
                </h4>
                <p className="font-sans text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {isEn ? "Genuine Levi Strauss & Co. brand family" : "Peça genuína do grupo Levi Strauss & Co."}
                </p>
              </div>
            </div>
            <SlickSlider
              options={[
                { label: isEn ? "Yes" : "Sim", value: true, tone: "success", icon: "check" },
                { label: isEn ? "No" : "Não", value: false, tone: "danger", icon: "close" },
              ]}
              value={state.brandAllowed}
              onChange={(val) => setField("brandAllowed", val)}
              ariaLabel={isEn ? "Brand allowed in this store" : "Marca permitida na loja"}
              width="w-full sm:w-[192px]"
            />
          </div>

          {/* Card: Bainhas ou alterações */}
          <div
            className={`rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 bg-white ${isAlteredBlocked
                ? "border-2 border-rose-500"
                : "border border-slate-200 hover:border-slate-300"
              }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isAlteredBlocked
                    ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                    : isAlteredApproved
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                      : "bg-slate-100 text-slate-500 border border-slate-200/60"
                  }`}
              >
                <span className="material-symbols-outlined text-[22px]">content_cut</span>
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="font-sans font-bold text-slate-900 text-sm sm:text-base tracking-tight leading-snug">
                  {isEn ? "Hemmed or altered item?" : "Peça com bainhas ou alterações?"}
                </h4>
                <p className="font-sans text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {isEn ? "Cut, tailored, or customized post-purchase" : "Corte ou costura modificada pelo alfaiate"}
                </p>
              </div>
            </div>
            <SlickSlider
              options={[
                { label: isEn ? "Original" : "Original", value: false, tone: "success", icon: "check" },
                { label: isEn ? "Altered" : "Alterada", value: true, tone: "danger", icon: "content_cut" },
              ]}
              value={state.alteredOrHemmed}
              onChange={(val) => setField("alteredOrHemmed", val)}
              ariaLabel={isEn ? "Hemmed or altered item" : "Peça com bainhas ou alterações"}
              width="w-full sm:w-[204px]"
            />
          </div>

          {/* Card: Roupa interior ou íntima */}
          <div
            className={`rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 bg-white ${state.intimateUnderwear
                ? "border-2 border-indigo-500"
                : "border border-slate-200 hover:border-slate-300"
              }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${state.intimateUnderwear
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                    : state.intimateUnderwear === false
                      ? "bg-slate-100 text-slate-700 border border-slate-200/60"
                      : "bg-slate-100 text-slate-500 border border-slate-200/60"
                  }`}
              >
                <span className="material-symbols-outlined text-[22px]">apparel</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-sans font-bold text-slate-900 text-sm sm:text-base tracking-tight leading-snug">
                    {isEn ? "Intimate apparel or underwear?" : "Roupa interior ou íntima?"}
                  </h4>
                  <span className="font-sans inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200/80 select-none shrink-0">
                    {isEn ? "Optional" : "Opcional"}
                  </span>
                </div>
                <p className="font-sans text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {isEn ? "Boxers, socks, swimwear, or hygiene-regulated goods" : "Boxers, meias ou artigos sujeitos a higiene"}
                </p>
              </div>
            </div>
            <SlickSlider
              options={[
                { label: isEn ? "Normal" : "Normal", value: false, tone: "success", icon: "check" },
                { label: isEn ? "Intimate" : "Íntima", value: true, tone: "info", icon: "apparel" },
              ]}
              value={state.intimateUnderwear}
              onChange={(val) => setField("intimateUnderwear", val)}
              ariaLabel={isEn ? "Intimate apparel or underwear" : "Roupa interior ou íntima"}
              width="w-full sm:w-[192px]"
            />
          </div>

          {/* Card: Defeito de fabrico visível */}
          <div
            className={`rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 sm:col-span-2 bg-white ${state.manufacturingDefect
                ? "border-2 border-amber-500"
                : "border border-slate-200 hover:border-slate-300"
              }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${state.manufacturingDefect
                    ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                    : state.manufacturingDefect === false
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                      : "bg-slate-100 text-slate-500 border border-slate-200/60"
                  }`}
              >
                <span className="material-symbols-outlined text-[22px]">report_problem</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-sans font-bold text-slate-900 text-sm sm:text-base tracking-tight leading-snug">
                    {isEn ? "Visible manufacturing defect?" : "Tem defeito de fabrico visível?"}
                  </h4>
                  <span className="font-sans inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200/80 select-none shrink-0">
                    {isEn ? "Optional" : "Opcional"}
                  </span>
                </div>
                <p className="font-sans text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {isEn ? "Unraveled factory seams, missing rivets, or confirmed workmanship defect" : "Costuras desfeitas na fábrica, rebites ausentes ou defeito comprovado"}
                </p>
              </div>
            </div>
            <SlickSlider
              options={[
                { label: isEn ? "No defect" : "Sem defeito", value: false, tone: "success", icon: "check" },
                { label: isEn ? "Confirmed defect" : "Defeito confirmado", value: true, tone: "warning", icon: "report_problem" },
              ]}
              value={state.manufacturingDefect}
              onChange={(val) => setField("manufacturingDefect", val)}
              ariaLabel={isEn ? "Visible manufacturing defect" : "Tem defeito de fabrico visível"}
              width="w-full sm:w-[264px]"
            />
          </div>
        </div>
      </div>

      {/* 2. Estado Físico da Peça */}
      <div className="w-full flex flex-col gap-3">
        {/* Typographic Section Header */}
        <div className="flex items-center gap-2 px-1">
          <span className="font-mono tabular-nums text-xs font-bold text-slate-400 select-none">02</span>
          <span className="text-slate-300">/</span>
          <h3 className="font-sans text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {isEn ? "Physical Condition of the Item" : "Estado Físico da Peça"}
          </h3>
          {state.physicalCondition ? (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {physicalConditions.map((cond) => {
            const isSelected = state.physicalCondition === cond.id;
            const isRedCondition = cond.id === "LAVADO" || cond.id === "MANCHADO";
            const isAmberCondition = cond.id === "USADO" || cond.id === "NOVO_SEM_ETIQUETAS";

            return (
              <div
                key={cond.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => handleSelectCondition(cond.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectCondition(cond.id);
                  }
                }}
                className={`group rounded-xl p-4 sm:p-4.5 cursor-pointer flex items-center justify-between gap-3.5 transition-all duration-150 focus-visible:outline-2 bg-white ${isSelected
                    ? isRedCondition
                      ? "border-2 border-rose-500 focus-visible:outline-rose-500"
                      : isAmberCondition
                        ? "border-2 border-amber-500 focus-visible:outline-amber-500"
                        : "border-2 border-emerald-600 focus-visible:outline-emerald-600"
                    : "border border-slate-200 hover:border-slate-300 focus-visible:outline-emerald-600"
                  }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isSelected
                        ? isRedCondition
                          ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                          : isAmberCondition
                            ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        : "bg-slate-100 text-slate-500 border border-slate-200/60"
                      }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">{cond.icon}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-sans font-bold text-slate-900 text-sm tracking-tight leading-snug">
                        {cond.title}
                      </h4>
                      <span className="font-sans text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                        {cond.badge}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {cond.subtitle}
                    </p>
                  </div>
                </div>

                <div
                  aria-hidden="true"
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${isSelected
                      ? isRedCondition
                        ? "bg-rose-600 text-white"
                        : isAmberCondition
                          ? "bg-amber-500 text-white"
                          : "bg-emerald-600 text-white"
                      : "border-2 border-slate-300"
                    }`}
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

      {/* 3. Possibilidade de Revenda (apenas aplicável quando sem etiqueta ou com etiquetas soltas) */}
      {isResellApplicable && (
        <div className="w-full flex flex-col gap-3">
          {/* Typographic Section Header */}
          <div className="flex items-center gap-2 px-1">
            <span className="font-mono tabular-nums text-xs font-bold text-slate-400 select-none">
              03
            </span>
            <span className="text-slate-300">/</span>
            <h3 className="font-sans text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              {isEn ? "Resale Eligibility" : "Possibilidade de Revenda"}
            </h3>
            {state.readyToResell !== null ? (
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

          {/* Card da pergunta de revenda */}
          <div
            className={`rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 bg-white ${state.readyToResell === false
                ? "border-2 border-amber-500"
                : state.readyToResell === true
                  ? "border-2 border-emerald-600"
                  : "border border-slate-200 hover:border-slate-300"
              }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${state.readyToResell === true
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    : state.readyToResell === false
                      ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                      : "bg-slate-100 text-slate-500 border border-slate-200/60"
                  }`}
              >
                <span className="material-symbols-outlined text-[22px]">store</span>
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="font-sans font-bold text-slate-900 text-sm sm:text-base tracking-tight leading-snug">
                  {isEn ? "Can item be verified, retagged, and resold?" : "O artigo pode ser verificado, reetiquetado e revendido?"}
                </h4>
                <p className="font-sans text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {isEn ? "Clean, odorless, and suitable to return to store racks" : "Peça limpa, sem cheiros e apta para voltar ao expositor da loja"}
                </p>
              </div>
            </div>
            <SlickSlider
              options={[
                { label: isEn ? "Yes" : "Sim", value: true, tone: "success", icon: "check" },
                { label: isEn ? "No" : "Não", value: false, tone: "warning", icon: "warning" },
              ]}
              value={state.readyToResell}
              onChange={(val) => setField("readyToResell", val)}
              ariaLabel={isEn ? "Can item be verified, retagged, and resold" : "O artigo pode ser verificado, reetiquetado e revendido"}
              width="w-full sm:w-[192px]"
            />
          </div>
        </div>
      )}
    </div>
  );
}

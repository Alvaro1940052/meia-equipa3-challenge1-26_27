"use client";

import React from "react";
import { useLocale } from "@/contexts/LocaleContext";

export interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PolicyModal({ isOpen, onClose }: PolicyModalProps) {
  const { locale } = useLocale();
  const isEn = locale === "en";

  if (!isOpen) return null;

  const policiesPt = [
    {
      title: "Prazo de Devolução Standard (30 Dias)",
      tag: "Regra Fundamental",
      desc: "Devoluções completas ou trocas de artigos adquiridos em loja física ou online são aceites até 30 dias contados a partir da data de compra ou receção da encomenda.",
      icon: "calendar_month",
      badgeColor: "bg-emerald-600 text-white",
    },
    {
      title: "Estado Original e Etiquetas de Fábrica",
      tag: "Condição Física",
      desc: "Os artigos não podem ter sido usados, lavados ou alterados (ex: bainhas encurtadas). As etiquetas de fábrica e o código de barras de inventário devem estar intactos.",
      icon: "sell",
      badgeColor: "bg-slate-200 text-slate-800",
    },
    {
      title: "Higiene em Vestuário Íntimo",
      tag: "Norma Sanitária",
      desc: "Boxers, roupa interior e fatos de banho só são elegíveis para devolução se a embalagem selada original se mantiver intacta e com o selo higiénico inviolado.",
      icon: "health_and_safety",
      badgeColor: "bg-indigo-100 text-indigo-900",
    },
    {
      title: "Comprovativo Digital ou em Nuvem",
      tag: "Novidade Março 2025",
      desc: "Não é exigido talão em papel físico. Comprovativos obtidos via Levi's 247 App, BackPocket ou e-mail com QR code são validados de forma imediata no POS.",
      icon: "qr_code_scanner",
      badgeColor: "bg-sky-100 text-sky-900",
    },
    {
      title: "Trocas entre Mainline e Outlet",
      tag: "Inter-loja",
      desc: "Artigos adquiridos em loja Mainline podem ser trocados em Outlet pelo valor atual de sistema. Artigos exclusivos de Outlet Factory Store mantêm políticas próprias de clearance.",
      icon: "storefront",
      badgeColor: "bg-slate-200 text-slate-800",
    },
  ];

  const policiesEn = [
    {
      title: "Standard Return Window (30 Days)",
      tag: "Core Rule",
      desc: "Full refunds or exchanges for physical or online purchases are accepted up to 30 days from purchase or delivery date.",
      icon: "calendar_month",
      badgeColor: "bg-emerald-600 text-white",
    },
    {
      title: "Original Condition & Factory Tags",
      tag: "Physical Condition",
      desc: "Items must not be worn, laundered, or altered (e.g. hemmed). Factory tags and inventory barcode must be intact.",
      icon: "sell",
      badgeColor: "bg-slate-200 text-slate-800",
    },
    {
      title: "Intimate Apparel Hygiene",
      tag: "Sanitary Rule",
      desc: "Boxers, underwear, and swimwear are eligible only if the original packaging remains sealed with intact hygiene seal.",
      icon: "health_and_safety",
      badgeColor: "bg-indigo-100 text-indigo-900",
    },
    {
      title: "Digital Proof of Purchase",
      tag: "March 2025 Update",
      desc: "Physical paper receipt is optional. Receipts from Levi's 247 App, BackPocket, or QR email are verified immediately at POS.",
      icon: "qr_code_scanner",
      badgeColor: "bg-sky-100 text-sky-900",
    },
    {
      title: "Exchanges Across Mainline and Outlet",
      tag: "Cross-store",
      desc: "Items purchased in Mainline stores can be exchanged at Outlets at current system value. Outlet factory items follow clearance rules.",
      icon: "storefront",
      badgeColor: "bg-slate-200 text-slate-800",
    },
  ];

  const policies = isEn ? policiesEn : policiesPt;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn"
    >
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">menu_book</span>
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                {isEn ? "Current Policies • March 2025 Edition" : "Políticas Vigentes • Edição Março 2025"}
              </span>
              <h3
                id="policy-modal-title"
                className="font-sans text-slate-900 text-xl md:text-2xl font-bold"
              >
                {isEn ? "Counter Returns Quick Manual" : "Manual Rápido de Balcão e Devoluções"}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isEn ? "Close policy modal" : "Fechar modal de políticas"}
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Policy list */}
        <div className="flex flex-col gap-3">
          {policies.map((p, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4 font-sans"
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-xs border border-slate-200 flex-shrink-0">
                <span className="material-symbols-outlined text-[22px]">{p.icon}</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-sans text-sm text-slate-900 font-bold">
                    {p.title}
                  </h4>
                  <span
                    className={`font-sans px-2.5 py-0.5 rounded-full text-[11px] font-bold ${p.badgeColor}`}
                  >
                    {p.tag}
                  </span>
                </div>
                <p className="font-sans text-slate-600 text-xs leading-relaxed">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-200 font-sans">
          <span className="font-sans text-xs text-slate-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
            {isEn
              ? "Rules synchronized with Drools 8 & Prolog 9 engines"
              : "Regras sincronizadas com motores Drools 8 & Prolog 9"}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="font-sans px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            {isEn ? "Understood" : "Compreendido"}
          </button>
        </div>
      </div>
    </div>
  );
}

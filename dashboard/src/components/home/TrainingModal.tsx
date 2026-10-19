"use client";

import React from "react";
import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";

export interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrainingModal({ isOpen, onClose }: TrainingModalProps) {
  const { locale } = useLocale();
  const isEn = locale === "en";

  if (!isOpen) return null;

  const scenariosPt = [
    {
      title: "Devolução Standard 501® (Aprovação)",
      desc: "Cliente apresenta jeans com 14 dias de compra, etiqueta afixada e recibo em papel perfeitamente legível.",
      icon: "check_circle",
      color: "text-emerald-600",
      badge: "Iniciação N1",
    },
    {
      title: "Peça com Bainha Feita (Recusa Justificada)",
      desc: "Cliente solicitou alteração de comprimento de perna e pretende agora devolver por ter mudado de ideias.",
      icon: "content_cut",
      color: "text-rose-600",
      badge: "Exceções",
    },
    {
      title: "Encomenda Web Levi.com com Troca no Balcão",
      desc: "Compra online sem papel físico. Cliente apresenta apenas o e-mail de expedição e quer trocar tamanho.",
      icon: "devices",
      color: "text-sky-600",
      badge: "Omnicanal",
    },
  ];

  const scenariosEn = [
    {
      title: "Standard 501® Return (Approval)",
      desc: "Customer presents jeans 14 days after purchase, attached tags, and legible paper receipt.",
      icon: "check_circle",
      color: "text-emerald-600",
      badge: "Beginner L1",
    },
    {
      title: "Hemmed Item (Justified Refusal)",
      desc: "Customer had legs altered or hemmed and now requests refund after changing mind.",
      icon: "content_cut",
      color: "text-rose-600",
      badge: "Exceptions",
    },
    {
      title: "Levi.com Web Order Exchanged at Register",
      desc: "Online purchase with no paper slip. Customer presents shipping email and requests size exchange.",
      icon: "devices",
      color: "text-sky-600",
      badge: "Omnichannel",
    },
  ];

  const scenarios = isEn ? scenariosEn : scenariosPt;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="training-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">school</span>
            </div>
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                {isEn ? "Learning Environment" : "Ambiente Pedagógico"}
              </span>
              <h3
                id="training-modal-title"
                className="font-sans text-slate-900 text-lg md:text-xl font-bold"
              >
                {isEn ? "Simulate Training Scenario" : "Simular Cenário de Treino"}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isEn ? "Close modal" : "Fechar modal"}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="font-sans text-slate-600 text-xs md:text-sm">
          {isEn
            ? "Training mode allows practice of counter flows and rule engines without affecting real register totals or physical store inventory."
            : "O modo de treino permite exercitar os fluxos de balcão e os motores de decisão formal sem registar movimentos na caixa real ou alterar o inventário físico."}
        </p>

        {/* Scenarios */}
        <div className="flex flex-col gap-2.5">
          {scenarios.map((sc, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 font-sans"
            >
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-xs border border-slate-200 flex-shrink-0">
                <span className={`material-symbols-outlined text-[20px] ${sc.color}`}>
                  {sc.icon}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-sans text-xs font-bold text-slate-900">
                    {sc.title}
                  </h4>
                  <span className="font-sans px-2 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold">
                    {sc.badge}
                  </span>
                </div>
                <p className="font-sans text-xs text-slate-500">
                  {sc.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200 font-sans">
          <button
            type="button"
            onClick={onClose}
            className="font-sans px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
          >
            {isEn ? "Back" : "Voltar"}
          </button>

          <Link
            href="/novo-atendimento"
            onClick={onClose}
            className="font-sans px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">play_circle</span>
            <span>{isEn ? "Start in Wizard" : "Iniciar no Wizard"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef } from "react";

export interface ConfirmLeaveModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function ConfirmLeaveModal({
  isOpen,
  onConfirm,
  onCancel,
  title = "Sair do atendimento?",
  description = "Os dados recolhidos nesta sessão serão perdidos.",
  confirmLabel = "Sair e descartar",
  cancelLabel = "Continuar atendimento",
}: ConfirmLeaveModalProps) {
  const safeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus automático na ação segura para proteção do operador
  useEffect(() => {
    if (isOpen) {
      safeButtonRef.current?.focus();
    }
  }, [isOpen]);

  // Fecho com a tecla Escape (equivalente a cancelar / continuar atendimento)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  // Fecho ao clicar no backdrop escurecido
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-leave-title"
      aria-describedby="confirm-leave-desc"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-sm sm:max-w-md w-full border border-slate-200/90 shadow-xl shadow-slate-900/10 flex flex-col gap-5 animate-in zoom-in-95 duration-150">
        {/* Top bar com Ícone Minimalista e Botão Fechar */}
        <div className="flex items-start justify-between gap-4">
          <div
            className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Título e Descrição Concisa */}
        <div className="flex flex-col gap-1.5">
          <h3
            id="confirm-leave-title"
            className="font-sans font-bold text-slate-900 text-lg tracking-tight"
          >
            {title}
          </h3>
          <p
            id="confirm-leave-desc"
            className="font-sans text-slate-500 text-sm leading-relaxed"
          >
            {description}
          </p>
        </div>

        {/* Ações com Hierarquia Visual Clara */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
          {/* Ação Destrutiva Secundária (Discreta, tom rose apenas no hover) */}
          <button
            type="button"
            onClick={() => onConfirm()}
            className="font-sans px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-600 hover:text-rose-600 font-semibold text-sm border border-slate-200 hover:border-rose-200/80 transition-colors cursor-pointer"
          >
            {confirmLabel}
          </button>

          {/* Ação Segura Principal (Foco automático, sólido elegante) */}
          <button
            ref={safeButtonRef}
            type="button"
            autoFocus
            onClick={() => onCancel()}
            className="font-sans px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-slate-900"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

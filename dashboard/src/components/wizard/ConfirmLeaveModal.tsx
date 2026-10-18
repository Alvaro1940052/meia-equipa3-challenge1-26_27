"use client";

import React, { useEffect, useRef } from "react";

export interface ConfirmLeaveModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

export default function ConfirmLeaveModal({
  isOpen,
  onConfirm,
  onCancel,
  title = "Tem a certeza de que pretende sair?",
  description = "Os dados recolhidos para esta devolução serão descartados e terá de reiniciar a introdução desde o início.",
}: ConfirmLeaveModalProps) {
  const safeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus automático na ação segura (Continuar Atendimento) para proteção do operador
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
      <div className="card-tactile bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl flex flex-col gap-5 animate-in zoom-in-95 duration-150">
        {/* Cabeçalho com Ícone Badge e Título */}
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shadow-2xs shrink-0"
            aria-hidden="true"
          >
            <span className="material-symbols-outlined text-[28px]">warning</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-label-md text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              Atendimento em Curso
            </span>
            <h3
              id="confirm-leave-title"
              className="font-sans font-headline-sm text-slate-900 text-lg font-bold tracking-tight"
            >
              {title}
            </h3>
          </div>
        </div>

        {/* Descrição de Impacto */}
        <p
          id="confirm-leave-desc"
          className="font-sans font-body-md text-slate-500 text-xs sm:text-sm leading-relaxed"
        >
          {description}
        </p>

        {/* Botões Táteis com Micro-interações */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
          {/* Ação Destrutiva (Sair e Descartar) */}
          <button
            type="button"
            onClick={onConfirm}
            className="font-sans px-5 py-2.5 rounded-xl bg-white hover:bg-rose-50 active:bg-rose-100 text-rose-600 hover:text-rose-700 font-bold text-sm border border-slate-200 hover:border-rose-200 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
            <span>Sair e Descartar</span>
          </button>

          {/* Ação Segura (Continuar Atendimento) */}
          <button
            ref={safeButtonRef}
            type="button"
            autoFocus
            onClick={onCancel}
            className="font-sans px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-600"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            <span>Continuar Atendimento</span>
          </button>
        </div>
      </div>
    </div>
  );
}

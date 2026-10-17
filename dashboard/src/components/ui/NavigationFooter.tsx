"use client";

import React from "react";

export interface NavigationFooterProps {
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  nextHint?: string;
  backLabel?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export default function NavigationFooter({
  onBack,
  onNext,
  nextLabel,
  nextHint: _nextHint,
  backLabel = "Voltar",
  disabled = false,
  isLoading = false,
  className = "",
}: NavigationFooterProps) {
  return (
    <div
      className={`w-full mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4 select-none ${className}`}
    >
      {/* Back button or empty spacer */}
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label={backLabel}
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-200 flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-600"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>{backLabel}</span>
        </button>
      ) : (
        <div />
      )}

      {/* Next / Submit button */}
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={onNext}
        aria-busy={isLoading}
        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-slate-200 text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-600"
      >
        {isLoading ? (
          <>
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>A processar...</span>
          </>
        ) : (
          <>
            <span>{nextLabel}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </>
        )}
      </button>
    </div>
  );
}

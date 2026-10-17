"use client";

import React from "react";
import Link from "next/link";

export interface HeroSectionProps {
  operatorName?: string;
  storeName?: string;
  onQuickPolicy?: () => void;
}

export default function HeroSection({
  operatorName = "Tiago",
  storeName = "Loja Central • Caixa Aberto",
  onQuickPolicy,
}: HeroSectionProps) {
  return (
    <section
      aria-label="Painel de início de turno e ação rápida"
      className="pb-6 border-b border-slate-200/80"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Column: Context, Greeting & Metrics */}
        <div className="flex flex-col gap-2.5 max-w-2xl">

          {/* Heading without emojis */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Olá, {operatorName}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Pronto para o turno de hoje? Cada devolução clara cria um cliente fiel.
          </p>

        </div>

        {/* Right Column: Direct Action Buttons (Slick, modern, no card-in-card wrapper) */}
        <div className="flex flex-wrap items-center gap-3 flex-shrink-0 self-start lg:self-center">
          <button
            type="button"
            onClick={onQuickPolicy}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-medium text-sm border border-slate-200 transition-colors select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-500">menu_book</span>
            <span>Consultar Políticas Rápidas</span>
          </button>

          <Link
            href="/novo-atendimento"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-sm transition-colors shadow-xs select-none focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span>Iniciar Nova Troca ou Devolução</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

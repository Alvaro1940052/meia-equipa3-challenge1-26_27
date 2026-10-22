"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";
import type { InferenciaItem, PaginaResponse } from "@/types/inferences";
import CaseComparisonModal from "./CaseComparisonModal";

export type CaseItem = InferenciaItem;

function formatRelativeTime(isoString: string, locale: "pt" | "en" = "pt"): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return locale === "en" ? "Recent" : "Recente";
    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
    if (diffSec < 60) return locale === "en" ? "Just now" : "Agora mesmo";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return locale === "en" ? `${diffMin}m ago` : `Há ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return locale === "en" ? `${diffHours}h ago` : `Há ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return locale === "en" ? "Yesterday" : "Ontem";
    if (diffDays < 7) return locale === "en" ? `${diffDays}d ago` : `Há ${diffDays} dias`;
    return date.toLocaleDateString(locale === "en" ? "en-US" : "pt-PT", { day: "2-digit", month: "2-digit" });
  } catch {
    return locale === "en" ? "Recent" : "Recente";
  }
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 1) return [1];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const current = currentPage + 1; // 1-indexed

  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (current >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", current - 1, current, current + 1, "...", totalPages];
}

export default function RecentCases() {
  const { locale } = useLocale();
  const isEn = locale === "en";

  const [filter, setFilter] = useState<"TODOS" | "DEVOLUCOES" | "TROCAS">("TODOS");
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [cases, setCases] = useState<InferenciaItem[]>([]);
  const [totalElementos, setTotalElementos] = useState<number>(0);
  const [totalPaginas, setTotalPaginas] = useState<number>(1);
  const [totalGeral, setTotalGeral] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCase, setSelectedCase] = useState<InferenciaItem | null>(null);
  const [comparingPedidoId, setComparingPedidoId] = useState<string | null>(null);
  const [printToast, setPrintToast] = useState<string | null>(null);
  const [seeding, setSeeding] = useState<boolean>(false);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("pagina", String(page));
      params.set("tamanho", String(pageSize));
      if (filter !== "TODOS") {
        params.set("filtro_tipo", filter);
      }

      const res = await fetch(`/api/avaliacoes?${params.toString()}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error?.message || errJson?.detail || (isEn ? `Error ${res.status} loading history.` : `Erro ${res.status} ao carregar histórico.`));
      }
      const data: PaginaResponse<InferenciaItem> = await res.json();
      setCases(data.conteudo || []);
      setTotalElementos(data.totalElementos ?? (data.conteudo || []).length);
      setTotalPaginas(Math.max(1, data.totalPaginas ?? Math.ceil((data.totalElementos || 1) / pageSize)));

      if (filter === "TODOS") {
        setTotalGeral(data.totalElementos);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : (isEn ? "Failed to connect to evaluations service." : "Erro desconhecido ao ligar ao serviço de avaliações."));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filter, isEn]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleFilterChange = (newFilter: "TODOS" | "DEVOLUCOES" | "TROCAS") => {
    if (newFilter !== filter) {
      setFilter(newFilter);
      setPage(0);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setError(null);
    try {
      const res = await fetch("/api/avaliacoes/seed", { method: "POST" });
      if (!res.ok) {
        throw new Error(isEn ? `Error ${res.status} seeding scenarios.` : `Erro ${res.status} na semeadura.`);
      }
      setPage(0);
      await fetchCases();
    } catch (err) {
      setError(err instanceof Error ? err.message : (isEn ? "Failed to seed scenarios." : "Falha ao semear cenários."));
    } finally {
      setSeeding(false);
    }
  };

  const startItem = totalElementos === 0 ? 0 : page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, totalElementos);

  const handlePrint = (caseItem: InferenciaItem) => {
    setPrintToast(
      isEn
        ? `Sending receipt for #${caseItem.pedidoId} to counter printer...`
        : `A enviar comprovativo de #${caseItem.pedidoId} para a impressora do balcão...`
    );
    setTimeout(() => {
      setPrintToast(null);
    }, 3200);
  };

  const getOutcomeTag = (elegibilidade: string) => {
    switch (elegibilidade) {
      case "PERMITIR":
        return {
          label: isEn ? "Approved" : "Aprovado",
          badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
          icon: "check_circle",
          iconColor: "text-emerald-600",
        };
      case "TROCA":
        return {
          label: isEn ? "Exchange" : "Troca",
          badgeClass: "bg-blue-50 text-blue-700 border-blue-200/60",
          icon: "sync_alt",
          iconColor: "text-blue-600",
        };
      case "RECUSAR":
        return {
          label: isEn ? "Refused" : "Recusado",
          badgeClass: "bg-rose-50 text-rose-700 border-rose-200/60",
          icon: "cancel",
          iconColor: "text-rose-600",
        };
      case "ENCAMINHAR":
        return {
          label: isEn ? "Forwarded" : "Encaminhado",
          badgeClass: "bg-violet-50 text-violet-700 border-violet-200/60",
          icon: "alt_route",
          iconColor: "text-violet-600",
        };
      case "REVER":
      default:
        return {
          label: isEn ? "Review" : "Revisão",
          badgeClass: "bg-amber-50 text-amber-700 border-amber-200/60",
          icon: "warning",
          iconColor: "text-amber-600",
        };
    }
  };

  return (
    <>
      <section
        aria-label={isEn ? "Recent resolved cases" : "Últimos casos resolvidos"}
        className="flex flex-col gap-4"
      >
        {/* Header and Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h2 className="font-sans text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                {isEn ? "Recent Resolved Cases" : "Últimos Casos Resolvidos"}
              </h2>
            </div>
            <p className="font-sans text-xs sm:text-sm text-slate-500">
              {isEn
                ? "Unified deliberation audit history from Drools and Prolog engines."
                : "Histórico unificado de deliberações periciais dos motores Drools e Prolog."}
            </p>
          </div>

          {/* Minimalist Filter Tabs */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleFilterChange("TODOS")}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${filter === "TODOS"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              {isEn ? "All" : "Todos"} {totalGeral !== null ? `(${totalGeral})` : totalElementos > 0 && filter === "TODOS" ? `(${totalElementos})` : ""}
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange("DEVOLUCOES")}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${filter === "DEVOLUCOES"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              {isEn ? "Returns" : "Devoluções"} {filter === "DEVOLUCOES" ? `(${totalElementos})` : ""}
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange("TROCAS")}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${filter === "TROCAS"
                  ? "bg-white text-slate-900 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              {isEn ? "Exchanges" : "Trocas"} {filter === "TROCAS" ? `(${totalElementos})` : ""}
            </button>
          </div>
        </div>

        {/* Print Notification Toast */}
        {printToast && (
          <div
            role="status"
            className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs md:text-sm font-medium animate-fadeIn shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-600">
              print
            </span>
            <span>{printToast}</span>
          </div>
        )}

        {/* Error State Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-rose-900 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-rose-600 text-[20px]">
                error
              </span>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchCases}
              className="px-3 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer transition-colors shrink-0 shadow-xs"
            >
              {isEn ? "Try Again" : "Tentar Novamente"}
            </button>
          </div>
        )}

        {/* Loading Shimmer Skeleton (Initial Load) */}
        {loading && cases.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-xs overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="px-4 py-3.5 flex items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-slate-200" />
                  <div className="flex flex-col gap-1.5">
                    <div className="w-36 h-4 bg-slate-200 rounded" />
                    <div className="w-20 h-3 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-5 bg-slate-200 rounded" />
                  <div className="w-16 h-4 bg-slate-200 rounded" />
                  <div className="w-12 h-3 bg-slate-100 rounded hidden md:block" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cases List */}
        {!error && cases.length > 0 && (
          <div
            className={`bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-xs overflow-hidden transition-opacity duration-150 ${loading ? "opacity-60 pointer-events-none" : "opacity-100"
              }`}
          >
            {cases.map((item) => {
              const meta = getOutcomeTag(item.elegibilidade);
              const isDrools = item.motor === "DROOLS";
              // Caso avaliado pelos dois motores: uma só linha, com o resultado de cada um
              const doisMotores = (item.motores?.length ?? 0) > 1;
              const nomeMotor = (motor: string) => (motor === "DROOLS" ? "Drools" : "Prolog");
              const divergem = doisMotores && item.consenso === false;
              // O ícone à esquerda indica o resultado; se os motores divergem, indica a divergência
              const dicaResultado = doisMotores
                ? item.motores!.map((m) => `${nomeMotor(m.motor)}: ${getOutcomeTag(m.elegibilidade).label}`).join(" · ")
                : meta.label;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedCase(item)}
                  className="group px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer select-none"
                >
                  {/* Left: Status Icon, Engine Badge, Product Name & Reference */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      title={dicaResultado}
                      aria-label={dicaResultado}
                      className={`material-symbols-outlined text-[20px] flex-shrink-0 ${divergem ? "text-amber-600" : meta.iconColor}`}
                    >
                      {divergem ? "rule" : meta.icon}
                    </span>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 min-w-0">
                      {/* Engine Badge */}
                      <span
                        className={`font-mono tabular-nums px-1.5 py-0.5 rounded text-[10px] font-bold border self-start sm:self-auto shrink-0 ${isDrools
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                      >
                        {/* Motor escolhido no atendimento (a linha é a avaliação original do caso) */}
                        {isDrools ? "Drools" : "Prolog"}
                      </span>

                      <span className="font-sans font-bold text-sm text-slate-900 group-hover:text-indigo-900 transition-colors truncate">
                        {item.produtoNome}
                      </span>

                      <span className="font-mono tabular-nums text-xs text-slate-400">
                        #{item.pedidoId}
                      </span>
                    </div>
                  </div>

                  {/* Right: Outcome badge, Compare button, Amount, Timestamp & Actions */}
                  <div className="flex items-center gap-2 sm:gap-4 md:gap-5 flex-shrink-0">
                    {/* Compare Engines Button if available */}
                    {item.temOutroMotor && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setComparingPedidoId(item.pedidoId);
                        }}
                        title={isEn ? `Compare Drools and Prolog for #${item.pedidoId}` : `Confrontar Drools e Prolog para #${item.pedidoId}`}
                        aria-label={isEn ? `Compare engines for #${item.pedidoId}` : `Comparar motores para #${item.pedidoId}`}
                        className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[15px]">compare_arrows</span>
                        <span className="hidden sm:inline">{isEn ? "Compare Engines" : "Comparar Motores"}</span>
                      </button>
                    )}

                    {/* Value */}
                    <span className="font-sans text-sm font-semibold text-slate-900 tabular-nums w-16 text-right">
                      {item.valorDevolucao.toFixed(2)} €
                    </span>

                    {/* Timestamp */}
                    <span className="font-sans text-xs text-slate-400 w-16 text-right hidden lg:inline">
                      {formatRelativeTime(item.executadoEm, locale)}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrint(item);
                        }}
                        title={isEn ? "Reprint Receipt" : "Reimprimir Comprovativo"}
                        aria-label={isEn ? `Reprint receipt #${item.pedidoId}` : `Reimprimir comprovativo #${item.pedidoId}`}
                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[17px]">print</span>
                      </button>

                      <span className="material-symbols-outlined text-[18px] text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all">
                        chevron_right
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!error && totalElementos > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-xs text-xs">
            {/* Left: Range and Items Per Page Selector */}
            <div className="flex items-center gap-3 text-slate-500 w-full sm:w-auto justify-between sm:justify-start">
              <span>
                {isEn ? "Showing" : "A mostrar"}{" "}
                <strong className="text-slate-900 font-semibold">{startItem}–{endItem}</strong>{" "}
                {isEn ? "of" : "de"}{" "}
                <strong className="text-slate-900 font-semibold">{totalElementos}</strong>{" "}
                {isEn ? "cases" : "casos"}
              </span>

              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                <span className="text-slate-400 hidden md:inline">{isEn ? "Per page:" : "Por pág:"}</span>
                <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
                  {[10, 20, 50].map((size) => (
                    <button
                      key={size}
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setPageSize(size);
                        setPage(0);
                      }}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${pageSize === size
                          ? "bg-white text-slate-900 font-bold shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Navigation Controls */}
            <nav aria-label={isEn ? "Cases pagination" : "Paginação de casos"} className="flex items-center gap-1">
              {/* First Page */}
              <button
                type="button"
                onClick={() => setPage(0)}
                disabled={page === 0 || loading}
                title={isEn ? "First page" : "Primeira página"}
                aria-label={isEn ? "First page" : "Primeira página"}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">first_page</span>
              </button>

              {/* Previous Page */}
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
                title={isEn ? "Previous page" : "Página anterior"}
                aria-label={isEn ? "Previous page" : "Página anterior"}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>

              {/* Mobile Page Indicator */}
              <span className="sm:hidden px-2 text-slate-600 font-medium">
                {isEn ? "Page" : "Pág."} <strong className="text-slate-900 font-bold">{page + 1}</strong> {isEn ? "of" : "de"} {totalPaginas}
              </span>

              {/* Desktop Page Numbers */}
              <div className="hidden sm:flex items-center gap-1">
                {getPageNumbers(page, totalPaginas).map((p, idx) => {
                  if (p === "...") {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400 select-none">
                        …
                      </span>
                    );
                  }
                  const isCurrent = p === page + 1;
                  return (
                    <button
                      key={p}
                      type="button"
                      disabled={loading}
                      onClick={() => setPage(p - 1)}
                      aria-current={isCurrent ? "page" : undefined}
                      aria-label={isEn ? `Page ${p}` : `Página ${p}`}
                      className={`min-w-7 h-7 px-2 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center ${isCurrent
                          ? "bg-slate-900 text-white font-bold shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium"
                        }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {/* Next Page */}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPaginas - 1, p + 1))}
                disabled={page >= totalPaginas - 1 || loading}
                title={isEn ? "Next page" : "Página seguinte"}
                aria-label={isEn ? "Next page" : "Página seguinte"}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>

              {/* Last Page */}
              <button
                type="button"
                onClick={() => setPage(totalPaginas - 1)}
                disabled={page >= totalPaginas - 1 || loading}
                title={isEn ? "Last page" : "Última página"}
                aria-label={isEn ? "Last page" : "Última página"}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">last_page</span>
              </button>
            </nav>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && cases.length === 0 && (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center gap-3 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[32px]">folder_open</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {isEn ? "No deliberations found in history" : "Nenhuma deliberação encontrada no histórico"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md">
              {isEn
                ? "No persisted records matching this filter yet. You can seed evaluations for Levi's 10 official benchmark scenarios immediately."
                : "Ainda não existem registos persistidos correspondentes a este filtro. Pode semear as avaliações dos 10 cenários oficiais da Levi's de forma imediata."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
              <button
                type="button"
                onClick={handleSeed}
                disabled={seeding}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {seeding ? "sync" : "cloud_download"}
                </span>
                <span>{seeding ? (isEn ? "Seeding Scenarios..." : "A Semear Cenários...") : (isEn ? "Seed 10 Benchmark Scenarios" : "Semear 10 Cenários Oficiais")}</span>
              </button>
              <Link
                href="/novo-atendimento"
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
              >
                {isEn ? "New Customer Service" : "Novo Atendimento"}
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Individual Verdict Detail Modal */}
      {selectedCase && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-case-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn"
        >
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {isEn ? "Audit Log • #" : "Auditoria Pericial • #"}{selectedCase.pedidoId}
                  </span>
                  <span
                    className={`font-mono tabular-nums px-2 py-0.5 rounded text-[10px] font-bold border ${selectedCase.motor === "DROOLS"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                  >
                    {selectedCase.motor}
                  </span>
                </div>
                <h4
                  id="modal-case-title"
                  className="font-sans text-lg font-bold text-slate-900 mt-1"
                >
                  {selectedCase.produtoNome}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                aria-label={isEn ? "Close modal" : "Fechar modal"}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Verdict Badge & Amount */}
            <div
              className={`p-3.5 rounded-xl flex items-center justify-between border ${selectedCase.elegibilidade === "PERMITIR"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                  : selectedCase.elegibilidade === "TROCA"
                    ? "bg-blue-50 border-blue-200 text-blue-950"
                    : selectedCase.elegibilidade === "RECUSAR"
                      ? "bg-rose-50 border-rose-200 text-rose-950"
                      : "bg-amber-50 border-amber-200 text-amber-950"
                }`}
            >
              <div className="flex items-center gap-3 font-sans">
                <span className="material-symbols-outlined text-[24px]">
                  {getOutcomeTag(selectedCase.elegibilidade).icon}
                </span>
                <div>
                  <p className="font-bold text-sm">
                    {isEn ? "Deliberation:" : "Deliberação:"} {getOutcomeTag(selectedCase.elegibilidade).label} ({selectedCase.elegibilidade})
                  </p>
                  <p className="text-xs opacity-75">
                    {isEn ? "Processed by" : "Processado pelo motor"} <span className="font-mono">{selectedCase.motor}</span> {isEn ? "in" : "em"} <span className="font-mono tabular-nums">{selectedCase.duracaoMs} ms</span>
                  </p>
                </div>
              </div>

              <span className="font-sans tabular-nums text-base font-extrabold">
                {selectedCase.valorDevolucao.toFixed(2)} €
              </span>
            </div>

            {/* Summary Details */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-sans">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{isEn ? "Transaction" : "Transação"}</span>
                <p className="font-semibold text-slate-800">{selectedCase.tipoTransacao || "N/A"}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{isEn ? "Refund Tender" : "Meio Reembolso"}</span>
                <p className="font-semibold text-slate-800 truncate" title={selectedCase.meioReembolso || "N/A"}>
                  {selectedCase.meioReembolso || "N/A"}
                </p>
              </div>
              <div className="mt-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">{isEn ? "Approval Level" : "Nível Aprovação"}</span>
                <p className="font-semibold text-slate-800">{selectedCase.nivelAprovacao || (isEn ? "Countertop" : "Balcão")}</p>
              </div>
              <div className="mt-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">{isEn ? "Recorded At" : "Data de Registo"}</span>
                <p className="font-semibold text-slate-800 font-mono tabular-nums">
                  {new Date(selectedCase.executadoEm).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            {/* Rules / Deductions List */}
            <div className="flex flex-col gap-2 font-sans">
              <h5 className="font-sans text-xs uppercase tracking-wider text-slate-500 font-bold">
                {selectedCase.motor === "DROOLS"
                  ? isEn ? "Triggered DRL Rules" : "Regras DRL Acionadas"
                  : isEn ? "Deduced Logical Clauses" : "Cláusulas Lógicas Deduzidas"}
              </h5>
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                {selectedCase.regrasDisparadas.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    {isEn ? "No specific rules logged." : "Nenhuma regra específica registada."}
                  </p>
                ) : (
                  selectedCase.regrasDisparadas.map((r, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-50 text-xs border border-slate-100 flex flex-col gap-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-mono tabular-nums text-[11px] font-bold">{r.codigo}</strong>
                        {r.modulo && (
                          <span className="text-[10px] text-slate-400 font-semibold">{r.modulo}</span>
                        )}
                      </div>
                      <span className="text-slate-600 text-[11px]">{r.mensagem || r.nome}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-200">
              {selectedCase.temOutroMotor ? (
                <button
                  type="button"
                  onClick={() => {
                    const id = selectedCase.pedidoId;
                    setSelectedCase(null);
                    setComparingPedidoId(id);
                  }}
                  className="px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
                  <span>{isEn ? `Compare with ${selectedCase.motor === "DROOLS" ? "Prolog" : "Drools"}` : `Confrontar com ${selectedCase.motor === "DROOLS" ? "Prolog" : "Drools"}`}</span>
                </button>
              ) : (
                <span className="text-xs text-slate-400 italic">{isEn ? "Single engine" : "Motor único"}</span>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handlePrint(selectedCase);
                    setSelectedCase(null);
                  }}
                  className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>{isEn ? "Print" : "Imprimir"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  {isEn ? "Close" : "Fechar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case Comparison Modal */}
      <CaseComparisonModal
        pedidoId={comparingPedidoId}
        isOpen={Boolean(comparingPedidoId)}
        onClose={() => setComparingPedidoId(null)}
      />
    </>
  );
}

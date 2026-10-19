"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useOptionalWizard } from "@/components/wizard/WizardContext";
import { useLocale } from "@/contexts/LocaleContext";

// Bandeira de Portugal em SVG nítido e responsivo
function PortugalFlag({ className = "w-4 h-3" }: { className?: string }) {
  return (
    <svg
      className={`rounded-2xs shrink-0 shadow-2xs border border-slate-200/60 object-cover ${className}`}
      viewBox="0 0 600 400"
      aria-hidden="true"
    >
      <rect width="600" height="400" fill="#da291c" />
      <rect width="240" height="400" fill="#046a38" />
      <circle cx="240" cy="200" r="80" fill="#fed100" stroke="#000" strokeWidth="2" />
      <path d="M240 140v120" stroke="#000" strokeWidth="2" />
      <path d="M200 170h80M200 230h80" stroke="#000" strokeWidth="2" />
      <path fill="#fff" d="M215 160h50v70c0 15-25 25-25 25s-25-10-25-25v-70z" />
      <path fill="#002b7f" d="M225 170h30v50c0 10-15 15-15 15s-15-5-15-15v-50z" />
      <circle cx="240" cy="195" r="4" fill="#fff" />
    </svg>
  );
}

// Bandeira do Reino Unido (Union Jack) em SVG nítido e responsivo
function UkFlag({ className = "w-4 h-3" }: { className?: string }) {
  return (
    <svg
      className={`rounded-2xs shrink-0 shadow-2xs border border-slate-200/60 object-cover ${className}`}
      viewBox="0 0 60 30"
      aria-hidden="true"
    >
      <clipPath id="uk-flag-clip-nav">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <g clipPath="url(#uk-flag-clip-nav)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="3" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

export interface NavbarProps {
  activeRoute?: "painel" | "novo-atendimento" | "decisoes" | string;
  operatorName?: string;
  operatorRole?: string;
  storeName?: string;
  streakCount?: number;
}

function getInitials(name: string): string {
  if (!name) return "OP";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Navbar({
  activeRoute = "painel",
  operatorName = "Tiago M.",
  operatorRole = "Operador N2",
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const wizard = useOptionalWizard();
  const { locale, setLocale } = useLocale();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (wizard && wizard.isDirty) {
      e.preventDefault();
      const target = href === "/novo-atendimento" ? "/novo-atendimento/passo/1" : href;
      wizard.setPendingNavigationUrl(target);
      wizard.setShowLeaveModal(true);
      if (mobileMenuOpen) setMobileMenuOpen(false);
    } else if (wizard && wizard.evaluationResult) {
      e.preventDefault();
      if (mobileMenuOpen) setMobileMenuOpen(false);
      const target = href === "/novo-atendimento" ? "/novo-atendimento/passo/1" : href;
      wizard.exitTo(target);
    }
  };

  const navLinks = [
    {
      href: "/",
      key: "painel",
      label: locale === "en" ? "Main Dashboard" : "Painel Principal",
    },
    {
      href: "/novo-atendimento",
      key: "novo-atendimento",
      label: locale === "en" ? "New Assessment" : "Novo Atendimento",
    },
    {
      href: "/decisoes",
      key: "decisoes",
      label: locale === "en" ? "Decisions & History" : "Decisões & Histórico",
    },
  ];

  const displayedRole =
    locale === "en" && operatorRole === "Operador N2"
      ? "Level 2 Operator"
      : operatorRole;

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const initials = getInitials(operatorName);

  return (
    <header
      role="banner"
      className="fixed top-0 left-0 w-full z-50 bg-white border-b border-slate-200"
    >
      <div className="h-16 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center">
          <Link
            href="/"
            onClick={(e) => handleNavClick(e, "/")}
            aria-label={
              locale === "en"
                ? "Go to RetailFlow home page"
                : "Ir para a página inicial do RetailFlow"
            }
            className="flex items-center gap-2 select-none focus-visible:outline-2 focus-visible:outline-primary rounded"
          >
            <span className="font-display font-bold text-lg tracking-tight text-slate-900">
              RetailFlow
            </span>
          </Link>
        </div>

        {/* Minimalist Desktop Navigation (clean text tabs, no pills, no boxes) */}
        <nav
          aria-label={locale === "en" ? "Main Navigation" : "Navegação Principal"}
          className="hidden md:flex items-center gap-8 h-16 font-sans"
        >
          {navLinks.map((item) => {
            const isActive = activeRoute === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                aria-current={isActive ? "page" : undefined}
                className={`relative inline-flex items-center h-full text-sm transition-colors select-none focus-visible:outline-2 focus-visible:outline-primary ${isActive
                    ? "font-semibold text-slate-900"
                    : "font-medium text-slate-500 hover:text-slate-900"
                  }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span
                    className="absolute bottom-0 inset-x-0 h-[2px] bg-primary -mb-px"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side: Language Selector, Operator profile & mobile toggle */}
        <div className="flex items-center gap-3 font-sans">
          {/* Seletor de Idioma (Bandeiras PT / EN) */}
          <div
            role="group"
            aria-label={locale === "en" ? "Select Language" : "Selecionar Idioma"}
            className="flex items-center bg-slate-100/90 p-0.5 rounded-full border border-slate-200 text-xs font-sans select-none"
          >
            <button
              type="button"
              onClick={() => setLocale("pt")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
                locale === "pt"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Português"
              aria-pressed={locale === "pt"}
            >
              <PortugalFlag className="w-4 h-2.5" />
              <span className="hidden sm:inline">PT</span>
            </button>
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
                locale === "en"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="English"
              aria-pressed={locale === "en"}
            >
              <UkFlag className="w-4 h-2.5" />
              <span className="hidden sm:inline">EN</span>
            </button>
          </div>

          {/* Operator Profile */}
          <div className="flex items-center gap-2.5 select-none">
            <div className="relative">
              <div
                className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center text-xs font-semibold"
                aria-hidden="true"
              >
                {initials}
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"
                title={locale === "en" ? "Active session" : "Sessão ativa"}
                aria-label={locale === "en" ? "Active session" : "Sessão ativa"}
              />
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-slate-900">
                {operatorName}
              </span>
              <span className="text-[11px] text-slate-500">
                {displayedRole}
              </span>
            </div>
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={
              mobileMenuOpen
                ? locale === "en"
                  ? "Close navigation menu"
                  : "Fechar menu de navegação"
                : locale === "en"
                  ? "Open navigation menu"
                  : "Abrir menu de navegação"
            }
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-primary cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 flex flex-col gap-2">
          {/* Mobile Language Switcher */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {locale === "en" ? "Language" : "Idioma"}
            </span>
            <div
              role="group"
              aria-label={locale === "en" ? "Select Language" : "Selecionar Idioma"}
              className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-xs font-sans select-none"
            >
              <button
                type="button"
                onClick={() => setLocale("pt")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all ${
                  locale === "pt"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Português"
                aria-pressed={locale === "pt"}
              >
                <PortugalFlag className="w-4 h-2.5" />
                <span>PT</span>
              </button>
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all ${
                  locale === "en"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="English"
                aria-pressed={locale === "en"}
              >
                <UkFlag className="w-4 h-2.5" />
                <span>EN</span>
              </button>
            </div>
          </div>

          {navLinks.map((item) => {
            const isActive = activeRoute === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleNavClick(e, item.href);
                }}
                aria-current={isActive ? "page" : undefined}
                className={`px-3 py-2 rounded-md text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary ${isActive
                    ? "font-semibold text-slate-900 bg-slate-100"
                    : "font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}

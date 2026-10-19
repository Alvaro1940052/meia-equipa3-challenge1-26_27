"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  useSyncExternalStore,
  ReactNode,
} from "react";

export type Locale = "pt" | "en";

export interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
  isEn: boolean;
  isPt: boolean;
}

const STORAGE_KEY = "retailflow_locale";

export const UI_TRANSLATIONS: Record<Locale, Record<string, string>> = {
  pt: {
    "nav.main_dashboard": "Painel Principal",
    "nav.new_assessment": "Novo Atendimento",
    "nav.decisions_history": "Decisões & Histórico",
    "nav.operator_role": "Operador N2",
    "nav.select_language": "Selecionar Idioma",
    "common.skip_to_content": "Saltar para o conteúdo principal",
    "common.loading": "A carregar...",
    "common.error": "Ocorreu um erro",
    "common.back": "Voltar",
    "common.continue": "Continuar",
    "common.cancel": "Cancelar",
    "common.confirm": "Confirmar",
    "common.close": "Fechar",
  },
  en: {
    "nav.main_dashboard": "Main Dashboard",
    "nav.new_assessment": "New Assessment",
    "nav.decisions_history": "Decisions & History",
    "nav.operator_role": "Level 2 Operator",
    "nav.select_language": "Select Language",
    "common.skip_to_content": "Skip to main content",
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.back": "Back",
    "common.continue": "Continue",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.close": "Close",
  },
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Listeners for in-app reactive locale changes
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

function getSnapshot(): Locale {
  if (typeof window === "undefined") return "pt";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "pt" || saved === "en") {
      return saved;
    }
  } catch {
    // ignore
  }
  return "pt";
}

function getServerSnapshot(): Locale {
  return "pt";
}

export interface LocaleProviderProps {
  children: ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale === "en" ? "en-US" : "pt-PT";
    }
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // ignore
    }
    listeners.forEach((listener) => listener());
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const dict = UI_TRANSLATIONS[locale];
      if (dict && key in dict) {
        return dict[key];
      }
      if (locale === "en" && fallback !== undefined) {
        return fallback;
      }
      if (locale === "pt" && fallback !== undefined && !key.includes(".")) {
        return key;
      }
      return fallback !== undefined ? fallback : key;
    },
    [locale]
  );

  const value = useMemo<LocaleContextType>(
    () => ({
      locale,
      setLocale,
      t,
      isEn: locale === "en",
      isPt: locale === "pt",
    }),
    [locale, setLocale, t]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}

export function useOptionalLocale(): LocaleContextType | undefined {
  return useContext(LocaleContext);
}

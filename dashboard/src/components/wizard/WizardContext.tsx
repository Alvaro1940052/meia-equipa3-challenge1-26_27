"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { EngineId } from "@/config/gateway";
import type { ReturnRequest } from "@/types/returns";

export interface WizardState {
  engine: EngineId | null;
  marketJurisdiction: "EUA" | "CA" | null;
  storeType: "MAINLINE" | "OUTLET" | null;
  purchaseChannel:
    | "FISICA"
    | "ONLINE_BACKPOCKET"
    | "FRANQUIA_CA"
    | "GROSSISTA"
    | "DESCONHECIDO"
    | null;
  barcodeRecognized: boolean;
  brandAllowed: boolean;
  alteredOrHemmed: boolean;
  intimateUnderwear: boolean;
  manufacturingDefect: boolean;
  physicalCondition:
    | "NOVO_ETIQUETAS"
    | "NOVO_ETIQUETAS_SOLTAS"
    | "NOVO_SEM_ETIQUETAS"
    | "USADO"
    | "LAVADO"
    | "MANCHADO";
  readyToResell: boolean;
  requestType: "DEVOLUCAO" | "TROCA" | "GIFT" | "AJUSTE_PRECO";
  proofOfPurchase:
    | "RECIBO_ORIGINAL"
    | "CONFIRMACAO_ONLINE"
    | "RECIBO_OFERTA"
    | "CONSULTA_POS"
    | "SEM_COMPROVATIVO";
  daysSincePurchase: number;
  exchangeOption: "NENHUMA" | "MESMO_MODELO" | "OUTRO_ARTIGO";
  customerSituation: "CONFORME" | "CONTESTA" | "CHAMAR_GERENCIA";
  managerException: boolean;
  refundMethod: "CONTA_ORIGINAL" | "VALE_LOJA" | "CARTAO_ENCERRADO";
  // Campos de Pagamento Original IN-009 e Família TN
  originalPaymentMethod:
    | "CREDITO"
    | "DEBITO"
    | "NUMERARIO"
    | "CARTAO_OFERTA"
    | "APPLE_PAY"
    | "PAYPAL"
    | "AFTERPAY"
    | "INTERAC";
  accountState: "ATIVA" | "ATIVA_CARTAO_PERDIDO" | "ENCERRADA";
  originalRefundRefused: boolean;
  physicalCardPresent: boolean;
  paymentAppAccessible: boolean;
  totalPrice: number;
  precoAtualProduto?: number;
  currency: "USD" | "CAD";
  operatorName: string;
  storeName: string;
  // Campos específicos de compras online
  onlineOrderFound: boolean;
  onlinePaymentMethod: "CC" | "BNPL" | "PAYPAL" | "WALLETS";
  onlineDaysWindow: "UNDER_30" | "OVER_30";
  onlineInStoreExchange: boolean;
  onlineOrderNumber: string;
}

export const defaultWizardState: WizardState = {
  engine: null,
  marketJurisdiction: null,
  storeType: null,
  purchaseChannel: null,
  barcodeRecognized: true,
  brandAllowed: true,
  alteredOrHemmed: false,
  intimateUnderwear: false,
  manufacturingDefect: false,
  physicalCondition: "NOVO_ETIQUETAS",
  readyToResell: true,
  requestType: "DEVOLUCAO",
  proofOfPurchase: "RECIBO_ORIGINAL",
  daysSincePurchase: 14,
  exchangeOption: "NENHUMA",
  customerSituation: "CONFORME",
  managerException: false,
  refundMethod: "CONTA_ORIGINAL",
  originalPaymentMethod: "CREDITO",
  accountState: "ATIVA",
  originalRefundRefused: false,
  physicalCardPresent: true,
  paymentAppAccessible: true,
  totalPrice: 89.9,
  precoAtualProduto: undefined,
  currency: "USD",
  operatorName: "Tiago Silva",
  storeName: "Loja Central • Caixa Aberto",
  onlineOrderFound: true,
  onlinePaymentMethod: "CC",
  onlineDaysWindow: "UNDER_30",
  onlineInStoreExchange: false,
  onlineOrderNumber: "WEB-84920-PT",
};

export function getFirstIncompleteStep(state: WizardState): number {
  // Passo 1: Motor de inferência é obrigatório
  if (!state.engine) return 1;

  // Passo 2: Jurisdição, formato e canal são obrigatórios
  if (!state.marketJurisdiction || !state.storeType || !state.purchaseChannel) {
    return 2;
  }

  // Passo 3: Condição física e elegibilidade
  if (!state.physicalCondition) return 3;

  // Passo 4: Tipo de pedido e comprovativo
  if (!state.requestType || !state.proofOfPurchase) return 4;

  // Passo 5: Modalidade de troca (se for troca)
  if (state.requestType === "TROCA" && (!state.exchangeOption || state.exchangeOption === "NENHUMA")) {
    return 5;
  }

  return 6;
}

const STORAGE_KEY = "retailflow_wizard_state_v3";

interface WizardContextType {
  state: WizardState;
  currentStep: number;
  totalSteps: number;
  isHydrated: boolean;
  isDirty: boolean;
  isLeaving: boolean;
  showLeaveModal: boolean;
  pendingNavigationUrl: string | null;
  setShowLeaveModal: (show: boolean) => void;
  setPendingNavigationUrl: (url: string | null) => void;
  setIsLeaving: (leaving: boolean) => void;
  confirmLeave: (targetUrl?: string) => void;
  cancelLeave: () => void;
  setField: <K extends keyof WizardState>(field: K, value: WizardState[K]) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  buildReturnRequest: () => ReturnRequest;
  resetWizard: () => void;
  saveDraft: () => boolean;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<WizardState>(defaultWizardState);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [isLeaving, setIsLeaving] = useState<boolean>(false);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  const [pendingNavigationUrl, setPendingNavigationUrl] = useState<string | null>(null);
  const totalSteps = 6;

  const isDirty = Boolean(state.engine || state.marketJurisdiction);

  // Carregar rascunho anterior de sessionStorage caso exista
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignorar erros de storage
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Guardar alterações automaticamente
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignorar erros de storage
    }
  }, [state]);

  // Proteção contra Saída Acidental externa (fechar aba ou recarregar página)
  useEffect(() => {
    if (!isDirty || isLeaving) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isLeaving) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, isLeaving]);

  const setField = <K extends keyof WizardState>(field: K, value: WizardState[K]) => {
    setState((prev) => {
      const updated = { ...prev, [field]: value };
      // Ajustar automaticamente moeda se jurisdição mudar
      if (field === "marketJurisdiction") {
        updated.currency = value === "CA" ? "CAD" : "USD";
      }
      // Sincronização reativa de modalidade de troca com o tipo de pedido (IN-005 / M6)
      if (field === "requestType") {
        if (value === "TROCA") {
          if (prev.exchangeOption === "NENHUMA") {
            updated.exchangeOption = "MESMO_MODELO";
          }
        } else {
          updated.exchangeOption = "NENHUMA";
        }
      }
      return updated;
    });
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const saveDraft = (): boolean => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  };

  const resetWizard = () => {
    setState(defaultWizardState);
    setCurrentStep(1);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignorar
    }
  };

  const confirmLeave = (targetUrl?: unknown) => {
    setIsLeaving(true);
    const validTarget =
      typeof targetUrl === "string" && targetUrl.trim().length > 0
        ? targetUrl
        : (typeof pendingNavigationUrl === "string" && pendingNavigationUrl.trim().length > 0
            ? pendingNavigationUrl
            : "/");

    setShowLeaveModal(false);
    setPendingNavigationUrl(null);
    resetWizard();

    // Desarmar qualquer listener residual no objeto window
    if (typeof window !== "undefined") {
      window.onbeforeunload = null;
    }

    // Navegação SPA suave com Next.js Router (sem provocar o alerta nativo do browser)
    router.push(validTarget);
  };

  const cancelLeave = () => {
    setShowLeaveModal(false);
    setPendingNavigationUrl(null);
  };

function mapTipoPedidoToResolucaoPedida(
  requestType: WizardState["requestType"],
  exchangeOption: WizardState["exchangeOption"]
): "REEMBOLSO" | "TROCA" | "TROCA_MESMO_ARTIGO" | "CREDITO_LOJA" | "AJUSTE_PRECO" {
  switch (requestType) {
    case "DEVOLUCAO":
      return "REEMBOLSO";
    case "GIFT":
      return "CREDITO_LOJA";
    case "AJUSTE_PRECO":
      return "AJUSTE_PRECO";
    case "TROCA":
      return exchangeOption === "MESMO_MODELO" ? "TROCA_MESMO_ARTIGO" : "TROCA";
    default:
      return "REEMBOLSO";
  }
}

  const buildReturnRequest = (): ReturnRequest => {
    const today = new Date();
    const purchaseDate = new Date(today);
    purchaseDate.setDate(today.getDate() - state.daysSincePurchase);

    const formattedToday = today.toISOString().split("T")[0];
    const formattedPurchaseDate = purchaseDate.toISOString().split("T")[0];

    // Mapeamento normalizado compatível com Drools e Prolog
    const isOnline = state.purchaseChannel === "ONLINE_BACKPOCKET";
    const mercadoEfetivo = state.marketJurisdiction === "CA" ? "CANADA" : "EUA";
    const canalEfetivo = isOnline
      ? state.marketJurisdiction === "CA"
        ? "LEVI_CA"
        : "LEVI_COM"
      : state.purchaseChannel === "FRANQUIA_CA"
      ? "FRANQUIA_CANADA"
      : state.purchaseChannel === "GROSSISTA"
      ? "GROSSISTA"
      : state.purchaseChannel === "DESCONHECIDO"
      ? "DESCONHECIDO"
      : state.storeType === "OUTLET"
      ? "OUTLET"
      : "MAINLINE";

    const condicaoUso =
      state.physicalCondition === "USADO" || state.physicalCondition === "MANCHADO"
        ? "USADO"
        : state.physicalCondition === "LAVADO"
        ? "LAVADO"
        : "NAO_USADO";

    const etiquetas =
      state.physicalCondition === "NOVO_ETIQUETAS"
        ? "COLOCADAS"
        : state.physicalCondition === "NOVO_ETIQUETAS_SOLTAS"
        ? "SOLTAS"
        : "AUSENTES";

    const isBlind = !isOnline && state.proofOfPurchase === "SEM_COMPROVATIVO";

    const comprovativoTipo = isOnline
      ? state.onlineOrderFound
        ? "CONFIRMACAO_ENCOMENDA"
        : null
      : state.proofOfPurchase === "RECIBO_ORIGINAL"
      ? "RECIBO_IMPRESSO"
      : state.proofOfPurchase === "CONFIRMACAO_ONLINE"
      ? "CONFIRMACAO_ENCOMENDA"
      : state.proofOfPurchase === "RECIBO_OFERTA"
      ? "RECIBO_OFERTA"
      : state.proofOfPurchase === "CONSULTA_POS"
      ? "CONSULTA_TRANSACAO"
      : isBlind
      ? null
      : "RECIBO_IMPRESSO"; // fallback seguro

    const effectiveTipoPedido = isOnline
      ? state.requestType === "TROCA" || state.onlineInStoreExchange
        ? "TROCA"
        : "DEVOLUCAO"
      : state.requestType === "GIFT"
      ? "DEVOLUCAO_OFERTA"
      : state.requestType;

    const effectiveResolucaoPedida = mapTipoPedidoToResolucaoPedida(
      isOnline && state.onlineInStoreExchange ? "TROCA" : state.requestType,
      state.exchangeOption
    );

    const meioPagamentoOnline =
      state.onlinePaymentMethod === "BNPL"
        ? "AFTERPAY"
        : state.onlinePaymentMethod === "PAYPAL"
        ? "PAYPAL"
        : state.onlinePaymentMethod === "WALLETS"
        ? "APPLE_PAY"
        : "CREDITO";

    const isAfterpayOnlineExchange =
      (state.originalPaymentMethod === "AFTERPAY" || (isOnline && state.onlinePaymentMethod === "BNPL")) &&
      isOnline &&
      (effectiveTipoPedido === "TROCA" || state.requestType === "TROCA");

    const isPaypalNoAccess =
      (state.originalPaymentMethod === "PAYPAL" || (isOnline && state.onlinePaymentMethod === "PAYPAL")) &&
      state.paymentAppAccessible === false;

    const shouldContornarObrigatorio = isAfterpayOnlineExchange || isPaypalNoAccess;

    return {
      id: "REQ-" + Date.now(),
      dataPedido: formattedToday,
      tipoPedido: effectiveTipoPedido,
      portalOnlineDisponivel: true,
      politicaPermiteAsCegasOnline: false,
      loja: {
        codigo: state.marketJurisdiction === "CA" ? "CA-STORE-01" : "US-STORE-01",
        nome: `Loja ${state.storeType === "OUTLET" ? "Outlet" : "Mainline"} (${mercadoEfetivo})`,
        mercado: mercadoEfetivo,
        tipoLoja: state.storeType || "MAINLINE",
        skusSortido: ["501-ORIGINAL-FIT", "721-HIGH-RISE", "TRUCKER-JACKET"],
      },
      colaborador: {
        id: "OP-042",
        nome: state.operatorName,
        funcao: "KEY_HOLDER",
        idCredencialPOS: "POS-042",
      },
      cliente: {
        id: "CLI-DEFAULT",
        idCliente: "CLI-DEFAULT",
        forneceDados: true,
        paisResidencia: mercadoEfetivo,
        contestaResultado:
          state.customerSituation === "CONTESTA" ||
          state.customerSituation === "CHAMAR_GERENCIA",
        agitado: state.customerSituation === "CHAMAR_GERENCIA",
      },
      compraOriginal: {
        idTransacao: isOnline
          ? state.onlineOrderNumber || "WEB-84920-PT"
          : isBlind
          ? null
          : "TX-ORIG-" + Math.floor(100000 + Math.random() * 900000),
        canal: canalEfetivo,
        dataCompra: isBlind ? null : formattedPurchaseDate,
        dataEnvio: isOnline ? formattedPurchaseDate : null,
        encomendaEncontrada: isOnline ? state.onlineOrderFound : true,
        compraOferta: effectiveTipoPedido === "DEVOLUCAO_OFERTA",
        moeda: state.currency,
        valorTotal: state.totalPrice,
        pagamento: {
          meio:
            state.originalPaymentMethod ||
            (state.refundMethod === "VALE_LOJA"
              ? "CARTAO_OFERTA"
              : isOnline
              ? meioPagamentoOnline
              : "CREDITO"),
          valorPago: state.totalPrice,
          estadoConta: state.accountState || (state.refundMethod === "CARTAO_ENCERRADO" ? "ENCERRADA" : "ATIVA"),
          cartaoFisicoPresente: state.physicalCardPresent ?? true,
          reembolsoOriginalRecusado: state.originalRefundRefused ?? false,
          acessoAplicacaoPagamento: state.paymentAppAccessible ?? true,
        },
        idStylistVenda: "S-18",
        quantidadeComprada: 1,
      },
      comprovativo: isBlind
        ? null
        : {
            tipo: comprovativoTipo,
            idComprovativo: isOnline
              ? state.onlineOrderNumber || "RCP-ONLINE-84920"
              : "RCP-" + Math.floor(100000 + Math.random() * 900000),
            confirmaCompra: isOnline
              ? state.onlineOrderFound
              : state.proofOfPurchase !== "SEM_COMPROVATIVO",
            reciboOriginal: isOnline
              ? state.onlineOrderFound
              : state.proofOfPurchase === "RECIBO_ORIGINAL" ||
                state.proofOfPurchase === "CONFIRMACAO_ONLINE" ||
                state.proofOfPurchase === "RECIBO_OFERTA",
          },
      artigos: [
        {
          id: "A-01",
          produto: {
            sku: "501-ORIGINAL-FIT",
            skuReconhecidoPOS: state.barcodeRecognized,
            marca: state.brandAllowed ? "LEVIS" : "OUTRA",
            categoria: state.intimateUnderwear ? "BODYWEAR" : "VESTUARIO",
            vendidoNaLoja: true,
            pvpOriginal: state.totalPrice,
            precoAtual: state.precoAtualProduto ?? state.totalPrice,
          },
          quantidade: 1,
          precoPago: state.totalPrice,
          revendivel: state.readyToResell,
          estado: {
            condicaoUso,
            etiquetas,
            embainhado: state.alteredOrHemmed,
            alterado: state.alteredOrHemmed,
            personalizado: false,
            defeitoFabricoConfirmado: state.manufacturingDefect,
            sujoOuInseguro: state.physicalCondition === "MANCHADO",
            danificado: state.physicalCondition === "MANCHADO",
            bainhaFeitaOuAlterada: state.alteredOrHemmed,
            temDefeitoFabrico: state.manufacturingDefect,
            revendivel: state.readyToResell,
          },
          entreCanais: state.purchaseChannel !== "FISICA",
        },
      ],
      artigosTroca:
        (state.requestType === "TROCA" ||
          effectiveTipoPedido === "TROCA" ||
          (isOnline && state.onlineInStoreExchange)) &&
        state.exchangeOption !== "NENHUMA"
          ? [
              {
                produto: {
                  sku:
                    state.exchangeOption === "OUTRO_ARTIGO"
                      ? "721-HIGH-RISE-30"
                      : "501-ORIGINAL-FIT-32",
                  skuReconhecidoPOS: true,
                  marca: "LEVIS",
                  categoria: "VESTUARIO",
                  vendidoNaLoja: true,
                  pvpOriginal: state.totalPrice,
                  precoAtual: state.precoAtualProduto ?? state.totalPrice,
                },
                apenasMudaTamanho:
                  state.exchangeOption === "OUTRO_ARTIGO"
                    ? false
                    : state.exchangeOption === "MESMO_MODELO" || isOnline,
                precoVenda: state.precoAtualProduto ?? state.totalPrice,
              },
            ]
          : [],
      excecaoGerencia: state.managerException,
      situacaoCliente: state.customerSituation,
      pedidoExcecao: state.managerException
        ? {
            aprovada: true,
            motivo: "Exceção autorizada pelo responsável sénior presente",
            concluivelNoSistema: true,
            contornaProcessoObrigatorio: shouldContornarObrigatorio,
            resolucaoPedida: effectiveResolucaoPedida,
          }
        : isAfterpayOnlineExchange
        ? {
            motivo: "Exige troca em loja para compra online paga com Afterpay e contorna o processo obrigatório",
            resolucaoPedida: "TROCA",
            contornaProcessoObrigatorio: true,
            preocupacaoCliente: "Quer a troca em loja e contorna o processo obrigatório Afterpay",
            aprovada: null,
            concluivelNoSistema: true,
          }
        : state.customerSituation !== "CONFORME"
        ? {
            aprovada: null, // Pendente de avaliação
            concluivelNoSistema: true,
            contornaProcessoObrigatorio: shouldContornarObrigatorio,
            resolucaoPedida: effectiveResolucaoPedida,
          }
        : shouldContornarObrigatorio
        ? {
            motivo: "Pedido exige contornar o processo operacional obrigatório",
            resolucaoPedida: effectiveResolucaoPedida,
            contornaProcessoObrigatorio: true,
            concluivelNoSistema: true,
          }
        : null,
    };
  };

  return (
    <WizardContext.Provider
      value={{
        state,
        currentStep,
        totalSteps,
        isHydrated,
        isDirty,
        isLeaving,
        showLeaveModal,
        pendingNavigationUrl,
        setShowLeaveModal,
        setPendingNavigationUrl,
        setIsLeaving,
        confirmLeave,
        cancelLeave,
        setField,
        goToStep,
        nextStep,
        prevStep,
        buildReturnRequest,
        resetWizard,
        saveDraft,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard deve ser usado dentro de um WizardProvider");
  }
  return context;
}

export function useOptionalWizard() {
  return useContext(WizardContext);
}

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  DEFAULT_API_BASE_URL,
  POC_PRESETS,
  DROOLS_PRESETS,
  PocPreset,
  DroolsPreset,
  LEVIS_OFFICIAL_SCENARIOS,
} from "../config/api";
import {
  OrchestratorHealthResponse,
  EvaluationResponse,
  DroolsEvaluationResponse,
  DecisaoResponse,
  ExplicacaoComoResponse,
  ExplicacaoPorqueNaoConclusaoResponse,
  DadosEmFaltaResponse,
  SimulacaoResponse,
  CenarioExemploResponse,
} from "../types";

export default function DashboardPage() {
  // Active Navigation Tab (Defaults to Levi's Drools Engine)
  const [activeTab, setActiveTab] = useState<
    "levis" | "prolog" | "drools" | "academic" | "playground"
  >("levis");

  // Global Health state
  const [health, setHealth] = useState<OrchestratorHealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(false);
  const [levisHealthOnline, setLevisHealthOnline] = useState<boolean>(false);

  // ============================================================================
  // LEVI'S DROOLS RETURNS EXPERT ENGINE STATE
  // ============================================================================
  const [scenarios, setScenarios] = useState<CenarioExemploResponse[]>(
    LEVIS_OFFICIAL_SCENARIOS
  );
  const [selectedScenarioId, setSelectedScenarioId] = useState<number>(1);
  const activeScenario = useMemo(
    () =>
      scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0],
    [scenarios, selectedScenarioId]
  );

  const [levisPayloadText, setLevisPayloadText] = useState<string>(
    JSON.stringify(LEVIS_OFFICIAL_SCENARIOS[0]?.pedido || {}, null, 2)
  );
  const [showPayload, setShowPayload] = useState<boolean>(false);
  const [levisLoading, setLevisLoading] = useState<boolean>(false);
  const [levisResult, setLevisResult] = useState<DecisaoResponse | null>(null);
  const [levisDuration, setLevisDuration] = useState<number | null>(null);
  const [levisError, setLevisError] = useState<string | null>(null);

  // Explainability Sub-tabs: 'como' | 'porque-nao' | 'porque' | 'simulacao'
  const [explainSubTab, setExplainSubTab] = useState<
    "como" | "porque-nao" | "porque" | "simulacao"
  >("como");

  // Explanations data
  const [comoData, setComoData] = useState<ExplicacaoComoResponse | null>(null);
  const [comoLoading, setComoLoading] = useState<boolean>(false);

  const [porqueNaoData, setPorqueNaoData] =
    useState<ExplicacaoPorqueNaoConclusaoResponse | null>(null);
  const [porqueNaoLoading, setPorqueNaoLoading] = useState<boolean>(false);
  const [porqueNaoTarget, setPorqueNaoTarget] = useState<string>(
    "OUT-001:PERMITIR"
  );

  const [dadosEmFaltaData, setDadosEmFaltaData] =
    useState<DadosEmFaltaResponse | null>(null);
  const [dadosEmFaltaLoading, setDadosEmFaltaLoading] =
    useState<boolean>(false);

  const [simulacaoData, setSimulacaoData] =
    useState<SimulacaoResponse | null>(null);
  const [simulacaoLoading, setSimulacaoLoading] = useState<boolean>(false);
  const [simulacaoError, setSimulacaoError] = useState<string | null>(null);
  const [simField, setSimField] = useState<string>(
    "artigos[0].estado.etiquetas"
  );
  const [simValue, setSimValue] = useState<string>("COLOCADAS");

  // ============================================================================
  // LEGACY TAB STATES (PRESERVED)
  // ============================================================================
  // Tab 1: Prolog POC Evaluate
  const [prologScenario, setPrologScenario] = useState<string>("test");
  const [prologValue, setPrologValue] = useState<number>(42);
  const [prologLoading, setPrologLoading] = useState<boolean>(false);
  const [prologResult, setPrologResult] = useState<EvaluationResponse | null>(
    null
  );
  const [prologDuration, setPrologDuration] = useState<number | null>(null);
  const [prologError, setPrologError] = useState<string | null>(null);

  // Tab 2: Drools Clinical Evaluate
  const [selectedDroolsPresetId, setSelectedDroolsPresetId] =
    useState<string>("otorrhagia");
  const [droolsPayloadText, setDroolsPayloadText] = useState<string>(
    JSON.stringify(DROOLS_PRESETS[0].payload, null, 2)
  );
  const [droolsLoading, setDroolsLoading] = useState<boolean>(false);
  const [droolsResult, setDroolsResult] =
    useState<DroolsEvaluationResponse | null>(null);
  const [droolsDuration, setDroolsDuration] = useState<number | null>(null);
  const [droolsError, setDroolsError] = useState<string | null>(null);

  // Tab 3: Academic Engine
  const [academicLoading, setAcademicLoading] = useState<boolean>(false);
  const [academicAction, setAcademicAction] = useState<string | null>(null);
  const [academicResponse, setAcademicResponse] = useState<any>(null);
  const [academicError, setAcademicError] = useState<string | null>(null);

  // Tab 4: HTTP Playground
  const [pgMethod, setPgMethod] = useState<"GET" | "POST">("GET");
  const [pgEndpoint, setPgEndpoint] = useState<string>("/api/v1/health");
  const [pgBody, setPgBody] = useState<string>("");
  const [pgLoading, setPgLoading] = useState<boolean>(false);
  const [pgStatus, setPgStatus] = useState<number | null>(null);
  const [pgResult, setPgResult] = useState<any>(null);
  const [pgDuration, setPgDuration] = useState<number | null>(null);
  const [pgError, setPgError] = useState<string | null>(null);

  // ============================================================================
  // FETCH HEALTH
  // ============================================================================
  const fetchHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const res = await fetch(`${DEFAULT_API_BASE_URL}/health`);
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch {
      setHealth(null);
    }

    // Ping Levi's Drools Engine health endpoint directly
    try {
      const levisRes = await fetch(`${DEFAULT_API_BASE_URL}/api/v1/levis/health`);
      if (levisRes.ok) {
        const ldata = await levisRes.json();
        setLevisHealthOnline(ldata.status === "UP");
      } else {
        setLevisHealthOnline(false);
      }
    } catch {
      setLevisHealthOnline(false);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  // ============================================================================
  // LEVI'S EVALUATION LOGIC
  // ============================================================================
  const fetchComo = useCallback(async (avaliacaoId: string) => {
    setComoLoading(true);
    try {
      const res = await fetch(
        `${DEFAULT_API_BASE_URL}/api/v1/levis/avaliacoes/${avaliacaoId}/explicacoes/como`
      );
      if (res.ok) {
        const data = await res.json();
        setComoData(data);
      }
    } catch (err) {
      console.error("Erro ao obter explicação como:", err);
    } finally {
      setComoLoading(false);
    }
  }, []);

  const fetchPorqueNao = useCallback(
    async (avaliacaoId: string, conclusao: string = "OUT-001:PERMITIR") => {
      setPorqueNaoLoading(true);
      try {
        const res = await fetch(
          `${DEFAULT_API_BASE_URL}/api/v1/levis/avaliacoes/${avaliacaoId}/explicacoes/porque-nao?conclusao=${encodeURIComponent(
            conclusao
          )}`
        );
        if (res.ok) {
          const data = await res.json();
          setPorqueNaoData(data);
        }
      } catch (err) {
        console.error("Erro ao obter explicação porque-não:", err);
      } finally {
        setPorqueNaoLoading(false);
      }
    },
    []
  );

  const fetchDadosEmFalta = useCallback(async (pedido: any) => {
    setDadosEmFaltaLoading(true);
    try {
      const res = await fetch(
        `${DEFAULT_API_BASE_URL}/api/v1/levis/dados-em-falta`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pedido),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setDadosEmFaltaData(data);
      }
    } catch (err) {
      console.error("Erro ao obter dados em falta:", err);
    } finally {
      setDadosEmFaltaLoading(false);
    }
  }, []);

  const handleLevisEvaluate = useCallback(
    async (payloadOverride?: any) => {
      setLevisLoading(true);
      setLevisError(null);
      setSimulacaoData(null);
      const start = performance.now();
      try {
        let bodyData = payloadOverride;
        if (!bodyData) {
          try {
            bodyData = JSON.parse(levisPayloadText);
          } catch {
            throw new Error("JSON de entrada inválido no pedido.");
          }
        }
        const res = await fetch(`${DEFAULT_API_BASE_URL}/api/v1/levis/avaliar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data.detail
              ? typeof data.detail === "string"
                ? data.detail
                : JSON.stringify(data.detail)
              : `Erro HTTP ${res.status}`
          );
        }
        setLevisResult(data);
        setLevisDuration(Math.round(performance.now() - start));

        // Immediately fetch causal explainability
        if (data.avaliacaoId) {
          fetchComo(data.avaliacaoId);
          fetchPorqueNao(data.avaliacaoId, porqueNaoTarget);
        }
        fetchDadosEmFalta(bodyData);
      } catch (err: any) {
        setLevisError(err.message || "Erro na avaliação Levi's");
      } finally {
        setLevisLoading(false);
      }
    },
    [levisPayloadText, porqueNaoTarget, fetchComo, fetchPorqueNao, fetchDadosEmFalta]
  );

  // Counterfactual simulation trigger
  const handleSimular = async (alteracoes: Record<string, any>) => {
    if (!levisResult?.avaliacaoId) {
      setSimulacaoError("É necessário executar uma avaliação base primeiro.");
      return;
    }
    setSimulacaoLoading(true);
    setSimulacaoError(null);
    try {
      const res = await fetch(
        `${DEFAULT_API_BASE_URL}/api/v1/levis/avaliacoes/${levisResult.avaliacaoId}/simulacoes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alteracoes }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.detail
            ? typeof data.detail === "string"
              ? data.detail
              : JSON.stringify(data.detail)
            : `Erro HTTP ${res.status}`
        );
      }
      setSimulacaoData(data);
    } catch (err: any) {
      setSimulacaoError(err.message || "Erro na simulação.");
    } finally {
      setSimulacaoLoading(false);
    }
  };

  // Scenario selection handler (loads instantly and triggers 1-click evaluation)
  const selectScenario = (sc: CenarioExemploResponse) => {
    setSelectedScenarioId(sc.id);
    const pStr = JSON.stringify(sc.pedido, null, 2);
    setLevisPayloadText(pStr);
    handleLevisEvaluate(sc.pedido);
  };

  // Run scenario #1 evaluation on initial page mount for instant <1s verdict
  useEffect(() => {
    if (scenarios.length > 0) {
      handleLevisEvaluate(scenarios[0].pedido);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Format currency helper
  const formatMoney = (val?: number | string | null) => {
    if (val === undefined || val === null || val === "") return "0.00 €";
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? `${val} €` : `${num.toFixed(2)} €`;
  };

  // Legacy tab handlers
  const handlePrologEvaluate = async (scenario: string, value: number) => {
    setPrologLoading(true);
    setPrologError(null);
    setPrologResult(null);
    const start = performance.now();
    try {
      const res = await fetch(`${DEFAULT_API_BASE_URL}/api/v1/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, value }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail ? JSON.stringify(data.detail) : `Erro HTTP ${res.status}`);
      }
      setPrologResult(data);
      setPrologDuration(Math.round(performance.now() - start));
    } catch (err: any) {
      setPrologError(err.message || "Erro na avaliação Prolog");
    } finally {
      setPrologLoading(false);
    }
  };

  const applyPocPreset = (preset: PocPreset) => {
    setPrologScenario(preset.payload.scenario);
    setPrologValue(preset.payload.value);
    handlePrologEvaluate(preset.payload.scenario, preset.payload.value);
  };

  const handleDroolsEvaluate = async () => {
    setDroolsLoading(true);
    setDroolsError(null);
    setDroolsResult(null);
    const start = performance.now();
    try {
      let payload;
      try {
        payload = JSON.parse(droolsPayloadText);
      } catch {
        throw new Error("JSON de entrada inválido.");
      }
      const res = await fetch(`${DEFAULT_API_BASE_URL}/api/v1/drools/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail ? JSON.stringify(data.detail) : `Erro HTTP ${res.status}`);
      }
      setDroolsResult(data);
      setDroolsDuration(Math.round(performance.now() - start));
    } catch (err: any) {
      setDroolsError(err.message || "Erro na avaliação Drools");
    } finally {
      setDroolsLoading(false);
    }
  };

  const applyDroolsPreset = (preset: DroolsPreset) => {
    setSelectedDroolsPresetId(preset.id);
    setDroolsPayloadText(JSON.stringify(preset.payload, null, 2));
  };

  const handleAcademicAction = async (action: "load" | "run" | "facts" | "reset") => {
    setAcademicLoading(true);
    setAcademicError(null);
    setAcademicAction(action);
    try {
      let res: Response;
      if (action === "load") {
        res = await fetch(`${DEFAULT_API_BASE_URL}/api/v1/inference/load`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ knowledge_base: "vehicles" }),
        });
      } else if (action === "run") {
        res = await fetch(`${DEFAULT_API_BASE_URL}/api/v1/inference/run`, {
          method: "POST",
        });
      } else if (action === "facts") {
        res = await fetch(`${DEFAULT_API_BASE_URL}/api/v1/inference/facts`, {
          method: "GET",
        });
      } else {
        res = await fetch(`${DEFAULT_API_BASE_URL}/api/v1/inference/reset`, {
          method: "POST",
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail ? JSON.stringify(data.detail) : `Erro HTTP ${res.status}`);
      }
      setAcademicResponse(data);
    } catch (err: any) {
      setAcademicError(err.message || "Erro na operação académica");
    } finally {
      setAcademicLoading(false);
    }
  };

  const handlePlaygroundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPgLoading(true);
    setPgError(null);
    setPgResult(null);
    setPgStatus(null);
    const start = performance.now();
    try {
      const options: RequestInit = {
        method: pgMethod,
        headers: { "Content-Type": "application/json" },
      };
      if (pgMethod === "POST" && pgBody.trim()) {
        try {
          JSON.parse(pgBody);
        } catch {
          throw new Error("O corpo do pedido não é um JSON válido.");
        }
        options.body = pgBody;
      }
      const res = await fetch(`${DEFAULT_API_BASE_URL}${pgEndpoint}`, options);
      setPgStatus(res.status);
      const data = await res.json();
      setPgResult(data);
      setPgDuration(Math.round(performance.now() - start));
    } catch (err: any) {
      setPgError(err.message || "Erro no pedido HTTP");
    } finally {
      setPgLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="header-title">
          <h1>Levi&apos;s Returns Expert — Centro Pericial de Diagnóstico</h1>
          <p>
            Motor de regras de produção Drools (98 regras, M0-M9) com explicabilidade total
          </p>
        </div>

        <div className="header-status">
          <div
            className={`service-pill ${
              levisHealthOnline || health?.drools_engine === "connected"
                ? "online"
                : "offline"
            }`}
          >
            <span className="status-dot"></span>
            Drools Levi&apos;s:{" "}
            {levisHealthOnline || health?.drools_engine === "connected"
              ? "Online (:8082)"
              : "Offline"}
          </div>

          <div
            className={`service-pill ${
              health?.status === "healthy" ? "online" : "offline"
            }`}
          >
            <span className="status-dot"></span>
            FastAPI: {health?.status === "healthy" ? "Online (:8000)" : "Offline"}
          </div>

          <div
            className={`service-pill ${
              health?.prolog_engine === "connected" ? "online" : "offline"
            }`}
          >
            <span className="status-dot"></span>
            Prolog: {health?.prolog_engine === "connected" ? "Conectado (:8080)" : "Desconectado"}
          </div>

          <button
            className="btn-refresh"
            onClick={fetchHealth}
            disabled={healthLoading}
          >
            {healthLoading ? "A verificar..." : "↻ Atualizar"}
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <nav className="tabs-nav">
        <button
          className={`tab-btn highlighted ${activeTab === "levis" ? "active" : ""}`}
          onClick={() => setActiveTab("levis")}
        >
          ⭐ Devoluções Levi&apos;s (Drools)
          <span className="tab-tag">98 Regras</span>
        </button>
        <button
          className={`tab-btn ${activeTab === "prolog" ? "active" : ""}`}
          onClick={() => setActiveTab("prolog")}
        >
          Prolog: POC
        </button>
        <button
          className={`tab-btn ${activeTab === "drools" ? "active" : ""}`}
          onClick={() => setActiveTab("drools")}
        >
          Drools: Clínico
        </button>
        <button
          className={`tab-btn ${activeTab === "academic" ? "active" : ""}`}
          onClick={() => setActiveTab("academic")}
        >
          Prolog: Académico
        </button>
        <button
          className={`tab-btn ${activeTab === "playground" ? "active" : ""}`}
          onClick={() => setActiveTab("playground")}
        >
          Playground HTTP
        </button>
      </nav>

      {/* ==================================================================== */}
      {/* TAB: DEVOLUÇÕES LEVI'S (DROOLS) - VISTA PRIORITÁRIA                  */}
      {/* ==================================================================== */}
      {activeTab === "levis" && (
        <div>
          {/* Seletor Rápido dos 10 Cenários Oficiais */}
          <section className="scenario-selector-bar">
            <div className="scenario-header-row">
              <span className="presets-label">
                10 Cenários Oficiais da Levi&apos;s (Clique para Avaliação Imediata)
              </span>
              <span className="meta-info">
                Cenário Ativo: #{activeScenario?.id} ({activeScenario?.estado || "oficial"})
              </span>
            </div>

            <div className="scenario-quick-pills">
              {scenarios.map((sc) => (
                <button
                  key={sc.id}
                  className={`scenario-pill-btn ${
                    selectedScenarioId === sc.id ? "active" : ""
                  }`}
                  onClick={() => selectScenario(sc)}
                  title={sc.titulo}
                >
                  <strong>#{sc.id}</strong> {sc.titulo.split(",")[0]}
                </button>
              ))}
            </div>

            {/* Cartão de Resumo do Cenário Selecionado */}
            {activeScenario && (
              <div className="scenario-info-card">
                <div className="scenario-title-bar">
                  <div className="scenario-title-text">
                    #{activeScenario.id}: {activeScenario.titulo}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="btn-refresh"
                      onClick={() => setShowPayload(!showPayload)}
                    >
                      {showPayload ? "Ocultar JSON" : "Ver Payload JSON"}
                    </button>
                    <button
                      className="btn-refresh"
                      style={{
                        background: "rgba(245, 158, 11, 0.15)",
                        borderColor: "#f59e0b",
                        color: "#fbbf24",
                      }}
                      onClick={() => handleLevisEvaluate(activeScenario.pedido)}
                      disabled={levisLoading}
                    >
                      {levisLoading ? "A avaliar..." : "▶ Reavaliar Agora"}
                    </button>
                  </div>
                </div>

                {activeScenario.pressupostos && activeScenario.pressupostos.length > 0 && (
                  <div className="scenario-assumption-tags">
                    {activeScenario.pressupostos.map((p, idx) => (
                      <span key={idx} className="assumption-tag">
                        📌 {p}
                      </span>
                    ))}
                  </div>
                )}

                {showPayload && (
                  <div style={{ marginTop: "8px" }}>
                    <textarea
                      className="form-textarea"
                      rows={8}
                      value={levisPayloadText}
                      onChange={(e) => setLevisPayloadText(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
          </section>

          {levisError && <div className="error-banner">{levisError}</div>}

          {/* VISUALIZADOR DE DECISÃO INTELIGENTE */}
          {levisResult ? (
            <div>
              {/* 1. Cartão Hero de Elegibilidade Operacional */}
              <div
                className={`eligibility-hero ${
                  levisResult.elegibilidade || "REVER"
                }`}
              >
                <div>
                  <div
                    className={`eligibility-badge-large ${
                      levisResult.elegibilidade || "REVER"
                    }`}
                  >
                    {levisResult.elegibilidade === "PERMITIR" && "✓ PERMITIR"}
                    {levisResult.elegibilidade === "RECUSAR" && "✕ RECUSAR"}
                    {levisResult.elegibilidade === "REVER" && "⚠ REVER"}
                    {levisResult.elegibilidade === "ENCAMINHAR" && "➔ ENCAMINHAR"}
                    {!["PERMITIR", "RECUSAR", "REVER", "ENCAMINHAR"].includes(
                      levisResult.elegibilidade || ""
                    ) && levisResult.elegibilidade}
                  </div>
                  <div className="eligibility-desc-text">
                    Decisão Global emitida pelo motor Drools Levi&apos;s (M0-M9).{" "}
                    {levisResult.tipoVerificacao && (
                      <span>
                        Comprovativo: <strong>{levisResult.tipoVerificacao}</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div className="meta-info">
                    {levisDuration !== null && `${levisDuration} ms`} | UUID:{" "}
                    <code>{levisResult.avaliacaoId?.slice(0, 8) || "N/A"}...</code>
                  </div>
                  <div
                    style={{
                      fontSize: "0.76rem",
                      color: "var(--text-subtle)",
                      marginTop: "4px",
                    }}
                  >
                    {levisResult.regras?.length || 0} regras disparadas no ciclo
                  </div>
                </div>
              </div>

              {/* 2. Resumo Financeiro e Governança */}
              <div className="metrics-grid-4">
                <div className="metric-card">
                  <span className="metric-label">Valor a Devolver / Trocar</span>
                  <span className="metric-value" style={{ color: "#10b981" }}>
                    {formatMoney(levisResult.valorDevolucao)}
                  </span>
                  <span className="metric-sub">
                    Base: {levisResult.baseValor || "VALOR_PAGO"}
                  </span>
                </div>

                <div className="metric-card">
                  <span className="metric-label">Meio de Reembolso</span>
                  <span className="metric-value">
                    {levisResult.meioReembolso || "MEIO_ORIGINAL"}
                  </span>
                  <span className="metric-sub">
                    Tipo: {levisResult.tipoTransacao || "DEVOLUÇÃO"}
                  </span>
                </div>

                <div className="metric-card">
                  <span className="metric-label">Nível de Aprovação Exigido</span>
                  <span
                    className="metric-value"
                    style={{
                      color:
                        levisResult.aprovacao === "STORE_MANAGER" ||
                        levisResult.aprovacao === "DISTRICT_MANAGER" ||
                        levisResult.aprovacao === "RESPONSAVEL_SENIOR"
                          ? "#f59e0b"
                          : "var(--text-main)",
                    }}
                  >
                    {levisResult.aprovacao || "NENHUMA"}
                  </span>
                  <span className="metric-sub">
                    Governança: {levisResult.aprovacao ? "Aprovação Requerida" : "Direto"}
                  </span>
                </div>

                <div className="metric-card">
                  <span className="metric-label">Documentação & Arquivo</span>
                  <span className="metric-value" style={{ fontSize: "1rem" }}>
                    {levisResult.documentacao?.reciboAgrafado
                      ? "Recibo Agrafado"
                      : levisResult.documentacao?.retencaoAte
                      ? `Retenção 90d`
                      : "Padrão"}
                  </span>
                  <span className="metric-sub">
                    Stylist: {levisResult.documentacao?.idStylistAtribuido || "N/A"}
                  </span>
                </div>
              </div>

              {/* 3. Tabela de Decisão por Artigo */}
              <div className="card" style={{ marginBottom: "20px" }}>
                <h3 className="card-title" style={{ fontSize: "0.95rem" }}>
                  📦 Decisão Individual por Artigo (OUT-007)
                </h3>
                <p className="card-desc" style={{ marginBottom: "10px" }}>
                  Cada artigo avaliado recebe o seu destino físico operacional e veredito de elegibilidade.
                </p>

                <div className="table-container">
                  <table className="levis-table">
                    <thead>
                      <tr>
                        <th>Artigo</th>
                        <th>Elegibilidade</th>
                        <th>Destino Físico (OUT-007)</th>
                        <th>Valor Creditado</th>
                        <th>Base Preço</th>
                        <th>Aprovação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {levisResult.artigos?.length > 0 ? (
                        levisResult.artigos.map((art) => {
                          const eligClass =
                            art.elegibilidade === "PERMITIR"
                              ? "permitir"
                              : art.elegibilidade === "RECUSAR"
                              ? "recusar"
                              : art.elegibilidade === "ENCAMINHAR"
                              ? "encaminhar"
                              : "rever";
                          const destClass = art.destino
                            ? `badge-destino ${art.destino}`
                            : "badge-destino DEFAULT";
                          return (
                            <tr key={art.artigoId}>
                              <td>
                                <strong>{art.artigoId}</strong>
                              </td>
                              <td>
                                <span className={`badge-tag ${eligClass}`}>
                                  {art.elegibilidade || "PENDENTE"}
                                </span>
                              </td>
                              <td>
                                <span className={destClass}>
                                  {art.destino === "AREA_VENDAS" && "🛒 Área de Vendas"}
                                  {art.destino === "DANIFICADO" && "⚠️ Danificado"}
                                  {art.destino === "RISCO_BIOLOGICO" && "☣️ Risco Biológico"}
                                  {art.destino === "QUARANTENA" && "📦 Quarentena"}
                                  {art.destino === "DEVOLUCAO_FABRICA" && "🏭 Fábrica"}
                                  {!art.destino && "Por Determinar"}
                                </span>
                              </td>
                              <td>{formatMoney(art.valorDevolucao)}</td>
                              <td>{art.baseValor || "-"}</td>
                              <td>{art.aprovacao || "Padrão"}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", color: "var(--text-subtle)" }}>
                            Nenhum artigo processado individualmente.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. PAINÉIS INTERATIVOS DE EXPLICABILIDADE */}
              <div className="card">
                <h3 className="card-title">🧠 Painéis de Explicabilidade Pericial</h3>
                <p className="card-desc">
                  Explore o raciocínio causal passo-a-passo, fatores de bloqueio, justificação de perguntas e simulador contrafactual.
                </p>

                {/* Sub-Tabs Selector */}
                <div className="subtabs-bar">
                  <button
                    className={`subtab-btn ${explainSubTab === "como" ? "active" : ""}`}
                    onClick={() => {
                      setExplainSubTab("como");
                      if (levisResult?.avaliacaoId && !comoData) {
                        fetchComo(levisResult.avaliacaoId);
                      }
                    }}
                  >
                    🔍 Como? (Raciocínio)
                  </button>
                  <button
                    className={`subtab-btn ${explainSubTab === "porque-nao" ? "active" : ""}`}
                    onClick={() => {
                      setExplainSubTab("porque-nao");
                      if (levisResult?.avaliacaoId && !porqueNaoData) {
                        fetchPorqueNao(levisResult.avaliacaoId, porqueNaoTarget);
                      }
                    }}
                  >
                    🚫 Porque não? (Bloqueios)
                  </button>
                  <button
                    className={`subtab-btn ${explainSubTab === "porque" ? "active" : ""}`}
                    onClick={() => setExplainSubTab("porque")}
                  >
                    ❓ Porquê? (Perguntas)
                  </button>
                  <button
                    className={`subtab-btn ${explainSubTab === "simulacao" ? "active" : ""}`}
                    onClick={() => setExplainSubTab("simulacao")}
                  >
                    ✨ E se? (Simulador)
                  </button>
                </div>

                {/* SUBTAB 1: COMO? (Raciocínio & Linha Temporal) */}
                {explainSubTab === "como" && (
                  <div>
                    {comoLoading ? (
                      <div className="empty-state">A carregar trilho de raciocínio causal...</div>
                    ) : (
                      <div>
                        {comoData?.modulosPercorridos && (
                          <div className="modules-bar">
                            <span className="presets-label" style={{ marginBottom: 0 }}>
                              Módulos Percorridos:
                            </span>
                            {["M0", "M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9"].map((m) => {
                              const active = comoData.modulosPercorridos.includes(m);
                              return (
                                <span key={m} className={`module-chip ${active ? "active" : ""}`}>
                                  {m}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {comoData?.resumo && (
                          <div
                            style={{
                              background: "rgba(59, 130, 246, 0.08)",
                              border: "1px solid rgba(59, 130, 246, 0.25)",
                              borderRadius: "6px",
                              padding: "10px 14px",
                              fontSize: "0.84rem",
                              marginBottom: "12px",
                              color: "#bfdbfe",
                            }}
                          >
                            💡 <strong>Resumo:</strong> {comoData.resumo}
                          </div>
                        )}

                        <div className="timeline-container">
                          {(comoData?.passos || levisResult.regras)?.map((step, idx) => (
                            <div key={idx} className="timeline-step">
                              <span className="timeline-number">#{step.ordem || idx + 1}</span>
                              <div className="timeline-content">
                                <div className="timeline-header">
                                  {step.modulo && <span className="badge-module">{step.modulo}</span>}
                                  <span className="rule-code">{step.codigoRegra}</span>
                                  {step.nomeRegra && (
                                    <span className="rule-title">— {step.nomeRegra}</span>
                                  )}
                                  {step.resultado && (
                                    <span
                                      className={`badge-tag ${
                                        step.resultado === "PERMITIR"
                                          ? "permitir"
                                          : step.resultado === "RECUSAR"
                                          ? "recusar"
                                          : "rever"
                                      }`}
                                      style={{ marginLeft: "auto" }}
                                    >
                                      {step.resultado}
                                    </span>
                                  )}
                                </div>
                                <p className="timeline-message">{step.mensagem}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SUBTAB 2: PORQUE NÃO? */}
                {explainSubTab === "porque-nao" && (
                  <div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap" }}>
                      <span className="presets-label" style={{ marginBottom: 0 }}>
                        Investigar por que não:
                      </span>
                      <button
                        className={`scenario-pill-btn ${porqueNaoTarget === "OUT-001:PERMITIR" ? "active" : ""}`}
                        onClick={() => {
                          setPorqueNaoTarget("OUT-001:PERMITIR");
                          if (levisResult?.avaliacaoId) fetchPorqueNao(levisResult.avaliacaoId, "OUT-001:PERMITIR");
                        }}
                      >
                        OUT-001: PERMITIR
                      </button>
                      <button
                        className={`scenario-pill-btn ${porqueNaoTarget === "OUT-004:DINHEIRO" ? "active" : ""}`}
                        onClick={() => {
                          setPorqueNaoTarget("OUT-004:DINHEIRO");
                          if (levisResult?.avaliacaoId) fetchPorqueNao(levisResult.avaliacaoId, "OUT-004:DINHEIRO");
                        }}
                      >
                        OUT-004: Reembolso em Dinheiro
                      </button>
                    </div>

                    {porqueNaoLoading ? (
                      <div className="empty-state">A avaliar condições que falharam...</div>
                    ) : porqueNaoData ? (
                      <div>
                        {porqueNaoData.resumo && (
                          <div
                            style={{
                              background: "rgba(245, 158, 11, 0.08)",
                              border: "1px solid rgba(245, 158, 11, 0.25)",
                              borderRadius: "6px",
                              padding: "10px 14px",
                              fontSize: "0.84rem",
                              marginBottom: "12px",
                              color: "#fef08a",
                            }}
                          >
                            🛡️ {porqueNaoData.resumo}
                          </div>
                        )}

                        <div className="conditions-list">
                          {porqueNaoData.regras?.map((rg, rIdx) => (
                            <div key={rIdx} className="card" style={{ padding: "12px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                <div>
                                  <strong>{rg.codigoRegra}</strong>: {rg.variante || "Regra candidata"}
                                </div>
                                <span className="badge-tag recusar">{rg.causa}</span>
                              </div>
                              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "8px" }}>
                                {rg.resumo}
                              </p>

                              {rg.condicoes && rg.condicoes.length > 0 && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  {rg.condicoes.map((cond, cIdx) => (
                                    <div key={cIdx} className="condition-row">
                                      <span className="condition-status-icon">
                                        {cond.cumprida ? "🟢" : "🔴"}
                                      </span>
                                      <div className="condition-text">
                                        <div>{cond.descricao || cond.nome}</div>
                                        {cond.valor && <div className="condition-val">{cond.valor}</div>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="empty-state">
                        Nenhuma justificação de não-disparo gerada.
                      </div>
                    )}
                  </div>
                )}

                {/* SUBTAB 3: PORQUÊ? (Perguntas requeridas) */}
                {explainSubTab === "porque" && (
                  <div>
                    {dadosEmFaltaLoading ? (
                      <div className="empty-state">A consultar dados pendentes...</div>
                    ) : dadosEmFaltaData ? (
                      <div>
                        {dadosEmFaltaData.resumo && (
                          <div
                            style={{
                              background: "rgba(59, 130, 246, 0.08)",
                              border: "1px solid rgba(59, 130, 246, 0.25)",
                              borderRadius: "6px",
                              padding: "10px 14px",
                              fontSize: "0.84rem",
                              marginBottom: "12px",
                              color: "#bfdbfe",
                            }}
                          >
                            📋 {dadosEmFaltaData.resumo}
                          </div>
                        )}

                        {dadosEmFaltaData.dados?.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {dadosEmFaltaData.dados.map((dado, idx) => (
                              <div key={idx} className="card" style={{ padding: "14px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span className="badge-tag rever">{dado.codigo}</span>
                                  <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>
                                    {dado.caminho}
                                  </span>
                                </div>
                                <div style={{ fontSize: "0.9rem", fontWeight: 600, margin: "8px 0" }}>
                                  {dado.porque?.pergunta || dado.descricao}
                                </div>
                                {dado.porque?.resumo && (
                                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                                    {dado.porque.resumo}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="empty-state">
                            ✅ Todos os factos necessários para a decisão final estão preenchidos.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="empty-state">Nenhum dado em falta registado.</div>
                    )}
                  </div>
                )}

                {/* SUBTAB 4: E SE? (Simulador Contrafactual) */}
                {explainSubTab === "simulacao" && (
                  <div>
                    <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                      Teste hipóteses e verifique em tempo real como pequenas variações nos factos alteram a decisão sem persistir na base de dados.
                    </p>

                    {/* Botões Rápidos de Simulação com 1 clique */}
                    <div style={{ marginBottom: "14px" }}>
                      <span className="presets-label">Simulações Rápidas (1 clique):</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        <button
                          className="sim-quick-btn"
                          onClick={() => {
                            setSimField("artigos[0].estado.etiquetas");
                            setSimValue("COLOCADAS");
                            handleSimular({ "artigos[0].estado.etiquetas": "COLOCADAS" });
                          }}
                          disabled={simulacaoLoading}
                        >
                          🏷️ Marcar Etiquetas como Colocadas (COLOCADAS)
                        </button>
                        <button
                          className="sim-quick-btn"
                          onClick={() => {
                            setSimField("portalOnlineDisponivel");
                            setSimValue("true");
                            handleSimular({ portalOnlineDisponivel: true });
                          }}
                          disabled={simulacaoLoading}
                        >
                          🌐 Portal Online Disponível
                        </button>
                        <button
                          className="sim-quick-btn"
                          onClick={() => {
                            setSimField("artigos[0].estado.condicaoUso");
                            setSimValue("USADO");
                            handleSimular({ "artigos[0].estado.condicaoUso": "USADO" });
                          }}
                          disabled={simulacaoLoading}
                        >
                          👕 Alterar Artigo para Usado
                        </button>
                      </div>
                    </div>

                    {/* Formulário de alteração customizada */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr auto",
                        gap: "10px",
                        alignItems: "flex-end",
                        marginBottom: "14px",
                      }}
                    >
                      <div>
                        <label className="form-label">Caminho da Propriedade</label>
                        <input
                          type="text"
                          className="form-input"
                          value={simField}
                          onChange={(e) => setSimField(e.target.value)}
                          placeholder="artigos[0].estado.etiquetas"
                        />
                      </div>
                      <div>
                        <label className="form-label">Novo Valor Hipotético</label>
                        <input
                          type="text"
                          className="form-input"
                          value={simValue}
                          onChange={(e) => setSimValue(e.target.value)}
                          placeholder="COLOCADAS"
                        />
                      </div>
                      <button
                        className="btn-refresh"
                        style={{
                          background: "var(--accent)",
                          color: "#fff",
                          borderColor: "var(--accent)",
                          padding: "10px 16px",
                        }}
                        onClick={() => {
                          let val: any = simValue;
                          if (simValue === "true") val = true;
                          else if (simValue === "false") val = false;
                          else if (!isNaN(Number(simValue))) val = Number(simValue);
                          handleSimular({ [simField]: val });
                        }}
                        disabled={simulacaoLoading}
                      >
                        {simulacaoLoading ? "A simular..." : "Executar Simulação"}
                      </button>
                    </div>

                    {simulacaoError && <div className="error-banner">{simulacaoError}</div>}

                    {/* Resultado da Simulação (Delta Comparativo) */}
                    {simulacaoData && (
                      <div className="diff-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong>Resultado da Simulação Contrafactual:</strong>
                          <span className="badge-tag permitir">
                            {simulacaoData.decisaoSimulada?.elegibilidade || "SIMULADO"}
                          </span>
                        </div>

                        {simulacaoData.resumo && (
                          <div
                            style={{
                              background: "rgba(16, 185, 129, 0.08)",
                              border: "1px solid rgba(16, 185, 129, 0.25)",
                              borderRadius: "6px",
                              padding: "10px 12px",
                              margin: "10px 0",
                              fontSize: "0.84rem",
                              color: "#6ee7b7",
                            }}
                          >
                            ✨ {simulacaoData.resumo}
                          </div>
                        )}

                        <div className="diff-comparison-grid">
                          <div className="diff-side">
                            <div className="diff-side-title">Decisão Original</div>
                            <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                              {levisResult.elegibilidade}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-subtle)", marginTop: "4px" }}>
                              Aprovação: {levisResult.aprovacao || "Padrão"}
                            </div>
                          </div>

                          <div className="diff-side">
                            <div className="diff-side-title">Nova Decisão Simulada</div>
                            <div
                              style={{
                                fontSize: "1.1rem",
                                fontWeight: 700,
                                color:
                                  simulacaoData.decisaoSimulada?.elegibilidade === "PERMITIR"
                                    ? "#10b981"
                                    : "#f59e0b",
                              }}
                            >
                              {simulacaoData.decisaoSimulada?.elegibilidade || "N/A"}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-subtle)", marginTop: "4px" }}>
                              Aprovação: {simulacaoData.decisaoSimulada?.aprovacao || "Padrão"}
                            </div>
                          </div>
                        </div>

                        {simulacaoData.diferencas && simulacaoData.diferencas.length > 0 && (
                          <div style={{ marginTop: "10px" }}>
                            <span className="presets-label">Diferenças Detetadas:</span>
                            <ul className="justification-list">
                              {simulacaoData.diferencas.map((d, idx) => (
                                <li key={idx} className="justification-item">
                                  <strong>{d.campo}:</strong>{" "}
                                  <span style={{ color: "#ef4444" }}>{d.original || "null"}</span>{" "}
                                  ➔ <span style={{ color: "#10b981" }}>{d.simulado}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
                          {simulacaoData.regrasNovas && simulacaoData.regrasNovas.length > 0 && (
                            <div style={{ flex: 1, minWidth: "180px" }}>
                              <span className="presets-label" style={{ color: "#10b981" }}>
                                + Regras Novas Ativadas:
                              </span>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                                {simulacaoData.regrasNovas.map((r) => (
                                  <span key={r} className="badge-tag permitir">
                                    {r}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {simulacaoData.regrasRemovidas && simulacaoData.regrasRemovidas.length > 0 && (
                            <div style={{ flex: 1, minWidth: "180px" }}>
                              <span className="presets-label" style={{ color: "#ef4444" }}>
                                - Regras Deixaram de Disparar:
                              </span>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                                {simulacaoData.regrasRemovidas.map((r) => (
                                  <span key={r} className="badge-tag recusar">
                                    {r}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              {levisLoading
                ? "A executar inferência pericial no motor Drools..."
                : "Selecione um dos 10 cenários acima para visualizar a decisão em tempo real."}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 1: PROLOG EVALUATE (POC)                                         */}
      {/* ==================================================================== */}
      {activeTab === "prolog" && (
        <div className="grid-2">
          <div className="card">
            <h2 className="card-title">Enviar Avaliação (Prolog)</h2>
            <p className="card-desc">
              Testa o endpoint <code>POST /api/v1/evaluate</code> contra as regras de inferência Prolog.
            </p>

            <div className="presets-section">
              <div className="presets-label">Cenários Rápidos (1 clique)</div>
              <div className="presets-btns">
                {POC_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    className={`btn-preset ${
                      prologScenario === p.payload.scenario && prologValue === p.payload.value
                        ? "active"
                        : ""
                    }`}
                    onClick={() => applyPocPreset(p)}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePrologEvaluate(prologScenario, prologValue);
              }}
            >
              <div className="form-group">
                <label className="form-label">Identificador do Cenário (scenario)</label>
                <input
                  type="text"
                  className="form-input"
                  value={prologScenario}
                  onChange={(e) => setPrologScenario(e.target.value)}
                  placeholder="test"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Valor Numérico (value)</label>
                <input
                  type="number"
                  className="form-input"
                  value={prologValue}
                  onChange={(e) => setPrologValue(Number(e.target.value))}
                  placeholder="42"
                  required
                />
                <span
                  style={{
                    fontSize: "0.76rem",
                    color: "var(--text-subtle)",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  Regra: <code>42</code> = Aprovado | Outro valor = Rejeitado
                </span>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={prologLoading}
              >
                {prologLoading ? "A avaliar no Prolog..." : "Executar Avaliação (Prolog)"}
              </button>
            </form>
          </div>

          <div className="card">
            <h2 className="card-title">Resultado da Avaliação</h2>
            <p className="card-desc">Decisão e cadeia de justificação devolvida pelo motor pericial.</p>

            {prologError && <div className="error-banner">{prologError}</div>}

            {prologResult ? (
              <div>
                <div className="result-box">
                  <div className="result-header">
                    <span
                      className={`badge-decision ${
                        prologResult.decision === "approved"
                          ? "approved"
                          : prologResult.decision === "rejected"
                          ? "rejected"
                          : "info"
                      }`}
                    >
                      {prologResult.decision.toUpperCase()}
                    </span>
                    <span className="meta-info">
                      Motor: {prologResult.engine} | {prologDuration}ms
                    </span>
                  </div>

                  <div style={{ marginTop: "10px" }}>
                    <div className="presets-label">Justificação / Regras Disparadas:</div>
                    <ul className="justification-list">
                      {prologResult.justification?.map((item, idx) => (
                        <li key={idx} className="justification-item">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="presets-label" style={{ marginTop: "14px" }}>
                  Payload JSON da Resposta:
                </div>
                <pre className="code-block">{JSON.stringify(prologResult, null, 2)}</pre>
              </div>
            ) : (
              <div className="empty-state">
                {prologLoading
                  ? "A comunicar com o motor de inferência..."
                  : "Clique num cenário rápido ou preencha o formulário e clique em 'Executar Avaliação'."}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: DROOLS CLINICAL EVALUATE                                      */}
      {/* ==================================================================== */}
      {activeTab === "drools" && (
        <div className="grid-2">
          <div className="card">
            <h2 className="card-title">Avaliação Drools (Regras de Produção)</h2>
            <p className="card-desc">
              Testa o endpoint <code>POST /api/v1/drools/evaluate</code> contra o motor clínico.
            </p>

            <div className="presets-section">
              <div className="presets-label">Diagnósticos Pré-Configurados</div>
              <div className="presets-btns">
                {DROOLS_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    className={`btn-preset ${
                      selectedDroolsPresetId === p.id ? "active" : ""
                    }`}
                    onClick={() => applyDroolsPreset(p)}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Sintomas / Evidências (JSON)</label>
              <textarea
                className="form-textarea"
                rows={8}
                value={droolsPayloadText}
                onChange={(e) => setDroolsPayloadText(e.target.value)}
              />
            </div>

            <button
              className="btn-primary"
              onClick={handleDroolsEvaluate}
              disabled={droolsLoading}
            >
              {droolsLoading ? "A avaliar no Drools..." : "Executar Avaliação (Drools)"}
            </button>
          </div>

          <div className="card">
            <h2 className="card-title">Resultado Drools</h2>
            <p className="card-desc">Diagnóstico clínico, conclusões e regras Rete-OO disparadas.</p>

            {droolsError && <div className="error-banner">{droolsError}</div>}

            {droolsResult ? (
              <div>
                <div className="result-box">
                  <div className="result-header">
                    <span className="badge-decision approved">
                      {droolsResult.primaryDiagnosis || "Diagnóstico Identificado"}
                    </span>
                    <span className="meta-info">
                      Status: {droolsResult.status} | {droolsDuration}ms
                    </span>
                  </div>

                  {droolsResult.hypothesis && (
                    <div
                      style={{
                        fontSize: "0.84rem",
                        color: "var(--text-muted)",
                        marginBottom: "8px",
                      }}
                    >
                      Hipótese Deduzida: <strong>{droolsResult.hypothesis}</strong>
                    </div>
                  )}

                  <div className="presets-label" style={{ marginTop: "10px" }}>
                    Regras Disparadas ({droolsResult.firedRules?.length || 0}):
                  </div>
                  <ul className="justification-list">
                    {droolsResult.firedRules?.map((rule, idx) => (
                      <li key={idx} className="justification-item">
                        <code>{rule}</code>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="presets-label" style={{ marginTop: "14px" }}>
                  Payload JSON da Resposta:
                </div>
                <pre className="code-block">{JSON.stringify(droolsResult, null, 2)}</pre>
              </div>
            ) : (
              <div className="empty-state">
                {droolsLoading
                  ? "A executar avaliação Rete-OO no Drools..."
                  : "Selecione um caso clínico pré-configurado e clique em 'Executar Avaliação'."}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: ACADEMIC PROLOG INFERENCE                                     */}
      {/* ==================================================================== */}
      {activeTab === "academic" && (
        <div>
          <div className="card" style={{ marginBottom: "20px" }}>
            <h2 className="card-title">Motor de Inferência Académico (sp_exp2.pl)</h2>
            <p className="card-desc">
              Motor dedutivo pedagógico baseado no ficheiro de apoio do Moodle. Suporta carregamento de base de conhecimento,
              encadeamento para a frente (*forward chaining*) e listagem de factos.
            </p>

            <div className="btn-group-row">
              <button
                className="btn-action"
                disabled={academicLoading}
                onClick={() => handleAcademicAction("load")}
              >
                📥 1. Carregar Base &quot;vehicles&quot;
              </button>
              <button
                className="btn-action"
                disabled={academicLoading}
                onClick={() => handleAcademicAction("run")}
              >
                ⚙️ 2. Executar Inferência
              </button>
              <button
                className="btn-action"
                disabled={academicLoading}
                onClick={() => handleAcademicAction("facts")}
              >
                📋 3. Listar Factos Ativos
              </button>
              <button
                className="btn-action"
                disabled={academicLoading}
                onClick={() => handleAcademicAction("reset")}
              >
                🔄 4. Reset do Motor
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">
              {academicAction ? `Resposta da Ação: ${academicAction.toUpperCase()}` : "Registo de Operação"}
            </h2>
            <p className="card-desc">Saída gerada pelo motor SWI-Prolog com factos ou regras deduzidas.</p>

            {academicError && <div className="error-banner">{academicError}</div>}

            {academicResponse ? (
              <div>
                {academicResponse.derived_facts && (
                  <div className="result-box" style={{ marginBottom: "14px" }}>
                    <div className="result-header">
                      <span className="badge-decision info">
                        {academicResponse.derived_facts_count} Factos Derivados
                      </span>
                      <span className="meta-info">Total Factos: {academicResponse.total_facts}</span>
                    </div>

                    <ul className="justification-list">
                      {academicResponse.derived_facts.map((df: any) => (
                        <li key={df.id} className="justification-item">
                          <strong>ID {df.id}:</strong> <code>{df.fact}</code> (Regra #{df.rule_id} via factos{" "}
                          {JSON.stringify(df.justified_by)})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {academicResponse.facts && (
                  <div className="result-box" style={{ marginBottom: "14px" }}>
                    <div className="result-header">
                      <span className="badge-decision info">
                        {academicResponse.facts_count} Factos em Memória
                      </span>
                    </div>

                    <ul className="justification-list">
                      {academicResponse.facts.map((f: any) => (
                        <li key={f.id} className="justification-item">
                          <strong>ID {f.id}:</strong> <code>{f.fact}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="presets-label">JSON Retornado:</div>
                <pre className="code-block">{JSON.stringify(academicResponse, null, 2)}</pre>
              </div>
            ) : (
              <div className="empty-state">
                {academicLoading ? "A executar operação..." : "Clique numa das ações acima."}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: HTTP PLAYGROUND                                               */}
      {/* ==================================================================== */}
      {activeTab === "playground" && (
        <div className="grid-2">
          <div className="card">
            <h2 className="card-title">Playground HTTP Livre</h2>
            <p className="card-desc">Execute qualquer pedido direto contra a API do FastAPI Orquestrador.</p>

            <form onSubmit={handlePlaygroundSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr",
                  gap: "10px",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <label className="form-label">Método</label>
                  <select
                    className="form-input"
                    value={pgMethod}
                    onChange={(e) => setPgMethod(e.target.value as "GET" | "POST")}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Endpoint</label>
                  <input
                    type="text"
                    className="form-input"
                    value={pgEndpoint}
                    onChange={(e) => setPgEndpoint(e.target.value)}
                    placeholder="/api/v1/health"
                    required
                  />
                </div>
              </div>

              {pgMethod === "POST" && (
                <div className="form-group">
                  <label className="form-label">Corpo do Pedido (JSON)</label>
                  <textarea
                    className="form-textarea"
                    rows={8}
                    value={pgBody}
                    onChange={(e) => setPgBody(e.target.value)}
                    placeholder='{"scenario": "test", "value": 42}'
                  />
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={pgLoading}
              >
                {pgLoading ? "A enviar pedido..." : "Enviar Pedido HTTP"}
              </button>
            </form>
          </div>

          <div className="card">
            <h2 className="card-title">Resposta HTTP</h2>
            <p className="card-desc">Status code, tempo de resposta e conteúdo retornado.</p>

            {pgError && <div className="error-banner">{pgError}</div>}

            {pgResult !== null ? (
              <div>
                <div className="result-header">
                  <span
                    className={`badge-decision ${
                      pgStatus && pgStatus < 300 ? "approved" : "rejected"
                    }`}
                  >
                    HTTP {pgStatus}
                  </span>
                  <span className="meta-info">{pgDuration}ms</span>
                </div>

                <div className="presets-label" style={{ marginTop: "10px" }}>
                  Resposta (JSON):
                </div>
                <pre className="code-block">{JSON.stringify(pgResult, null, 2)}</pre>
              </div>
            ) : (
              <div className="empty-state">
                {pgLoading ? "A aguardar resposta..." : "Defina o endpoint e clique em 'Enviar Pedido HTTP'."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

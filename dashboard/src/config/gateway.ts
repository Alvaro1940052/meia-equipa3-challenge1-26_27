// Gateway e motores: configurável via variável de ambiente ou fallback para localhost.
export const GATEWAY_URL = process.env.GATEWAY_URL || "http://127.0.0.1:8000";

export const GATEWAY_TIMEOUT_MS = 15_000;

export type EngineId = "returns" | "prolog";

type Method = "GET" | "POST";

interface AllowedRoute {
  method: Method;
  /** Padrão relativo ao prefixo do motor; `*` casa exatamente um segmento. */
  pattern: string;
}

interface EngineProxyConfig {
  /** Prefixo do gateway onde o motor está exposto. */
  gatewayPrefix: string;
  allowed: AllowedRoute[];
}

// Só os paths listados aqui podem ser alcançados pelo browser.
export const ENGINE_PROXY: Record<EngineId, EngineProxyConfig> = {
  returns: {
    gatewayPrefix: "/api/v1/levis",
    allowed: [
      { method: "POST", pattern: "avaliar" },
      { method: "GET", pattern: "avaliacoes" },
      { method: "GET", pattern: "avaliacoes/*" },
      { method: "GET", pattern: "avaliacoes/*/explicacoes/como" },
      { method: "GET", pattern: "avaliacoes/*/explicacoes/porque-nao" },
      { method: "POST", pattern: "avaliacoes/*/simulacoes" },
      { method: "POST", pattern: "dados-em-falta" },
      { method: "POST", pattern: "porque" },
      { method: "GET", pattern: "regras" },
      { method: "GET", pattern: "regras/*" },
      { method: "GET", pattern: "cenarios-exemplo" },
      { method: "GET", pattern: "cenarios-exemplo/*" },
      { method: "GET", pattern: "health" },
    ],
  },
  prolog: {
    gatewayPrefix: "/api/v1/retail",
    allowed: [
      { method: "POST", pattern: "avaliar" },
      { method: "GET", pattern: "avaliacoes" },
      { method: "GET", pattern: "avaliacoes/*" },
      { method: "GET", pattern: "avaliacoes/*/explicacoes/como" },
      { method: "GET", pattern: "avaliacoes/*/explicacoes/porque-nao" },
      { method: "POST", pattern: "avaliacoes/*/simulacoes" },
      { method: "POST", pattern: "dados-em-falta" },
      { method: "POST", pattern: "porque" },
      { method: "GET", pattern: "cenarios-exemplo" },
      { method: "GET", pattern: "cenarios-exemplo/*" },
      { method: "GET", pattern: "health" },
    ],
  },
};

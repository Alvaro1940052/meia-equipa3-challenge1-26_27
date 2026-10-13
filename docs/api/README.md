# Referência de APIs e Contratos de Comunicação
### *Sistema Pericial de Diagnóstico para Devoluções e Trocas no Retalho*

---

## 1. Visão Geral

Esta secção contém a documentação técnica de referência de todas as interfaces de programação (APIs) e contratos de dados (*schemas*) que compõem o sistema. 

O ecossistema adota uma abordagem orientada a micro-serviços com separação estrita entre a **camada de orquestração externa** e a **camada de inferência interna**:

```mermaid
flowchart TD
    subgraph "Camada Externa (Pública / Clientes)"
        Client["Aplicações Clientes\n(Frontend, CLI, Postman)"]
    end

    subgraph "Camada de Orquestração (Porta 8000)"
        FastAPI["FastAPI Orchestrator\n(backend_orchestrator)"]
        Swagger["Documentação Interativa\n(/docs e /redoc)"]
    end

    subgraph "Camada de Inferência (Interna)"
        Prolog["Motor SWI-Prolog\n(prolog_engine :8080)"]
        Drools["Motor Drools Levi's\n(pericial-api :8082)"]
    end

    Client -->|"POST /api/v1/levis/avaliar\nPOST /api/v1/evaluate\nGET /health"| FastAPI
    FastAPI --- Swagger
    FastAPI -->|"POST /evaluate (JSON síncrono)"| Prolog
    FastAPI -->|"POST /api/v1/avaliacoes (REST + JWT)\nGET /api/v1/avaliacoes/.../explicacoes/*"| Drools
```

---

## 2. Índice de Documentos da Secção

| Documento | Ficheiro | Descrição e Propósito |
|:---|:---|:---|
| **API Pública v1 do Orquestrador** | [`orchestrator_api_v1.md`](orchestrator_api_v1.md) | Especificação completa da API REST do FastAPI: endpoints `/api/v1/levis/*` (avaliações, explicabilidade, simulações, regras), `/api/v1/evaluate` (Prolog), exemplos cURL/PowerShell e matriz de erros HTTP. |
| **API Interna do Motor Prolog** | [`prolog_engine_api.md`](prolog_engine_api.md) | Especificação do contrato HTTP interno do micro-serviço SWI-Prolog: endpoints `/evaluate` e `/inference/*`, contratos POC e evolução para contratos de retalho. |
| **API Interna do Motor Drools** | [`drools_engine_api.md`](drools_engine_api.md) | Especificação da API REST interna do motor Drools (Java 21 / Spring Boot 3): endpoints do motor de devoluções Levi's (`/api/v1/avaliacoes`, `/explicacoes/*`, `/simulacoes`, `/regras`) e arquivo histórico da POC clínica. |
| **Modelos de Dados, Schemas e DTOs** | [`schemas.md`](schemas.md) | Catálogo exaustivo de todos os modelos Pydantic v2 e DTOs Java / Spring Boot: contratos da Levi's (`PedidoAvaliacaoRequest`, `DecisaoResponse`), validações Bean Validation e factos de domínio. |

---

## 3. Resumo dos Endpoints Disponíveis

### 3.1 Backend Orquestrador (FastAPI — Porta 8000)

| Método | Endpoint | Acesso | Descrição |
|:---|:---|:---:|:---|
| `GET` | `/health` / `/api/v1/health` | Público | Verificação de estado operacional e sondagem de conectividade aos motores. |
| `POST` | `/api/v1/levis/avaliar` | Público | Avaliação completa de devoluções/trocas Levi's no motor Drools (98 regras DRL). |
| `GET` | `/api/v1/levis/avaliacoes/{id}` | Público | Consulta de histórico de avaliação por UUID persistido em PostgreSQL. |
| `GET` | `/api/v1/levis/avaliacoes/{id}/explicacoes/como` | Público | Explicação causal *Como?* (regras disparadas e módulos percorridos). |
| `GET` | `/api/v1/levis/avaliacoes/{id}/explicacoes/porque-nao` | Público | Análise contrafactual *Porque não?* (condições que falharam para desfechos alternativos). |
| `GET` | `/api/v1/levis/avaliacoes/{id}/explicacoes/porque` | Público | Justificação *Porquê?* das questões requeridas ao operador de caixa. |
| `GET` | `/api/v1/levis/avaliacoes/{id}/explicacoes/o-que-falta` | Público | Identificação de atributos em falta para desbloquear aprovação. |
| `POST` | `/api/v1/levis/avaliacoes/{id}/simulacoes` | Público | Simulador inline *E se?* (*What-if*) sem persistência na base de dados. |
| `GET` | `/api/v1/levis/regras` | Público | Catálogo das 98 regras ativas na base de conhecimento Drools. |
| `GET` | `/api/v1/levis/cenarios-exemplo` | Público | Lista dos 10 cenários de teste reais pré-formatados da Levi's. |
| `POST` | `/api/v1/evaluate` | Público | Submissão de cenários ao motor declarativo SWI-Prolog com retorno explicativo. |
| `GET` | `/docs` | Navegador | Interface Swagger UI OpenAPI 3.1 interativa. |
| `GET` | `/redoc` | Navegador | Interface de documentação técnica ReDoc. |

### 3.2 Motor de Inferência (SWI-Prolog — Porta 8080)

| Método | Endpoint | Acesso | Descrição |
|:---|:---|:---:|:---|
| `POST` | `/evaluate` | **Interno** | Endpoint de avaliação lógica pura consumido exclusivamente pelo Orquestrador. |
| `POST` | `/inference/load` | **Interno** | Carregamento dinâmico de base de conhecimento em memória. |
| `POST` | `/inference/run` | **Interno** | Execução do ciclo de encadeamento para a frente (*forward-chaining*). |
| `GET` | `/inference/facts` | **Interno** | Listagem de todos os factos ativos na memória de trabalho. |
| `POST` | `/inference/how` | **Interno** | Explicação causal de derivação de um facto (*How*). |
| `POST` | `/inference/whynot` | **Interno** | Explicação de ausência de derivação (*Why Not*). |
| `POST` | `/inference/reset` | **Interno** | Reposição e limpeza da sessão do motor pericial. |

### 3.3 Motor de Inferência Drools Levi's (Java 21 / Spring Boot 3 — Porta 8082)

| Método | Endpoint | Acesso | Descrição |
|:---|:---|:---:|:---|
| `POST` | `/api/v1/avaliacoes` | **Interno (JWT)** | Avaliação pericial Drools com persistência no PostgreSQL e auditoria de regras. |
| `GET` | `/api/v1/avaliacoes/{id}/explicacoes/como` | **Interno (JWT)** | Devolve o rasto sequencial das regras disparadas para a avaliação. |
| `GET` | `/api/v1/avaliacoes/{id}/explicacoes/porque-nao` | **Interno (JWT)** | Devolve análise contrafactual de antecedentes não cumpridos. |
| `POST` | `/api/v1/avaliacoes/{id}/simulacoes` | **Interno (JWT)** | Executa simulação *What-if* sobre o pedido em memória. |
| `GET` | `/api/v1/regras` | **Interno (JWT)** | Catálogo e metadados das 98 regras DRL ativas. |
| `POST` | `/api/v1/dev/tokens` | **Interno (Dev)** | Emissão imediata de tokens JWT de teste para desenvolvimento. |

---

## 4. Convenções e Normas Técnicas

1. **Formatos de Dados:** Todos os endpoints com corpo de pedido ou resposta utilizam estritamente `application/json` codificado em UTF-8.
2. **Explicabilidade por Desenho:** Toda a resposta de avaliação inclui rastreabilidade: lista `justification` no motor Prolog e lista `firedRules` no motor Drools.
3. **Validação Rigorosa:** Incompatibilidades de tipos são intercetadas na fronteira: `HTTP 422 Unprocessable Entity` no FastAPI e `HTTP 400 Bad Request` no Spring Boot.
4. **Isolamento de Memória:** Sessões de inferência Drools (`KieSession`) são efémeras e descartadas (`dispose()`) após cada pedido para evitar retenção indesejada de factos e fugas de memória.

---

## 5. Referências Cruzadas

* [Visão Geral da Arquitetura](../architecture/system_overview.md) — Diagrama e posicionamento de cada serviço.
* [Arquitetura do Motor Drools](../architecture/drools_engine.md) — Camadas internas, ciclo de vida da KieSession e regras DRL.
* [Arquitetura do Motor Prolog](../architecture/prolog_engine.md) — Camadas de transporte e prova lógica do Prolog.
* [Interação e Fluxos entre Serviços](../architecture/service_interactions.md) — Diagrama de sequência ponta-a-ponta e fluxos de dados.
* [Explicabilidade e Transparência](../domain/explainability.md) — Requisitos de justificação das decisões.
* [Ambiente e Variáveis de Configuração](../deployment/environment_variables.md) — Configuração de portas, timeouts e URLs.


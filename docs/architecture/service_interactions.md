# Interações entre Serviços e Fluxos de Dados
### *Comunicação Inter-Serviços, Resolução DNS e Pipeline de Dados Ponta-a-Ponta*

---

## 1. Visão Geral da Comunicação

Num sistema distribuído de inteligência artificial pericial, a integridade da comunicação entre o orquestrador e os motores de regras é fundamental. 

O ecossistema integra dois motores simbólicos independentes para diagnóstico e triagem no retalho:
1. **Motor SWI-Prolog (`prolog_engine` :8080):** Lógica declarativa de primeira ordem para cenários de retalho e metaconhecimento com encadeamento causal (*How / Why Not*).
2. **Motor Drools Levi's (`drools-engine-levis-devolucoes-java` / `pericial-api` :8082):** Regras de produção Rete-OO em Java 21 / Spring Boot 3 para o caso de uso real de Devoluções e Trocas da **Levi Strauss & Co.** (98 regras DRL nos módulos M0 a M9), com persistência relacional em PostgreSQL 16 (`levis-postgres` :5432) e explicabilidade multi-via.

Este documento detalha o ciclo de vida completo das transações ponta-a-ponta de ambos os motores, os fluxos de autenticação JWT, as transformações de dados através das fronteiras de camada, a infraestrutura de rede Docker e as matrizes de tratamento de exceções.

---

## 2. Diagramas de Sequência Ponta-a-Ponta (End-to-End)

### 2.1 Ciclo de Vida do Pedido com Motor SWI-Prolog (Retalho / Domínio Declarativo)

O diagrama abaixo descreve a interação completa desde o pedido de avaliação de devolução submetido pelo cliente/frontend até à resposta final sintetizada:

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Cliente / Frontend POS
    participant FastAPIRouter as FastAPI Router (/api/v1/evaluate)
    participant Service as OrchestratorService
    participant Client as PrologClient (httpx)
    participant PrologSrv as Motor SWI-Prolog (:8080)
    participant PrologCore as Prolog Core Rules (rules.pl)

    Cliente->>FastAPIRouter: POST /api/v1/evaluate (JSON Payload)
    activate FastAPIRouter

    rect rgb(240, 245, 255)
        note over FastAPIRouter: 1. Validação Pydantic v2 (ScenarioInput)<br/>Falha gera HTTP 422 Unprocessable Entity
    end

    FastAPIRouter->>Service: evaluate_scenario(scenario_input)
    activate Service

    rect rgb(245, 250, 245)
        note over Service: 2. Conversão do modelo Pydantic<br/>payload = scenario_input.model_dump()
    end

    Service->>Client: evaluate(payload)
    activate Client

    rect rgb(250, 245, 255)
        note over Client: 3. Serialização JSON & Connection Pool<br/>Timeout configurado (ex.: 5.0s)
    end

    Client->>PrologSrv: HTTP POST /evaluate (JSON sobre Docker network)
    activate PrologSrv

    rect rgb(255, 255, 240)
        note over PrologSrv: 4. Despacho & http_read_json_dict/3<br>Conversão JSON para Prolog Dict
    end

    PrologSrv->>PrologCore: evaluate_scenario(+Dict, -Decision, -ExplanationList)
    activate PrologCore
    note over PrologCore: 5. Dedução lógica declarativa pura
    PrologCore-->>PrologSrv: Decision, ExplanationList
    deactivate PrologCore

    rect rgb(255, 255, 240)
        note over PrologSrv: 6. Serialização via reply_json_dict/1
    end

    PrologSrv-->>Client: HTTP 200 OK {"status": "success", "decision": "...", "justification": [...]}
    deactivate PrologSrv

    Client-->>Service: Dict com resposta desestruturada do Prolog
    deactivate Client

    rect rgb(245, 250, 245)
        note over Service: 7. Mapeamento & Síntese<br>_map_prolog_response para EvaluationResponse<br>Adiciona timestamp UTC e engine="prolog"
    end

    Service-->>FastAPIRouter: Instância tipada EvaluationResponse
    deactivate Service

    FastAPIRouter-->>Cliente: HTTP 200 OK (JSON Canónico com Explicabilidade)
    deactivate FastAPIRouter
```

---

### 2.2 Ciclo de Vida do Pedido com Motor Drools Levi's (Devoluções e Trocas de Retalho)

O diagrama abaixo ilustra a cadeia completa de processamento do motor Drools Levi's, incluindo a obtenção de token JWT dev, submissão de factos ao motor KIE, execução das 98 regras, persistência em PostgreSQL e extração de justificações:

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Operador / Dashboard (:3000)
    participant FastAPIRouter as FastAPI Router (/api/v1/levis/avaliar)
    participant LevisService as LevisService (FastAPI)
    participant LevisClient as LevisClient (httpx)
    participant DroolsApi as AvaliacaoController (pericial-api :8082)
    participant PericialSvc as PericialServiceImpl (Spring)
    participant KieSession as Drools KieSession (Working Memory)
    participant Postgres as PostgreSQL (:5432)

    Cliente->>FastAPIRouter: POST /api/v1/levis/avaliar (Pedido JSON)
    activate FastAPIRouter

    rect rgb(240, 245, 255)
        note over FastAPIRouter: 1. Validação Pydantic v2 (PedidoAvaliacaoRequest)<br/>Incompatibilidades geram HTTP 422
    end

    FastAPIRouter->>LevisService: evaluate(pedido)
    activate LevisService

    LevisService->>LevisClient: evaluate(pedido_dict)
    activate LevisClient

    rect rgb(255, 245, 230)
        note over LevisClient: 2. Gestão de Token JWT (Dev Profile)<br>Se sem token ou expirado:<br>POST /api/v1/dev/tokens emite Bearer token
    end

    LevisClient->>DroolsApi: POST /api/v1/avaliacoes (Headers: Authorization & Accept-Language)
    activate DroolsApi

    rect rgb(255, 255, 240)
        note over DroolsApi: 3. Bean Validation (@Valid PedidoAvaliacaoDto)<br>Violações geram HTTP 400 Bad Request
    end

    DroolsApi->>PericialSvc: avaliar(pedidoDto)
    activate PericialSvc

    rect rgb(245, 250, 245)
        note over PericialSvc: 4. Mapeamento DTO para Factos de Domínio<br>Instanciação de Pedido, Artigo(s), Comprovativo, Decisao
    end

    PericialSvc->>KieSession: Criar KieSession stateful & registar listener
    activate KieSession
    PericialSvc->>KieSession: insert(Pedido), insert(Artigos), insert(Comprovativo), insert(Decisao)
    PericialSvc->>KieSession: fireAllRules() através dos agenda-groups (M0 -> M9)

    rect rgb(245, 245, 255)
        note over KieSession: 5. Execução do algoritmo Rete-OO (98 regras DRL)<br/>- M0: Permissões de operador<br/>- M2: Canal de venda<br/>- M3: Elegibilidade física e etiquetas<br/>- M4/M5: Comprovativo e prazos<br/>- M6: Desfecho (PERMITIR/RECUSAR/REVER/ENCAMINHAR)<br/>- M7: Valor e meio de reembolso<br/>- M8: Controlos e limites anti-fraude<br/>- M9: Destino do artigo (Vendas/Biohazard/Armazém)
    end

    KieSession-->>PericialSvc: Decisao preenchida + Rasto de regras disparadas
    PericialSvc->>KieSession: dispose()
    deactivate KieSession

    PericialSvc->>Postgres: Salvar AvaliacaoEntity (JPA Repository)
    activate Postgres
    Postgres-->>PericialSvc: Confirmado (UUID gerado)
    deactivate Postgres

    PericialSvc-->>DroolsApi: DecisaoResponseDto
    deactivate PericialSvc

    DroolsApi-->>LevisClient: HTTP 200/201 DecisaoResponseDto
    deactivate DroolsApi

    LevisClient-->>LevisService: Dicionário tipado
    deactivate LevisClient

    LevisService-->>FastAPIRouter: Modelo Pydantic DecisaoResponse
    deactivate LevisService

    FastAPIRouter-->>Cliente: HTTP 200 OK (Decisão Completa com UUID, Auditoria e Destino)
    deactivate FastAPIRouter
```

---

### 2.3 Fluxo de Explicabilidade em Tempo Real (*Como?* e *Porque Não?*)

Quando o utilizador ou o operador de caixa solicita esclarecimentos sobre o porquê de uma decisão:

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Operador / Dashboard (:3000)
    participant FastAPI as FastAPI Router (/api/v1/levis/avaliacoes/{id}/explicacoes/...)
    participant LevisClient as LevisClient (httpx)
    participant DroolsExpl as ExplicacaoController (:8082)
    participant ExplService as ExplicacaoServiceImpl
    participant Postgres as PostgreSQL (:5432)

    Cliente->>FastAPI: GET /api/v1/levis/avaliacoes/{id}/explicacoes/como
    activate FastAPI
    FastAPI->>LevisClient: explain_how(avaliacao_id)
    activate LevisClient
    LevisClient->>DroolsExpl: GET /api/v1/avaliacoes/{id}/explicacoes/como (Bearer JWT)
    activate DroolsExpl
    DroolsExpl->>ExplService: explicarComo(id)
    activate ExplService
    ExplService->>Postgres: Carregar avaliação e rasto de regras
    Postgres-->>ExplService: Dados da avaliação persistida
    ExplService-->>DroolsExpl: ExplicacaoComoDto (passos, regras, módulos)
    deactivate ExplService
    DroolsExpl-->>LevisClient: HTTP 200 OK
    deactivate DroolsExpl
    LevisClient-->>FastAPI: Dict ExplicacaoComo
    deactivate LevisClient
    FastAPI-->>Cliente: HTTP 200 OK (Linha temporal e raciocínio causal)
    deactivate FastAPI
```

---

## 3. Pipelines de Transformação de Dados por Camada

### 3.1 Pipeline do Motor SWI-Prolog (Retalho Declarativo)

| Etapa | Fronteira / Componente | Formato de Dados | Exemplo / Representação |
|:---:|:---|:---|:---|
| **1** | Entrada no FastAPI | JSON Textual (HTTP Stream) | `{"scenario": "test", "value": 42}` |
| **2** | Camada de Rota | Instância Pydantic | `ScenarioInput(scenario='test', value=42)` |
| **3** | Serviço Orquestrador | Dicionário Python | `{"scenario": "test", "value": 42}` |
| **4** | Cliente HTTPX | JSON Serializado | Bytes em stream HTTP `POST /evaluate` |
| **5** | Camada HTTP Prolog | *Prolog Dict* com tag | `json{scenario: "test", value: 42}` |
| **6** | Camada Core Prolog | Termos Nativos Prolog | `Decision = approved`, `ExplanationList = [...]` |
| **7** | Resposta do Prolog | JSON Serializado | `{"status": "success", "decision": "approved", ...}` |
| **8** | Retorno ao Orquestrador | Dicionário Python | `{"status": "success", "decision": "approved", ...}` |
| **9** | Saída Canónica | Modelo `EvaluationResponse` | `EvaluationResponse(status='success', ...)` |
| **10**| Resposta ao Cliente | JSON Canónico Final | Serialização JSON compatível com Swagger OpenAPI |

### 3.2 Pipeline do Motor Drools Levi's (Retalho Especializado)

| Etapa | Fronteira / Componente | Formato de Dados | Exemplo / Representação |
|:---:|:---|:---|:---|
| **1** | Entrada no FastAPI | JSON Textual (HTTP Stream) | `{"tipoPedido": "DEVOLUCAO", "canal": "LOJA_FISICA", "artigos": [...]}` |
| **2** | Camada de Rota FastAPI | Schema Pydantic v2 | `PedidoAvaliacaoRequest(tipoPedido='DEVOLUCAO', ...)` |
| **3** | Cliente HTTPX (`LevisClient`) | JSON com Headers JWT | `POST /api/v1/avaliacoes` + `Authorization: Bearer <jwt>` |
| **4** | Controller Spring Boot | Record Java com Jakarta Validation | `PedidoAvaliacaoDto(tipoPedido, canal, artigos, ...)` |
| **5** | Camada de Domínio Java | Factos de Domínio Puros | `Pedido`, `Artigo`, `Comprovativo`, `Decisao` |
| **6** | Working Memory (Drools 8.44) | Factos em Memória (Rete-OO) | `kSession.insert(pedido)`, disparo por `agenda-group` |
| **7** | Execução de Regras | Dedução e Modificação de Factos | `PT-003`, `PT-020`, `modify($dec) { setElegibilidade(...) }` |
| **8** | Persistência Relacional | Entidade JPA / Hibernate | `AvaliacaoEntity` gravada no PostgreSQL com ID UUID |
| **9** | Resposta da API Spring | DTO Java Imutável | `DecisaoResponseDto(id, elegibilidade, valorReembolso, ...)` |
| **10**| Retorno ao Orquestrador | Dict Python Deserializado | `{"id": "...", "elegibilidade": "PERMITIR", ...}` |
| **11**| Resposta Canónica FastAPI | Schema Pydantic `DecisaoResponse` | Objeto validado com destino de artigos e rastreabilidade |

---

## 4. Topologia de Rede e Resolução DNS

No ambiente operacional com **Docker Compose**, todos os serviços comunicam através da rede interna virtualizada em modo bridge (`retail-network`):

```mermaid
flowchart TD
    subgraph Host ["Ambiente Host / Clientes Externos"]
        BROWSER["Navegador / Dashboard (:3000)"]
        ADMIN["Administrador / curl / Testes"]
    end

    subgraph DockerBridge ["Rede Bridge: retail-network"]
        ORCH["retail-backend-orchestrator<br>(FastAPI :8000)"]
        PROLOG["retail-prolog-engine<br>(SWI-Prolog :8080)"]
        DROOLS["drools-engine-levis<br>(pericial-api :8082)"]
        POSTGRES["levis-postgres<br>(PostgreSQL 16 :5432)"]
    end

    BROWSER -->|HTTP :8000 /api/v1/levis/*| ORCH
    ADMIN -->|HTTP :8000/docs| ORCH

    ORCH -->|http://prolog-engine:8080| PROLOG
    ORCH -->|http://drools-engine-levis:8082| DROOLS
    DROOLS -->|jdbc:postgresql://levis-postgres:5432/levis_db| POSTGRES
```

### Configuração de URLs e Portas por Ambiente:

| Variável de Ambiente | Valor em Docker Compose | Valor Local (Host) | Descrição |
|:---|:---|:---|:---|
| `PORT` | `8000` | `8000` | Porta do orquestrador FastAPI. |
| `PROLOG_ENGINE_URL` | `http://prolog-engine:8080` | `http://localhost:8080` | Endpoint do daemon SWI-Prolog. |
| `DROOLS_ENGINE_URL` | `http://drools-engine-levis:8082` | `http://localhost:8082` | Endpoint do micro-serviço Drools Levi's. |
| `SPRING_DATASOURCE_URL`| `jdbc:postgresql://levis-postgres:5432/levis_db` | `jdbc:postgresql://localhost:5432/levis_db` | Conexão JDBC para persistência PostgreSQL. |

---

## 5. Matriz de Códigos de Erro e Tratamento de Exceções

O orquestrador interceta falhas dos motores de regras e traduz-as em respostas HTTP normativas:

| Cenário de Erro | Componente / Causa Raiz | Deteção / Exceção Interna | Código HTTP Devolvido | Payload de Erro / Descrição |
|:---|:---|:---|:---:|:---|
| **JSON de Entrada Inválido (Prolog)** | Sintaxe corrompida ou campos em falta na rota de retalho | Pydantic `ValidationError` | `422 Unprocessable Entity` | Detalhe dos campos com falha de validação |
| **JSON de Entrada Inválido (Levi's)** | Payload sem `tipoPedido` ou sem artigos | Pydantic `ValidationError` | `422 Unprocessable Entity` | `"O pedido de avaliação exige 'tipoPedido' e pelo menos um artigo em 'artigos'."` |
| **Violação Bean Validation (Drools)** | Violação de formato no Spring Boot (`@Valid`) | `LevisResponseError` (HTTP 400 da API Drools) | `400 Bad Request` | Mensagem detalhada de violação Bean Validation |
| **Motor Prolog Desligado** | Daemon Prolog offline ou porta 8080 inacessível | `httpx.ConnectError` $\rightarrow$ `PrologConnectionError` | `503 Service Unavailable` | `"Could not connect to Prolog engine at '...'"` |
| **Motor Drools Levi's Desligado** | Processo `pericial-api` offline ou porta 8082 inacessível | `httpx.ConnectError` $\rightarrow$ `LevisConnectionError` | `503 Service Unavailable` | `"Could not connect to Levi's Drools engine at '...'"` |
| **Timeout de Inferência (Prolog)** | Resposta excede `PROLOG_TIMEOUT_SECONDS` (omissão 5.0s) | `httpx.TimeoutException` $\rightarrow$ `PrologTimeoutError` | `503 Service Unavailable` | `"Prolog engine timed out after 5.0s during evaluation"` |
| **Timeout de Inferência (Levi's)** | Inferência excede `DROOLS_TIMEOUT_SECONDS` (omissão 8.0s) | `httpx.TimeoutException` $\rightarrow$ `LevisTimeoutError` | `503 Service Unavailable` | `"Levi's Drools engine timed out during evaluation"` |
| **Erro de Gateway (Drools 500)** | Falha interna no Drools ou PostgreSQL | `LevisResponseError` (status $\ge$ 500) | `502 Bad Gateway` | Erro amigável sem exposição de rastos internos |

---

## 6. Coexistência Multi-Motor e Comparação de Desfechos

Com a integração do micro-serviço Drools Levi's, o sistema consolida o seu compromisso de arquitetura multi-paradigma:

1. **Rotas Dedicadas por Motor:**
   - `/api/v1/evaluate` e `/api/v1/inference/*` comunicam com o motor declarativo **SWI-Prolog**.
   - `/api/v1/levis/*` comunica com o motor de produção **Drools Levi's**.
2. **Comparação Cruzada de Desfechos:**
   A arquitetura permite submeter o mesmo cenário de retalho a ambos os motores para confrontar a dedução lógica declarativa com a inferência baseada em regras de produção Rete-OO, garantindo máxima fiabilidade na auditoria de políticas comerciais de retalho.

---

## 7. Documentos Relacionados

* [Visão Global da Arquitetura do Sistema](system_overview.md) — Diagrama e princípios globais do ecossistema.
* [Arquitetura do Motor Drools](drools_engine.md) — Módulos, regras DRL e persistência do Drools Levi's.
* [Arquitetura do Motor Prolog](prolog_engine.md) — Processamento interno e Clean Architecture no SWI-Prolog.
* [Arquitetura do Orquestrador FastAPI](fastapi_orchestrator.md) — Camadas internas, lifespan e connection pooling em Python.
* [Referência da API Pública v1](../api/orchestrator_api_v1.md) — Especificação detalhada dos endpoints `/api/v1/levis/*`.
* [Orquestração com Docker Compose](../deployment/docker_compose.md) — Topologia de rede, variáveis e contentores.

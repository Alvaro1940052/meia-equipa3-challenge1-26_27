# Arquitetura do Sistema
### *Retail Returns & Exchanges Diagnostic Expert System*

---

## 1. Visão Geral da Secção

Esta secção contém a documentação técnica aprofundada da arquitetura da solução, cobrindo o ecossistema global de micro-serviços, o desenho interno dos motores de raciocínio simbólico (SWI-Prolog para o domínio de retalho declarativo e Apache KIE Drools para as 98 regras de produção oficiais de devoluções da Levi's), a camada de orquestração assíncrona em FastAPI e os fluxos detalhados de dados entre componentes.

O sistema baseia-se em princípios sólidos de engenharia de software: **Clean Architecture**, **separação estrita de responsabilidades**, **desacoplamento de protocolos de transporte**, **tolerância a falhas** e **explicabilidade nativa** (*Why / Why not* / *Fired Rules*).

---

## 2. Índice de Documentos de Arquitetura

| Documento | Propósito | Conteúdo Central |
|:---|:---|:---|
| [Visão Global do Sistema (`system_overview.md`)](system_overview.md) | Visão macro e ecossistema | Diagrama de arquitetura global, descrição das camadas, princípios de desenho ("Regra de Ouro"), stack tecnológica completa e portas de serviço. |
| [Arquitetura do Motor Prolog (`prolog_engine.md`)](prolog_engine.md) | Desenho do micro-serviço SWI-Prolog | Clean Architecture (api vs core), ciclo de vida do pedido, isolamento de I/O, papel dos *Prolog Dicts* como DTOs nativos e predicados de domínio. |
| [Arquitetura do Motor Drools (`drools_engine.md`)](drools_engine.md) | Desenho do micro-serviço Drools Engine (Levi's) | Arquitetura modular em 7 módulos Maven (Java 21 / Spring Boot 3 / Drools 8.44), Rete-OO, base de 98 regras DRL (M0 a M9), explicabilidade em 5 vias, persistência em PostgreSQL e segurança JWT. |
| [Arquitetura do Orquestrador FastAPI (`fastapi_orchestrator.md`)](fastapi_orchestrator.md) | Desenho do backend orquestrador | Arquitetura em camadas (core, schemas, clients, services, api), gestão de ciclo de vida (*lifespan*), connection pooling com `httpx`, CORS e injeção de dependências. |
| [Interações entre Serviços e Fluxos de Dados (`service_interactions.md`)](service_interactions.md) | Comunicação e integração ponta-a-ponta | Diagramas de sequência detalhados (Prolog e Drools Levi's), autenticação JWT dev, pipelines de dados, DNS Docker e matriz de tratamento de erros. |
| [Análise Aprofundada do Motor sp_exp2 (`sp_exp2_engine_analysis.md`)](sp_exp2_engine_analysis.md) | Dissecação e adaptação do motor académico | Análise detalhada dos 6 blocos do `sp_exp2.pl`, ciclo de inferência, metaconhecimento, explicabilidade e roteiro de adaptação pericial para retalho. |

---

## 3. Mapa Visual de Componentes e Documentos

```mermaid
flowchart TD
    OVERVIEW["system_overview.md - Visão Global"]
    PROLOG_DOC["prolog_engine.md - Clean Architecture Prolog"]
    DROOLS_DOC["drools_engine.md - Regras Drools e Rete-OO"]
    FASTAPI_DOC["fastapi_orchestrator.md - Camadas e Pools FastAPI"]
    FLOW_DOC["service_interactions.md - Sequência e Pipelines"]

    OVERVIEW --> PROLOG_DOC
    OVERVIEW --> DROOLS_DOC
    OVERVIEW --> FASTAPI_DOC
    FASTAPI_DOC --> FLOW_DOC
    PROLOG_DOC --> FLOW_DOC
    DROOLS_DOC --> FLOW_DOC
```

---

## 4. Navegação no Repositório de Documentação

* **Domínio & Conhecimento:** [Conhecimento de Negócio e Heurísticas](../domain/README.md)
* **APIs & Contratos:** [Referência de APIs e Schemas](../api/README.md)
* **Deploy & Operações:** [Guia de Deploy e Docker](../deployment/README.md)
* **Desenvolvimento:** [Guias de Desenvolvimento e Testes](../development/README.md)
* **Histórico:** [Planos e Histórico de Implementação](../history/README.md)


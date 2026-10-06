# 05 — Estrutura e arquitetura do projeto

> Monorepositório com backend Java em Maven multi-módulo (Java 21, Spring Boot 3, Drools 8) e frontend Angular.
> Pacote base: `com.levis.devolucoes`.

## Estrutura de pastas

```
levis-devolucoes/
├── pom.xml                                  # POM pai: módulos, versões, plugins comuns
├── README.md                                # visão geral, comandos e convenções do projeto
├── .gitignore  .editorconfig
├── docker-compose.yml                       # PostgreSQL + backend + frontend
├── .github/workflows/ci.yml                 # build, testes, cobertura, análise, imagens Docker
├── docs/
│   ├── 01-base-conhecimento.md ... 06-casos-teste.md
│   ├── 07-plano.md                          # plano aprovado (criado na fase de planeamento)
│   └── adr/                                 # registos de decisões de arquitetura
│
├── backend/
│   ├── pericial-model/                      # MODEL: factos do domínio (POJO puros, sem Spring)
│   │   └── src/main/java/com/levis/devolucoes/model/
│   │       ├── pedido/      PedidoDevolucao, Loja, Colaborador, Cliente, CompraOriginal,
│   │       │                Comprovativo, Pagamento, PedidoExcecao
│   │       ├── produto/     Produto, ArtigoDevolvido, ArtigoTroca, EstadoProduto
│   │       ├── decisao/     Decisao, Documentacao, RegistoRegra, IndicadorFraude
│   │       └── enums/       Mercado, CanalCompra, MeioPagamento, Elegibilidade, Modulo, ...
│   │
│   ├── pericial-rules/                      # BASE DE CONHECIMENTO: kjar Drools versionado
│   │   ├── src/main/resources/
│   │   │   ├── META-INF/kmodule.xml         # kbase e ksessions (stateful e stateless)
│   │   │   └── com/levis/devolucoes/regras/
│   │   │       ├── m0-autorizacao.drl
│   │   │       ├── m2-canal.drl
│   │   │       ├── m3-elegibilidade.drl
│   │   │       ├── m4-m5-comprovativo-prazo.drl
│   │   │       ├── online.drl
│   │   │       ├── m6-resultado-excecoes.drl
│   │   │       ├── m7-valor.drl
│   │   │       ├── m7-meio-reembolso.drl
│   │   │       ├── m8-controlos.drl
│   │   │       ├── m9-destino.drl
│   │   │       ├── transversais.drl         # EX-008 e PC-008 (auto-focus)
│   │   │       └── consultas.drl            # queries usadas pelas explicações
│   │   └── src/test/
│   │       ├── java/.../regras/             # um teste por módulo + CenariosEsforcoTest
│   │       └── resources/cenarios/          # cenario-01.json ... cenario-10.json
│   │
│   ├── pericial-explanation/                # EXPLICAÇÕES: Como, Porquê, Porque não, E se
│   │   ├── src/main/java/com/levis/devolucoes/explicacao/
│   │   │   ├── rastreio/    RastreioListener (AgendaEventListener), RastreioExecucao,
│   │   │   │                EventoRegra (CRIADA, DISPARADA, CANCELADA)
│   │   │   ├── catalogo/    CatalogoRegras, MetadadosRegra, CondicaoRegra
│   │   │   ├── como/        ExplicadorComo
│   │   │   ├── porque/      ExplicadorPorque (perguntas), DadoEntrada, DependenciasDados
│   │   │   ├── porquenao/   ExplicadorPorqueNao, AvaliadorCondicoes, RegistoPredicados
│   │   │   ├── esenao/      SimuladorCenario
│   │   │   ├── emfalta/     DetetorDadosEmFalta
│   │   │   └── texto/       GeradorTexto
│   │   └── src/main/resources/i18n/  explicacoes_pt_PT.properties, explicacoes_en.properties
│   │
│   ├── pericial-dto/                        # DTO: contratos da API (records Java)
│   │   └── src/main/java/com/levis/devolucoes/dto/
│   │       ├── pedido/      PedidoAvaliacaoRequest, ArtigoRequest, ComprovativoRequest,
│   │       │                PagamentoRequest, PedidoExcecaoRequest
│   │       ├── decisao/     DecisaoResponse, ResultadoArtigoResponse, DocumentacaoResponse
│   │       ├── explicacao/  ExplicacaoComoResponse, ExplicacaoPorqueResponse,
│   │       │                ExplicacaoPorqueNaoResponse, PassoExplicacaoDto, DadoEmFaltaDto
│   │       ├── simulacao/   SimulacaoRequest, SimulacaoResponse (diferenças)
│   │       ├── regra/       RegraResumoDto, RegraDetalheDto
│   │       └── comum/       PaginaDto
│   │
│   ├── pericial-persistence/                # PERSISTÊNCIA: histórico e auditoria
│   │   ├── src/main/java/com/levis/devolucoes/persistencia/
│   │   │   ├── entidade/    AvaliacaoEntity, RegistoRegraEntity, ExcecaoAprovadaEntity
│   │   │   └── repositorio/ AvaliacaoRepository, RegistoRegraRepository
│   │   └── src/main/resources/db/migration/ V1__esquema_inicial.sql, ...  (Flyway)
│   │
│   ├── pericial-service/                    # SERVICE: lógica de negócio e integração
│   │   └── src/main/java/com/levis/devolucoes/service/
│   │       ├── motor/       MotorRegrasConfig (KieContainer), MotorRegrasService,
│   │       │                SessaoFactory, OrdemModulos
│   │       ├── avaliacao/   AvaliacaoService, ValidadorPedido
│   │       ├── explicacao/  ExplicacaoService
│   │       ├── simulacao/   SimulacaoService
│   │       ├── regra/       CatalogoRegrasService
│   │       ├── auditoria/   AuditoriaService
│   │       ├── mapeamento/  PedidoMapper, DecisaoMapper, ExplicacaoMapper (MapStruct)
│   │       ├── integracao/
│   │       │   ├── porta/      PosGateway, BackPocketGateway, CatalogoProdutoGateway,
│   │       │   │               PagamentoGateway
│   │       │   └── adaptador/  clientes REST reais + versões simuladas (perfil dev/test)
│   │       └── excecao/     PedidoInvalidoException, AvaliacaoNaoEncontradaException
│   │
│   └── pericial-api/                        # CONTROLLER: aplicação Spring Boot executável
│       ├── Dockerfile
│       └── src/
│           ├── main/java/com/levis/devolucoes/api/
│           │   ├── PericialApplication.java
│           │   ├── controller/      AvaliacaoController, ExplicacaoController,
│           │   │                    SimulacaoController, RegraController
│           │   ├── config/          SecurityConfig, OpenApiConfig, CorsConfig, JacksonConfig
│           │   ├── seguranca/       conversor JWT → papéis (STYLIST, LEAD_CASHIER, ...)
│           │   ├── erro/            GlobalExceptionHandler (ProblemDetail)
│           │   └── observabilidade/ CorrelationIdFilter
│           ├── main/resources/
│           │   ├── application.yml, application-dev.yml, application-prod.yml
│           │   └── logback-spring.xml
│           └── test/java/...        MockMvc, integração (Testcontainers), ArquiteturaTest (ArchUnit)
│
└── frontend/                                # Angular (standalone components, signals)
    ├── angular.json  package.json  tsconfig.json  proxy.conf.json  Dockerfile  nginx.conf
    ├── e2e/                                 # Playwright: os 10 cenários ponta a ponta
    └── src/
        ├── environments/
        ├── locale/                          # messages.pt-PT.xlf, messages.en.xlf
        └── app/
            ├── app.config.ts  app.routes.ts
            ├── api/                         # cliente gerado a partir do OpenAPI
            ├── core/                        # autenticação, interceptors, guards
            ├── shared/                      # componentes de UI, pipes, diretivas
            └── features/                    # carregadas em lazy loading
                ├── avaliacao/               # assistente passo a passo
                │   ├── passos/              transacao, produto, comprovativo, pagamento, excecao
                │   └── avaliacao.store.ts
                ├── resultado/               # cartão de decisão OUT-001 a OUT-008
                ├── explicacoes/             # painéis Como, Porquê, Porque não, E se
                ├── historico/               # avaliações anteriores e auditoria
                └── regras/                  # consulta da base de conhecimento
```

## Dependências entre módulos

As dependências seguem uma só direção; nenhum módulo depende de um módulo acima dele.

```
pericial-api ──► pericial-service ──► pericial-explanation ──► pericial-model
     │                 │      └──► pericial-rules (kjar) ─────► pericial-model
     │                 └──► pericial-persistence
     └──► pericial-dto ◄── pericial-service (mappers)
```

- **`pericial-model` não depende de nada.** É o vocabulário partilhado pelas regras DRL e pelas explicações.
- **Os controllers nunca tocam no modelo nem no Drools.** Recebem e devolvem apenas DTO. Um teste ArchUnit impede a violação.
- **As entidades JPA são separadas dos factos Drools.** A base de dados e as regras evoluem de forma independente.

## Papel de cada módulo

### Model
As 16 classes e 22 enumerações de `04-diagrama-classes.md`, como POJO simples. São os objetos que entram na sessão Drools.

### Rules
Empacotado como kjar, com `releaseId` próprio. Cada ficheiro DRL corresponde a um módulo do fluxograma e a um `agenda-group`. Cada regra declara metadados que alimentam o catálogo e as explicações, por exemplo `@id("PT-003")`, `@modulo("M5")`, `@descricao(...)`, `@condicoes("devolucaoVerificada,ate30DiasDesdeCompra,artigoElegivel")` e `@conclusoes("OUT-001=PERMITIR,OUT-002=REEMBOLSO")` (conclusões que a regra pode produzir, usadas pelo "Porque não?"). Os testes incluem os 10 cenários de `06-casos-teste.md`, em ficheiros JSON.

### Explanation
Responde a cinco perguntas (definições aprovadas a 2026-10-05, ADR 0006):

- **Como? (How)** — Justifica o caminho que o sistema seguiu para obter uma conclusão. Lê a sequência de regras disparadas e os campos de saída que cada uma alterou (através do `RastreioListener`) e mostra o caminho completo no fluxograma ou o caminho de uma conclusão (por exemplo, "como se concluiu OUT-001 = REVER?": a regra que fixou o valor, as anteriores, as condições que se verificaram e os valores dos factos).
- **Porque não? (Why Not)** — Justifica a razão pela qual uma conclusão não foi obtida (por exemplo, "porque não PERMITIR?" ou "porque não reembolso no meio original?"). Identifica as regras capazes de produzir essa conclusão (metadado `@conclusoes`), indica se alguma a chegou a propor e qual fixou o valor final, e classifica, para cada regra, a causa de não a ter produzido:
  - o módulo nunca foi alcançado, porque uma paragem obrigatória anterior terminou o fluxo;
  - a regra foi vencida por uma regra com precedência;
  - uma ou mais condições falharam — o `AvaliadorCondicoes` testa cada predicado declarado nos metadados e lista os que falharam.
  Também se pode perguntar diretamente por uma regra.
- **Porquê? (Why)** — Justifica a razão pela qual o sistema faz uma pergunta ao colaborador. Para um dado de entrada (IN-001 a IN-010 e outros dados do pedido), indica as regras cujas condições dependem dele e, no pedido atual, as que só esperam por essa resposta para concluir, com as conclusões que cada uma produziria (por exemplo, "pergunto se o artigo pode ser revendido porque o PC-002 precisa da resposta para decidir entre PERMITIR e RECUSAR").
- **E se? (What If)** — Clona os factos, aplica as alterações pedidas, reavalia numa sessão nova e devolve as diferenças no resultado.
- **O que falta?** — Antes da avaliação, identifica os dados de entrada (IN) em falta para se poder decidir; cada dado em falta é uma pergunta com o respetivo "Porquê?".

### DTO
Records imutáveis com validação Bean Validation (`@NotNull`, `@PastOrPresent`, etc.). Contrato público, versionado com a API.

### Service
O `MotorRegrasService` cria a sessão, insere os factos, dá o foco aos módulos de M9 a M0 e executa as regras. O `AvaliacaoService` orquestra:
1. validar o pedido;
2. enriquecer os dados com as integrações (POS, catálogo de produtos);
3. avaliar as regras;
4. persistir a auditoria, incluindo a versão da base de conhecimento usada.

As integrações seguem o padrão portas e adaptadores: cada sistema externo tem uma interface (porta) e um adaptador real ou simulado.

### API

| Método | Endpoint | Função |
|---|---|---|
| POST | `/api/v1/avaliacoes/dados-em-falta` | Lista os dados IN em falta (perguntas), cada um com o seu "Porquê?" |
| POST | `/api/v1/avaliacoes/porque?dado=IN-010` | Porque é feita uma pergunta, para o pedido em preenchimento (Why) |
| POST | `/api/v1/avaliacoes` | Avalia um pedido e devolve a decisão |
| GET | `/api/v1/avaliacoes/{id}` | Consulta uma avaliação |
| GET | `/api/v1/avaliacoes/{id}/explicacoes/como` | Caminho completo percorrido (How) |
| GET | `/api/v1/avaliacoes/{id}/explicacoes/como?conclusao=OUT-001&artigo=A-1` | Caminho até uma conclusão (How) |
| GET | `/api/v1/avaliacoes/{id}/explicacoes/porque-nao?conclusao=OUT-001:PERMITIR&artigo=A-1` | Razão de uma conclusão não ter sido obtida (Why Not) |
| GET | `/api/v1/avaliacoes/{id}/explicacoes/porque-nao?regra=PT-003&artigo=A-1` | Razão de uma regra não ter disparado (Why Not) |
| POST | `/api/v1/avaliacoes/{id}/simulacoes` | Cenário alternativo (What If) |
| GET | `/api/v1/regras`, `/api/v1/regras/{codigo}` | Catálogo da base de conhecimento |

### Frontend
O assistente de avaliação guia o colaborador pelos módulos e mostra o cartão de decisão com as cores do fluxograma. Em cada resultado, o colaborador pode abrir os painéis de explicação. O cliente HTTP é gerado a partir do OpenAPI, por isso o frontend fica sempre alinhado com os DTO.

## Boas práticas

- **Qualidade de código:** Maven multi-módulo com versões centralizadas no POM pai; Spotless e Checkstyle; Sonar na CI; JaCoCo com limite mínimo de cobertura no `pericial-rules`.
- **Testes por camada:** unitários das regras; controller com MockMvc; integração com Testcontainers (PostgreSQL); arquitetura com ArchUnit; ponta a ponta com Playwright usando os 10 cenários.
- **Segurança:** OIDC/JWT; papéis mapeados a partir do enum `Funcao` (a regra HS-006 é também uma regra de autorização na API); CORS restrito; segredos fora do repositório.
- **Operação:** perfis dev, test e prod; erros no formato `ProblemDetail`; logs estruturados com identificador de correlação; Spring Boot Actuator; imagens Docker e `docker-compose` para o ambiente local.
- **Auditoria:** cada avaliação guarda a versão do kjar e o rasto completo das regras disparadas, para que a decisão possa ser reconstruída mesmo depois de as regras mudarem.
- **Internacionalização:** pt-PT e en, nas explicações do backend e na interface Angular.

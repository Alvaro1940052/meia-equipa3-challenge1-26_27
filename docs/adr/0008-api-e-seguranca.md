# ADR 0008 — API REST, segurança e execução

- **Estado:** aceite pelo utilizador quanto aos pontos 1 e 2 (2026-10-05); restantes propostos (Fase 8)
- **Data:** 2026-10-05

## Contexto

A Fase 8 expõe o serviço por REST (endpoints de `docs/05`). `docs/05` diz que a HS-006 "é também uma regra
de autorização na API" e pede OIDC/JWT com papéis do enum `Funcao`, mas não diz o que acontece a um colaborador
não autorizado nem como autenticar sem um fornecedor OIDC em desenvolvimento.

## Decisão

1. **HS-006 decide, a API não bloqueia** (escolha do utilizador). Qualquer colaborador autenticado com uma função
   do enum `Funcao` pode avaliar, consultar e pedir explicações. A HS-006 dispara e dá ENCAMINHAR, com explicação.
   Os papéis (`ROLE_<FUNCAO>`) só reservam funções de gestão: a listagem do histórico (`GET /api/v1/avaliacoes`)
   fica para GESTAO_LOJA, XSTORE_MANAGER e KEY_HOLDER (**a validar** pela operação). Um token sem função conhecida
   não acede à API (403).
2. **Autenticação** (escolha do utilizador). Em produção: OIDC, com `issuer-uri` configurável. O token tem de
   trazer as claims `sub` (ID do colaborador), `name`, `funcao`, `aprovado_dm` e `id_credencial_pos`. Em
   desenvolvimento e testes: tokens HS256 assinados com uma chave local (`pericial.seguranca.chave-hmac`). Só o
   perfil `dev` tem `GET /api/v1/dev/colaboradores` (um colaborador de exemplo por função) e
   `POST /api/v1/dev/tokens`. Sem chave, estes endpoints não existem e vale a configuração OIDC.
3. **O colaborador vem sempre do token** (A-24). O corpo do pedido não o aceita: campos desconhecidos são recusados
   (`fail-on-unknown-properties`), por isso um `colaborador` no corpo dá 400.
4. **Erros em ProblemDetail** (RFC 9457) com `type` relativo `/problemas/...`:
   - 400 para validação, com a lista `erros`;
   - 422 para um pedido incoerente ou com dados obrigatórios em falta, com a lista `erros`;
   - 404 para um recurso inexistente;
   - 409 para uma avaliação feita com outra versão da base de conhecimento.
5. **Endpoints.** Seguem `docs/05`. Há dois acréscimos que não estão em `docs/05`: a listagem
   `GET /api/v1/avaliacoes?loja=&pagina=&tamanho=` (para o histórico do frontend) e os endpoints `dev`.
   - `/explicacoes/como` e `/explicacoes/porque-nao` devolvem tipos diferentes conforme o parâmetro (`conclusao` ou
     `regra`). No OpenAPI ficam como `oneOf`, porque não pode haver duas operações no mesmo caminho e método.
   - `dados-em-falta` e `porque` aceitam pedidos incompletos (sem Bean Validation), porque servem o preenchimento.
6. **Idioma.** `Accept-Language` (pt-PT por omissão, ou en).
7. **Observabilidade.**
   - `X-Correlation-Id`: o filtro aceita o recebido ou gera um, põe-no no MDC e nos logs, e devolve-o na resposta.
   - Logs estruturados (ECS) em produção, configurados por propriedades em vez de um `logback-spring.xml`.
   - Actuator só com `health` e `info`; o health é público.
8. **CORS** restrito às origens configuradas (`pericial.seguranca.origens-cors`), só com GET e POST. CSRF desligado
   (API sem sessão, com tokens Bearer).
9. **Execução.**
   - Jar executável do Spring Boot.
   - O kjar `pericial-rules` é desempacotado ao arrancar (`requiresUnpack`), porque o Drools não lê o
     `kmodule.xml` de um jar aninhado.
   - Imagem Docker multi-stage com utilizador sem privilégios e healthcheck.
   - `docker-compose.yml` com PostgreSQL e a API no perfil dev.
10. **OpenAPI.**
    - O `CenariosApiIT` exporta o documento para `backend/pericial-api/target/openapi.json`, de onde a Fase 9 gera
      o cliente Angular.
    - Em produção, o Swagger UI e `/v3/api-docs` estão desligados.

## Consequências

- Os 10 cenários passam por HTTP, com o colaborador no token, e dão o mesmo resultado que o teste de aceitação das
  regras (`CenariosApiIT`, Testcontainers).
- O ArchUnit (`ArquiteturaTest`) garante:
  - os controllers só dependem de DTO e das fachadas do serviço, nunca do modelo, do Drools nem da persistência;
  - o modelo não depende de Spring, JPA nem Drools;
  - as camadas só dependem numa direção.
- O fornecedor OIDC real tem de emitir as claims do ponto 2. A correspondência entre os grupos do fornecedor e o
  enum `Funcao` fica por definir com a operação.

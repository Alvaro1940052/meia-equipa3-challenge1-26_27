# ADR 0007 — Camada de serviço: enriquecimento, validação, auditoria e reavaliação

- **Estado:** proposto (Fase 7)
- **Data:** 2026-10-05

## Contexto

A Fase 7 liga os DTO da API ao motor de regras e à persistência. Era preciso decidir de onde vêm os dados
que o colaborador não indica, quando um pedido pode ser avaliado, o que se grava para auditoria e como se
explicam avaliações já gravadas.

## Decisão

1. **Motor.** O `MotorRegrasService` usa o `ExecutorSessao` do `pericial-explanation` (sessão por avaliação,
   ordem de agenda de `OrdemAgenda`, rastreio das regras). Não há `SessaoFactory` nem `OrdemModulos` próprios do
   serviço, ao contrário do que o plano indicava, para não duplicar a ordem dos módulos.
2. **Versão da base de conhecimento.** `VersaoBaseConhecimento` usa o `ReleaseId` do `KieContainer` ou, se não
   houver, o `pom.properties` do kjar (`groupId:artifactId:version`).
3. **Integrações atrás de portas.** `PosGateway`, `CatalogoProdutoGateway`, `BackPocketGateway` e `PagamentoGateway`
   têm um adaptador simulado (`IntegracoesSimuladas`) com SKUs e encomendas de exemplo. Enquanto não existirem
   adaptadores reais, o simulado é o único bean; na Fase 8 passa a estar limitado aos perfis `dev` e `test`.
4. **Enriquecimento só preenche campos vazios.** O `EnriquecedorPedido` completa produto (reconhecimento no POS,
   marca, categoria, preços), encomenda online, estado da conta de pagamento e disponibilidade do portal, mas
   **nunca sobrepõe** o que o colaborador indicou. A decisão humana prevalece sobre o sistema externo.
5. **Validação em dois níveis.** A estrutura do pedido é validada por Bean Validation nos DTO. O `ValidadorPedido`
   acrescenta a coerência (artigos repetidos, datas futuras, compra posterior ao pedido) e, para avaliar, a
   completude: se faltar um dado obrigatório (IN-001..IN-010, segundo o `DetetorDadosEmFalta`), `avaliar` recusa o
   pedido com `PedidoInvalidoException` e a lista do que falta, em vez de decidir com dados incompletos. Para
   perguntar o que falta durante o preenchimento existe `dadosEmFalta`, que não falha.
6. **Colaborador do utilizador autenticado** (ambiguidade A-24). O `PedidoAvaliacaoRequest` não tem colaborador:
   o serviço recebe-o à parte (`ColaboradorDto`), que a API vai construir a partir do token.
7. **Auditoria.** Cada avaliação grava o pedido **já enriquecido** (JSON), a decisão, a versão da base de
   conhecimento e o rasto das regras disparadas (ordem, ID, módulo, artigo). As regras com comportamento
   provisório ficam em `regrasAValidar`.
8. **Explicações e "E se" sobre avaliações gravadas.** Reavaliam o pedido gravado com a base de conhecimento atual.
   Se a versão atual for diferente da gravada, o serviço recusa (`VersaoBaseConhecimentoDiferenteException`) em
   vez de explicar uma decisão com regras que não foram as que a tomaram. A simulação nunca altera a avaliação
   gravada.

## Consequências

- Os 10 cenários de `docs/06` passam pelo serviço (DTO → modelo → regras → DTO) com o mesmo resultado do
  `CenariosEsforcoTest` (`ServicoPericialIT`, Testcontainers).
- Uma mudança de versão do kjar torna inexplicáveis as avaliações anteriores até existir um mecanismo de
  carregar versões antigas da base (fora do âmbito atual).
- Os adaptadores reais (POS, BackPocket, Afterpay, PayPal/Venmo, Interac/VeriFone) ficam por fazer; basta
  implementar as portas.

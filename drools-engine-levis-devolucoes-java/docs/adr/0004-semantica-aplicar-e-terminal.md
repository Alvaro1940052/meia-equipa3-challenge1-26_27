# ADR 0004 — Semântica de `aplicar()`, `terminal` e sobreposição de resultados

- **Estado:** proposto
- **Data:** 2026-10-04

## Contexto

`docs/04` define `Decisao.aplicar(String regra, Elegibilidade r, String msg)` e diz que marca `terminal = true`
"quando o resultado de uma paragem obrigatória é RECUSAR ou ENCAMINHAR". Problemas:

1. A assinatura não indica se a regra é uma paragem obrigatória: CH-002 também dá ENCAMINHAR (BackPocket) e não pode terminar o fluxo.
2. `04` lista EX-008 entre as regras terminais, mas o exemplo de EX-008 aplica REVER.
3. Várias regras escrevem a elegibilidade em sequência (ex.: PC-001 PERMITIR e depois PT-004 REVER); sem critério,
   a última a disparar ganha, o que depende da ordem da agenda.

## Decisão

1. **Paragens obrigatórias** são um conjunto fixo de IDs, definido numa constante do modelo
   (`RegrasParagem.IDS = {HS-001, HS-002, HS-003, HS-004, HS-006, CH-007, CH-008}`).
   `aplicar()` marca `terminal = true` quando o ID pertence ao conjunto **e** o resultado é RECUSAR ou ENCAMINHAR.
   - HS-005 fica fora do conjunto: recusa a **exceção** pedida (troca, cartão de oferta, numerário), não a devolução,
     que continua a ser reembolsada através da Afterpay (TN-010).
2. **EX-008** chama `suspender(regra, msg)`, que marca `terminal = true`, `elegibilidade = REVER`,
   `aprovacao = DISTRICT_AREA` e regista a regra. O pedido fica com `suspenso = true`.
3. **Severidade:** `aplicar()` nunca baixa a severidade já registada
   (RECUSAR > ENCAMINHAR > REVER > PERMITIR). Para baixar REVER para PERMITIR (revisão resolvida, ex.: PC-002 com
   IN-010 = sim) usa-se `resolverRevisao(regra, msg)`, que só atua se a
   elegibilidade atual for REVER e regista a regra.
4. **Rasto:** todas as chamadas acrescentam um `RegistoRegra` (código, módulo, resultado, mensagem, instante),
   mesmo quando a severidade não muda. O instante vem de um `Clock` injetável (testes determinísticos).
5. A mesma semântica aplica-se a `DecisaoArtigo` (ADR 0002), através da classe base `DecisaoBase`.
6. **Assinatura com módulo:** `aplicar(String regra, Modulo modulo, Elegibilidade r, String msg)`. A assinatura de `04`
   (sem módulo) não permitia preencher `RegistoRegra.modulo`. Também existem `registar(regra, modulo, msg)` (regra sem
   resultado, ex.: CT-005), `resolverRevisao(regra, modulo, msg)` e, só em `Decisao`, `suspender(regra, modulo, msg)` (EX-008).

7. **Exceções à guarda `Decisao( terminal == false )`** (convenção do projeto, README): EX-008 e PC-008. O EX-008 é a própria
   interrupção (guarda: `PedidoDevolucao( suspenso == false )`); o PC-008 é, segundo `02`, "executado independentemente da
   elegibilidade", para que um artigo inseguro seja isolado mesmo numa transação recusada ou suspensa (A-28).
   O `ConvencoesDrlTest` verifica a guarda em todas as outras regras.
   **EX-002 e EX-003** são também exceções (aprovado pelo utilizador a 2026-10-04): segundo `02`, EX-002 depende apenas
   de "ter sido emitido um resultado"; o cliente pode contestar precisamente uma recusa terminal (cenário 5). Estas regras
   não alteram a elegibilidade, só registam a explicação da política e o escalonamento.
   **OUT-007 e OUT-001** (M9) também correm depois de uma recusa terminal, mas não com o pedido suspenso: o artigo de
   uma transação recusada tem de ter destino (devolução ao cliente, `03`) e o resultado por artigo tem de ser agregado
   (`Decisao.agregarArtigos`, ADR 0002).
10. **Exceção recusada sem alterar a elegibilidade:** `Decisao.recusarExcecao(regra, modulo, msg)` regista RECUSAR e marca
    `excecaoRecusada`, mas mantém a elegibilidade (HS-005: a exceção Afterpay é recusada, o reembolso continua; EX-006).

8. **Guarda anti-ciclo.** Qualquer `modify` sobre a `Decisao`/`DecisaoArtigo` reavalia as regras que dependem dela,
   incluindo a própria. As regras que não terminam o fluxo incluem `disparou( "ID" ) == false` no padrão da decisão que
   alteram. Não se usa `lock-on-active`, porque impediria regras do mesmo agenda-group de reagir às alterações umas das
   outras (ex.: PT-006 depende de PT-002, ambas em M4). O `MotorTeste` falha se houver mais de 1000 disparos.

9. **Reatividade por propriedade desligada** (`drools.propertySpecific=ALLOWED` no `kmodule.xml`). Com a reatividade
   ligada (predefinição), um `modify` que chame um setter e `aplicar()` só notifica a propriedade do setter: a alteração
   da elegibilidade feita dentro de `aplicar()` ficava invisível para outras regras (detetado na Fase 4.3: PT-003 não via
   um artigo em REVER). Sem reatividade por propriedade, cada `modify` reavalia todos os padrões do facto. O
   `pericial-model` continua sem anotações do Drools.

11. **Nulos verificados em cada padrão.** No Rete cada padrão é avaliado por si; uma condição como
    `disparou("TN-001")` noutro padrão não protege o acesso `compraOriginal.pagamento.estadoConta`. Cada padrão verifica
    os nulos dos caminhos que percorre; o `RobustezDadosEmFaltaTest` avalia pedidos com dados em falta e falha se alguma
    regra lançar uma exceção.
12. **REVER produzido em M7** (TN-008 sem acesso à aplicação, TN-011 sem o cartão Interac) surge depois de M6, por isso não
    aciona EX-001: estas regras definem elas próprias a aprovação do responsável sénior.

13. **Paragem de todos os artigos termina o pedido.** As paragens por artigo (HS-001 a HS-004 e CH-007 em M3) só
    terminam o seu artigo (ADR 0002). Quando a paragem atinge o último artigo ainda por terminar, a própria regra marca
    também o pedido como terminal (`Decisao.terminarPorParagemDosArtigos()`): não resta nada a decidir para a
    transação, por isso as regras de M4 a M8 deixam de disparar (antes, por exemplo, PT-001 corria depois de HS-003).
    A marcação é feita dentro do disparo da paragem para que o rasto a atribua a essa regra ("Como?" e "Porque não?").
    Com outros artigos ainda elegíveis, o pedido continua a ser avaliado para esses artigos.

## Consequências

- O resultado deixa de depender da ordem de disparo entre regras com resultados diferentes.
- O "Porque não" consegue distinguir "a regra disparou mas o resultado foi mais severo noutra regra".

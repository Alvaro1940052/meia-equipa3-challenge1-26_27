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
   IN-010 = sim, ou PT-004 com crédito de loja aprovado) usa-se `resolverRevisao(regra, msg)`, que só atua se a
   elegibilidade atual for REVER e regista a regra.
4. **Rasto:** todas as chamadas acrescentam um `RegistoRegra` (código, módulo, resultado, mensagem, instante),
   mesmo quando a severidade não muda. O instante vem de um `Clock` injetável (testes determinísticos).
5. A mesma semântica aplica-se a `DecisaoArtigo` (ADR 0002).

## Consequências

- O resultado deixa de depender da ordem de disparo entre regras com resultados diferentes.
- O "Porque não" consegue distinguir "a regra disparou mas o resultado foi mais severo noutra regra".

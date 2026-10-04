# ADR 0002 — Decisão por artigo (`DecisaoArtigo`)

- **Estado:** aceite pelo utilizador (2026-10-04); regra de agregação **a validar** pela operação
- **Data:** 2026-10-04

## Contexto

O modelo de `docs/04-diagrama-classes.md` tem uma única `Decisao` por pedido, com um só `terminal` e uma só
`elegibilidade`. Um pedido pode ter vários artigos (`PedidoDevolucao.artigos`, 1..*), e:

- o cenário 6 de `docs/06-casos-teste.md` tem três artigos em estados diferentes e pede "resultados artigo a artigo";
- o DTO previsto em `05` inclui `ResultadoArtigoResponse`;
- com uma só `Decisao`, uma paragem obrigatória num artigo (ex.: HS-003) terminaria o pedido inteiro;
- `ArtigoDevolvido` já tem `destino` e `descontoSaldo`, mas não tem elegibilidade nem rasto próprio.

## Decisão

Acrescentar ao `pericial-model` o facto **`DecisaoArtigo`** (pacote `model.decisao`):

| Atributo | Tipo | Descrição |
|---|---|---|
| `pedidoId` | `String` | Pedido a que pertence. |
| `artigoId` | `String` | `ArtigoDevolvido.id`. |
| `elegibilidade` | `Elegibilidade` | Resultado do artigo. |
| `tipoTransacao` | `TipoTransacao` | Transação aplicável ao artigo. |
| `valorDevolucao` | `BigDecimal` | Valor do artigo. |
| `baseValor` | `BaseValor` | Base do valor. |
| `destino` | `DestinoProduto` | OUT-007 do artigo. |
| `aprovacao` | `NivelAprovacao` | Aprovação exigida pelo estado do artigo (PC-002/003/004). |
| `terminal` | `boolean` | Paragem obrigatória no artigo. |
| `registos` | `List<RegistoRegra>` | Rasto das regras do artigo. |

Repartição das regras:

- **Sobre `DecisaoArtigo( terminal == false )`:** HS-001 a HS-004, PC-001 a PC-008, CT-008, EP-005 a EP-007, BW-001 a BW-004,
  e o valor por artigo (CH-009, CH-010, EP-003, EP-004).
- **Sobre `Decisao( terminal == false )`:** HS-006, CT-003, CH-001 a CH-008, PT-001 a PT-008, TN, EP-001, EP-002, EX, CT-001 a CT-007.
- Todas as regras de artigo incluem também `Decisao( terminal == false )`, para respeitar paragens do pedido (HS-006, CH-007, CH-008, EX-008).

Agregação na `Decisao` (regras de fecho em M9, salience mínima):

- `elegibilidade` do pedido = a **mais severa** entre os artigos, com a ordem RECUSAR > ENCAMINHAR > REVER > PERMITIR.
  Os resultados por artigo continuam visíveis, e os artigos recusados têm destino `DEVOLUCAO_CLIENTE` (`03`, M9).
  **A validar** — a base de conhecimento não define se um pedido com artigos aceites e recusados pode ser
  processado em parte.
- `valorDevolucao` do pedido = soma dos valores dos artigos não recusados.
- `registos` do pedido = registos do pedido + registos de cada artigo (ordem cronológica).

## Consequências

- `docs/04` não é alterado sem pedido explícito; este ADR é a referência para a diferença.
- EP-003 (escalão pelo número de artigos devolvidos) continua a funcionar dentro da mesma sessão.
- O DTO `DecisaoResponse` expõe `artigos: List<ResultadoArtigoResponse>`.

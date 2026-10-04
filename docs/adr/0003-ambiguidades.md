# ADR 0003 — Ambiguidades da base de conhecimento e comportamento provisório

- **Estado:** aceite como provisório (2026-10-04); cada linha fica **a validar** pela operação
- **Data:** 2026-10-04

## Contexto

O `CLAUDE.md` proíbe inventar regras de negócio. A base de conhecimento (`01`) e a sua reescrita (`02`) são
omissas ou contraditórias em vários pontos. O utilizador decidiu (2026-10-04) que estes pontos não bloqueiam a
implementação: implementa-se o comportamento hoje documentado (sobretudo em `03`), marcado "a validar".

## Decisão

Cada ponto abaixo:
- tem a regra DRL com `@descricao` terminada em `[a validar: A-xx]`;
- tem o teste com `@DisplayName` que inclui `a validar A-xx`;
- aparece no JSON do cenário afetado em `"aValidar": ["A-xx"]`.

Quando a operação responder, atualiza-se a coluna **Resposta**, a regra, o teste e o cenário, e retira-se a marca.

| ID | Tema | Regras | Pergunta para a operação | Comportamento provisório | Cenários | Resposta |
|---|---|---|---|---|---|---|
| A-01 | Canal "desconhecido" | IN-003, CH-001, EP-005..007 | Como se trata um artigo de canal desconhecido? Se o comprovativo revelar o canal, usa-se esse canal? | Segue para M3; sem comprovativo → às cegas (PT-002/PT-005); com comprovativo → caminho de loja; `entreCanais` vem do input (`03`, M2) | — | |
| A-02 | Canal BackPocket | CH-002, TN-012 | Uma compra BackPocket segue o caminho online ou o de loja? | Caminho de loja (M4/M5); só levi.com/levi.ca vão para ONLINE (`03`, M4) | — | |
| A-03 | Às cegas online permitida | CH-003 | Que cenários da política permitem uma devolução online às cegas? | Input `politicaPermiteAsCegasOnline`; por omissão `false` → RECUSAR | — | |
| A-04 | Encomenda encontrada com portal em baixo | CH-002, CH-004 | Encomenda online encontrada mas o portal (BackPocket) está indisponível: o que fazer? | Nenhum documento cobre o caso → REVER (critério da gestão, EX-001), sem meio de reembolso definido | 10 | |
| A-05 | Troca online tardia com PayPal | CH-005, CH-006, TN-008, EX-006 | Troca online após 30 dias paga com PayPal: cartão de oferta (CH-005) ou fluxo da app (TN-008)? E se o cliente não acede à app? | TN-008 prevalece (EX-006 proíbe substituir o meio); sem acesso à app → REVER, sem meio alternativo | 10 | |
| A-06 | Online verificado após 30 dias | CH-005, PT-004 | O online tardio é REVER (PT-004) ou cartão de oferta direto (CH-005)? | CH-005 (cartão de oferta, PERMITIR); online não passa por PT-003/PT-004 (`03`) | 10 | |
| A-07 | Produto de franquia nos EUA | CH-007, HS-004 | CH-007 aplica-se em qualquer mercado? | Sim (`01` não exige Canadá e prevalece sobre `02`) | — | |
| A-08 | Grossista: CH-008 vs HS-002 | CH-008, HS-002 | Qual o ID a reportar? | O primeiro a disparar (CH-008 em M2); HS-002 aparece como "módulo não alcançado" | 5 | |
| A-09 | Numerário e cartão de oferta | PT-003, TN-* | Compras pagas em numerário ou cartão de oferta: reembolso no meio original? Há limite de numerário? Cartão novo ou recarregado? | `MEIO_ORIGINAL` (`03`, M7) | — | |
| A-10 | Interac de substituição | TN-002, TN-011 | Cartão Interac de substituição da mesma conta é aceite? Sem o cartão, há alternativa? | TN-011 prevalece: sem o mesmo cartão físico não se processa o reembolso Interac → REVER, sem meio definido | 7 | |
| A-11 | Interac como débito | TN-004 | A proibição de numerário de TN-004 aplica-se ao Interac? | Não (Interac é um meio distinto) | 7 | |
| A-12 | Escolha em TN-007 | TN-007 | Quem escolhe entre reembolso ao comprador e crédito de loja? | O sistema devolve as duas opções; a escolha é o input `resolucaoPedida` | — | |
| A-13 | Oferta sem recibo | TN-007, PT-005 | Uma devolução de oferta sem recibo é uma devolução às cegas normal? | Sim: PT-005 (troca ou crédito de loja ao preço atual) | 3 | |
| A-14 | Ajuste de preço | PT-007, PT-008 | Meio da diferença? Ajuste de compras online? Preço anunciado online conta? Fotografia do recibo é "recibo original"? | Meio original; online não coberto → RECUSAR com PT-008 apenas se faltar prazo/recibo, caso contrário REVER; fotografia ≠ original | 8 | |
| A-15 | PC-008 fora do bodywear | PC-008 | Um artigo sujo/inseguro que não é bodywear é aceite? Uma mancha é "sujo" ou "danificado"? | PC-008 não altera a elegibilidade; destino `RISCO_BIOLOGICO`; a classificação é do colaborador (input) | 6 | |
| A-16 | Prazo às cegas | PT-005 | As devoluções às cegas têm prazo? | Sem prazo; `dataCompra` pode ser nula quando não há comprovativo | 3, 6 | |
| A-17 | "Baixo risco" em PT-004 | PT-004 | Como se mede o baixo risco? | Nenhum `IndicadorFraude` com nível SIGNIFICATIVO ou CONFIRMADO | — | |
| A-18 | Aprovação PC-004 e EX-004 | PC-004, EX-004 | Onde se regista a aprovação da gestão e o "concluível no sistema"? | PC-004 usa `PedidoExcecao.aprovada`; EX-004 usa o novo input `concluivelNoSistema` | 2 | |
| A-19 | Nível de aprovação da gestão | PC-002..004, PT-004 | Que nível de aprovação exigem estes REVER? (`NivelAprovacao` não tem "Gestão da Loja") | `RESPONSAVEL_SENIOR` | 1, 6 | |
| A-20 | Conjunto de bodywear incompleto | PC-007, BW-003 | O reembolso é do conjunto ou proporcional? | `precoPago` do artigo, tal como registado | 9 | |
| A-21 | CH-010 e CH-009 com EP-003 | CH-009, CH-010, EP-003 | Como se sabe que o POS permite o PVP original? Como se combinam CH-009 e EP-003? | Valor do adaptador POS (`valorCalculadoPos`); CH-009 define a base, EP-003 o escalão | 3 | |
| A-22 | Contagem de dias | PT-003, PT-004, CH-005 | "Dentro de 30 dias" inclui o dia 30? Online conta da data de envio? | `≤ 30`; online usa `dataEnvio`, loja usa `dataCompra` | 1, 10 | |
| A-23 | XStore Manager em HS-006 | HS-006 | O XStore Manager é processador autorizado? | Sim | — | |
| A-24 | Identidade do colaborador | HS-006, CT-001, CT-003 | — (decisão técnica de segurança) | O `Colaborador` vem sempre do token JWT, nunca do corpo do pedido | — | n/a |
| A-25 | Agregação multi-artigo | — | Um pedido com artigos aceites e recusados processa-se em parte? | Ver ADR 0002: elegibilidade do pedido = a mais severa | 6 | |

## Consequências

- Os resultados esperados dos cenários afetados mudam quando a operação responder; os testes estão marcados para facilitar a revisão.
- Novos inputs no modelo (`politicaPermiteAsCegasOnline`, `concluivelNoSistema`, `valorCalculadoPos`) são
  acrescentados ao `pericial-model` e documentados aqui, sem alterar `docs/04` até pedido explícito.

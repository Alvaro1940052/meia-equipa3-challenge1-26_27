# ADR 0001 — Estrutura de módulos e ficheiros DRL

- **Estado:** proposto
- **Data:** 2026-10-04

## Contexto

`docs/05-estrutura-projeto.md` define sete módulos Maven e a lista de ficheiros DRL. O `CLAUDE.md` pede
"um ficheiro DRL e um `agenda-group` por módulo (M0–M9, ONLINE)", mas `05` junta M4 e M5 num só ficheiro,
divide M7 em dois (valor e meio de reembolso) e não tem ficheiro para M1. Há ainda um desvio de nome de pacote:
o exemplo DRL de `04` importa `com.levis.devolucoes.modelo.*`, enquanto `04` e `05` definem `...model`.

## Decisão

1. **Módulos Maven** exatamente como em `05`, sob `backend/`, com dependências numa só direção:
   `api → service → {explanation, rules, persistence, dto}`, `explanation → model`, `rules → model`.
   `pericial-model` não depende de nada.
2. **Ficheiros DRL** seguem `05`. O `agenda-group` é declarado **por regra**, com o nome do enum `Modulo`:
   - `m4-m5-comprovativo-prazo.drl` contém regras com `agenda-group "M4"` (PT-001, PT-002, PT-006) e `"M5"` (PT-003 a PT-008);
   - `m7-valor.drl` e `m7-meio-reembolso.drl` usam ambos `agenda-group "M7"`; a ordem interna (valor antes do meio)
     é dada por `salience`.
3. **M1 não tem regras DRL.** IN-001 a IN-010 são dados de entrada: a sua presença é verificada pelo
   `DetetorDadosEmFalta` (explicação "O que falta?") e pelo `ValidadorPedido` antes da avaliação.
   O foco da agenda continua a incluir M1 para manter a ordem de `Modulo`.
4. **Pacote do modelo:** `com.levis.devolucoes.model` (o import `...modelo` do exemplo de `04` é tratado como gralha).
5. **Pacote das regras:** `com.levis.devolucoes.regras`.
6. **Grupo TRANSVERSAL.** EX-008 e PC-008 (`transversais.drl`) ficam no agenda-group `TRANSVERSAL`, com `@modulo("TRANSVERSAL")`
   e `auto-focus true`. Se ficassem no grupo MAIN (como no exemplo de `04`), só seriam avaliadas depois de M0–M9, porque o
   MAIN fica no fundo da pilha de foco. O `RegistoRegra.modulo` destas duas regras é nulo (não pertencem a nenhum módulo).
7. **Ordem da agenda** numa classe Java do kjar, `com.levis.devolucoes.regras.OrdemAgenda`
   (`TRANSVERSAL, M0, M1, M2, M3, M4, M5, ONLINE, M6, M7, M8, M9`), reutilizada pelos testes e pelo `MotorRegrasService`
   (substitui a classe `OrdemModulos` prevista em `05` para o serviço).

## Consequências

- O mapeamento regra → módulo usado pelas explicações vem do metadado `@modulo`, não do nome do ficheiro.
- Um teste (`MetadadosRegrasTest`) garante que `@modulo` coincide com o `agenda-group` de cada regra.

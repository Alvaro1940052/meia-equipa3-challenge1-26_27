# ADR 0006 — Definição das explicações Como, Porque não e Porquê

- **Estado:** aceite pelo utilizador (2026-10-05)
- **Data:** 2026-10-05
- **Substitui:** a definição de "Porquê" de `docs/05` (versão anterior) e o ponto 3 do ADR 0005 quanto ao âmbito do "Porque não".

## Contexto

A primeira implementação (Fase 5) seguiu `docs/05`, onde "Porquê?" era a justificação de um campo de saída e "Porque não?"
a explicação de uma regra não ter disparado. O utilizador definiu as explicações do sistema pericial assim:

- **Como?** — o sistema justifica o caminho que seguiu para obter uma dada conclusão;
- **Porque não?** — o sistema justifica a razão pela qual uma determinada conclusão não foi obtida;
- **Porquê?** — o sistema justifica porque razão põe uma determinada questão ao utilizador.

## Decisão

1. **Como** tem duas formas: o caminho completo (`ExplicadorComo.explicar`) e o caminho de uma conclusão
   (`explicarConclusao(campo, artigo)`), que absorve a antiga justificação de um campo de saída.
2. **Porque não** pergunta-se por uma conclusão (`explicarConclusao(campo, valor, artigo)`, ex.: `OUT-001=PERMITIR`).
   Cada regra declara as conclusões que pode produzir no metadado **`@conclusoes`** (`OUT-00x=VALOR`; sem valor para
   "qualquer valor", ex.: `OUT-003`; `null` para a ausência de valor). O explicador indica se a conclusão foi obtida, que
   regras a chegaram a propor e qual fixou o valor final, e explica cada regra produtora com as causas do ADR 0005. A pergunta
   por regra mantém-se.
3. **Porquê** explica uma pergunta (`DadoEntrada`: IN-001 a IN-010 e os outros dados de que as regras dependem). As
   condições declaram os dados que leem (`DependenciasDados`); as regras que leem o dado "dependem" da pergunta, e as que,
   no pedido atual, têm as outras condições cumpridas "esperam" pela resposta, com as conclusões que produziriam. Cada dado
   em falta do "O que falta?" tem o seu "Porquê".
4. **Coerência garantida por testes:** `CoerenciaConclusoesTest` verifica que tudo o que as regras alteram nos campos OUT
   está declarado em `@conclusoes`, que cada condição sobre a entrada lê pelo menos um dado e que cada pergunta é usada;
   `MetadadosRegrasTest` valida o formato de `@conclusoes`.
5. `docs/05` foi atualizado (explicações e endpoints da API) com autorização do utilizador.

## Consequências

- Cada regra nova declara `@conclusoes` (pode ser vazio para regras que só registam uma ação). A convenção do CLAUDE.md
  sobre metadados (`@id`, `@modulo`, `@descricao`, `@condicoes`) passa, na prática, a incluir `@conclusoes`.
- Os metadados `@condicoes` do EX-005 e do EX-006 passaram a declarar `pedidoExcecao`, que o DRL já exigia.
- O assistente do frontend (Fase 9) mostra, para cada pergunta, o botão "Porquê?".

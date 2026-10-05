# ADR 0005 — Explicações: rastreio, causas e execução do motor

- **Estado:** proposto
- **Data:** 2026-10-05

## Contexto

`docs/05` pede cinco explicações (Como, Porquê, Porque não, E se, O que falta) no módulo `pericial-explanation`, que só
depende do `pericial-model`. As explicações precisam de saber que regra alterou cada campo de saída, porque é que uma regra
não disparou, e de voltar a correr o motor com factos alterados.

## Decisão

1. **Executor no módulo de explicações.** `motor/ExecutorSessao` insere os factos, dá o foco aos agenda-groups pela ordem
   recebida e liga o rastreio. Recebe o `KieContainer`, o nome da sessão e a ordem dos grupos (`OrdemAgenda` do kjar), por
   isso o módulo continua sem depender do kjar em compilação. O `MotorRegrasService` (Fase 7) reutiliza-o.
2. **Rastreio com instantâneos.** O `RastreioListener` regista as ativações criadas, disparadas e canceladas. Em cada disparo
   compara um instantâneo dos campos OUT do pedido e de cada artigo antes e depois (`InstantaneoDecisao`): o "Porquê" sabe
   assim que regra alterou cada campo, sem uma tabela fixa campo → regras.
3. **Porque não — quatro causas:** `DISPAROU`; `MODULO_NAO_ALCANCADO` (uma paragem num módulo anterior terminou o fluxo do
   pedido ou do artigo); `CANCELADA_POR_PRECEDENCIA` (a ativação foi cancelada depois de outra regra disparar, ou as
   condições cumprem-se mas uma paragem do mesmo módulo, com mais salience, terminou o fluxo — o Phreak cria as ativações de
   forma preguiçosa, por isso nem sempre há cancelamento); `CONDICOES_FALHADAS` (lista as condições falhadas da variante mais
   próxima: menos falhas e, em empate, mais condições cumpridas).
4. **Predicados Java das condições.** Cada nome de `@condicoes` tem um `Predicado` em `RegistoPredicados`, marcado como "sobre
   a entrada" ou "sobre o estado da decisão". O `CoerenciaPredicadosTest` verifica, nos 10 cenários e noutros pedidos, que
   cada regra disparada tem verdadeiras todas as condições sobre a entrada (encontrou e corrigiu metadados do PT-004, PT-007 e
   PC-006). O `CatalogoRegrasTest` garante que cada condição declarada tem predicado e vice-versa.
5. **E se** clona o pedido por JSON (Jackson), aplica alterações por caminho (`compraOriginal.pagamento.meio`,
   `artigos[0].revendivel`, valores nulos permitidos) e reavalia numa sessão stateful nova. A sessão stateless do kmodule não
   é usada: não permite dar o foco aos agenda-groups pela ordem necessária.
6. **O que falta** verifica IN-001 a IN-010 por caminho, distinguindo os dados obrigatórios dos necessários só para resolver
   uma revisão (IN-010).
7. **Textos:** `GeradorTexto` traduz (pt-PT, en) o texto que enquadra as explicações; as mensagens das regras vêm do DRL e
   ficam em português.

## Consequências

- O "Porquê" e o "Como" dependem do rastreio da avaliação: o serviço tem de guardar o rastreio (ou reavaliar) para responder
  a pedidos de explicação posteriores (Fase 7).
- Uma condição nova num DRL exige um predicado novo; os testes falham até ele existir.

# ADR 0009 — Frontend Angular

- **Estado:** proposto (Fase 9); a versão do Node foi escolhida pelo utilizador (2026-10-05)
- **Data:** 2026-10-05

## Contexto

A Fase 9 cria a interface usada pelos colaboradores. Tem de:

- guiar o preenchimento por perguntas, com o "Porquê?" de cada pergunta;
- mostrar a decisão (OUT-001 a OUT-008) e as explicações Como, Porque não e E se;
- funcionar em pt-PT e en;
- ser testada ponta a ponta com os 10 cenários de `docs/06`.

## Decisão

1. **Angular 22** com componentes standalone, signals, sem zone.js e testes unitários com Vitest. O Angular 22
   exige Node 22.22.3 ou mais recente; por escolha do utilizador foi instalado o Node 24 LTS (24.19).
2. **Cliente HTTP gerado** com `ng-openapi-gen`, a partir de `frontend/openapi/openapi.json`. É uma ferramenta Node,
   sem Java; o plano previa o `openapi-generator`. Para atualizar:
   - `npm run api:atualizar` copia o documento que o `CenariosApiIT` exporta para
     `backend/pericial-api/target/openapi.json`;
   - `npm run api:gerar` regenera `src/app/api`.

   O documento e o cliente estão no repositório, para o frontend se construir sem o backend. Para o cliente ser
   estável, o OpenAPI passou a ter o servidor relativo `/` e `operationId` explícitos.
3. **Formulário definido por dados** (`features/avaliacao/formulario.ts`):
   - passos, grupos e campos usam os mesmos caminhos que a API (`artigos[0].produto.sku`);
   - cada grupo indica as perguntas da base de conhecimento a que responde (IN-001…, HS-006, EX-…), o que dá o botão
     "Porquê?" e liga o "O que falta?" ao passo certo;
   - um teste unitário garante que o formulário cobre exatamente o pedido da API, com os mesmos valores de enum e
     tipos de controlo.
4. **Objetos opcionais.** O comprovativo, o pagamento, o pedido de exceção e quem aprovou a exceção, quando ficam por
   preencher, vão vazios (`null`), como nos cenários. Sem comprovativo, a devolução é às cegas.
5. **"O que falta?" contínuo.** O pedido em curso é enviado a `/dados-em-falta` 400 ms depois da última alteração, e
   as respostas antigas são ignoradas. O "Avaliar" está sempre disponível: a API recusa (400 ou 422) e diz o que falta.
6. **Entrada.**
   - Em desenvolvimento, o ecrã "Entrar" usa os endpoints `dev` da API (colaborador de exemplo ou indicado).
   - O token fica em `sessionStorage` e o interceptor envia-o, com o `Accept-Language` da interface.
   - Um 401 termina a sessão.
   - A ligação a um fornecedor OIDC de produção está fora do âmbito desta implementação (decisão do utilizador,
     2026-10-06); a API já aceita tokens OIDC (ADR 0008).
7. **i18n de compilação** (`@angular/localize`):
   - uma versão por idioma (`/pt-PT/`, `/en/`), com IDs explícitos (`@@campo.loja.mercado`);
   - `messages.pt-PT.xlf` é extraído; `messages.en.xlf` é a tradução, verificada por `npm run i18n:verificar`;
   - a build de produção falha se faltar uma tradução;
   - as descrições do "O que falta?" usam os rótulos do formulário (traduzidos);
   - os textos da base de conhecimento (nomes e mensagens das regras, perguntas) continuam em pt-PT.
8. **Apresentação.**
   - Cores dos resultados iguais às do fluxograma (`docs/03`), com variantes para o tema escuro.
   - Cada conclusão tem o seu "Como?".
   - Os valores dos enums são mostrados com rótulos; o valor da API fica em `data-valor`, para os testes.
9. **Execução.**
   - `npm start`: `ng serve` com proxy de `/api` para `localhost:8080`.
   - Imagem nginx com as duas versões e `/api` encaminhado para a API, na mesma origem; o `Host` é encaminhado com a
     porta, para a API não o tratar como CORS.
   - O `docker-compose` serve o frontend em `http://localhost:8081`.
10. **E2E (Playwright)** com os mesmos JSON de cenário do `pericial-rules`:
    - o colaborador do cenário entra;
    - o assistente é preenchido pelos caminhos (`data-caminho`), só com os campos que existem no pedido da API;
    - o cartão de decisão é comparado com o "esperado", com os critérios do `VerificadorCenario`;
    - há ainda testes de "O que falta?", "Porquê?", "Como?", "Porque não?", "E se?", da entrada e do acesso ao
      histórico;
    - correm contra o `ng serve` ou, com `E2E_URL`, contra a imagem nginx.

## Consequências

- Mudar o pedido da API obriga a atualizar o formulário: o teste de cobertura falha até lá.
- Mudar um texto da interface obriga a extrair as mensagens e a traduzir.
- Correções no backend encontradas pelo E2E:
  - o `EnriquecedorPedido` fazia unboxing de um `Boolean` nulo nos artigos de troca sem "SKU reconhecido pelo POS";
  - `/error` não estava autorizado, e um 500 aparecia como 403.

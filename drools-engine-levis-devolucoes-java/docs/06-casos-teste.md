# 06 — Casos de teste (cenários de teste de esforço)

> Tradução para pt-PT de `Returns_Exchange_KBase_Test_Scenarios.docx`: 10 situações de clientes para revisão em grupo e validação da árvore de decisão.

## Objetivo

Utilize estes cenários para testar se a base de conhecimento e a futura árvore de decisão com IA identificam de forma consistente os dados de entrada necessários, encaminham corretamente a transação e gerem o escalonamento do cliente. As respostas esperadas foram deliberadamente excluídas, para que os revisores possam analisar cada caso de forma independente.

> **Nota para a implementação:** os resultados esperados foram omitidos de propósito. Ao converter estes cenários em testes (`pericial-rules/src/test/resources/cenarios/` e Playwright), o resultado esperado deve ser derivado de `02-regras-if-then.md`, indicando as regras que o justificam, e marcado como *a validar* pela operação até ser confirmado.

## Método de Revisão Sugerido

- Peça ao revisor ou ao bot de IA que identifique qualquer informação em falta antes de decidir um resultado.
- Registe a elegibilidade proposta, o tipo de transação, o valor, o meio de reembolso, a aprovação, o processo, o destino do produto e a documentação.
- Assinale quaisquer regras que pareçam contraditórias, ambíguas, incompletas ou dependentes do critério da gestão.
- Avalie se o comportamento do cliente altera o escalonamento ou a abordagem de atendimento sem alterar indevidamente a elegibilidade.

## 1. As Etiquetas Soltas, Troca ao 29.º Dia

**Comportamento do cliente:** Simpático e cooperante, mas cada vez mais insistente se a troca demorar.

**Situação**

- Um cliente dirige-se a uma loja Mainline dos EUA com umas calças de ganga Levi's 501 compradas noutra loja Mainline dos EUA.
- A compra foi feita há 29 dias e o cliente tem um recibo digital.
- As calças parecem não ter sido usadas. As etiquetas originais estão soltas, mas são apresentadas com o artigo.
- O cliente quer o mesmo modelo e a mesma cor num tamanho de cintura diferente.
- As calças foram compradas durante uma promoção e o tamanho de substituição está disponível.
- O cliente explica que conduziu uma hora até à loja e espera que a troca seja simples.

**Elementos da base de conhecimento a testar**

- Mercado e tipo de loja
- Comprovativo e prazo
- Etiquetas soltas e possibilidade de revenda
- Troca promocional apenas de tamanho
- Processamento entre lojas
- Insistência do cliente

## 2. O Cliente Irritado com Afterpay

**Comportamento do cliente:** Frustrado à chegada; torna-se ruidoso e conflituoso quando lhe são mencionadas as restrições.

**Situação**

- Um cliente leva um casaco Levi's comprado online a uma loja Mainline dos EUA.
- A encomenda foi paga com Afterpay e entregue há 12 dias.
- O cliente tem o e-mail de confirmação da encomenda.
- O casaco não foi usado e tem as etiquetas colocadas.
- O cliente quer o mesmo casaco noutra cor e recusa um reembolso.
- O cliente exige uma troca imediata, levanta a voz e pede para falar com o responsável mais sénior.

**Elementos da base de conhecimento a testar**

- Canal de compra online
- Encomenda verificada
- Restrições do meio de pagamento Afterpay
- Mudança de cor versus troca apenas de tamanho
- Processo de tratamento obrigatório
- Escalonamento de cliente perturbador

## 3. A Devolução de Oferta na Outlet sem Recibo

**Comportamento do cliente:** Calmo, paciente e disposto a aceitar menos do que o valor original da compra.

**Situação**

- Um cliente apresenta umas calças de ganga Levi's numa loja Outlet dos EUA e diz que as recebeu como oferta há vários meses.
- O cliente não tem recibo, recibo de oferta, confirmação de encomenda nem informação que permita consultar a compra.
- As etiquetas estão colocadas e as calças parecem não ter sido usadas.
- O produto é atualmente reconhecido no POS da loja Outlet recetora.
- O preço promocional de venda atual é muito inferior ao que o cliente julga ter sido o custo original da oferta.
- O cliente pede crédito de loja e está disposto a fornecer dados pessoais.

**Elementos da base de conhecimento a testar**

- Elegibilidade da devolução às cegas
- Valorização promocional na Outlet
- Prazo desconhecido
- Contexto de devolução de oferta
- Pedido de crédito de loja
- Verificação do produto e possibilidade de revenda

## 4. As Calças com Bainha e Defeito

**Comportamento do cliente:** Educado e desiludido, com pressão adicional por ter uma viagem marcada.

**Situação**

- Um cliente regressa a uma loja Mainline dos EUA com umas calças de ganga compradas há 10 dias.
- O recibo original está disponível.
- As calças foram embainhadas no momento da compra.
- O cliente usou as calças uma vez e refere que uma costura da perna se desfez.
- Há danos visíveis na costura.
- O cliente pede o reembolso total e diz que parte de viagem amanhã.

**Elementos da base de conhecimento a testar**

- Produto alterado ou embainhado
- Alegação de defeito de fabrico
- Compra verificada dentro do prazo
- Estado de usado
- Interação com paragem obrigatória
- Pressão emocional e envolvimento da gestão

## 5. A Disputa sobre Produto Grossista

**Comportamento do cliente:** Inicialmente sereno; depois contesta firmemente a política, sem causar perturbação.

**Situação**

- Um cliente leva umas calças de ganga Levi Strauss Signature a uma loja Mainline dos EUA.
- As calças foram compradas num retalhista grossista nacional.
- O cliente tem o recibo original desse retalhista.
- O artigo não foi usado e tem as etiquetas colocadas.
- O cliente argumenta que o produto foi fabricado pela Levi's e que, por isso, qualquer loja Levi's o deveria aceitar.
- Se não for possível um reembolso, o cliente pede uma troca ou crédito de loja e invoca exceções feitas por outras marcas.

**Elementos da base de conhecimento a testar**

- Elegibilidade da marca e do produto
- Canal grossista
- Comprovativo de outro retalhista
- Pedidos de resolução alternativa
- Paragem obrigatória versus contestação do cliente
- Explicação da política

## 6. A Devolução sem Recibo de Artigos em Estados Diferentes

**Comportamento do cliente:** Nervoso e defensivo; interpreta perguntas de rotina como uma acusação.

**Situação**

- Um cliente leva três pares de calças de ganga Levi's premium a uma loja dos EUA.
- Não há recibo nem informação de encomenda verificável.
- As calças são de tamanhos e lavagens diferentes, e faltam todas as etiquetas.
- Um par parece não ter sido usado, outro parece ligeiramente usado e o terceiro tem uma mancha visível.
- O cliente não consegue explicar claramente onde nem quando os artigos foram comprados.
- O cliente pede de imediato o reembolso em numerário e torna-se defensivo quando lhe são feitas perguntas adicionais.

**Elementos da base de conhecimento a testar**

- Devolução às cegas de vários artigos
- Estados diferentes dos produtos
- Sem etiquetas nem comprovativo
- Pedido de numerário
- Resultados artigo a artigo
- Indícios de fraude e suspensão da transação
- Escalonamento para a gestão e de risco

## 7. A Substituição do Cartão Interac no Canadá

**Comportamento do cliente:** Sereno no início, mas cético e ligeiramente conflituoso quanto à importância de o cartão ser de substituição.

**Situação**

- Um cliente dirige-se a uma loja Mainline no Canadá com um artigo Levi's elegível, comprado nessa loja há 18 dias.
- O cliente tem o recibo original e o artigo não foi usado e tem as etiquetas colocadas.
- A transação foi paga com um cartão de débito Interac físico.
- O cartão original foi perdido e o banco emitiu um cartão de substituição associado à mesma conta.
- O cliente pede o reembolso para o cartão de substituição ou em numerário.
- O cliente diz que o banco confirmou que a conta não foi alterada.

**Elementos da base de conhecimento a testar**

- Mercado canadiano
- Devolução em loja verificada
- Exigência de apresentação do cartão Interac
- Cartão de substituição versus cartão original
- Pedido de meio de reembolso alternativo
- Desacordo calmo com a política

## 8. O Ajuste de Preço após Alteração de Promoção

**Comportamento do cliente:** Simpático mas assertivo; invoca o site e espera que a loja pratique o preço mais baixo anunciado.

**Situação**

- Um cliente regressa a uma loja Mainline dos EUA para pedir um ajuste de preço de um casaco comprado em loja.
- A compra foi feita há 13 dias e o cliente tem uma fotografia do recibo, mas não o recibo original em papel.
- O mesmo casaco, na mesma cor, está agora anunciado online a um preço mais baixo.
- A loja não tem atualmente esse tamanho em stock.
- O cliente já tinha beneficiado de um desconto promocional na compra original.
- O cliente pede que a diferença seja reembolsada num cartão de oferta, caso não seja possível usar o cartão original.

**Elementos da base de conhecimento a testar**

- Prazo para ajuste de preço
- Exigência de recibo original
- Verificação de artigo idêntico
- Preço online versus transação em loja
- Interação com promoção anterior
- Meio de reembolso pedido

## 9. O Conjunto de Bodywear Devolvido com um Risco de Segurança

**Comportamento do cliente:** Envergonhado e a pedir desculpa, mas fica incomodado se os colaboradores reagirem visivelmente ao estado do artigo.

**Situação**

- Um cliente leva uma embalagem múltipla de bodywear Levi's a uma loja Outlet dos EUA.
- O cliente tem um recibo datado de há 21 dias.
- A embalagem exterior está em falta e falta uma unidade do conjunto.
- O cliente afirma que uma das unidades restantes foi experimentada e pode ter uma mancha visível.
- O cliente pede o reembolso total para o cartão de crédito original.
- O cliente pede ao colaborador que inspecione o artigo de perto para comprovar o problema de qualidade.

**Elementos da base de conhecimento a testar**

- Aceitação de bodywear
- Conjunto incompleto
- Estado usado ou sujo
- Segurança do colaborador e manuseamento mínimo
- Elegibilidade e meio de reembolso
- Destino do produto e documentação
- Interação sensível com o cliente

## 10. A Troca Online Tardia com PayPal durante uma Falha do Portal

**Comportamento do cliente:** Geralmente razoável, mas torna-se impaciente e questiona por que razão os sistemas da loja devem afetar a resolução.

**Situação**

- Um cliente apresenta uma encomenda de levi.com numa loja Mainline dos EUA enquanto o portal de devoluções online está indisponível.
- A encomenda foi enviada há 37 dias e o cliente tem a confirmação da encomenda.
- O pagamento foi feito através de PayPal.
- O artigo não foi usado e tem as etiquetas colocadas.
- O cliente quer trocá-lo por um modelo diferente com um preço atual mais elevado.
- O cliente oferece-se para pagar a diferença com cartão de crédito e pede que qualquer valor remanescente da devolução seja colocado num cartão de oferta.
- O cliente diz que não consegue aceder à sua conta PayPal na loja.

**Elementos da base de conhecimento a testar**

- Devolução online após 30 dias
- Falha do portal
- Exigência de tratamento pela aplicação PayPal
- Mudança de modelo e diferença de preço
- Pedido de pagamento dividido ou meio alternativo
- Comprovativo verificado e estado do produto
- Impaciência do cliente sem perturbação

## Notas do Revisor

Utilize esta secção para registar as lacunas, contradições e questões de seguimento da árvore de decisão identificadas durante o exercício.

- 
- 
- 

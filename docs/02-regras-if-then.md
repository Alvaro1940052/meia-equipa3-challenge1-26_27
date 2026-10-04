# 02 — Regras em formato IF/THEN e dependências

> Reescrita das regras de `01-base-conhecimento.md` no formato IF/THEN, pela ordem da sequência de decisão, com as regras antecedentes de que cada uma depende.
> Esta é a especificação direta para as regras DRL: o IF corresponde ao `when`, o THEN ao `then`, e as dependências determinam o `agenda-group`, a `salience` e as guardas (`Decisao( terminal == false )`).

## Portas de controlo (dependências agrupadas)

Para não repetir as mesmas condições em quase todas as regras, as dependências mais comuns estão agrupadas em cinco portas. Cada porta é um conjunto de regras antecedentes que tem de ser ultrapassado antes de a regra seguinte poder ser executada.

| Porta | Nome | Condição |
|---|---|---|
| **G0** | Colaborador autorizado | HS-006 não disparou |
| **G1** | Canal tratável na loja | CH-007 (franquia do Canadá) e CH-008 (grossista) não dispararam |
| **G2** | Produto elegível | Nenhuma das regras HS-001, HS-002, HS-003 ou HS-004 disparou |
| **G3** | Estado aceite | PC-001; ou PC-002/PC-003 aprovadas; ou PC-006; ou PC-007 |
| **G4** | Comprovativo classificado | Foi executada PT-001 (verificada) ou PT-002 (às cegas) |

Legenda dos resultados: **PERMITIR** = processar segundo a regra padrão; **RECUSAR** = não processar; **REVER** = critério ou aprovação da gestão; **ENCAMINHAR** = processo obrigatório separado.

---

## Etapa 0 — Autorização

### HS-006
- **IF** o colaborador não está autorizado a processar devoluções ou trocas
- **THEN** ENCAMINHAR para a Gestão da Loja, um Key Holder, ou um Lead Cashier ou Elevated Stylist aprovado pelo District Manager.
- **Depende de:** nenhuma (regra raiz de todo o processo).

### CT-003
- **IF** o colaborador inicia sessão no POS
- **THEN** o mesmo colaborador conclui a transação do início ao fim, sem partilhar credenciais.
- **Depende de:** HS-006 (colaborador autorizado).

## Etapas 1 e 2 — Recolha de dados, mercado e canal

### IN-001 a IN-009
- **IF** a transação é iniciada
- **THEN** registar: mercado (IN-001); tipo de loja (IN-002); canal de compra (IN-003); comprovativo (IN-004); pedido do cliente (IN-005); momento da compra ou do envio (IN-006); produto (IN-007); estado do produto (IN-008); meio de pagamento original (IN-009).
- **Depende de:** G0. São dados de entrada e não dependem de outras regras de decisão.

### IN-010
- **IF** o produto foi inspecionado
- **THEN** determinar se pode ser verificado, reetiquetado e revendido em segurança.
- **Depende de:** IN-007 e IN-008.

### CH-008
- **IF** IN-003 = grossista
- **THEN** RECUSAR e encaminhar o cliente para o retalhista original.
- **Depende de:** G0 e IN-003. Mesmo efeito que HS-002 para produto grossista.

### CH-007
- **IF** IN-001 = Canadá **AND** IN-003 = franquia canadiana
- **THEN** ENCAMINHAR para o processo da franquia, usando o SKU da franquia e nunca um SKU genérico.
- **Depende de:** G0, IN-001 e IN-003.

### CH-001
- **IF** IN-003 ∈ {Mainline, Outlet} **AND** o artigo é devolvido numa loja Levi's
- **THEN** aplicar PT-001 ou PT-002 e as regras de avaliação da loja recetora.
- **Depende de:** G0, G1, IN-002 e IN-003. O efeito só é aplicado depois de G2.

## Etapa 3 — Elegibilidade do produto

### HS-001
- **IF** o SKU não é reconhecido no POS
- **THEN** RECUSAR a devolução e a troca.
- **Depende de:** G0, G1 e IN-007.

### HS-002
- **IF** a marca é Dockers, Levi Strauss Signature ou Beyond Yoga, **OR** o produto é grossista e não é vendido na loja
- **THEN** RECUSAR a devolução e a troca.
- **Depende de:** G0, G1, IN-007 e HS-001 (SKU identificado).

### HS-003
- **IF** o produto foi personalizado, alterado ou embainhado
- **THEN** RECUSAR a devolução e a troca, mesmo que o produto tenha defeito.
- **Depende de:** G0, G1, IN-007 e HS-001.

### HS-004
- **IF** seria necessário usar um SKU diferente ou genérico
- **THEN** RECUSAR a transação.
- **ELSE IF** o produto é da franquia do Canadá → aplicar CH-007.
- **Depende de:** HS-001 (SKU não reconhecido ou não corresponde) e CH-007.

### PC-007
- **IF** IN-007 = bodywear
- **THEN** PERMITIR a devolução em qualquer estado e definir o destino através das regras BW.
- **Depende de:** G2 e IN-007. Tem precedência sobre PC-004 e PC-005.

### PC-006
- **IF** existe defeito de fabrico confirmado **AND** o produto não está personalizado nem alterado
- **THEN** PERMITIR o reembolso (regras TN) ou a substituição, e dar baixa por dano ao artigo devolvido.
- **Depende de:** G2 (em particular HS-003) e IN-008.

### PC-001
- **IF** o artigo não está usado **AND** está em estado original **AND** tem as etiquetas colocadas
- **THEN** PERMITIR, desde que as regras de canal, comprovativo e prazo sejam cumpridas.
- **Depende de:** G2 e IN-008. A permissão final depende ainda de G4 e de PT-003, PT-004 ou PT-005.

### PC-002
- **IF** o artigo não está usado **AND** tem as etiquetas soltas
- **THEN** REVER. **IF** IN-010 = sim **THEN** aprovar; **ELSE** RECUSAR.
- **Depende de:** G2, IN-008 e IN-010. Aciona EX-001.

### PC-003
- **IF** o artigo não está usado **AND** não tem etiquetas
- **THEN** REVER. **IF** IN-010 = sim **THEN** aprovar; **ELSE** RECUSAR.
- **Depende de:** G2, IN-008 e IN-010. Aciona EX-001.

### PC-004
- **IF** o artigo está claramente usado **AND** não há dano nem defeito confirmado
- **THEN** RECUSAR o reembolso. **IF** a gestão aprovar **THEN** permitir apenas uma troca pelo mesmo artigo, sem numerário nem crédito de loja sem restrições.
- **Depende de:** G2 e IN-008; só se aplica se nem PC-006 nem PC-007 se aplicarem. Aciona EX-001.

### PC-005
- **IF** o artigo está lavado **AND** não há defeito de fabrico confirmado
- **THEN** RECUSAR a devolução e a troca.
- **Depende de:** G2 e IN-008; só se aplica se nem PC-006 nem PC-007 se aplicarem.

### PC-008
- **IF** o artigo está sujo, contaminado ou é inseguro de manusear
- **THEN** aplicar o procedimento de risco biológico: minimizar o manuseamento; colocar num saco de risco biológico, etiquetado e datado; guardar em segurança na sala de reservas; enviar e-mail ao escritório corporativo designado; não revender e aguardar instruções de eliminação.
- **Depende de:** IN-008 apenas. Regra transversal de segurança, executada independentemente da elegibilidade.

## Etapa 4 — Comprovativo

### PT-001
- **IF** IN-004 é um comprovativo válido **AND** confirma a compra
- **THEN** tratar como devolução verificada. Comprovativos válidos: recibo impresso ou digital; confirmação de encomenda; recibo de oferta; consulta da transação; fotografia do recibo; consulta de encomenda BackPocket.
- **Depende de:** G0, G1, G2 e IN-004.

### PT-002
- **IF** não é possível verificar a compra
- **THEN** processar como devolução às cegas, se o produto for elegível.
- **Depende de:** PT-001 (falhou) e G3.

### PT-006
- **IF** a devolução é às cegas **AND** (o cliente recusa dar dados pessoais **OR** existe uma barreira linguística)
- **THEN** selecionar "Saltar" e prosseguir.
- **Depende de:** PT-002.

## Etapa 5 — Prazo

### PT-003
- **IF** a devolução é verificada **AND** IN-006 ≤ 30 dias **AND** o produto é elegível
- **THEN** PERMITIR o reembolso total no meio de pagamento original, ou uma troca elegível.
- **Depende de:** PT-001, G3 e IN-006.

### PT-004
- **IF** a devolução é verificada **AND** IN-006 > 30 dias
- **THEN** REVER. **IF** o artigo é vendável, verificável e de baixo risco **THEN** crédito de loja; **ELSE** RECUSAR.
- **Depende de:** PT-001, G3, IN-006 e IN-010. Aciona EX-001.

### PT-005
- **IF** a devolução é às cegas **AND** o produto é elegível
- **THEN** permitir apenas troca ou crédito de loja, ao preço de venda atual.
- **Depende de:** PT-002 e G3.

### CH-005
- **IF** IN-003 ∈ {levi.com, levi.ca} **AND** o envio foi há mais de 30 dias **AND** o produto é elegível
- **THEN** emitir cartão de oferta.
- **Depende de:** G3, IN-003 e IN-006.

### PT-007
- **IF** IN-005 = ajuste de preço **AND** a compra foi em loja **AND** IN-006 ≤ 14 dias **AND** há recibo original **AND** o artigo é idêntico **AND** não houve ajuste anterior
- **THEN** PERMITIR um ajuste único, pela diferença calculada no POS.
- **Depende de:** PT-001, IN-003, IN-004, IN-005 e IN-006.

### PT-008
- **IF** IN-005 = ajuste de preço **AND** (IN-006 > 14 dias **OR** não há recibo original)
- **THEN** RECUSAR o ajuste.
- **Depende de:** IN-004, IN-005 e IN-006. Condição complementar de PT-007.

## Etapa 6 — Canal online e resultado da transação

### CH-002
- **IF** IN-003 ∈ {levi.com, levi.ca} **AND** a encomenda é encontrada
- **THEN** ENCAMINHAR para a BackPocket e reembolsar no meio de pagamento original. **IF** IN-001 = EUA **AND** o cliente pede **THEN** emitir um cartão de oferta eletrónico.
- **Depende de:** G0, G2, IN-001, IN-003 e PT-001.

### CH-003
- **IF** IN-003 é online **AND** (a encomenda não é encontrada **OR** não há recibo)
- **THEN** devolução às cegas, apenas se a política o permitir; meio de reembolso predefinido: cartão de oferta.
- **Depende de:** IN-003, PT-001 (falhou), PT-002 e G3.

### CH-004
- **IF** IN-003 é online **AND** o portal está indisponível **AND** a devolução às cegas é permitida
- **THEN** reembolsar no meio de pagamento original.
- **Depende de:** CH-003, cujo meio de reembolso predefinido esta regra substitui.

### CH-006
- **IF** IN-003 é online **AND** IN-005 = troca
- **THEN** concluir a troca e devolver o saldo ao meio de pagamento original, exceto Afterpay.
- **Depende de:** CH-002 e IN-005. Excluída se se aplicar TN-010 ou HS-005.

### EP-001
- **IF** a troca tem recibo **AND** altera apenas o tamanho
- **THEN** manter o preço original ou promocional.
- **Depende de:** PT-001, PT-003 e IN-005.

### EP-002
- **IF** a troca altera o modelo ou a cor
- **THEN** devolver o original pelo seu valor elegível e vender o novo artigo ao preço atual.
- **Depende de:** IN-005 e da regra que determinou o valor elegível (PT-003, PT-005, CH-009, CH-010, EP-003 ou EP-004).

### EX-001
- **IF** uma regra devolveu REVER
- **THEN** avaliar: possibilidade de revenda; comprovativo; tempo decorrido; valor da transação; risco de fraude; circunstâncias do cliente.
- **Depende de:** PC-002, PC-003, PC-004 ou PT-004 (qualquer uma), e IN-010.

### EX-002
- **IF** o cliente contesta o resultado padrão
- **THEN** explicar a política e oferecer a melhor alternativa em conformidade com ela.
- **Depende de:** ter sido emitido um resultado (OUT-001) por qualquer regra anterior.

### EX-003
- **IF** o cliente fica irritado ou cria uma perturbação
- **THEN** escalar para o responsável sénior. A agitação, por si só, não cria elegibilidade.
- **Depende de:** EX-002.

### EX-004
- **IF** o responsável sénior considera uma exceção de apaziguamento
- **THEN** aprovar apenas se: nenhuma regra HS disparou; o artigo é verificável (PT-001); não há indícios de fraude (EX-008 não disparou); o resultado pode ser concluído no sistema.
- **Depende de:** EX-003, HS-001 a HS-006, PT-001 e EX-008.

### EX-006
- **IF** a exceção exigiria: um meio de pagamento proibido; um SKU incorreto; um produto excluído; ou contornar a Afterpay, o PayPal, o Venmo ou o processamento online
- **THEN** RECUSAR a exceção e usar o processo obrigatório.
- **Depende de:** EX-001 ou EX-004 (exceção em avaliação), cruzado com HS-002, HS-004, HS-005, TN-008, TN-009 e TN-010.

### EX-005
- **IF** a exceção é elegível **AND** o artigo é vendável
- **THEN** preferir a resolução menos abrangente: troca pelo mesmo artigo; depois crédito de loja; só depois reembolso.
- **Depende de:** EX-001 ou EX-004 (aprovação), EX-006 (não disparou) e IN-010.

## Etapa 7 — Valor e meio de reembolso

### CH-009
- **IF** IN-002 = Outlet **AND** a devolução ou troca é às cegas
- **THEN** usar o preço atual após as promoções ativas, e não o PVP.
- **Depende de:** PT-002, PT-005 e IN-002.

### CH-010
- **IF** a devolução tem recibo **AND** IN-003 ∈ {Mainline, Online} **AND** IN-002 = Outlet
- **THEN** usar o PVP original, quando o POS e a política o permitem.
- **Depende de:** PT-001, CH-001 ou CH-002, IN-002 e IN-003.

### EP-003
- **IF** a devolução é às cegas **AND** há uma promoção por escalões
- **THEN** o escalão é determinado pelo número de artigos devolvidos na transação atual.
- **Depende de:** PT-002.

### EP-004
- **IF** a devolução tem recibo **AND** há uma promoção por escalões
- **THEN** usar o valor calculado pelo POS com base na quantidade comprada originalmente.
- **Depende de:** PT-001.

> Todas as regras TN dependem, além do indicado, de o resultado ser um reembolso (PT-003, PC-006, CH-002, CH-004 ou EX-005).

### TN-001
- **IF** a devolução é verificada **AND** IN-009 ∈ {crédito, débito}
- **THEN** reembolsar por tokenização, sem pedir o cartão.
- **Depende de:** PT-001 e IN-009.

### TN-002
- **IF** o cartão foi perdido ou roubado **AND** a conta continua ativa
- **THEN** reembolsar para a conta original.
- **Depende de:** TN-001.

### TN-003
- **IF** a conta do cartão original está encerrada
- **THEN** tentar primeiro o cartão original. **IF** o reembolso é recusado **THEN** usar outro cartão, numerário ou cartão de oferta.
- **Depende de:** TN-001 (tentativa falhada).

### TN-004
- **IF** IN-009 = débito **AND** o reembolso ao débito original ainda não foi recusado
- **THEN** não emitir numerário.
- **Depende de:** TN-001 e TN-003.

### TN-005
- **IF** o pagamento foi contactless (Apple Pay ou Google Pay)
- **THEN** reembolsar para o cartão ou conta associada.
- **Depende de:** PT-001 e IN-009.

### TN-006
- **IF** uma troca parcial deixa um saldo reembolsável
- **THEN** concluir a troca e reembolsar o saldo ao cartão original.
- **Depende de:** EP-001 ou EP-002, e TN-001 ou TN-005. Na variante online, depende de CH-006.

### TN-007
- **IF** IN-005 = devolução de oferta **AND** o recibo original mostra pagamento a crédito ou débito
- **THEN** oferecer reembolso tokenizado ao cartão do comprador, ou crédito de loja.
- **Depende de:** PT-001, IN-005 e IN-009.

### TN-008
- **IF** IN-009 ∈ {PayPal, Venmo}
- **THEN** processar o reembolso pelo fluxo da aplicação, sem substituir o meio de pagamento.
- **Depende de:** IN-009.

### TN-009
- **IF** a compra foi em loja **AND** IN-009 = Afterpay
- **THEN** o cliente localiza a encomenda na aplicação Afterpay; devolução total para a Afterpay; entregar o recibo do POS.
- **Depende de:** PT-001, IN-003 e IN-009.

### TN-010
- **IF** a compra foi online **AND** IN-009 = Afterpay
- **THEN** processar na BackPocket para o método original, sem troca, cartão de oferta ou meio alternativo.
- **Depende de:** CH-002 e IN-009.

### HS-005
- **IF** a compra foi online com Afterpay **AND** o cliente pede uma exceção (troca, cartão de oferta, numerário ou outro meio)
- **THEN** RECUSAR a exceção e reembolsar através da Afterpay.
- **Depende de:** TN-010 e IN-005.

### TN-011
- **IF** IN-001 = Canadá **AND** compra numa loja padrão **AND** IN-009 = Interac
- **THEN** o cliente tem de apresentar o mesmo cartão físico.
- **Depende de:** IN-001, IN-003 e IN-009.

### TN-012
- **IF** IN-001 = Canadá **AND** IN-003 = loja BackPocket **AND** IN-009 = Interac
- **THEN** verificar o Interac; concluir a devolução na BackPocket; fazer um reembolso manual na VeriFone pelo valor exato, com o cartão presente e sem inserção manual.
- **Depende de:** TN-011 (verificação do cartão físico).

## Etapa 8 — Controlos e destino do produto

### EX-008
- **IF** existem indícios de fraude ou inconsistências relevantes
- **THEN** suspender a transação; envolver a Gestão da Loja; comunicar o risco confirmado ou significativo ao District ou Area Manager e à Global Safety and Security.
- **Depende de:** nenhuma. Regra transversal: pode disparar em qualquer etapa e suspende todas as seguintes.

### CT-001
- **IF** a devolução ou troca é verificada
- **THEN** é processada por pessoal autorizado, com as suas próprias credenciais de POS.
- **Depende de:** HS-006 e PT-001.

### CT-002
- **IF** a devolução é às cegas **AND** o processador é um Lead Cashier ou Elevated Stylist
- **THEN** obter a aprovação do XStore Manager.
- **Depende de:** HS-006 e PT-002.

### CT-004
- **IF** a devolução tem recibo **AND** está concluída
- **THEN** atribuí-la ao Stylist que fez a venda original.
- **Depende de:** PT-001 e da conclusão do reembolso (regras TN).

### CT-005
- **IF** a devolução ou troca está concluída
- **THEN** obter três assinaturas: cliente (ou "Recusado"); processador; testemunha (ou "SSC" em cobertura de loja única).
- **Depende de:** conclusão da transação (TN, EP-001, EP-002 ou CH-006).

### CT-006
- **IF** o recibo original é entregue
- **THEN** agrafá-lo ao exemplar da loja. **IF** o cliente o mantém **OR** o recibo inclui outros artigos **THEN** anotar esse facto no exemplar da loja.
- **Depende de:** PT-001 e CT-005.

### EX-007
- **IF** uma exceção foi aprovada
- **THEN** documentar o motivo, o aprovador, o valor, o resultado, a preocupação do cliente e o destino do produto.
- **Depende de:** EX-004 ou EX-005, e EX-006 (não disparou).

### CT-007
- **IF** o registo da transação está concluído
- **THEN** reter os suportes durante 90 dias e arquivar as cópias das devoluções online com os suportes diários.
- **Depende de:** CT-005, CT-006 e, quando aplicável, EX-007.

### CT-008
- **IF** o produto vai ser revendido
- **THEN** inspecionar o dano, as etiquetas de preço e o RFID.
- **Depende de:** conclusão da transação, IN-010, e PC-001, PC-002 ou PC-003.

### EP-007
- **IF** o artigo é entre canais **AND** já está em saldo
- **THEN** colocar em saldos com as promoções atuais.
- **Depende de:** CH-001 ou CH-002, CT-008 e IN-007. Avaliada antes de EP-006.

### EP-005
- **IF** o artigo é entre canais **AND** está ou esteve no sortido da loja recetora **AND** é vendável
- **THEN** reprecificar ao preço atual da loja recetora e devolver à área de vendas.
- **Depende de:** CH-001 ou CH-002, CT-008 e IN-007.

### EP-006
- **IF** o artigo é entre canais **AND** está fora do sortido da loja recetora **AND** não está em saldo
- **THEN** colocar em saldos com 20% de desconto sobre o preço devolvido, combinável com as promoções elegíveis.
- **Depende de:** CH-001 ou CH-002, CT-008, IN-007 e EP-007 (não se aplica).

### BW-004
- **IF** o bodywear está usado **AND** sujo ou inseguro
- **THEN** aplicar o procedimento de risco biológico.
- **Depende de:** PC-007 e PC-008. Precedência sobre BW-003.

### BW-003
- **IF** faltam unidades do conjunto **OR** o bodywear foi usado
- **THEN** dar baixa por dano a todo o conjunto.
- **Depende de:** PC-007 e BW-004 (não se aplica).

### BW-001
- **IF** a embalagem original está intacta
- **THEN** inspecionar totalmente e só devolver à venda se não tiver sido usado.
- **Depende de:** PC-007, CT-008, e BW-003 e BW-004 (não se aplicam).

### BW-002
- **IF** falta a embalagem **AND** o bodywear não foi usado **AND** o conjunto está completo
- **THEN** colocar em saldos com 50% de desconto, riscar o código de barras a vermelho e aplicar as promoções de saldo elegíveis.
- **Depende de:** PC-007, e BW-001, BW-003 e BW-004 (não se aplicam).

---

## Síntese das dependências

**Regras sem dependências de outras regras:** HS-006 (autorização); IN-001 a IN-009 (dados de entrada); PC-008 (segurança, transversal); EX-008 (fraude, transversal).

**Cadeias críticas:**
- Autorização e elegibilidade: HS-006 → CH-007 e CH-008 → HS-001 → HS-002, HS-003 e HS-004 → regras PC.
- Devolução verificada até ao reembolso: PT-001 → PT-003 → TN-001 → TN-002 ou TN-003 → TN-004.
- Devolução às cegas: PT-001 (falhou) → PT-002 → PT-005 e PT-006 → CH-009 e EP-003 → CT-002.
- Devolução online: PT-001 → CH-002 → CH-006 ou TN-010 → HS-005.
- Interac no Canadá: TN-011 → TN-012.
- Exceções: PC-002, PC-003, PC-004 ou PT-004 → EX-001 → EX-006 → EX-005 → EX-007 → CT-007.
- Escalonamento do cliente: EX-002 → EX-003 → EX-004 → EX-006 → EX-007.
- Destino do bodywear: PC-007 → BW-004 → BW-003 → BW-001 → BW-002.
- Destino de artigos entre canais: CT-008 → EP-007 → EP-005 ou EP-006.

**Regras de precedência (a primeira anula a segunda):**
- PC-007 anula PC-004 e PC-005 no caso de bodywear.
- HS-003 anula PC-006: um produto alterado não é aceite, mesmo com defeito.
- CH-004 anula o meio de reembolso predefinido de CH-003.
- TN-010 e HS-005 anulam CH-006 no caso da Afterpay.
- EX-006 anula qualquer aprovação dada por EX-004 ou EX-005.

# 03 — Fluxograma de decisão

> Base de conhecimento procedimental do sistema pericial. Cada nó corresponde a uma regra de `01-base-conhecimento.md` / `02-regras-if-then.md`.
> Os diagramas estão em Mermaid (renderizam no VS Code com a extensão *Markdown Preview Mermaid Support* e no GitHub).

## Descrição

O fluxograma está organizado em dez módulos, que seguem a ordem de avaliação do motor de inferência:

1. Visão geral do processo completo.
2. Autorização, recolha de dados e canal (M0 a M2).
3. Elegibilidade do produto (M3).
4. Comprovativo e prazo (M4 e M5).
5. Caminho online, para levi.com e levi.ca.
6. Resultado da transação, trocas e exceções (M6).
7. Valor da devolução (M7).
8. Meio de reembolso (M7).
9. Controlos e documentação (M8).
10. Destino do produto (M9).

Cada nó tem o ID da regra de origem. As cores indicam o resultado e as formas distinguem decisões, ações, resultados terminais e subprocessos obrigatórios.

## Como ler

| Classe / cor | Significado |
|---|---|
| `permitir` (verde) | PERMITIR: processar segundo a regra padrão. |
| `recusar` (vermelho) | RECUSAR: não processar. |
| `rever` (âmbar) | REVER: critério ou aprovação da gestão. No destino do produto, indica venda com desconto. |
| `encaminhar` (azul) | ENCAMINHAR: processo obrigatório separado. |
| `transv` (violeta) | Transversal: segurança ou fraude; interrompe em qualquer etapa. |
| `ligacao` (tracejado) | Ligação: o fluxo continua noutro módulo. |

| Forma | Significado |
|---|---|
| Losango `{}` | Decisão: condição IF avaliada com os dados IN. |
| Retângulo `[]` | Ação intermédia do colaborador ou do POS. |
| Retângulo arredondado `([])` | Resultado terminal do ramo, que alimenta os campos OUT. |
| Retângulo duplo `[[]]` | Subprocesso obrigatório ou escalonamento. |
| Paralelogramo `[//]` | Evento de entrada que abre um fluxo paralelo. |

Setas tracejadas: regra acionada em paralelo, sem interromper o ramo principal.

## Pontos a validar com a operação

O documento de origem não cobre dois casos; estas lacunas foram preenchidas no fluxograma e **devem ser confirmadas antes de entrar em produção**:

- **Canal "desconhecido":** segue para a verificação do produto (M3) e é depois classificado pelo comprovativo (M4).
- **Compras pagas em numerário ou cartão de oferta:** são reembolsadas no meio original, segundo a regra PT-003.

## Módulos

### 1. Visão geral do processo

A ordem de avaliação dos oito módulos. Cada módulo só é executado se o anterior não terminou a transação. As duas regras transversais podem interromper o processo em qualquer ponto.

**Regras:** Todos os módulos; EX-008 e PC-008 como interrupções.

```mermaid
flowchart TD
S(["Início da transação"]) --> M0["M0 Autorização<br/>HS-006, CT-003"]
M0 --> M1["M1 e M2 Dados e canal<br/>IN-001 a IN-010, CH-001, CH-007, CH-008"]
M1 --> M3["M3 Elegibilidade do produto<br/>HS-001 a HS-004, PC-001 a PC-008"]
M3 --> M4["M4 e M5 Comprovativo e prazo<br/>PT-001 a PT-008"]
M4 --> ON{"Compra online?"}
ON -->|"Sim"| MO["Caminho online<br/>CH-002 a CH-006, TN-010, HS-005"]
ON -->|"Não"| M6["M6 Resultado, troca e exceções<br/>EP-001, EP-002, EX-001 a EX-007"]
MO --> M6
M6 --> M7["M7 Valor e meio de reembolso<br/>CH-009, CH-010, EP-003, EP-004, TN-001 a TN-012"]
M7 --> M8["M8 Controlos e documentação<br/>CT-001 a CT-007, EX-007"]
M8 --> M9["M9 Destino do produto<br/>CT-008, EP-005 a EP-007, BW-001 a BW-004"]
M9 --> F(["Fim: preencher OUT-001 a OUT-008"])
M0 -.->|"Não autorizado"| E0[["ENCAMINHAR"]]
M1 -.->|"Grossista ou franquia"| E1[["RECUSAR ou ENCAMINHAR"]]
M3 -.->|"Paragem obrigatória"| E3(["RECUSAR"])
X8[["EX-008 Indícios de fraude<br/>suspender em qualquer etapa"]]
P8[["PC-008 Artigo inseguro<br/>isolar em qualquer etapa"]]
class E0,E1 encaminhar
class E3 recusar
class X8,P8 transv
class F permitir
classDef permitir fill:#DCEFE3,stroke:#2E7D4F,stroke-width:1.5px,color:#14351F
classDef recusar fill:#F8DEDC,stroke:#B3261E,stroke-width:1.5px,color:#4A0F0B
classDef rever fill:#FBEBC8,stroke:#A86B00,stroke-width:1.5px,color:#3F2A00
classDef encaminhar fill:#DCE6F5,stroke:#2F5C9A,stroke-width:1.5px,color:#12294A
classDef transv fill:#ECE4F6,stroke:#6B4FA0,stroke-width:1.5px,color:#2A1C45
classDef ligacao fill:#FFFFFF,stroke:#5B6B85,stroke-dasharray:4 3,color:#1D2B4A
```

### 2. Autorização, dados e canal

Confirma quem pode processar, recolhe os dados de entrada e retira do fluxo os canais que a loja não trata.

**Regras:** HS-006, CT-003, IN-001 a IN-009, CH-001, CH-007, CH-008.

```mermaid
flowchart TD
A(["Início"]) --> Q0{"HS-006<br/>Colaborador autorizado?"}
Q0 -->|"Não"| E0[["ENCAMINHAR<br/>Gestão da Loja, Key Holder, ou Lead Cashier<br/>ou Elevated Stylist aprovado pelo DM"]]
Q0 -->|"Sim"| C3["CT-003<br/>Sessão própria no POS do início ao fim"]
C3 --> IN["IN-001 a IN-009<br/>Mercado, tipo de loja, canal, comprovativo,<br/>pedido, momento, produto, estado, pagamento"]
IN --> Q1{"IN-003<br/>Canal de compra?"}
Q1 -->|"Grossista"| R8(["CH-008 RECUSAR<br/>Encaminhar para o retalhista original"])
Q1 -->|"Franquia canadiana"| E7[["CH-007 ENCAMINHAR<br/>Processo da franquia do Canadá<br/>com o SKU da franquia"]]
Q1 -->|"Mainline ou Outlet"| C1["CH-001<br/>Aplicar regras da loja recetora"]
Q1 -->|"levi.com, levi.ca ou BackPocket"| CO["Marcar caminho online ou BackPocket"]
Q1 -->|"Desconhecido"| CU["Prosseguir; o comprovativo decide em M4"]
C1 --> N(["Ir para M3"])
CO --> N
CU --> N
class E0,E7 encaminhar
class R8 recusar
class N ligacao
classDef permitir fill:#DCEFE3,stroke:#2E7D4F,stroke-width:1.5px,color:#14351F
classDef recusar fill:#F8DEDC,stroke:#B3261E,stroke-width:1.5px,color:#4A0F0B
classDef rever fill:#FBEBC8,stroke:#A86B00,stroke-width:1.5px,color:#3F2A00
classDef encaminhar fill:#DCE6F5,stroke:#2F5C9A,stroke-width:1.5px,color:#12294A
classDef transv fill:#ECE4F6,stroke:#6B4FA0,stroke-width:1.5px,color:#2A1C45
classDef ligacao fill:#FFFFFF,stroke:#5B6B85,stroke-dasharray:4 3,color:#1D2B4A
```

### 3. Elegibilidade do produto

Aplica primeiro as paragens obrigatórias e depois as regras de estado. O bodywear e o defeito de fabrico têm precedência sobre as regras de artigo usado ou lavado.

**Regras:** HS-001 a HS-004, PC-001 a PC-008, IN-010, EX-001.

```mermaid
flowchart TD
A(["Vindo de M2"]) --> H1{"HS-001<br/>SKU reconhecido no POS?"}
H1 -->|"Não"| H4{"HS-004<br/>Produto da franquia do Canadá?"}
H4 -->|"Sim"| E7[["CH-007 ENCAMINHAR"]]
H4 -->|"Não"| R1(["RECUSAR<br/>Não usar SKU diferente ou genérico"])
H1 -->|"Sim"| H2{"HS-002<br/>Dockers, LS Signature, Beyond Yoga<br/>ou grossista não vendido na loja?"}
H2 -->|"Sim"| R2(["RECUSAR"])
H2 -->|"Não"| H3{"HS-003<br/>Personalizado, alterado ou embainhado?"}
H3 -->|"Sim"| R3(["RECUSAR<br/>mesmo que tenha defeito"])
H3 -->|"Não"| P7{"PC-007<br/>É bodywear?"}
P7 -->|"Sim"| A7(["PERMITIR em qualquer estado<br/>destino pelas regras BW"])
P7 -->|"Não"| P6{"PC-006<br/>Defeito de fabrico confirmado?"}
P6 -->|"Sim"| A6(["PERMITIR reembolso ou substituição<br/>baixa por dano ao devolvido"])
P6 -->|"Não"| ST{"IN-008<br/>Estado do produto?"}
ST -->|"Sujo, contaminado ou inseguro"| B8[["PC-008<br/>Isolamento por risco biológico"]]
ST -->|"Não usado, etiquetas colocadas"| A1(["PC-001 PERMITIR<br/>sujeito a M4 e M5"])
ST -->|"Não usado, etiquetas soltas"| V2{"PC-002 REVER<br/>IN-010: verificável, reetiquetável<br/>e revendível?"}
ST -->|"Não usado, sem etiquetas"| V3{"PC-003 REVER<br/>IN-010: verificável e preparável<br/>para revenda?"}
ST -->|"Claramente usado"| V4{"PC-004 REVER<br/>Gestão aprova troca<br/>pelo mesmo artigo?"}
ST -->|"Lavado"| R5(["PC-005 RECUSAR"])
V2 -->|"Sim"| OK(["Aprovado, seguir para M4"])
V2 -->|"Não"| R4(["RECUSAR"])
V3 -->|"Sim"| OK
V3 -->|"Não"| R4
V4 -->|"Sim"| T4(["Só troca pelo mesmo artigo<br/>sem numerário nem crédito sem restrições"])
V4 -->|"Não"| R6(["RECUSAR reembolso"])
V2 -.-> X1[["EX-001 Critério da gestão"]]
V3 -.-> X1
V4 -.-> X1
class R1,R2,R3,R4,R5,R6 recusar
class A1,A6,A7,OK,T4 permitir
class V2,V3,V4 rever
class E7,X1 encaminhar
class B8 transv
classDef permitir fill:#DCEFE3,stroke:#2E7D4F,stroke-width:1.5px,color:#14351F
classDef recusar fill:#F8DEDC,stroke:#B3261E,stroke-width:1.5px,color:#4A0F0B
classDef rever fill:#FBEBC8,stroke:#A86B00,stroke-width:1.5px,color:#3F2A00
classDef encaminhar fill:#DCE6F5,stroke:#2F5C9A,stroke-width:1.5px,color:#12294A
classDef transv fill:#ECE4F6,stroke:#6B4FA0,stroke-width:1.5px,color:#2A1C45
classDef ligacao fill:#FFFFFF,stroke:#5B6B85,stroke-dasharray:4 3,color:#1D2B4A
```

### 4. Comprovativo e prazo

Separa os ajustes de preço, desvia as compras online para o seu caminho próprio e classifica as restantes como verificadas ou às cegas antes de aplicar o prazo.

**Regras:** PT-001 a PT-008, IN-004 a IN-006, EX-001.

```mermaid
flowchart TD
A(["Produto elegível, vindo de M3"]) --> PJ{"IN-005<br/>Tipo de pedido?"}
PJ -->|"Ajuste de preço"| AJ{"PT-007<br/>Compra em loja, até 14 dias,<br/>recibo original, artigo idêntico<br/>e sem ajuste anterior?"}
AJ -->|"Sim"| AJS(["PERMITIR ajuste único<br/>pela diferença calculada no POS"])
AJ -->|"Não"| AJN(["PT-008 RECUSAR ajuste"])
PJ -->|"Devolução, troca ou oferta"| CN{"IN-003<br/>levi.com ou levi.ca?"}
CN -->|"Sim"| MO(["Ir para o caminho online"])
CN -->|"Não"| P1{"PT-001<br/>Comprovativo válido confirma a compra?"}
P1 -->|"Sim"| T{"IN-006<br/>Dias desde a compra?"}
P1 -->|"Não"| P2["PT-002<br/>Devolução às cegas"]
P2 --> P6{"PT-006<br/>Cliente recusa dados ou<br/>barreira linguística?"}
P6 -->|"Sim"| SK["Selecionar Saltar"]
P6 -->|"Não"| P5
SK --> P5(["PT-005 PERMITIR só troca ou crédito de loja<br/>ao preço de venda atual"])
T -->|"Até 30"| P3(["PT-003 PERMITIR<br/>reembolso total no meio original<br/>ou troca elegível"])
T -->|"Mais de 30"| P4{"PT-004 REVER<br/>Vendável, verificável e de baixo risco?"}
P4 -->|"Sim"| SC(["Crédito de loja"])
P4 -->|"Não"| RX(["RECUSAR"])
P4 -.-> X1[["EX-001 Critério da gestão"]]
P3 --> N(["Ir para M6"])
P5 --> N
SC --> N
class AJS,P3,P5,SC permitir
class AJN,RX recusar
class P4 rever
class X1 encaminhar
class MO,N ligacao
classDef permitir fill:#DCEFE3,stroke:#2E7D4F,stroke-width:1.5px,color:#14351F
classDef recusar fill:#F8DEDC,stroke:#B3261E,stroke-width:1.5px,color:#4A0F0B
classDef rever fill:#FBEBC8,stroke:#A86B00,stroke-width:1.5px,color:#3F2A00
classDef encaminhar fill:#DCE6F5,stroke:#2F5C9A,stroke-width:1.5px,color:#12294A
classDef transv fill:#ECE4F6,stroke:#6B4FA0,stroke-width:1.5px,color:#2A1C45
classDef ligacao fill:#FFFFFF,stroke:#5B6B85,stroke-dasharray:4 3,color:#1D2B4A
```

### 5. Caminho online: levi.com e levi.ca

Trata as encomendas online devolvidas na loja. A Afterpay é avaliada primeiro porque proíbe qualquer meio alternativo.

**Regras:** CH-002 a CH-006, TN-010, HS-005, PT-001.

```mermaid
flowchart TD
A(["Compra em levi.com ou levi.ca"]) --> F{"PT-001<br/>Encomenda encontrada?"}
F -->|"Sim"| BP[["CH-002 ENCAMINHAR<br/>Processar na BackPocket"]]
BP --> AF{"IN-009<br/>Pago com Afterpay?"}
AF -->|"Sim"| T10["TN-010<br/>Reembolso na BackPocket<br/>para o método original"]
T10 --> EXQ{"Cliente pede troca, cartão de oferta,<br/>numerário ou outro meio?"}
EXQ -->|"Sim"| H5(["HS-005 RECUSAR a exceção<br/>reembolsar através da Afterpay"])
EXQ -->|"Não"| AFO(["Reembolso Afterpay"])
AF -->|"Não"| D30{"CH-005<br/>Enviado há mais de 30 dias?"}
D30 -->|"Sim"| GC(["Cartão de oferta"])
D30 -->|"Não"| TR{"IN-005<br/>Pedido de troca?"}
TR -->|"Sim"| C6(["CH-006 Concluir a troca<br/>saldo ao meio original"])
TR -->|"Não"| US{"IN-001 = EUA e cliente pede<br/>cartão de oferta eletrónico?"}
US -->|"Sim"| EGC(["Cartão de oferta eletrónico"])
US -->|"Não"| MOR(["Reembolso no meio original, ver M7"])
F -->|"Não"| CP{"CH-003<br/>A política permite devolução às cegas?"}
CP -->|"Não"| RX(["RECUSAR"])
CP -->|"Sim"| PO{"CH-004<br/>Portal online indisponível?"}
PO -->|"Sim"| BO(["Às cegas no meio original"])
PO -->|"Não"| BG(["Às cegas com cartão de oferta"])
class BP encaminhar
class H5,RX recusar
class AFO,GC,C6,EGC,MOR,BO,BG permitir
classDef permitir fill:#DCEFE3,stroke:#2E7D4F,stroke-width:1.5px,color:#14351F
classDef recusar fill:#F8DEDC,stroke:#B3261E,stroke-width:1.5px,color:#4A0F0B
classDef rever fill:#FBEBC8,stroke:#A86B00,stroke-width:1.5px,color:#3F2A00
classDef encaminhar fill:#DCE6F5,stroke:#2F5C9A,stroke-width:1.5px,color:#12294A
classDef transv fill:#ECE4F6,stroke:#6B4FA0,stroke-width:1.5px,color:#2A1C45
classDef ligacao fill:#FFFFFF,stroke:#5B6B85,stroke-dasharray:4 3,color:#1D2B4A
```

### 6. Resultado, troca e exceções

Define o preço nas trocas e conduz qualquer pedido de exceção até uma decisão documentada. Os controlos absolutos da regra EX-006 prevalecem sobre qualquer aprovação.

**Regras:** EP-001, EP-002, TN-006, EX-001 a EX-007.

```mermaid
flowchart TD
A(["Resultado de M4, M5 ou caminho online"]) --> Q{"IN-005<br/>É uma troca?"}
Q -->|"Não"| M7(["Ir para M7"])
Q -->|"Sim"| Q2{"EP-001<br/>Com recibo e muda só o tamanho?"}
Q2 -->|"Sim"| E1["Manter preço original ou promocional"]
Q2 -->|"Não"| E2["EP-002 Devolver pelo valor elegível<br/>e vender o novo ao preço atual"]
E1 --> SAL{"Fica saldo reembolsável?"}
E2 --> SAL
SAL -->|"Sim"| T6(["TN-006 Saldo ao cartão original"])
SAL -->|"Não"| M8(["Ir para M8"])

RV[/"Regra devolveu REVER<br/>PC-002, PC-003, PC-004 ou PT-004"/] --> X1["EX-001<br/>Avaliar revenda, comprovativo, tempo,<br/>valor, risco de fraude e circunstâncias"]
CT[/"Cliente contesta o resultado"/] --> X2["EX-002<br/>Explicar a política e oferecer<br/>a melhor alternativa conforme"]
X2 --> AG{"Cliente irritado ou<br/>cria perturbação?"}
AG -->|"Não"| KP(["Manter o resultado padrão"])
AG -->|"Sim"| X3["EX-003<br/>Escalar para o responsável sénior"]
X3 --> X4{"EX-004<br/>Sem regras HS, verificável, sem fraude<br/>e concluível no sistema?"}
X4 -->|"Não"| R4(["RECUSAR a exceção"])
X4 -->|"Sim"| X6
X1 --> X6{"EX-006<br/>Exige meio proibido, SKU incorreto,<br/>produto excluído ou contornar Afterpay,<br/>PayPal, Venmo ou processo online?"}
X6 -->|"Sim"| R6(["RECUSAR a exceção<br/>usar o processo obrigatório"])
X6 -->|"Não"| X5{"EX-005<br/>Artigo vendável?"}
X5 -->|"Não"| R5(["RECUSAR"])
X5 -->|"Sim"| ORD["Resolução menos abrangente:<br/>1. troca pelo mesmo artigo<br/>2. crédito de loja<br/>3. reembolso no meio original"]
ORD --> X7["EX-007<br/>Documentar motivo, aprovador, valor,<br/>resultado, preocupação e destino"]
X7 --> M7b(["Ir para M7"])
class R4,R5,R6 recusar
class X1,X4,X5 rever
class T6,KP permitir
class X3 encaminhar
class M7,M8,M7b ligacao
classDef permitir fill:#DCEFE3,stroke:#2E7D4F,stroke-width:1.5px,color:#14351F
classDef recusar fill:#F8DEDC,stroke:#B3261E,stroke-width:1.5px,color:#4A0F0B
classDef rever fill:#FBEBC8,stroke:#A86B00,stroke-width:1.5px,color:#3F2A00
classDef encaminhar fill:#DCE6F5,stroke:#2F5C9A,stroke-width:1.5px,color:#12294A
classDef transv fill:#ECE4F6,stroke:#6B4FA0,stroke-width:1.5px,color:#2A1C45
classDef ligacao fill:#FFFFFF,stroke:#5B6B85,stroke-dasharray:4 3,color:#1D2B4A
```

### 7. Valor da devolução

Calcula o valor a devolver conforme o comprovativo, o tipo de loja e as promoções por escalões.

**Regras:** PT-003, PT-005, CH-009, CH-010, EP-003, EP-004.

```mermaid
flowchart TD
A(["Transação com reembolso, troca ou crédito"]) --> V1{"Tipo de comprovativo?"}
V1 -->|"Às cegas"| VO{"IN-002<br/>Loja Outlet?"}
VO -->|"Sim"| C9["CH-009<br/>Preço atual após as promoções da Outlet"]
VO -->|"Não"| PA["PT-005<br/>Preço de venda atual"]
C9 --> S1{"Promoção por escalões?"}
PA --> S1
S1 -->|"Sim"| E3["EP-003<br/>Escalão pelo número de artigos<br/>devolvidos nesta transação"]
S1 -->|"Não"| BL(["Troca ou crédito de loja"])
E3 --> BL
V1 -->|"Com recibo"| VX{"Origem Mainline ou Online<br/>e loja recetora Outlet?"}
VX -->|"Sim"| C10["CH-010<br/>PVP original, se POS e política permitirem"]
VX -->|"Não"| VP["Valor original pago"]
C10 --> S2{"Promoção por escalões?"}
VP --> S2
S2 -->|"Sim"| E4["EP-004<br/>Valor calculado pelo POS<br/>com a quantidade original"]
S2 -->|"Não"| MP(["Ir para o meio de reembolso"])
E4 --> MP
class BL permitir
class MP ligacao
classDef permitir fill:#DCEFE3,stroke:#2E7D4F,stroke-width:1.5px,color:#14351F
classDef recusar fill:#F8DEDC,stroke:#B3261E,stroke-width:1.5px,color:#4A0F0B
classDef rever fill:#FBEBC8,stroke:#A86B00,stroke-width:1.5px,color:#3F2A00
classDef encaminhar fill:#DCE6F5,stroke:#2F5C9A,stroke-width:1.5px,color:#12294A
classDef transv fill:#ECE4F6,stroke:#6B4FA0,stroke-width:1.5px,color:#2A1C45
classDef ligacao fill:#FFFFFF,stroke:#5B6B85,stroke-dasharray:4 3,color:#1D2B4A
```

### 8. Meio de reembolso

Escolhe o meio de reembolso de uma devolução verificada. O meio alternativo só é usado depois de o meio original falhar.

**Regras:** TN-001 a TN-009, TN-011, TN-012, PT-003.

```mermaid
flowchart TD
A(["Reembolso de devolução verificada"]) --> OF{"IN-005<br/>Devolução de oferta?"}
OF -->|"Sim"| T7(["TN-007 Reembolso tokenizado ao cartão<br/>do comprador, ou crédito de loja"])
OF -->|"Não"| MP{"IN-009<br/>Meio de pagamento original?"}
MP -->|"Crédito ou débito"| T1["TN-001<br/>Reembolso tokenizado, sem pedir o cartão"]
T1 --> CE{"Estado da conta?"}
CE -->|"Ativa"| OK1(["Cartão original"])
CE -->|"Ativa, cartão perdido ou roubado"| T2(["TN-002 Conta do cartão original"])
CE -->|"Encerrada"| T3{"TN-003<br/>Tentativa ao cartão original recusada?"}
T3 -->|"Não"| OK1
T3 -->|"Sim"| ALT(["Outro cartão, numerário ou cartão de oferta"])
T3 -.- T4["TN-004<br/>Débito: sem numerário antes da recusa"]
MP -->|"Apple Pay ou Google Pay"| T5(["TN-005 Cartão ou conta associada"])
MP -->|"PayPal ou Venmo"| T8[["TN-008 Fluxo da aplicação<br/>sem substituir o meio"]]
MP -->|"Afterpay, compra em loja"| T9[["TN-009 Cliente localiza a encomenda na app<br/>devolução total à Afterpay e recibo do POS"]]
MP -->|"Interac, Canadá"| IC{"TN-011<br/>Mesmo cartão físico presente?"}
IC -->|"Não"| IW(["Não processar sem o cartão<br/>nem inserir manualmente"])
IC -->|"Sim"| BPC{"Compra em loja BackPocket?"}
BPC -->|"Sim"| T12[["TN-012 Concluir na BackPocket<br/>reembolso manual na VeriFone<br/>pelo valor exato"]]
BPC -->|"Não"| T11(["Reembolso Interac no POS"])
MP -->|"Numerário ou cartão de oferta"| OR(["Reembolso no meio original, PT-003"])
class T7,OK1,T2,ALT,T5,T11,OR permitir
class T8,T9,T12 encaminhar
class IW recusar
class T4 rever
classDef permitir fill:#DCEFE3,stroke:#2E7D4F,stroke-width:1.5px,color:#14351F
classDef recusar fill:#F8DEDC,stroke:#B3261E,stroke-width:1.5px,color:#4A0F0B
classDef rever fill:#FBEBC8,stroke:#A86B00,stroke-width:1.5px,color:#3F2A00
classDef encaminhar fill:#DCE6F5,stroke:#2F5C9A,stroke-width:1.5px,color:#12294A
classDef transv fill:#ECE4F6,stroke:#6B4FA0,stroke-width:1.5px,color:#2A1C45
classDef ligacao fill:#FFFFFF,stroke:#5B6B85,stroke-dasharray:4 3,color:#1D2B4A
```

### 9. Controlos e documentação

Garante a aprovação correta, as assinaturas, a atribuição da venda e a retenção dos suportes antes de fechar a transação.

**Regras:** CT-001 a CT-007, EX-007.

```mermaid
flowchart TD
A(["Transação resolvida"]) --> TP{"Tipo de devolução?"}
TP -->|"Verificada"| C1["CT-001<br/>Pessoal autorizado com credenciais próprias"]
C1 --> C4["CT-004<br/>Atribuir ao Stylist da venda original"]
TP -->|"Às cegas"| C2{"CT-002<br/>Processador é Lead Cashier<br/>ou Elevated Stylist?"}
C2 -->|"Sim"| XS[["Obter aprovação do XStore Manager"]]
C2 -->|"Não"| C5
XS --> C5
C4 --> C5["CT-005 Assinaturas<br/>cliente ou Recusado; processador;<br/>testemunha ou SSC"]
C5 --> RO{"CT-006<br/>Recibo original entregue?"}
RO -->|"Sim"| AG["Agrafar ao exemplar da loja"]
RO -->|"Não, ou tem outros artigos"| NT["Anotar no exemplar da loja"]
AG --> EXa{"Houve exceção aprovada?"}
NT --> EXa
EXa -->|"Sim"| X7["EX-007 Documentar a exceção"]
EXa -->|"Não"| C7
X7 --> C7["CT-007<br/>Reter suportes 90 dias;<br/>online com os suportes diários"]
C7 --> D(["Ir para o destino do produto"])
class XS encaminhar
class D ligacao
classDef permitir fill:#DCEFE3,stroke:#2E7D4F,stroke-width:1.5px,color:#14351F
classDef recusar fill:#F8DEDC,stroke:#B3261E,stroke-width:1.5px,color:#4A0F0B
classDef rever fill:#FBEBC8,stroke:#A86B00,stroke-width:1.5px,color:#3F2A00
classDef encaminhar fill:#DCE6F5,stroke:#2F5C9A,stroke-width:1.5px,color:#12294A
classDef transv fill:#ECE4F6,stroke:#6B4FA0,stroke-width:1.5px,color:#2A1C45
classDef ligacao fill:#FFFFFF,stroke:#5B6B85,stroke-dasharray:4 3,color:#1D2B4A
```

### 10. Destino do produto

Decide para onde vai cada artigo devolvido. A segurança é avaliada primeiro, depois o bodywear, depois a revenda.

**Regras:** PC-006, PC-008, CT-008, EP-005 a EP-007, BW-001 a BW-004.

```mermaid
flowchart TD
R0(["Transação recusada"]) --> DC(["Devolução ao cliente"])
A(["Produto recebido"]) --> BZ{"Sujo, contaminado<br/>ou inseguro?"}
BZ -->|"Sim"| BIO[["PC-008 e BW-004 Risco biológico<br/>saco, etiquetar e datar, sala de reservas,<br/>e-mail ao corporativo, aguardar eliminação"]]
BZ -->|"Não"| BW{"Bodywear?"}
BW -->|"Sim"| B3{"BW-003<br/>Faltam unidades ou foi usado?"}
B3 -->|"Sim"| BX(["Baixa por dano do conjunto"])
B3 -->|"Não"| B1{"Embalagem original intacta?"}
B1 -->|"Sim"| IN1{"BW-001<br/>Inspeção confirma não usado e vendável?"}
IN1 -->|"Sim"| VEN(["Área de vendas"])
IN1 -->|"Não"| BX
B1 -->|"Não"| B2(["BW-002 Saldos com 50% de desconto<br/>código de barras riscado a vermelho"])
BW -->|"Não"| DF{"PC-006<br/>Defeito de fabrico?"}
DF -->|"Sim"| BX2(["Baixa por dano"])
DF -->|"Não"| C8{"CT-008<br/>Inspeção de dano, etiquetas e RFID"}
C8 -->|"Com dano"| BX2
C8 -->|"Etiquetas ou RFID incorretos"| RT["Reetiquetar e corrigir RFID"]
C8 -->|"Conforme"| EC
RT --> EC{"Artigo entre canais?"}
EC -->|"Não"| VEN
EC -->|"Sim"| E7{"EP-007<br/>Já está em saldo?"}
E7 -->|"Sim"| SL(["Saldos com as promoções atuais"])
E7 -->|"Não"| E5{"EP-005<br/>Está ou esteve no sortido<br/>da loja recetora?"}
E5 -->|"Sim"| RP(["Reprecificar ao preço atual<br/>e devolver à área de vendas"])
E5 -->|"Não"| E6(["EP-006 Saldos com 20% de desconto<br/>sobre o preço devolvido"])
class BIO transv
class BX,BX2 recusar
class VEN,RP permitir
class B2,SL,E6 rever
classDef permitir fill:#DCEFE3,stroke:#2E7D4F,stroke-width:1.5px,color:#14351F
classDef recusar fill:#F8DEDC,stroke:#B3261E,stroke-width:1.5px,color:#4A0F0B
classDef rever fill:#FBEBC8,stroke:#A86B00,stroke-width:1.5px,color:#3F2A00
classDef encaminhar fill:#DCE6F5,stroke:#2F5C9A,stroke-width:1.5px,color:#12294A
classDef transv fill:#ECE4F6,stroke:#6B4FA0,stroke-width:1.5px,color:#2A1C45
classDef ligacao fill:#FFFFFF,stroke:#5B6B85,stroke-dasharray:4 3,color:#1D2B4A
```

## Notas de implementação

### Ordem de avaliação

O motor avalia os módulos por ordem, de M0 a M9. Dentro de cada módulo, as regras de paragem obrigatória são avaliadas antes das regras de estado, e as regras mais específicas antes das gerais: bodywear e defeito de fabrico antes de artigo usado ou lavado; Afterpay antes de qualquer outro meio online; EP-007 antes de EP-006.

### Interrupções transversais

EX-008 (fraude) e PC-008 (artigo inseguro) funcionam como eventos. Se dispararem, suspendem o ramo em curso: EX-008 bloqueia a transação até decisão da Gestão da Loja; PC-008 envia o artigo diretamente para isolamento, sem passar pela revenda.

### Precedências

- PC-007 anula PC-004 e PC-005 para bodywear.
- HS-003 anula PC-006 (produto alterado não é aceite mesmo com defeito).
- CH-004 substitui o meio predefinido de CH-003.
- TN-010 e HS-005 anulam CH-006 quando o pagamento foi com Afterpay.
- EX-006 anula qualquer aprovação dada por EX-004 ou EX-005.

### Campos de saída

| Campo | Preenchido por |
|---|---|
| OUT-001 Elegibilidade | Resultado terminal de M0 a M5 e do caminho online |
| OUT-002 Tipo de transação | M4, M5, caminho online e M6 |
| OUT-003 Valor da devolução | M7, valor da devolução |
| OUT-004 Meio de reembolso | M7, meio de reembolso, e caminho online |
| OUT-005 Aprovação | M3 (REVER), M6 (EX-001 a EX-005) e M8 (CT-002) |
| OUT-006 Processo obrigatório | Nós ENCAMINHAR de M0, M2, M3, caminho online e M7 |
| OUT-007 Destino do produto | Destino do produto (M9) |
| OUT-008 Documentação | M8 e EX-007 |

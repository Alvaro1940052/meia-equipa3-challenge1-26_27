import { cleanRuleCodes } from "@/config/returnsLabels";
import type { Locale } from "@/contexts/LocaleContext";

export interface RuleTranslation {
  code: string;
  titlePt: string;
  titleEn: string;
  messagePt: string;
  messageEn: string;
}

export const RULE_TRANSLATIONS: Record<string, RuleTranslation> = {
  // ==========================================================================
  // FAMÍLIA HS: HARD STOPS (PARAGENS OBRIGATÓRIAS)
  // ==========================================================================
  "HS-001": {
    code: "HS-001",
    titlePt: "Recusar produto sem SKU reconhecido no POS",
    titleEn: "Reject Item Without Recognized POS SKU",
    messagePt: "Recusar quando o produto não tem SKU reconhecido no sistema POS.",
    messageEn: "Reject return when item lacks a recognized SKU in the POS system.",
  },
  "HS-002": {
    code: "HS-002",
    titlePt: "Recusar marcas excluídas da política",
    titleEn: "Reject Excluded Non-Qualifying Brand",
    messagePt: "Recusar marcas excluídas (Dockers, LS Signature, Beyond Yoga ou grossista não vendido).",
    messageEn: "Reject excluded brands (Dockers, LS Signature, Beyond Yoga, or unapproved wholesale).",
  },
  "HS-003": {
    code: "HS-003",
    titlePt: "Recusar produtos personalizados ou alterados",
    titleEn: "Reject Tailored, Hemmed, or Altered Garment",
    messagePt: "Recusar produtos personalizados, alterados ou embainhados.",
    messageEn: "Reject customized, altered, tailored, or hemmed garments.",
  },
  "HS-004": {
    code: "HS-004",
    titlePt: "Encaminhar para processo de Franquia Canadá",
    titleEn: "Escalate to Canadian Franchise Procedure",
    messagePt: "Encaminhar para processo próprio da franquia canadiana sem usar SKU genérico.",
    messageEn: "Escalate to Canadian franchise procedure without using generic SKU.",
  },
  "HS-005": {
    code: "HS-005",
    titlePt: "Recusar exceção de meio de reembolso Afterpay online",
    titleEn: "Reject Tender Exception for Online Afterpay",
    messagePt: "Recusar exceções de meio de reembolso para devoluções online com Afterpay.",
    messageEn: "Strictly reject tender exceptions for online returns purchased via Afterpay.",
  },
  "HS-006": {
    code: "HS-006",
    titlePt: "Encaminhar colaborador sem autorização POS",
    titleEn: "Escalate: Associate Lacks Authorized POS Credentials",
    messagePt: "Encaminhar transação quando colaborador não possui credenciais autorizadas.",
    messageEn: "Escalate transaction when associate lacks authorized POS credentials to process returns.",
  },

  // ==========================================================================
  // FAMÍLIA PC: PRODUCT CONDITION (CONDIÇÃO FÍSICA E ETIQUETAS)
  // ==========================================================================
  "PC-001": {
    code: "PC-001",
    titlePt: "Artigo não usado com etiquetas originais",
    titleEn: "Pristine Unworn Garment with Intact Original Tags",
    messagePt: "Permitir elegibilidade para artigo não usado com etiquetas originais intactas.",
    messageEn: "Allow return eligibility: pristine unworn item with intact original tags.",
  },
  "PC-002": {
    code: "PC-002",
    titlePt: "Artigo não usado com etiquetas soltas",
    titleEn: "Unworn Garment with Loose Detached Tags",
    messagePt: "Rever com gestão artigo não usado com etiquetas soltas; aprovar só se vendável.",
    messageEn: "Manager review: unworn item with detached tags; approve only if resellable.",
  },
  "PC-003": {
    code: "PC-003",
    titlePt: "Artigo não usado sem etiquetas",
    titleEn: "Unworn Garment Without Original Tags",
    messagePt: "Rever com gestão artigo não usado sem etiquetas; aprovar só se preparável para venda.",
    messageEn: "Manager review: unworn item without tags; approve only if prep-ready for floor.",
  },
  "PC-004": {
    code: "PC-004",
    titlePt: "Artigo usado sem defeito",
    titleEn: "Non-Defective Worn Garment",
    messagePt: "Rever com gestão artigo usado sem defeito; aprovar apenas troca pelo mesmo artigo.",
    messageEn: "Manager review: non-defective worn garment; authorize same-item exchange only.",
  },
  "PC-005": {
    code: "PC-005",
    titlePt: "Recusar artigo lavado sem defeito",
    titleEn: "Reject Washed Garment Without Defect",
    messagePt: "Recusar artigo lavado sem defeito de fabrico.",
    messageEn: "Reject washed garment without verified manufacturing defect.",
  },
  "PC-006": {
    code: "PC-006",
    titlePt: "Defeito de fabrico com baixa por dano",
    titleEn: "Manufacturing Defect Damage Write-Off",
    messagePt: "Permitir reembolso ou substituição com baixa por dano para defeito de fabrico.",
    messageEn: "Allow refund or direct replacement with damage write-off for manufacturing defect.",
  },
  "PC-007": {
    code: "PC-007",
    titlePt: "Bodywear ao abrigo da garantia de satisfação",
    titleEn: "Bodywear Return under 100% Satisfaction Guarantee",
    messagePt: "Permitir bodywear em qualquer estado ao abrigo da política de satisfação.",
    messageEn: "Allow bodywear return in any condition under the 100% satisfaction guarantee.",
  },
  "PC-008": {
    code: "PC-008",
    titlePt: "Artigo sujo ou contaminado com isolamento biológico",
    titleEn: "Soiled or Hazardous Garment Biohazard Quarantine",
    messagePt: "Recusar e isolar em saco de risco biológico artigos sujos ou contaminados.",
    messageEn: "Reject and quarantine soiled, contaminated, or hazardous garment in biohazard bag.",
  },
  "PC-008-RECUSA": {
    code: "PC-008-RECUSA",
    titlePt: "Recusar devolução de artigo contaminado",
    titleEn: "Refuse Return of Contaminated Garment",
    messagePt: "Recusar devolução de artigo contaminado sem garantia especial nem suspeita de fraude.",
    messageEn: "Refuse return of contaminated garment lacking special satisfaction warranty.",
  },

  // ==========================================================================
  // FAMÍLIA PT: PROOF & TIMEFRAME (COMPROVATIVO E JANELA TEMPORAL)
  // ==========================================================================
  "PT-001": {
    code: "PT-001",
    titlePt: "Classificar como compra verificada",
    titleEn: "Classify as Verified Purchase",
    messagePt: "Classificar como devolução verificada quando comprovativo válido confirma a compra.",
    messageEn: "Classify as verified return when valid proof of purchase is confirmed.",
  },
  "PT-002": {
    code: "PT-002",
    titlePt: "Classificar como devolução às cegas",
    titleEn: "Classify as Blind Return (Unverified)",
    messagePt: "Classificar como devolução às cegas na ausência de comprovativo verificável.",
    messageEn: "Classify as blind return due to absence of verifiable proof of purchase.",
  },
  "PT-003": {
    code: "PT-003",
    titlePt: "Devolução verificada até 30 dias",
    titleEn: "Verified Return Within 30-Day Policy Window",
    messagePt: "Permitir reembolso total no meio original ou troca para devolução verificada até 30 dias.",
    messageEn: "Allow full refund to original tender or exchange for verified return within 30 days.",
  },
  "PT-004": {
    code: "PT-004",
    titlePt: "Devolução verificada após 30 dias",
    titleEn: "Verified Return Beyond 30 Days",
    messagePt: "Rever com gestão devolução verificada após 30 dias; crédito de loja sob critério.",
    messageEn: "Manager review: verified return beyond 30 days; store credit at discretion.",
  },
  "PT-005": {
    code: "PT-005",
    titlePt: "Devolução às cegas ao preço atual",
    titleEn: "Blind Return at Current Selling Price",
    messagePt: "Permitir exclusivamente troca ou crédito de loja ao preço atual para devolução às cegas.",
    messageEn: "Permit exclusively exchange or store credit at current selling price for blind return.",
  },
  "PT-006": {
    code: "PT-006",
    titlePt: "Saltar recolha de dados por recusa ou idioma",
    titleEn: "Skip ID Collection on Language Barrier or Refusal",
    messagePt: "Selecionar 'Saltar' se cliente sem recibo não fornece dados ou há barreira linguística.",
    messageEn: "Select 'Skip' if customer refuses identification or language barrier persists.",
  },
  "PT-007": {
    code: "PT-007",
    titlePt: "Ajuste de preço em loja até 14 dias",
    titleEn: "Price Adjustment Within 14-Day Window",
    messagePt: "Permitir ajuste de preço único no POS até 14 dias para compra em loja com recibo.",
    messageEn: "Allow one-time POS price adjustment within 14 days with original receipt.",
  },
  "PT-008": {
    code: "PT-008",
    titlePt: "Recusar ajuste de preço fora do prazo",
    titleEn: "Reject Price Adjustment Beyond 14 Days",
    messagePt: "Recusar ajuste de preço após 14 dias ou sem recibo original.",
    messageEn: "Reject price adjustment after 14 days or without original physical receipt.",
  },
  "PT-008-SEM-RECIBO": {
    code: "PT-008-SEM-RECIBO",
    titlePt: "Recusar ajuste de preço sem recibo físico",
    titleEn: "Reject Price Adjustment Without Physical Receipt",
    messagePt: "Recusar ajuste de preço sem recibo original físico.",
    messageEn: "Reject price adjustment without physical original receipt present.",
  },
  "PT-008-FOTO": {
    code: "PT-008-FOTO",
    titlePt: "Recusar ajuste de preço com fotografia de recibo",
    titleEn: "Reject Price Adjustment with Receipt Photograph",
    messagePt: "Recusar ajuste de preço com fotografia de recibo sem recibo original.",
    messageEn: "Reject price adjustment with digital photograph in lieu of original receipt.",
  },

  // ==========================================================================
  // FAMÍLIA CH: CHANNELS (COMPATIBILIDADE DE CANAIS E FORMATOS)
  // ==========================================================================
  "CH-001": {
    code: "CH-001",
    titlePt: "Regras da loja recetora Mainline e Outlet",
    titleEn: "Receiving Store Format Rules (Mainline / Outlet)",
    messagePt: "Aplicar regras de comprovativo e avaliação da loja recetora para Mainline e Outlet.",
    messageEn: "Apply proof of purchase and valuation rules of receiving Mainline or Outlet store.",
  },
  "CH-002": {
    code: "CH-002",
    titlePt: "Compra online verificada via BackPocket",
    titleEn: "Verified Online Purchase via BackPocket",
    messagePt: "Encaminhar compra online verificada através da BackPocket com reembolso original.",
    messageEn: "Route verified online purchase through BackPocket for refund to original tender.",
  },
  "CH-003": {
    code: "CH-003",
    titlePt: "Compra online não encontrada: às cegas",
    titleEn: "Unmatched Online Purchase: Blind Return",
    messagePt: "Tratar compra online sem encomenda encontrada como devolução às cegas com cartão de oferta.",
    messageEn: "Handle unmatched online purchase as blind return with physical gift card.",
  },
  "CH-004": {
    code: "CH-004",
    titlePt: "Portal de devoluções online indisponível",
    titleEn: "Online Returns Portal Outage",
    messagePt: "Rever com gestão sénior quando portal de devoluções online está indisponível.",
    messageEn: "Manager review: online returns portal is unavailable or experiencing technical outage.",
  },
  "CH-005": {
    code: "CH-005",
    titlePt: "Devolução online expedida há mais de 30 dias",
    titleEn: "Online Return Shipped Beyond 30 Days",
    messagePt: "Emitir cartão de oferta para devolução online expedida há mais de 30 dias.",
    messageEn: "Issue physical gift card for online returns shipped more than 30 days ago.",
  },
  "CH-006": {
    code: "CH-006",
    titlePt: "Troca de encomenda online com estorno do saldo",
    titleEn: "Online Exchange with Residual Tender Refund",
    messagePt: "Concluir troca online e estornar saldo remanescente ao meio de pagamento original.",
    messageEn: "Complete online exchange and refund remaining balance to original payment tender.",
  },
  "CH-007": {
    code: "CH-007",
    titlePt: "Encaminhar peça de Franquia Canadá com SKU próprio",
    titleEn: "Route Canadian Franchise Item with Franchise SKU",
    messagePt: "Encaminhar produto da franquia do Canadá para processo próprio com SKU de franquia.",
    messageEn: "Forward Canadian franchise garment using specialized franchise SKU workflow.",
  },
  "CH-008": {
    code: "CH-008",
    titlePt: "Recusar artigo de canal grossista",
    titleEn: "Reject Wholesale Partner Garment",
    messagePt: "Recusar produto de grossista e encaminhar cliente para retalhista original.",
    messageEn: "Reject wholesale garment and refer customer back to original retail seller.",
  },
  "CH-009": {
    code: "CH-009",
    titlePt: "Devolução às cegas em Outlet ao preço atual",
    titleEn: "Outlet Blind Return at Current Promotional Price",
    messagePt: "Calcular valor de devolução às cegas em Outlet pelo preço atual com promoções ativas.",
    messageEn: "Calculate blind return in Outlet store based on current price with active promotions.",
  },
  "CH-010": {
    code: "CH-010",
    titlePt: "Compra Mainline/Online devolvida em Outlet ao PVP",
    titleEn: "Mainline / Online Return in Outlet at MSRP",
    messagePt: "Devolução com recibo de Mainline/Online em Outlet ao PVP original quando permitido.",
    messageEn: "Return verified Mainline/Online purchase in Outlet store at original MSRP when permitted.",
  },

  // ==========================================================================
  // FAMÍLIA TN: TENDER & PAYMENT (LIQUIDAÇÃO E FORMAS DE PAGAMENTO)
  // ==========================================================================
  "TN-001": {
    code: "TN-001",
    titlePt: "Reembolso automático em cartão bancário",
    titleEn: "Automatic Tokenized Bank Card Refund",
    messagePt: "Reembolso automático tokenizado em cartão de crédito/débito sem pedir cartão físico.",
    messageEn: "Automatic tokenized refund to credit/debit card without requiring physical card.",
  },
  "TN-002": {
    code: "TN-002",
    titlePt: "Estorno para conta associada a cartão substituído",
    titleEn: "Account Refund for Stolen or Replaced Card",
    messagePt: "Reembolso automático para conta bancária associada se cartão foi perdido/roubado.",
    messageEn: "Automatic account refund for lost, stolen, or expired replacement bank card.",
  },
  "TN-003": {
    code: "TN-003",
    titlePt: "Meio alternativo após recusa de conta encerrada",
    titleEn: "Alternative Tender upon Closed Account Decline",
    messagePt: "Permitir meio alternativo se conta do cartão estiver encerrada e estorno recusado.",
    messageEn: "Allow alternative refund tender if bank account is closed and card chargeback declined.",
  },
  "TN-004": {
    code: "TN-004",
    titlePt: "Proibir numerário sem recusa prévia do cartão",
    titleEn: "Prohibit Cash Refund Without Bank Decline",
    messagePt: "Proibir estorno em numerário para débito sem tentativa e recusa prévia do cartão.",
    messageEn: "Strictly prohibit cash refund for debit purchase without prior POS bank decline.",
  },
  "TN-005": {
    code: "TN-005",
    titlePt: "Reembolso contactless tokenizado (Apple/Google Pay)",
    titleEn: "Contactless Tokenized Refund (Apple / Google Pay)",
    messagePt: "Reembolso automático para conta associada em compras contactless (Apple/Google Pay).",
    messageEn: "Automatic tokenized refund to associated account for contactless payments.",
  },
  "TN-006": {
    code: "TN-006",
    titlePt: "Estorno do saldo residual no meio original",
    titleEn: "Refund Residual Balance to Original Tender",
    messagePt: "Estornar saldo remanescente ao cartão original após troca parcial.",
    messageEn: "Refund remaining transaction balance to original payment tender during exchange.",
  },
  "TN-007": {
    code: "TN-007",
    titlePt: "Resolução de devolução de oferta",
    titleEn: "Gift Return Settlement",
    messagePt: "Devolução de oferta: crédito de loja ao portador ou estorno ao comprador original.",
    messageEn: "Gift return resolution: issue store credit to presenter or original cardholder refund.",
  },
  "TN-008": {
    code: "TN-008",
    titlePt: "Reembolso via aplicação PayPal ou Venmo",
    titleEn: "In-App QR Scan Refund for PayPal / Venmo",
    messagePt: "Exigir fluxo da aplicação para compras efetuadas via PayPal ou Venmo.",
    messageEn: "Require customer in-app barcode scan for PayPal or Venmo store returns.",
  },
  "TN-009": {
    code: "TN-009",
    titlePt: "Devolução Afterpay de loja via terminal",
    titleEn: "In-Store Afterpay Return via Associate App",
    messagePt: "Processar devolução Afterpay de loja através da app com talão de devolução do POS.",
    messageEn: "Process store-bought Afterpay return via associate Afterpay terminal app.",
  },
  "TN-010": {
    code: "TN-010",
    titlePt: "Devolução online Afterpay via BackPocket",
    titleEn: "Online Afterpay Return strictly via BackPocket",
    messagePt: "Processar compra online Afterpay na BackPocket para o método original sem exceções.",
    messageEn: "Process online Afterpay return strictly through BackPocket without tender exceptions.",
  },
  "TN-011": {
    code: "TN-011",
    titlePt: "Cartão físico Interac obrigatório no Canadá",
    titleEn: "Physical Interac Debit Card Mandatory in Canada",
    messagePt: "Exigir presença do cartão físico Interac no Canadá para estorno de débito.",
    messageEn: "Mandatory physical Canadian Interac debit card presentation for in-store refund.",
  },
  "TN-011-SEM-CARTAO": {
    code: "TN-011-SEM-CARTAO",
    titlePt: "Interac no Canadá sem cartão físico: rever",
    titleEn: "Interac Without Physical Card: Senior Review",
    messagePt: "Rever com chefia sénior Interac no Canadá sem cartão físico original.",
    messageEn: "Senior manager review for Canadian Interac return without physical original card.",
  },
  "TN-012": {
    code: "TN-012",
    titlePt: "Interac BackPocket com estorno manual VeriFone",
    titleEn: "Interac BackPocket with Manual Verifone Reversal",
    messagePt: "Processar Interac BackPocket com estorno manual na VeriFone pelo valor exato.",
    messageEn: "Process Interac BackPocket return with manual terminal debit reversal.",
  },

  // ==========================================================================
  // FAMÍLIA EP: EXCHANGES & PRICES (TROCAS E POLÍTICAS DE PREÇO)
  // ==========================================================================
  "EP-001": {
    code: "EP-001",
    titlePt: "Troca direta do mesmo modelo e cor (tamanho)",
    titleEn: "Direct Size Exchange for Identical Style",
    messagePt: "Honrar preço original ou promocional em troca com recibo que altera apenas o tamanho.",
    messageEn: "Even size exchange for identical style and color preserving original promotional value.",
  },
  "EP-002": {
    code: "EP-002",
    titlePt: "Troca com alteração de modelo ou cor",
    titleEn: "Exchange for Different Style or Color",
    messagePt: "Tratar troca com alteração de modelo ou cor como devolução seguida de nova venda.",
    messageEn: "Different style or color exchange processed as return and new sale at current price.",
  },
  "EP-003": {
    code: "EP-003",
    titlePt: "Devolução às cegas em promoção por escalões",
    titleEn: "Tiered Discount Blind Return Calculation",
    messagePt: "Devolução às cegas em promoção por escalões avaliada pela quantidade devolvida na sessão.",
    messageEn: "Blind return under tiered promotion evaluated by returned quantity in session.",
  },
  "EP-004": {
    code: "EP-004",
    titlePt: "Devolução com recibo em promoção por escalões",
    titleEn: "Tiered Discount Verified Return Calculation",
    messagePt: "Devolução com recibo em promoção por escalões calculada pelo POS com base na quantidade original.",
    messageEn: "Verified return under tiered promotion calculated by POS using original tier bracket.",
  },
  "EP-005": {
    code: "EP-005",
    titlePt: "Artigo entre canais no sortido da loja recetora",
    titleEn: "Cross-Channel Garment in Store Assortment",
    messagePt: "Reprecificar ao valor atual e retornar à área de vendas artigo entre canais no sortido.",
    messageEn: "Retag at current price and return to sales floor when item matches store assortment.",
  },
  "EP-006": {
    code: "EP-006",
    titlePt: "Artigo entre canais fora do sortido da loja recetora",
    titleEn: "Cross-Channel Garment Outside Store Assortment",
    messagePt: "Colocar em saldos com 20% de desconto sobre preço devolvido artigo fora do sortido.",
    messageEn: "Route to clearance with 20% markdown when item is outside store assortment.",
  },
  "EP-007": {
    code: "EP-007",
    titlePt: "Artigo entre canais já em saldo",
    titleEn: "Cross-Channel Garment Already on Clearance",
    messagePt: "Manter em saldos com promoções ativas artigo entre canais já em liquidação.",
    messageEn: "Maintain on clearance with active promotional pricing for liquidation garment.",
  },

  // ==========================================================================
  // FAMÍLIA EX: MANAGER OVERRIDES (EXCEÇÕES E CRITÉRIO DA GESTÃO)
  // ==========================================================================
  "EX-001": {
    code: "EX-001",
    titlePt: "Critério discricionário da gestão de loja",
    titleEn: "Store Manager Exception Discretion",
    messagePt: "Critério da gestão avalia vendabilidade, comprovativo, tempo, risco e circunstâncias.",
    messageEn: "Store Manager or Key Holder discretion evaluates counter exception request.",
  },
  "EX-002": {
    code: "EX-002",
    titlePt: "Explicar política perante contestação do cliente",
    titleEn: "Explain Policy and Offer Permitted Alternatives",
    messagePt: "Explicar política e oferecer melhor alternativa regulamentar perante contestação.",
    messageEn: "Explain policy firmly and present allowed alternatives upon customer dispute.",
  },
  "EX-003": {
    code: "EX-003",
    titlePt: "Escalar para gestor sénior perante agitação",
    titleEn: "Escalate to Senior Manager on Agitation",
    messagePt: "Escalar para responsável sénior perante cliente agitado; agitação não cria direito.",
    messageEn: "Escalate to senior store manager when customer displays hostile or agitated behavior.",
  },
  "EX-004": {
    code: "EX-004",
    titlePt: "Autorizar exceção de apaziguamento com baixo risco",
    titleEn: "Authorize Goodwill Exception (Low Risk)",
    messagePt: "Autorizar exceção de apaziguamento apenas sem hard stops, baixo risco e sistema apto.",
    messageEn: "Authorize counter exception only when hard stops are absent and system permits.",
  },
  "EX-005": {
    code: "EX-005",
    titlePt: "Adotar resolução menos abrangente para exceção",
    titleEn: "Apply Least Permissive Resolution on Exception",
    messagePt: "Adotar resolução menos abrangente para exceção aprovada em artigo vendável.",
    messageEn: "Apply least permissive resolution when granting commercial policy exception.",
  },
  "EX-006": {
    code: "EX-006",
    titlePt: "Recusar exceção que viole Afterpay ou marcas",
    titleEn: "Strictly Refuse Exception Overriding Afterpay or Brands",
    messagePt: "Recusar exceção que viole Afterpay, PayPal, Venmo, SKU ou personalização.",
    messageEn: "Strictly refuse exception that overrides Afterpay policy or unauthorized brands.",
  },
  "EX-007": {
    code: "EX-007",
    titlePt: "Documentar formalmente exceção aprovada",
    titleEn: "Document Approved Exception in Manager Log",
    messagePt: "Documentar formalmente motivo, aprovador, valor e destino de exceção autorizada.",
    messageEn: "Document business justification formally on store manager exception slip.",
  },
  "EX-008": {
    code: "EX-008",
    titlePt: "Suspender devolução perante indícios de fraude",
    titleEn: "Suspend Return upon Fraud Indicators",
    messagePt: "Pausar transação, envolver gestão e reportar à Segurança perante indícios de fraude.",
    messageEn: "Immediately suspend return and notify store security upon fraud indicators.",
  },

  // ==========================================================================
  // FAMÍLIA CT: CONTROLS & CONTEXT (CONTROLOS DE BALCÃO E ATRIBUIÇÃO)
  // ==========================================================================
  "CT-001": {
    code: "CT-001",
    titlePt: "Devolução verificada com credenciais autorizadas",
    titleEn: "Verified Return by Authorized Associate",
    messagePt: "Devolução verificada conduzida por colaborador autorizado com credenciais próprias.",
    messageEn: "Verified return processed by associate with authenticated POS credentials.",
  },
  "CT-002": {
    code: "CT-002",
    titlePt: "Devolução às cegas requer aprovação de chefia",
    titleEn: "Blind Return Requires Store Manager Override",
    messagePt: "Devolução às cegas por Lead Cashier ou Elevated Stylist requer aprovação do XStore Manager.",
    messageEn: "Blind return requires biometric/credential approval from Store Manager.",
  },
  "CT-003": {
    code: "CT-003",
    titlePt: "Conclusão da transação pelo mesmo colaborador",
    titleEn: "Single Associate Transaction Completion",
    messagePt: "Mesmo colaborador conclui transação do início ao fim com as suas próprias credenciais.",
    messageEn: "Same associate completes transaction from start to finish with private credentials.",
  },
  "CT-004": {
    code: "CT-004",
    titlePt: "Atribuir devolução ao Stylist da venda original",
    titleEn: "Attribute Return to Selling Stylist",
    messagePt: "Atribuir devolução com recibo ao Stylist responsável pela venda original.",
    messageEn: "Attribute verified return to the Stylist credited for the original sale.",
  },
  "CT-005": {
    code: "CT-005",
    titlePt: "Recolha de assinaturas obrigatórias",
    titleEn: "Collect Mandatory Signatures on Tape",
    messagePt: "Recolher assinaturas obrigatórias do cliente, operador e testemunha/SSC.",
    messageEn: "Collect mandatory customer, associate, and witness signatures on register tape.",
  },
  "CT-006": {
    code: "CT-006",
    titlePt: "Agrafar recibo original ao registo de caixa",
    titleEn: "Staple Original Receipt to Register Tape",
    messagePt: "Agrafar recibo original entregue ou anotar na cópia de loja se cliente retiver.",
    messageEn: "Staple surrendered original receipt or annotate register tape if customer retains.",
  },
  "CT-007": {
    code: "CT-007",
    titlePt: "Retenção documental durante 90 dias",
    titleEn: "90-Day Regulatory Document Retention",
    messagePt: "Reter suporte de loja e assinaturas durante 90 dias em arquivo regulamentar.",
    messageEn: "Retain physical register tape and signatures for 90 days in regulatory store file.",
  },
  "CT-008": {
    code: "CT-008",
    titlePt: "Inspeção de etiquetas, danos e RFID",
    titleEn: "Inspect RFID, Price Tags, and Damage Before Restocking",
    messagePt: "Inspecionar danos, etiquetas de preço e precisão RFID antes de repor em área de vendas.",
    messageEn: "Inspect garment damage, retagging, and RFID accuracy before returning to sales floor.",
  },

  // ==========================================================================
  // FAMÍLIA BW: BODYWEAR (PEÇAS ÍNTIMAS E HIGIENE)
  // ==========================================================================
  "BW-001": {
    code: "BW-001",
    titlePt: "Bodywear intacto: retornar à área de vendas",
    titleEn: "Intact Bodywear: Return to Sales Floor",
    messagePt: "Retornar à área de vendas bodywear não usado com embalagem original intacta.",
    messageEn: "Return intact, unopened bodywear package directly to sales floor.",
  },
  "BW-002": {
    code: "BW-002",
    titlePt: "Bodywear sem embalagem: saldos com desconto",
    titleEn: "Packageless Bodywear: Clearance Markdown",
    messagePt: "Colocar em saldos com 50% de desconto e código riscado a vermelho bodywear sem embalagem.",
    messageEn: "Place unpackaged unworn bodywear on clearance at 50% markdown with red tag slash.",
  },
  "BW-003": {
    code: "BW-003",
    titlePt: "Bodywear incompleto ou usado: baixa por dano",
    titleEn: "Used or Incomplete Bodywear: Damage Write-Off",
    messagePt: "Baixa por dano do conjunto completo se bodywear tiver unidades em falta ou foi usado.",
    messageEn: "Damage write-off for entire multipack if bodywear has missing pieces or was worn.",
  },
  "BW-004": {
    code: "BW-004",
    titlePt: "Bodywear contaminado: isolamento biológico imediato",
    titleEn: "Contaminated Bodywear: Immediate Biohazard Disposal",
    messagePt: "Isolar imediatamente em saco de risco biológico bodywear usado e sujo ou contaminado.",
    messageEn: "Immediately quarantine and dispose of soiled or hazardous bodywear in biohazard bag.",
  },

  // ==========================================================================
  // CONCLUSÕES CANÓNICAS ACM (OUT-001 A OUT-008)
  // ==========================================================================
  "OUT-001": {
    code: "OUT-001",
    titlePt: "Elegibilidade Comercial da Devolução",
    titleEn: "Commercial Return Eligibility",
    messagePt: "Determina a aprovação ou recusa do pedido conforme as políticas comerciais da Levi's.",
    messageEn: "Determines request approval, review, or denial under official Levi's policy.",
  },
  "OUT-002": {
    code: "OUT-002",
    titlePt: "Modalidade da Transação Autorizada",
    titleEn: "Authorized Transaction Resolution",
    messagePt: "Define se o atendimento procede como devolução monetária, troca ou crédito de loja.",
    messageEn: "Establishes resolution type: monetary refund, size exchange, or store credit.",
  },
  "OUT-003": {
    code: "OUT-003",
    titlePt: "Base de Cálculo do Valor",
    titleEn: "Value Basis & Calculation Method",
    messagePt: "Calcula o valor do reembolso segundo a base aplicável (pago, atual ou escalão).",
    messageEn: "Calculates settlement value based on applicable pricing policy (paid, current, or tier).",
  },
  "OUT-004": {
    code: "OUT-004",
    titlePt: "Meio de Pagamento e Liquidação",
    titleEn: "Settlement Tender & Payment Method",
    messagePt: "Especifica a forma de liquidação financeira (estorno original, cartão de oferta ou numerário).",
    messageEn: "Specifies settlement tender: original tender refund, gift card, or cash disbursement.",
  },
  "OUT-005": {
    code: "OUT-005",
    titlePt: "Nível de Autorização e Chefia",
    titleEn: "Required Managerial Approval Level",
    messagePt: "Indica o nível de validação por operador, gestor de turno ou gestor de loja.",
    messageEn: "Specifies override level: standard associate, key holder, or store manager.",
  },
  "OUT-006": {
    code: "OUT-006",
    titlePt: "Processo Operacional de Balcão",
    titleEn: "Required Operational Workflow",
    messagePt: "Identifica a aplicação ou terminal de execução (POS, BackPocket, Verifone ou Afterpay).",
    messageEn: "Identifies workflow and system terminal (POS, BackPocket, Verifone, or Afterpay).",
  },
  "OUT-007": {
    code: "OUT-007",
    titlePt: "Destino Físico da Mercadoria",
    titleEn: "Item Physical Disposition",
    messagePt: "Orienta o reencaminhamento do artigo para área de vendas, saldos, baixa ou isolamento.",
    messageEn: "Directs physical item routing to sales floor, clearance, write-off, or biohazard.",
  },
  "OUT-008": {
    code: "OUT-008",
    titlePt: "Documentação e Conformidade",
    titleEn: "Mandatory Compliance & Retention",
    messagePt: "Estipula os requisitos de assinaturas, retenção documental e arquivo regulamentar.",
    messageEn: "Specifies register tape signatures, receipt retention, and compliance file requirements.",
  },
};

/** Recupera a entrada do catálogo para um código normativo */
export function getRuleTranslation(code?: string | null): RuleTranslation | undefined {
  if (!code) return undefined;
  const upper = code.trim().toUpperCase();
  if (RULE_TRANSLATIONS[upper]) return RULE_TRANSLATIONS[upper];
  // Tentar encontrar prefixo ex.: PC-008 em PC-008-RECUSA
  const baseMatch = upper.match(/^([A-Z]{2,4}-\d{3,4})/);
  if (baseMatch && RULE_TRANSLATIONS[baseMatch[1]]) {
    return RULE_TRANSLATIONS[baseMatch[1]];
  }
  return undefined;
}

/**
 * Traduz deterministicamente códigos, títulos e mensagens de regras declarativas
 * emitidos tanto pelo Drools como pelo Prolog.
 */
export function translateRuleOutput(
  code?: string | null,
  rawTitle?: string | null,
  rawMessage?: string | null,
  locale: Locale = "pt"
): {
  code: string;
  title: string;
  message: string;
} {
  const isEn = locale === "en";

  // 1. Extração robusta do código de regra (ex: [PC-002], PC-002:, "HS-001")
  const fullHaystack = `${code ?? ""} ${rawTitle ?? ""} ${rawMessage ?? ""}`;
  const codeMatch = fullHaystack.match(/\b([A-Z]{2,4}-\d{3,4}(?:-[A-Z0-9]+)?)\b/);
  const matchedCode = code || (codeMatch ? codeMatch[1] : "");

  // 2. Consulta no catálogo canónico
  const entry = getRuleTranslation(matchedCode);

  if (entry) {
    if (isEn) {
      return {
        code: entry.code,
        title: entry.titleEn,
        message: entry.messageEn,
      };
    } else {
      return {
        code: entry.code,
        title: rawTitle && rawTitle.trim().length > 0 ? rawTitle : entry.titlePt,
        message: rawMessage && rawMessage.trim().length > 0 ? rawMessage : entry.messagePt,
      };
    }
  }

  // 3. Fallback limpo caso o código não conste no catálogo
  const cleanedTitle = cleanRuleCodes(rawTitle || matchedCode || "");
  const cleanedMessage = cleanRuleCodes(rawMessage || rawTitle || "");

  return {
    code: matchedCode || "REGRA",
    title: cleanedTitle || (isEn ? "Policy Rule" : "Regra Normativa"),
    message: cleanedMessage || (isEn ? "Applied return policy rule." : "Regra da política de devolução aplicada."),
  };
}

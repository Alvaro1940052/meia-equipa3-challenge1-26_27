import { CenarioExemploResponse } from "../types/levis";

export const LEVIS_OFFICIAL_SCENARIOS: CenarioExemploResponse[] = [
  {
    "id": 1,
    "titulo": "As etiquetas soltas, troca ao 29.º dia",
    "estado": "a validar",
    "aValidar": [
      "A-19",
      "A-22"
    ],
    "pressupostos": [
      "Colaborador Key Holder (docs/06 não indica quem processa).",
      "Pagamento original com cartão de crédito (docs/06 não indica).",
      "A possibilidade de revenda (IN-010) ainda não foi avaliada: revendivel = null.",
      "Preço pago promocional de 69.50 face a um PVP de 98.00.",
      "O SKU devolvido (501-ORIG-32) está no sortido da loja recetora."
    ],
    "justificacao": [
      "M0/M2: colaborador autorizado (CT-003); compra Mainline devolvida noutra Mainline (CH-001).",
      "M3: não usado com etiquetas soltas e revenda ainda por avaliar → PC-002 REVER (aprovação da gestão, A-19).",
      "M4/M5: recibo digital confirma a compra (PT-001); 29 dias ≤ 30 → PT-003 troca elegível.",
      "M6: troca com recibo só de tamanho → EP-001 mantém o preço promocional; o REVER aciona EX-001.",
      "M7: valor pago 69.50; sem saldo a reembolsar (TN-006 não se aplica).",
      "M8: CT-001, CT-004 (Stylist S-21), CT-005, CT-007; recibo digital não é agrafado (CT-006 não se aplica).",
      "M9: inspeção conforme (CT-008); entre canais e no sortido → EP-005 reprecificar e área de vendas.",
      "Resultado: REVER — a troca só avança quando a gestão confirmar que o artigo pode ser reetiquetado e revendido."
    ],
    "pedido": {
      "id": "C01",
      "dataPedido": "2026-03-31",
      "tipoPedido": "TROCA",
      "loja": {
        "codigo": "US-ML-010",
        "nome": "Mainline EUA",
        "mercado": "EUA",
        "tipoLoja": "MAINLINE",
        "lojaBackPocket": false,
        "coberturaLojaUnica": false,
        "skusSortido": [
          "501-ORIG-32",
          "501-ORIG-34"
        ]
      },
      "colaborador": {
        "id": "C-1",
        "nome": "Key Holder",
        "funcao": "KEY_HOLDER",
        "aprovadoPeloDM": false,
        "idCredencialPOS": "POS-C-1"
      },
      "cliente": {
        "id": null,
        "forneceDados": true,
        "barreiraLinguistica": false,
        "contestaResultado": false,
        "agitado": false
      },
      "compraOriginal": {
        "idTransacao": "T-0101",
        "canal": "MAINLINE",
        "dataCompra": "2026-03-02",
        "dataEnvio": null,
        "pagamento": {
          "meio": "CREDITO",
          "valorPago": "69.5",
          "estadoConta": "ATIVA",
          "cartaoFisicoPresente": false,
          "reembolsoOriginalRecusado": false,
          "acessoAplicacaoPagamento": null
        },
        "idStylistVenda": "S-21",
        "quantidadeComprada": 1,
        "promocaoEscaloes": false,
        "encomendaEncontrada": null,
        "ajustePrecoAplicado": false,
        "compraOferta": false
      },
      "comprovativo": {
        "tipo": "RECIBO_DIGITAL",
        "confirmaCompra": true,
        "reciboOriginal": true,
        "clienteMantemRecibo": false,
        "incluiOutrosArtigos": false
      },
      "artigos": [
        {
          "id": "A-1",
          "produto": {
            "sku": "501-ORIG-32",
            "skuReconhecidoPOS": true,
            "marca": "LEVIS",
            "categoria": "VESTUARIO",
            "grossista": false,
            "vendidoNaLoja": true,
            "produtoFranquia": false,
            "pvpOriginal": "98.0",
            "precoAtual": "98.0",
            "emSaldo": false
          },
          "quantidade": 1,
          "precoPago": "69.5",
          "estado": {
            "condicaoUso": "NAO_USADO",
            "etiquetas": "SOLTAS",
            "personalizado": false,
            "alterado": false,
            "embainhado": false,
            "defeitoFabricoConfirmado": false,
            "sujoOuInseguro": false,
            "danificado": false,
            "etiquetaPrecoCorreta": true,
            "rfidCorreto": true,
            "embalagemIntacta": true,
            "conjuntoCompleto": true
          },
          "entreCanais": true,
          "revendivel": null,
          "valorCalculadoPos": null
        }
      ],
      "artigosTroca": [
        {
          "produto": {
            "sku": "501-ORIG-34",
            "skuReconhecidoPOS": true,
            "marca": "LEVIS",
            "categoria": "VESTUARIO",
            "grossista": false,
            "vendidoNaLoja": true,
            "produtoFranquia": false,
            "pvpOriginal": "98.0",
            "precoAtual": "98.0",
            "emSaldo": false
          },
          "apenasMudaTamanho": true,
          "precoVenda": "98.0"
        }
      ],
      "portalOnlineDisponivel": null,
      "politicaPermiteAsCegasOnline": null,
      "pedidoExcecao": null,
      "indicadoresFraude": null
    },
    "esperado": {
      "elegibilidade": "REVER",
      "tipoVerificacao": "VERIFICADA",
      "tipoTransacao": "TROCA",
      "valorDevolucao": 69.5,
      "baseValor": "VALOR_PAGO",
      "meioReembolso": "MEIO_ORIGINAL",
      "aprovacao": "RESPONSAVEL_SENIOR",
      "terminal": false,
      "excecaoRecusada": false,
      "documentacao": {
        "idStylistAtribuido": "S-21",
        "reciboAgrafado": false,
        "assinaturaTestemunha": "Assinatura da testemunha",
        "retencaoAte": "2026-06-29"
      },
      "regrasDisparadas": [
        "CT-003",
        "CH-001",
        "PC-002",
        "PT-001",
        "PT-003",
        "EP-001",
        "EX-001",
        "CT-001",
        "CT-004",
        "CT-005",
        "CT-007",
        "CT-008",
        "EP-005",
        "OUT-001"
      ],
      "regrasNaoDisparadas": [
        "EP-002",
        "EX-002",
        "TN-006",
        "CT-006",
        "PT-004"
      ],
      "artigos": {
        "A-1": {
          "elegibilidade": "REVER",
          "valorDevolucao": 69.5,
          "destino": "AREA_VENDAS",
          "regrasDisparadas": [
            "PC-002",
            "CT-008",
            "EP-005"
          ]
        }
      }
    }
  },
  {
    "id": 2,
    "titulo": "O cliente irritado com Afterpay",
    "estado": "a validar",
    "aValidar": [
      "A-18",
      "A-22"
    ],
    "pressupostos": [
      "Colaborador Key Holder (docs/06 não indica quem processa).",
      "\"Entregue há 12 dias\" é tratado como enviado há 12 dias; data de compra igual à de envio.",
      "O pedido de troca noutra cor é registado como pedido de exceção que contorna o processo obrigatório da Afterpay.",
      "O casaco não está no sortido da loja recetora."
    ],
    "justificacao": [
      "M3: não usado com etiquetas (PC-001).",
      "Online: encomenda levi.com encontrada → CH-002 ENCAMINHAR para a BackPocket; Afterpay → TN-010 reembolso à Afterpay.",
      "A troca noutra cor é uma exceção ao meio Afterpay → HS-005 recusa a exceção (a devolução continua).",
      "M6: o cliente contesta (EX-002) e fica agitado → EX-003 escala para o responsável sénior; EX-004 não pode aprovar (disparou HS-005) e EX-006 recusa a exceção que contorna o processo obrigatório.",
      "M7: valor pago 128.00 no meio original (Afterpay, pela BackPocket).",
      "M8: CT-001, CT-005, CT-007 (arquivar com os suportes diários); sem Stylist da venda (CT-004 não se aplica).",
      "M9: inspeção conforme (CT-008); entre canais fora do sortido → EP-006 saldos a 20%.",
      "Resultado: ENCAMINHAR para a BackPocket, reembolso à Afterpay; a troca é recusada."
    ],
    "pedido": {
      "id": "C02",
      "dataPedido": "2026-03-31",
      "tipoPedido": "TROCA",
      "loja": {
        "codigo": "US-ML-020",
        "nome": "Mainline EUA",
        "mercado": "EUA",
        "tipoLoja": "MAINLINE",
        "lojaBackPocket": false,
        "coberturaLojaUnica": false,
        "skusSortido": null
      },
      "colaborador": {
        "id": "C-2",
        "nome": "Key Holder",
        "funcao": "KEY_HOLDER",
        "aprovadoPeloDM": false,
        "idCredencialPOS": "POS-C-2"
      },
      "cliente": {
        "id": null,
        "forneceDados": true,
        "barreiraLinguistica": false,
        "contestaResultado": true,
        "agitado": true
      },
      "compraOriginal": {
        "idTransacao": "LCOM-0202",
        "canal": "LEVI_COM",
        "dataCompra": "2026-03-19",
        "dataEnvio": "2026-03-19",
        "pagamento": {
          "meio": "AFTERPAY",
          "valorPago": "128.0",
          "estadoConta": null,
          "cartaoFisicoPresente": false,
          "reembolsoOriginalRecusado": false,
          "acessoAplicacaoPagamento": null
        },
        "idStylistVenda": null,
        "quantidadeComprada": 1,
        "promocaoEscaloes": false,
        "encomendaEncontrada": true,
        "ajustePrecoAplicado": false,
        "compraOferta": false
      },
      "comprovativo": {
        "tipo": "CONFIRMACAO_ENCOMENDA",
        "confirmaCompra": true,
        "reciboOriginal": false,
        "clienteMantemRecibo": false,
        "incluiOutrosArtigos": false
      },
      "artigos": [
        {
          "id": "A-1",
          "produto": {
            "sku": "TRUCKER-AZUL-M",
            "skuReconhecidoPOS": true,
            "marca": "LEVIS",
            "categoria": "VESTUARIO",
            "grossista": false,
            "vendidoNaLoja": true,
            "produtoFranquia": false,
            "pvpOriginal": "128.0",
            "precoAtual": "128.0",
            "emSaldo": false
          },
          "quantidade": 1,
          "precoPago": "128.0",
          "estado": {
            "condicaoUso": "NAO_USADO",
            "etiquetas": "COLOCADAS",
            "personalizado": false,
            "alterado": false,
            "embainhado": false,
            "defeitoFabricoConfirmado": false,
            "sujoOuInseguro": false,
            "danificado": false,
            "etiquetaPrecoCorreta": true,
            "rfidCorreto": true,
            "embalagemIntacta": true,
            "conjuntoCompleto": true
          },
          "entreCanais": true,
          "revendivel": null,
          "valorCalculadoPos": null
        }
      ],
      "artigosTroca": [
        {
          "produto": {
            "sku": "TRUCKER-PRETO-M",
            "skuReconhecidoPOS": true,
            "marca": "LEVIS",
            "categoria": "VESTUARIO",
            "grossista": false,
            "vendidoNaLoja": true,
            "produtoFranquia": false,
            "pvpOriginal": "128.0",
            "precoAtual": "128.0",
            "emSaldo": false
          },
          "apenasMudaTamanho": false,
          "precoVenda": "128.0"
        }
      ],
      "portalOnlineDisponivel": null,
      "politicaPermiteAsCegasOnline": null,
      "pedidoExcecao": {
        "motivo": "Exige troca imediata do casaco por outra cor e recusa o reembolso.",
        "resolucaoPedida": "TROCA",
        "exigeMeioProibido": false,
        "exigeSkuIncorreto": false,
        "envolveProdutoExcluido": false,
        "contornaProcessoObrigatorio": true,
        "concluivelNoSistema": true,
        "aprovada": null,
        "aprovador": null,
        "preocupacaoCliente": "Quer a troca imediata e pede para falar com o responsável mais sénior."
      },
      "indicadoresFraude": null
    },
    "esperado": {
      "elegibilidade": "ENCAMINHAR",
      "tipoVerificacao": "VERIFICADA",
      "tipoTransacao": "REEMBOLSO",
      "valorDevolucao": 128,
      "baseValor": "VALOR_PAGO",
      "meioReembolso": "MEIO_ORIGINAL",
      "aprovacao": "RESPONSAVEL_SENIOR",
      "processo": "BACKPOCKET",
      "terminal": false,
      "excecaoRecusada": true,
      "documentacao": {
        "assinaturaTestemunha": "Assinatura da testemunha",
        "retencaoAte": "2026-06-29"
      },
      "regrasDisparadas": [
        "CT-003",
        "PC-001",
        "CH-002",
        "TN-010",
        "HS-005",
        "EX-002",
        "EX-003",
        "EX-004",
        "EX-006",
        "CT-001",
        "CT-005",
        "CT-007",
        "CT-008",
        "EP-006",
        "OUT-001"
      ],
      "regrasNaoDisparadas": [
        "CH-001",
        "IN-003",
        "PT-001",
        "PT-003",
        "CH-006",
        "EP-002",
        "EX-005",
        "EX-007",
        "CT-004",
        "TN-009"
      ],
      "artigos": {
        "A-1": {
          "elegibilidade": "PERMITIR",
          "valorDevolucao": 128,
          "destino": "SALDOS",
          "descontoSaldo": 20,
          "regrasDisparadas": [
            "PC-001",
            "CT-008",
            "EP-006"
          ]
        }
      }
    }
  },
  {
    "id": 3,
    "titulo": "A devolução de oferta na Outlet sem recibo",
    "estado": "a validar",
    "aValidar": [
      "A-01",
      "A-13",
      "A-16",
      "A-21"
    ],
    "pressupostos": [
      "Canal de compra desconhecido (oferta sem qualquer registo).",
      "Colaborador Lead Cashier aprovado pelo DM, para exercitar CT-002 (docs/06 não indica quem processa).",
      "Data e meio de pagamento da compra desconhecidos.",
      "Preço atual promocional de 39.99 face a um PVP de 98.00."
    ],
    "justificacao": [
      "M2: canal desconhecido (IN-003, A-01).",
      "M3: não usado com etiquetas (PC-001).",
      "M4/M5: sem comprovativo → PT-002 às cegas (o cliente dá os dados, PT-006 não se aplica) → PT-005 só crédito de loja ao preço atual (oferta sem recibo, A-13; sem prazo, A-16).",
      "M7: Outlet às cegas → CH-009 preço atual após promoções: 39.99, não o PVP de 98.00.",
      "M8: devolução às cegas por Lead Cashier → CT-002 aprovação do XStore Manager; CT-005, CT-007.",
      "M9: inspeção conforme → área de vendas (CT-008).",
      "Resultado: PERMITIR crédito de loja de 39.99 com aprovação do XStore Manager."
    ],
    "pedido": {
      "id": "C03",
      "dataPedido": "2026-03-31",
      "tipoPedido": "DEVOLUCAO_OFERTA",
      "loja": {
        "codigo": "US-OUT-030",
        "nome": "Outlet EUA",
        "mercado": "EUA",
        "tipoLoja": "OUTLET",
        "lojaBackPocket": false,
        "coberturaLojaUnica": false,
        "skusSortido": [
          "505-REG-30"
        ]
      },
      "colaborador": {
        "id": "C-3",
        "nome": "Lead Cashier",
        "funcao": "LEAD_CASHIER",
        "aprovadoPeloDM": true,
        "idCredencialPOS": "POS-C-3"
      },
      "cliente": {
        "id": null,
        "forneceDados": true,
        "barreiraLinguistica": false,
        "contestaResultado": false,
        "agitado": false
      },
      "compraOriginal": {
        "idTransacao": null,
        "canal": "DESCONHECIDO",
        "dataCompra": null,
        "dataEnvio": null,
        "pagamento": null,
        "idStylistVenda": null,
        "quantidadeComprada": 1,
        "promocaoEscaloes": false,
        "encomendaEncontrada": null,
        "ajustePrecoAplicado": false,
        "compraOferta": true
      },
      "comprovativo": null,
      "artigos": [
        {
          "id": "A-1",
          "produto": {
            "sku": "505-REG-30",
            "skuReconhecidoPOS": true,
            "marca": "LEVIS",
            "categoria": "VESTUARIO",
            "grossista": false,
            "vendidoNaLoja": true,
            "produtoFranquia": false,
            "pvpOriginal": "98.0",
            "precoAtual": "39.99",
            "emSaldo": false
          },
          "quantidade": 1,
          "precoPago": null,
          "estado": {
            "condicaoUso": "NAO_USADO",
            "etiquetas": "COLOCADAS",
            "personalizado": false,
            "alterado": false,
            "embainhado": false,
            "defeitoFabricoConfirmado": false,
            "sujoOuInseguro": false,
            "danificado": false,
            "etiquetaPrecoCorreta": true,
            "rfidCorreto": true,
            "embalagemIntacta": true,
            "conjuntoCompleto": true
          },
          "entreCanais": false,
          "revendivel": null,
          "valorCalculadoPos": null
        }
      ],
      "artigosTroca": null,
      "portalOnlineDisponivel": null,
      "politicaPermiteAsCegasOnline": null,
      "pedidoExcecao": null,
      "indicadoresFraude": null
    },
    "esperado": {
      "elegibilidade": "PERMITIR",
      "tipoVerificacao": "AS_CEGAS",
      "tipoTransacao": "CREDITO_LOJA",
      "valorDevolucao": 39.99,
      "baseValor": "VALOR_PROMOCIONAL",
      "meioReembolso": "CREDITO_LOJA",
      "aprovacao": "XSTORE_MANAGER",
      "terminal": false,
      "documentacao": {
        "retencaoAte": "2026-06-29"
      },
      "regrasDisparadas": [
        "CT-003",
        "IN-003",
        "PC-001",
        "PT-002",
        "PT-005",
        "CH-009",
        "CT-002",
        "CT-005",
        "CT-007",
        "CT-008",
        "OUT-001"
      ],
      "regrasNaoDisparadas": [
        "PT-001",
        "PT-006",
        "TN-007",
        "CT-001",
        "CT-004",
        "EP-003"
      ],
      "artigos": {
        "A-1": {
          "elegibilidade": "PERMITIR",
          "valorDevolucao": 39.99,
          "destino": "AREA_VENDAS",
          "regrasDisparadas": [
            "PC-001",
            "CH-009",
            "CT-008"
          ]
        }
      }
    }
  },
  {
    "id": 4,
    "titulo": "As calças com bainha e defeito",
    "estado": "a validar",
    "aValidar": [],
    "pressupostos": [
      "Colaborador Key Holder (docs/06 não indica quem processa).",
      "Pagamento original com cartão de crédito (docs/06 não indica).",
      "O colaborador confirma o defeito de fabrico na costura, para verificar que HS-003 prevalece sobre PC-006."
    ],
    "justificacao": [
      "M3: calças embainhadas → HS-003 RECUSAR, mesmo com o defeito confirmado (HS-003 prevalece sobre PC-006).",
      "M4: o recibo original confirma a compra (PT-001), mas sem artigo elegível não há prazo a aplicar (PT-003).",
      "M9: artigo recusado → devolução ao cliente (OUT-007); o pedido fica RECUSAR sem transação (OUT-001).",
      "A pressão da viagem não altera a elegibilidade; o cliente não contesta formalmente (EX-002 não se aplica)."
    ],
    "pedido": {
      "id": "C04",
      "dataPedido": "2026-03-31",
      "tipoPedido": "DEVOLUCAO",
      "loja": {
        "codigo": "US-ML-040",
        "nome": "Mainline EUA",
        "mercado": "EUA",
        "tipoLoja": "MAINLINE",
        "lojaBackPocket": false,
        "coberturaLojaUnica": false,
        "skusSortido": null
      },
      "colaborador": {
        "id": "C-4",
        "nome": "Key Holder",
        "funcao": "KEY_HOLDER",
        "aprovadoPeloDM": false,
        "idCredencialPOS": "POS-C-4"
      },
      "cliente": {
        "id": null,
        "forneceDados": true,
        "barreiraLinguistica": false,
        "contestaResultado": false,
        "agitado": false
      },
      "compraOriginal": {
        "idTransacao": "T-0404",
        "canal": "MAINLINE",
        "dataCompra": "2026-03-21",
        "dataEnvio": null,
        "pagamento": {
          "meio": "CREDITO",
          "valorPago": "89.5",
          "estadoConta": "ATIVA",
          "cartaoFisicoPresente": false,
          "reembolsoOriginalRecusado": false,
          "acessoAplicacaoPagamento": null
        },
        "idStylistVenda": "S-44",
        "quantidadeComprada": 1,
        "promocaoEscaloes": false,
        "encomendaEncontrada": null,
        "ajustePrecoAplicado": false,
        "compraOferta": false
      },
      "comprovativo": {
        "tipo": "RECIBO_IMPRESSO",
        "confirmaCompra": true,
        "reciboOriginal": true,
        "clienteMantemRecibo": false,
        "incluiOutrosArtigos": false
      },
      "artigos": [
        {
          "id": "A-1",
          "produto": {
            "sku": "511-SLIM-32",
            "skuReconhecidoPOS": true,
            "marca": "LEVIS",
            "categoria": "VESTUARIO",
            "grossista": false,
            "vendidoNaLoja": true,
            "produtoFranquia": false,
            "pvpOriginal": "89.5",
            "precoAtual": "89.5",
            "emSaldo": false
          },
          "quantidade": 1,
          "precoPago": "89.5",
          "estado": {
            "condicaoUso": "USADO",
            "etiquetas": "AUSENTES",
            "personalizado": false,
            "alterado": false,
            "embainhado": true,
            "defeitoFabricoConfirmado": true,
            "sujoOuInseguro": false,
            "danificado": true,
            "etiquetaPrecoCorreta": true,
            "rfidCorreto": true,
            "embalagemIntacta": true,
            "conjuntoCompleto": true
          },
          "entreCanais": false,
          "revendivel": null,
          "valorCalculadoPos": null
        }
      ],
      "artigosTroca": null,
      "portalOnlineDisponivel": null,
      "politicaPermiteAsCegasOnline": null,
      "pedidoExcecao": null,
      "indicadoresFraude": null
    },
    "esperado": {
      "elegibilidade": "RECUSAR",
      "tipoVerificacao": "VERIFICADA",
      "tipoTransacao": "NENHUMA",
      "terminal": false,
      "regrasDisparadas": [
        "CT-003",
        "CH-001",
        "HS-003",
        "PT-001",
        "OUT-007",
        "OUT-001"
      ],
      "regrasNaoDisparadas": [
        "PC-006",
        "PC-004",
        "PT-003",
        "CT-005",
        "EX-002"
      ],
      "artigos": {
        "A-1": {
          "elegibilidade": "RECUSAR",
          "tipoTransacao": "NENHUMA",
          "destino": "DEVOLUCAO_CLIENTE",
          "regrasDisparadas": [
            "HS-003",
            "OUT-007"
          ]
        }
      }
    }
  },
  {
    "id": 5,
    "titulo": "A disputa sobre produto grossista",
    "estado": "a validar",
    "aValidar": [
      "A-08"
    ],
    "pressupostos": [
      "Colaborador Key Holder (docs/06 não indica quem processa).",
      "Compra há 15 dias, paga com cartão de crédito no retalhista grossista.",
      "O SKU do produto grossista não é reconhecido como vendido na loja."
    ],
    "justificacao": [
      "M2: comprado num retalhista grossista → CH-008 RECUSAR e encaminhar o cliente para o retalhista (paragem obrigatória; HS-002 já não é avaliada, A-08).",
      "M6: o cliente contesta → EX-002 explicar a política (mesmo após a paragem, ADR 0004); não fica agitado (EX-003 não se aplica).",
      "O pedido de troca ou crédito de loja não pode contornar a paragem obrigatória.",
      "M9: o artigo volta ao cliente (OUT-007)."
    ],
    "pedido": {
      "id": "C05",
      "dataPedido": "2026-03-31",
      "tipoPedido": "DEVOLUCAO",
      "loja": {
        "codigo": "US-ML-050",
        "nome": "Mainline EUA",
        "mercado": "EUA",
        "tipoLoja": "MAINLINE",
        "lojaBackPocket": false,
        "coberturaLojaUnica": false,
        "skusSortido": null
      },
      "colaborador": {
        "id": "C-5",
        "nome": "Key Holder",
        "funcao": "KEY_HOLDER",
        "aprovadoPeloDM": false,
        "idCredencialPOS": "POS-C-5"
      },
      "cliente": {
        "id": null,
        "forneceDados": true,
        "barreiraLinguistica": false,
        "contestaResultado": true,
        "agitado": false
      },
      "compraOriginal": {
        "idTransacao": "GROSS-0505",
        "canal": "GROSSISTA",
        "dataCompra": "2026-03-16",
        "dataEnvio": null,
        "pagamento": {
          "meio": "CREDITO",
          "valorPago": "39.0",
          "estadoConta": "ATIVA",
          "cartaoFisicoPresente": false,
          "reembolsoOriginalRecusado": false,
          "acessoAplicacaoPagamento": null
        },
        "idStylistVenda": null,
        "quantidadeComprada": 1,
        "promocaoEscaloes": false,
        "encomendaEncontrada": null,
        "ajustePrecoAplicado": false,
        "compraOferta": false
      },
      "comprovativo": {
        "tipo": "RECIBO_IMPRESSO",
        "confirmaCompra": true,
        "reciboOriginal": true,
        "clienteMantemRecibo": false,
        "incluiOutrosArtigos": false
      },
      "artigos": [
        {
          "id": "A-1",
          "produto": {
            "sku": "LSS-ATH-34",
            "skuReconhecidoPOS": true,
            "marca": "LS_SIGNATURE",
            "categoria": "VESTUARIO",
            "grossista": true,
            "vendidoNaLoja": false,
            "produtoFranquia": false,
            "pvpOriginal": "39.0",
            "precoAtual": "39.0",
            "emSaldo": false
          },
          "quantidade": 1,
          "precoPago": "39.0",
          "estado": {
            "condicaoUso": "NAO_USADO",
            "etiquetas": "COLOCADAS",
            "personalizado": false,
            "alterado": false,
            "embainhado": false,
            "defeitoFabricoConfirmado": false,
            "sujoOuInseguro": false,
            "danificado": false,
            "etiquetaPrecoCorreta": true,
            "rfidCorreto": true,
            "embalagemIntacta": true,
            "conjuntoCompleto": true
          },
          "entreCanais": false,
          "revendivel": null,
          "valorCalculadoPos": null
        }
      ],
      "artigosTroca": null,
      "portalOnlineDisponivel": null,
      "politicaPermiteAsCegasOnline": null,
      "pedidoExcecao": {
        "motivo": "O produto é fabricado pela Levi's; pede troca ou crédito de loja e invoca exceções de outras marcas.",
        "resolucaoPedida": "CREDITO_LOJA",
        "exigeMeioProibido": false,
        "exigeSkuIncorreto": false,
        "envolveProdutoExcluido": true,
        "contornaProcessoObrigatorio": false,
        "concluivelNoSistema": true,
        "aprovada": null,
        "aprovador": null,
        "preocupacaoCliente": null
      },
      "indicadoresFraude": null
    },
    "esperado": {
      "elegibilidade": "RECUSAR",
      "tipoVerificacao": "NAO_DETERMINADA",
      "tipoTransacao": "NENHUMA",
      "terminal": true,
      "regrasDisparadas": [
        "CT-003",
        "CH-008",
        "EX-002",
        "OUT-007",
        "OUT-001"
      ],
      "regrasNaoDisparadas": [
        "HS-002",
        "PC-001",
        "PT-001",
        "EX-003",
        "EX-006",
        "CT-005"
      ],
      "artigos": {
        "A-1": {
          "destino": "DEVOLUCAO_CLIENTE",
          "regrasDisparadas": [
            "OUT-007"
          ]
        }
      }
    }
  },
  {
    "id": 6,
    "titulo": "A devolução sem recibo de artigos em estados diferentes",
    "estado": "a validar",
    "aValidar": [
      "A-01",
      "A-15",
      "A-16",
      "A-25",
      "A-26",
      "A-27",
      "A-28"
    ],
    "pressupostos": [
      "Loja Mainline (docs/06 diz apenas \"uma loja dos EUA\"); colaborador Key Holder.",
      "Canal de compra desconhecido.",
      "O cliente defensivo não fornece dados pessoais (PT-006).",
      "O par com mancha visível é registado como usado e sujo (sujoOuInseguro).",
      "O colaborador regista a incapacidade de explicar onde e quando os artigos foram comprados como indício de fraude de nível significativo (A-27).",
      "O pedido de reembolso em numerário numa devolução às cegas é registado como exceção que exige um meio proibido."
    ],
    "justificacao": [
      "Transversal: indício de fraude significativo (A-27) → EX-008 suspende a transação e escala para District/Area e Global Safety and Security; nenhum módulo seguinte é avaliado.",
      "Transversal: o par com mancha é sujo/inseguro → PC-008 isolamento por risco biológico, mesmo com a transação suspensa (A-28).",
      "Sem a suspensão, os resultados por artigo seriam PC-003 (rever), PC-004 (rever) e PC-004 (rever) às cegas (ver ElegibilidadeProdutoTest).",
      "Resultado: REVER, suspenso, com escalonamento para District/Area; o pedido de numerário não é avaliado."
    ],
    "pedido": {
      "id": "C06",
      "dataPedido": "2026-03-31",
      "tipoPedido": "DEVOLUCAO",
      "loja": {
        "codigo": "US-ML-060",
        "nome": "Mainline EUA",
        "mercado": "EUA",
        "tipoLoja": "MAINLINE",
        "lojaBackPocket": false,
        "coberturaLojaUnica": false,
        "skusSortido": null
      },
      "colaborador": {
        "id": "C-6",
        "nome": "Key Holder",
        "funcao": "KEY_HOLDER",
        "aprovadoPeloDM": false,
        "idCredencialPOS": "POS-C-6"
      },
      "cliente": {
        "id": null,
        "forneceDados": false,
        "barreiraLinguistica": false,
        "contestaResultado": false,
        "agitado": false
      },
      "compraOriginal": {
        "idTransacao": null,
        "canal": "DESCONHECIDO",
        "dataCompra": null,
        "dataEnvio": null,
        "pagamento": null,
        "idStylistVenda": null,
        "quantidadeComprada": 1,
        "promocaoEscaloes": false,
        "encomendaEncontrada": null,
        "ajustePrecoAplicado": false,
        "compraOferta": false
      },
      "comprovativo": null,
      "artigos": [
        {
          "id": "A-1",
          "produto": {
            "sku": "PREM-501-30",
            "skuReconhecidoPOS": true,
            "marca": "LEVIS",
            "categoria": "VESTUARIO",
            "grossista": false,
            "vendidoNaLoja": true,
            "produtoFranquia": false,
            "pvpOriginal": "148.0",
            "precoAtual": "148.0",
            "emSaldo": false
          },
          "quantidade": 1,
          "precoPago": null,
          "estado": {
            "condicaoUso": "NAO_USADO",
            "etiquetas": "AUSENTES",
            "personalizado": false,
            "alterado": false,
            "embainhado": false,
            "defeitoFabricoConfirmado": false,
            "sujoOuInseguro": false,
            "danificado": false,
            "etiquetaPrecoCorreta": true,
            "rfidCorreto": true,
            "embalagemIntacta": true,
            "conjuntoCompleto": true
          },
          "entreCanais": false,
          "revendivel": null,
          "valorCalculadoPos": null
        },
        {
          "id": "A-2",
          "produto": {
            "sku": "PREM-511-32",
            "skuReconhecidoPOS": true,
            "marca": "LEVIS",
            "categoria": "VESTUARIO",
            "grossista": false,
            "vendidoNaLoja": true,
            "produtoFranquia": false,
            "pvpOriginal": "148.0",
            "precoAtual": "148.0",
            "emSaldo": false
          },
          "quantidade": 1,
          "precoPago": null,
          "estado": {
            "condicaoUso": "USADO",
            "etiquetas": "AUSENTES",
            "personalizado": false,
            "alterado": false,
            "embainhado": false,
            "defeitoFabricoConfirmado": false,
            "sujoOuInseguro": false,
            "danificado": false,
            "etiquetaPrecoCorreta": true,
            "rfidCorreto": true,
            "embalagemIntacta": true,
            "conjuntoCompleto": true
          },
          "entreCanais": false,
          "revendivel": null,
          "valorCalculadoPos": null
        },
        {
          "id": "A-3",
          "produto": {
            "sku": "PREM-512-34",
            "skuReconhecidoPOS": true,
            "marca": "LEVIS",
            "categoria": "VESTUARIO",
            "grossista": false,
            "vendidoNaLoja": true,
            "produtoFranquia": false,
            "pvpOriginal": "148.0",
            "precoAtual": "148.0",
            "emSaldo": false
          },
          "quantidade": 1,
          "precoPago": null,
          "estado": {
            "condicaoUso": "USADO",
            "etiquetas": "AUSENTES",
            "personalizado": false,
            "alterado": false,
            "embainhado": false,
            "defeitoFabricoConfirmado": false,
            "sujoOuInseguro": true,
            "danificado": false,
            "etiquetaPrecoCorreta": true,
            "rfidCorreto": true,
            "embalagemIntacta": true,
            "conjuntoCompleto": true
          },
          "entreCanais": false,
          "revendivel": null,
          "valorCalculadoPos": null
        }
      ],
      "artigosTroca": null,
      "portalOnlineDisponivel": null,
      "politicaPermiteAsCegasOnline": null,
      "pedidoExcecao": {
        "motivo": "Pede reembolso imediato em numerário.",
        "resolucaoPedida": "REEMBOLSO",
        "exigeMeioProibido": true,
        "exigeSkuIncorreto": false,
        "envolveProdutoExcluido": false,
        "contornaProcessoObrigatorio": false,
        "concluivelNoSistema": true,
        "aprovada": null,
        "aprovador": null,
        "preocupacaoCliente": null
      },
      "indicadoresFraude": null
    },
    "esperado": {
      "elegibilidade": "REVER",
      "aprovacao": "DISTRICT_AREA",
      "terminal": true,
      "regrasDisparadas": [
        "EX-008",
        "PC-008"
      ],
      "regrasNaoDisparadas": [
        "CT-003",
        "IN-003",
        "PT-002",
        "PT-005",
        "OUT-007",
        "OUT-001"
      ],
      "artigos": {
        "A-3": {
          "destino": "RISCO_BIOLOGICO",
          "regrasDisparadas": [
            "PC-008"
          ]
        }
      }
    }
  },
  {
    "id": 7,
    "titulo": "A substituição do cartão Interac no Canadá",
    "estado": "a validar",
    "aValidar": [
      "A-10",
      "A-11"
    ],
    "pressupostos": [
      "Colaborador Key Holder (docs/06 não indica quem processa).",
      "O cartão de substituição não é o mesmo cartão físico usado na compra (cartaoFisicoPresente = false).",
      "O pedido de reembolso para o cartão de substituição ou em numerário é registado como exceção que exige um meio proibido."
    ],
    "justificacao": [
      "M3/M4/M5: artigo elegível (PC-001), recibo original (PT-001), 18 dias → PT-003 reembolso no meio original.",
      "M6: o cliente contesta a exigência do cartão → EX-002 explicar a política.",
      "M7: Interac no Canadá → TN-011 exige o mesmo cartão físico; o cartão de substituição não é o mesmo (A-10) → REVER, sem reembolso Interac, sem numerário nem outro cartão. O Interac não segue TN-001/TN-004 (A-11).",
      "M8: documentação preparada (CT-001, CT-004, CT-005, CT-006 recibo agrafado, CT-007).",
      "M9: inspeção conforme → área de vendas.",
      "Resultado: REVER com o responsável sénior; o reembolso de 79.50 fica sem meio definido."
    ],
    "pedido": {
      "id": "C07",
      "dataPedido": "2026-03-31",
      "tipoPedido": "DEVOLUCAO",
      "loja": {
        "codigo": "CA-ML-070",
        "nome": "Mainline Canadá",
        "mercado": "CANADA",
        "tipoLoja": "MAINLINE",
        "lojaBackPocket": false,
        "coberturaLojaUnica": false,
        "skusSortido": null
      },
      "colaborador": {
        "id": "C-7",
        "nome": "Key Holder",
        "funcao": "KEY_HOLDER",
        "aprovadoPeloDM": false,
        "idCredencialPOS": "POS-C-7"
      },
      "cliente": {
        "id": null,
        "forneceDados": true,
        "barreiraLinguistica": false,
        "contestaResultado": true,
        "agitado": false
      },
      "compraOriginal": {
        "idTransacao": "T-0707",
        "canal": "MAINLINE",
        "dataCompra": "2026-03-13",
        "dataEnvio": null,
        "pagamento": {
          "meio": "INTERAC",
          "valorPago": "79.5",
          "estadoConta": "ATIVA_CARTAO_PERDIDO",
          "cartaoFisicoPresente": false,
          "reembolsoOriginalRecusado": false,
          "acessoAplicacaoPagamento": null
        },
        "idStylistVenda": "S-77",
        "quantidadeComprada": 1,
        "promocaoEscaloes": false,
        "encomendaEncontrada": null,
        "ajustePrecoAplicado": false,
        "compraOferta": false
      },
      "comprovativo": {
        "tipo": "RECIBO_IMPRESSO",
        "confirmaCompra": true,
        "reciboOriginal": true,
        "clienteMantemRecibo": false,
        "incluiOutrosArtigos": false
      },
      "artigos": [
        {
          "id": "A-1",
          "produto": {
            "sku": "CA-541-32",
            "skuReconhecidoPOS": true,
            "marca": "LEVIS",
            "categoria": "VESTUARIO",
            "grossista": false,
            "vendidoNaLoja": true,
            "produtoFranquia": false,
            "pvpOriginal": "79.5",
            "precoAtual": "79.5",
            "emSaldo": false
          },
          "quantidade": 1,
          "precoPago": "79.5",
          "estado": {
            "condicaoUso": "NAO_USADO",
            "etiquetas": "COLOCADAS",
            "personalizado": false,
            "alterado": false,
            "embainhado": false,
            "defeitoFabricoConfirmado": false,
            "sujoOuInseguro": false,
            "danificado": false,
            "etiquetaPrecoCorreta": true,
            "rfidCorreto": true,
            "embalagemIntacta": true,
            "conjuntoCompleto": true
          },
          "entreCanais": false,
          "revendivel": null,
          "valorCalculadoPos": null
        }
      ],
      "artigosTroca": null,
      "portalOnlineDisponivel": null,
      "politicaPermiteAsCegasOnline": null,
      "pedidoExcecao": {
        "motivo": "Pede reembolso para o cartão de substituição ou em numerário.",
        "resolucaoPedida": "REEMBOLSO",
        "exigeMeioProibido": true,
        "exigeSkuIncorreto": false,
        "envolveProdutoExcluido": false,
        "contornaProcessoObrigatorio": false,
        "concluivelNoSistema": true,
        "aprovada": null,
        "aprovador": null,
        "preocupacaoCliente": null
      },
      "indicadoresFraude": null
    },
    "esperado": {
      "elegibilidade": "REVER",
      "tipoVerificacao": "VERIFICADA",
      "tipoTransacao": "REEMBOLSO",
      "valorDevolucao": 79.5,
      "baseValor": "VALOR_PAGO",
      "aprovacao": "RESPONSAVEL_SENIOR",
      "terminal": false,
      "documentacao": {
        "idStylistAtribuido": "S-77",
        "reciboAgrafado": true,
        "retencaoAte": "2026-06-29"
      },
      "regrasDisparadas": [
        "CT-003",
        "CH-001",
        "PC-001",
        "PT-001",
        "PT-003",
        "EX-002",
        "TN-011",
        "CT-001",
        "CT-004",
        "CT-005",
        "CT-006",
        "CT-007",
        "CT-008",
        "OUT-001"
      ],
      "regrasNaoDisparadas": [
        "TN-001",
        "TN-004",
        "TN-012",
        "EX-003"
      ],
      "artigos": {
        "A-1": {
          "elegibilidade": "PERMITIR",
          "valorDevolucao": 79.5,
          "destino": "AREA_VENDAS"
        }
      }
    }
  },
  {
    "id": 8,
    "titulo": "O ajuste de preço após alteração de promoção",
    "estado": "a validar",
    "aValidar": [
      "A-14"
    ],
    "pressupostos": [
      "Colaborador Key Holder (docs/06 não indica quem processa).",
      "Pagamento original com cartão de crédito.",
      "A fotografia do recibo não é o recibo original (reciboOriginal = false).",
      "O preço atual do produto (99.00) é o preço anunciado online; o preço pago com a promoção anterior foi 119.00."
    ],
    "justificacao": [
      "M4: a fotografia do recibo confirma a compra (PT-001), mas não é o recibo original (A-14).",
      "M5: ajuste de preço sem recibo original → PT-008 RECUSAR (os 13 dias não chegam); PT-007 não se aplica.",
      "M6: o cliente contesta → EX-002 explicar a política; o pedido de cartão de oferta para a diferença não chega a ser avaliado.",
      "M9: num ajuste de preço o artigo não é entregue: sem destino.",
      "Resultado: RECUSAR o ajuste."
    ],
    "pedido": {
      "id": "C08",
      "dataPedido": "2026-03-31",
      "tipoPedido": "AJUSTE_PRECO",
      "loja": {
        "codigo": "US-ML-080",
        "nome": "Mainline EUA",
        "mercado": "EUA",
        "tipoLoja": "MAINLINE",
        "lojaBackPocket": false,
        "coberturaLojaUnica": false,
        "skusSortido": null
      },
      "colaborador": {
        "id": "C-8",
        "nome": "Key Holder",
        "funcao": "KEY_HOLDER",
        "aprovadoPeloDM": false,
        "idCredencialPOS": "POS-C-8"
      },
      "cliente": {
        "id": null,
        "forneceDados": true,
        "barreiraLinguistica": false,
        "contestaResultado": true,
        "agitado": false
      },
      "compraOriginal": {
        "idTransacao": "T-0808",
        "canal": "MAINLINE",
        "dataCompra": "2026-03-18",
        "dataEnvio": null,
        "pagamento": {
          "meio": "CREDITO",
          "valorPago": "119.0",
          "estadoConta": "ATIVA",
          "cartaoFisicoPresente": false,
          "reembolsoOriginalRecusado": false,
          "acessoAplicacaoPagamento": null
        },
        "idStylistVenda": "S-88",
        "quantidadeComprada": 1,
        "promocaoEscaloes": false,
        "encomendaEncontrada": null,
        "ajustePrecoAplicado": false,
        "compraOferta": false
      },
      "comprovativo": {
        "tipo": "FOTOGRAFIA_RECIBO",
        "confirmaCompra": true,
        "reciboOriginal": false,
        "clienteMantemRecibo": false,
        "incluiOutrosArtigos": false
      },
      "artigos": [
        {
          "id": "A-1",
          "produto": {
            "sku": "SHERPA-TRUCKER-L",
            "skuReconhecidoPOS": true,
            "marca": "LEVIS",
            "categoria": "VESTUARIO",
            "grossista": false,
            "vendidoNaLoja": true,
            "produtoFranquia": false,
            "pvpOriginal": "148.0",
            "precoAtual": "99.0",
            "emSaldo": false
          },
          "quantidade": 1,
          "precoPago": "119.0",
          "estado": {
            "condicaoUso": "NAO_USADO",
            "etiquetas": "COLOCADAS",
            "personalizado": false,
            "alterado": false,
            "embainhado": false,
            "defeitoFabricoConfirmado": false,
            "sujoOuInseguro": false,
            "danificado": false,
            "etiquetaPrecoCorreta": true,
            "rfidCorreto": true,
            "embalagemIntacta": true,
            "conjuntoCompleto": true
          },
          "entreCanais": false,
          "revendivel": null,
          "valorCalculadoPos": null
        }
      ],
      "artigosTroca": null,
      "portalOnlineDisponivel": null,
      "politicaPermiteAsCegasOnline": null,
      "pedidoExcecao": {
        "motivo": "Pede que a diferença seja reembolsada num cartão de oferta se não puder ir para o cartão original.",
        "resolucaoPedida": "AJUSTE_PRECO",
        "exigeMeioProibido": false,
        "exigeSkuIncorreto": false,
        "envolveProdutoExcluido": false,
        "contornaProcessoObrigatorio": false,
        "concluivelNoSistema": true,
        "aprovada": null,
        "aprovador": null,
        "preocupacaoCliente": null
      },
      "indicadoresFraude": null
    },
    "esperado": {
      "elegibilidade": "RECUSAR",
      "tipoVerificacao": "VERIFICADA",
      "tipoTransacao": "NENHUMA",
      "terminal": false,
      "regrasDisparadas": [
        "CT-003",
        "CH-001",
        "PC-001",
        "PT-001",
        "PT-008",
        "EX-002",
        "OUT-001"
      ],
      "regrasNaoDisparadas": [
        "PT-007",
        "PT-002",
        "PT-003",
        "CT-005",
        "CT-008",
        "OUT-007"
      ],
      "artigos": {
        "A-1": {
          "elegibilidade": "PERMITIR"
        }
      }
    }
  },
  {
    "id": 9,
    "titulo": "O conjunto de bodywear devolvido com um risco de segurança",
    "estado": "a validar",
    "aValidar": [
      "A-20"
    ],
    "pressupostos": [
      "Colaborador Key Holder (docs/06 não indica quem processa).",
      "Compra feita na mesma loja Outlet.",
      "A unidade experimentada e possivelmente manchada torna o conjunto usado e sujo (sujoOuInseguro)."
    ],
    "justificacao": [
      "Transversal: unidade manchada → PC-008 isolar com manuseamento mínimo.",
      "M3: bodywear → PC-007 aceite em qualquer estado (prevalece sobre PC-004/PC-005).",
      "M4/M5: recibo de 21 dias → PT-001, PT-003 reembolso total no meio original; M7: cartão de crédito → TN-001 tokenizado; valor 29.99 (conjunto incompleto: preço pago, A-20).",
      "M8: CT-001, CT-004, CT-005, CT-006, CT-007.",
      "M9: bodywear usado e sujo → BW-004 risco biológico (prevalece sobre BW-003).",
      "Resultado: PERMITIR reembolso de 29.99 no cartão de crédito; o conjunto é isolado por risco biológico."
    ],
    "pedido": {
      "id": "C09",
      "dataPedido": "2026-03-31",
      "tipoPedido": "DEVOLUCAO",
      "loja": {
        "codigo": "US-OUT-090",
        "nome": "Outlet EUA",
        "mercado": "EUA",
        "tipoLoja": "OUTLET",
        "lojaBackPocket": false,
        "coberturaLojaUnica": false,
        "skusSortido": null
      },
      "colaborador": {
        "id": "C-9",
        "nome": "Key Holder",
        "funcao": "KEY_HOLDER",
        "aprovadoPeloDM": false,
        "idCredencialPOS": "POS-C-9"
      },
      "cliente": {
        "id": null,
        "forneceDados": true,
        "barreiraLinguistica": false,
        "contestaResultado": false,
        "agitado": false
      },
      "compraOriginal": {
        "idTransacao": "T-0909",
        "canal": "OUTLET",
        "dataCompra": "2026-03-10",
        "dataEnvio": null,
        "pagamento": {
          "meio": "CREDITO",
          "valorPago": "29.99",
          "estadoConta": "ATIVA",
          "cartaoFisicoPresente": false,
          "reembolsoOriginalRecusado": false,
          "acessoAplicacaoPagamento": null
        },
        "idStylistVenda": "S-99",
        "quantidadeComprada": 1,
        "promocaoEscaloes": false,
        "encomendaEncontrada": null,
        "ajustePrecoAplicado": false,
        "compraOferta": false
      },
      "comprovativo": {
        "tipo": "RECIBO_IMPRESSO",
        "confirmaCompra": true,
        "reciboOriginal": true,
        "clienteMantemRecibo": false,
        "incluiOutrosArtigos": false
      },
      "artigos": [
        {
          "id": "A-1",
          "produto": {
            "sku": "BW-BOXER-3PK-M",
            "skuReconhecidoPOS": true,
            "marca": "LEVIS",
            "categoria": "BODYWEAR",
            "grossista": false,
            "vendidoNaLoja": true,
            "produtoFranquia": false,
            "pvpOriginal": "29.99",
            "precoAtual": "29.99",
            "emSaldo": false
          },
          "quantidade": 1,
          "precoPago": "29.99",
          "estado": {
            "condicaoUso": "USADO",
            "etiquetas": "AUSENTES",
            "personalizado": false,
            "alterado": false,
            "embainhado": false,
            "defeitoFabricoConfirmado": false,
            "sujoOuInseguro": true,
            "danificado": false,
            "etiquetaPrecoCorreta": true,
            "rfidCorreto": true,
            "embalagemIntacta": false,
            "conjuntoCompleto": false
          },
          "entreCanais": false,
          "revendivel": null,
          "valorCalculadoPos": null
        }
      ],
      "artigosTroca": null,
      "portalOnlineDisponivel": null,
      "politicaPermiteAsCegasOnline": null,
      "pedidoExcecao": null,
      "indicadoresFraude": null
    },
    "esperado": {
      "elegibilidade": "PERMITIR",
      "tipoVerificacao": "VERIFICADA",
      "tipoTransacao": "REEMBOLSO",
      "valorDevolucao": 29.99,
      "baseValor": "VALOR_PAGO",
      "meioReembolso": "MEIO_ORIGINAL",
      "aprovacao": "NENHUMA",
      "terminal": false,
      "documentacao": {
        "idStylistAtribuido": "S-99",
        "reciboAgrafado": true,
        "retencaoAte": "2026-06-29"
      },
      "regrasDisparadas": [
        "PC-008",
        "CT-003",
        "CH-001",
        "PC-007",
        "PT-001",
        "PT-003",
        "TN-001",
        "CT-001",
        "CT-004",
        "CT-005",
        "CT-006",
        "CT-007",
        "BW-004",
        "OUT-001"
      ],
      "regrasNaoDisparadas": [
        "PC-004",
        "PC-005",
        "BW-003",
        "BW-002",
        "CT-008"
      ],
      "artigos": {
        "A-1": {
          "elegibilidade": "PERMITIR",
          "valorDevolucao": 29.99,
          "destino": "RISCO_BIOLOGICO",
          "regrasDisparadas": [
            "PC-008",
            "PC-007",
            "BW-004"
          ]
        }
      }
    }
  },
  {
    "id": 10,
    "titulo": "A troca online tardia com PayPal durante uma falha do portal",
    "estado": "a validar",
    "aValidar": [
      "A-04",
      "A-05",
      "A-06",
      "A-22"
    ],
    "pressupostos": [
      "Colaborador Key Holder (docs/06 não indica quem processa).",
      "Data de compra igual à de envio (enviado há 37 dias).",
      "O pedido de pagamento dividido e de cartão de oferta para o remanescente, sem acesso ao PayPal, é registado como exceção que contorna o processo obrigatório do PayPal.",
      "O cliente não consegue aceder à aplicação PayPal na loja (acessoAplicacaoPagamento = false, A-05).",
      "As calças não estão no sortido da loja recetora."
    ],
    "justificacao": [
      "Online: encomenda encontrada, mas o portal está indisponível → CH-004 REVER (caso não coberto, A-04); CH-002 e CH-005 não se aplicam.",
      "M6: o REVER aciona EX-001; o cliente contesta (EX-002); o pagamento dividido e o cartão de oferta contornam o PayPal → EX-006 recusa a exceção.",
      "M7: PayPal sem acesso à aplicação → TN-008 só pelo fluxo da aplicação, sem substituir o meio (A-05).",
      "M8: sem transação definida, não há documentação de conclusão.",
      "M9: inspeção conforme; entre canais fora do sortido → EP-006 saldos a 20%, se a troca for aprovada.",
      "Resultado: REVER com o responsável sénior; reembolso só pela aplicação PayPal."
    ],
    "pedido": {
      "id": "C10",
      "dataPedido": "2026-03-31",
      "tipoPedido": "TROCA",
      "loja": {
        "codigo": "US-ML-100",
        "nome": "Mainline EUA",
        "mercado": "EUA",
        "tipoLoja": "MAINLINE",
        "lojaBackPocket": false,
        "coberturaLojaUnica": false,
        "skusSortido": null
      },
      "colaborador": {
        "id": "C-10",
        "nome": "Key Holder",
        "funcao": "KEY_HOLDER",
        "aprovadoPeloDM": false,
        "idCredencialPOS": "POS-C-10"
      },
      "cliente": {
        "id": null,
        "forneceDados": true,
        "barreiraLinguistica": false,
        "contestaResultado": true,
        "agitado": false
      },
      "compraOriginal": {
        "idTransacao": "LCOM-1010",
        "canal": "LEVI_COM",
        "dataCompra": "2026-02-22",
        "dataEnvio": "2026-02-22",
        "pagamento": {
          "meio": "PAYPAL",
          "valorPago": "69.5",
          "estadoConta": null,
          "cartaoFisicoPresente": false,
          "reembolsoOriginalRecusado": false,
          "acessoAplicacaoPagamento": false
        },
        "idStylistVenda": null,
        "quantidadeComprada": 1,
        "promocaoEscaloes": false,
        "encomendaEncontrada": true,
        "ajustePrecoAplicado": false,
        "compraOferta": false
      },
      "comprovativo": {
        "tipo": "CONFIRMACAO_ENCOMENDA",
        "confirmaCompra": true,
        "reciboOriginal": false,
        "clienteMantemRecibo": false,
        "incluiOutrosArtigos": false
      },
      "artigos": [
        {
          "id": "A-1",
          "produto": {
            "sku": "550-RELAX-34",
            "skuReconhecidoPOS": true,
            "marca": "LEVIS",
            "categoria": "VESTUARIO",
            "grossista": false,
            "vendidoNaLoja": true,
            "produtoFranquia": false,
            "pvpOriginal": "69.5",
            "precoAtual": "69.5",
            "emSaldo": false
          },
          "quantidade": 1,
          "precoPago": "69.5",
          "estado": {
            "condicaoUso": "NAO_USADO",
            "etiquetas": "COLOCADAS",
            "personalizado": false,
            "alterado": false,
            "embainhado": false,
            "defeitoFabricoConfirmado": false,
            "sujoOuInseguro": false,
            "danificado": false,
            "etiquetaPrecoCorreta": true,
            "rfidCorreto": true,
            "embalagemIntacta": true,
            "conjuntoCompleto": true
          },
          "entreCanais": true,
          "revendivel": null,
          "valorCalculadoPos": null
        }
      ],
      "artigosTroca": [
        {
          "produto": {
            "sku": "501-PREM-34",
            "skuReconhecidoPOS": true,
            "marca": "LEVIS",
            "categoria": "VESTUARIO",
            "grossista": false,
            "vendidoNaLoja": true,
            "produtoFranquia": false,
            "pvpOriginal": "128.0",
            "precoAtual": "128.0",
            "emSaldo": false
          },
          "apenasMudaTamanho": false,
          "precoVenda": "128.0"
        }
      ],
      "portalOnlineDisponivel": false,
      "politicaPermiteAsCegasOnline": null,
      "pedidoExcecao": {
        "motivo": "Paga a diferença com cartão de crédito e pede o remanescente num cartão de oferta; não acede ao PayPal na loja.",
        "resolucaoPedida": "TROCA",
        "exigeMeioProibido": false,
        "exigeSkuIncorreto": false,
        "envolveProdutoExcluido": false,
        "contornaProcessoObrigatorio": true,
        "concluivelNoSistema": true,
        "aprovada": null,
        "aprovador": null,
        "preocupacaoCliente": null
      },
      "indicadoresFraude": null
    },
    "esperado": {
      "elegibilidade": "REVER",
      "tipoVerificacao": "VERIFICADA",
      "meioReembolso": "APLICACAO_PAGAMENTO",
      "aprovacao": "RESPONSAVEL_SENIOR",
      "processo": "PAYPAL_VENMO",
      "terminal": false,
      "excecaoRecusada": true,
      "regrasDisparadas": [
        "CT-003",
        "PC-001",
        "CH-004",
        "EX-001",
        "EX-002",
        "EX-006",
        "TN-008",
        "CT-008",
        "EP-006",
        "OUT-001"
      ],
      "regrasNaoDisparadas": [
        "CH-001",
        "IN-003",
        "PT-001",
        "PT-003",
        "CH-002",
        "CH-005",
        "CH-006",
        "EX-003",
        "EX-005",
        "CT-005",
        "CT-007",
        "EP-002"
      ],
      "artigos": {
        "A-1": {
          "elegibilidade": "PERMITIR",
          "destino": "SALDOS",
          "descontoSaldo": 20,
          "regrasDisparadas": [
            "PC-001",
            "CT-008",
            "EP-006"
          ]
        }
      }
    }
  }
];

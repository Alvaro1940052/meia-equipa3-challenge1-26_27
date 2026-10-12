package com.levis.devolucoes.service.integracao.porta;

/** POS da loja (XStore): reconhecimento do SKU (HS-001). */
public interface PosGateway {

  /** O POS reconhece o SKU. O POS dá sempre uma resposta: um SKU desconhecido não é reconhecido. */
  boolean skuReconhecido(String sku);
}

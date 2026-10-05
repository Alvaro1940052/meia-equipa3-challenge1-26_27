package com.levis.devolucoes.explicacao.esenao;

/**
 * Diferença num campo de saída entre a avaliação original e a simulada.
 *
 * @param alvo "pedido" ou o ID do artigo
 * @param campo nome do campo
 * @param original valor na avaliação original
 * @param simulado valor na avaliação simulada
 */
public record DiferencaSaida(String alvo, String campo, Object original, Object simulado) {}

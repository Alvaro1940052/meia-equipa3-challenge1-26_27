package com.levis.devolucoes.explicacao.rastreio;

/**
 * Alteração de um campo de saída por uma regra.
 *
 * @param alvo {@link InstantaneoDecisao#PEDIDO} ou o ID do artigo
 * @param campo nome do campo (ex.: {@code elegibilidade}, {@code documentacao.retencaoAte})
 * @param antes valor antes do disparo
 * @param depois valor depois do disparo
 */
public record AlteracaoCampo(String alvo, String campo, Object antes, Object depois) {}

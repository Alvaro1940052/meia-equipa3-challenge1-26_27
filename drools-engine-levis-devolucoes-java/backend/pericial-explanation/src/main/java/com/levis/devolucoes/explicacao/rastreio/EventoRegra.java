package com.levis.devolucoes.explicacao.rastreio;

import com.levis.devolucoes.model.enums.Elegibilidade;
import java.util.List;

/**
 * Um evento da agenda durante a avaliação.
 *
 * @param sequencia ordem do evento na avaliação (começa em 1)
 * @param tipo criada, disparada ou cancelada
 * @param codigoRegra ID da regra (metadado {@code @id})
 * @param nomeRegra nome completo da regra no DRL (distingue variantes do mesmo ID)
 * @param modulo metadado {@code @modulo}
 * @param artigoId artigo a que a ativação se refere, ou nulo se for do pedido
 * @param resultado resultado registado pela regra, se disparou e registou um
 * @param mensagem mensagem registada pela regra, se disparou
 * @param causaCancelamento causa do cancelamento (só para {@link TipoEvento#CANCELADA})
 * @param alteracoes campos de saída alterados pelo disparo
 */
public record EventoRegra(
    int sequencia,
    TipoEvento tipo,
    String codigoRegra,
    String nomeRegra,
    String modulo,
    String artigoId,
    Elegibilidade resultado,
    String mensagem,
    String causaCancelamento,
    List<AlteracaoCampo> alteracoes) {

  public boolean disparou() {
    return tipo == TipoEvento.DISPARADA;
  }

  /** Indica se o evento se refere ao artigo indicado; um artigo nulo aceita qualquer evento. */
  public boolean doArtigo(String artigo) {
    return artigo == null || artigo.equals(artigoId);
  }
}

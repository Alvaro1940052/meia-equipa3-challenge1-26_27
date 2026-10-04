package com.levis.devolucoes.model.decisao;

import com.levis.devolucoes.model.enums.BaseValor;
import com.levis.devolucoes.model.enums.DestinoProduto;
import com.levis.devolucoes.model.enums.NivelAprovacao;
import com.levis.devolucoes.model.enums.TipoTransacao;
import java.math.BigDecimal;

/**
 * Resultado de um artigo devolvido (ADR 0002). As regras de produto, estado e destino atuam sobre
 * este facto, para que uma paragem num artigo não termine os restantes.
 */
public class DecisaoArtigo extends DecisaoBase {

  private String pedidoId;
  private String artigoId;
  private TipoTransacao tipoTransacao;
  private BigDecimal valorDevolucao;
  private BaseValor baseValor;
  private DestinoProduto destino;
  private NivelAprovacao aprovacao = NivelAprovacao.NENHUMA;

  public DecisaoArtigo() {}

  public DecisaoArtigo(String pedidoId, String artigoId) {
    this.pedidoId = pedidoId;
    this.artigoId = artigoId;
  }

  public String getPedidoId() {
    return pedidoId;
  }

  public void setPedidoId(String pedidoId) {
    this.pedidoId = pedidoId;
  }

  public String getArtigoId() {
    return artigoId;
  }

  public void setArtigoId(String artigoId) {
    this.artigoId = artigoId;
  }

  public TipoTransacao getTipoTransacao() {
    return tipoTransacao;
  }

  public void setTipoTransacao(TipoTransacao tipoTransacao) {
    this.tipoTransacao = tipoTransacao;
  }

  public BigDecimal getValorDevolucao() {
    return valorDevolucao;
  }

  public void setValorDevolucao(BigDecimal valorDevolucao) {
    this.valorDevolucao = valorDevolucao;
  }

  public BaseValor getBaseValor() {
    return baseValor;
  }

  public void setBaseValor(BaseValor baseValor) {
    this.baseValor = baseValor;
  }

  public DestinoProduto getDestino() {
    return destino;
  }

  public void setDestino(DestinoProduto destino) {
    this.destino = destino;
  }

  public NivelAprovacao getAprovacao() {
    return aprovacao;
  }

  public void setAprovacao(NivelAprovacao aprovacao) {
    this.aprovacao = aprovacao;
  }
}

package com.levis.devolucoes.model.decisao;

import com.levis.devolucoes.model.enums.NivelRisco;

/** Facto inserido quando há indícios de fraude; dispara a interrupção transversal EX-008. */
public class IndicadorFraude {

  private String pedidoId;
  private String descricao;
  private NivelRisco nivelRisco;
  private boolean comunicadoGSS;

  public IndicadorFraude() {}

  public IndicadorFraude(String pedidoId, String descricao, NivelRisco nivelRisco) {
    this.pedidoId = pedidoId;
    this.descricao = descricao;
    this.nivelRisco = nivelRisco;
  }

  public String getPedidoId() {
    return pedidoId;
  }

  public void setPedidoId(String pedidoId) {
    this.pedidoId = pedidoId;
  }

  public String getDescricao() {
    return descricao;
  }

  public void setDescricao(String descricao) {
    this.descricao = descricao;
  }

  public NivelRisco getNivelRisco() {
    return nivelRisco;
  }

  public void setNivelRisco(NivelRisco nivelRisco) {
    this.nivelRisco = nivelRisco;
  }

  public boolean isComunicadoGSS() {
    return comunicadoGSS;
  }

  public void setComunicadoGSS(boolean comunicadoGSS) {
    this.comunicadoGSS = comunicadoGSS;
  }
}

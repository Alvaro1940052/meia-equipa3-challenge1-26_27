package com.levis.devolucoes.model.pedido;

import com.levis.devolucoes.model.enums.TipoTransacao;

/** Pedido de exceção à política e a sua avaliação (EX-001 a EX-007, HS-005). */
public class PedidoExcecao {

  private String motivo;
  private TipoTransacao resolucaoPedida;
  private boolean exigeMeioProibido;
  private boolean exigeSkuIncorreto;
  private boolean envolveProdutoExcluido;
  private boolean contornaProcessoObrigatorio;

  /** EX-004: o resultado pode ser concluído no sistema (ADR 0003, A-18). */
  private boolean concluivelNoSistema = true;

  /** Decisão sobre a exceção; nulo significa pendente. */
  private Boolean aprovada;

  private Colaborador aprovador;
  private String preocupacaoCliente;

  public String getMotivo() {
    return motivo;
  }

  public void setMotivo(String motivo) {
    this.motivo = motivo;
  }

  public TipoTransacao getResolucaoPedida() {
    return resolucaoPedida;
  }

  public void setResolucaoPedida(TipoTransacao resolucaoPedida) {
    this.resolucaoPedida = resolucaoPedida;
  }

  public boolean isExigeMeioProibido() {
    return exigeMeioProibido;
  }

  public void setExigeMeioProibido(boolean exigeMeioProibido) {
    this.exigeMeioProibido = exigeMeioProibido;
  }

  public boolean isExigeSkuIncorreto() {
    return exigeSkuIncorreto;
  }

  public void setExigeSkuIncorreto(boolean exigeSkuIncorreto) {
    this.exigeSkuIncorreto = exigeSkuIncorreto;
  }

  public boolean isEnvolveProdutoExcluido() {
    return envolveProdutoExcluido;
  }

  public void setEnvolveProdutoExcluido(boolean envolveProdutoExcluido) {
    this.envolveProdutoExcluido = envolveProdutoExcluido;
  }

  public boolean isContornaProcessoObrigatorio() {
    return contornaProcessoObrigatorio;
  }

  public void setContornaProcessoObrigatorio(boolean contornaProcessoObrigatorio) {
    this.contornaProcessoObrigatorio = contornaProcessoObrigatorio;
  }

  public boolean isConcluivelNoSistema() {
    return concluivelNoSistema;
  }

  public void setConcluivelNoSistema(boolean concluivelNoSistema) {
    this.concluivelNoSistema = concluivelNoSistema;
  }

  public Boolean getAprovada() {
    return aprovada;
  }

  public void setAprovada(Boolean aprovada) {
    this.aprovada = aprovada;
  }

  public Colaborador getAprovador() {
    return aprovador;
  }

  public void setAprovador(Colaborador aprovador) {
    this.aprovador = aprovador;
  }

  public String getPreocupacaoCliente() {
    return preocupacaoCliente;
  }

  public void setPreocupacaoCliente(String preocupacaoCliente) {
    this.preocupacaoCliente = preocupacaoCliente;
  }
}

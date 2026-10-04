package com.levis.devolucoes.model.decisao;

import java.time.LocalDate;

/** Controlos documentais da transação (OUT-008). */
public class Documentacao {

  private String assinaturaCliente;
  private String assinaturaProcessador;
  private String assinaturaTestemunha;
  private String idStylistAtribuido;
  private boolean reciboAgrafado;
  private String notaRecibo;
  private LocalDate retencaoAte;
  private String registoExcecao;

  public String getAssinaturaCliente() {
    return assinaturaCliente;
  }

  public void setAssinaturaCliente(String assinaturaCliente) {
    this.assinaturaCliente = assinaturaCliente;
  }

  public String getAssinaturaProcessador() {
    return assinaturaProcessador;
  }

  public void setAssinaturaProcessador(String assinaturaProcessador) {
    this.assinaturaProcessador = assinaturaProcessador;
  }

  public String getAssinaturaTestemunha() {
    return assinaturaTestemunha;
  }

  public void setAssinaturaTestemunha(String assinaturaTestemunha) {
    this.assinaturaTestemunha = assinaturaTestemunha;
  }

  public String getIdStylistAtribuido() {
    return idStylistAtribuido;
  }

  public void setIdStylistAtribuido(String idStylistAtribuido) {
    this.idStylistAtribuido = idStylistAtribuido;
  }

  public boolean isReciboAgrafado() {
    return reciboAgrafado;
  }

  public void setReciboAgrafado(boolean reciboAgrafado) {
    this.reciboAgrafado = reciboAgrafado;
  }

  public String getNotaRecibo() {
    return notaRecibo;
  }

  public void setNotaRecibo(String notaRecibo) {
    this.notaRecibo = notaRecibo;
  }

  public LocalDate getRetencaoAte() {
    return retencaoAte;
  }

  public void setRetencaoAte(LocalDate retencaoAte) {
    this.retencaoAte = retencaoAte;
  }

  public String getRegistoExcecao() {
    return registoExcecao;
  }

  public void setRegistoExcecao(String registoExcecao) {
    this.registoExcecao = registoExcecao;
  }
}

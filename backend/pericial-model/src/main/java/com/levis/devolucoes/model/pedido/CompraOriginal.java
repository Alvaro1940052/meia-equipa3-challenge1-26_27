package com.levis.devolucoes.model.pedido;

import com.levis.devolucoes.model.enums.CanalCompra;
import java.time.LocalDate;

/** Transação original a que pertencem os artigos devolvidos. */
public class CompraOriginal {

  private String idTransacao;
  private CanalCompra canal;
  private LocalDate dataCompra;
  private LocalDate dataEnvio;
  private Pagamento pagamento;
  private String idStylistVenda;
  private int quantidadeComprada;
  private boolean promocaoEscaloes;
  private boolean encomendaEncontrada;
  private boolean ajustePrecoAplicado;
  private boolean compraOferta;

  public String getIdTransacao() {
    return idTransacao;
  }

  public void setIdTransacao(String idTransacao) {
    this.idTransacao = idTransacao;
  }

  public CanalCompra getCanal() {
    return canal;
  }

  public void setCanal(CanalCompra canal) {
    this.canal = canal;
  }

  public LocalDate getDataCompra() {
    return dataCompra;
  }

  public void setDataCompra(LocalDate dataCompra) {
    this.dataCompra = dataCompra;
  }

  public LocalDate getDataEnvio() {
    return dataEnvio;
  }

  public void setDataEnvio(LocalDate dataEnvio) {
    this.dataEnvio = dataEnvio;
  }

  public Pagamento getPagamento() {
    return pagamento;
  }

  public void setPagamento(Pagamento pagamento) {
    this.pagamento = pagamento;
  }

  public String getIdStylistVenda() {
    return idStylistVenda;
  }

  public void setIdStylistVenda(String idStylistVenda) {
    this.idStylistVenda = idStylistVenda;
  }

  public int getQuantidadeComprada() {
    return quantidadeComprada;
  }

  public void setQuantidadeComprada(int quantidadeComprada) {
    this.quantidadeComprada = quantidadeComprada;
  }

  public boolean isPromocaoEscaloes() {
    return promocaoEscaloes;
  }

  public void setPromocaoEscaloes(boolean promocaoEscaloes) {
    this.promocaoEscaloes = promocaoEscaloes;
  }

  public boolean isEncomendaEncontrada() {
    return encomendaEncontrada;
  }

  public void setEncomendaEncontrada(boolean encomendaEncontrada) {
    this.encomendaEncontrada = encomendaEncontrada;
  }

  public boolean isAjustePrecoAplicado() {
    return ajustePrecoAplicado;
  }

  public void setAjustePrecoAplicado(boolean ajustePrecoAplicado) {
    this.ajustePrecoAplicado = ajustePrecoAplicado;
  }

  public boolean isCompraOferta() {
    return compraOferta;
  }

  public void setCompraOferta(boolean compraOferta) {
    this.compraOferta = compraOferta;
  }
}

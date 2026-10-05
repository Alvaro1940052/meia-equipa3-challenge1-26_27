package com.levis.devolucoes.persistencia.entidade;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Registo auditável de uma exceção aprovada (EX-007): motivo, aprovador, valor, resultado,
 * preocupação do cliente e destino do produto.
 */
@Entity
@Table(name = "excecao_aprovada")
public class ExcecaoAprovadaEntity {

  @Id private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "avaliacao_id")
  private AvaliacaoEntity avaliacao;

  @Column(name = "registada_em", nullable = false)
  private LocalDateTime registadaEm;

  @Column(columnDefinition = "text")
  private String motivo;

  private String aprovador;

  private BigDecimal valor;

  private String resultado;

  @Column(name = "preocupacao_cliente", columnDefinition = "text")
  private String preocupacaoCliente;

  @Column(name = "destino_produto")
  private String destinoProduto;

  /** Texto completo registado pela regra EX-007. */
  @Column(nullable = false, columnDefinition = "text")
  private String registo;

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public AvaliacaoEntity getAvaliacao() {
    return avaliacao;
  }

  void setAvaliacao(AvaliacaoEntity avaliacao) {
    this.avaliacao = avaliacao;
  }

  public LocalDateTime getRegistadaEm() {
    return registadaEm;
  }

  public void setRegistadaEm(LocalDateTime registadaEm) {
    this.registadaEm = registadaEm;
  }

  public String getMotivo() {
    return motivo;
  }

  public void setMotivo(String motivo) {
    this.motivo = motivo;
  }

  public String getAprovador() {
    return aprovador;
  }

  public void setAprovador(String aprovador) {
    this.aprovador = aprovador;
  }

  public BigDecimal getValor() {
    return valor;
  }

  public void setValor(BigDecimal valor) {
    this.valor = valor;
  }

  public String getResultado() {
    return resultado;
  }

  public void setResultado(String resultado) {
    this.resultado = resultado;
  }

  public String getPreocupacaoCliente() {
    return preocupacaoCliente;
  }

  public void setPreocupacaoCliente(String preocupacaoCliente) {
    this.preocupacaoCliente = preocupacaoCliente;
  }

  public String getDestinoProduto() {
    return destinoProduto;
  }

  public void setDestinoProduto(String destinoProduto) {
    this.destinoProduto = destinoProduto;
  }

  public String getRegisto() {
    return registo;
  }

  public void setRegisto(String registo) {
    this.registo = registo;
  }
}

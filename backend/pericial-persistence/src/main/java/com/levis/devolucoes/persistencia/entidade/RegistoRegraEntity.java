package com.levis.devolucoes.persistencia.entidade;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/** Uma regra disparada numa avaliação: o rasto de auditoria, pela ordem de disparo. */
@Entity
@Table(name = "registo_regra")
public class RegistoRegraEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "avaliacao_id")
  private AvaliacaoEntity avaliacao;

  @Column(nullable = false)
  private int ordem;

  @Column(name = "codigo_regra", nullable = false)
  private String codigoRegra;

  @Column(name = "nome_regra", nullable = false)
  private String nomeRegra;

  private String modulo;

  @Column(name = "artigo_id")
  private String artigoId;

  private String resultado;

  @Column(columnDefinition = "text")
  private String mensagem;

  @Column(nullable = false)
  private LocalDateTime instante;

  public RegistoRegraEntity() {}

  public RegistoRegraEntity(
      int ordem,
      String codigoRegra,
      String nomeRegra,
      String modulo,
      String artigoId,
      String resultado,
      String mensagem,
      LocalDateTime instante) {
    this.ordem = ordem;
    this.codigoRegra = codigoRegra;
    this.nomeRegra = nomeRegra;
    this.modulo = modulo;
    this.artigoId = artigoId;
    this.resultado = resultado;
    this.mensagem = mensagem;
    this.instante = instante;
  }

  public Long getId() {
    return id;
  }

  public AvaliacaoEntity getAvaliacao() {
    return avaliacao;
  }

  void setAvaliacao(AvaliacaoEntity avaliacao) {
    this.avaliacao = avaliacao;
  }

  public int getOrdem() {
    return ordem;
  }

  public String getCodigoRegra() {
    return codigoRegra;
  }

  public String getNomeRegra() {
    return nomeRegra;
  }

  public String getModulo() {
    return modulo;
  }

  public String getArtigoId() {
    return artigoId;
  }

  public String getResultado() {
    return resultado;
  }

  public String getMensagem() {
    return mensagem;
  }

  public LocalDateTime getInstante() {
    return instante;
  }
}

package com.levis.devolucoes.model.produto;

import com.levis.devolucoes.model.enums.DestinoProduto;
import java.math.BigDecimal;

/** Uma linha do pedido: um produto devolvido e o seu estado (IN-007, IN-008, IN-010). */
public class ArtigoDevolvido {

  private String id;
  private Produto produto;
  private int quantidade = 1;
  private BigDecimal precoPago;
  private EstadoProduto estado;
  private boolean entreCanais;

  /** IN-010: verificável, reetiquetável e revendível; nulo até à inspeção. */
  private Boolean revendivel;

  /** CH-010, EP-004: valor calculado pelo POS, quando disponível (ADR 0003, A-21). */
  private BigDecimal valorCalculadoPos;

  private DestinoProduto destino;
  private int descontoSaldo;

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public Produto getProduto() {
    return produto;
  }

  public void setProduto(Produto produto) {
    this.produto = produto;
  }

  public int getQuantidade() {
    return quantidade;
  }

  public void setQuantidade(int quantidade) {
    this.quantidade = quantidade;
  }

  public BigDecimal getPrecoPago() {
    return precoPago;
  }

  public void setPrecoPago(BigDecimal precoPago) {
    this.precoPago = precoPago;
  }

  public EstadoProduto getEstado() {
    return estado;
  }

  public void setEstado(EstadoProduto estado) {
    this.estado = estado;
  }

  public boolean isEntreCanais() {
    return entreCanais;
  }

  public void setEntreCanais(boolean entreCanais) {
    this.entreCanais = entreCanais;
  }

  public Boolean getRevendivel() {
    return revendivel;
  }

  public void setRevendivel(Boolean revendivel) {
    this.revendivel = revendivel;
  }

  public BigDecimal getValorCalculadoPos() {
    return valorCalculadoPos;
  }

  public void setValorCalculadoPos(BigDecimal valorCalculadoPos) {
    this.valorCalculadoPos = valorCalculadoPos;
  }

  public DestinoProduto getDestino() {
    return destino;
  }

  public void setDestino(DestinoProduto destino) {
    this.destino = destino;
  }

  public int getDescontoSaldo() {
    return descontoSaldo;
  }

  public void setDescontoSaldo(int descontoSaldo) {
    this.descontoSaldo = descontoSaldo;
  }
}

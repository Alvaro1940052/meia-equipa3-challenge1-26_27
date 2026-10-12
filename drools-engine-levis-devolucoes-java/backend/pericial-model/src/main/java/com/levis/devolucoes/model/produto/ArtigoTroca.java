package com.levis.devolucoes.model.produto;

import java.math.BigDecimal;

/** Artigo que o cliente leva numa troca (EP-001, EP-002, TN-006). */
public class ArtigoTroca {

  private Produto produto;
  private boolean apenasMudaTamanho;
  private BigDecimal precoVenda;

  public Produto getProduto() {
    return produto;
  }

  public void setProduto(Produto produto) {
    this.produto = produto;
  }

  public boolean isApenasMudaTamanho() {
    return apenasMudaTamanho;
  }

  public void setApenasMudaTamanho(boolean apenasMudaTamanho) {
    this.apenasMudaTamanho = apenasMudaTamanho;
  }

  public BigDecimal getPrecoVenda() {
    return precoVenda;
  }

  public void setPrecoVenda(BigDecimal precoVenda) {
    this.precoVenda = precoVenda;
  }
}

package com.levis.devolucoes.model.pedido;

import com.levis.devolucoes.model.enums.Mercado;
import com.levis.devolucoes.model.enums.TipoLoja;
import java.util.HashSet;
import java.util.Set;

/** Loja recetora onde o pedido é processado e o seu contexto operacional. */
public class Loja {

  private String codigo;
  private String nome;
  private Mercado mercado;
  private TipoLoja tipoLoja;
  private boolean lojaBackPocket;
  private boolean coberturaLojaUnica;
  private Set<String> skusSortido = new HashSet<>();

  /** Indica se o SKU está ou esteve no sortido desta loja (EP-005, EP-006). */
  public boolean estaNoSortido(String sku) {
    return sku != null && skusSortido != null && skusSortido.contains(sku);
  }

  public String getCodigo() {
    return codigo;
  }

  public void setCodigo(String codigo) {
    this.codigo = codigo;
  }

  public String getNome() {
    return nome;
  }

  public void setNome(String nome) {
    this.nome = nome;
  }

  public Mercado getMercado() {
    return mercado;
  }

  public void setMercado(Mercado mercado) {
    this.mercado = mercado;
  }

  public TipoLoja getTipoLoja() {
    return tipoLoja;
  }

  public void setTipoLoja(TipoLoja tipoLoja) {
    this.tipoLoja = tipoLoja;
  }

  public boolean isLojaBackPocket() {
    return lojaBackPocket;
  }

  public void setLojaBackPocket(boolean lojaBackPocket) {
    this.lojaBackPocket = lojaBackPocket;
  }

  public boolean isCoberturaLojaUnica() {
    return coberturaLojaUnica;
  }

  public void setCoberturaLojaUnica(boolean coberturaLojaUnica) {
    this.coberturaLojaUnica = coberturaLojaUnica;
  }

  public Set<String> getSkusSortido() {
    return skusSortido;
  }

  public void setSkusSortido(Set<String> skusSortido) {
    this.skusSortido = skusSortido;
  }
}

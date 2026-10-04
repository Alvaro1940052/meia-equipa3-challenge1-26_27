package com.levis.devolucoes.model.pedido;

/** Cliente que apresenta o pedido e o seu comportamento (PT-006, EX-002, EX-003). */
public class Cliente {

  private String id;
  private boolean forneceDados = true;
  private boolean barreiraLinguistica;
  private boolean contestaResultado;
  private boolean agitado;

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public boolean isForneceDados() {
    return forneceDados;
  }

  public void setForneceDados(boolean forneceDados) {
    this.forneceDados = forneceDados;
  }

  public boolean isBarreiraLinguistica() {
    return barreiraLinguistica;
  }

  public void setBarreiraLinguistica(boolean barreiraLinguistica) {
    this.barreiraLinguistica = barreiraLinguistica;
  }

  public boolean isContestaResultado() {
    return contestaResultado;
  }

  public void setContestaResultado(boolean contestaResultado) {
    this.contestaResultado = contestaResultado;
  }

  public boolean isAgitado() {
    return agitado;
  }

  public void setAgitado(boolean agitado) {
    this.agitado = agitado;
  }
}

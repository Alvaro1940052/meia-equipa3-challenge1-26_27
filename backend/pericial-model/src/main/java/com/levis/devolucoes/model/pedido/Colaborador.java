package com.levis.devolucoes.model.pedido;

import com.levis.devolucoes.model.enums.Funcao;

/** Pessoa que inicia e conclui a transação no POS. */
public class Colaborador {

  private String id;
  private String nome;
  private Funcao funcao;
  private boolean aprovadoPeloDM;
  private String idCredencialPOS;

  /**
   * HS-006: Gestão da Loja, Key Holder, ou Lead Cashier ou Elevated Stylist aprovado pelo District
   * Manager. O XStore Manager é considerado autorizado (ADR 0003, A-23, a validar).
   */
  public boolean isAutorizado() {
    if (funcao == null) {
      return false;
    }
    return switch (funcao) {
      case GESTAO_LOJA, KEY_HOLDER, XSTORE_MANAGER -> true;
      case LEAD_CASHIER, ELEVATED_STYLIST -> aprovadoPeloDM;
      case STYLIST -> false;
    };
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getNome() {
    return nome;
  }

  public void setNome(String nome) {
    this.nome = nome;
  }

  public Funcao getFuncao() {
    return funcao;
  }

  public void setFuncao(Funcao funcao) {
    this.funcao = funcao;
  }

  public boolean isAprovadoPeloDM() {
    return aprovadoPeloDM;
  }

  public void setAprovadoPeloDM(boolean aprovadoPeloDM) {
    this.aprovadoPeloDM = aprovadoPeloDM;
  }

  public String getIdCredencialPOS() {
    return idCredencialPOS;
  }

  public void setIdCredencialPOS(String idCredencialPOS) {
    this.idCredencialPOS = idCredencialPOS;
  }
}

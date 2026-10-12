package com.levis.devolucoes.model.decisao;

import com.levis.devolucoes.model.enums.Elegibilidade;
import com.levis.devolucoes.model.enums.Modulo;
import java.time.LocalDateTime;

/** Uma entrada do rasto de auditoria: que regra disparou, onde e com que resultado. */
public class RegistoRegra {

  private String codigoRegra;
  private Modulo modulo;

  /** Resultado produzido; nulo quando a regra só regista uma ação ou documentação. */
  private Elegibilidade resultado;

  private String mensagem;
  private LocalDateTime instante;

  public RegistoRegra() {}

  public RegistoRegra(
      String codigoRegra,
      Modulo modulo,
      Elegibilidade resultado,
      String mensagem,
      LocalDateTime instante) {
    this.codigoRegra = codigoRegra;
    this.modulo = modulo;
    this.resultado = resultado;
    this.mensagem = mensagem;
    this.instante = instante;
  }

  public String getCodigoRegra() {
    return codigoRegra;
  }

  public void setCodigoRegra(String codigoRegra) {
    this.codigoRegra = codigoRegra;
  }

  public Modulo getModulo() {
    return modulo;
  }

  public void setModulo(Modulo modulo) {
    this.modulo = modulo;
  }

  public Elegibilidade getResultado() {
    return resultado;
  }

  public void setResultado(Elegibilidade resultado) {
    this.resultado = resultado;
  }

  public String getMensagem() {
    return mensagem;
  }

  public void setMensagem(String mensagem) {
    this.mensagem = mensagem;
  }

  public LocalDateTime getInstante() {
    return instante;
  }

  public void setInstante(LocalDateTime instante) {
    this.instante = instante;
  }

  @Override
  public String toString() {
    return codigoRegra + " [" + modulo + "] " + resultado + ": " + mensagem;
  }
}

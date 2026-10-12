package com.levis.devolucoes.model.pedido;

import com.levis.devolucoes.model.enums.TipoComprovativo;

/** Prova de compra apresentada pelo cliente (IN-004). */
public class Comprovativo {

  private TipoComprovativo tipo;
  private boolean confirmaCompra;
  private boolean reciboOriginal;
  private boolean clienteMantemRecibo;
  private boolean incluiOutrosArtigos;

  /**
   * PT-001: todos os tipos de {@link TipoComprovativo} são comprovativos válidos. Que o
   * comprovativo confirme a compra é verificado à parte, em {@link #isConfirmaCompra()}.
   */
  public boolean isValido() {
    return tipo != null;
  }

  public TipoComprovativo getTipo() {
    return tipo;
  }

  public void setTipo(TipoComprovativo tipo) {
    this.tipo = tipo;
  }

  public boolean isConfirmaCompra() {
    return confirmaCompra;
  }

  public void setConfirmaCompra(boolean confirmaCompra) {
    this.confirmaCompra = confirmaCompra;
  }

  public boolean isReciboOriginal() {
    return reciboOriginal;
  }

  public void setReciboOriginal(boolean reciboOriginal) {
    this.reciboOriginal = reciboOriginal;
  }

  public boolean isClienteMantemRecibo() {
    return clienteMantemRecibo;
  }

  public void setClienteMantemRecibo(boolean clienteMantemRecibo) {
    this.clienteMantemRecibo = clienteMantemRecibo;
  }

  public boolean isIncluiOutrosArtigos() {
    return incluiOutrosArtigos;
  }

  public void setIncluiOutrosArtigos(boolean incluiOutrosArtigos) {
    this.incluiOutrosArtigos = incluiOutrosArtigos;
  }
}

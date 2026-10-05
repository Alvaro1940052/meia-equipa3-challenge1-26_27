package com.levis.devolucoes.model.pedido;

import com.levis.devolucoes.model.enums.EstadoConta;
import com.levis.devolucoes.model.enums.MeioPagamento;
import java.math.BigDecimal;

/** Meio de pagamento usado na compra original (IN-009). */
public class Pagamento {

  private MeioPagamento meio;
  private BigDecimal valorPago;
  private EstadoConta estadoConta;
  private boolean cartaoFisicoPresente;
  private boolean reembolsoOriginalRecusado;

  /** TN-008: o cliente consegue aceder à aplicação PayPal ou Venmo na loja (ADR 0003, A-05). */
  private boolean acessoAplicacaoPagamento = true;

  public boolean isAcessoAplicacaoPagamento() {
    return acessoAplicacaoPagamento;
  }

  public void setAcessoAplicacaoPagamento(boolean acessoAplicacaoPagamento) {
    this.acessoAplicacaoPagamento = acessoAplicacaoPagamento;
  }

  public MeioPagamento getMeio() {
    return meio;
  }

  public void setMeio(MeioPagamento meio) {
    this.meio = meio;
  }

  public BigDecimal getValorPago() {
    return valorPago;
  }

  public void setValorPago(BigDecimal valorPago) {
    this.valorPago = valorPago;
  }

  public EstadoConta getEstadoConta() {
    return estadoConta;
  }

  public void setEstadoConta(EstadoConta estadoConta) {
    this.estadoConta = estadoConta;
  }

  public boolean isCartaoFisicoPresente() {
    return cartaoFisicoPresente;
  }

  public void setCartaoFisicoPresente(boolean cartaoFisicoPresente) {
    this.cartaoFisicoPresente = cartaoFisicoPresente;
  }

  public boolean isReembolsoOriginalRecusado() {
    return reembolsoOriginalRecusado;
  }

  public void setReembolsoOriginalRecusado(boolean reembolsoOriginalRecusado) {
    this.reembolsoOriginalRecusado = reembolsoOriginalRecusado;
  }
}

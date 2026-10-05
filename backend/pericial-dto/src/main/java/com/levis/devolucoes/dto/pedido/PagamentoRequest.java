package com.levis.devolucoes.dto.pedido;

import com.levis.devolucoes.dto.enums.EstadoConta;
import com.levis.devolucoes.dto.enums.MeioPagamento;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

/**
 * Meio de pagamento original (IN-009).
 *
 * @param estadoConta estado da conta do cartão; consultado no sistema de pagamentos se vazio
 * @param acessoAplicacaoPagamento o cliente acede à aplicação PayPal/Venmo; vazio conta como sim
 */
public record PagamentoRequest(
    MeioPagamento meio,
    @PositiveOrZero BigDecimal valorPago,
    EstadoConta estadoConta,
    boolean cartaoFisicoPresente,
    boolean reembolsoOriginalRecusado,
    Boolean acessoAplicacaoPagamento) {}

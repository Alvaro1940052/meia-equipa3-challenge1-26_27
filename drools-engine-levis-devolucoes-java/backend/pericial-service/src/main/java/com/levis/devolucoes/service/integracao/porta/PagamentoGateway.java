package com.levis.devolucoes.service.integracao.porta;

import com.levis.devolucoes.dto.enums.EstadoConta;
import java.util.Optional;

/**
 * Sistemas de pagamento (cartões, Afterpay, PayPal/Venmo, Interac/VeriFone): estado da conta do
 * cartão original (TN-002, TN-003).
 */
public interface PagamentoGateway {

  Optional<EstadoConta> estadoConta(String idTransacao);
}

package com.levis.devolucoes.service.integracao.porta;

import java.util.Optional;

/** BackPocket: encomendas online e portal de devoluções (CH-002 a CH-004). */
public interface BackPocketGateway {

  /** A encomenda online foi encontrada; vazio se a BackPocket não responder sobre ela. */
  Optional<Boolean> encomendaEncontrada(String idEncomenda);

  /** O portal de devoluções online está disponível. */
  boolean portalDisponivel();
}

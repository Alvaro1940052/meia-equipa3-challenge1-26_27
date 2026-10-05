package com.levis.devolucoes.service.excecao;

import java.util.List;

/** O pedido não pode ser avaliado: dados obrigatórios em falta ou incoerentes. */
public class PedidoInvalidoException extends RuntimeException {

  private final List<String> erros;

  public PedidoInvalidoException(String mensagem, List<String> erros) {
    super(mensagem);
    this.erros = List.copyOf(erros);
  }

  public List<String> erros() {
    return erros;
  }
}

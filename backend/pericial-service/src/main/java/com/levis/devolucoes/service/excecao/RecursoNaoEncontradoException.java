package com.levis.devolucoes.service.excecao;

/** Avaliação, regra ou artigo inexistente. */
public class RecursoNaoEncontradoException extends RuntimeException {

  public RecursoNaoEncontradoException(String mensagem) {
    super(mensagem);
  }
}

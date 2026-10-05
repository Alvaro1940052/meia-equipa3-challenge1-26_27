package com.levis.devolucoes.service.excecao;

/**
 * A avaliação foi decidida com outra versão da base de conhecimento: não pode ser explicada nem
 * simulada com as regras atuais sem dar uma explicação diferente da decisão.
 */
public class VersaoBaseConhecimentoDiferenteException extends RuntimeException {

  public VersaoBaseConhecimentoDiferenteException(String versaoDaAvaliacao, String versaoAtual) {
    super(
        "A avaliação foi decidida com a base de conhecimento "
            + versaoDaAvaliacao
            + " e a versão atual é "
            + versaoAtual
            + ".");
  }
}

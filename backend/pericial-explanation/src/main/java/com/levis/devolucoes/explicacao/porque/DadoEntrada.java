package com.levis.devolucoes.explicacao.porque;

import java.util.Optional;

/**
 * Pergunta que o sistema pode fazer ao colaborador: um dado de entrada (IN-001 a IN-010) ou outro
 * dado do pedido de que as regras dependem.
 */
public enum DadoEntrada {
  MERCADO("IN-001", "loja.mercado", "Em que mercado fica a loja (Estados Unidos ou Canadá)?"),
  TIPO_LOJA("IN-002", "loja.tipoLoja", "A loja é Mainline ou Outlet?"),
  CANAL(
      "IN-003",
      "compraOriginal.canal",
      "Onde e em que condições foi feita a compra (canal, Stylist, promoção por escalões, ajuste anterior)?"),
  COMPROVATIVO(
      "IN-004", "comprovativo", "Que comprovativo de compra apresenta o cliente e o que confirma?"),
  PEDIDO("IN-005", "tipoPedido", "O que pede o cliente e, numa troca, o que leva?"),
  MOMENTO(
      "IN-006", "compraOriginal.dataCompra", "Quando foi feita a compra ou o envio da encomenda?"),
  PRODUTO(
      "IN-007",
      "artigos[].produto",
      "Que produto é devolvido (SKU, marca, categoria, sortido, saldo)?"),
  ESTADO(
      "IN-008",
      "artigos[].estado",
      "Em que estado está o artigo (uso, etiquetas, alterações, defeito, embalagem, segurança)?"),
  PAGAMENTO(
      "IN-009",
      "compraOriginal.pagamento",
      "Como foi paga a compra e em que estado está esse meio?"),
  REVENDA(
      "IN-010", "artigos[].revendivel", "O artigo pode ser verificado, reetiquetado e revendido?"),
  COLABORADOR("HS-006", "colaborador", "Quem processa a transação e com que credencial de POS?"),
  CLIENTE("EX-002", "cliente", "O cliente fornece dados, contesta o resultado ou está agitado?"),
  EXCECAO("EX-001", "pedidoExcecao", "O cliente pede uma exceção e qual foi a decisão da gestão?"),
  FRAUDE("EX-008", "indicadoresFraude", "Há indícios de fraude ou inconsistências relevantes?"),
  ONLINE(
      "CH-002",
      "compraOriginal.encomendaEncontrada",
      "A encomenda online foi encontrada, o portal está disponível e a política permite a devolução às cegas?");

  private final String codigo;
  private final String caminho;
  private final String pergunta;

  DadoEntrada(String codigo, String caminho, String pergunta) {
    this.codigo = codigo;
    this.caminho = caminho;
    this.pergunta = pergunta;
  }

  public String codigo() {
    return codigo;
  }

  public String caminho() {
    return caminho;
  }

  public String pergunta() {
    return pergunta;
  }

  /** Dado com o código indicado (ex.: IN-010), como devolvido pelo "O que falta?". */
  public static Optional<DadoEntrada> deCodigo(String codigo) {
    for (DadoEntrada dado : values()) {
      if (dado.codigo.equalsIgnoreCase(codigo) || dado.name().equalsIgnoreCase(codigo)) {
        return Optional.of(dado);
      }
    }
    return Optional.empty();
  }
}

package com.levis.devolucoes.service.avaliacao;

import com.levis.devolucoes.dto.pedido.ArtigoRequest;
import com.levis.devolucoes.dto.pedido.PedidoAvaliacaoRequest;
import com.levis.devolucoes.explicacao.emfalta.DadoEmFalta;
import com.levis.devolucoes.service.excecao.PedidoInvalidoException;
import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Component;

/**
 * Validação de coerência do pedido (a estrutura é validada por Bean Validation nos DTO): artigos
 * com IDs únicos, datas não futuras e, para avaliar, os dados obrigatórios completos ("O que
 * falta?").
 */
@Component
public class ValidadorPedido {

  private final Clock relogio;

  public ValidadorPedido(Clock relogio) {
    this.relogio = relogio;
  }

  /** Erros de coerência, independentes da completude dos dados. */
  public List<String> errosDeCoerencia(PedidoAvaliacaoRequest pedido) {
    List<String> erros = new ArrayList<>();
    Set<String> ids = new HashSet<>();
    if (pedido.artigos() != null) {
      for (ArtigoRequest artigo : pedido.artigos()) {
        if (artigo != null && !ids.add(artigo.id())) {
          erros.add("Artigo repetido: " + artigo.id());
        }
      }
    }
    LocalDate hoje = LocalDate.now(relogio);
    if (pedido.dataPedido() != null && pedido.dataPedido().isAfter(hoje)) {
      erros.add("A data do pedido não pode ser futura: " + pedido.dataPedido());
    }
    if (pedido.compraOriginal() != null
        && pedido.compraOriginal().dataCompra() != null
        && pedido.dataPedido() != null
        && pedido.compraOriginal().dataCompra().isAfter(pedido.dataPedido())) {
      erros.add("A data da compra é posterior à data do pedido.");
    }
    return erros;
  }

  public void validarCoerencia(PedidoAvaliacaoRequest pedido) {
    List<String> erros = errosDeCoerencia(pedido);
    if (!erros.isEmpty()) {
      throw new PedidoInvalidoException("O pedido é incoerente.", erros);
    }
  }

  /** Para avaliar, os dados obrigatórios têm de estar completos. */
  public void validarCompletude(List<DadoEmFalta> obrigatoriosEmFalta) {
    if (!obrigatoriosEmFalta.isEmpty()) {
      throw new PedidoInvalidoException(
          "Faltam dados obrigatórios para decidir.",
          obrigatoriosEmFalta.stream()
              .map(d -> d.codigo() + " " + d.caminho() + ": " + d.descricao())
              .toList());
    }
  }
}

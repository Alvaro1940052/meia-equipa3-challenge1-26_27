package com.levis.devolucoes.regras;

import static com.levis.devolucoes.model.teste.PedidoBuilder.umPedido;
import static org.assertj.core.api.Assertions.assertThatCode;

import com.levis.devolucoes.model.enums.CanalCompra;
import com.levis.devolucoes.model.enums.TipoPedido;
import com.levis.devolucoes.model.pedido.PedidoDevolucao;
import com.levis.devolucoes.model.teste.PedidoBuilder;
import com.levis.devolucoes.regras.suporte.MotorTeste;
import java.util.function.Consumer;
import java.util.stream.Stream;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

/**
 * Nenhuma regra pode falhar com dados em falta: o pedido segue e o "O que falta?" (Fase 5) indica
 * os dados a recolher. Cada padrão das regras tem de verificar os nulos dos caminhos que percorre.
 */
class RobustezDadosEmFaltaTest {

  static Stream<Arguments> pedidosIncompletos() {
    return Stream.of(
        caso("sem compra original", p -> p.setCompraOriginal(null)),
        caso("sem pagamento", p -> p.getCompraOriginal().setPagamento(null)),
        caso("sem canal", p -> p.getCompraOriginal().setCanal(null)),
        caso("sem loja", p -> p.setLoja(null)),
        caso("sem cliente", p -> p.setCliente(null)),
        caso("sem comprovativo", p -> p.setComprovativo(null)),
        caso("sem tipo de pedido", p -> p.setTipoPedido(null)),
        caso("sem data do pedido", p -> p.setDataPedido(null)),
        caso("artigo sem produto", p -> p.getArtigos().getFirst().setProduto(null)),
        caso("artigo sem estado", p -> p.getArtigos().getFirst().setEstado(null)),
        caso("artigo sem preço pago", p -> p.getArtigos().getFirst().setPrecoPago(null)),
        caso(
            "troca sem artigos de troca",
            p -> {
              p.setTipoPedido(TipoPedido.TROCA);
              p.setArtigosTroca(new java.util.ArrayList<>());
            }),
        caso(
            "online sem pagamento",
            p -> {
              p.getCompraOriginal().setCanal(CanalCompra.LEVI_COM);
              p.getCompraOriginal().setEncomendaEncontrada(true);
              p.getCompraOriginal().setPagamento(null);
            }),
        caso(
            "ajuste de preço sem compra original",
            p -> {
              p.setTipoPedido(TipoPedido.AJUSTE_PRECO);
              p.setCompraOriginal(null);
            }));
  }

  private static Arguments caso(String nome, Consumer<PedidoDevolucao> alteracao) {
    return Arguments.of(nome, alteracao);
  }

  @ParameterizedTest(name = "{0}")
  @MethodSource("pedidosIncompletos")
  void avaliaSemErros(String nome, Consumer<PedidoDevolucao> alteracao) {
    PedidoBuilder pedido = umPedido().com(alteracao);
    assertThatCode(() -> MotorTeste.avaliar(pedido.construir())).doesNotThrowAnyException();
  }

  @ParameterizedTest(name = "{0}, às cegas")
  @MethodSource("pedidosIncompletos")
  void avaliaSemErrosAsCegas(String nome, Consumer<PedidoDevolucao> alteracao) {
    PedidoBuilder pedido =
        umPedido()
            .com(
                p -> {
                  p.setComprovativo(null);
                  if (p.getCompraOriginal() != null) {
                    p.getCompraOriginal().setDataCompra(null);
                  }
                })
            .com(alteracao);
    assertThatCode(() -> MotorTeste.avaliar(pedido.construir())).doesNotThrowAnyException();
  }
}

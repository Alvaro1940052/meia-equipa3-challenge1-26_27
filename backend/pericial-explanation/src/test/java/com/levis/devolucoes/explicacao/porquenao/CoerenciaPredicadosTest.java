package com.levis.devolucoes.explicacao.porquenao;

import static com.levis.devolucoes.explicacao.SuporteExplicacoes.AVALIADOR;
import static com.levis.devolucoes.explicacao.SuporteExplicacoes.CATALOGO;
import static com.levis.devolucoes.explicacao.SuporteExplicacoes.PREDICADOS;
import static com.levis.devolucoes.model.teste.PedidoBuilder.umPedido;
import static org.assertj.core.api.Assertions.assertThat;

import com.levis.devolucoes.explicacao.SuporteExplicacoes;
import com.levis.devolucoes.explicacao.catalogo.MetadadosRegra;
import com.levis.devolucoes.explicacao.motor.ResultadoExecucao;
import com.levis.devolucoes.explicacao.rastreio.EventoRegra;
import com.levis.devolucoes.model.enums.CanalCompra;
import com.levis.devolucoes.model.enums.CategoriaProduto;
import com.levis.devolucoes.model.enums.EstadoEtiquetas;
import com.levis.devolucoes.model.enums.MeioPagamento;
import com.levis.devolucoes.model.enums.TipoPedido;
import com.levis.devolucoes.model.pedido.PedidoDevolucao;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

/**
 * Os predicados Java reproduzem o DRL: em cada regra disparada, todas as condições declaradas sobre
 * os dados de entrada são verdadeiras.
 */
class CoerenciaPredicadosTest {

  static Stream<Arguments> execucoes() {
    Stream<Arguments> cenarios =
        IntStream.rangeClosed(1, 10)
            .mapToObj(n -> Arguments.of("cenário " + n, SuporteExplicacoes.cenario(n)));
    Stream<Arguments> outros =
        Stream.of(
            caso("padrão", umPedido().construir()),
            caso("às cegas", umPedido().semComprovativo().construir()),
            caso(
                "etiquetas soltas revendível",
                umPedido()
                    .artigo(
                        a -> {
                          a.getEstado().setEtiquetas(EstadoEtiquetas.SOLTAS);
                          a.setRevendivel(true);
                        })
                    .construir()),
            caso(
                "após 30 dias revendível",
                umPedido().diasDesdeCompra(45).artigo(a -> a.setRevendivel(true)).construir()),
            caso(
                "ajuste de preço",
                umPedido().tipo(TipoPedido.AJUSTE_PRECO).diasDesdeCompra(5).construir()),
            caso("débito", umPedido().pagamento(MeioPagamento.DEBITO).construir()),
            caso(
                "bodywear sem embalagem",
                umPedido()
                    .artigo(
                        a -> {
                          a.getProduto().setCategoria(CategoriaProduto.BODYWEAR);
                          a.getEstado().setConjuntoCompleto(true);
                        })
                    .construir()),
            caso("entre canais", umPedido().artigo(a -> a.setEntreCanais(true)).construir()),
            caso(
                "online encontrado",
                umPedido()
                    .canal(CanalCompra.LEVI_CA)
                    .diasDesdeEnvio(40)
                    .com(p -> p.getCompraOriginal().setEncomendaEncontrada(true))
                    .construir()));
    return Stream.concat(cenarios, outros);
  }

  private static Arguments caso(String nome, PedidoDevolucao pedido) {
    return Arguments.of(nome, SuporteExplicacoes.executar(pedido));
  }

  @ParameterizedTest(name = "{0}")
  @MethodSource("execucoes")
  void condicoesDeEntradaVerdadeirasNasRegrasDisparadas(String nome, ResultadoExecucao resultado) {
    List<String> incoerencias = new ArrayList<>();
    for (EventoRegra disparo : resultado.rastreio().disparos()) {
      MetadadosRegra regra = CATALOGO.porNome(disparo.nomeRegra()).orElseThrow();
      ContextoAvaliacao contexto =
          disparo.artigoId() == null
              ? ContextoAvaliacao.doPedido(resultado)
              : ContextoAvaliacao.doArtigo(resultado, disparo.artigoId());
      for (ResultadoCondicao condicao : AVALIADOR.avaliar(regra, contexto)) {
        boolean sobreEntrada =
            PREDICADOS.predicado(condicao.nome()).map(Predicado::sobreEntrada).orElse(false);
        if (sobreEntrada && !Boolean.TRUE.equals(condicao.cumprida())) {
          incoerencias.add(
              regra.nome()
                  + " / "
                  + condicao.nome()
                  + " = "
                  + condicao.cumprida()
                  + " ("
                  + condicao.valor()
                  + ")");
        }
      }
    }
    assertThat(incoerencias).as("condições de entrada falsas em regras disparadas").isEmpty();
  }
}

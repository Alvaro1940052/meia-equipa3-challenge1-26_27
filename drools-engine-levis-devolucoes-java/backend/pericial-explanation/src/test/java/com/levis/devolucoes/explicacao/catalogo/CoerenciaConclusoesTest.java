package com.levis.devolucoes.explicacao.catalogo;

import static com.levis.devolucoes.explicacao.SuporteExplicacoes.CATALOGO;
import static com.levis.devolucoes.explicacao.SuporteExplicacoes.PREDICADOS;
import static com.levis.devolucoes.model.teste.PedidoBuilder.umPedido;
import static org.assertj.core.api.Assertions.assertThat;

import com.levis.devolucoes.explicacao.SuporteExplicacoes;
import com.levis.devolucoes.explicacao.motor.ResultadoExecucao;
import com.levis.devolucoes.explicacao.porque.DadoEntrada;
import com.levis.devolucoes.explicacao.porque.DependenciasDados;
import com.levis.devolucoes.explicacao.porquenao.Predicado;
import com.levis.devolucoes.explicacao.rastreio.AlteracaoCampo;
import com.levis.devolucoes.explicacao.rastreio.EventoRegra;
import com.levis.devolucoes.model.enums.CanalCompra;
import com.levis.devolucoes.model.enums.CategoriaProduto;
import com.levis.devolucoes.model.enums.EstadoConta;
import com.levis.devolucoes.model.enums.EstadoEtiquetas;
import com.levis.devolucoes.model.enums.Funcao;
import com.levis.devolucoes.model.enums.MeioPagamento;
import com.levis.devolucoes.model.enums.TipoPedido;
import com.levis.devolucoes.model.teste.PedidoBuilder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

/**
 * As conclusões declaradas em {@code @conclusoes} cobrem tudo o que as regras alteram, e as
 * dependências das perguntas cobrem todas as condições sobre os dados de entrada.
 */
class CoerenciaConclusoesTest {

  static Stream<Arguments> execucoes() {
    Stream<Arguments> cenarios =
        IntStream.rangeClosed(1, 10)
            .mapToObj(n -> Arguments.of("cenário " + n, SuporteExplicacoes.cenario(n)));
    Stream<Arguments> outros =
        Stream.of(
            caso(
                "às cegas Lead Cashier",
                umPedido().semComprovativo().funcao(Funcao.LEAD_CASHIER, true)),
            caso(
                "conta encerrada recusada",
                umPedido()
                    .com(
                        p -> {
                          p.getCompraOriginal()
                              .getPagamento()
                              .setEstadoConta(EstadoConta.ENCERRADA);
                          p.getCompraOriginal().getPagamento().setReembolsoOriginalRecusado(true);
                        })),
            caso("PayPal", umPedido().pagamento(MeioPagamento.PAYPAL)),
            caso("Afterpay em loja", umPedido().pagamento(MeioPagamento.AFTERPAY)),
            caso("oferta", umPedido().tipo(TipoPedido.DEVOLUCAO_OFERTA)),
            caso("ajuste permitido", umPedido().tipo(TipoPedido.AJUSTE_PRECO).diasDesdeCompra(5)),
            caso(
                "após 30 dias revendível",
                umPedido().diasDesdeCompra(45).artigo(a -> a.setRevendivel(true))),
            caso(
                "etiquetas soltas não revendível",
                umPedido()
                    .artigo(
                        a -> {
                          a.getEstado().setEtiquetas(EstadoEtiquetas.SOLTAS);
                          a.setRevendivel(false);
                        })),
            caso(
                "bodywear com embalagem revendível",
                umPedido()
                    .artigo(
                        a -> {
                          a.getProduto().setCategoria(CategoriaProduto.BODYWEAR);
                          a.getEstado().setEmbalagemIntacta(true);
                          a.setRevendivel(true);
                        })),
            caso("franquia", umPedido().canal(CanalCompra.FRANQUIA_CANADA)),
            caso(
                "online tardio",
                umPedido()
                    .canal(CanalCompra.LEVI_COM)
                    .diasDesdeEnvio(40)
                    .com(p -> p.getCompraOriginal().setEncomendaEncontrada(true))),
            caso(
                "online não encontrado",
                umPedido()
                    .canal(CanalCompra.LEVI_CA)
                    .diasDesdeEnvio(5)
                    .com(
                        p -> {
                          p.setPoliticaPermiteAsCegasOnline(true);
                          p.setPortalOnlineDisponivel(false);
                        })));
    return Stream.concat(cenarios, outros);
  }

  private static Arguments caso(String nome, PedidoBuilder pedido) {
    return Arguments.of(nome, SuporteExplicacoes.executar(pedido.construir()));
  }

  @ParameterizedTest(name = "{0}")
  @MethodSource("execucoes")
  void cadaAlteracaoDeUmCampoOutEstaDeclarada(String nome, ResultadoExecucao resultado) {
    List<String> naoDeclaradas = new ArrayList<>();
    for (EventoRegra disparo : resultado.rastreio().disparos()) {
      MetadadosRegra regra = CATALOGO.porNome(disparo.nomeRegra()).orElseThrow();
      for (AlteracaoCampo alteracao : disparo.alteracoes()) {
        CampoSaida campo = CampoSaida.doCampo(alteracao.campo()).orElse(null);
        if (campo == null) {
          continue; // terminal, tipoVerificacao, excecaoRecusada: não são conclusões OUT
        }
        boolean comValor =
            Set.of(
                    "elegibilidade",
                    "tipoTransacao",
                    "meioReembolso",
                    "aprovacao",
                    "processo",
                    "destino")
                .contains(alteracao.campo());
        boolean declarada =
            comValor ? regra.produz(campo, alteracao.depois()) : regra.alteraCampo(campo);
        if (!declarada) {
          naoDeclaradas.add(
              regra.nome()
                  + ": "
                  + alteracao.alvo()
                  + "."
                  + alteracao.campo()
                  + " = "
                  + alteracao.depois());
        }
      }
    }
    assertThat(naoDeclaradas).as("alterações sem @conclusoes correspondente").isEmpty();
  }

  @Test
  void cadaCondicaoSobreAEntradaLeUmDado() {
    DependenciasDados dependencias = new DependenciasDados();
    List<String> semDados =
        PREDICADOS.nomes().stream()
            .filter(n -> PREDICADOS.predicado(n).map(Predicado::sobreEntrada).orElse(false))
            .filter(n -> dependencias.dados(n).isEmpty())
            .toList();
    assertThat(semDados).as("condições sobre a entrada sem dado associado").isEmpty();
    assertThat(PREDICADOS.nomes()).containsAll(dependencias.condicoes());
  }

  @Test
  void cadaPerguntaEUsadaPorAlgumaRegra() {
    DependenciasDados dependencias = new DependenciasDados();
    Set<DadoEntrada> usados =
        CATALOGO.condicoesDeclaradas().stream()
            .flatMap(c -> dependencias.dados(c).stream())
            .collect(Collectors.toCollection(() -> EnumSet.noneOf(DadoEntrada.class)));
    assertThat(usados).containsExactlyInAnyOrderElementsOf(Arrays.asList(DadoEntrada.values()));
  }

  @Test
  void cadaRegraDeclaraAsConclusoesComValoresValidos() {
    assertThat(CATALOGO.regras()).allSatisfy(r -> assertThat(r.conclusoes()).isNotNull());
    assertThat(CATALOGO.produtoras(CampoSaida.OUT_001, "PERMITIR"))
        .extracting(MetadadosRegra::id)
        .contains("PC-001", "PT-003", "PT-005", "CH-005", "CH-006");
    assertThat(CATALOGO.produtoras(CampoSaida.OUT_004, null))
        .extracting(MetadadosRegra::id)
        .contains("TN-011");
  }
}

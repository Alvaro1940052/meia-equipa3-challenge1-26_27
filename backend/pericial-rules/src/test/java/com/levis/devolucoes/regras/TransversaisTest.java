package com.levis.devolucoes.regras;

import static com.levis.devolucoes.model.teste.PedidoBuilder.umPedido;
import static org.assertj.core.api.Assertions.assertThat;

import com.levis.devolucoes.model.decisao.IndicadorFraude;
import com.levis.devolucoes.model.enums.DestinoProduto;
import com.levis.devolucoes.model.enums.Elegibilidade;
import com.levis.devolucoes.model.enums.NivelAprovacao;
import com.levis.devolucoes.model.enums.NivelRisco;
import com.levis.devolucoes.model.pedido.PedidoDevolucao;
import com.levis.devolucoes.regras.suporte.MotorTeste;
import com.levis.devolucoes.regras.suporte.Regra;
import com.levis.devolucoes.regras.suporte.ResultadoAvaliacao;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

/** Interrupções transversais (docs/03): EX-008 (fraude) e PC-008 (artigo inseguro). */
class TransversaisTest {

  @Nested
  @Regra("EX-008")
  class Fraude {

    @ParameterizedTest
    @EnumSource(
        value = NivelRisco.class,
        names = {"SIGNIFICATIVO", "CONFIRMADO"})
    void indicioRelevanteSuspendeATransacao(NivelRisco nivel) {
      PedidoDevolucao pedido = umPedido().construir();

      ResultadoAvaliacao resultado =
          MotorTeste.avaliar(pedido, new IndicadorFraude("P-1", "Recibo adulterado", nivel));

      assertThat(pedido.isSuspenso()).isTrue();
      assertThat(resultado.decisao().getElegibilidade()).isEqualTo(Elegibilidade.REVER);
      assertThat(resultado.decisao().getAprovacao()).isEqualTo(NivelAprovacao.DISTRICT_AREA);
      assertThat(resultado.decisao().isTerminal()).isTrue();
      assertThat(resultado.regrasDeNegocio()).containsExactly("EX-008");
      assertThat(resultado.decisao().getRegistos().getFirst().getMensagem())
          .contains("Recibo adulterado");
    }

    @Test
    @DisplayName("Indício de risco baixo não suspende (a validar A-26)")
    void indicioDeRiscoBaixoNaoSuspende() {
      PedidoDevolucao pedido = umPedido().construir();

      ResultadoAvaliacao resultado =
          MotorTeste.avaliar(
              pedido, new IndicadorFraude("P-1", "Hesitação na resposta", NivelRisco.BAIXO));

      assertThat(pedido.isSuspenso()).isFalse();
      assertThat(resultado.disparou("EX-008")).isFalse();
      assertThat(resultado.decisao().isTerminal()).isFalse();
    }

    @Test
    void indicioDeOutroPedidoNaoSuspende() {
      PedidoDevolucao pedido = umPedido().construir();

      ResultadoAvaliacao resultado =
          MotorTeste.avaliar(
              pedido, new IndicadorFraude("P-2", "Outro pedido", NivelRisco.CONFIRMADO));

      assertThat(resultado.disparou("EX-008")).isFalse();
    }

    @Test
    void variosIndiciosSuspendemUmaSoVez() {
      PedidoDevolucao pedido = umPedido().construir();

      ResultadoAvaliacao resultado =
          MotorTeste.avaliar(
              pedido,
              new IndicadorFraude("P-1", "Recibo adulterado", NivelRisco.CONFIRMADO),
              new IndicadorFraude("P-1", "Etiqueta trocada", NivelRisco.SIGNIFICATIVO));

      assertThat(resultado.regrasDeNegocio()).containsExactly("EX-008");
    }
  }

  @Nested
  @Regra("PC-008")
  class ArtigoInseguro {

    @Test
    void isolaOArtigoPorRiscoBiologico() {
      PedidoDevolucao pedido =
          umPedido().artigo(a -> a.getEstado().setSujoOuInseguro(true)).construir();

      ResultadoAvaliacao resultado = MotorTeste.avaliar(pedido);

      assertThat(resultado.artigo("A-1").getDestino()).isEqualTo(DestinoProduto.RISCO_BIOLOGICO);
      assertThat(resultado.artigo("A-1").disparou("PC-008")).isTrue();
      assertThat(resultado.disparos()).startsWith("PC-008").containsOnlyOnce("PC-008");
    }

    @Test
    @DisplayName("Não altera a elegibilidade do artigo nem do pedido (a validar A-15)")
    void naoAlteraAElegibilidade() {
      PedidoDevolucao pedido =
          umPedido().artigo(a -> a.getEstado().setSujoOuInseguro(true)).construir();

      ResultadoAvaliacao resultado = MotorTeste.avaliar(pedido);

      // O registo de PC-008 não tem resultado; a elegibilidade é a do estado (PC-001)
      assertThat(resultado.artigo("A-1").getRegistos())
          .filteredOn(r -> r.getCodigoRegra().equals("PC-008"))
          .singleElement()
          .satisfies(r -> assertThat(r.getResultado()).isNull());
      assertThat(resultado.artigo("A-1").getElegibilidade()).isEqualTo(Elegibilidade.PERMITIR);
      assertThat(resultado.artigo("A-1").isTerminal()).isFalse();
      assertThat(resultado.decisao().isTerminal()).isFalse();
    }

    @Test
    void soAfetaOArtigoInseguro() {
      PedidoDevolucao pedido =
          umPedido().maisUmArtigo("A-2", a -> a.getEstado().setSujoOuInseguro(true)).construir();

      ResultadoAvaliacao resultado = MotorTeste.avaliar(pedido);

      assertThat(resultado.artigo("A-1").getDestino()).isNotEqualTo(DestinoProduto.RISCO_BIOLOGICO);
      assertThat(resultado.artigo("A-2").getDestino()).isEqualTo(DestinoProduto.RISCO_BIOLOGICO);
    }

    @Test
    @DisplayName("Isola o artigo mesmo com a transação suspensa por fraude (a validar A-28)")
    @Regra({"PC-008", "EX-008"})
    void isolaMesmoComATransacaoSuspensa() {
      PedidoDevolucao pedido =
          umPedido().artigo(a -> a.getEstado().setSujoOuInseguro(true)).construir();

      ResultadoAvaliacao resultado =
          MotorTeste.avaliar(
              pedido, new IndicadorFraude("P-1", "Inconsistência", NivelRisco.SIGNIFICATIVO));

      assertThat(resultado.regrasDeNegocio()).containsExactly("EX-008", "PC-008");
      assertThat(resultado.artigo("A-1").getDestino()).isEqualTo(DestinoProduto.RISCO_BIOLOGICO);
    }

    @Test
    void artigoSemEstadoNaoDispara() {
      PedidoDevolucao pedido = umPedido().artigo(a -> a.setEstado(null)).construir();

      assertThat(MotorTeste.avaliar(pedido).disparou("PC-008")).isFalse();
    }
  }
}

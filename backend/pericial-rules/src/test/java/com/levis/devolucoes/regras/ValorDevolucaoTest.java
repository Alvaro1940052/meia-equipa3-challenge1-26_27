package com.levis.devolucoes.regras;

import static com.levis.devolucoes.model.teste.PedidoBuilder.umPedido;
import static org.assertj.core.api.Assertions.assertThat;

import com.levis.devolucoes.model.decisao.Decisao;
import com.levis.devolucoes.model.decisao.DecisaoArtigo;
import com.levis.devolucoes.model.enums.BaseValor;
import com.levis.devolucoes.model.enums.CanalCompra;
import com.levis.devolucoes.model.enums.Mercado;
import com.levis.devolucoes.model.enums.TipoComprovativo;
import com.levis.devolucoes.model.enums.TipoLoja;
import com.levis.devolucoes.model.enums.TipoPedido;
import com.levis.devolucoes.model.teste.PedidoBuilder;
import com.levis.devolucoes.regras.suporte.MotorTeste;
import com.levis.devolucoes.regras.suporte.Regra;
import com.levis.devolucoes.regras.suporte.ResultadoAvaliacao;
import java.math.BigDecimal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

/** M7 — Valor da devolução, por artigo e total. */
class ValorDevolucaoTest {

  private static final BigDecimal PAGO = new BigDecimal("69.50");
  private static final BigDecimal ATUAL = new BigDecimal("39.99");
  private static final BigDecimal PVP = new BigDecimal("98.00");
  private static final BigDecimal POS = new BigDecimal("55.25");

  private static ResultadoAvaliacao avaliar(PedidoBuilder pedido) {
    return MotorTeste.avaliar(pedido.construir());
  }

  /** Artigo pago com promoção (69.50), preço atual 39.99, PVP 98.00. */
  private static PedidoBuilder pedidoComPrecos() {
    return umPedido()
        .artigo(
            a -> {
              a.setPrecoPago(PAGO);
              a.getProduto().setPrecoAtual(ATUAL);
              a.getProduto().setPvpOriginal(PVP);
            });
  }

  private static PedidoBuilder outlet(PedidoBuilder pedido) {
    return pedido.loja(Mercado.EUA, TipoLoja.OUTLET);
  }

  private static PedidoBuilder comEscaloes(PedidoBuilder pedido) {
    return pedido
        .com(p -> p.getCompraOriginal().setPromocaoEscaloes(true))
        .artigo(a -> a.setValorCalculadoPos(POS));
  }

  @Nested
  class ValorBase {

    @Test
    @Regra("OUT-003")
    void devolucaoVerificadaPeloValorPago() {
      ResultadoAvaliacao resultado = avaliar(pedidoComPrecos());

      DecisaoArtigo artigo = resultado.artigo("A-1");
      assertThat(artigo.getValorDevolucao()).isEqualByComparingTo(PAGO);
      assertThat(artigo.getBaseValor()).isEqualTo(BaseValor.VALOR_PAGO);
      assertThat(resultado.decisao().getValorDevolucao()).isEqualByComparingTo(PAGO);
      assertThat(resultado.decisao().getBaseValor()).isEqualTo(BaseValor.VALOR_PAGO);
    }

    @Test
    @Regra("OUT-003")
    void asCegasNaMainlinePeloPrecoAtual() {
      ResultadoAvaliacao resultado = avaliar(pedidoComPrecos().semComprovativo());

      assertThat(resultado.artigo("A-1").getValorDevolucao()).isEqualByComparingTo(ATUAL);
      assertThat(resultado.artigo("A-1").getBaseValor()).isEqualTo(BaseValor.PRECO_ATUAL);
      assertThat(resultado.disparos()).doesNotContain("CH-009");
    }

    @Test
    @Regra({"OUT-003", "PT-007"})
    void ajusteDePrecoPelaDiferencaCalculadaPeloPos() {
      ResultadoAvaliacao resultado =
          avaliar(
              pedidoComPrecos()
                  .tipo(TipoPedido.AJUSTE_PRECO)
                  .artigo(a -> a.setValorCalculadoPos(new BigDecimal("12.00"))));

      assertThat(resultado.decisao().getValorDevolucao()).isEqualByComparingTo("12.00");
      assertThat(resultado.decisao().getBaseValor()).isEqualTo(BaseValor.VALOR_POS);
    }

    @Test
    @Regra("OUT-003")
    void totalSomaSoOsArtigosElegiveis() {
      ResultadoAvaliacao resultado =
          avaliar(
              pedidoComPrecos()
                  .maisUmArtigo("A-2", a -> a.setPrecoPago(new BigDecimal("30.50")))
                  .maisUmArtigo("A-3", a -> a.getEstado().setAlterado(true)));

      assertThat(resultado.decisao().getValorDevolucao()).isEqualByComparingTo("100.00");
      assertThat(resultado.artigo("A-3").getValorDevolucao()).isNull();
    }

    @Test
    @Regra({"OUT-003", "PT-008"})
    void pedidoRecusadoNaoTemValor() {
      ResultadoAvaliacao resultado =
          avaliar(pedidoComPrecos().tipo(TipoPedido.AJUSTE_PRECO).diasDesdeCompra(20));

      assertThat(resultado.decisao().getValorDevolucao()).isNull();
      assertThat(resultado.disparos()).doesNotContain("OUT-003");
    }

    @Test
    @Regra({"OUT-003", "PT-004"})
    void revisaoPendenteNaoTemValor() {
      ResultadoAvaliacao resultado = avaliar(pedidoComPrecos().diasDesdeCompra(40));

      assertThat(resultado.decisao().getValorDevolucao()).isNull();
    }
  }

  @Nested
  class Outlet {

    @Test
    @Regra("CH-009")
    void asCegasNaOutletAoPrecoPromocionalAtual() {
      ResultadoAvaliacao resultado = avaliar(outlet(pedidoComPrecos()).semComprovativo());

      DecisaoArtigo artigo = resultado.artigo("A-1");
      assertThat(artigo.getValorDevolucao()).isEqualByComparingTo(ATUAL);
      assertThat(artigo.getBaseValor()).isEqualTo(BaseValor.VALOR_PROMOCIONAL);
      assertThat(resultado.decisao().getBaseValor()).isEqualTo(BaseValor.VALOR_PROMOCIONAL);
      assertThat(resultado.disparos()).contains("CH-009");
    }

    @Test
    @Regra("CH-009")
    void comReciboNaOutletNaoAplicaCh009() {
      assertThat(avaliar(outlet(pedidoComPrecos()).canal(CanalCompra.OUTLET)).disparos())
          .doesNotContain("CH-009", "CH-010");
    }

    @ParameterizedTest
    @EnumSource(
        value = CanalCompra.class,
        names = {"MAINLINE", "LEVI_COM", "LEVI_CA"})
    @Regra("CH-010")
    @DisplayName("Mainline ou online com recibo na Outlet: PVP original (a validar A-21)")
    void entreCanaisComReciboNaOutletAoPvpOriginal(CanalCompra canal) {
      ResultadoAvaliacao resultado =
          avaliar(
              outlet(pedidoComPrecos())
                  .canal(canal)
                  .comprovativo(TipoComprovativo.CONFIRMACAO_ENCOMENDA, false)
                  .diasDesdeEnvio(5)
                  .com(p -> p.getCompraOriginal().setEncomendaEncontrada(true)));

      assertThat(resultado.artigo("A-1").getValorDevolucao()).isEqualByComparingTo(PVP);
      assertThat(resultado.artigo("A-1").getBaseValor()).isEqualTo(BaseValor.PVP_ORIGINAL);
      assertThat(resultado.registo("CH-010").getMensagem())
          .contains("se o POS e a política o permitirem");
    }
  }

  @Nested
  class PromocaoPorEscaloes {

    @Test
    @Regra({"EP-003", "CH-009"})
    @DisplayName("Às cegas: escalão pelo número de artigos devolvidos (a validar A-30)")
    void asCegasPeloEscalaoDosArtigosDevolvidos() {
      ResultadoAvaliacao resultado =
          avaliar(
              comEscaloes(outlet(pedidoComPrecos()).semComprovativo())
                  .maisUmArtigo("A-2", a -> {}));

      assertThat(resultado.disparos()).contains("CH-009", "EP-003");
      assertThat(resultado.artigo("A-1").getValorDevolucao()).isEqualByComparingTo(POS);
      assertThat(resultado.artigo("A-1").getBaseValor()).isEqualTo(BaseValor.VALOR_ESCALAO);
      assertThat(resultado.artigo("A-1").getRegistos().getLast().getMensagem())
          .contains("2 artigos devolvidos");
    }

    @Test
    @Regra("EP-003")
    void semValorDoPosOValorFicaPorDeterminar() {
      ResultadoAvaliacao resultado =
          avaliar(
              umPedido()
                  .semComprovativo()
                  .com(p -> p.getCompraOriginal().setPromocaoEscaloes(true)));

      assertThat(resultado.artigo("A-1").getValorDevolucao()).isNull();
      assertThat(resultado.artigo("A-1").getRegistos().getLast().getMensagem())
          .contains("falta o valor do escalão");
      assertThat(resultado.decisao().getValorDevolucao()).isNull();
    }

    @Test
    @Regra("EP-004")
    void comReciboPeloValorCalculadoPeloPos() {
      ResultadoAvaliacao resultado = avaliar(comEscaloes(pedidoComPrecos()));

      Decisao decisao = resultado.decisao();
      assertThat(resultado.artigo("A-1").getBaseValor()).isEqualTo(BaseValor.VALOR_POS);
      assertThat(decisao.getValorDevolucao()).isEqualByComparingTo(POS);
      assertThat(resultado.disparos()).contains("EP-004").doesNotContain("EP-003");
    }
  }
}

package com.levis.devolucoes.regras;

import static com.levis.devolucoes.model.teste.PedidoBuilder.umPedido;
import static org.assertj.core.api.Assertions.assertThat;

import com.levis.devolucoes.model.decisao.Decisao;
import com.levis.devolucoes.model.decisao.IndicadorFraude;
import com.levis.devolucoes.model.enums.BaseValor;
import com.levis.devolucoes.model.enums.CanalCompra;
import com.levis.devolucoes.model.enums.CondicaoUso;
import com.levis.devolucoes.model.enums.Elegibilidade;
import com.levis.devolucoes.model.enums.EstadoEtiquetas;
import com.levis.devolucoes.model.enums.MeioReembolso;
import com.levis.devolucoes.model.enums.NivelAprovacao;
import com.levis.devolucoes.model.enums.NivelRisco;
import com.levis.devolucoes.model.enums.TipoComprovativo;
import com.levis.devolucoes.model.enums.TipoPedido;
import com.levis.devolucoes.model.enums.TipoTransacao;
import com.levis.devolucoes.model.enums.TipoVerificacao;
import com.levis.devolucoes.model.teste.PedidoBuilder;
import com.levis.devolucoes.regras.suporte.MotorTeste;
import com.levis.devolucoes.regras.suporte.Regra;
import com.levis.devolucoes.regras.suporte.ResultadoAvaliacao;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.ValueSource;

/** M4 (comprovativo) e M5 (prazo e ajuste de preço). */
class ComprovativoEPrazoTest {

  private static ResultadoAvaliacao avaliar(PedidoBuilder pedido, IndicadorFraude... fraudes) {
    return MotorTeste.avaliar(pedido.construir(), fraudes);
  }

  private static PedidoBuilder ajuste(long dias) {
    return umPedido().tipo(TipoPedido.AJUSTE_PRECO).diasDesdeCompra(dias);
  }

  @Nested
  class Comprovativo {

    @ParameterizedTest
    @EnumSource(TipoComprovativo.class)
    @Regra("PT-001")
    void comprovativoQueConfirmaACompraEVerificado(TipoComprovativo tipo) {
      ResultadoAvaliacao resultado = avaliar(umPedido().comprovativo(tipo, false));

      assertThat(resultado.decisao().getTipoVerificacao()).isEqualTo(TipoVerificacao.VERIFICADA);
      assertThat(resultado.disparos()).contains("PT-001").doesNotContain("PT-002");
    }

    @ParameterizedTest
    @EnumSource(
        value = CanalCompra.class,
        names = {"LEVI_COM", "LEVI_CA"})
    @Regra("PT-001")
    @DisplayName("Compras online não passam por M4 (seguem o caminho ONLINE)")
    void comprasOnlineNaoPassamPorM4(CanalCompra canal) {
      ResultadoAvaliacao resultado = avaliar(umPedido().canal(canal));

      assertThat(resultado.disparos()).doesNotContain("PT-001", "PT-002", "PT-003");
    }

    @Test
    @Regra("PT-002")
    void semComprovativoEAsCegas() {
      ResultadoAvaliacao resultado = avaliar(umPedido().semComprovativo());

      assertThat(resultado.decisao().getTipoVerificacao()).isEqualTo(TipoVerificacao.AS_CEGAS);
      assertThat(resultado.disparos()).contains("PT-002").doesNotContain("PT-001");
    }

    @Test
    @Regra("PT-002")
    void comprovativoQueNaoConfirmaACompraEAsCegas() {
      ResultadoAvaliacao resultado =
          avaliar(umPedido().com(p -> p.getComprovativo().setConfirmaCompra(false)));

      assertThat(resultado.decisao().getTipoVerificacao()).isEqualTo(TipoVerificacao.AS_CEGAS);
    }

    @Test
    @Regra("PT-002")
    void ajusteDePrecoSemComprovativoNaoEDevolucaoAsCegas() {
      ResultadoAvaliacao resultado = avaliar(ajuste(5).semComprovativo());

      assertThat(resultado.disparos()).doesNotContain("PT-002");
    }

    @Test
    @Regra("PT-006")
    void clienteQueNaoDaDadosSaltaOPasso() {
      ResultadoAvaliacao resultado =
          avaliar(umPedido().semComprovativo().com(p -> p.getCliente().setForneceDados(false)));

      assertThat(resultado.disparos()).containsSequence("PT-002", "PT-006");
      assertThat(resultado.decisao().getRegistos())
          .filteredOn(r -> r.getCodigoRegra().equals("PT-006"))
          .singleElement()
          .satisfies(r -> assertThat(r.getMensagem()).contains("Saltar"));
    }

    @Test
    @Regra("PT-006")
    void barreiraLinguisticaSaltaOPasso() {
      ResultadoAvaliacao resultado =
          avaliar(
              umPedido().semComprovativo().com(p -> p.getCliente().setBarreiraLinguistica(true)));

      assertThat(resultado.disparos()).contains("PT-006");
    }

    @Test
    @Regra("PT-006")
    void naoSeAplicaComRecibo() {
      ResultadoAvaliacao resultado =
          avaliar(umPedido().com(p -> p.getCliente().setForneceDados(false)));

      assertThat(resultado.disparos()).doesNotContain("PT-006");
    }
  }

  @Nested
  class Prazo {

    @ParameterizedTest
    @ValueSource(ints = {0, 29, 30})
    @Regra("PT-003")
    @DisplayName("Verificada até 30 dias inclusive: reembolso no meio original (a validar A-22)")
    void ate30DiasReembolsoNoMeioOriginal(int dias) {
      Decisao decisao = avaliar(umPedido().diasDesdeCompra(dias)).decisao();

      assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.PERMITIR);
      assertThat(decisao.getTipoTransacao()).isEqualTo(TipoTransacao.REEMBOLSO);
      assertThat(decisao.getMeioReembolso()).isEqualTo(MeioReembolso.MEIO_ORIGINAL);
      assertThat(decisao.getBaseValor()).isEqualTo(BaseValor.VALOR_PAGO);
    }

    @Test
    @Regra("PT-003")
    void trocaVerificadaAte30Dias() {
      Decisao decisao = avaliar(umPedido().tipo(TipoPedido.TROCA).diasDesdeCompra(29)).decisao();

      assertThat(decisao.getTipoTransacao()).isEqualTo(TipoTransacao.TROCA);
      assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.PERMITIR);
    }

    @Test
    @Regra("PT-003")
    void artigoEmRevisaoContaComoElegivel() {
      ResultadoAvaliacao resultado =
          avaliar(umPedido().artigo(a -> a.getEstado().setEtiquetas(EstadoEtiquetas.SOLTAS)));

      assertThat(resultado.disparos()).contains("PC-002", "PT-003");
    }

    @Test
    @Regra({"PT-003", "HS-003"})
    @DisplayName("Sem artigos elegíveis (G3) não há prazo a aplicar")
    void semArtigosElegiveisNaoAplicaOPrazo() {
      ResultadoAvaliacao resultado =
          avaliar(umPedido().artigo(a -> a.getEstado().setAlterado(true)));

      assertThat(resultado.disparos()).contains("PT-001").doesNotContain("PT-003");
    }

    @Test
    @Regra("PT-004")
    void apos30DiasSemAvaliacaoDeRevendaFicaEmRevisao() {
      Decisao decisao = avaliar(umPedido().diasDesdeCompra(31)).decisao();

      assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.REVER);
      assertThat(decisao.getAprovacao()).isEqualTo(NivelAprovacao.RESPONSAVEL_SENIOR);
      assertThat(decisao.getTipoTransacao()).isNull();
    }

    @Test
    @Regra("PT-004")
    void apos30DiasRevendivelEDeBaixoRiscoTemCreditoDeLoja() {
      Decisao decisao =
          avaliar(
                  umPedido().diasDesdeCompra(45).artigo(a -> a.setRevendivel(true)),
                  new IndicadorFraude("P-1", "Hesitação", NivelRisco.BAIXO))
              .decisao();

      assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.PERMITIR);
      assertThat(decisao.getTipoTransacao()).isEqualTo(TipoTransacao.CREDITO_LOJA);
      assertThat(decisao.getMeioReembolso()).isEqualTo(MeioReembolso.CREDITO_LOJA);
      assertThat(decisao.getAprovacao()).isEqualTo(NivelAprovacao.RESPONSAVEL_SENIOR);
    }

    @Test
    @Regra("PT-004")
    void apos30DiasNaoRevendivelERecusado() {
      Decisao decisao =
          avaliar(umPedido().diasDesdeCompra(45).artigo(a -> a.setRevendivel(false))).decisao();

      assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.RECUSAR);
      assertThat(decisao.getTipoTransacao()).isEqualTo(TipoTransacao.NENHUMA);
    }

    @Test
    @Regra("PT-004")
    void comUmArtigoPorAvaliarNaoAprovaCredito() {
      ResultadoAvaliacao resultado =
          avaliar(
              umPedido()
                  .diasDesdeCompra(45)
                  .artigo(a -> a.setRevendivel(true))
                  .maisUmArtigo("A-2", a -> a.setRevendivel(null)));

      assertThat(resultado.decisao().getElegibilidade()).isEqualTo(Elegibilidade.REVER);
      assertThat(resultado.decisao().getTipoTransacao()).isNull();
    }

    @Test
    @Regra("PT-005")
    void asCegasSoCreditoDeLojaAoPrecoAtual() {
      Decisao decisao = avaliar(umPedido().semComprovativo()).decisao();

      assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.PERMITIR);
      assertThat(decisao.getTipoTransacao()).isEqualTo(TipoTransacao.CREDITO_LOJA);
      assertThat(decisao.getMeioReembolso()).isEqualTo(MeioReembolso.CREDITO_LOJA);
      assertThat(decisao.getBaseValor()).isEqualTo(BaseValor.PRECO_ATUAL);
    }

    @Test
    @Regra("PT-005")
    void trocaAsCegasAoPrecoAtual() {
      Decisao decisao = avaliar(umPedido().tipo(TipoPedido.TROCA).semComprovativo()).decisao();

      assertThat(decisao.getTipoTransacao()).isEqualTo(TipoTransacao.TROCA);
      assertThat(decisao.getMeioReembolso()).isNull();
      assertThat(decisao.getBaseValor()).isEqualTo(BaseValor.PRECO_ATUAL);
    }

    @Test
    @Regra("PT-005")
    @DisplayName("Devolução de oferta sem recibo é às cegas: crédito de loja (a validar A-13)")
    void ofertaSemReciboTemCreditoDeLoja() {
      Decisao decisao =
          avaliar(umPedido().tipo(TipoPedido.DEVOLUCAO_OFERTA).semComprovativo()).decisao();

      assertThat(decisao.getTipoTransacao()).isEqualTo(TipoTransacao.CREDITO_LOJA);
    }

    @Test
    @Regra({"PT-005", "PC-005"})
    void asCegasSemArtigosElegiveisNaoPermite() {
      ResultadoAvaliacao resultado =
          avaliar(
              umPedido()
                  .semComprovativo()
                  .artigo(a -> a.getEstado().setCondicaoUso(CondicaoUso.LAVADO)));

      assertThat(resultado.disparos()).contains("PT-002").doesNotContain("PT-005");
    }
  }

  @Nested
  class AjusteDePreco {

    @ParameterizedTest
    @EnumSource(
        value = CanalCompra.class,
        names = {"MAINLINE", "OUTLET"})
    @Regra("PT-007")
    void compraEmLojaAte14DiasComReciboOriginal(CanalCompra canal) {
      Decisao decisao = avaliar(ajuste(14).canal(canal)).decisao();

      assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.PERMITIR);
      assertThat(decisao.getTipoTransacao()).isEqualTo(TipoTransacao.AJUSTE_PRECO);
      assertThat(decisao.getBaseValor()).isEqualTo(BaseValor.VALOR_POS);
    }

    @Test
    @Regra("PT-007")
    @DisplayName("O ajuste é único: já aplicado, recusa (a validar A-14)")
    void ajusteJaAplicadoERecusado() {
      Decisao decisao =
          avaliar(ajuste(5).com(p -> p.getCompraOriginal().setAjustePrecoAplicado(true))).decisao();

      assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.RECUSAR);
      assertThat(decisao.getTipoTransacao()).isEqualTo(TipoTransacao.NENHUMA);
    }

    @ParameterizedTest
    @EnumSource(
        value = CanalCompra.class,
        names = {"LEVI_COM", "BACKPOCKET"})
    @Regra("PT-007")
    @DisplayName("Compra fora da loja: rever (a validar A-14)")
    void compraForaDaLojaFicaEmRevisao(CanalCompra canal) {
      Decisao decisao = avaliar(ajuste(5).canal(canal)).decisao();

      assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.REVER);
      assertThat(decisao.getTipoTransacao()).isNotEqualTo(TipoTransacao.AJUSTE_PRECO);
    }

    @Test
    @Regra("PT-008")
    void apos14DiasERecusado() {
      ResultadoAvaliacao resultado = avaliar(ajuste(15));

      assertThat(resultado.decisao().getElegibilidade()).isEqualTo(Elegibilidade.RECUSAR);
      assertThat(resultado.disparos()).contains("PT-008").doesNotContain("PT-007");
    }

    @Test
    @Regra("PT-008")
    @DisplayName("Fotografia do recibo não é o recibo original (a validar A-14)")
    void fotografiaDoReciboERecusada() {
      ResultadoAvaliacao resultado =
          avaliar(ajuste(13).comprovativo(TipoComprovativo.FOTOGRAFIA_RECIBO, false));

      assertThat(resultado.decisao().getElegibilidade()).isEqualTo(Elegibilidade.RECUSAR);
      assertThat(resultado.decisao().getRegistos().getLast().getMensagem())
          .contains("sem o recibo original");
      assertThat(resultado.disparos()).doesNotContain("PT-007");
    }

    @Test
    @Regra("PT-008")
    void semComprovativoERecusado() {
      assertThat(avaliar(ajuste(3).semComprovativo()).decisao().getElegibilidade())
          .isEqualTo(Elegibilidade.RECUSAR);
    }
  }
}

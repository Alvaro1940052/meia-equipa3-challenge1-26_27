package com.levis.devolucoes.regras;

import static com.levis.devolucoes.model.teste.PedidoBuilder.umPedido;
import static org.assertj.core.api.Assertions.assertThat;

import com.levis.devolucoes.model.decisao.Decisao;
import com.levis.devolucoes.model.enums.CanalCompra;
import com.levis.devolucoes.model.enums.CondicaoUso;
import com.levis.devolucoes.model.enums.Elegibilidade;
import com.levis.devolucoes.model.enums.MeioPagamento;
import com.levis.devolucoes.model.enums.MeioReembolso;
import com.levis.devolucoes.model.enums.Mercado;
import com.levis.devolucoes.model.enums.NivelAprovacao;
import com.levis.devolucoes.model.enums.ProcessoObrigatorio;
import com.levis.devolucoes.model.enums.TipoComprovativo;
import com.levis.devolucoes.model.enums.TipoLoja;
import com.levis.devolucoes.model.enums.TipoPedido;
import com.levis.devolucoes.model.enums.TipoTransacao;
import com.levis.devolucoes.model.enums.TipoVerificacao;
import com.levis.devolucoes.model.pedido.PedidoExcecao;
import com.levis.devolucoes.model.teste.PedidoBuilder;
import com.levis.devolucoes.regras.suporte.MotorTeste;
import com.levis.devolucoes.regras.suporte.Regra;
import com.levis.devolucoes.regras.suporte.ResultadoAvaliacao;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

/** Caminho online: levi.com e levi.ca devolvidos na loja. */
class CaminhoOnlineTest {

  /** Encomenda levi.com encontrada, enviada há 10 dias, paga com cartão de crédito. */
  private static PedidoBuilder encomendaOnline() {
    return umPedido()
        .canal(CanalCompra.LEVI_COM)
        .comprovativo(TipoComprovativo.CONFIRMACAO_ENCOMENDA, false)
        .diasDesdeCompra(12)
        .diasDesdeEnvio(10)
        .com(p -> p.getCompraOriginal().setEncomendaEncontrada(true));
  }

  private static ResultadoAvaliacao avaliar(PedidoBuilder pedido) {
    return MotorTeste.avaliar(pedido.construir());
  }

  private static PedidoExcecao excecao(boolean meioProibido) {
    PedidoExcecao excecao = new PedidoExcecao();
    excecao.setMotivo("Quer cartão de oferta");
    excecao.setExigeMeioProibido(meioProibido);
    return excecao;
  }

  @Nested
  class EncomendaEncontrada {

    @ParameterizedTest
    @EnumSource(
        value = CanalCompra.class,
        names = {"LEVI_COM", "LEVI_CA"})
    @Regra("CH-002")
    void encaminhaParaABackPocketNoMeioOriginal(CanalCompra canal) {
      Decisao decisao = avaliar(encomendaOnline().canal(canal)).decisao();

      assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.ENCAMINHAR);
      assertThat(decisao.getProcesso()).isEqualTo(ProcessoObrigatorio.BACKPOCKET);
      assertThat(decisao.getTipoVerificacao()).isEqualTo(TipoVerificacao.VERIFICADA);
      assertThat(decisao.getTipoTransacao()).isEqualTo(TipoTransacao.REEMBOLSO);
      assertThat(decisao.getMeioReembolso()).isEqualTo(MeioReembolso.MEIO_ORIGINAL);
      assertThat(decisao.isTerminal()).isFalse();
    }

    @Test
    @Regra("CH-002")
    void clienteNosEuaPodePedirCartaoDeOfertaEletronico() {
      ResultadoAvaliacao eua = avaliar(encomendaOnline());
      ResultadoAvaliacao canada =
          avaliar(
              encomendaOnline().loja(Mercado.CANADA, TipoLoja.MAINLINE).canal(CanalCompra.LEVI_CA));

      assertThat(eua.registo("CH-002").getMensagem()).contains("cartão de oferta eletrónico");
      assertThat(canada.registo("CH-002").getMensagem())
          .doesNotContain("cartão de oferta eletrónico");
    }

    @Test
    @Regra({"CH-002", "PC-005"})
    void semArtigosElegiveisNaoEncaminha() {
      ResultadoAvaliacao resultado =
          avaliar(encomendaOnline().artigo(a -> a.getEstado().setCondicaoUso(CondicaoUso.LAVADO)));

      assertThat(resultado.disparos()).doesNotContain("CH-002");
    }

    @Test
    @Regra("CH-004")
    @DisplayName("Encomenda encontrada com o portal indisponível: rever (a validar A-04)")
    void portalIndisponivelComEncomendaEncontradaFicaEmRevisao() {
      ResultadoAvaliacao resultado =
          avaliar(encomendaOnline().com(p -> p.setPortalOnlineDisponivel(false)));

      assertThat(resultado.decisao().getElegibilidade()).isEqualTo(Elegibilidade.REVER);
      assertThat(resultado.decisao().getAprovacao()).isEqualTo(NivelAprovacao.RESPONSAVEL_SENIOR);
      assertThat(resultado.decisao().getMeioReembolso()).isNull();
      assertThat(resultado.disparos()).doesNotContain("CH-002");
    }
  }

  @Nested
  class Afterpay {

    @Test
    @Regra("TN-010")
    void reembolsoNaBackPocketParaAAfterpay() {
      ResultadoAvaliacao resultado = avaliar(encomendaOnline().pagamento(MeioPagamento.AFTERPAY));

      assertThat(resultado.disparos()).containsSequence("CH-002", "TN-010");
      assertThat(resultado.decisao().getTipoTransacao()).isEqualTo(TipoTransacao.REEMBOLSO);
      assertThat(resultado.decisao().getMeioReembolso()).isEqualTo(MeioReembolso.MEIO_ORIGINAL);
      assertThat(resultado.decisao().isExcecaoRecusada()).isFalse();
    }

    @Test
    @Regra({"HS-005", "TN-010", "CH-006"})
    @DisplayName("TN-010 e HS-005 prevalecem sobre CH-006: troca Afterpay recusada")
    void trocaComAfterpayERecusada() {
      ResultadoAvaliacao resultado =
          avaliar(encomendaOnline().tipo(TipoPedido.TROCA).pagamento(MeioPagamento.AFTERPAY));

      assertThat(resultado.disparos()).contains("TN-010", "HS-005").doesNotContain("CH-006");
      assertThat(resultado.decisao().isExcecaoRecusada()).isTrue();
      assertThat(resultado.decisao().getTipoTransacao()).isEqualTo(TipoTransacao.REEMBOLSO);
      assertThat(resultado.decisao().getElegibilidade()).isEqualTo(Elegibilidade.ENCAMINHAR);
      assertThat(resultado.decisao().isTerminal()).isFalse();
    }

    @Test
    @Regra("HS-005")
    void pedidoDeOutroMeioComAfterpayERecusado() {
      ResultadoAvaliacao resultado =
          avaliar(
              encomendaOnline()
                  .pagamento(MeioPagamento.AFTERPAY)
                  .com(p -> p.setPedidoExcecao(excecao(true))));

      assertThat(resultado.disparos()).contains("HS-005");
      assertThat(resultado.registo("HS-005").getResultado()).isEqualTo(Elegibilidade.RECUSAR);
    }

    @Test
    @Regra("HS-005")
    void semPedidoDeExcecaoNaoDispara() {
      assertThat(avaliar(encomendaOnline().pagamento(MeioPagamento.AFTERPAY)).disparos())
          .doesNotContain("HS-005");
    }

    @Test
    @Regra({"CH-005", "TN-010"})
    void afterpayTardioContinuaNaAfterpay() {
      ResultadoAvaliacao resultado =
          avaliar(encomendaOnline().diasDesdeEnvio(40).pagamento(MeioPagamento.AFTERPAY));

      assertThat(resultado.disparos()).contains("TN-010").doesNotContain("CH-005");
      assertThat(resultado.decisao().getMeioReembolso()).isEqualTo(MeioReembolso.MEIO_ORIGINAL);
    }
  }

  @Nested
  class PrazoETroca {

    @Test
    @Regra("CH-005")
    void enviadaHaMaisDe30DiasRecebeCartaoDeOferta() {
      Decisao decisao = avaliar(encomendaOnline().diasDesdeEnvio(31)).decisao();

      assertThat(decisao.getMeioReembolso()).isEqualTo(MeioReembolso.CARTAO_OFERTA);
      assertThat(decisao.getTipoTransacao()).isEqualTo(TipoTransacao.REEMBOLSO);
    }

    @Test
    @Regra("CH-005")
    void ate30DiasNaoDispara() {
      assertThat(avaliar(encomendaOnline().diasDesdeEnvio(30)).disparos()).doesNotContain("CH-005");
    }

    @ParameterizedTest
    @EnumSource(
        value = MeioPagamento.class,
        names = {"PAYPAL", "VENMO"})
    @Regra("CH-005")
    @DisplayName(
        "PayPal e Venmo tardios não recebem cartão de oferta: TN-008 prevalece (a validar A-05)")
    void paypalEVenmoNaoRecebemCartaoDeOferta(MeioPagamento meio) {
      ResultadoAvaliacao resultado = avaliar(encomendaOnline().diasDesdeEnvio(37).pagamento(meio));

      assertThat(resultado.disparos()).doesNotContain("CH-005");
    }

    @Test
    @Regra("CH-006")
    void trocaOnlineComSaldoNoMeioOriginal() {
      Decisao decisao = avaliar(encomendaOnline().tipo(TipoPedido.TROCA)).decisao();

      assertThat(decisao.getTipoTransacao()).isEqualTo(TipoTransacao.TROCA);
      assertThat(decisao.getMeioReembolso()).isEqualTo(MeioReembolso.MEIO_ORIGINAL);
    }

    @Test
    @Regra({"CH-006", "CH-005"})
    @DisplayName("Troca online tardia segue CH-005, pela ordem de docs/03 (a validar A-06)")
    void trocaTardiaRecebeCartaoDeOferta() {
      ResultadoAvaliacao resultado =
          avaliar(encomendaOnline().tipo(TipoPedido.TROCA).diasDesdeEnvio(35));

      assertThat(resultado.disparos()).contains("CH-005").doesNotContain("CH-006");
    }
  }

  @Nested
  class EncomendaNaoEncontrada {

    private PedidoBuilder naoEncontrada(boolean politicaPermite) {
      return encomendaOnline()
          .com(
              p -> {
                p.getCompraOriginal().setEncomendaEncontrada(false);
                p.setPoliticaPermiteAsCegasOnline(politicaPermite);
              });
    }

    @Test
    @Regra("CH-003")
    void asCegasPermitidaComCartaoDeOferta() {
      Decisao decisao = avaliar(naoEncontrada(true)).decisao();

      assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.PERMITIR);
      assertThat(decisao.getTipoVerificacao()).isEqualTo(TipoVerificacao.AS_CEGAS);
      assertThat(decisao.getMeioReembolso()).isEqualTo(MeioReembolso.CARTAO_OFERTA);
    }

    @Test
    @Regra("CH-003")
    @DisplayName("Sem cenário da política que o permita: recusar (a validar A-03)")
    void asCegasNaoPermitidaERecusada() {
      Decisao decisao = avaliar(naoEncontrada(false)).decisao();

      assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.RECUSAR);
      assertThat(decisao.getTipoTransacao()).isEqualTo(TipoTransacao.NENHUMA);
    }

    @Test
    @Regra({"CH-004", "CH-003"})
    @DisplayName("CH-004 substitui o meio predefinido de CH-003")
    void portalIndisponivelReembolsaNoMeioOriginal() {
      ResultadoAvaliacao resultado =
          avaliar(naoEncontrada(true).com(p -> p.setPortalOnlineDisponivel(false)));

      assertThat(resultado.disparos()).containsSequence("CH-003", "CH-004");
      assertThat(resultado.decisao().getMeioReembolso()).isEqualTo(MeioReembolso.MEIO_ORIGINAL);
      assertThat(resultado.decisao().getElegibilidade()).isEqualTo(Elegibilidade.PERMITIR);
    }

    @Test
    @Regra("CH-004")
    void portalIndisponivelNaoReverteUmaRecusa() {
      ResultadoAvaliacao resultado =
          avaliar(naoEncontrada(false).com(p -> p.setPortalOnlineDisponivel(false)));

      assertThat(resultado.disparos()).doesNotContain("CH-004");
      assertThat(resultado.decisao().getElegibilidade()).isEqualTo(Elegibilidade.RECUSAR);
    }
  }
}

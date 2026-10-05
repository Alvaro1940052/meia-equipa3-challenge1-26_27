package com.levis.devolucoes.regras;

import static com.levis.devolucoes.model.teste.PedidoBuilder.umPedido;
import static org.assertj.core.api.Assertions.assertThat;

import com.levis.devolucoes.model.decisao.Decisao;
import com.levis.devolucoes.model.enums.CanalCompra;
import com.levis.devolucoes.model.enums.Elegibilidade;
import com.levis.devolucoes.model.enums.EstadoConta;
import com.levis.devolucoes.model.enums.MeioPagamento;
import com.levis.devolucoes.model.enums.MeioReembolso;
import com.levis.devolucoes.model.enums.Mercado;
import com.levis.devolucoes.model.enums.NivelAprovacao;
import com.levis.devolucoes.model.enums.ProcessoObrigatorio;
import com.levis.devolucoes.model.enums.TipoLoja;
import com.levis.devolucoes.model.enums.TipoPedido;
import com.levis.devolucoes.model.enums.TipoTransacao;
import com.levis.devolucoes.model.pedido.PedidoExcecao;
import com.levis.devolucoes.model.produto.ArtigoTroca;
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

/** M7 — Meio de reembolso de uma devolução verificada. */
class MeioReembolsoTest {

  private static ResultadoAvaliacao avaliar(PedidoBuilder pedido) {
    return MotorTeste.avaliar(pedido.construir());
  }

  private static PedidoBuilder pagoCom(MeioPagamento meio) {
    return umPedido().pagamento(meio);
  }

  private static PedidoBuilder conta(MeioPagamento meio, EstadoConta estado, boolean recusado) {
    return pagoCom(meio)
        .com(
            p -> {
              p.getCompraOriginal().getPagamento().setEstadoConta(estado);
              p.getCompraOriginal().getPagamento().setReembolsoOriginalRecusado(recusado);
            });
  }

  private static PedidoBuilder interacNoCanada(boolean cartaoPresente) {
    return pagoCom(MeioPagamento.INTERAC)
        .loja(Mercado.CANADA, TipoLoja.MAINLINE)
        .com(p -> p.getCompraOriginal().getPagamento().setCartaoFisicoPresente(cartaoPresente));
  }

  @Nested
  class Cartoes {

    @ParameterizedTest
    @EnumSource(
        value = MeioPagamento.class,
        names = {"CREDITO", "DEBITO"})
    @Regra("TN-001")
    void reembolsoTokenizadoSemPedirOCartao(MeioPagamento meio) {
      ResultadoAvaliacao resultado = avaliar(pagoCom(meio));

      assertThat(resultado.disparos()).contains("TN-001");
      assertThat(resultado.decisao().getMeioReembolso()).isEqualTo(MeioReembolso.MEIO_ORIGINAL);
      assertThat(resultado.registo("TN-001").getMensagem()).contains("sem pedir ao cliente");
    }

    @Test
    @Regra("TN-001")
    void devolucaoAsCegasNaoUsaRegrasTn() {
      assertThat(avaliar(umPedido().semComprovativo()).disparos()).doesNotContain("TN-001");
    }

    @Test
    @Regra("TN-002")
    void cartaoPerdidoComContaAtivaReembolsaAConta() {
      ResultadoAvaliacao resultado =
          avaliar(conta(MeioPagamento.CREDITO, EstadoConta.ATIVA_CARTAO_PERDIDO, false));

      assertThat(resultado.disparos()).containsSequence("TN-001", "TN-002");
      assertThat(resultado.decisao().getMeioReembolso()).isEqualTo(MeioReembolso.MEIO_ORIGINAL);
    }

    @Test
    @Regra("TN-003")
    void contaEncerradaTentaPrimeiroOCartaoOriginal() {
      ResultadoAvaliacao resultado =
          avaliar(conta(MeioPagamento.CREDITO, EstadoConta.ENCERRADA, false));

      assertThat(resultado.disparos()).contains("TN-003");
      assertThat(resultado.decisao().getMeioReembolso()).isEqualTo(MeioReembolso.MEIO_ORIGINAL);
    }

    @Test
    @Regra("TN-003")
    void contaEncerradaComRecusaPermiteMeioAlternativo() {
      ResultadoAvaliacao resultado =
          avaliar(conta(MeioPagamento.CREDITO, EstadoConta.ENCERRADA, true));

      assertThat(resultado.decisao().getMeioReembolso()).isEqualTo(MeioReembolso.MEIO_ALTERNATIVO);
    }

    @Test
    @Regra("TN-004")
    void debitoNaoRecebeNumerarioAntesDaRecusa() {
      ResultadoAvaliacao resultado = avaliar(pagoCom(MeioPagamento.DEBITO));

      assertThat(resultado.disparos()).contains("TN-004");
      assertThat(resultado.registo("TN-004").getMensagem()).contains("não emitir numerário");
    }

    @Test
    @Regra({"TN-004", "TN-003"})
    void debitoComContaEncerradaERecusaJaPodeTerMeioAlternativo() {
      ResultadoAvaliacao resultado =
          avaliar(conta(MeioPagamento.DEBITO, EstadoConta.ENCERRADA, true));

      assertThat(resultado.disparos()).contains("TN-003").doesNotContain("TN-004");
      assertThat(resultado.decisao().getMeioReembolso()).isEqualTo(MeioReembolso.MEIO_ALTERNATIVO);
    }

    @ParameterizedTest
    @EnumSource(
        value = MeioPagamento.class,
        names = {"APPLE_PAY", "GOOGLE_PAY"})
    @Regra("TN-005")
    void contactlessReembolsaACartaoOuContaAssociada(MeioPagamento meio) {
      ResultadoAvaliacao resultado = avaliar(pagoCom(meio));

      assertThat(resultado.disparos()).contains("TN-005").doesNotContain("TN-001");
    }
  }

  @Nested
  class TrocaEOferta {

    @Test
    @Regra("TN-006")
    void trocaParcialReembolsaOSaldoNoCartaoOriginal() {
      ArtigoTroca novo = new ArtigoTroca();
      novo.setProduto(PedidoBuilder.artigo("NOVO").getProduto());
      novo.setApenasMudaTamanho(false);
      novo.setPrecoVenda(new BigDecimal("60.00"));

      ResultadoAvaliacao resultado =
          avaliar(umPedido().tipo(TipoPedido.TROCA).com(p -> p.getArtigosTroca().add(novo)));

      assertThat(resultado.disparos()).contains("EP-002", "TN-006");
      assertThat(resultado.registo("TN-006").getMensagem()).contains("38.00");
    }

    @Test
    @Regra("TN-006")
    void trocaSemSaldoNaoReembolsa() {
      ArtigoTroca novo = new ArtigoTroca();
      novo.setProduto(PedidoBuilder.artigo("NOVO").getProduto());
      novo.setPrecoVenda(new BigDecimal("128.00"));

      ResultadoAvaliacao resultado =
          avaliar(umPedido().tipo(TipoPedido.TROCA).com(p -> p.getArtigosTroca().add(novo)));

      assertThat(resultado.disparos()).doesNotContain("TN-006");
    }

    @Test
    @Regra("TN-007")
    void ofertaComReciboReembolsaOCartaoDoComprador() {
      ResultadoAvaliacao resultado = avaliar(umPedido().tipo(TipoPedido.DEVOLUCAO_OFERTA));

      assertThat(resultado.disparos()).contains("TN-007").doesNotContain("TN-001");
      assertThat(resultado.decisao().getMeioReembolso()).isEqualTo(MeioReembolso.MEIO_ORIGINAL);
    }

    @Test
    @Regra("TN-007")
    @DisplayName("O destinatário da oferta pode escolher crédito de loja (a validar A-12)")
    void ofertaComEscolhaDeCreditoDeLoja() {
      PedidoExcecao escolha = new PedidoExcecao();
      escolha.setResolucaoPedida(TipoTransacao.CREDITO_LOJA);

      Decisao decisao =
          avaliar(
                  umPedido()
                      .tipo(TipoPedido.DEVOLUCAO_OFERTA)
                      .com(p -> p.setPedidoExcecao(escolha)))
              .decisao();

      assertThat(decisao.getTipoTransacao()).isEqualTo(TipoTransacao.CREDITO_LOJA);
      assertThat(decisao.getMeioReembolso()).isEqualTo(MeioReembolso.CREDITO_LOJA);
    }
  }

  @Nested
  class ProcessosObrigatorios {

    @ParameterizedTest
    @EnumSource(
        value = MeioPagamento.class,
        names = {"PAYPAL", "VENMO"})
    @Regra("TN-008")
    void paypalEVenmoPeloFluxoDaAplicacao(MeioPagamento meio) {
      Decisao decisao = avaliar(pagoCom(meio)).decisao();

      assertThat(decisao.getMeioReembolso()).isEqualTo(MeioReembolso.APLICACAO_PAGAMENTO);
      assertThat(decisao.getProcesso()).isEqualTo(ProcessoObrigatorio.PAYPAL_VENMO);
      assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.PERMITIR);
    }

    @Test
    @Regra("TN-008")
    @DisplayName("Sem acesso à aplicação: não substituir o meio, rever (a validar A-05)")
    void semAcessoAAplicacaoFicaEmRevisao() {
      Decisao decisao =
          avaliar(
                  pagoCom(MeioPagamento.PAYPAL)
                      .com(
                          p ->
                              p.getCompraOriginal()
                                  .getPagamento()
                                  .setAcessoAplicacaoPagamento(false)))
              .decisao();

      assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.REVER);
      assertThat(decisao.getMeioReembolso()).isEqualTo(MeioReembolso.APLICACAO_PAGAMENTO);
      assertThat(decisao.getAprovacao()).isEqualTo(NivelAprovacao.RESPONSAVEL_SENIOR);
    }

    @Test
    @Regra("TN-009")
    void afterpayEmLojaDevolveTudoAAfterpay() {
      ResultadoAvaliacao resultado = avaliar(pagoCom(MeioPagamento.AFTERPAY));

      assertThat(resultado.decisao().getProcesso()).isEqualTo(ProcessoObrigatorio.AFTERPAY);
      assertThat(resultado.registo("TN-009").getMensagem()).contains("recibo de devolução do POS");
    }

    @Test
    @Regra("TN-011")
    void interacNoCanadaComOMesmoCartao() {
      ResultadoAvaliacao resultado = avaliar(interacNoCanada(true));

      assertThat(resultado.disparos()).contains("TN-011").doesNotContain("TN-001", "TN-004");
      assertThat(resultado.decisao().getElegibilidade()).isEqualTo(Elegibilidade.PERMITIR);
      assertThat(resultado.decisao().getMeioReembolso()).isEqualTo(MeioReembolso.MEIO_ORIGINAL);
    }

    @Test
    @Regra("TN-011")
    @DisplayName("Interac sem o mesmo cartão físico: não processar, rever (a validar A-10)")
    void interacSemOMesmoCartaoFicaEmRevisao() {
      Decisao decisao = avaliar(interacNoCanada(false)).decisao();

      assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.REVER);
      assertThat(decisao.getMeioReembolso()).isNull();
      assertThat(decisao.getAprovacao()).isEqualTo(NivelAprovacao.RESPONSAVEL_SENIOR);
    }

    @Test
    @Regra({"TN-012", "TN-011"})
    void interacEmCompraBackPocketUsaAVeriFone() {
      ResultadoAvaliacao resultado = avaliar(interacNoCanada(true).canal(CanalCompra.BACKPOCKET));

      assertThat(resultado.disparos()).containsSubsequence("TN-011", "TN-012");
      assertThat(resultado.decisao().getProcesso()).isEqualTo(ProcessoObrigatorio.VERIFONE_INTERAC);
      assertThat(resultado.registo("TN-012").getMensagem()).contains("valor exato", "98.00");
    }

    @Test
    @Regra("TN-012")
    void interacBackPocketSemCartaoNaoUsaAVeriFone() {
      ResultadoAvaliacao resultado = avaliar(interacNoCanada(false).canal(CanalCompra.BACKPOCKET));

      assertThat(resultado.disparos()).doesNotContain("TN-012");
    }

    @ParameterizedTest
    @EnumSource(
        value = MeioPagamento.class,
        names = {"NUMERARIO", "CARTAO_OFERTA"})
    @Regra("OUT-004")
    @DisplayName("Numerário e cartão de oferta: meio original (a validar A-09)")
    void numerarioECartaoDeOfertaNoMeioOriginal(MeioPagamento meio) {
      ResultadoAvaliacao resultado = avaliar(pagoCom(meio));

      assertThat(resultado.disparos()).contains("OUT-004");
      assertThat(resultado.decisao().getMeioReembolso()).isEqualTo(MeioReembolso.MEIO_ORIGINAL);
    }
  }
}

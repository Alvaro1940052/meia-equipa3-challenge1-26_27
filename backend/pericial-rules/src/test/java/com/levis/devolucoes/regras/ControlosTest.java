package com.levis.devolucoes.regras;

import static com.levis.devolucoes.model.teste.PedidoBuilder.umPedido;
import static org.assertj.core.api.Assertions.assertThat;

import com.levis.devolucoes.model.decisao.Documentacao;
import com.levis.devolucoes.model.enums.CanalCompra;
import com.levis.devolucoes.model.enums.EstadoEtiquetas;
import com.levis.devolucoes.model.enums.Funcao;
import com.levis.devolucoes.model.enums.NivelAprovacao;
import com.levis.devolucoes.model.enums.TipoComprovativo;
import com.levis.devolucoes.model.enums.TipoPedido;
import com.levis.devolucoes.model.pedido.Colaborador;
import com.levis.devolucoes.model.pedido.PedidoExcecao;
import com.levis.devolucoes.model.teste.PedidoBuilder;
import com.levis.devolucoes.regras.suporte.MotorTeste;
import com.levis.devolucoes.regras.suporte.Regra;
import com.levis.devolucoes.regras.suporte.ResultadoAvaliacao;
import java.time.LocalDate;
import java.util.function.Consumer;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

/** M8 — Controlos de autorização, conclusão e documentação. */
class ControlosTest {

  private static ResultadoAvaliacao avaliar(PedidoBuilder pedido) {
    return MotorTeste.avaliar(pedido.construir());
  }

  private static Documentacao documentacao(PedidoBuilder pedido) {
    return avaliar(pedido).decisao().getDocumentacao();
  }

  private static PedidoBuilder comExcecao(Consumer<PedidoExcecao> alteracao) {
    PedidoExcecao excecao = new PedidoExcecao();
    excecao.setMotivo("Cliente de longa data");
    excecao.setPreocupacaoCliente("Viagem marcada");
    alteracao.accept(excecao);
    return umPedido().com(p -> p.setPedidoExcecao(excecao));
  }

  @Nested
  class Autorizacao {

    @Test
    @Regra("CT-001")
    void devolucaoVerificadaPorPessoalAutorizado() {
      ResultadoAvaliacao resultado = avaliar(umPedido());

      assertThat(resultado.disparos()).contains("CT-001");
      assertThat(resultado.registo("CT-001").getMensagem()).contains("KEY_HOLDER");
    }

    @Test
    @Regra("CT-001")
    void transacaoRecusadaNaoTemControlos() {
      ResultadoAvaliacao resultado =
          avaliar(umPedido().tipo(TipoPedido.AJUSTE_PRECO).diasDesdeCompra(30));

      assertThat(resultado.disparos()).doesNotContain("CT-001", "CT-005", "CT-007");
    }

    @ParameterizedTest
    @EnumSource(
        value = Funcao.class,
        names = {"LEAD_CASHIER", "ELEVATED_STYLIST"})
    @Regra("CT-002")
    void asCegasPorLeadCashierOuElevatedStylistExigeXstoreManager(Funcao funcao) {
      ResultadoAvaliacao resultado = avaliar(umPedido().funcao(funcao, true).semComprovativo());

      assertThat(resultado.decisao().getAprovacao()).isEqualTo(NivelAprovacao.XSTORE_MANAGER);
      assertThat(resultado.disparos()).contains("CT-002").doesNotContain("CT-001");
    }

    @Test
    @Regra("CT-002")
    void asCegasPorKeyHolderNaoExigeXstoreManager() {
      ResultadoAvaliacao resultado = avaliar(umPedido().semComprovativo());

      assertThat(resultado.disparos()).doesNotContain("CT-002");
      assertThat(resultado.decisao().getAprovacao()).isEqualTo(NivelAprovacao.NENHUMA);
    }

    @Test
    @Regra({"CT-002", "EX-001"})
    void naoBaixaUmaAprovacaoMaisAlta() {
      ResultadoAvaliacao resultado =
          avaliar(
              umPedido()
                  .funcao(Funcao.LEAD_CASHIER, true)
                  .semComprovativo()
                  .artigo(a -> a.getEstado().setEtiquetas(EstadoEtiquetas.SOLTAS)));

      assertThat(resultado.disparos()).contains("EX-001", "CT-002");
      assertThat(resultado.decisao().getAprovacao()).isEqualTo(NivelAprovacao.RESPONSAVEL_SENIOR);
    }
  }

  @Nested
  class Documentos {

    @Test
    @Regra("CT-004")
    void atribuiAoStylistDaVendaOriginal() {
      assertThat(documentacao(umPedido()).getIdStylistAtribuido()).isEqualTo("S-7");
    }

    @Test
    @Regra("CT-004")
    void devolucaoAsCegasNaoEAtribuida() {
      assertThat(documentacao(umPedido().semComprovativo()).getIdStylistAtribuido()).isNull();
    }

    @Test
    @Regra("CT-005")
    void tresAssinaturas() {
      Documentacao doc = documentacao(umPedido());

      assertThat(doc.getAssinaturaCliente()).contains("Recusado");
      assertThat(doc.getAssinaturaProcessador()).contains("C-1");
      assertThat(doc.getAssinaturaTestemunha()).isEqualTo("Assinatura da testemunha");
    }

    @Test
    @Regra("CT-005")
    void coberturaDeLojaUnicaUsaSsc() {
      Documentacao doc = documentacao(umPedido().com(p -> p.getLoja().setCoberturaLojaUnica(true)));

      assertThat(doc.getAssinaturaTestemunha()).isEqualTo("SSC");
    }

    @Test
    @Regra("CT-006")
    void reciboOriginalEAgrafado() {
      Documentacao doc = documentacao(umPedido());

      assertThat(doc.isReciboAgrafado()).isTrue();
      assertThat(doc.getNotaRecibo()).isNull();
    }

    @Test
    @Regra("CT-006")
    void clienteQueMantemOReciboFicaAnotado() {
      Documentacao doc =
          documentacao(umPedido().com(p -> p.getComprovativo().setClienteMantemRecibo(true)));

      assertThat(doc.isReciboAgrafado()).isFalse();
      assertThat(doc.getNotaRecibo()).contains("manteve");
    }

    @Test
    @Regra("CT-006")
    void reciboComOutrosArtigosFicaAnotado() {
      Documentacao doc =
          documentacao(umPedido().com(p -> p.getComprovativo().setIncluiOutrosArtigos(true)));

      assertThat(doc.isReciboAgrafado()).isTrue();
      assertThat(doc.getNotaRecibo()).contains("outros artigos");
    }

    @Test
    @Regra("CT-006")
    void reciboDigitalNaoEAgrafado() {
      ResultadoAvaliacao resultado =
          avaliar(umPedido().comprovativo(TipoComprovativo.RECIBO_DIGITAL, true));

      assertThat(resultado.disparos()).doesNotContain("CT-006");
    }

    @Test
    @Regra("CT-007")
    void retencaoDe90Dias() {
      ResultadoAvaliacao resultado = avaliar(umPedido());

      assertThat(resultado.decisao().getDocumentacao().getRetencaoAte())
          .isEqualTo(LocalDate.of(2026, 6, 29));
      assertThat(resultado.disparos()).containsSubsequence("CT-005", "CT-007");
    }

    @Test
    @Regra("CT-007")
    void devolucaoOnlineArquivaComOsSuportesDiarios() {
      ResultadoAvaliacao resultado =
          avaliar(
              umPedido()
                  .canal(CanalCompra.LEVI_COM)
                  .diasDesdeEnvio(5)
                  .com(p -> p.getCompraOriginal().setEncomendaEncontrada(true)));

      assertThat(resultado.registo("CT-007").getMensagem()).contains("suportes diários");
    }
  }

  @Nested
  class ExcecaoAprovada {

    @Test
    @Regra("EX-007")
    void documentaAExcecaoAprovada() {
      Colaborador aprovador = new Colaborador();
      aprovador.setNome("Ana Gestora");
      aprovador.setFuncao(Funcao.GESTAO_LOJA);

      ResultadoAvaliacao resultado =
          avaliar(
              comExcecao(
                  e -> {
                    e.setAprovada(true);
                    e.setAprovador(aprovador);
                  }));

      String registo = resultado.decisao().getDocumentacao().getRegistoExcecao();
      assertThat(registo)
          .contains(
              "Cliente de longa data", "Ana Gestora", "98.00", "REEMBOLSO", "Viagem marcada", "M9");
      assertThat(resultado.disparos()).containsSubsequence("EX-007", "CT-007");
    }

    @Test
    @Regra("EX-007")
    void excecaoPendenteNaoEDocumentada() {
      assertThat(avaliar(comExcecao(e -> {})).disparos()).doesNotContain("EX-007");
    }

    @Test
    @Regra({"EX-007", "EX-006"})
    void excecaoRecusadaPeloSistemaNaoEDocumentadaComoAprovada() {
      ResultadoAvaliacao resultado =
          avaliar(
              comExcecao(
                      e -> {
                        e.setAprovada(true);
                        e.setExigeMeioProibido(true);
                      })
                  .com(
                      p -> {
                        p.getCliente().setContestaResultado(true);
                        p.getCliente().setAgitado(true);
                      }));

      assertThat(resultado.disparos()).contains("EX-006").doesNotContain("EX-007");
    }
  }
}

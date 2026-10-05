package com.levis.devolucoes.regras.cenarios;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.levis.devolucoes.model.decisao.DecisaoArtigo;
import com.levis.devolucoes.regras.suporte.MotorTeste;
import com.levis.devolucoes.regras.suporte.ResultadoAvaliacao;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.assertj.core.api.SoftAssertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

/**
 * Testes de aceitação: os 10 cenários de docs/06-casos-teste.md. Os resultados esperados são
 * derivados de docs/02 e ficam "a validar" até a operação os confirmar.
 */
class CenariosEsforcoTest {

  static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

  static Stream<Cenario> cenarios() {
    return IntStream.rangeClosed(1, 10).mapToObj(CenariosEsforcoTest::ler);
  }

  static Cenario ler(int numero) {
    String recurso = String.format("/cenarios/cenario-%02d.json", numero);
    try (InputStream entrada = CenariosEsforcoTest.class.getResourceAsStream(recurso)) {
      Objects.requireNonNull(entrada, recurso);
      return JSON.readValue(entrada, Cenario.class);
    } catch (IOException e) {
      throw new UncheckedIOException(recurso, e);
    }
  }

  @Test
  void existemOsDezCenarios() {
    assertThat(cenarios().map(Cenario::id)).containsExactly(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
  }

  @ParameterizedTest(name = "{0}")
  @MethodSource("cenarios")
  void cenarioCumpreOEsperado(Cenario cenario) {
    assertThat(cenario.estado()).isIn("a validar", "validado");
    assertThat(cenario.pedido()).isNotNull();

    ResultadoAvaliacao resultado =
        MotorTeste.avaliar(
            cenario.pedido(),
            cenario.indicadoresFraude() == null ? List.of() : cenario.indicadoresFraude());

    Esperado esperado = cenario.esperado();
    // Fase 4.10: todos os cenários têm a elegibilidade (OUT-001) e as regras que a justificam
    assertThat(esperado).as("esperado").isNotNull();
    assertThat(esperado.elegibilidade()).as("elegibilidade esperada").isNotNull();
    assertThat(esperado.regrasDisparadas()).as("regras esperadas").isNotEmpty();

    SoftAssertions verificacao = new SoftAssertions();
    var d = resultado.decisao();
    comparar(verificacao, "elegibilidade", esperado.elegibilidade(), d.getElegibilidade());
    comparar(verificacao, "tipoVerificacao", esperado.tipoVerificacao(), d.getTipoVerificacao());
    comparar(verificacao, "tipoTransacao", esperado.tipoTransacao(), d.getTipoTransacao());
    comparar(verificacao, "baseValor", esperado.baseValor(), d.getBaseValor());
    comparar(verificacao, "meioReembolso", esperado.meioReembolso(), d.getMeioReembolso());
    comparar(verificacao, "aprovacao", esperado.aprovacao(), d.getAprovacao());
    comparar(verificacao, "processo", esperado.processo(), d.getProcesso());
    comparar(verificacao, "terminal", esperado.terminal(), d.isTerminal());
    comparar(verificacao, "excecaoRecusada", esperado.excecaoRecusada(), d.isExcecaoRecusada());
    if (esperado.documentacao() != null) {
      var doc = esperado.documentacao();
      var obtida = d.getDocumentacao();
      comparar(
          verificacao, "doc.idStylist", doc.idStylistAtribuido(), obtida.getIdStylistAtribuido());
      comparar(verificacao, "doc.reciboAgrafado", doc.reciboAgrafado(), obtida.isReciboAgrafado());
      comparar(
          verificacao,
          "doc.testemunha",
          doc.assinaturaTestemunha(),
          obtida.getAssinaturaTestemunha());
      comparar(verificacao, "doc.retencaoAte", doc.retencaoAte(), obtida.getRetencaoAte());
    }
    if (esperado.valorDevolucao() != null) {
      verificacao
          .assertThat(d.getValorDevolucao())
          .as("valorDevolucao")
          .isEqualByComparingTo(esperado.valorDevolucao());
    }
    if (esperado.regrasDisparadas() != null) {
      verificacao
          .assertThat(resultado.disparos())
          .as("regras disparadas")
          .containsAll(esperado.regrasDisparadas());
    }
    if (esperado.regrasNaoDisparadas() != null) {
      verificacao
          .assertThat(resultado.disparos())
          .as("regras que não devem disparar")
          .doesNotContainAnyElementsOf(esperado.regrasNaoDisparadas());
    }
    if (esperado.artigos() != null) {
      for (Map.Entry<String, Esperado.Artigo> entrada : esperado.artigos().entrySet()) {
        compararArtigo(verificacao, entrada.getKey(), entrada.getValue(), resultado);
      }
    }
    verificacao.assertAll();
  }

  private static void compararArtigo(
      SoftAssertions verificacao,
      String id,
      Esperado.Artigo esperado,
      ResultadoAvaliacao resultado) {
    DecisaoArtigo artigo = resultado.artigo(id);
    comparar(
        verificacao, id + ".elegibilidade", esperado.elegibilidade(), artigo.getElegibilidade());
    comparar(
        verificacao, id + ".tipoTransacao", esperado.tipoTransacao(), artigo.getTipoTransacao());
    comparar(verificacao, id + ".destino", esperado.destino(), artigo.getDestino());
    comparar(
        verificacao, id + ".descontoSaldo", esperado.descontoSaldo(), artigo.getDescontoSaldo());
    if (esperado.valorDevolucao() != null) {
      verificacao
          .assertThat(artigo.getValorDevolucao())
          .as(id + ".valorDevolucao")
          .isEqualByComparingTo(esperado.valorDevolucao());
    }
    if (esperado.regrasDisparadas() != null) {
      verificacao
          .assertThat(artigo.getRegistos())
          .as(id + ".regras disparadas")
          .extracting(r -> r.getCodigoRegra())
          .containsAll(esperado.regrasDisparadas());
    }
  }

  private static void comparar(
      SoftAssertions verificacao, String campo, Object esperado, Object obtido) {
    if (esperado != null) {
      verificacao.assertThat(obtido).as(campo).isEqualTo(esperado);
    }
  }
}

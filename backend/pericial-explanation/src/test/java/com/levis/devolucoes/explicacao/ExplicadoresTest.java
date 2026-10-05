package com.levis.devolucoes.explicacao;

import static com.levis.devolucoes.explicacao.SuporteExplicacoes.AVALIADOR;
import static com.levis.devolucoes.explicacao.SuporteExplicacoes.CATALOGO;
import static com.levis.devolucoes.explicacao.SuporteExplicacoes.TEXTO;
import static com.levis.devolucoes.explicacao.SuporteExplicacoes.cenario;
import static com.levis.devolucoes.model.teste.PedidoBuilder.umPedido;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.levis.devolucoes.explicacao.como.ExplicacaoComo;
import com.levis.devolucoes.explicacao.como.ExplicadorComo;
import com.levis.devolucoes.explicacao.motor.ResultadoExecucao;
import com.levis.devolucoes.explicacao.porque.CampoSaida;
import com.levis.devolucoes.explicacao.porque.ExplicacaoPorque;
import com.levis.devolucoes.explicacao.porque.ExplicadorPorque;
import com.levis.devolucoes.explicacao.porquenao.CausaNaoDisparo;
import com.levis.devolucoes.explicacao.porquenao.ExplicacaoPorqueNao;
import com.levis.devolucoes.explicacao.porquenao.ExplicadorPorqueNao;
import com.levis.devolucoes.explicacao.porquenao.ResultadoCondicao;
import com.levis.devolucoes.model.enums.DestinoProduto;
import com.levis.devolucoes.model.enums.Elegibilidade;
import com.levis.devolucoes.model.enums.Marca;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/** Como, Porquê e Porque não, sobre os cenários de docs/06. */
class ExplicadoresTest {

  private final ExplicadorComo como = new ExplicadorComo(CATALOGO, TEXTO);
  private final ExplicadorPorque porque = new ExplicadorPorque(CATALOGO, AVALIADOR, TEXTO);
  private final ExplicadorPorqueNao porqueNao = new ExplicadorPorqueNao(CATALOGO, AVALIADOR, TEXTO);

  @Nested
  class Como {

    @Test
    @DisplayName("Cenário 5: caminho até à paragem obrigatória CH-008")
    void caminhoAteAParagem() {
      ExplicacaoComo explicacao = como.explicar(cenario(5));

      assertThat(explicacao.passos())
          .extracting(p -> p.codigoRegra())
          .containsExactly("CT-003", "CH-008", "EX-002", "OUT-007", "OUT-001");
      assertThat(explicacao.paragem()).isEqualTo("CH-008");
      assertThat(explicacao.modulosPercorridos()).containsExactly("M0", "M2", "M6", "M9");
      assertThat(explicacao.resumo()).contains("5 regras", "4 módulos", "CH-008", "M2");
    }

    @Test
    void passosComArtigoMensagemEAmbiguidade() {
      ExplicacaoComo explicacao = como.explicar(cenario(10));

      assertThat(explicacao.passos())
          .filteredOn(p -> p.codigoRegra().equals("CT-008"))
          .singleElement()
          .satisfies(p -> assertThat(p.artigoId()).isEqualTo("A-1"));
      assertThat(explicacao.passos())
          .filteredOn(p -> p.codigoRegra().equals("CH-004"))
          .singleElement()
          .satisfies(
              p -> {
                assertThat(p.aValidar()).isTrue();
                assertThat(p.resultado()).isEqualTo(Elegibilidade.REVER);
                assertThat(p.mensagem()).contains("portal");
              });
      assertThat(explicacao.paragem()).isNull();
    }
  }

  @Nested
  class Porque {

    @Test
    @DisplayName("Cenário 7: OUT-001 = REVER por TN-011, depois de PT-003")
    void elegibilidadeDefinidaPelaUltimaRegraQueAMudou() {
      ExplicacaoPorque explicacao = porque.explicar(CampoSaida.OUT_001, null, cenario(7));

      assertThat(explicacao.regra()).isEqualTo("TN-011");
      assertThat(explicacao.valores()).containsEntry("elegibilidade", Elegibilidade.REVER);
      assertThat(explicacao.historico()).hasSize(2);
      assertThat(explicacao.historico().getFirst()).startsWith("PT-003");
      assertThat(explicacao.condicoes())
          .extracting(ResultadoCondicao::nome)
          .contains("mercadoCanada", "pagamentoInterac", "cartaoFisicoAusente");
      assertThat(explicacao.condicoes()).allMatch(c -> Boolean.TRUE.equals(c.cumprida()));
      assertThat(explicacao.resumo()).contains("OUT-001", "REVER", "TN-011");
    }

    @Test
    @DisplayName("Cenário 3: OUT-003 = 39.99, com o valor de CH-009 somado por OUT-003")
    void valorDaDevolucao() {
      ExplicacaoPorque explicacao = porque.explicar(CampoSaida.OUT_003, null, cenario(3));

      assertThat(explicacao.regra()).isEqualTo("OUT-003");
      assertThat(explicacao.valores()).containsKeys("valorDevolucao", "baseValor");
    }

    @Test
    @DisplayName("Cenário 9: OUT-007 do artigo = risco biológico por PC-008")
    void destinoDoArtigo() {
      ExplicacaoPorque explicacao = porque.explicar(CampoSaida.OUT_007, "A-1", cenario(9));

      assertThat(explicacao.valores()).containsEntry("destino", DestinoProduto.RISCO_BIOLOGICO);
      assertThat(explicacao.regra()).isEqualTo("PC-008");
      assertThat(explicacao.condicoes())
          .extracting(ResultadoCondicao::nome)
          .contains("artigoSujoOuInseguro");
    }

    @Test
    void documentacaoTemOHistoricoDosControlos() {
      ExplicacaoPorque explicacao = porque.explicar(CampoSaida.OUT_008, null, cenario(9));

      assertThat(explicacao.regra()).isEqualTo("CT-007");
      assertThat(explicacao.historico())
          .anyMatch(h -> h.startsWith("CT-004"))
          .anyMatch(h -> h.startsWith("CT-005"))
          .anyMatch(h -> h.startsWith("CT-006"));
    }

    @Test
    void campoSemRegra() {
      ExplicacaoPorque explicacao = porque.explicar(CampoSaida.OUT_006, null, cenario(1));

      assertThat(explicacao.regra()).isNull();
      assertThat(explicacao.resumo()).contains("nenhuma regra");
    }

    @Test
    void destinoExigeOArtigo() {
      assertThatThrownBy(() -> porque.explicar(CampoSaida.OUT_007, null, cenario(9)))
          .isInstanceOf(IllegalArgumentException.class);
      assertThat(CampoSaida.de("OUT-005")).isEqualTo(CampoSaida.OUT_005);
    }
  }

  @Nested
  class PorqueNao {

    @Test
    @DisplayName("Cenário 5: HS-002 nunca foi avaliada, CH-008 terminou o fluxo em M2")
    void moduloNaoAlcancado() {
      ExplicacaoPorqueNao explicacao = porqueNao.explicar("HS-002", null, cenario(5));

      assertThat(explicacao.causa()).isEqualTo(CausaNaoDisparo.MODULO_NAO_ALCANCADO);
      assertThat(explicacao.regraResponsavel()).isEqualTo("CH-008");
      assertThat(explicacao.resumo()).contains("CH-008", "M2");
    }

    @Test
    @DisplayName("Cenário 6: o fluxo foi suspenso por EX-008")
    void suspensaoPorFraude() {
      ExplicacaoPorqueNao explicacao = porqueNao.explicar("PT-002", null, cenario(6));

      assertThat(explicacao.causa()).isEqualTo(CausaNaoDisparo.MODULO_NAO_ALCANCADO);
      assertThat(explicacao.regraResponsavel()).isEqualTo("EX-008");
    }

    @Test
    @DisplayName("PC-001 ativada e cancelada por HS-002 (marca excluída)")
    void canceladaPorPrecedencia() {
      ResultadoExecucao resultado =
          SuporteExplicacoes.executar(
              umPedido().artigo(a -> a.getProduto().setMarca(Marca.DOCKERS)).construir());

      ExplicacaoPorqueNao explicacao = porqueNao.explicar("PC-001", "A-1", resultado);

      assertThat(explicacao.causa()).isEqualTo(CausaNaoDisparo.CANCELADA_POR_PRECEDENCIA);
      assertThat(explicacao.regraResponsavel()).isEqualTo("HS-002");
    }

    @Test
    @DisplayName("Cenário 4: PC-006 falha porque o produto foi embainhado (HS-003 prevalece)")
    void condicoesFalhadas() {
      ExplicacaoPorqueNao explicacao = porqueNao.explicar("PC-006", "A-1", cenario(4));

      assertThat(explicacao.causa())
          .isIn(CausaNaoDisparo.CONDICOES_FALHADAS, CausaNaoDisparo.CANCELADA_POR_PRECEDENCIA);
      if (explicacao.causa() == CausaNaoDisparo.CONDICOES_FALHADAS) {
        assertThat(explicacao.condicoesFalhadas())
            .extracting(ResultadoCondicao::nome)
            .contains("naoModificado");
        assertThat(explicacao.resumo()).contains("HS-003 prevalece");
      } else {
        assertThat(explicacao.regraResponsavel()).isEqualTo("HS-003");
      }
    }

    @Test
    @DisplayName("Cenário 8: PT-007 falha por falta do recibo original")
    void condicoesFalhadasDoAjuste() {
      ExplicacaoPorqueNao explicacao = porqueNao.explicar("PT-007", null, cenario(8));

      assertThat(explicacao.causa()).isEqualTo(CausaNaoDisparo.CONDICOES_FALHADAS);
      assertThat(explicacao.condicoesFalhadas())
          .extracting(ResultadoCondicao::nome)
          .contains("reciboOriginal");
      assertThat(explicacao.condicoes())
          .filteredOn(c -> c.nome().equals("ate14DiasDesdeCompra"))
          .singleElement()
          .satisfies(c -> assertThat(c.valor()).contains("13"));
    }

    @Test
    void regraQueDisparou() {
      assertThat(porqueNao.explicar("PT-003", null, cenario(7)).causa())
          .isEqualTo(CausaNaoDisparo.DISPAROU);
    }

    @Test
    void regraDesconhecida() {
      assertThatThrownBy(() -> porqueNao.explicar("XX-999", null, cenario(1)))
          .isInstanceOf(IllegalArgumentException.class);
    }
  }
}

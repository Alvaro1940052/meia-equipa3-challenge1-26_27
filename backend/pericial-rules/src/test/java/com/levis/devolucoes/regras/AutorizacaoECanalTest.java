package com.levis.devolucoes.regras;

import static com.levis.devolucoes.model.teste.PedidoBuilder.umPedido;
import static org.assertj.core.api.Assertions.assertThat;

import com.levis.devolucoes.model.enums.CanalCompra;
import com.levis.devolucoes.model.enums.Elegibilidade;
import com.levis.devolucoes.model.enums.Funcao;
import com.levis.devolucoes.model.enums.Mercado;
import com.levis.devolucoes.model.enums.Modulo;
import com.levis.devolucoes.model.enums.ProcessoObrigatorio;
import com.levis.devolucoes.model.enums.TipoLoja;
import com.levis.devolucoes.model.enums.TipoTransacao;
import com.levis.devolucoes.regras.suporte.MotorTeste;
import com.levis.devolucoes.regras.suporte.Regra;
import com.levis.devolucoes.regras.suporte.ResultadoAvaliacao;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.EnumSource;

/** M0 (autorização) e M2 (canal de compra). */
class AutorizacaoECanalTest {

  @Nested
  @Regra("HS-006")
  class ColaboradorNaoAutorizado {

    @ParameterizedTest(name = "{0}, aprovado pelo DM = {1}")
    @CsvSource({"STYLIST,false", "STYLIST,true", "LEAD_CASHIER,false", "ELEVATED_STYLIST,false"})
    void encaminhaETerminaOFluxo(Funcao funcao, boolean aprovadoPeloDm) {
      ResultadoAvaliacao resultado =
          MotorTeste.avaliar(umPedido().funcao(funcao, aprovadoPeloDm).construir());

      assertThat(resultado.decisao().getElegibilidade()).isEqualTo(Elegibilidade.ENCAMINHAR);
      assertThat(resultado.decisao().isTerminal()).isTrue();
      assertThat(resultado.disparos()).containsExactly("HS-006");
      assertThat(resultado.decisao().getRegistos().getFirst().getModulo()).isEqualTo(Modulo.M0);
    }

    @Test
    void semColaboradorIdentificadoEncaminha() {
      ResultadoAvaliacao resultado =
          MotorTeste.avaliar(umPedido().com(p -> p.setColaborador(null)).construir());

      assertThat(resultado.disparos()).containsExactly("HS-006");
    }

    @Test
    @DisplayName("HS-006 é avaliada antes do canal: nem o grossista chega a M2")
    @Regra({"HS-006", "CH-008"})
    void precedeAsRegrasDeCanal() {
      ResultadoAvaliacao resultado =
          MotorTeste.avaliar(
              umPedido().funcao(Funcao.STYLIST, false).canal(CanalCompra.GROSSISTA).construir());

      assertThat(resultado.disparos()).containsExactly("HS-006");
    }

    @ParameterizedTest
    @EnumSource(
        value = Funcao.class,
        names = {"GESTAO_LOJA", "KEY_HOLDER", "XSTORE_MANAGER"})
    @DisplayName("Gestão, Key Holder e XStore Manager não disparam HS-006 (XStore a validar A-23)")
    void funcoesAutorizadasNaoDisparam(Funcao funcao) {
      assertThat(
              MotorTeste.avaliar(umPedido().funcao(funcao, false).construir()).disparou("HS-006"))
          .isFalse();
    }
  }

  @Nested
  @Regra("CT-003")
  class SessaoPropriaNoPos {

    @Test
    void colaboradorAutorizadoConcluiATransacaoComCredencialPropria() {
      ResultadoAvaliacao resultado =
          MotorTeste.avaliar(umPedido().funcao(Funcao.LEAD_CASHIER, true).construir());

      assertThat(resultado.disparos()).contains("CT-003");
      assertThat(resultado.decisao().getRegistos())
          .filteredOn(r -> r.getCodigoRegra().equals("CT-003"))
          .singleElement()
          .satisfies(
              r -> {
                assertThat(r.getMensagem()).contains("POS-C-1");
                assertThat(r.getResultado()).isNull();
              });
      assertThat(resultado.decisao().getElegibilidade()).isNull();
    }

    @Test
    void semCredencialDePosNaoDispara() {
      ResultadoAvaliacao resultado =
          MotorTeste.avaliar(
              umPedido().com(p -> p.getColaborador().setIdCredencialPOS(null)).construir());

      assertThat(resultado.disparou("CT-003")).isFalse();
    }

    @Test
    void disparaUmaSoVez() {
      ResultadoAvaliacao resultado = MotorTeste.avaliar(umPedido().construir());
      assertThat(resultado.disparos()).containsOnlyOnce("CT-003");
    }
  }

  @Nested
  @Regra("CH-008")
  class Grossista {

    @Test
    void recusaETerminaOFluxo() {
      ResultadoAvaliacao resultado =
          MotorTeste.avaliar(umPedido().canal(CanalCompra.GROSSISTA).construir());

      assertThat(resultado.decisao().getElegibilidade()).isEqualTo(Elegibilidade.RECUSAR);
      assertThat(resultado.decisao().getTipoTransacao()).isEqualTo(TipoTransacao.NENHUMA);
      assertThat(resultado.decisao().isTerminal()).isTrue();
      assertThat(resultado.disparos()).containsExactly("CT-003", "CH-008");
    }
  }

  @Nested
  @Regra("CH-007")
  class FranquiaCanada {

    @ParameterizedTest
    @EnumSource(Mercado.class)
    @DisplayName("Encaminha para o processo da franquia em qualquer mercado (a validar A-07)")
    void encaminhaParaOProcessoDaFranquia(Mercado mercado) {
      ResultadoAvaliacao resultado =
          MotorTeste.avaliar(
              umPedido()
                  .loja(mercado, TipoLoja.MAINLINE)
                  .canal(CanalCompra.FRANQUIA_CANADA)
                  .construir());

      assertThat(resultado.decisao().getElegibilidade()).isEqualTo(Elegibilidade.ENCAMINHAR);
      assertThat(resultado.decisao().getProcesso()).isEqualTo(ProcessoObrigatorio.FRANQUIA_CANADA);
      assertThat(resultado.decisao().isTerminal()).isTrue();
      assertThat(resultado.disparos()).containsExactly("CT-003", "CH-007");
    }
  }

  @Nested
  @Regra("CH-001")
  class CompraEmLoja {

    @ParameterizedTest
    @EnumSource(
        value = CanalCompra.class,
        names = {"MAINLINE", "OUTLET"})
    void aplicaAsRegrasDaLojaRecetoraSemDecidir(CanalCompra canal) {
      ResultadoAvaliacao resultado = MotorTeste.avaliar(umPedido().canal(canal).construir());

      assertThat(resultado.disparos()).containsExactly("CT-003", "CH-001");
      assertThat(resultado.decisao().getElegibilidade()).isNull();
      assertThat(resultado.decisao().isTerminal()).isFalse();
    }

    @ParameterizedTest
    @EnumSource(
        value = CanalCompra.class,
        names = {"LEVI_COM", "LEVI_CA", "BACKPOCKET", "DESCONHECIDO"})
    void naoDisparaParaOutrosCanais(CanalCompra canal) {
      assertThat(MotorTeste.avaliar(umPedido().canal(canal).construir()).disparou("CH-001"))
          .isFalse();
    }
  }

  @Nested
  @Regra("IN-003")
  class CanalDesconhecido {

    @Test
    @DisplayName("Prossegue para M3; o comprovativo decide em M4 (a validar A-01)")
    void prossegueSemDecidir() {
      ResultadoAvaliacao resultado =
          MotorTeste.avaliar(umPedido().canal(CanalCompra.DESCONHECIDO).construir());

      assertThat(resultado.disparos()).containsExactly("CT-003", "IN-003");
      assertThat(resultado.decisao().getElegibilidade()).isNull();
      assertThat(resultado.decisao().isTerminal()).isFalse();
    }
  }
}

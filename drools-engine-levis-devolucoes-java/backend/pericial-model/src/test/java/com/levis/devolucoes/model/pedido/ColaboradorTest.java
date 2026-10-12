package com.levis.devolucoes.model.pedido;

import static org.assertj.core.api.Assertions.assertThat;

import com.levis.devolucoes.model.enums.Funcao;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

/** HS-006: quem pode processar devoluções ou trocas. */
class ColaboradorTest {

  static Stream<Arguments> casos() {
    return Stream.of(
        Arguments.of(Funcao.GESTAO_LOJA, false, true),
        Arguments.of(Funcao.KEY_HOLDER, false, true),
        Arguments.of(Funcao.LEAD_CASHIER, true, true),
        Arguments.of(Funcao.LEAD_CASHIER, false, false),
        Arguments.of(Funcao.ELEVATED_STYLIST, true, true),
        Arguments.of(Funcao.ELEVATED_STYLIST, false, false),
        Arguments.of(Funcao.STYLIST, true, false),
        Arguments.of(Funcao.STYLIST, false, false));
  }

  @ParameterizedTest(name = "{0}, aprovado pelo DM = {1} -> autorizado = {2}")
  @MethodSource("casos")
  void autorizacaoSegundoHs006(Funcao funcao, boolean aprovadoPeloDm, boolean esperado) {
    assertThat(colaborador(funcao, aprovadoPeloDm).isAutorizado()).isEqualTo(esperado);
  }

  @Test
  @DisplayName("XStore Manager é autorizado (a validar A-23)")
  void xstoreManagerAutorizado() {
    assertThat(colaborador(Funcao.XSTORE_MANAGER, false).isAutorizado()).isTrue();
  }

  @Test
  void semFuncaoNaoEAutorizado() {
    assertThat(new Colaborador().isAutorizado()).isFalse();
  }

  private static Colaborador colaborador(Funcao funcao, boolean aprovadoPeloDm) {
    Colaborador colaborador = new Colaborador();
    colaborador.setFuncao(funcao);
    colaborador.setAprovadoPeloDM(aprovadoPeloDm);
    return colaborador;
  }
}

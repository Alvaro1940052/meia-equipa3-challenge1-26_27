package com.levis.devolucoes.model.pedido;

import static org.assertj.core.api.Assertions.assertThat;

import com.levis.devolucoes.model.enums.TipoComprovativo;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

class ComprovativoELojaTest {

  @ParameterizedTest
  @EnumSource(TipoComprovativo.class)
  void todosOsTiposDeComprovativoSaoValidosSegundoPt001(TipoComprovativo tipo) {
    Comprovativo comprovativo = new Comprovativo();
    comprovativo.setTipo(tipo);
    assertThat(comprovativo.isValido()).isTrue();
  }

  @Test
  void comprovativoSemTipoNaoEValido() {
    assertThat(new Comprovativo().isValido()).isFalse();
  }

  @Test
  void sortidoDaLojaRecetora() {
    Loja loja = new Loja();
    loja.setSkusSortido(Set.of("501-A"));
    assertThat(loja.estaNoSortido("501-A")).isTrue();
    assertThat(loja.estaNoSortido("502-B")).isFalse();
    assertThat(loja.estaNoSortido(null)).isFalse();
  }

  @Test
  void lojaSemSortidoDefinido() {
    Loja loja = new Loja();
    loja.setSkusSortido(null);
    assertThat(loja.estaNoSortido("501-A")).isFalse();
  }
}

package com.levis.devolucoes.model.pedido;

import static com.levis.devolucoes.model.teste.PedidoBuilder.umPedido;
import static org.assertj.core.api.Assertions.assertThat;

import com.levis.devolucoes.model.enums.CanalCompra;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

class PedidoDevolucaoTest {

  @Test
  void contaOsDiasDesdeACompraAteAoPedido() {
    assertThat(umPedido().diasDesdeCompra(30).construir().getDiasDesdeCompra()).isEqualTo(30L);
  }

  @Test
  void diasDesdeACompraSaoNulosQuandoADataEDesconhecida() {
    assertThat(umPedido().semComprovativo().construir().getDiasDesdeCompra()).isNull();
  }

  @Test
  void contaOsDiasDesdeOEnvio() {
    PedidoDevolucao pedido = umPedido().diasDesdeEnvio(37).construir();
    assertThat(pedido.getDiasDesdeEnvio()).isEqualTo(37L);
  }

  @Test
  void diasDesdeOEnvioSaoNulosSemDataDeEnvio() {
    assertThat(umPedido().construir().getDiasDesdeEnvio()).isNull();
  }

  @ParameterizedTest
  @EnumSource(
      value = CanalCompra.class,
      names = {"LEVI_COM", "LEVI_CA"})
  void levicomELevicaSaoCompraOnline(CanalCompra canal) {
    assertThat(umPedido().canal(canal).construir().isCompraOnline()).isTrue();
  }

  @ParameterizedTest
  @EnumSource(
      value = CanalCompra.class,
      names = {"LEVI_COM", "LEVI_CA"},
      mode = EnumSource.Mode.EXCLUDE)
  void restantesCanaisNaoSaoCompraOnlineIncluindoBackPocket(CanalCompra canal) {
    // ADR 0003, A-02 (a validar): a BackPocket segue o caminho de loja
    assertThat(umPedido().canal(canal).construir().isCompraOnline()).isFalse();
  }

  @Test
  void semCompraOriginalNaoHaDiasNemCompraOnline() {
    PedidoDevolucao pedido = umPedido().com(p -> p.setCompraOriginal(null)).construir();
    assertThat(pedido.getDiasDesdeCompra()).isNull();
    assertThat(pedido.getDiasDesdeEnvio()).isNull();
    assertThat(pedido.isCompraOnline()).isFalse();
  }
}

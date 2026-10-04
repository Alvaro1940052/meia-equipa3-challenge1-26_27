package com.levis.devolucoes.model.produto;

import static org.assertj.core.api.Assertions.assertThat;

import com.levis.devolucoes.model.enums.CategoriaProduto;
import org.junit.jupiter.api.Test;

class EstadoProdutoTest {

  @Test
  void personalizadoAlteradoOuEmbainhadoEModificado() {
    EstadoProduto personalizado = new EstadoProduto();
    personalizado.setPersonalizado(true);
    EstadoProduto alterado = new EstadoProduto();
    alterado.setAlterado(true);
    EstadoProduto embainhado = new EstadoProduto();
    embainhado.setEmbainhado(true);

    assertThat(personalizado.isModificado()).isTrue();
    assertThat(alterado.isModificado()).isTrue();
    assertThat(embainhado.isModificado()).isTrue();
    assertThat(new EstadoProduto().isModificado()).isFalse();
  }

  @Test
  void identificaBodywear() {
    Produto produto = new Produto();
    produto.setCategoria(CategoriaProduto.BODYWEAR);
    assertThat(produto.isBodywear()).isTrue();
    produto.setCategoria(CategoriaProduto.VESTUARIO);
    assertThat(produto.isBodywear()).isFalse();
  }
}

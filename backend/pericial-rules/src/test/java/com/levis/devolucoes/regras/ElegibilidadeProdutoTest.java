package com.levis.devolucoes.regras;

import static com.levis.devolucoes.model.teste.PedidoBuilder.umPedido;
import static org.assertj.core.api.Assertions.assertThat;

import com.levis.devolucoes.model.decisao.DecisaoArtigo;
import com.levis.devolucoes.model.enums.CategoriaProduto;
import com.levis.devolucoes.model.enums.CondicaoUso;
import com.levis.devolucoes.model.enums.Elegibilidade;
import com.levis.devolucoes.model.enums.EstadoEtiquetas;
import com.levis.devolucoes.model.enums.Marca;
import com.levis.devolucoes.model.enums.Modulo;
import com.levis.devolucoes.model.enums.NivelAprovacao;
import com.levis.devolucoes.model.enums.ProcessoObrigatorio;
import com.levis.devolucoes.model.enums.TipoTransacao;
import com.levis.devolucoes.model.pedido.PedidoExcecao;
import com.levis.devolucoes.model.produto.ArtigoDevolvido;
import com.levis.devolucoes.model.teste.PedidoBuilder;
import com.levis.devolucoes.regras.suporte.MotorTeste;
import com.levis.devolucoes.regras.suporte.Regra;
import com.levis.devolucoes.regras.suporte.ResultadoAvaliacao;
import java.util.function.Consumer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

/** M3 — Elegibilidade do produto, por artigo (ADR 0002). */
class ElegibilidadeProdutoTest {

  private static ResultadoAvaliacao avaliarArtigo(Consumer<ArtigoDevolvido> alteracao) {
    return MotorTeste.avaliar(umPedido().artigo(alteracao).construir());
  }

  private static ResultadoAvaliacao avaliar(PedidoBuilder pedido) {
    return MotorTeste.avaliar(pedido.construir());
  }

  private static Consumer<ArtigoDevolvido> estado(CondicaoUso uso, EstadoEtiquetas etiquetas) {
    return a -> {
      a.getEstado().setCondicaoUso(uso);
      a.getEstado().setEtiquetas(etiquetas);
    };
  }

  private static PedidoExcecao excecaoComAprovacao(Boolean aprovada) {
    PedidoExcecao excecao = new PedidoExcecao();
    excecao.setMotivo("Pede reembolso de artigo usado");
    excecao.setAprovada(aprovada);
    return excecao;
  }

  @Nested
  class ParagensObrigatorias {

    @Test
    @Regra("HS-001")
    void skuNaoReconhecidoRecusaOArtigo() {
      ResultadoAvaliacao resultado = avaliarArtigo(a -> a.getProduto().setSkuReconhecidoPOS(false));

      DecisaoArtigo artigo = resultado.artigo("A-1");
      assertThat(artigo.getElegibilidade()).isEqualTo(Elegibilidade.RECUSAR);
      assertThat(artigo.isTerminal()).isTrue();
      assertThat(artigo.getTipoTransacao()).isEqualTo(TipoTransacao.NENHUMA);
      assertThat(resultado.disparos()).contains("HS-001").doesNotContain("PC-001", "HS-004");
      assertThat(resultado.decisao().isTerminal()).isFalse();
    }

    @Test
    @Regra({"HS-004", "HS-001"})
    @DisplayName("HS-001 → HS-004: SKU da franquia não reconhecido encaminha para a franquia")
    void skuDaFranquiaNaoReconhecidoEncaminha() {
      ResultadoAvaliacao resultado =
          avaliarArtigo(
              a -> {
                a.getProduto().setSkuReconhecidoPOS(false);
                a.getProduto().setProdutoFranquia(true);
              });

      DecisaoArtigo artigo = resultado.artigo("A-1");
      assertThat(artigo.getElegibilidade()).isEqualTo(Elegibilidade.ENCAMINHAR);
      assertThat(artigo.isTerminal()).isTrue();
      assertThat(resultado.decisao().getProcesso()).isEqualTo(ProcessoObrigatorio.FRANQUIA_CANADA);
      assertThat(resultado.disparos()).contains("HS-004").doesNotContain("HS-001", "PC-001");
    }

    @Test
    @Regra("CH-007")
    void produtoDaFranquiaComSkuReconhecidoEncaminha() {
      ResultadoAvaliacao resultado = avaliarArtigo(a -> a.getProduto().setProdutoFranquia(true));

      assertThat(resultado.artigo("A-1").getElegibilidade()).isEqualTo(Elegibilidade.ENCAMINHAR);
      assertThat(resultado.artigo("A-1").disparou("CH-007")).isTrue();
      assertThat(resultado.decisao().getProcesso()).isEqualTo(ProcessoObrigatorio.FRANQUIA_CANADA);
      assertThat(resultado.disparos()).doesNotContain("PC-001");
    }

    @ParameterizedTest
    @EnumSource(
        value = Marca.class,
        names = {"DOCKERS", "LS_SIGNATURE", "BEYOND_YOGA"})
    @Regra("HS-002")
    void marcaExcluidaRecusa(Marca marca) {
      ResultadoAvaliacao resultado = avaliarArtigo(a -> a.getProduto().setMarca(marca));

      assertThat(resultado.artigo("A-1").getElegibilidade()).isEqualTo(Elegibilidade.RECUSAR);
      assertThat(resultado.artigo("A-1").isTerminal()).isTrue();
      assertThat(resultado.disparos()).contains("HS-002").doesNotContain("PC-001");
    }

    @Test
    @Regra("HS-002")
    void produtoGrossistaNaoVendidoNaLojaRecusa() {
      ResultadoAvaliacao resultado =
          avaliarArtigo(
              a -> {
                a.getProduto().setGrossista(true);
                a.getProduto().setVendidoNaLoja(false);
              });

      assertThat(resultado.artigo("A-1").getElegibilidade()).isEqualTo(Elegibilidade.RECUSAR);
      assertThat(resultado.disparos()).contains("HS-002");
    }

    @Test
    @Regra("HS-002")
    void produtoGrossistaVendidoNaLojaNaoERecusadoPorHs002() {
      ResultadoAvaliacao resultado = avaliarArtigo(a -> a.getProduto().setGrossista(true));

      assertThat(resultado.disparos()).doesNotContain("HS-002").contains("PC-001");
    }

    @ParameterizedTest(name = "{0}")
    @EnumSource(value = Modificacao.class)
    @Regra("HS-003")
    void produtoModificadoRecusa(Modificacao modificacao) {
      ResultadoAvaliacao resultado = avaliarArtigo(modificacao.aplicar);

      assertThat(resultado.artigo("A-1").getElegibilidade()).isEqualTo(Elegibilidade.RECUSAR);
      assertThat(resultado.artigo("A-1").isTerminal()).isTrue();
      assertThat(resultado.disparos()).contains("HS-003").doesNotContain("PC-001");
    }

    @Test
    @Regra({"HS-003", "PC-006"})
    @DisplayName("HS-003 prevalece sobre PC-006: embainhado com defeito é recusado")
    void hs003PrevaleceSobrePc006() {
      ResultadoAvaliacao resultado =
          avaliarArtigo(
              a -> {
                a.getEstado().setEmbainhado(true);
                a.getEstado().setDefeitoFabricoConfirmado(true);
              });

      assertThat(resultado.artigo("A-1").getElegibilidade()).isEqualTo(Elegibilidade.RECUSAR);
      assertThat(resultado.disparos()).contains("HS-003").doesNotContain("PC-006");
    }

    @Test
    @Regra({"HS-002", "HS-003"})
    void umaSoParagemPorArtigo() {
      ResultadoAvaliacao resultado =
          avaliarArtigo(
              a -> {
                a.getProduto().setMarca(Marca.DOCKERS);
                a.getEstado().setAlterado(true);
              });

      assertThat(resultado.disparos()).contains("HS-002").doesNotContain("HS-003");
    }
  }

  /** Modificações que HS-003 recusa. */
  enum Modificacao {
    PERSONALIZADO(a -> a.getEstado().setPersonalizado(true)),
    ALTERADO(a -> a.getEstado().setAlterado(true)),
    EMBAINHADO(a -> a.getEstado().setEmbainhado(true));

    private final Consumer<ArtigoDevolvido> aplicar;

    Modificacao(Consumer<ArtigoDevolvido> aplicar) {
      this.aplicar = aplicar;
    }
  }

  @Nested
  class EstadoDoProduto {

    @Test
    @Regra("PC-001")
    void naoUsadoComEtiquetasEPermitido() {
      ResultadoAvaliacao resultado = avaliarArtigo(a -> {});

      assertThat(resultado.artigo("A-1").getElegibilidade()).isEqualTo(Elegibilidade.PERMITIR);
      assertThat(resultado.artigo("A-1").getAprovacao()).isEqualTo(NivelAprovacao.NENHUMA);
      assertThat(resultado.disparos()).containsOnlyOnce("PC-001");
    }

    @Test
    @Regra("PC-002")
    @DisplayName("Etiquetas soltas sem avaliação de revenda: rever (a validar A-19)")
    void etiquetasSoltasPorAvaliarFicaEmRevisao() {
      ResultadoAvaliacao resultado =
          avaliarArtigo(estado(CondicaoUso.NAO_USADO, EstadoEtiquetas.SOLTAS));

      DecisaoArtigo artigo = resultado.artigo("A-1");
      assertThat(artigo.getElegibilidade()).isEqualTo(Elegibilidade.REVER);
      assertThat(artigo.getAprovacao()).isEqualTo(NivelAprovacao.RESPONSAVEL_SENIOR);
      assertThat(resultado.registo("PC-002").getMensagem()).contains("IN-010");
    }

    @Test
    @Regra("PC-002")
    void etiquetasSoltasERevendivelEAprovado() {
      ResultadoAvaliacao resultado =
          avaliarArtigo(
              estado(CondicaoUso.NAO_USADO, EstadoEtiquetas.SOLTAS)
                  .andThen(a -> a.setRevendivel(true)));

      assertThat(resultado.artigo("A-1").getElegibilidade()).isEqualTo(Elegibilidade.PERMITIR);
      assertThat(resultado.artigo("A-1").getAprovacao())
          .isEqualTo(NivelAprovacao.RESPONSAVEL_SENIOR);
    }

    @Test
    @Regra("PC-002")
    void etiquetasSoltasENaoRevendivelERecusado() {
      ResultadoAvaliacao resultado =
          avaliarArtigo(
              estado(CondicaoUso.NAO_USADO, EstadoEtiquetas.SOLTAS)
                  .andThen(a -> a.setRevendivel(false)));

      assertThat(resultado.artigo("A-1").getElegibilidade()).isEqualTo(Elegibilidade.RECUSAR);
      assertThat(resultado.artigo("A-1").isTerminal()).isFalse();
    }

    @Test
    @Regra("PC-003")
    void semEtiquetasPorAvaliarFicaEmRevisao() {
      ResultadoAvaliacao resultado =
          avaliarArtigo(estado(CondicaoUso.NAO_USADO, EstadoEtiquetas.AUSENTES));

      assertThat(resultado.artigo("A-1").getElegibilidade()).isEqualTo(Elegibilidade.REVER);
      assertThat(resultado.artigo("A-1").getAprovacao())
          .isEqualTo(NivelAprovacao.RESPONSAVEL_SENIOR);
    }

    @Test
    @Regra("PC-003")
    void semEtiquetasERevendivelEAprovado() {
      ResultadoAvaliacao resultado =
          avaliarArtigo(
              estado(CondicaoUso.NAO_USADO, EstadoEtiquetas.AUSENTES)
                  .andThen(a -> a.setRevendivel(true)));

      assertThat(resultado.artigo("A-1").getElegibilidade()).isEqualTo(Elegibilidade.PERMITIR);
    }

    @Test
    @Regra("PC-003")
    void semEtiquetasENaoRevendivelERecusado() {
      ResultadoAvaliacao resultado =
          avaliarArtigo(
              estado(CondicaoUso.NAO_USADO, EstadoEtiquetas.AUSENTES)
                  .andThen(a -> a.setRevendivel(false)));

      assertThat(resultado.artigo("A-1").getElegibilidade()).isEqualTo(Elegibilidade.RECUSAR);
    }

    @Test
    @Regra("PC-004")
    @DisplayName("Usado sem decisão da gestão: rever (a validar A-18, A-29)")
    void usadoSemDecisaoDaGestaoFicaEmRevisao() {
      ResultadoAvaliacao resultado =
          avaliarArtigo(estado(CondicaoUso.USADO, EstadoEtiquetas.AUSENTES));

      DecisaoArtigo artigo = resultado.artigo("A-1");
      assertThat(artigo.getElegibilidade()).isEqualTo(Elegibilidade.REVER);
      assertThat(artigo.getAprovacao()).isEqualTo(NivelAprovacao.RESPONSAVEL_SENIOR);
      assertThat(resultado.registo("PC-004").getMensagem()).contains("mesmo artigo");
    }

    @Test
    @Regra("PC-004")
    void usadoComAprovacaoDaGestaoSoPermiteTrocaPeloMesmoArtigo() {
      ResultadoAvaliacao resultado =
          avaliar(
              umPedido()
                  .artigo(estado(CondicaoUso.USADO, EstadoEtiquetas.AUSENTES))
                  .com(p -> p.setPedidoExcecao(excecaoComAprovacao(true))));

      DecisaoArtigo artigo = resultado.artigo("A-1");
      assertThat(artigo.getElegibilidade()).isEqualTo(Elegibilidade.PERMITIR);
      assertThat(artigo.getTipoTransacao()).isEqualTo(TipoTransacao.TROCA_MESMO_ARTIGO);
    }

    @Test
    @Regra("PC-004")
    void usadoRecusadoPelaGestao() {
      ResultadoAvaliacao resultado =
          avaliar(
              umPedido()
                  .artigo(estado(CondicaoUso.USADO, EstadoEtiquetas.AUSENTES))
                  .com(p -> p.setPedidoExcecao(excecaoComAprovacao(false))));

      assertThat(resultado.artigo("A-1").getElegibilidade()).isEqualTo(Elegibilidade.RECUSAR);
      assertThat(resultado.artigo("A-1").getTipoTransacao()).isEqualTo(TipoTransacao.NENHUMA);
    }

    @Test
    @Regra("PC-004")
    @DisplayName("Usado com dano mas sem defeito confirmado segue PC-004 (a validar A-29)")
    void usadoComDanoSemDefeitoConfirmado() {
      ResultadoAvaliacao resultado =
          avaliarArtigo(
              estado(CondicaoUso.USADO, EstadoEtiquetas.AUSENTES)
                  .andThen(a -> a.getEstado().setDanificado(true)));

      assertThat(resultado.disparos()).contains("PC-004");
    }

    @Test
    @Regra("PC-005")
    void lavadoERecusado() {
      ResultadoAvaliacao resultado =
          avaliarArtigo(estado(CondicaoUso.LAVADO, EstadoEtiquetas.AUSENTES));

      assertThat(resultado.artigo("A-1").getElegibilidade()).isEqualTo(Elegibilidade.RECUSAR);
      assertThat(resultado.artigo("A-1").getTipoTransacao()).isEqualTo(TipoTransacao.NENHUMA);
    }

    @ParameterizedTest
    @EnumSource(
        value = CondicaoUso.class,
        names = {"USADO", "LAVADO"})
    @Regra("PC-006")
    @DisplayName("PC-006 prevalece sobre PC-004 e PC-005: defeito confirmado é permitido")
    void defeitoConfirmadoEPermitido(CondicaoUso uso) {
      ResultadoAvaliacao resultado =
          avaliarArtigo(
              estado(uso, EstadoEtiquetas.AUSENTES)
                  .andThen(a -> a.getEstado().setDefeitoFabricoConfirmado(true)));

      assertThat(resultado.artigo("A-1").getElegibilidade()).isEqualTo(Elegibilidade.PERMITIR);
      assertThat(resultado.disparos()).contains("PC-006").doesNotContain("PC-004", "PC-005");
    }

    @ParameterizedTest
    @EnumSource(CondicaoUso.class)
    @Regra("PC-007")
    @DisplayName(
        "PC-007 prevalece sobre PC-004, PC-005 e PC-006: bodywear aceite em qualquer estado")
    void bodywearEmQualquerEstadoEPermitido(CondicaoUso uso) {
      ResultadoAvaliacao resultado =
          avaliarArtigo(
              estado(uso, EstadoEtiquetas.AUSENTES)
                  .andThen(
                      a -> {
                        a.getProduto().setCategoria(CategoriaProduto.BODYWEAR);
                        a.getEstado().setDefeitoFabricoConfirmado(true);
                      }));

      assertThat(resultado.artigo("A-1").getElegibilidade()).isEqualTo(Elegibilidade.PERMITIR);
      assertThat(resultado.artigo("A-1").getRegistos())
          .filteredOn(r -> r.getModulo() != Modulo.M7)
          .extracting(r -> r.getCodigoRegra())
          .containsExactly("PC-007");
    }

    @Test
    @Regra({"PC-007", "HS-003"})
    void bodywearModificadoContinuaASerRecusadoPorHs003() {
      ResultadoAvaliacao resultado =
          avaliarArtigo(
              a -> {
                a.getProduto().setCategoria(CategoriaProduto.BODYWEAR);
                a.getEstado().setAlterado(true);
              });

      assertThat(resultado.disparos()).contains("HS-003").doesNotContain("PC-007");
    }
  }

  @Nested
  @DisplayName("Vários artigos (cenário 6 sem o indício de fraude)")
  class VariosArtigos {

    @Test
    @Regra({"PC-003", "PC-004", "PC-008"})
    void cadaArtigoTemOSeuResultado() {
      ResultadoAvaliacao resultado =
          avaliar(
              umPedido()
                  .semComprovativo()
                  .artigo(estado(CondicaoUso.NAO_USADO, EstadoEtiquetas.AUSENTES))
                  .maisUmArtigo("A-2", estado(CondicaoUso.USADO, EstadoEtiquetas.AUSENTES))
                  .maisUmArtigo(
                      "A-3",
                      estado(CondicaoUso.USADO, EstadoEtiquetas.AUSENTES)
                          .andThen(a -> a.getEstado().setSujoOuInseguro(true))));

      assertThat(resultado.artigo("A-1").getRegistos())
          .filteredOn(r -> r.getModulo() != Modulo.M7)
          .extracting(r -> r.getCodigoRegra())
          .containsExactly("PC-003");
      assertThat(resultado.artigo("A-2").getRegistos())
          .filteredOn(r -> r.getModulo() != Modulo.M7)
          .extracting(r -> r.getCodigoRegra())
          .containsExactly("PC-004");
      assertThat(resultado.artigo("A-3").getRegistos())
          .filteredOn(r -> r.getModulo() != Modulo.M7)
          .extracting(r -> r.getCodigoRegra())
          .containsExactly("PC-008", "PC-004");
    }

    @Test
    @Regra({"HS-003", "PC-001"})
    void umaParagemNumArtigoNaoTerminaOsOutros() {
      ResultadoAvaliacao resultado =
          avaliar(umPedido().maisUmArtigo("A-2", a -> a.getEstado().setEmbainhado(true)));

      assertThat(resultado.artigo("A-1").getElegibilidade()).isEqualTo(Elegibilidade.PERMITIR);
      assertThat(resultado.artigo("A-2").getElegibilidade()).isEqualTo(Elegibilidade.RECUSAR);
      assertThat(resultado.decisao().isTerminal()).isFalse();
    }
  }
}

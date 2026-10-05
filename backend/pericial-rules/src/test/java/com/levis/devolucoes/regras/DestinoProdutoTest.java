package com.levis.devolucoes.regras;

import static com.levis.devolucoes.model.teste.PedidoBuilder.umPedido;
import static org.assertj.core.api.Assertions.assertThat;

import com.levis.devolucoes.model.decisao.DecisaoArtigo;
import com.levis.devolucoes.model.decisao.IndicadorFraude;
import com.levis.devolucoes.model.enums.CanalCompra;
import com.levis.devolucoes.model.enums.CategoriaProduto;
import com.levis.devolucoes.model.enums.CondicaoUso;
import com.levis.devolucoes.model.enums.DestinoProduto;
import com.levis.devolucoes.model.enums.Elegibilidade;
import com.levis.devolucoes.model.enums.EstadoEtiquetas;
import com.levis.devolucoes.model.enums.NivelRisco;
import com.levis.devolucoes.model.enums.TipoTransacao;
import com.levis.devolucoes.model.produto.ArtigoDevolvido;
import com.levis.devolucoes.model.teste.PedidoBuilder;
import com.levis.devolucoes.regras.suporte.MotorTeste;
import com.levis.devolucoes.regras.suporte.Regra;
import com.levis.devolucoes.regras.suporte.ResultadoAvaliacao;
import java.util.Set;
import java.util.function.Consumer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/** M9 — Destino do produto e agregação do pedido. */
class DestinoProdutoTest {

  private static ResultadoAvaliacao avaliar(PedidoBuilder pedido) {
    return MotorTeste.avaliar(pedido.construir());
  }

  private static DecisaoArtigo artigo(Consumer<ArtigoDevolvido> alteracao) {
    return avaliar(umPedido().artigo(alteracao)).artigo("A-1");
  }

  /** Bodywear não usado, com embalagem e completo; a alteração ajusta o estado. */
  private static Consumer<ArtigoDevolvido> bodywear(Consumer<ArtigoDevolvido> alteracao) {
    Consumer<ArtigoDevolvido> base =
        a -> {
          a.getProduto().setCategoria(CategoriaProduto.BODYWEAR);
          a.getEstado().setEmbalagemIntacta(true);
          a.getEstado().setConjuntoCompleto(true);
        };
    return base.andThen(alteracao);
  }

  private static Consumer<ArtigoDevolvido> entreCanais(Consumer<ArtigoDevolvido> alteracao) {
    Consumer<ArtigoDevolvido> base = a -> a.setEntreCanais(true);
    return base.andThen(alteracao);
  }

  @Nested
  class ArtigoRecusado {

    @Test
    @Regra("OUT-007")
    void artigoRecusadoEDevolvidoAoCliente() {
      DecisaoArtigo artigo = artigo(a -> a.getEstado().setEmbainhado(true));

      assertThat(artigo.getDestino()).isEqualTo(DestinoProduto.DEVOLUCAO_CLIENTE);
    }

    @Test
    @Regra({"OUT-007", "CH-008"})
    @DisplayName("Depois de uma recusa terminal do pedido, o artigo volta ao cliente")
    void pedidoRecusadoTerminalDevolveOsArtigos() {
      ResultadoAvaliacao resultado = avaliar(umPedido().canal(CanalCompra.GROSSISTA));

      assertThat(resultado.decisao().isTerminal()).isTrue();
      assertThat(resultado.artigo("A-1").getDestino()).isEqualTo(DestinoProduto.DEVOLUCAO_CLIENTE);
    }

    @Test
    @Regra({"OUT-007", "PC-008"})
    @DisplayName("Um artigo inseguro recusado continua isolado (a validar A-28)")
    void artigoInseguroRecusadoContinuaIsolado() {
      DecisaoArtigo artigo =
          artigo(
              a -> {
                a.getEstado().setEmbainhado(true);
                a.getEstado().setSujoOuInseguro(true);
              });

      assertThat(artigo.getDestino()).isEqualTo(DestinoProduto.RISCO_BIOLOGICO);
    }

    @Test
    @Regra({"OUT-007", "EX-008"})
    void pedidoSuspensoNaoTemDestino() {
      ResultadoAvaliacao resultado =
          MotorTeste.avaliar(
              umPedido().construir(),
              new IndicadorFraude("P-1", "Recibo adulterado", NivelRisco.CONFIRMADO));

      assertThat(resultado.artigo("A-1").getDestino()).isNull();
      assertThat(resultado.disparos()).doesNotContain("OUT-007", "OUT-001");
    }
  }

  @Nested
  class Bodywear {

    @Test
    @Regra({"BW-004", "BW-003", "PC-008"})
    @DisplayName("BW-004 prevalece sobre BW-003: usado e sujo vai para risco biológico")
    void usadoESujoVaiParaRiscoBiologico() {
      DecisaoArtigo artigo =
          artigo(
              bodywear(
                  a -> {
                    a.getEstado().setCondicaoUso(CondicaoUso.USADO);
                    a.getEstado().setSujoOuInseguro(true);
                    a.getEstado().setConjuntoCompleto(false);
                  }));

      assertThat(artigo.getDestino()).isEqualTo(DestinoProduto.RISCO_BIOLOGICO);
      assertThat(artigo.disparou("BW-004")).isTrue();
      assertThat(artigo.disparou("BW-003")).isFalse();
    }

    @Test
    @Regra("BW-003")
    void conjuntoIncompletoTemBaixaPorDano() {
      DecisaoArtigo artigo = artigo(bodywear(a -> a.getEstado().setConjuntoCompleto(false)));

      assertThat(artigo.getDestino()).isEqualTo(DestinoProduto.BAIXA_DANO);
      assertThat(artigo.disparou("BW-003")).isTrue();
    }

    @Test
    @Regra("BW-003")
    void usadoSemSujidadeTemBaixaPorDano() {
      DecisaoArtigo artigo = artigo(bodywear(a -> a.getEstado().setCondicaoUso(CondicaoUso.USADO)));

      assertThat(artigo.getDestino()).isEqualTo(DestinoProduto.BAIXA_DANO);
    }

    @Test
    @Regra("BW-001")
    void embalagemIntactaEInspecaoConfirmadaVoltaAVenda() {
      DecisaoArtigo artigo = artigo(bodywear(a -> a.setRevendivel(true)));

      assertThat(artigo.getDestino()).isEqualTo(DestinoProduto.AREA_VENDAS);
    }

    @Test
    @Regra("BW-001")
    void embalagemIntactaSemConfirmacaoDeRevendaTemBaixaPorDano() {
      DecisaoArtigo artigo = artigo(bodywear(a -> a.setRevendivel(false)));

      assertThat(artigo.getDestino()).isEqualTo(DestinoProduto.BAIXA_DANO);
    }

    @Test
    @Regra("BW-001")
    void embalagemIntactaPorInspecionarFicaPendente() {
      DecisaoArtigo artigo = artigo(bodywear(a -> {}));

      assertThat(artigo.getDestino()).isNull();
      assertThat(artigo.disparou("BW-001")).isTrue();
    }

    @Test
    @Regra("BW-002")
    void semEmbalagemNaoUsadoECompletoVaiParaSaldosA50() {
      DecisaoArtigo artigo = artigo(bodywear(a -> a.getEstado().setEmbalagemIntacta(false)));

      assertThat(artigo.getDestino()).isEqualTo(DestinoProduto.SALDOS);
      assertThat(artigo.getDescontoSaldo()).isEqualTo(50);
    }
  }

  @Nested
  class VestuarioEAcessorios {

    @Test
    @Regra("PC-006")
    void defeitoDeFabricoTemBaixaPorDano() {
      DecisaoArtigo artigo = artigo(a -> a.getEstado().setDefeitoFabricoConfirmado(true));

      assertThat(artigo.getDestino()).isEqualTo(DestinoProduto.BAIXA_DANO);
      assertThat(artigo.disparou("CT-008")).isFalse();
    }

    @Test
    @Regra("CT-008")
    void inspecaoConformeVoltaAAreaDeVendas() {
      DecisaoArtigo artigo = artigo(a -> {});

      assertThat(artigo.getDestino()).isEqualTo(DestinoProduto.AREA_VENDAS);
    }

    @Test
    @Regra("CT-008")
    void artigoComDanoTemBaixaPorDano() {
      DecisaoArtigo artigo = artigo(a -> a.getEstado().setDanificado(true));

      assertThat(artigo.getDestino()).isEqualTo(DestinoProduto.BAIXA_DANO);
    }

    @Test
    @Regra("CT-008")
    void etiquetaOuRfidIncorretosReetiquetar() {
      DecisaoArtigo artigo = artigo(a -> a.getEstado().setRfidCorreto(false));

      assertThat(artigo.getDestino()).isEqualTo(DestinoProduto.REETIQUETAR);
    }

    @Test
    @Regra("CT-008")
    void artigoEmRevisaoTambemEInspecionado() {
      DecisaoArtigo artigo = artigo(a -> a.getEstado().setEtiquetas(EstadoEtiquetas.SOLTAS));

      assertThat(artigo.getElegibilidade()).isEqualTo(Elegibilidade.REVER);
      assertThat(artigo.getDestino()).isEqualTo(DestinoProduto.AREA_VENDAS);
    }
  }

  @Nested
  class EntreCanais {

    @Test
    @Regra({"EP-007", "EP-006"})
    @DisplayName("EP-007 antes de EP-006: artigo já em saldo continua em saldo")
    void jaEmSaldoContinuaEmSaldo() {
      DecisaoArtigo artigo = artigo(entreCanais(a -> a.getProduto().setEmSaldo(true)));

      assertThat(artigo.getDestino()).isEqualTo(DestinoProduto.SALDOS);
      assertThat(artigo.getDescontoSaldo()).isZero();
      assertThat(artigo.disparou("EP-007")).isTrue();
      assertThat(artigo.disparou("EP-006")).isFalse();
    }

    @Test
    @Regra("EP-005")
    void noSortidoDaLojaRecetoraVoltaAVendaReprecificado() {
      ResultadoAvaliacao resultado =
          avaliar(
              umPedido()
                  .artigo(entreCanais(a -> {}))
                  .com(p -> p.getLoja().setSkusSortido(Set.of("501-A-1"))));

      assertThat(resultado.artigo("A-1").getDestino()).isEqualTo(DestinoProduto.AREA_VENDAS);
      assertThat(resultado.artigo("A-1").disparou("EP-005")).isTrue();
    }

    @Test
    @Regra("EP-006")
    void foraDoSortidoVaiParaSaldosA20() {
      DecisaoArtigo artigo = artigo(entreCanais(a -> {}));

      assertThat(artigo.getDestino()).isEqualTo(DestinoProduto.SALDOS);
      assertThat(artigo.getDescontoSaldo()).isEqualTo(20);
    }

    @Test
    @Regra({"EP-006", "CT-008"})
    void artigoEntreCanaisComDanoTemBaixaPorDano() {
      DecisaoArtigo artigo = artigo(entreCanais(a -> a.getEstado().setDanificado(true)));

      assertThat(artigo.getDestino()).isEqualTo(DestinoProduto.BAIXA_DANO);
      assertThat(artigo.disparou("EP-006")).isFalse();
    }
  }

  @Nested
  class Agregacao {

    @Test
    @Regra("OUT-001")
    @DisplayName("O pedido fica com o resultado mais severo dos artigos (a validar A-25)")
    void pedidoComArtigoEmRevisaoFicaEmRevisao() {
      ResultadoAvaliacao resultado =
          avaliar(
              umPedido()
                  .maisUmArtigo("A-2", a -> a.getEstado().setEtiquetas(EstadoEtiquetas.SOLTAS)));

      assertThat(resultado.decisao().getElegibilidade()).isEqualTo(Elegibilidade.REVER);
      assertThat(resultado.decisao().getResultadosArtigos()).hasSize(2);
    }

    @Test
    @Regra({"OUT-001", "HS-003"})
    void todosOsArtigosRecusadosRecusaOPedido() {
      ResultadoAvaliacao resultado =
          avaliar(umPedido().artigo(a -> a.getEstado().setEmbainhado(true)));

      assertThat(resultado.decisao().getElegibilidade()).isEqualTo(Elegibilidade.RECUSAR);
      assertThat(resultado.decisao().getTipoTransacao()).isEqualTo(TipoTransacao.NENHUMA);
    }

    @Test
    @Regra({"OUT-001", "HS-003", "PC-001"})
    void artigoRecusadoEArtigoPermitidoRecusaOPedido() {
      ResultadoAvaliacao resultado =
          avaliar(umPedido().maisUmArtigo("A-2", a -> a.getEstado().setEmbainhado(true)));

      assertThat(resultado.decisao().getElegibilidade()).isEqualTo(Elegibilidade.RECUSAR);
      assertThat(resultado.decisao().getTipoTransacao()).isEqualTo(TipoTransacao.REEMBOLSO);
      assertThat(resultado.artigo("A-1").getDestino()).isEqualTo(DestinoProduto.AREA_VENDAS);
      assertThat(resultado.artigo("A-2").getDestino()).isEqualTo(DestinoProduto.DEVOLUCAO_CLIENTE);
    }

    @Test
    @Regra("OUT-001")
    void disparaUmaSoVezNoFim() {
      ResultadoAvaliacao resultado = avaliar(umPedido());

      assertThat(resultado.disparos()).endsWith("OUT-001").containsOnlyOnce("OUT-001");
    }
  }
}

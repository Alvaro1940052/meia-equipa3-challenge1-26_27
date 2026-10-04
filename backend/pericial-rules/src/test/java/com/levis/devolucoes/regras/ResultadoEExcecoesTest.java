package com.levis.devolucoes.regras;

import static com.levis.devolucoes.model.teste.PedidoBuilder.umPedido;
import static org.assertj.core.api.Assertions.assertThat;

import com.levis.devolucoes.model.enums.CanalCompra;
import com.levis.devolucoes.model.enums.CondicaoUso;
import com.levis.devolucoes.model.enums.Elegibilidade;
import com.levis.devolucoes.model.enums.EstadoEtiquetas;
import com.levis.devolucoes.model.enums.NivelAprovacao;
import com.levis.devolucoes.model.enums.TipoPedido;
import com.levis.devolucoes.model.enums.TipoTransacao;
import com.levis.devolucoes.model.pedido.PedidoExcecao;
import com.levis.devolucoes.model.produto.ArtigoTroca;
import com.levis.devolucoes.model.teste.PedidoBuilder;
import com.levis.devolucoes.regras.suporte.MotorTeste;
import com.levis.devolucoes.regras.suporte.Regra;
import com.levis.devolucoes.regras.suporte.ResultadoAvaliacao;
import java.math.BigDecimal;
import java.util.function.Consumer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/** M6 — Resultado, troca e exceções. */
class ResultadoEExcecoesTest {

  private static ResultadoAvaliacao avaliar(PedidoBuilder pedido) {
    return MotorTeste.avaliar(pedido.construir());
  }

  private static PedidoBuilder troca(boolean apenasMudaTamanho) {
    ArtigoTroca novo = new ArtigoTroca();
    novo.setProduto(PedidoBuilder.artigo("NOVO").getProduto());
    novo.setApenasMudaTamanho(apenasMudaTamanho);
    novo.setPrecoVenda(new BigDecimal("98.00"));
    return umPedido().tipo(TipoPedido.TROCA).com(p -> p.getArtigosTroca().add(novo));
  }

  /** Cliente que contesta e fica agitado, com um pedido de exceção. */
  private static PedidoBuilder clienteAgitadoComExcecao(Consumer<PedidoExcecao> alteracao) {
    PedidoExcecao excecao = new PedidoExcecao();
    excecao.setMotivo("Quer uma exceção à política");
    alteracao.accept(excecao);
    return umPedido()
        .com(
            p -> {
              p.getCliente().setContestaResultado(true);
              p.getCliente().setAgitado(true);
              p.setPedidoExcecao(excecao);
            });
  }

  @Nested
  class Trocas {

    @Test
    @Regra("EP-001")
    void trocaComReciboSoDeTamanhoMantemOPreco() {
      ResultadoAvaliacao resultado = avaliar(troca(true));

      assertThat(resultado.disparos()).containsSequence("PT-003").contains("EP-001");
      assertThat(resultado.disparos()).doesNotContain("EP-002");
      assertThat(resultado.registo("EP-001").getMensagem()).contains("original ou promocional");
    }

    @Test
    @Regra("EP-001")
    void trocaAsCegasSoDeTamanhoNaoTemCorrespondenciaDePromocao() {
      ResultadoAvaliacao resultado = avaliar(troca(true).semComprovativo());

      assertThat(resultado.disparos()).contains("PT-005").doesNotContain("EP-001");
    }

    @Test
    @Regra("EP-002")
    void trocaDeModeloOuCorVendeONovoAoPrecoAtual() {
      ResultadoAvaliacao resultado = avaliar(troca(false));

      assertThat(resultado.disparos()).contains("EP-002").doesNotContain("EP-001");
    }

    @Test
    @Regra("EP-002")
    void trocaAsCegasDeModelo() {
      assertThat(avaliar(troca(false).semComprovativo()).disparos()).contains("PT-005", "EP-002");
    }

    @Test
    @Regra({"EP-001", "EP-002"})
    void devolucaoNaoETroca() {
      assertThat(avaliar(umPedido()).disparos()).doesNotContain("EP-001", "EP-002");
    }
  }

  @Nested
  class RevisaoPelaGestao {

    @Test
    @Regra("EX-001")
    void artigoEmRevisaoPedeOCriterioDaGestao() {
      ResultadoAvaliacao resultado =
          avaliar(umPedido().artigo(a -> a.getEstado().setEtiquetas(EstadoEtiquetas.SOLTAS)));

      assertThat(resultado.disparos()).contains("PC-002", "EX-001");
      assertThat(resultado.decisao().getAprovacao()).isEqualTo(NivelAprovacao.RESPONSAVEL_SENIOR);
      assertThat(resultado.registo("EX-001").getMensagem()).contains("revenda", "fraude");
    }

    @Test
    @Regra({"EX-001", "PT-004"})
    void pedidoEmRevisaoPedeOCriterioDaGestao() {
      assertThat(avaliar(umPedido().diasDesdeCompra(40)).disparos()).contains("PT-004", "EX-001");
    }

    @Test
    @Regra("EX-001")
    void semRevisaoNaoDispara() {
      assertThat(avaliar(umPedido()).disparos()).doesNotContain("EX-001");
    }
  }

  @Nested
  class EscalonamentoDoCliente {

    @Test
    @Regra("EX-002")
    void clienteQueContestaRecebeAExplicacaoDaPolitica() {
      ResultadoAvaliacao resultado =
          avaliar(umPedido().com(p -> p.getCliente().setContestaResultado(true)));

      assertThat(resultado.disparos()).contains("EX-002");
      assertThat(resultado.decisao().getElegibilidade()).isEqualTo(Elegibilidade.PERMITIR);
    }

    @Test
    @Regra({"EX-002", "CH-008"})
    @DisplayName("EX-002 dispara mesmo depois de uma paragem obrigatória (ADR 0004)")
    void contestacaoDeUmaRecusaTerminal() {
      ResultadoAvaliacao resultado =
          avaliar(
              umPedido()
                  .canal(CanalCompra.GROSSISTA)
                  .com(p -> p.getCliente().setContestaResultado(true)));

      assertThat(resultado.decisao().isTerminal()).isTrue();
      assertThat(resultado.disparos()).containsSequence("CH-008", "EX-002");
      assertThat(resultado.decisao().getElegibilidade()).isEqualTo(Elegibilidade.RECUSAR);
    }

    @Test
    @Regra("EX-002")
    void semContestacaoNaoDispara() {
      assertThat(avaliar(umPedido()).disparos()).doesNotContain("EX-002");
    }

    @Test
    @Regra("EX-003")
    void clienteAgitadoEEscaladoSemMudarAElegibilidade() {
      ResultadoAvaliacao resultado =
          avaliar(
              umPedido()
                  .com(
                      p -> {
                        p.getCliente().setContestaResultado(true);
                        p.getCliente().setAgitado(true);
                      }));

      assertThat(resultado.disparos()).containsSequence("EX-002", "EX-003");
      assertThat(resultado.decisao().getAprovacao()).isEqualTo(NivelAprovacao.RESPONSAVEL_SENIOR);
      assertThat(resultado.decisao().getElegibilidade()).isEqualTo(Elegibilidade.PERMITIR);
      assertThat(resultado.registo("EX-003").getMensagem()).contains("não cria elegibilidade");
    }

    @Test
    @Regra("EX-003")
    void agitacaoSemContestacaoNaoEscala() {
      assertThat(avaliar(umPedido().com(p -> p.getCliente().setAgitado(true))).disparos())
          .doesNotContain("EX-003");
    }
  }

  @Nested
  class Excecoes {

    @Test
    @Regra("EX-004")
    void excecaoQueCumpreOsControlosPodeSerAprovada() {
      ResultadoAvaliacao resultado = avaliar(clienteAgitadoComExcecao(e -> {}));

      assertThat(resultado.disparos()).containsSequence("EX-003", "EX-004");
      assertThat(resultado.registo("EX-004").getResultado()).isNull();
      assertThat(resultado.decisao().isExcecaoRecusada()).isFalse();
    }

    @Test
    @Regra({"EX-004", "HS-003"})
    void comUmaParagemObrigatoriaNaoPodeSerAprovada() {
      ResultadoAvaliacao resultado =
          avaliar(
              clienteAgitadoComExcecao(e -> {})
                  .maisUmArtigo("A-2", a -> a.getEstado().setAlterado(true)));

      assertThat(resultado.registo("EX-004").getResultado()).isEqualTo(Elegibilidade.RECUSAR);
      assertThat(resultado.decisao().isExcecaoRecusada()).isTrue();
    }

    @Test
    @Regra("EX-004")
    void compraNaoVerificadaNaoPodeSerAprovada() {
      ResultadoAvaliacao resultado = avaliar(clienteAgitadoComExcecao(e -> {}).semComprovativo());

      assertThat(resultado.registo("EX-004").getResultado()).isEqualTo(Elegibilidade.RECUSAR);
    }

    @Test
    @Regra("EX-004")
    @DisplayName("Resultado não concluível no sistema não pode ser aprovado (a validar A-18)")
    void naoConcluivelNoSistemaNaoPodeSerAprovado() {
      ResultadoAvaliacao resultado =
          avaliar(clienteAgitadoComExcecao(e -> e.setConcluivelNoSistema(false)));

      assertThat(resultado.registo("EX-004").getResultado()).isEqualTo(Elegibilidade.RECUSAR);
    }

    @Test
    @Regra({"EX-006", "EX-004"})
    @DisplayName("EX-006 anula a aprovação de EX-004")
    void excecaoComMeioProibidoERecusada() {
      ResultadoAvaliacao resultado =
          avaliar(clienteAgitadoComExcecao(e -> e.setExigeMeioProibido(true)));

      assertThat(resultado.disparos()).containsSequence("EX-004", "EX-006");
      assertThat(resultado.registo("EX-006").getResultado()).isEqualTo(Elegibilidade.RECUSAR);
      assertThat(resultado.decisao().isExcecaoRecusada()).isTrue();
      assertThat(resultado.disparos()).doesNotContain("EX-005");
    }

    @Test
    @Regra({"EX-006", "EX-001"})
    void excecaoQueContornaOProcessoObrigatorioNumaRevisao() {
      ResultadoAvaliacao resultado =
          avaliar(
              umPedido()
                  .artigo(a -> a.getEstado().setEtiquetas(EstadoEtiquetas.SOLTAS))
                  .com(
                      p -> {
                        PedidoExcecao excecao = new PedidoExcecao();
                        excecao.setContornaProcessoObrigatorio(true);
                        p.setPedidoExcecao(excecao);
                      }));

      assertThat(resultado.disparos()).contains("EX-001", "EX-006");
    }

    @Test
    @Regra("EX-005")
    void excecaoElegivelComArtigoVendavelPrefereAResolucaoMenosAbrangente() {
      ResultadoAvaliacao resultado =
          avaliar(clienteAgitadoComExcecao(e -> {}).artigo(a -> a.setRevendivel(true)));

      assertThat(resultado.disparos()).containsSequence("EX-004", "EX-005");
      assertThat(resultado.registo("EX-005").getMensagem())
          .contains("troca pelo mesmo artigo", "crédito de loja");
    }

    @Test
    @Regra("EX-005")
    void excecaoComArtigoNaoVendavelERecusada() {
      ResultadoAvaliacao resultado =
          avaliar(clienteAgitadoComExcecao(e -> {}).artigo(a -> a.setRevendivel(false)));

      assertThat(resultado.registo("EX-005").getResultado()).isEqualTo(Elegibilidade.RECUSAR);
      assertThat(resultado.decisao().isExcecaoRecusada()).isTrue();
    }

    @Test
    @Regra("EX-005")
    void semAvaliacaoDeRevendaNaoRecomenda() {
      assertThat(avaliar(clienteAgitadoComExcecao(e -> {})).disparos()).doesNotContain("EX-005");
    }

    @Test
    @Regra({"EX-005", "PC-004"})
    void artigoUsadoComExcecaoAprovadaSoTrocaPeloMesmoArtigo() {
      ResultadoAvaliacao resultado =
          avaliar(
              clienteAgitadoComExcecao(e -> e.setAprovada(true))
                  .artigo(
                      a -> {
                        a.getEstado().setCondicaoUso(CondicaoUso.USADO);
                        a.setRevendivel(true);
                      }));

      assertThat(resultado.artigo("A-1").getTipoTransacao())
          .isEqualTo(TipoTransacao.TROCA_MESMO_ARTIGO);
    }
  }
}

package com.levis.devolucoes.model.decisao;

import static org.assertj.core.api.Assertions.assertThat;

import com.levis.devolucoes.model.enums.Elegibilidade;
import com.levis.devolucoes.model.enums.Modulo;
import com.levis.devolucoes.model.enums.NivelAprovacao;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

/** Semântica de aplicar(), terminal e suspender() (ADR 0004). */
class DecisaoTest {

  private final Decisao decisao = new Decisao("P-1");

  @Test
  void registaCadaRegraNoRasto() {
    Clock relogio = Clock.fixed(Instant.parse("2026-03-31T10:15:00Z"), ZoneOffset.UTC);
    decisao.usarRelogio(relogio);

    decisao.aplicar("PT-003", Modulo.M5, Elegibilidade.PERMITIR, "Reembolso total.");

    assertThat(decisao.getRegistos())
        .singleElement()
        .satisfies(
            r -> {
              assertThat(r.getCodigoRegra()).isEqualTo("PT-003");
              assertThat(r.getModulo()).isEqualTo(Modulo.M5);
              assertThat(r.getResultado()).isEqualTo(Elegibilidade.PERMITIR);
              assertThat(r.getMensagem()).isEqualTo("Reembolso total.");
              assertThat(r.getInstante()).isEqualTo(LocalDateTime.of(2026, 3, 31, 10, 15));
            });
    assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.PERMITIR);
    assertThat(decisao.disparou("PT-003")).isTrue();
    assertThat(decisao.disparou("PT-004")).isFalse();
  }

  @Test
  void nuncaBaixaASeveridade() {
    decisao.aplicar("PT-004", Modulo.M5, Elegibilidade.REVER, "Após 30 dias.");
    decisao.aplicar("PC-001", Modulo.M3, Elegibilidade.PERMITIR, "Estado elegível.");

    assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.REVER);
    assertThat(decisao.getRegistos()).hasSize(2);
  }

  @Test
  void sobeASeveridade() {
    decisao.aplicar("PC-001", Modulo.M3, Elegibilidade.PERMITIR, "Estado elegível.");
    decisao.aplicar("PT-008", Modulo.M5, Elegibilidade.RECUSAR, "Ajuste recusado.");

    assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.RECUSAR);
  }

  @ParameterizedTest
  @ValueSource(strings = {"HS-001", "HS-002", "HS-003", "HS-004", "HS-006", "CH-007", "CH-008"})
  void paragemObrigatoriaTerminaOFluxo(String regra) {
    decisao.aplicar(regra, Modulo.M3, Elegibilidade.RECUSAR, "Paragem.");
    assertThat(decisao.isTerminal()).isTrue();
  }

  @Test
  void ch002EncaminhaSemTerminar() {
    decisao.aplicar("CH-002", Modulo.ONLINE, Elegibilidade.ENCAMINHAR, "BackPocket.");

    assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.ENCAMINHAR);
    assertThat(decisao.isTerminal()).isFalse();
  }

  @Test
  void hs005NaoTerminaOFluxo() {
    decisao.aplicar("HS-005", Modulo.ONLINE, Elegibilidade.RECUSAR, "Exceção Afterpay recusada.");
    assertThat(decisao.isTerminal()).isFalse();
  }

  @Test
  void paragemQuePermiteNaoTermina() {
    decisao.aplicar("HS-006", Modulo.M0, Elegibilidade.PERMITIR, "Autorizado.");
    assertThat(decisao.isTerminal()).isFalse();
  }

  @Test
  void resolverRevisaoPassaDeReverAPermitir() {
    decisao.aplicar("PC-002", Modulo.M3, Elegibilidade.REVER, "Etiquetas soltas.");
    decisao.resolverRevisao("PC-002", Modulo.M3, "Revendível: aprovado.");

    assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.PERMITIR);
    assertThat(decisao.getRegistos()).hasSize(2);
  }

  @Test
  void resolverRevisaoNaoAlteraUmaRecusa() {
    decisao.aplicar("PC-005", Modulo.M3, Elegibilidade.RECUSAR, "Lavado.");
    decisao.resolverRevisao("PC-002", Modulo.M3, "Revendível.");

    assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.RECUSAR);
  }

  @Test
  void registarNaoAlteraAElegibilidade() {
    decisao.registar("CT-005", Modulo.M8, "Assinaturas.");

    assertThat(decisao.getElegibilidade()).isNull();
    assertThat(decisao.getRegistos().getFirst().getResultado()).isNull();
  }

  @Test
  void suspenderPorFraudeTerminaEmReverComEscalonamento() {
    decisao.aplicar("PC-001", Modulo.M3, Elegibilidade.PERMITIR, "Estado elegível.");
    decisao.suspender("EX-008", Modulo.M3, "Transação suspensa.");

    assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.REVER);
    assertThat(decisao.getAprovacao()).isEqualTo(NivelAprovacao.DISTRICT_AREA);
    assertThat(decisao.isTerminal()).isTrue();
    assertThat(decisao.getRegistos().getLast().getResultado()).isEqualTo(Elegibilidade.REVER);
  }

  @Test
  void suspenderSobrepoeUmaRecusaAnterior() {
    decisao.aplicar("PT-008", Modulo.M5, Elegibilidade.RECUSAR, "Ajuste recusado.");
    decisao.suspender("EX-008", Modulo.M5, "Transação suspensa.");

    assertThat(decisao.getElegibilidade()).isEqualTo(Elegibilidade.REVER);
  }

  @Test
  void decisaoArtigoTemOMesmoComportamento() {
    DecisaoArtigo artigo = new DecisaoArtigo("P-1", "A-1");
    artigo.aplicar("HS-003", Modulo.M3, Elegibilidade.RECUSAR, "Embainhado.");

    assertThat(artigo.isTerminal()).isTrue();
    assertThat(artigo.getAprovacao()).isEqualTo(NivelAprovacao.NENHUMA);
  }

  @Test
  void valoresIniciais() {
    assertThat(decisao.getPedidoId()).isEqualTo("P-1");
    assertThat(decisao.getAprovacao()).isEqualTo(NivelAprovacao.NENHUMA);
    assertThat(decisao.getDocumentacao()).isNotNull();
    assertThat(decisao.getResultadosArtigos()).isEmpty();
    assertThat(decisao.isTerminal()).isFalse();
  }
}

package com.levis.devolucoes.explicacao.rastreio;

import static com.levis.devolucoes.explicacao.SuporteExplicacoes.cenario;
import static org.assertj.core.api.Assertions.assertThat;

import com.levis.devolucoes.explicacao.motor.ResultadoExecucao;
import com.levis.devolucoes.model.enums.Elegibilidade;
import org.junit.jupiter.api.Test;

class RastreioTest {

  @Test
  void registaOsDisparosComMensagemEAlteracoes() {
    ResultadoExecucao resultado = cenario(7);

    EventoRegra pt003 =
        resultado.rastreio().disparos().stream()
            .filter(e -> e.codigoRegra().equals("PT-003"))
            .findFirst()
            .orElseThrow();
    assertThat(pt003.modulo()).isEqualTo("M5");
    assertThat(pt003.resultado()).isEqualTo(Elegibilidade.PERMITIR);
    assertThat(pt003.mensagem()).contains("18 dias");
    assertThat(pt003.alteracoes())
        .contains(
            new AlteracaoCampo(
                InstantaneoDecisao.PEDIDO, "elegibilidade", null, Elegibilidade.PERMITIR));
  }

  @Test
  void identificaOArtigoDasRegrasDeArtigo() {
    ResultadoExecucao resultado = cenario(4);

    EventoRegra hs003 =
        resultado.rastreio().disparos().stream()
            .filter(e -> e.codigoRegra().equals("HS-003"))
            .findFirst()
            .orElseThrow();
    assertThat(hs003.artigoId()).isEqualTo("A-1");
    assertThat(hs003.alteracoes())
        .anyMatch(a -> a.alvo().equals("A-1") && a.campo().equals("terminal"));
  }

  @Test
  void cadaDisparoTemUmaAtivacaoAnterior() {
    ResultadoExecucao resultado = cenario(5);

    for (EventoRegra disparo : resultado.rastreio().disparos()) {
      assertThat(resultado.rastreio().eventos())
          .as("ativação de %s", disparo.nomeRegra())
          .anyMatch(
              e ->
                  e.tipo() == TipoEvento.CRIADA
                      && e.nomeRegra().equals(disparo.nomeRegra())
                      && e.sequencia() < disparo.sequencia());
    }
  }

  @Test
  void aSequenciaDeDisparosCoincideComORastoDasDecisoes() {
    ResultadoExecucao resultado = cenario(1);

    long registos =
        resultado.decisao().getRegistos().size()
            + resultado.artigos().values().stream().mapToLong(a -> a.getRegistos().size()).sum();
    assertThat(resultado.rastreio().disparos()).hasSize((int) registos);
    assertThat(resultado.rastreio().disparos()).allMatch(e -> e.mensagem() != null);
  }
}

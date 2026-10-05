package com.levis.devolucoes.explicacao.motor;

import com.levis.devolucoes.explicacao.rastreio.RastreioListener;
import com.levis.devolucoes.model.decisao.Decisao;
import com.levis.devolucoes.model.decisao.DecisaoArtigo;
import com.levis.devolucoes.model.decisao.IndicadorFraude;
import com.levis.devolucoes.model.pedido.PedidoDevolucao;
import com.levis.devolucoes.model.produto.ArtigoDevolvido;
import java.time.Clock;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;

/**
 * Executa a base de conhecimento sobre um pedido: insere o pedido, cada artigo com a sua
 * DecisaoArtigo, a Decisao e os indícios de fraude, dá o foco aos agenda-groups pela ordem indicada
 * e regista o rastreio. Uma sessão por pedido.
 */
public class ExecutorSessao {

  /** Limite de disparos: acima disto há um ciclo nas regras. */
  public static final int LIMITE_DISPAROS = 1_000;

  private final KieContainer contentor;
  private final String nomeSessao;
  private final List<String> gruposPorOrdem;
  private final Clock relogio;

  /**
   * @param contentor contentor com a base de conhecimento (kjar)
   * @param nomeSessao ksession stateful do kmodule
   * @param gruposPorOrdem agenda-groups pela ordem de avaliação (o primeiro é avaliado primeiro)
   * @param relogio relógio dos instantes do rasto
   */
  public ExecutorSessao(
      KieContainer contentor, String nomeSessao, List<String> gruposPorOrdem, Clock relogio) {
    this.contentor = Objects.requireNonNull(contentor);
    this.nomeSessao = Objects.requireNonNull(nomeSessao);
    this.gruposPorOrdem = List.copyOf(gruposPorOrdem);
    this.relogio = Objects.requireNonNull(relogio);
  }

  public KieContainer contentor() {
    return contentor;
  }

  public ResultadoExecucao executar(PedidoDevolucao pedido, List<IndicadorFraude> fraudes) {
    Decisao decisao = new Decisao(pedido.getId());
    decisao.usarRelogio(relogio);
    Map<String, DecisaoArtigo> artigos = new LinkedHashMap<>();
    for (ArtigoDevolvido artigo : pedido.getArtigos()) {
      DecisaoArtigo decisaoArtigo = new DecisaoArtigo(pedido.getId(), artigo.getId());
      decisaoArtigo.usarRelogio(relogio);
      artigos.put(artigo.getId(), decisaoArtigo);
    }

    RastreioListener rastreio = new RastreioListener(decisao, artigos.values());
    KieSession sessao = contentor.newKieSession(nomeSessao);
    sessao.addEventListener(rastreio);
    try {
      sessao.insert(pedido);
      for (ArtigoDevolvido artigo : pedido.getArtigos()) {
        sessao.insert(artigo);
        sessao.insert(artigos.get(artigo.getId()));
      }
      sessao.insert(decisao);
      for (IndicadorFraude fraude : fraudes) {
        sessao.insert(fraude);
      }
      for (String grupo : gruposPorOrdem.reversed()) {
        sessao.getAgenda().getAgendaGroup(grupo).setFocus();
      }
      int total = sessao.fireAllRules(LIMITE_DISPAROS);
      if (total >= LIMITE_DISPAROS) {
        throw new IllegalStateException("Possível ciclo nas regras: " + total + " disparos");
      }
    } finally {
      sessao.dispose();
    }
    return new ResultadoExecucao(
        pedido, List.copyOf(fraudes), decisao, artigos, rastreio.rastreio());
  }
}

package com.levis.devolucoes.explicacao.rastreio;

import com.levis.devolucoes.model.decisao.Decisao;
import com.levis.devolucoes.model.decisao.DecisaoArtigo;
import com.levis.devolucoes.model.decisao.DecisaoBase;
import com.levis.devolucoes.model.decisao.RegistoRegra;
import com.levis.devolucoes.model.enums.Elegibilidade;
import com.levis.devolucoes.model.produto.ArtigoDevolvido;
import java.util.ArrayList;
import java.util.Collection;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;
import org.kie.api.definition.rule.Rule;
import org.kie.api.event.rule.AfterMatchFiredEvent;
import org.kie.api.event.rule.BeforeMatchFiredEvent;
import org.kie.api.event.rule.DefaultAgendaEventListener;
import org.kie.api.event.rule.MatchCancelledEvent;
import org.kie.api.event.rule.MatchCreatedEvent;
import org.kie.api.runtime.rule.Match;

/**
 * Regista na {@link RastreioExecucao} as ativações criadas, disparadas e canceladas, com a mensagem
 * de cada disparo e os campos de saída que alterou.
 */
public class RastreioListener extends DefaultAgendaEventListener {

  private final Decisao decisao;
  private final Collection<DecisaoArtigo> artigos;
  private final List<EventoRegra> eventos = new ArrayList<>();

  private InstantaneoDecisao antesDoDisparo;
  private final Map<DecisaoBase, Integer> registosAntes = new IdentityHashMap<>();

  public RastreioListener(Decisao decisao, Collection<DecisaoArtigo> artigos) {
    this.decisao = decisao;
    this.artigos = artigos;
  }

  @Override
  public void matchCreated(MatchCreatedEvent evento) {
    acrescentar(TipoEvento.CRIADA, evento.getMatch(), null, null, null, List.of());
  }

  @Override
  public void matchCancelled(MatchCancelledEvent evento) {
    acrescentar(
        TipoEvento.CANCELADA,
        evento.getMatch(),
        null,
        null,
        String.valueOf(evento.getCause()),
        List.of());
  }

  @Override
  public void beforeMatchFired(BeforeMatchFiredEvent evento) {
    antesDoDisparo = InstantaneoDecisao.capturar(decisao, artigos);
    registosAntes.clear();
    registosAntes.put(decisao, decisao.getRegistos().size());
    for (DecisaoArtigo artigo : artigos) {
      registosAntes.put(artigo, artigo.getRegistos().size());
    }
  }

  @Override
  public void afterMatchFired(AfterMatchFiredEvent evento) {
    InstantaneoDecisao depois = InstantaneoDecisao.capturar(decisao, artigos);
    List<AlteracaoCampo> alteracoes =
        antesDoDisparo == null ? List.of() : antesDoDisparo.diferencas(depois);

    String codigo = codigo(evento.getMatch().getRule());
    RegistoRegra registo = null;
    String artigoDoRegisto = null;
    for (Map.Entry<DecisaoBase, Integer> entrada : registosAntes.entrySet()) {
      List<RegistoRegra> registos = entrada.getKey().getRegistos();
      if (registos.size() > entrada.getValue()
          && codigo.equals(registos.getLast().getCodigoRegra())) {
        registo = registos.getLast();
        if (entrada.getKey() instanceof DecisaoArtigo artigo) {
          artigoDoRegisto = artigo.getArtigoId();
        }
        break;
      }
    }
    EventoRegra base =
        criar(
            TipoEvento.DISPARADA,
            evento.getMatch(),
            registo == null ? null : registo.getResultado(),
            registo == null ? null : registo.getMensagem(),
            null,
            alteracoes);
    if (artigoDoRegisto != null && base.artigoId() == null) {
      base =
          new EventoRegra(
              base.sequencia(),
              base.tipo(),
              base.codigoRegra(),
              base.nomeRegra(),
              base.modulo(),
              artigoDoRegisto,
              base.resultado(),
              base.mensagem(),
              null,
              alteracoes);
    }
    eventos.add(base);
  }

  private void acrescentar(
      TipoEvento tipo,
      Match match,
      Elegibilidade resultado,
      String mensagem,
      String causa,
      List<AlteracaoCampo> alteracoes) {
    eventos.add(criar(tipo, match, resultado, mensagem, causa, alteracoes));
  }

  private EventoRegra criar(
      TipoEvento tipo,
      Match match,
      Elegibilidade resultado,
      String mensagem,
      String causa,
      List<AlteracaoCampo> alteracoes) {
    Rule regra = match.getRule();
    return new EventoRegra(
        eventos.size() + 1,
        tipo,
        codigo(regra),
        regra.getName(),
        String.valueOf(regra.getMetaData().get("modulo")),
        artigoDe(match),
        resultado,
        mensagem,
        causa,
        List.copyOf(alteracoes));
  }

  private static String codigo(Rule regra) {
    Object id = regra.getMetaData().get("id");
    return id == null ? regra.getName() : id.toString();
  }

  private static String artigoDe(Match match) {
    for (Object objeto : match.getObjects()) {
      if (objeto instanceof DecisaoArtigo artigo) {
        return artigo.getArtigoId();
      }
      if (objeto instanceof ArtigoDevolvido artigo) {
        return artigo.getId();
      }
    }
    return null;
  }

  public RastreioExecucao rastreio() {
    return new RastreioExecucao(eventos);
  }
}

package com.levis.devolucoes.explicacao.rastreio;

import java.util.List;
import java.util.Optional;

/** Sequência de eventos da agenda numa avaliação, por ordem. */
public final class RastreioExecucao {

  private final List<EventoRegra> eventos;

  public RastreioExecucao(List<EventoRegra> eventos) {
    this.eventos = List.copyOf(eventos);
  }

  public List<EventoRegra> eventos() {
    return eventos;
  }

  /** Disparos, por ordem. */
  public List<EventoRegra> disparos() {
    return eventos.stream().filter(EventoRegra::disparou).toList();
  }

  /** IDs das regras disparadas, por ordem (com repetições). */
  public List<String> idsDisparados() {
    return disparos().stream().map(EventoRegra::codigoRegra).toList();
  }

  public boolean disparou(String codigoRegra, String artigoId) {
    return disparos().stream()
        .anyMatch(e -> e.codigoRegra().equals(codigoRegra) && e.doArtigo(artigoId));
  }

  /** Eventos de uma regra (todas as variantes), opcionalmente de um artigo. */
  public List<EventoRegra> eventosDe(String codigoRegra, String artigoId) {
    return eventos.stream()
        .filter(e -> e.codigoRegra().equals(codigoRegra) && e.doArtigo(artigoId))
        .toList();
  }

  /** Último disparo antes da sequência indicada. */
  public Optional<EventoRegra> disparoAnterior(int sequencia) {
    EventoRegra encontrado = null;
    for (EventoRegra evento : eventos) {
      if (evento.sequencia() >= sequencia) {
        break;
      }
      if (evento.disparou()) {
        encontrado = evento;
      }
    }
    return Optional.ofNullable(encontrado);
  }
}

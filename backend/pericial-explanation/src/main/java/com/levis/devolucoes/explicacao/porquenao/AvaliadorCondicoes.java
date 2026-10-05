package com.levis.devolucoes.explicacao.porquenao;

import com.levis.devolucoes.explicacao.catalogo.MetadadosRegra;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/** Avalia as condições declaradas de uma regra num contexto (pedido ou artigo). */
public class AvaliadorCondicoes {

  private final RegistoPredicados predicados;

  public AvaliadorCondicoes(RegistoPredicados predicados) {
    this.predicados = predicados;
  }

  public List<ResultadoCondicao> avaliar(MetadadosRegra regra, ContextoAvaliacao contexto) {
    List<ResultadoCondicao> resultados = new ArrayList<>();
    String artigoId = contexto.temArtigo() ? contexto.artigo().getId() : null;
    for (String nome : regra.condicoes()) {
      Optional<Predicado> predicado = predicados.predicado(nome);
      if (predicado.isEmpty()) {
        resultados.add(
            new ResultadoCondicao(
                nome, "(condição sem predicado registado)", null, null, artigoId));
        continue;
      }
      Predicado p = predicado.get();
      resultados.add(
          new ResultadoCondicao(
              nome, p.descricao(), p.avaliar(contexto), p.valorEm(contexto), artigoId));
    }
    return resultados;
  }

  /** A regra tem alguma condição sobre um artigo. */
  public boolean temCondicoesDeArtigo(MetadadosRegra regra) {
    return regra.condicoes().stream()
        .map(predicados::predicado)
        .flatMap(Optional::stream)
        .anyMatch(Predicado::doArtigo);
  }

  public RegistoPredicados predicados() {
    return predicados;
  }
}

package com.levis.devolucoes.explicacao.porquenao;

import com.levis.devolucoes.explicacao.catalogo.CatalogoRegras;
import com.levis.devolucoes.explicacao.catalogo.MetadadosRegra;
import com.levis.devolucoes.explicacao.motor.ResultadoExecucao;
import com.levis.devolucoes.explicacao.rastreio.AlteracaoCampo;
import com.levis.devolucoes.explicacao.rastreio.EventoRegra;
import com.levis.devolucoes.explicacao.rastreio.InstantaneoDecisao;
import com.levis.devolucoes.explicacao.rastreio.TipoEvento;
import com.levis.devolucoes.explicacao.texto.GeradorTexto;
import com.levis.devolucoes.model.produto.ArtigoDevolvido;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * "Porque não?": classifica a causa de uma regra não ter disparado — módulo não alcançado por uma
 * paragem anterior, ativação cancelada por precedência, ou condições falhadas.
 */
public class ExplicadorPorqueNao {

  private final CatalogoRegras catalogo;
  private final AvaliadorCondicoes avaliador;
  private final GeradorTexto texto;

  public ExplicadorPorqueNao(
      CatalogoRegras catalogo, AvaliadorCondicoes avaliador, GeradorTexto texto) {
    this.catalogo = catalogo;
    this.avaliador = avaliador;
    this.texto = texto;
  }

  /**
   * @param codigoRegra ID da regra (ex.: PC-006)
   * @param artigoId artigo, para regras de artigo; nulo para avaliar todos os artigos
   * @param resultado execução a explicar
   */
  public ExplicacaoPorqueNao explicar(
      String codigoRegra, String artigoId, ResultadoExecucao resultado) {
    List<MetadadosRegra> variantes = catalogo.variantes(codigoRegra);
    if (variantes.isEmpty()) {
      throw new IllegalArgumentException("Regra desconhecida: " + codigoRegra);
    }

    // 1. Disparou?
    if (resultado.rastreio().disparou(codigoRegra, artigoId)) {
      return new ExplicacaoPorqueNao(
          codigoRegra,
          artigoId,
          CausaNaoDisparo.DISPAROU,
          null,
          null,
          List.of(),
          texto.formatar("porquenao.disparou", codigoRegra));
    }

    // 2. Uma paragem obrigatória num módulo anterior terminou o fluxo?
    boolean semGuarda = variantes.stream().allMatch(MetadadosRegra::semGuardaTerminal);
    int moduloRegra = CatalogoRegras.ordemModulo(variantes.getFirst().modulo());
    if (!semGuarda) {
      Optional<EventoRegra> paragem = paragemAnterior(resultado, artigoId, moduloRegra);
      if (paragem.isPresent()) {
        EventoRegra p = paragem.get();
        return new ExplicacaoPorqueNao(
            codigoRegra,
            artigoId,
            CausaNaoDisparo.MODULO_NAO_ALCANCADO,
            p.codigoRegra(),
            null,
            List.of(),
            texto.formatar(
                "porquenao.modulo_nao_alcancado", codigoRegra, p.codigoRegra(), p.modulo()));
      }
    }

    // 3. Foi ativada e cancelada?
    List<EventoRegra> eventos = resultado.rastreio().eventosDe(codigoRegra, artigoId);
    Optional<EventoRegra> cancelamento =
        eventos.stream().filter(e -> e.tipo() == TipoEvento.CANCELADA).reduce((a, b) -> b);
    if (cancelamento.isPresent()) {
      Optional<EventoRegra> anterior =
          resultado.rastreio().disparoAnterior(cancelamento.get().sequencia());
      if (anterior.isPresent()) {
        EventoRegra culpada = anterior.get();
        return new ExplicacaoPorqueNao(
            codigoRegra,
            artigoId,
            CausaNaoDisparo.CANCELADA_POR_PRECEDENCIA,
            culpada.codigoRegra(),
            cancelamento.get().nomeRegra(),
            List.of(),
            texto.formatar(
                "porquenao.cancelada",
                codigoRegra,
                culpada.codigoRegra(),
                culpada.mensagem() == null ? culpada.nomeRegra() : culpada.mensagem()));
      }
    }

    // 4. Condições falhadas: a variante mais próxima de disparar
    List<ContextoAvaliacao> contextos = contextos(resultado, artigoId, variantes);
    List<ResultadoCondicao> melhor = null;
    String varianteMelhor = null;
    for (MetadadosRegra variante : variantes) {
      for (ContextoAvaliacao contexto : contextos) {
        List<ResultadoCondicao> avaliadas = avaliador.avaliar(variante, contexto);
        if (melhor == null || maisProxima(avaliadas, melhor)) {
          melhor = avaliadas;
          varianteMelhor = variante.nome();
        }
      }
    }
    List<ResultadoCondicao> condicoes = melhor == null ? List.of() : melhor;
    String falhadas =
        condicoes.stream()
            .filter(ResultadoCondicao::falhou)
            .map(ResultadoCondicao::descricao)
            .collect(Collectors.joining("; "));

    // 5. Condições cumpridas, mas uma paragem do mesmo módulo, com mais salience, terminou o fluxo
    if (falhadas.isEmpty() && !semGuarda) {
      Optional<EventoRegra> paragem = paragemNoModulo(resultado, artigoId, moduloRegra);
      if (paragem.isPresent()) {
        EventoRegra p = paragem.get();
        return new ExplicacaoPorqueNao(
            codigoRegra,
            artigoId,
            CausaNaoDisparo.CANCELADA_POR_PRECEDENCIA,
            p.codigoRegra(),
            varianteMelhor,
            condicoes,
            texto.formatar(
                "porquenao.cancelada",
                codigoRegra,
                p.codigoRegra(),
                p.mensagem() == null ? p.nomeRegra() : p.mensagem()));
      }
    }
    String resumo =
        falhadas.isEmpty()
            ? texto.formatar("porquenao.condicoes_cumpridas", codigoRegra)
            : texto.formatar("porquenao.condicoes", codigoRegra, falhadas);
    return new ExplicacaoPorqueNao(
        codigoRegra,
        artigoId,
        CausaNaoDisparo.CONDICOES_FALHADAS,
        null,
        varianteMelhor,
        condicoes,
        resumo);
  }

  /** Menos condições falhadas e, em empate, mais condições cumpridas. */
  private static boolean maisProxima(
      List<ResultadoCondicao> candidata, List<ResultadoCondicao> atual) {
    long falhasCandidata = candidata.stream().filter(ResultadoCondicao::falhou).count();
    long falhasAtual = atual.stream().filter(ResultadoCondicao::falhou).count();
    if (falhasCandidata != falhasAtual) {
      return falhasCandidata < falhasAtual;
    }
    return cumpridas(candidata) > cumpridas(atual);
  }

  private static long cumpridas(List<ResultadoCondicao> condicoes) {
    return condicoes.stream().filter(c -> Boolean.TRUE.equals(c.cumprida())).count();
  }

  /** Primeira regra que terminou o fluxo (do pedido ou do artigo) no mesmo módulo da regra. */
  private Optional<EventoRegra> paragemNoModulo(
      ResultadoExecucao resultado, String artigoId, int moduloRegra) {
    return resultado.rastreio().disparos().stream()
        .filter(e -> terminou(e, artigoId))
        .filter(e -> CatalogoRegras.ordemModulo(e.modulo()) == moduloRegra)
        .min(Comparator.comparingInt(EventoRegra::sequencia));
  }

  /**
   * Primeira regra que terminou o fluxo (do pedido ou do artigo) num módulo anterior ao da regra.
   */
  private Optional<EventoRegra> paragemAnterior(
      ResultadoExecucao resultado, String artigoId, int moduloRegra) {
    return resultado.rastreio().disparos().stream()
        .filter(e -> terminou(e, artigoId))
        .filter(e -> CatalogoRegras.ordemModulo(e.modulo()) < moduloRegra)
        .min(Comparator.comparingInt(EventoRegra::sequencia));
  }

  private static boolean terminou(EventoRegra evento, String artigoId) {
    for (AlteracaoCampo alteracao : evento.alteracoes()) {
      boolean alvo =
          alteracao.alvo().equals(InstantaneoDecisao.PEDIDO)
              || (artigoId != null && alteracao.alvo().equals(artigoId));
      if (alvo && alteracao.campo().equals("terminal") && Boolean.TRUE.equals(alteracao.depois())) {
        return true;
      }
    }
    return false;
  }

  private List<ContextoAvaliacao> contextos(
      ResultadoExecucao resultado, String artigoId, List<MetadadosRegra> variantes) {
    boolean deArtigo = variantes.stream().anyMatch(avaliador::temCondicoesDeArtigo);
    List<ContextoAvaliacao> contextos = new ArrayList<>();
    if (!deArtigo) {
      contextos.add(ContextoAvaliacao.doPedido(resultado));
    } else if (artigoId != null) {
      contextos.add(ContextoAvaliacao.doArtigo(resultado, artigoId));
    } else {
      for (ArtigoDevolvido artigo : resultado.pedido().getArtigos()) {
        contextos.add(ContextoAvaliacao.doArtigo(resultado, artigo.getId()));
      }
    }
    return contextos;
  }
}

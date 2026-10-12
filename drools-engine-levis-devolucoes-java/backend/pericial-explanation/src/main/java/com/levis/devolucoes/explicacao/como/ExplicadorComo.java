package com.levis.devolucoes.explicacao.como;

import com.levis.devolucoes.explicacao.catalogo.CampoSaida;
import com.levis.devolucoes.explicacao.catalogo.CatalogoRegras;
import com.levis.devolucoes.explicacao.catalogo.MetadadosRegra;
import com.levis.devolucoes.explicacao.motor.ResultadoExecucao;
import com.levis.devolucoes.explicacao.porquenao.AvaliadorCondicoes;
import com.levis.devolucoes.explicacao.porquenao.ContextoAvaliacao;
import com.levis.devolucoes.explicacao.porquenao.Predicado;
import com.levis.devolucoes.explicacao.porquenao.ResultadoCondicao;
import com.levis.devolucoes.explicacao.rastreio.AlteracaoCampo;
import com.levis.devolucoes.explicacao.rastreio.EventoRegra;
import com.levis.devolucoes.explicacao.rastreio.InstantaneoDecisao;
import com.levis.devolucoes.explicacao.texto.GeradorTexto;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * "Como?": justifica o caminho que o sistema seguiu para obter uma conclusão. Mostra o caminho
 * completo da avaliação ou o caminho de uma conclusão (um campo de saída).
 */
public class ExplicadorComo {

  private final CatalogoRegras catalogo;
  private final AvaliadorCondicoes avaliador;
  private final GeradorTexto texto;

  public ExplicadorComo(CatalogoRegras catalogo, AvaliadorCondicoes avaliador, GeradorTexto texto) {
    this.catalogo = catalogo;
    this.avaliador = avaliador;
    this.texto = texto;
  }

  /** Caminho completo: as regras disparadas, por ordem, e a paragem obrigatória, se houve. */
  public ExplicacaoComo explicar(ResultadoExecucao resultado) {
    List<PassoExplicacao> passos = new ArrayList<>();
    String paragem = null;
    String moduloParagem = null;
    for (EventoRegra disparo : resultado.rastreio().disparos()) {
      boolean aValidar =
          catalogo.porNome(disparo.nomeRegra()).map(MetadadosRegra::aValidar).orElse(false);
      passos.add(
          new PassoExplicacao(
              passos.size() + 1,
              disparo.modulo(),
              disparo.codigoRegra(),
              disparo.nomeRegra(),
              disparo.artigoId(),
              disparo.resultado(),
              disparo.mensagem(),
              aValidar));
      if (paragem == null && terminouPedido(disparo)) {
        paragem = disparo.codigoRegra();
        moduloParagem = disparo.modulo();
      }
    }
    List<String> modulos =
        passos.stream()
            .map(PassoExplicacao::modulo)
            .distinct()
            .sorted(Comparator.comparingInt(CatalogoRegras::ordemModulo))
            .toList();
    String resumo = texto.formatar("como.resumo", passos.size(), modulos.size());
    if (paragem != null) {
      resumo = resumo + " " + texto.formatar("como.paragem", paragem, moduloParagem);
    }
    return new ExplicacaoComo(passos, modulos, paragem, resumo);
  }

  /**
   * Caminho de uma conclusão: a regra que fixou o valor final do campo de saída, as condições que
   * se verificaram (com os valores dos factos) e as regras que o alteraram antes.
   *
   * @param artigoId artigo (obrigatório para OUT-007); nulo para a conclusão do pedido
   */
  public ExplicacaoConclusao explicarConclusao(
      CampoSaida campo, String artigoId, ResultadoExecucao resultado) {
    if (campo.doArtigo() && artigoId == null) {
      throw new IllegalArgumentException(
          campo.codigo() + " é uma conclusão por artigo: indique o artigo");
    }
    String alvo = artigoId == null ? InstantaneoDecisao.PEDIDO : artigoId;
    Map<String, Object> valores = new LinkedHashMap<>();
    resultado
        .instantaneo()
        .campos(alvo)
        .forEach(
            (nome, valor) -> {
              if (campo.inclui(nome)) {
                valores.put(nome, valor);
              }
            });

    List<String> caminho = new ArrayList<>();
    EventoRegra ultima = null;
    for (EventoRegra disparo : resultado.rastreio().disparos()) {
      for (AlteracaoCampo alteracao : disparo.alteracoes()) {
        if (alteracao.alvo().equals(alvo) && campo.inclui(alteracao.campo())) {
          caminho.add(
              disparo.codigoRegra()
                  + ": "
                  + alteracao.campo()
                  + " "
                  + alteracao.antes()
                  + " → "
                  + alteracao.depois());
          ultima = disparo;
        }
      }
    }
    if (ultima == null) {
      return new ExplicacaoConclusao(
          campo,
          artigoId,
          valores,
          null,
          null,
          List.of(),
          caminho,
          texto.formatar("como.conclusao_sem_regra", campo.codigo(), valores.values()));
    }

    EventoRegra regra = ultima;
    ContextoAvaliacao contexto =
        regra.artigoId() == null
            ? ContextoAvaliacao.doPedido(resultado)
            : ContextoAvaliacao.doArtigo(resultado, regra.artigoId());
    List<ResultadoCondicao> condicoes =
        catalogo
            .porNome(regra.nomeRegra())
            .map(
                meta ->
                    avaliador.avaliar(meta, contexto).stream().filter(this::sobreEntrada).toList())
            .orElse(List.of());
    String resumo =
        texto.formatar(
            "como.conclusao",
            campo.codigo(),
            valores.values(),
            regra.codigoRegra(),
            regra.mensagem() == null ? regra.nomeRegra() : regra.mensagem());
    return new ExplicacaoConclusao(
        campo,
        artigoId,
        valores,
        regra.codigoRegra(),
        regra.mensagem(),
        condicoes,
        caminho,
        resumo);
  }

  private boolean sobreEntrada(ResultadoCondicao condicao) {
    return avaliador
        .predicados()
        .predicado(condicao.nome())
        .map(Predicado::sobreEntrada)
        .orElse(false);
  }

  private static boolean terminouPedido(EventoRegra disparo) {
    return disparo.alteracoes().stream()
        .anyMatch(
            a ->
                a.alvo().equals(InstantaneoDecisao.PEDIDO)
                    && a.campo().equals("terminal")
                    && Boolean.TRUE.equals(a.depois()));
  }
}

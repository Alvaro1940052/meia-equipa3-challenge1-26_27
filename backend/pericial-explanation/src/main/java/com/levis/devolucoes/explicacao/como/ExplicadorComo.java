package com.levis.devolucoes.explicacao.como;

import com.levis.devolucoes.explicacao.catalogo.CatalogoRegras;
import com.levis.devolucoes.explicacao.catalogo.MetadadosRegra;
import com.levis.devolucoes.explicacao.motor.ResultadoExecucao;
import com.levis.devolucoes.explicacao.rastreio.EventoRegra;
import com.levis.devolucoes.explicacao.rastreio.InstantaneoDecisao;
import com.levis.devolucoes.explicacao.texto.GeradorTexto;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/** "Como?": percorre as regras disparadas pela ordem e mostra o caminho no fluxograma. */
public class ExplicadorComo {

  private final CatalogoRegras catalogo;
  private final GeradorTexto texto;

  public ExplicadorComo(CatalogoRegras catalogo, GeradorTexto texto) {
    this.catalogo = catalogo;
    this.texto = texto;
  }

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
      boolean terminouPedido =
          disparo.alteracoes().stream()
              .anyMatch(
                  a ->
                      a.alvo().equals(InstantaneoDecisao.PEDIDO)
                          && a.campo().equals("terminal")
                          && Boolean.TRUE.equals(a.depois()));
      if (paragem == null && terminouPedido) {
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
}

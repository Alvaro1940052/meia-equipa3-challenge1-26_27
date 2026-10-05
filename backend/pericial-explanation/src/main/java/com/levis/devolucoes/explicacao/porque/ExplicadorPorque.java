package com.levis.devolucoes.explicacao.porque;

import com.levis.devolucoes.explicacao.catalogo.CatalogoRegras;
import com.levis.devolucoes.explicacao.motor.ResultadoExecucao;
import com.levis.devolucoes.explicacao.porquenao.AvaliadorCondicoes;
import com.levis.devolucoes.explicacao.porquenao.ContextoAvaliacao;
import com.levis.devolucoes.explicacao.porquenao.ResultadoCondicao;
import com.levis.devolucoes.explicacao.rastreio.AlteracaoCampo;
import com.levis.devolucoes.explicacao.rastreio.EventoRegra;
import com.levis.devolucoes.explicacao.rastreio.InstantaneoDecisao;
import com.levis.devolucoes.explicacao.texto.GeradorTexto;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * "Porquê?": para um campo de saída, indica a regra que definiu o valor final, as condições que se
 * verificaram (com os valores dos factos) e o histórico de alterações.
 */
public class ExplicadorPorque {

  private final CatalogoRegras catalogo;
  private final AvaliadorCondicoes avaliador;
  private final GeradorTexto texto;

  public ExplicadorPorque(
      CatalogoRegras catalogo, AvaliadorCondicoes avaliador, GeradorTexto texto) {
    this.catalogo = catalogo;
    this.avaliador = avaliador;
    this.texto = texto;
  }

  /**
   * @param campo campo de saída
   * @param artigoId artigo, obrigatório para OUT-007
   */
  public ExplicacaoPorque explicar(CampoSaida campo, String artigoId, ResultadoExecucao resultado) {
    if (campo.doArtigo() && artigoId == null) {
      throw new IllegalArgumentException(
          campo.codigo() + " é um campo de artigo: indique o artigo");
    }
    String alvo = campo.doArtigo() ? artigoId : InstantaneoDecisao.PEDIDO;
    InstantaneoDecisao finalDecisao = resultado.instantaneo();
    Map<String, Object> valores = new LinkedHashMap<>();
    finalDecisao
        .campos(alvo)
        .forEach(
            (nome, valor) -> {
              if (campo.inclui(nome)) {
                valores.put(nome, valor);
              }
            });

    List<String> historico = new ArrayList<>();
    EventoRegra ultima = null;
    for (EventoRegra disparo : resultado.rastreio().disparos()) {
      for (AlteracaoCampo alteracao : disparo.alteracoes()) {
        if (alteracao.alvo().equals(alvo) && campo.inclui(alteracao.campo())) {
          historico.add(
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
      return new ExplicacaoPorque(
          campo,
          artigoId,
          valores,
          null,
          null,
          List.of(),
          historico,
          texto.formatar("porque.sem_regra", campo.codigo(), valores.values()));
    }
    EventoRegra regra = ultima;
    List<ResultadoCondicao> condicoes =
        catalogo
            .porNome(regra.nomeRegra())
            .map(
                meta ->
                    avaliador
                        .avaliar(
                            meta,
                            regra.artigoId() == null
                                ? ContextoAvaliacao.doPedido(resultado)
                                : ContextoAvaliacao.doArtigo(resultado, regra.artigoId()))
                        .stream()
                        .filter(c -> sobreEntrada(c.nome()))
                        .toList())
            .orElse(List.of());
    String resumo =
        texto.formatar(
            "porque.definido",
            campo.codigo(),
            valores.values(),
            regra.codigoRegra(),
            regra.mensagem() == null ? regra.nomeRegra() : regra.mensagem());
    return new ExplicacaoPorque(
        campo,
        artigoId,
        valores,
        regra.codigoRegra(),
        regra.mensagem(),
        condicoes,
        historico,
        resumo);
  }

  private boolean sobreEntrada(String condicao) {
    return avaliador.predicados().predicado(condicao).map(p -> p.sobreEntrada()).orElse(false);
  }
}

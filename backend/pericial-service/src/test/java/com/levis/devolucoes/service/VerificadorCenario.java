package com.levis.devolucoes.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.levis.devolucoes.dto.decisao.DecisaoResponse;
import com.levis.devolucoes.dto.decisao.RegistoRegraResponse;
import com.levis.devolucoes.dto.decisao.ResultadoArtigoResponse;
import java.util.ArrayList;
import java.util.List;
import org.assertj.core.api.SoftAssertions;

/**
 * Compara uma decisão com o "esperado" de um cenário de docs/06 (os mesmos critérios do teste de
 * aceitação das regras). Usado pelos testes do serviço e da API.
 */
public final class VerificadorCenario {

  private VerificadorCenario() {}

  public static void verificar(JsonNode e, DecisaoResponse decisao) {
    SoftAssertions verificacao = new SoftAssertions();
    comparar(verificacao, e, "elegibilidade", decisao.elegibilidade());
    comparar(verificacao, e, "tipoVerificacao", decisao.tipoVerificacao());
    comparar(verificacao, e, "tipoTransacao", decisao.tipoTransacao());
    comparar(verificacao, e, "meioReembolso", decisao.meioReembolso());
    comparar(verificacao, e, "aprovacao", decisao.aprovacao());
    comparar(verificacao, e, "processo", decisao.processo());
    comparar(verificacao, e, "terminal", decisao.terminal());
    comparar(verificacao, e, "excecaoRecusada", decisao.excecaoRecusada());
    if (e.has("valorDevolucao")) {
      verificacao
          .assertThat(decisao.valorDevolucao())
          .as("valor")
          .isEqualByComparingTo(e.get("valorDevolucao").decimalValue());
    }
    List<String> regras = decisao.regras().stream().map(RegistoRegraResponse::codigoRegra).toList();
    verificacao
        .assertThat(regras)
        .as("regras disparadas")
        .containsAll(textos(e.get("regrasDisparadas")));
    if (e.has("regrasNaoDisparadas")) {
      verificacao
          .assertThat(regras)
          .as("regras não disparadas")
          .doesNotContainAnyElementsOf(textos(e.get("regrasNaoDisparadas")));
    }
    if (e.has("artigos")) {
      e.get("artigos")
          .properties()
          .forEach(
              artigo -> {
                ResultadoArtigoResponse obtido =
                    decisao.artigos().stream()
                        .filter(a -> a.artigoId().equals(artigo.getKey()))
                        .findFirst()
                        .orElseThrow();
                comparar(verificacao, artigo.getValue(), "elegibilidade", obtido.elegibilidade());
                comparar(verificacao, artigo.getValue(), "destino", obtido.destino());
              });
    }
    verificacao.assertAll();
  }

  private static void comparar(
      SoftAssertions verificacao, JsonNode esperado, String campo, Object obtido) {
    if (esperado.has(campo)) {
      verificacao
          .assertThat(String.valueOf(obtido))
          .as(campo)
          .isEqualTo(esperado.get(campo).asText());
    }
  }

  private static List<String> textos(JsonNode lista) {
    List<String> textos = new ArrayList<>();
    if (lista != null) {
      lista.forEach(n -> textos.add(n.asText()));
    }
    return textos;
  }
}

package com.levis.devolucoes.explicacao.rastreio;

import com.levis.devolucoes.model.decisao.Decisao;
import com.levis.devolucoes.model.decisao.DecisaoArtigo;
import com.levis.devolucoes.model.decisao.Documentacao;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Valores dos campos de saída (OUT-001 a OUT-008) do pedido e de cada artigo, num dado momento. A
 * comparação de dois instantâneos indica que campos uma regra alterou.
 */
public final class InstantaneoDecisao {

  /** Alvo dos campos do pedido. */
  public static final String PEDIDO = "pedido";

  private final Map<String, Map<String, Object>> valores;

  private InstantaneoDecisao(Map<String, Map<String, Object>> valores) {
    this.valores = valores;
  }

  public static InstantaneoDecisao capturar(Decisao decisao, Collection<DecisaoArtigo> artigos) {
    Map<String, Map<String, Object>> valores = new LinkedHashMap<>();
    valores.put(PEDIDO, camposDoPedido(decisao));
    for (DecisaoArtigo artigo : artigos) {
      valores.put(artigo.getArtigoId(), camposDoArtigo(artigo));
    }
    return new InstantaneoDecisao(valores);
  }

  private static Map<String, Object> camposDoPedido(Decisao d) {
    Map<String, Object> campos = new LinkedHashMap<>();
    campos.put("elegibilidade", d.getElegibilidade());
    campos.put("tipoVerificacao", d.getTipoVerificacao());
    campos.put("tipoTransacao", d.getTipoTransacao());
    campos.put("valorDevolucao", d.getValorDevolucao());
    campos.put("baseValor", d.getBaseValor());
    campos.put("meioReembolso", d.getMeioReembolso());
    campos.put("aprovacao", d.getAprovacao());
    campos.put("processo", d.getProcesso());
    campos.put("terminal", d.isTerminal());
    campos.put("excecaoRecusada", d.isExcecaoRecusada());
    Documentacao doc = d.getDocumentacao();
    if (doc != null) {
      campos.put("documentacao.assinaturaCliente", doc.getAssinaturaCliente());
      campos.put("documentacao.assinaturaProcessador", doc.getAssinaturaProcessador());
      campos.put("documentacao.assinaturaTestemunha", doc.getAssinaturaTestemunha());
      campos.put("documentacao.idStylistAtribuido", doc.getIdStylistAtribuido());
      campos.put("documentacao.reciboAgrafado", doc.isReciboAgrafado());
      campos.put("documentacao.notaRecibo", doc.getNotaRecibo());
      campos.put("documentacao.retencaoAte", doc.getRetencaoAte());
      campos.put("documentacao.registoExcecao", doc.getRegistoExcecao());
    }
    return campos;
  }

  private static Map<String, Object> camposDoArtigo(DecisaoArtigo a) {
    Map<String, Object> campos = new LinkedHashMap<>();
    campos.put("elegibilidade", a.getElegibilidade());
    campos.put("tipoTransacao", a.getTipoTransacao());
    campos.put("valorDevolucao", a.getValorDevolucao());
    campos.put("baseValor", a.getBaseValor());
    campos.put("destino", a.getDestino());
    campos.put("descontoSaldo", a.getDescontoSaldo());
    campos.put("aprovacao", a.getAprovacao());
    campos.put("terminal", a.isTerminal());
    return campos;
  }

  /** Valor de um campo, ou nulo se o alvo ou o campo não existirem. */
  public Object valor(String alvo, String campo) {
    Map<String, Object> campos = valores.get(alvo);
    return campos == null ? null : campos.get(campo);
  }

  /** Campos de um alvo (pedido ou artigo), pela ordem OUT. */
  public Map<String, Object> campos(String alvo) {
    return valores.getOrDefault(alvo, Map.of());
  }

  /** Alterações deste instantâneo para o indicado (que é posterior). */
  public List<AlteracaoCampo> diferencas(InstantaneoDecisao depois) {
    List<AlteracaoCampo> alteracoes = new ArrayList<>();
    for (Map.Entry<String, Map<String, Object>> alvo : depois.valores.entrySet()) {
      Map<String, Object> antes = valores.getOrDefault(alvo.getKey(), Map.of());
      for (Map.Entry<String, Object> campo : alvo.getValue().entrySet()) {
        Object anterior = antes.get(campo.getKey());
        if (!iguais(anterior, campo.getValue())) {
          alteracoes.add(
              new AlteracaoCampo(alvo.getKey(), campo.getKey(), anterior, campo.getValue()));
        }
      }
    }
    return alteracoes;
  }

  private static boolean iguais(Object a, Object b) {
    if (a instanceof java.math.BigDecimal x && b instanceof java.math.BigDecimal y) {
      return x.compareTo(y) == 0;
    }
    return Objects.equals(a, b);
  }
}

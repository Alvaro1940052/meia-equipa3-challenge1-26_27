package com.levis.devolucoes.regras.cenarios;

import com.levis.devolucoes.model.enums.BaseValor;
import com.levis.devolucoes.model.enums.DestinoProduto;
import com.levis.devolucoes.model.enums.Elegibilidade;
import com.levis.devolucoes.model.enums.MeioReembolso;
import com.levis.devolucoes.model.enums.NivelAprovacao;
import com.levis.devolucoes.model.enums.ProcessoObrigatorio;
import com.levis.devolucoes.model.enums.TipoTransacao;
import com.levis.devolucoes.model.enums.TipoVerificacao;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Resultado esperado de um cenário. Todos os campos são opcionais: os nulos não são verificados, o
 * que permite preencher o esperado módulo a módulo (Fase 4).
 */
public record Esperado(
    Elegibilidade elegibilidade,
    TipoVerificacao tipoVerificacao,
    TipoTransacao tipoTransacao,
    BigDecimal valorDevolucao,
    BaseValor baseValor,
    MeioReembolso meioReembolso,
    NivelAprovacao aprovacao,
    ProcessoObrigatorio processo,
    Boolean terminal,
    List<String> regrasDisparadas,
    List<String> regrasNaoDisparadas,
    Map<String, Artigo> artigos) {

  /** Resultado esperado de um artigo. */
  public record Artigo(
      Elegibilidade elegibilidade,
      TipoTransacao tipoTransacao,
      DestinoProduto destino,
      List<String> regrasDisparadas) {}
}

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
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Resultado esperado de um cenário (OUT-001 a OUT-008). Os campos nulos não são verificados; a
 * elegibilidade e as regras disparadas são obrigatórias (Fase 4.10).
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
    Boolean excecaoRecusada,
    Documentacao documentacao,
    List<String> regrasDisparadas,
    List<String> regrasNaoDisparadas,
    Map<String, Artigo> artigos) {

  /** Documentação esperada (OUT-008). */
  public record Documentacao(
      String idStylistAtribuido,
      Boolean reciboAgrafado,
      String assinaturaTestemunha,
      LocalDate retencaoAte) {}

  /** Resultado esperado de um artigo (inclui OUT-007, destino). */
  public record Artigo(
      Elegibilidade elegibilidade,
      TipoTransacao tipoTransacao,
      BigDecimal valorDevolucao,
      DestinoProduto destino,
      Integer descontoSaldo,
      List<String> regrasDisparadas) {}
}

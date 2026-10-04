package com.levis.devolucoes.model.decisao;

import com.levis.devolucoes.model.enums.BaseValor;
import com.levis.devolucoes.model.enums.Elegibilidade;
import com.levis.devolucoes.model.enums.MeioReembolso;
import com.levis.devolucoes.model.enums.Modulo;
import com.levis.devolucoes.model.enums.NivelAprovacao;
import com.levis.devolucoes.model.enums.ProcessoObrigatorio;
import com.levis.devolucoes.model.enums.TipoTransacao;
import com.levis.devolucoes.model.enums.TipoVerificacao;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/** Facto de saída do pedido: preenche os campos OUT-001 a OUT-008 e guarda o rasto das regras. */
public class Decisao extends DecisaoBase {

  private String pedidoId;
  private TipoVerificacao tipoVerificacao = TipoVerificacao.NAO_DETERMINADA;
  private TipoTransacao tipoTransacao;
  private BigDecimal valorDevolucao;
  private BaseValor baseValor;
  private MeioReembolso meioReembolso;
  private NivelAprovacao aprovacao = NivelAprovacao.NENHUMA;
  private ProcessoObrigatorio processo;
  private Documentacao documentacao = new Documentacao();

  /** Resultados por artigo, agregados no fim da avaliação (ADR 0002). */
  private List<DecisaoArtigo> resultadosArtigos = new ArrayList<>();

  public Decisao() {}

  public Decisao(String pedidoId) {
    this.pedidoId = pedidoId;
  }

  /**
   * EX-008: suspende a transação. Termina o fluxo, fica em REVER e exige escalonamento para
   * District ou Area (ADR 0004).
   */
  public void suspender(String regra, Modulo modulo, String mensagem) {
    registar(regra, modulo, Elegibilidade.REVER, mensagem);
    definirElegibilidade(Elegibilidade.REVER);
    aprovacao = NivelAprovacao.DISTRICT_AREA;
    terminar();
  }

  public String getPedidoId() {
    return pedidoId;
  }

  public void setPedidoId(String pedidoId) {
    this.pedidoId = pedidoId;
  }

  public TipoVerificacao getTipoVerificacao() {
    return tipoVerificacao;
  }

  public void setTipoVerificacao(TipoVerificacao tipoVerificacao) {
    this.tipoVerificacao = tipoVerificacao;
  }

  public TipoTransacao getTipoTransacao() {
    return tipoTransacao;
  }

  public void setTipoTransacao(TipoTransacao tipoTransacao) {
    this.tipoTransacao = tipoTransacao;
  }

  public BigDecimal getValorDevolucao() {
    return valorDevolucao;
  }

  public void setValorDevolucao(BigDecimal valorDevolucao) {
    this.valorDevolucao = valorDevolucao;
  }

  public BaseValor getBaseValor() {
    return baseValor;
  }

  public void setBaseValor(BaseValor baseValor) {
    this.baseValor = baseValor;
  }

  public MeioReembolso getMeioReembolso() {
    return meioReembolso;
  }

  public void setMeioReembolso(MeioReembolso meioReembolso) {
    this.meioReembolso = meioReembolso;
  }

  public NivelAprovacao getAprovacao() {
    return aprovacao;
  }

  public void setAprovacao(NivelAprovacao aprovacao) {
    this.aprovacao = aprovacao;
  }

  public ProcessoObrigatorio getProcesso() {
    return processo;
  }

  public void setProcesso(ProcessoObrigatorio processo) {
    this.processo = processo;
  }

  public Documentacao getDocumentacao() {
    return documentacao;
  }

  public void setDocumentacao(Documentacao documentacao) {
    this.documentacao = documentacao;
  }

  public List<DecisaoArtigo> getResultadosArtigos() {
    return resultadosArtigos;
  }

  public void setResultadosArtigos(List<DecisaoArtigo> resultadosArtigos) {
    this.resultadosArtigos = resultadosArtigos;
  }
}

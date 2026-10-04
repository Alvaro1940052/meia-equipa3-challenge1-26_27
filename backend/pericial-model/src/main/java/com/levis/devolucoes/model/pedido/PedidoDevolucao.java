package com.levis.devolucoes.model.pedido;

import com.levis.devolucoes.model.enums.CanalCompra;
import com.levis.devolucoes.model.enums.Modulo;
import com.levis.devolucoes.model.enums.TipoPedido;
import com.levis.devolucoes.model.produto.ArtigoDevolvido;
import com.levis.devolucoes.model.produto.ArtigoTroca;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/** Facto raiz: o pedido apresentado pelo cliente na loja, com todos os dados de entrada (IN). */
public class PedidoDevolucao {

  private String id;
  private LocalDate dataPedido;
  private TipoPedido tipoPedido;
  private Loja loja;
  private Colaborador colaborador;
  private Cliente cliente;
  private CompraOriginal compraOriginal;
  private Comprovativo comprovativo;
  private List<ArtigoDevolvido> artigos = new ArrayList<>();
  private List<ArtigoTroca> artigosTroca = new ArrayList<>();
  private boolean portalOnlineDisponivel = true;

  /** CH-003: a política permite a devolução online às cegas neste caso (ADR 0003, A-03). */
  private boolean politicaPermiteAsCegasOnline;

  private PedidoExcecao pedidoExcecao;
  private boolean suspenso;
  private Modulo moduloAtual;

  /**
   * Dias entre a compra e o pedido (IN-006).
   *
   * @return o número de dias, ou nulo se a data da compra for desconhecida (devolução às cegas,
   *     A-16)
   */
  public Long getDiasDesdeCompra() {
    return diasDesde(compraOriginal == null ? null : compraOriginal.getDataCompra());
  }

  /**
   * Dias entre o envio da encomenda online e o pedido (CH-005).
   *
   * @return o número de dias, ou nulo se a data de envio for desconhecida
   */
  public Long getDiasDesdeEnvio() {
    return diasDesde(compraOriginal == null ? null : compraOriginal.getDataEnvio());
  }

  /** Compra em levi.com ou levi.ca; a BackPocket segue o caminho de loja (ADR 0003, A-02). */
  public boolean isCompraOnline() {
    if (compraOriginal == null) {
      return false;
    }
    CanalCompra canal = compraOriginal.getCanal();
    return canal == CanalCompra.LEVI_COM || canal == CanalCompra.LEVI_CA;
  }

  private Long diasDesde(LocalDate data) {
    if (data == null || dataPedido == null) {
      return null;
    }
    return ChronoUnit.DAYS.between(data, dataPedido);
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public LocalDate getDataPedido() {
    return dataPedido;
  }

  public void setDataPedido(LocalDate dataPedido) {
    this.dataPedido = dataPedido;
  }

  public TipoPedido getTipoPedido() {
    return tipoPedido;
  }

  public void setTipoPedido(TipoPedido tipoPedido) {
    this.tipoPedido = tipoPedido;
  }

  public Loja getLoja() {
    return loja;
  }

  public void setLoja(Loja loja) {
    this.loja = loja;
  }

  public Colaborador getColaborador() {
    return colaborador;
  }

  public void setColaborador(Colaborador colaborador) {
    this.colaborador = colaborador;
  }

  public Cliente getCliente() {
    return cliente;
  }

  public void setCliente(Cliente cliente) {
    this.cliente = cliente;
  }

  public CompraOriginal getCompraOriginal() {
    return compraOriginal;
  }

  public void setCompraOriginal(CompraOriginal compraOriginal) {
    this.compraOriginal = compraOriginal;
  }

  public Comprovativo getComprovativo() {
    return comprovativo;
  }

  public void setComprovativo(Comprovativo comprovativo) {
    this.comprovativo = comprovativo;
  }

  public List<ArtigoDevolvido> getArtigos() {
    return artigos;
  }

  public void setArtigos(List<ArtigoDevolvido> artigos) {
    this.artigos = artigos;
  }

  public List<ArtigoTroca> getArtigosTroca() {
    return artigosTroca;
  }

  public void setArtigosTroca(List<ArtigoTroca> artigosTroca) {
    this.artigosTroca = artigosTroca;
  }

  public boolean isPortalOnlineDisponivel() {
    return portalOnlineDisponivel;
  }

  public void setPortalOnlineDisponivel(boolean portalOnlineDisponivel) {
    this.portalOnlineDisponivel = portalOnlineDisponivel;
  }

  public boolean isPoliticaPermiteAsCegasOnline() {
    return politicaPermiteAsCegasOnline;
  }

  public void setPoliticaPermiteAsCegasOnline(boolean politicaPermiteAsCegasOnline) {
    this.politicaPermiteAsCegasOnline = politicaPermiteAsCegasOnline;
  }

  public PedidoExcecao getPedidoExcecao() {
    return pedidoExcecao;
  }

  public void setPedidoExcecao(PedidoExcecao pedidoExcecao) {
    this.pedidoExcecao = pedidoExcecao;
  }

  public boolean isSuspenso() {
    return suspenso;
  }

  public void setSuspenso(boolean suspenso) {
    this.suspenso = suspenso;
  }

  public Modulo getModuloAtual() {
    return moduloAtual;
  }

  public void setModuloAtual(Modulo moduloAtual) {
    this.moduloAtual = moduloAtual;
  }
}

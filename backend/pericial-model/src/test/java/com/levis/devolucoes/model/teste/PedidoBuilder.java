package com.levis.devolucoes.model.teste;

import com.levis.devolucoes.model.enums.CanalCompra;
import com.levis.devolucoes.model.enums.CategoriaProduto;
import com.levis.devolucoes.model.enums.CondicaoUso;
import com.levis.devolucoes.model.enums.EstadoConta;
import com.levis.devolucoes.model.enums.EstadoEtiquetas;
import com.levis.devolucoes.model.enums.Funcao;
import com.levis.devolucoes.model.enums.Marca;
import com.levis.devolucoes.model.enums.MeioPagamento;
import com.levis.devolucoes.model.enums.Mercado;
import com.levis.devolucoes.model.enums.TipoComprovativo;
import com.levis.devolucoes.model.enums.TipoLoja;
import com.levis.devolucoes.model.enums.TipoPedido;
import com.levis.devolucoes.model.pedido.Cliente;
import com.levis.devolucoes.model.pedido.Colaborador;
import com.levis.devolucoes.model.pedido.CompraOriginal;
import com.levis.devolucoes.model.pedido.Comprovativo;
import com.levis.devolucoes.model.pedido.Loja;
import com.levis.devolucoes.model.pedido.Pagamento;
import com.levis.devolucoes.model.pedido.PedidoDevolucao;
import com.levis.devolucoes.model.produto.ArtigoDevolvido;
import com.levis.devolucoes.model.produto.EstadoProduto;
import com.levis.devolucoes.model.produto.Produto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.function.Consumer;

/**
 * Construtor de pedidos para testes. Por omissão cria o caso padrão: loja Mainline nos EUA, Key
 * Holder, compra Mainline há 10 dias paga com cartão de crédito, recibo impresso original e um
 * artigo Levi's não usado com etiquetas colocadas.
 */
public final class PedidoBuilder {

  public static final LocalDate DATA_PEDIDO = LocalDate.of(2026, 3, 31);
  public static final BigDecimal PRECO_PADRAO = new BigDecimal("98.00");

  private final PedidoDevolucao pedido = new PedidoDevolucao();

  private PedidoBuilder() {
    pedido.setId("P-1");
    pedido.setDataPedido(DATA_PEDIDO);
    pedido.setTipoPedido(TipoPedido.DEVOLUCAO);

    Loja loja = new Loja();
    loja.setCodigo("L-001");
    loja.setNome("Loja de teste");
    loja.setMercado(Mercado.EUA);
    loja.setTipoLoja(TipoLoja.MAINLINE);
    pedido.setLoja(loja);

    Colaborador colaborador = new Colaborador();
    colaborador.setId("C-1");
    colaborador.setNome("Colaborador de teste");
    colaborador.setFuncao(Funcao.KEY_HOLDER);
    colaborador.setIdCredencialPOS("POS-C-1");
    pedido.setColaborador(colaborador);

    pedido.setCliente(new Cliente());

    Pagamento pagamento = new Pagamento();
    pagamento.setMeio(MeioPagamento.CREDITO);
    pagamento.setValorPago(PRECO_PADRAO);
    pagamento.setEstadoConta(EstadoConta.ATIVA);

    CompraOriginal compra = new CompraOriginal();
    compra.setIdTransacao("T-1");
    compra.setCanal(CanalCompra.MAINLINE);
    compra.setDataCompra(DATA_PEDIDO.minusDays(10));
    compra.setPagamento(pagamento);
    compra.setIdStylistVenda("S-7");
    compra.setQuantidadeComprada(1);
    pedido.setCompraOriginal(compra);

    Comprovativo comprovativo = new Comprovativo();
    comprovativo.setTipo(TipoComprovativo.RECIBO_IMPRESSO);
    comprovativo.setConfirmaCompra(true);
    comprovativo.setReciboOriginal(true);
    pedido.setComprovativo(comprovativo);

    pedido.getArtigos().add(artigo("A-1"));
  }

  public static PedidoBuilder umPedido() {
    return new PedidoBuilder();
  }

  /** Artigo Levi's de vestuário, reconhecido no POS, não usado e com etiquetas colocadas. */
  public static ArtigoDevolvido artigo(String id) {
    Produto produto = new Produto();
    produto.setSku("501-" + id);
    produto.setSkuReconhecidoPOS(true);
    produto.setMarca(Marca.LEVIS);
    produto.setCategoria(CategoriaProduto.VESTUARIO);
    produto.setVendidoNaLoja(true);
    produto.setPvpOriginal(PRECO_PADRAO);
    produto.setPrecoAtual(PRECO_PADRAO);

    EstadoProduto estado = new EstadoProduto();
    estado.setCondicaoUso(CondicaoUso.NAO_USADO);
    estado.setEtiquetas(EstadoEtiquetas.COLOCADAS);

    ArtigoDevolvido artigo = new ArtigoDevolvido();
    artigo.setId(id);
    artigo.setProduto(produto);
    artigo.setPrecoPago(PRECO_PADRAO);
    artigo.setEstado(estado);
    return artigo;
  }

  public PedidoBuilder tipo(TipoPedido tipo) {
    pedido.setTipoPedido(tipo);
    return this;
  }

  public PedidoBuilder loja(Mercado mercado, TipoLoja tipoLoja) {
    pedido.getLoja().setMercado(mercado);
    pedido.getLoja().setTipoLoja(tipoLoja);
    return this;
  }

  public PedidoBuilder funcao(Funcao funcao, boolean aprovadoPeloDM) {
    pedido.getColaborador().setFuncao(funcao);
    pedido.getColaborador().setAprovadoPeloDM(aprovadoPeloDM);
    return this;
  }

  public PedidoBuilder canal(CanalCompra canal) {
    pedido.getCompraOriginal().setCanal(canal);
    return this;
  }

  public PedidoBuilder diasDesdeCompra(long dias) {
    pedido.getCompraOriginal().setDataCompra(DATA_PEDIDO.minusDays(dias));
    return this;
  }

  public PedidoBuilder diasDesdeEnvio(long dias) {
    pedido.getCompraOriginal().setDataEnvio(DATA_PEDIDO.minusDays(dias));
    return this;
  }

  public PedidoBuilder pagamento(MeioPagamento meio) {
    pedido.getCompraOriginal().getPagamento().setMeio(meio);
    return this;
  }

  public PedidoBuilder comprovativo(TipoComprovativo tipo, boolean reciboOriginal) {
    pedido.getComprovativo().setTipo(tipo);
    pedido.getComprovativo().setReciboOriginal(reciboOriginal);
    return this;
  }

  /** Sem comprovativo e sem data de compra conhecida (devolução às cegas). */
  public PedidoBuilder semComprovativo() {
    pedido.setComprovativo(null);
    pedido.getCompraOriginal().setDataCompra(null);
    return this;
  }

  /** Altera o primeiro artigo. */
  public PedidoBuilder artigo(Consumer<ArtigoDevolvido> alteracao) {
    alteracao.accept(pedido.getArtigos().getFirst());
    return this;
  }

  /** Acrescenta um artigo padrão, alterado pela função indicada. */
  public PedidoBuilder maisUmArtigo(String id, Consumer<ArtigoDevolvido> alteracao) {
    ArtigoDevolvido artigo = artigo(id);
    alteracao.accept(artigo);
    pedido.getArtigos().add(artigo);
    return this;
  }

  /** Alteração livre do pedido, para casos que os métodos acima não cobrem. */
  public PedidoBuilder com(Consumer<PedidoDevolucao> alteracao) {
    alteracao.accept(pedido);
    return this;
  }

  public PedidoDevolucao construir() {
    return pedido;
  }
}

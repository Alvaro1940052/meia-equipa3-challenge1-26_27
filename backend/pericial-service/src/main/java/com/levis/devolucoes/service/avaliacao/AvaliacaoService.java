package com.levis.devolucoes.service.avaliacao;

import com.levis.devolucoes.dto.comum.ColaboradorDto;
import com.levis.devolucoes.dto.comum.PaginaDto;
import com.levis.devolucoes.dto.decisao.AvaliacaoResumoResponse;
import com.levis.devolucoes.dto.decisao.DecisaoResponse;
import com.levis.devolucoes.dto.enums.Elegibilidade;
import com.levis.devolucoes.dto.enums.TipoTransacao;
import com.levis.devolucoes.dto.explicacao.DadoEmFaltaDto;
import com.levis.devolucoes.dto.explicacao.DadosEmFaltaResponse;
import com.levis.devolucoes.dto.explicacao.ExplicacaoPorqueResponse;
import com.levis.devolucoes.dto.pedido.PedidoAvaliacaoRequest;
import com.levis.devolucoes.explicacao.emfalta.DadoEmFalta;
import com.levis.devolucoes.explicacao.emfalta.DetetorDadosEmFalta;
import com.levis.devolucoes.explicacao.esenao.ClonadorFactos;
import com.levis.devolucoes.explicacao.motor.ResultadoExecucao;
import com.levis.devolucoes.explicacao.porque.DadoEntrada;
import com.levis.devolucoes.explicacao.porque.ExplicadorPorque;
import com.levis.devolucoes.model.decisao.IndicadorFraude;
import com.levis.devolucoes.model.pedido.PedidoDevolucao;
import com.levis.devolucoes.persistencia.entidade.AvaliacaoEntity;
import com.levis.devolucoes.service.auditoria.AuditoriaService;
import com.levis.devolucoes.service.excecao.RecursoNaoEncontradoException;
import com.levis.devolucoes.service.explicacao.Explicadores;
import com.levis.devolucoes.service.mapeamento.ExplicacaoMapper;
import com.levis.devolucoes.service.mapeamento.JsonServico;
import com.levis.devolucoes.service.mapeamento.MontadorDecisao;
import com.levis.devolucoes.service.mapeamento.PedidoMapper;
import com.levis.devolucoes.service.motor.MotorRegrasService;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Orquestra a avaliação (docs/05): valida o pedido, enriquece-o com as integrações, avalia as
 * regras e grava a auditoria com a versão da base de conhecimento. Também responde ao "O que
 * falta?" e ao "Porquê?" das perguntas, sobre o pedido em preenchimento.
 */
@Service
public class AvaliacaoService {

  private final ValidadorPedido validador;
  private final EnriquecedorPedido enriquecedor;
  private final PedidoMapper pedidoMapper;
  private final MotorRegrasService motor;
  private final MontadorDecisao montador;
  private final AuditoriaService auditoria;
  private final DetetorDadosEmFalta detetor;
  private final ClonadorFactos clonador;
  private final Explicadores explicadores;
  private final ExplicacaoMapper explicacaoMapper;
  private final Clock relogio;

  public AvaliacaoService(
      ValidadorPedido validador,
      EnriquecedorPedido enriquecedor,
      PedidoMapper pedidoMapper,
      MotorRegrasService motor,
      MontadorDecisao montador,
      AuditoriaService auditoria,
      DetetorDadosEmFalta detetor,
      ClonadorFactos clonador,
      Explicadores explicadores,
      ExplicacaoMapper explicacaoMapper,
      Clock relogio) {
    this.validador = validador;
    this.enriquecedor = enriquecedor;
    this.pedidoMapper = pedidoMapper;
    this.motor = motor;
    this.montador = montador;
    this.auditoria = auditoria;
    this.detetor = detetor;
    this.clonador = clonador;
    this.explicadores = explicadores;
    this.explicacaoMapper = explicacaoMapper;
    this.relogio = relogio;
  }

  /** Pedido convertido em factos, já enriquecido, com o colaborador autenticado. */
  private record PedidoPreparado(PedidoDevolucao pedido, List<IndicadorFraude> fraudes) {}

  private PedidoPreparado preparar(PedidoAvaliacaoRequest pedido, ColaboradorDto colaborador) {
    validador.validarCoerencia(pedido);
    PedidoDevolucao factos = pedidoMapper.paraModelo(enriquecedor.enriquecer(pedido));
    if (factos.getId() == null || factos.getId().isBlank()) {
      factos.setId(UUID.randomUUID().toString());
    }
    factos.setColaborador(pedidoMapper.colaborador(colaborador));
    List<IndicadorFraude> fraudes = new ArrayList<>();
    if (pedido.indicadoresFraude() != null) {
      pedido.indicadoresFraude().forEach(i -> fraudes.add(pedidoMapper.fraude(i, factos.getId())));
    }
    return new PedidoPreparado(factos, fraudes);
  }

  /** Avalia o pedido e grava a avaliação (decisão, versão do kjar e rasto). */
  @Transactional
  public DecisaoResponse avaliar(PedidoAvaliacaoRequest pedido, ColaboradorDto colaborador) {
    PedidoPreparado preparado = preparar(pedido, colaborador);
    validador.validarCompletude(detetor.obrigatorios(preparado.pedido()));

    String pedidoJson = clonador.paraJson(preparado.pedido());
    String fraudesJson = clonador.paraJson(preparado.fraudes());
    ResultadoExecucao resultado = motor.avaliar(preparado.pedido(), preparado.fraudes());

    LocalDateTime agora = LocalDateTime.now(relogio);
    DecisaoResponse decisao =
        montador.montar(resultado, UUID.randomUUID(), agora, motor.versao().valor());
    auditoria.gravar(decisao, resultado, pedidoJson, fraudesJson, agora);
    return decisao;
  }

  @Transactional(readOnly = true)
  public DecisaoResponse consultar(UUID id) {
    return JsonServico.ler(auditoria.carregar(id).decisaoJson(), DecisaoResponse.class);
  }

  @Transactional(readOnly = true)
  public PaginaDto<AvaliacaoResumoResponse> listar(String lojaCodigo, int pagina, int tamanho) {
    Page<AvaliacaoEntity> resultado =
        auditoria.listar(
            lojaCodigo, PageRequest.of(pagina, tamanho, Sort.by(Sort.Direction.DESC, "criadaEm")));
    return new PaginaDto<>(
        resultado.map(AvaliacaoService::resumo).getContent(),
        resultado.getNumber(),
        resultado.getSize(),
        resultado.getTotalElements(),
        resultado.getTotalPages());
  }

  private static AvaliacaoResumoResponse resumo(AvaliacaoEntity a) {
    return new AvaliacaoResumoResponse(
        a.getId(),
        a.getPedidoId(),
        a.getCriadaEm(),
        a.getLojaCodigo(),
        a.getElegibilidade() == null ? null : Elegibilidade.valueOf(a.getElegibilidade()),
        a.getTipoTransacao() == null ? null : TipoTransacao.valueOf(a.getTipoTransacao()),
        a.getValorDevolucao());
  }

  /** "O que falta?": as perguntas por responder, cada uma com o seu "Porquê?". */
  public DadosEmFaltaResponse dadosEmFalta(
      PedidoAvaliacaoRequest pedido, ColaboradorDto colaborador, Locale locale) {
    PedidoPreparado preparado = preparar(pedido, colaborador);
    List<DadoEmFalta> emFalta = detetor.detetar(preparado.pedido());
    ResultadoExecucao atual =
        motor.avaliar(clonador.clonar(preparado.pedido()), preparado.fraudes());
    ExplicadorPorque porque = explicadores.porque(locale);

    List<DadoEmFaltaDto> dados = new ArrayList<>();
    for (DadoEmFalta dado : emFalta) {
      ExplicacaoPorqueResponse explicacao =
          DadoEntrada.deCodigo(dado.codigo())
              .map(d -> explicacaoMapper.porque(porque.explicar(d, atual)))
              .orElse(null);
      dados.add(
          new DadoEmFaltaDto(
              dado.codigo(), dado.caminho(), dado.descricao(), dado.obrigatorio(), explicacao));
    }
    long obrigatorios = emFalta.stream().filter(DadoEmFalta::obrigatorio).count();
    String resumo =
        emFalta.isEmpty()
            ? explicadores.texto(locale).formatar("emfalta.completo")
            : explicadores
                .texto(locale)
                .formatar("emfalta.resumo", obrigatorios, emFalta.size() - obrigatorios);
    return new DadosEmFaltaResponse(dados, obrigatorios == 0, resumo);
  }

  /** "Porquê?": porque é que o sistema pergunta pelo dado indicado, para este pedido. */
  public ExplicacaoPorqueResponse porque(
      PedidoAvaliacaoRequest pedido, ColaboradorDto colaborador, String dado, Locale locale) {
    DadoEntrada pergunta =
        DadoEntrada.deCodigo(dado)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Pergunta desconhecida: " + dado));
    PedidoPreparado preparado = preparar(pedido, colaborador);
    ResultadoExecucao atual = motor.avaliar(preparado.pedido(), preparado.fraudes());
    return explicacaoMapper.porque(explicadores.porque(locale).explicar(pergunta, atual));
  }
}

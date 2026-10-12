package com.levis.devolucoes.service.explicacao;

import com.levis.devolucoes.explicacao.esenao.ClonadorFactos;
import com.levis.devolucoes.explicacao.motor.ResultadoExecucao;
import com.levis.devolucoes.model.pedido.PedidoDevolucao;
import com.levis.devolucoes.service.auditoria.AuditoriaService;
import com.levis.devolucoes.service.auditoria.AuditoriaService.AvaliacaoGravada;
import com.levis.devolucoes.service.excecao.VersaoBaseConhecimentoDiferenteException;
import com.levis.devolucoes.service.motor.MotorRegrasService;
import java.util.UUID;
import org.springframework.stereotype.Service;

/**
 * Reavalia uma avaliação gravada (o pedido enriquecido e os indícios de fraude), para a explicar ou
 * simular. Só com a mesma versão da base de conhecimento: caso contrário a explicação podia não
 * corresponder à decisão.
 */
@Service
public class ReavaliacaoService {

  private final AuditoriaService auditoria;
  private final MotorRegrasService motor;
  private final ClonadorFactos clonador;

  public ReavaliacaoService(
      AuditoriaService auditoria, MotorRegrasService motor, ClonadorFactos clonador) {
    this.auditoria = auditoria;
    this.motor = motor;
    this.clonador = clonador;
  }

  /** Pedido gravado (antes da avaliação) e a sua reavaliação. */
  public record Reavaliacao(
      AvaliacaoGravada gravada, PedidoDevolucao pedido, ResultadoExecucao resultado) {}

  public Reavaliacao reavaliar(UUID avaliacaoId) {
    AvaliacaoGravada gravada = auditoria.carregar(avaliacaoId);
    String versaoAtual = motor.versao().valor();
    if (!versaoAtual.equals(gravada.versaoBaseConhecimento())) {
      throw new VersaoBaseConhecimentoDiferenteException(
          gravada.versaoBaseConhecimento(), versaoAtual);
    }
    PedidoDevolucao pedido = clonador.pedidoDeJson(gravada.pedidoJson());
    ResultadoExecucao resultado =
        motor.avaliar(clonador.clonar(pedido), clonador.fraudesDeJson(gravada.fraudesJson()));
    return new Reavaliacao(gravada, pedido, resultado);
  }
}

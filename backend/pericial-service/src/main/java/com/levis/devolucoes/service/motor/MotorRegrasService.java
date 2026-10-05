package com.levis.devolucoes.service.motor;

import com.levis.devolucoes.explicacao.motor.ExecutorSessao;
import com.levis.devolucoes.explicacao.motor.ResultadoExecucao;
import com.levis.devolucoes.model.decisao.IndicadorFraude;
import com.levis.devolucoes.model.pedido.PedidoDevolucao;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Avalia um pedido na base de conhecimento: insere os factos, dá o foco aos módulos pela ordem do
 * fluxograma e devolve a decisão com o rastreio. Uma sessão por pedido.
 */
@Service
public class MotorRegrasService {

  private final ExecutorSessao executor;
  private final VersaoBaseConhecimento versao;

  public MotorRegrasService(ExecutorSessao executor, VersaoBaseConhecimento versao) {
    this.executor = executor;
    this.versao = versao;
  }

  /** Avalia o pedido (que é alterado pela avaliação, ex.: suspenso). */
  public ResultadoExecucao avaliar(PedidoDevolucao pedido, List<IndicadorFraude> fraudes) {
    return executor.executar(pedido, fraudes);
  }

  public VersaoBaseConhecimento versao() {
    return versao;
  }
}

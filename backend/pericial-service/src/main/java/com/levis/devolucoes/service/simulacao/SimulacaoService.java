package com.levis.devolucoes.service.simulacao;

import com.levis.devolucoes.dto.simulacao.SimulacaoRequest;
import com.levis.devolucoes.dto.simulacao.SimulacaoResponse;
import com.levis.devolucoes.explicacao.esenao.ResultadoSimulacao;
import com.levis.devolucoes.service.explicacao.Explicadores;
import com.levis.devolucoes.service.explicacao.ReavaliacaoService;
import com.levis.devolucoes.service.explicacao.ReavaliacaoService.Reavaliacao;
import com.levis.devolucoes.service.mapeamento.ExplicacaoMapper;
import com.levis.devolucoes.service.mapeamento.MontadorDecisao;
import com.levis.devolucoes.service.motor.MotorRegrasService;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;

/** "E se?": reavalia o pedido de uma avaliação gravada com alterações, sem a modificar. */
@Service
public class SimulacaoService {

  private final ReavaliacaoService reavaliacao;
  private final Explicadores explicadores;
  private final ExplicacaoMapper mapper;
  private final MontadorDecisao montador;
  private final MotorRegrasService motor;
  private final Clock relogio;

  public SimulacaoService(
      ReavaliacaoService reavaliacao,
      Explicadores explicadores,
      ExplicacaoMapper mapper,
      MontadorDecisao montador,
      MotorRegrasService motor,
      Clock relogio) {
    this.reavaliacao = reavaliacao;
    this.explicadores = explicadores;
    this.mapper = mapper;
    this.montador = montador;
    this.motor = motor;
    this.relogio = relogio;
  }

  public SimulacaoResponse simular(UUID avaliacaoId, SimulacaoRequest pedido, Locale locale) {
    Reavaliacao original = reavaliacao.reavaliar(avaliacaoId);
    ResultadoSimulacao simulacao =
        explicadores
            .simulador(locale)
            .simular(original.resultado(), original.pedido(), pedido.alteracoes());
    return new SimulacaoResponse(
        simulacao.diferencas().stream().map(mapper::diferenca).toList(),
        simulacao.regrasNovas(),
        simulacao.regrasRemovidas(),
        simulacao.resumo(),
        montador.montar(
            simulacao.simulado(), null, LocalDateTime.now(relogio), motor.versao().valor()));
  }
}

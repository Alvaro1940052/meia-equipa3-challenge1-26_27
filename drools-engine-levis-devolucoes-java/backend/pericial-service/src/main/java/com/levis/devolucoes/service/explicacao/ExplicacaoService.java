package com.levis.devolucoes.service.explicacao;

import com.levis.devolucoes.dto.explicacao.ExplicacaoComoResponse;
import com.levis.devolucoes.dto.explicacao.ExplicacaoConclusaoResponse;
import com.levis.devolucoes.dto.explicacao.ExplicacaoPorqueNaoConclusaoResponse;
import com.levis.devolucoes.dto.explicacao.ExplicacaoPorqueNaoResponse;
import com.levis.devolucoes.explicacao.catalogo.CampoSaida;
import com.levis.devolucoes.explicacao.motor.ResultadoExecucao;
import com.levis.devolucoes.service.excecao.RecursoNaoEncontradoException;
import com.levis.devolucoes.service.mapeamento.ExplicacaoMapper;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;

/**
 * Explicações de uma avaliação gravada (ADR 0006): Como (caminho completo ou até uma conclusão) e
 * Porque não (de uma conclusão ou de uma regra).
 */
@Service
public class ExplicacaoService {

  private final ReavaliacaoService reavaliacao;
  private final Explicadores explicadores;
  private final ExplicacaoMapper mapper;

  public ExplicacaoService(
      ReavaliacaoService reavaliacao, Explicadores explicadores, ExplicacaoMapper mapper) {
    this.reavaliacao = reavaliacao;
    this.explicadores = explicadores;
    this.mapper = mapper;
  }

  public ExplicacaoComoResponse como(UUID avaliacaoId, Locale locale) {
    return mapper.como(explicadores.como(locale).explicar(resultado(avaliacaoId)));
  }

  /**
   * @param conclusao campo de saída (ex.: OUT-001)
   * @param artigoId artigo (obrigatório para OUT-007)
   */
  public ExplicacaoConclusaoResponse comoConclusao(
      UUID avaliacaoId, String conclusao, String artigoId, Locale locale) {
    ResultadoExecucao resultado = resultado(avaliacaoId);
    validarArtigo(resultado, artigoId);
    return mapper.conclusao(
        explicadores.como(locale).explicarConclusao(CampoSaida.de(conclusao), artigoId, resultado));
  }

  /**
   * @param conclusao campo e valor (ex.: "OUT-001:PERMITIR" ou "OUT-001=PERMITIR")
   */
  public ExplicacaoPorqueNaoConclusaoResponse porqueNaoConclusao(
      UUID avaliacaoId, String conclusao, String artigoId, Locale locale) {
    String[] partes = conclusao.split("[:=]", 2);
    if (partes.length != 2 || partes[1].isBlank()) {
      throw new IllegalArgumentException(
          "Conclusão inválida: indique campo e valor, ex.: OUT-001:PERMITIR");
    }
    ResultadoExecucao resultado = resultado(avaliacaoId);
    validarArtigo(resultado, artigoId);
    return mapper.porqueNaoConclusao(
        explicadores
            .porqueNao(locale)
            .explicarConclusao(
                CampoSaida.de(partes[0].trim()), partes[1].trim(), artigoId, resultado));
  }

  public ExplicacaoPorqueNaoResponse porqueNaoRegra(
      UUID avaliacaoId, String regra, String artigoId, Locale locale) {
    ResultadoExecucao resultado = resultado(avaliacaoId);
    validarArtigo(resultado, artigoId);
    return mapper.porqueNao(explicadores.porqueNao(locale).explicar(regra, artigoId, resultado));
  }

  private ResultadoExecucao resultado(UUID avaliacaoId) {
    return reavaliacao.reavaliar(avaliacaoId).resultado();
  }

  private static void validarArtigo(ResultadoExecucao resultado, String artigoId) {
    if (artigoId != null && !resultado.artigos().containsKey(artigoId)) {
      throw new RecursoNaoEncontradoException("Artigo inexistente nesta avaliação: " + artigoId);
    }
  }
}

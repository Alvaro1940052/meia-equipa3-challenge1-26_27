package com.levis.devolucoes.service.mapeamento;

import com.levis.devolucoes.dto.explicacao.CondicaoDto;
import com.levis.devolucoes.dto.explicacao.ExplicacaoComoResponse;
import com.levis.devolucoes.dto.explicacao.ExplicacaoConclusaoResponse;
import com.levis.devolucoes.dto.explicacao.ExplicacaoPorqueNaoConclusaoResponse;
import com.levis.devolucoes.dto.explicacao.ExplicacaoPorqueNaoResponse;
import com.levis.devolucoes.dto.explicacao.ExplicacaoPorqueResponse;
import com.levis.devolucoes.dto.explicacao.PassoExplicacaoDto;
import com.levis.devolucoes.dto.explicacao.RegraEmEsperaDto;
import com.levis.devolucoes.dto.simulacao.DiferencaDto;
import com.levis.devolucoes.explicacao.catalogo.Conclusao;
import com.levis.devolucoes.explicacao.como.ExplicacaoComo;
import com.levis.devolucoes.explicacao.como.ExplicacaoConclusao;
import com.levis.devolucoes.explicacao.como.PassoExplicacao;
import com.levis.devolucoes.explicacao.esenao.DiferencaSaida;
import com.levis.devolucoes.explicacao.porque.ExplicacaoPorque;
import com.levis.devolucoes.explicacao.porque.RegraEmEspera;
import com.levis.devolucoes.explicacao.porquenao.ExplicacaoPorqueNao;
import com.levis.devolucoes.explicacao.porquenao.ExplicacaoPorqueNaoConclusao;
import com.levis.devolucoes.explicacao.porquenao.ResultadoCondicao;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/** Explicações (módulo pericial-explanation) para os DTO de resposta. */
@Mapper
public interface ExplicacaoMapper {

  ExplicacaoComoResponse como(ExplicacaoComo como);

  PassoExplicacaoDto passo(PassoExplicacao passo);

  CondicaoDto condicao(ResultadoCondicao condicao);

  @Mapping(target = "conclusao", expression = "java(conclusao.campo().codigo())")
  ExplicacaoConclusaoResponse conclusao(ExplicacaoConclusao conclusao);

  ExplicacaoPorqueNaoResponse porqueNao(ExplicacaoPorqueNao porqueNao);

  @Mapping(target = "conclusao", expression = "java(porqueNao.campo().codigo())")
  ExplicacaoPorqueNaoConclusaoResponse porqueNaoConclusao(ExplicacaoPorqueNaoConclusao porqueNao);

  @Mapping(target = "dado", expression = "java(porque.dado().codigo())")
  ExplicacaoPorqueResponse porque(ExplicacaoPorque porque);

  RegraEmEsperaDto emEspera(RegraEmEspera regra);

  DiferencaDto diferenca(DiferencaSaida diferenca);

  default String texto(Object valor) {
    return valor == null ? null : valor.toString();
  }

  default Map<String, String> textos(Map<String, Object> valores) {
    Map<String, String> textos = new LinkedHashMap<>();
    valores.forEach((campo, valor) -> textos.put(campo, texto(valor)));
    return textos;
  }

  default List<String> conclusoes(List<Conclusao> conclusoes) {
    return conclusoes.stream().map(Conclusao::toString).toList();
  }
}

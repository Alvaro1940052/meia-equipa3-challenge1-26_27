package com.levis.devolucoes.service.mapeamento;

import com.levis.devolucoes.dto.decisao.DocumentacaoResponse;
import com.levis.devolucoes.dto.decisao.ResultadoArtigoResponse;
import com.levis.devolucoes.model.decisao.DecisaoArtigo;
import com.levis.devolucoes.model.decisao.Documentacao;
import com.levis.devolucoes.model.enums.Elegibilidade;
import org.mapstruct.Mapper;

/** Partes da decisão do modelo para os DTO de resposta. */
@Mapper
public interface DecisaoMapper {

  DocumentacaoResponse documentacao(Documentacao documentacao);

  ResultadoArtigoResponse artigo(DecisaoArtigo artigo);

  com.levis.devolucoes.dto.enums.Elegibilidade elegibilidade(Elegibilidade elegibilidade);
}

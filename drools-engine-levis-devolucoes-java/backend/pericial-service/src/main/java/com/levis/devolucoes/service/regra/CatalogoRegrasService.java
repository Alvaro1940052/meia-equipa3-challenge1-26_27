package com.levis.devolucoes.service.regra;

import com.levis.devolucoes.dto.regra.RegraDetalheDto;
import com.levis.devolucoes.dto.regra.RegraResumoDto;
import com.levis.devolucoes.dto.regra.VarianteRegraDto;
import com.levis.devolucoes.explicacao.catalogo.CatalogoRegras;
import com.levis.devolucoes.explicacao.catalogo.Conclusao;
import com.levis.devolucoes.explicacao.catalogo.MetadadosRegra;
import com.levis.devolucoes.service.excecao.RecursoNaoEncontradoException;
import java.util.List;
import org.springframework.stereotype.Service;

/** Consulta da base de conhecimento: regras, variantes, condições e conclusões. */
@Service
public class CatalogoRegrasService {

  private final CatalogoRegras catalogo;

  public CatalogoRegrasService(CatalogoRegras catalogo) {
    this.catalogo = catalogo;
  }

  public List<RegraResumoDto> listar() {
    return catalogo.ids().stream()
        .map(
            id -> {
              List<MetadadosRegra> variantes = catalogo.variantes(id);
              return new RegraResumoDto(
                  id,
                  variantes.stream().map(MetadadosRegra::modulo).distinct().toList(),
                  variantes.getFirst().descricao(),
                  variantes.size(),
                  variantes.stream().anyMatch(MetadadosRegra::aValidar));
            })
        .toList();
  }

  public RegraDetalheDto detalhe(String id) {
    List<MetadadosRegra> variantes = catalogo.variantes(id);
    if (variantes.isEmpty()) {
      throw new RecursoNaoEncontradoException("Regra inexistente: " + id);
    }
    return new RegraDetalheDto(
        id,
        variantes.stream()
            .map(
                v ->
                    new VarianteRegraDto(
                        v.nome(),
                        v.modulo(),
                        v.descricao(),
                        v.condicoes(),
                        v.conclusoes().stream().map(Conclusao::toString).toList(),
                        v.aValidar()))
            .toList());
  }
}

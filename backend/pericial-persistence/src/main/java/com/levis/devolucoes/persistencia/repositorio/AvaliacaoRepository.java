package com.levis.devolucoes.persistencia.repositorio;

import com.levis.devolucoes.persistencia.entidade.AvaliacaoEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

/** Histórico de avaliações. */
public interface AvaliacaoRepository extends JpaRepository<AvaliacaoEntity, UUID> {

  /** Avaliação com o rasto das regras carregado. */
  @EntityGraph(attributePaths = "registos")
  Optional<AvaliacaoEntity> findComRegistosById(UUID id);

  List<AvaliacaoEntity> findByPedidoIdOrderByCriadaEmDesc(String pedidoId);

  Page<AvaliacaoEntity> findByLojaCodigo(String lojaCodigo, Pageable pagina);
}

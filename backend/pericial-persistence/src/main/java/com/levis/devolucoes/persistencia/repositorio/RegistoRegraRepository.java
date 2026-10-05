package com.levis.devolucoes.persistencia.repositorio;

import com.levis.devolucoes.persistencia.entidade.RegistoRegraEntity;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/** Rasto das regras disparadas (auditoria). */
public interface RegistoRegraRepository extends JpaRepository<RegistoRegraEntity, Long> {

  List<RegistoRegraEntity> findByAvaliacaoIdOrderByOrdem(UUID avaliacaoId);

  /** Quantas avaliações dispararam cada regra (apoio à revisão da base de conhecimento). */
  @Query(
      "select r.codigoRegra as codigo, count(distinct r.avaliacao.id) as total"
          + " from RegistoRegraEntity r group by r.codigoRegra order by r.codigoRegra")
  List<ContagemRegra> contarAvaliacoesPorRegra();

  /** Projeção de {@link #contarAvaliacoesPorRegra()}. */
  interface ContagemRegra {
    String getCodigo();

    long getTotal();
  }
}

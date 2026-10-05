package com.levis.devolucoes.persistencia.repositorio;

import com.levis.devolucoes.persistencia.entidade.ExcecaoAprovadaEntity;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/** Registos de exceções aprovadas (EX-007). */
public interface ExcecaoAprovadaRepository extends JpaRepository<ExcecaoAprovadaEntity, UUID> {

  List<ExcecaoAprovadaEntity> findByRegistadaEmBetweenOrderByRegistadaEm(
      LocalDateTime inicio, LocalDateTime fim);
}

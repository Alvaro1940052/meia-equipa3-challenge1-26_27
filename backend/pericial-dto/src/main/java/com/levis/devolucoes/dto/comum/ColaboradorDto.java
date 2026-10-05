package com.levis.devolucoes.dto.comum;

import com.levis.devolucoes.dto.enums.Funcao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Colaborador (o utilizador autenticado, ou o aprovador de uma exceção). */
public record ColaboradorDto(
    @NotBlank String id,
    String nome,
    @NotNull Funcao funcao,
    boolean aprovadoPeloDM,
    String idCredencialPOS) {}

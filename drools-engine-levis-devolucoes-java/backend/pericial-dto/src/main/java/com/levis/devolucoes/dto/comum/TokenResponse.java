package com.levis.devolucoes.dto.comum;

import java.time.Instant;

/** Token de acesso emitido em desenvolvimento para um colaborador de exemplo. */
public record TokenResponse(String token, Instant expiraEm) {}

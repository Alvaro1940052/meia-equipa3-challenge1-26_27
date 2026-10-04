package com.levis.devolucoes.regras.suporte;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Identifica as regras da base de conhecimento que um teste verifica. O {@code CoberturaRegrasTest}
 * exige que cada regra da kbase seja referida por pelo menos um teste.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.TYPE})
public @interface Regra {

  /** IDs das regras, por exemplo {@code "PT-003"}. */
  String[] value();
}

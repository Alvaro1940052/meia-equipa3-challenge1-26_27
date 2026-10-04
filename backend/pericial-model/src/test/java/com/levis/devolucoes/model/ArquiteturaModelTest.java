package com.levis.devolucoes.model;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

/**
 * O modelo é o vocabulário partilhado: não depende de Spring, JPA, Drools nem de outros módulos.
 */
@AnalyzeClasses(
    packages = "com.levis.devolucoes.model",
    importOptions = ImportOption.DoNotIncludeTests.class)
class ArquiteturaModelTest {

  @ArchTest
  static final ArchRule SEM_FRAMEWORKS =
      noClasses()
          .should()
          .dependOnClassesThat()
          .resideInAnyPackage(
              "org.springframework..", "jakarta.persistence..", "org.kie..", "org.drools..")
          .because("pericial-model não pode depender de Spring, JPA nem Drools (CLAUDE.md)");

  @ArchTest
  static final ArchRule SEM_OUTROS_MODULOS =
      noClasses()
          .should()
          .dependOnClassesThat()
          .resideInAnyPackage(
              "com.levis.devolucoes.regras..",
              "com.levis.devolucoes.explicacao..",
              "com.levis.devolucoes.dto..",
              "com.levis.devolucoes.persistencia..",
              "com.levis.devolucoes.service..",
              "com.levis.devolucoes.api..")
          .because("o modelo não depende de nenhum módulo acima dele (docs/05)");

  @ArchTest
  static final ArchRule ENUMS_INDEPENDENTES =
      noClasses()
          .that()
          .resideInAPackage("..model.enums..")
          .should()
          .dependOnClassesThat()
          .resideInAnyPackage("..model.pedido..", "..model.produto..", "..model.decisao..");
}

package com.levis.devolucoes.regras;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import org.drools.model.codegen.ExecutableModelProject;
import org.junit.jupiter.api.Test;
import org.kie.api.KieServices;
import org.kie.api.builder.KieBuilder;
import org.kie.api.builder.KieFileSystem;
import org.kie.api.builder.Message;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;

/** Confirma que o motor Drools compila e executa regras no JDK em uso (Fase 1). */
class MotorDroolsDisponivelTest {

  private static final String DRL =
      """
      package com.levis.devolucoes.regras.verificacao;
      global java.util.List disparos;
      rule "Regra de verificacao"
      when
          $s : String( this == "ola" )
      then
          disparos.add( $s );
      end
      """;

  @Test
  void compilaEExecutaUmaRegra() {
    KieServices servicos = KieServices.Factory.get();
    KieFileSystem ficheiros = servicos.newKieFileSystem();
    ficheiros.write("src/main/resources/verificacao.drl", DRL);
    // Modelo executável: o mesmo compilador que o kie-maven-plugin usa no kjar
    KieBuilder construtor =
        servicos.newKieBuilder(ficheiros).buildAll(ExecutableModelProject.class);
    assertThat(construtor.getResults().getMessages(Message.Level.ERROR)).isEmpty();

    KieContainer contentor =
        servicos.newKieContainer(servicos.getRepository().getDefaultReleaseId());
    KieSession sessao = contentor.newKieSession();
    List<String> disparos = new ArrayList<>();
    try {
      sessao.setGlobal("disparos", disparos);
      sessao.insert("ola");
      assertThat(sessao.fireAllRules()).isEqualTo(1);
    } finally {
      sessao.dispose();
    }
    assertThat(disparos).containsExactly("ola");
  }
}

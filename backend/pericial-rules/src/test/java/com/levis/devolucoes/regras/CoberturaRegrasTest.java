package com.levis.devolucoes.regras;

import static org.assertj.core.api.Assertions.assertThat;

import com.levis.devolucoes.regras.suporte.MotorTeste;
import com.levis.devolucoes.regras.suporte.Regra;
import java.io.IOException;
import java.lang.reflect.Method;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

/**
 * Definição de concluído (CLAUDE.md): cada regra tem pelo menos um teste que referencia o seu ID.
 */
class CoberturaRegrasTest {

  @Test
  void cadaRegraDaKbaseTemUmTeste() throws Exception {
    Set<String> idsDaKbase =
        MotorTeste.regras().stream()
            .map(r -> String.valueOf(r.getMetaData().get("id")))
            .collect(Collectors.toCollection(TreeSet::new));

    Set<String> idsTestados = idsReferidosNosTestes();

    assertThat(idsDaKbase).as("regras na kbase").isNotEmpty();
    Set<String> semTeste = new TreeSet<>(idsDaKbase);
    semTeste.removeAll(idsTestados);
    assertThat(semTeste).as("regras sem nenhum teste @Regra").isEmpty();
  }

  private static Set<String> idsReferidosNosTestes() throws IOException, URISyntaxException {
    Path raiz =
        Path.of(
            CoberturaRegrasTest.class.getProtectionDomain().getCodeSource().getLocation().toURI());
    List<String> nomesClasses;
    try (Stream<Path> caminhos = Files.walk(raiz)) {
      nomesClasses =
          caminhos
              .filter(p -> p.toString().endsWith(".class"))
              .map(p -> raiz.relativize(p).toString())
              .map(
                  s ->
                      s.substring(0, s.length() - ".class".length())
                          .replace('\\', '.')
                          .replace('/', '.'))
              .toList();
    }

    Set<String> ids = new HashSet<>();
    for (String nome : nomesClasses) {
      Class<?> classe;
      try {
        classe = Class.forName(nome, false, CoberturaRegrasTest.class.getClassLoader());
      } catch (ClassNotFoundException | LinkageError ignorado) {
        continue;
      }
      acrescentar(ids, classe.getAnnotation(Regra.class));
      for (Method metodo : classe.getDeclaredMethods()) {
        acrescentar(ids, metodo.getAnnotation(Regra.class));
      }
    }
    return ids;
  }

  private static void acrescentar(Set<String> ids, Regra anotacao) {
    if (anotacao != null) {
      ids.addAll(Arrays.asList(anotacao.value()));
    }
  }
}

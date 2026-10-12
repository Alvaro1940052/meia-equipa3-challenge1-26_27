package com.levis.devolucoes.regras;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

/**
 * Convenções verificadas no texto dos ficheiros DRL: cada regra tem a guarda {@code terminal ==
 * false} (exceto as transversais, ADR 0004) e um agenda-group.
 */
class ConvencoesDrlTest {

  private static final Path REGRAS = Path.of("src/main/resources/com/levis/devolucoes/regras");
  private static final Pattern REGRA = Pattern.compile("(?s)\\brule\\s+\"([^\"]+)\"(.*?)\\nend\\b");
  private static final Set<String> SEM_GUARDA =
      Set.of("EX-008", "PC-008", "EX-002", "EX-003", "OUT-007", "OUT-001");

  @Test
  void cadaRegraTemAGuardaTerminalEUmAgendaGroup() throws IOException {
    List<Path> ficheiros;
    try (Stream<Path> caminhos = Files.list(REGRAS)) {
      ficheiros = caminhos.filter(p -> p.toString().endsWith(".drl")).toList();
    }
    assertThat(ficheiros).isNotEmpty();

    int total = 0;
    for (Path ficheiro : ficheiros) {
      Matcher matcher = REGRA.matcher(Files.readString(ficheiro));
      while (matcher.find()) {
        total++;
        String nome = matcher.group(1);
        String corpo = matcher.group(2);
        String id = nome.substring(0, nome.indexOf(' '));
        assertThat(corpo).as("agenda-group em \"%s\"", nome).contains("agenda-group");
        if (!SEM_GUARDA.contains(id)) {
          assertThat(corpo)
              .as("guarda terminal == false em \"%s\" (%s)", nome, ficheiro.getFileName())
              .containsPattern("terminal\\s*==\\s*false");
        }
      }
    }
    assertThat(total).isPositive();
  }
}

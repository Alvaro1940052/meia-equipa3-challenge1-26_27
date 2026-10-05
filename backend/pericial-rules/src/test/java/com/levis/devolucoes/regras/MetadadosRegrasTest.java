package com.levis.devolucoes.regras;

import static org.assertj.core.api.Assertions.assertThat;

import com.levis.devolucoes.model.enums.Modulo;
import com.levis.devolucoes.regras.suporte.MotorTeste;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.drools.base.definitions.rule.impl.RuleImpl;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.kie.api.definition.rule.Rule;

/**
 * Convenções do CLAUDE.md para cada regra: nome começado pelo ID, metadados {@code @id @modulo
 * @descricao @condicoes}, ID existente na base de conhecimento (docs/01) e {@code @modulo} igual ao
 * agenda-group.
 */
class MetadadosRegrasTest {

  private static final Path BASE_CONHECIMENTO = Path.of("../../docs/01-base-conhecimento.md");
  private static final Pattern ID_NA_BASE = Pattern.compile("\\*\\*([A-Z]{2,3}-\\d{3})\\*\\*");
  private static final Set<String> MODULOS_VALIDOS =
      Arrays.stream(Modulo.values()).map(Enum::name).collect(Collectors.toSet());

  private static Set<String> idsDaBase;
  private static List<Rule> regras;

  @BeforeAll
  static void carregar() throws IOException {
    Matcher matcher = ID_NA_BASE.matcher(Files.readString(BASE_CONHECIMENTO));
    idsDaBase = matcher.results().map(m -> m.group(1)).collect(Collectors.toSet());
    regras = MotorTeste.regras();
  }

  @Test
  void aBaseDeConhecimentoFoiLida() {
    // 6 HS + 8 PC + 8 PT + 10 CH + 12 TN + 7 EP + 8 EX + 8 CT + 4 BW + 10 IN + 8 OUT
    assertThat(idsDaBase).contains("HS-001", "PT-003", "BW-004", "OUT-008").hasSize(89);
    assertThat(regras).isNotEmpty();
  }

  @Test
  void cadaRegraTemOsQuatroMetadados() {
    for (Rule regra : regras) {
      Map<String, Object> meta = regra.getMetaData();
      for (String chave : List.of("id", "modulo", "descricao", "condicoes")) {
        assertThat(meta.get(chave))
            .as("@%s em \"%s\"", chave, regra.getName())
            .isNotNull()
            .asString()
            .isNotBlank();
      }
    }
  }

  @Test
  void cadaRegraDeclaraAsConclusoesNoFormatoOut() {
    Pattern conclusao = Pattern.compile("OUT-00[1-8](=([A-Z_]+|null))?");
    for (Rule regra : regras) {
      Object valor = regra.getMetaData().get("conclusoes");
      assertThat(valor).as("@conclusoes em \"%s\"", regra.getName()).isNotNull();
      String texto = valor.toString();
      if (texto.isBlank()) {
        continue;
      }
      for (String parte : texto.split(",")) {
        assertThat(parte.trim()).as("conclusão em \"%s\"", regra.getName()).matches(conclusao);
      }
    }
  }

  @Test
  void oIdExisteNaBaseDeConhecimentoEIniciaONome() {
    for (Rule regra : regras) {
      String id = String.valueOf(regra.getMetaData().get("id"));
      assertThat(idsDaBase).as("ID de \"%s\" em docs/01", regra.getName()).contains(id);
      assertThat(regra.getName()).startsWith(id + " ");
    }
  }

  @Test
  void oModuloCoincideComOAgendaGroup() {
    for (Rule regra : regras) {
      String modulo = String.valueOf(regra.getMetaData().get("modulo"));
      String grupo = ((RuleImpl) regra).getAgendaGroup();
      assertThat(grupo).as("agenda-group de \"%s\"", regra.getName()).isEqualTo(modulo);
      assertThat(OrdemAgenda.GRUPOS).contains(grupo);
      assertThat(MODULOS_VALIDOS.contains(modulo) || OrdemAgenda.TRANSVERSAL.equals(modulo))
          .isTrue();
    }
  }

  @Test
  void osNomesDasRegrasSaoUnicos() {
    // Uma regra da base pode ter variantes em DRL (ex.: PC-002 aprovada e recusada) com o mesmo
    // @id; o nome completo distingue-as.
    assertThat(regras.stream().map(Rule::getName)).doesNotHaveDuplicates();
  }
}

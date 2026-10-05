package com.levis.devolucoes.explicacao.catalogo;

import com.levis.devolucoes.model.enums.Modulo;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.kie.api.KieBase;
import org.kie.api.definition.KiePackage;
import org.kie.api.definition.rule.Query;
import org.kie.api.definition.rule.Rule;

/** Catálogo da base de conhecimento, construído a partir dos metadados das regras da kbase. */
public final class CatalogoRegras {

  /** Módulo das regras transversais (EX-008, PC-008). */
  public static final String TRANSVERSAL = "TRANSVERSAL";

  /** Ordem de avaliação dos módulos: TRANSVERSAL e depois a ordem do enum {@link Modulo}. */
  public static final List<String> ORDEM_MODULOS =
      Stream.concat(Stream.of(TRANSVERSAL), Arrays.stream(Modulo.values()).map(Enum::name))
          .toList();

  /** Regras que correm mesmo depois de uma paragem obrigatória (ADR 0004). */
  public static final Set<String> SEM_GUARDA_TERMINAL =
      Set.of("EX-008", "PC-008", "EX-002", "EX-003", "OUT-007", "OUT-001");

  private final Map<String, MetadadosRegra> porNome;

  private CatalogoRegras(List<MetadadosRegra> regras) {
    Map<String, MetadadosRegra> mapa = new LinkedHashMap<>();
    regras.stream()
        .sorted(
            Comparator.comparingInt((MetadadosRegra r) -> ordemModulo(r.modulo()))
                .thenComparing(MetadadosRegra::id)
                .thenComparing(MetadadosRegra::nome))
        .forEach(r -> mapa.put(r.nome(), r));
    this.porNome = mapa;
  }

  public static CatalogoRegras de(KieBase kieBase) {
    List<MetadadosRegra> regras = new ArrayList<>();
    for (KiePackage pacote : kieBase.getKiePackages()) {
      Set<String> consultas =
          pacote.getQueries().stream().map(Query::getName).collect(Collectors.toSet());
      for (Rule regra : pacote.getRules()) {
        if (!consultas.contains(regra.getName())) {
          regras.add(metadados(regra));
        }
      }
    }
    return new CatalogoRegras(regras);
  }

  private static MetadadosRegra metadados(Rule regra) {
    Map<String, Object> meta = regra.getMetaData();
    String id = texto(meta.get("id"));
    String condicoes = texto(meta.get("condicoes"));
    return new MetadadosRegra(
        id,
        regra.getName(),
        texto(meta.get("modulo")),
        texto(meta.get("descricao")),
        condicoes == null || condicoes.isBlank()
            ? List.of()
            : Arrays.stream(condicoes.split(",")).map(String::trim).toList(),
        Conclusao.lista(texto(meta.get("conclusoes"))),
        SEM_GUARDA_TERMINAL.contains(id));
  }

  private static String texto(Object valor) {
    return valor == null ? null : valor.toString();
  }

  /** Posição do módulo na ordem de avaliação; módulos desconhecidos vão para o fim. */
  public static int ordemModulo(String modulo) {
    int posicao = ORDEM_MODULOS.indexOf(modulo);
    return posicao < 0 ? Integer.MAX_VALUE : posicao;
  }

  /** Todas as regras (variantes incluídas), pela ordem de avaliação dos módulos. */
  public List<MetadadosRegra> regras() {
    return List.copyOf(porNome.values());
  }

  /** Variantes de um ID, pela ordem de avaliação. */
  public List<MetadadosRegra> variantes(String id) {
    return porNome.values().stream().filter(r -> r.id().equals(id)).toList();
  }

  public Optional<MetadadosRegra> porNome(String nome) {
    return Optional.ofNullable(porNome.get(nome));
  }

  /** IDs distintos, pela ordem de avaliação. */
  public List<String> ids() {
    return porNome.values().stream().map(MetadadosRegra::id).distinct().toList();
  }

  /** Nomes de todas as condições declaradas nas regras. */
  public Set<String> condicoesDeclaradas() {
    return porNome.values().stream()
        .flatMap(r -> r.condicoes().stream())
        .collect(Collectors.toCollection(TreeSet::new));
  }

  /** Primeiro módulo em que um ID é avaliado (um ID pode ter variantes em módulos diferentes). */
  public Optional<String> primeiroModulo(String id) {
    return variantes(id).stream().map(MetadadosRegra::modulo).findFirst();
  }

  /** Regras (variantes) que podem produzir o valor indicado de um campo de saída. */
  public List<MetadadosRegra> produtoras(CampoSaida campo, Object valor) {
    return porNome.values().stream().filter(r -> r.produz(campo, valor)).toList();
  }
}

package com.levis.devolucoes.explicacao.texto;

import java.text.MessageFormat;
import java.util.Locale;
import java.util.ResourceBundle;

/**
 * Textos das explicações em pt-PT ou en ({@code i18n/explicacoes*.properties}). As mensagens das
 * regras vêm do DRL e ficam em português; aqui está o texto que as enquadra.
 */
public class GeradorTexto {

  public static final Locale PT_PT = Locale.forLanguageTag("pt-PT");

  private final Locale locale;
  private final ResourceBundle mensagens;

  public GeradorTexto(Locale locale) {
    this.locale = locale;
    this.mensagens = ResourceBundle.getBundle("i18n.explicacoes", locale);
  }

  public static GeradorTexto portugues() {
    return new GeradorTexto(PT_PT);
  }

  public String formatar(String chave, Object... argumentos) {
    return new MessageFormat(mensagens.getString(chave), locale).format(argumentos);
  }

  public Locale locale() {
    return locale;
  }
}

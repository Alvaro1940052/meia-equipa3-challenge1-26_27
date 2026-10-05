package com.levis.devolucoes.api.erro;

import com.levis.devolucoes.service.excecao.PedidoInvalidoException;
import com.levis.devolucoes.service.excecao.RecursoNaoEncontradoException;
import com.levis.devolucoes.service.excecao.VersaoBaseConhecimentoDiferenteException;
import java.net.URI;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/** Erros no formato ProblemDetail (RFC 9457), com a lista de erros quando há vários. */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

  static final String ERROS = "erros";

  @ExceptionHandler(PedidoInvalidoException.class)
  @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
  public ProblemDetail pedidoInvalido(PedidoInvalidoException e) {
    ProblemDetail problema =
        problema(HttpStatus.UNPROCESSABLE_ENTITY, "pedido-invalido", "Pedido inválido", e);
    problema.setProperty(ERROS, e.erros());
    return problema;
  }

  @ExceptionHandler(RecursoNaoEncontradoException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public ProblemDetail naoEncontrado(RecursoNaoEncontradoException e) {
    return problema(HttpStatus.NOT_FOUND, "nao-encontrado", "Recurso inexistente", e);
  }

  @ExceptionHandler(VersaoBaseConhecimentoDiferenteException.class)
  @ResponseStatus(HttpStatus.CONFLICT)
  public ProblemDetail versaoDiferente(VersaoBaseConhecimentoDiferenteException e) {
    return problema(
        HttpStatus.CONFLICT,
        "versao-base-conhecimento",
        "A avaliação foi feita com outra versão da base de conhecimento",
        e);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ProblemDetail argumentoInvalido(IllegalArgumentException e) {
    return problema(HttpStatus.BAD_REQUEST, "parametro-invalido", "Parâmetro inválido", e);
  }

  @Override
  protected ResponseEntity<Object> handleMethodArgumentNotValid(
      MethodArgumentNotValidException e,
      HttpHeaders cabecalhos,
      HttpStatusCode estado,
      WebRequest pedido) {
    ProblemDetail problema = e.getBody();
    problema.setType(tipo("validacao"));
    problema.setTitle("Pedido mal formado");
    List<String> erros =
        e.getBindingResult().getFieldErrors().stream()
            .map(c -> c.getField() + ": " + c.getDefaultMessage())
            .sorted()
            .toList();
    problema.setDetail("O pedido tem " + erros.size() + " campo(s) inválido(s).");
    problema.setProperty(ERROS, erros);
    return handleExceptionInternal(e, problema, cabecalhos, estado, pedido);
  }

  private static ProblemDetail problema(
      HttpStatus estado, String tipo, String titulo, @Nullable Exception e) {
    ProblemDetail problema =
        ProblemDetail.forStatusAndDetail(estado, e == null ? null : e.getMessage());
    problema.setType(tipo(tipo));
    problema.setTitle(titulo);
    return problema;
  }

  private static URI tipo(String tipo) {
    return URI.create("/problemas/" + tipo);
  }
}

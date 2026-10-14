import ResultSummary from "@/components/shared/ResultSummary";
import { ELIGIBILITY, label, money } from "@/config/returnsLabels";
import type { DecisaoResponse } from "@/types/returns";

export default function DecisionSummary({
  decision,
  durationMs,
}: {
  decision: DecisaoResponse;
  durationMs: number;
}) {
  const eligibility = decision.elegibilidade ? ELIGIBILITY[decision.elegibilidade] : undefined;
  const details: [string, string][] = [
    ["Transação autorizada", label(decision.tipoTransacao)],
    ["Valor a devolver", decision.valorDevolucao != null ? money(decision.valorDevolucao) : "—"],
    ["Base do valor", label(decision.baseValor)],
    ["Meio de reembolso", label(decision.meioReembolso)],
    ["Aprovação necessária", label(decision.aprovacao)],
    ["Processo a seguir", label(decision.processo)],
    ["Comprovativo", label(decision.tipoVerificacao)],
  ];
  const docs = decision.documentacao;
  const docNotes = [
    docs?.assinaturaCliente && `Assinatura do cliente: ${docs.assinaturaCliente}`,
    docs?.assinaturaProcessador && `Assinatura do colaborador: ${docs.assinaturaProcessador}`,
    docs?.assinaturaTestemunha && `Assinatura de testemunha: ${docs.assinaturaTestemunha}`,
    docs?.reciboAgrafado && "Agrafar o recibo ao registo",
    docs?.notaRecibo && `Nota no recibo: ${docs.notaRecibo}`,
    docs?.registoExcecao && `Registo de exceção: ${docs.registoExcecao}`,
  ].filter(Boolean) as string[];

  return (
    <ResultSummary
      eyebrow="Decisão"
      tone={eligibility?.tone ?? "info"}
      headline={eligibility?.label ?? label(decision.elegibilidade)}
      meta={`${durationMs} ms`}
    >
      {eligibility && <p className="result-line">{eligibility.hint}</p>}

      <dl className="facts-grid">
        {details.map(([name, value]) => (
          <div key={name}>
            <dt>{name}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      {decision.excecaoRecusada && (
        <p className="result-line">O pedido de exceção foi analisado e recusado.</p>
      )}

      {decision.artigos.length > 0 && (
        <div className="table-container">
          <table className="plain-table">
            <caption className="presets-label">Decisão por artigo</caption>
            <thead>
              <tr>
                <th scope="col">Artigo</th>
                <th scope="col">Resultado</th>
                <th scope="col">Valor</th>
                <th scope="col">Destino do artigo</th>
                <th scope="col">Aprovação</th>
              </tr>
            </thead>
            <tbody>
              {decision.artigos.map((item) => (
                <tr key={item.artigoId}>
                  <td>{item.artigoId}</td>
                  <td>
                    {item.elegibilidade ? (ELIGIBILITY[item.elegibilidade]?.label ?? item.elegibilidade) : "—"}
                  </td>
                  <td>{item.valorDevolucao != null ? money(item.valorDevolucao) : "—"}</td>
                  <td>
                    {label(item.destino)}
                    {item.descontoSaldo ? ` (−${item.descontoSaldo}%)` : ""}
                  </td>
                  <td>{label(item.aprovacao)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {docNotes.length > 0 && (
        <>
          <div className="presets-label">Documentação a preencher</div>
          <ul className="doc-notes">
            {docNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </>
      )}

      {decision.regrasAValidar.length > 0 && (
        <p className="field-hint">
          Regras ainda por validar que influenciaram esta decisão:{" "}
          {decision.regrasAValidar.map((rule) => (
            <span key={rule} className="tag-pending">
              {rule}
            </span>
          ))}
        </p>
      )}
    </ResultSummary>
  );
}

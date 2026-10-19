import { label, money } from "@/config/returnsLabels";
import { useLocale } from "@/contexts/LocaleContext";
import type { CenarioExemploResponse, ReturnRequest } from "@/types/returns";

function pick(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    return current && typeof current === "object" ? (current as Record<string, unknown>)[key] : undefined;
  }, source);
}

const text = (value: unknown) => (value === null || value === undefined || value === "" ? "—" : String(value));

export default function RequestSummary({
  request,
  scenario,
}: {
  request: ReturnRequest;
  scenario: CenarioExemploResponse | null;
}) {
  const { locale } = useLocale();
  const items = Array.isArray(request.artigos) ? (request.artigos as unknown[]) : [];
  const rows: [string, string][] = [
    [locale === "en" ? "Request type" : "Tipo de pedido", label(request.tipoPedido, locale)],
    [locale === "en" ? "Request date" : "Data do pedido", text(request.dataPedido)],
    [
      locale === "en" ? "Store" : "Loja",
      `${text(pick(request, "loja.nome"))} · ${label(pick(request, "loja.tipoLoja"), locale)}`,
    ],
    [locale === "en" ? "Associate role" : "Colaborador", label(pick(request, "colaborador.funcao"), locale)],
    [locale === "en" ? "Purchase channel" : "Canal da compra", label(pick(request, "compraOriginal.canal"), locale)],
    [locale === "en" ? "Purchase date" : "Data da compra", text(pick(request, "compraOriginal.dataCompra"))],
    [locale === "en" ? "Payment method" : "Pagamento", label(pick(request, "compraOriginal.pagamento.meio"), locale)],
    [locale === "en" ? "Proof of purchase" : "Comprovativo", label(pick(request, "comprovativo.tipo"), locale)],
  ];

  return (
    <div className="request-summary font-sans">
      <dl className="facts-grid">
        {rows.map(([name, value]) => (
          <div key={name}>
            <dt>{name}</dt>
            <dd className="font-sans font-bold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      {items.length > 0 && (
        <div className="table-container">
          <table className="plain-table font-sans tabular-nums">
            <caption className="sr-only">
              {locale === "en" ? "Order items" : "Artigos do pedido"}
            </caption>
            <thead>
              <tr>
                <th scope="col">{locale === "en" ? "Item" : "Artigo"}</th>
                <th scope="col">{locale === "en" ? "Condition" : "Estado de uso"}</th>
                <th scope="col">{locale === "en" ? "Tags" : "Etiquetas"}</th>
                <th scope="col">{locale === "en" ? "Price paid" : "Preço pago"}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={text(pick(item, "id")) + index}>
                  <td className="font-mono font-bold tabular-nums">{text(pick(item, "id"))}</td>
                  <td>{label(pick(item, "estado.condicaoUso"), locale)}</td>
                  <td>{label(pick(item, "estado.etiquetas"), locale)}</td>
                  <td className="font-sans font-bold tabular-nums">{money(pick(item, "precoPago"), locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {scenario && (
        <details className="scenario-notes">
          <summary>
            {locale === "en"
              ? "Scenario assumptions and expected reasoning"
              : "Pressupostos e raciocínio esperado do cenário"}
          </summary>
          {scenario.pressupostos.length > 0 && (
            <>
              <div className="presets-label">
                {locale === "en" ? "Assumptions" : "Pressupostos"}
              </div>
              <ul>
                {scenario.pressupostos.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </>
          )}
          {scenario.justificacao.length > 0 && (
            <>
              <div className="presets-label">
                {locale === "en" ? "Expected reasoning" : "Raciocínio esperado"}
              </div>
              <ol>
                {scenario.justificacao.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </>
          )}
        </details>
      )}
    </div>
  );
}

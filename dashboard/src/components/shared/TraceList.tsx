/** Lista ordenada de passos de raciocínio (regras disparadas, factos derivados...). */
export default function TraceList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="trace">
      <div className="presets-label">
        {title} ({items.length})
      </div>
      {items.length === 0 ? (
        <p className="trace-empty">Nenhuma regra foi disparada.</p>
      ) : (
        <ol className="trace-list">
          {items.map((item, index) => (
            <li key={`${item}-${index}`}>
              <code>{item}</code>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

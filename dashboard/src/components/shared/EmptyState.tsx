export default function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="empty-state">
      <p>
        <strong>{title}</strong>
      </p>
      {hint && <p>{hint}</p>}
    </div>
  );
}

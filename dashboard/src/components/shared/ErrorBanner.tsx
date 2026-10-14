export default function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="error-banner" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button className="btn-action" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}

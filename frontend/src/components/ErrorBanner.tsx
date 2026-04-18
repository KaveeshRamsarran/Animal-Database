interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-red-500 text-lg">⚠️</span>
        <p className="text-sm text-red-700">{message}</p>
      </div>
      {onRetry && <button onClick={onRetry} className="text-sm text-red-600 font-medium hover:underline">Retry</button>}
    </div>
  );
}

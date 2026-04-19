interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-red-400 text-lg">⚠️</span>
        <p className="text-sm text-red-300">{message}</p>
      </div>
      {onRetry && <button onClick={onRetry} className="text-sm text-red-400 font-medium hover:underline">Retry</button>}
    </div>
  );
}

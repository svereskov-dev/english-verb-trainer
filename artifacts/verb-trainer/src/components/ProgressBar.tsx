interface ProgressBarProps {
  current: number;
  total: number;
  /** When true the fill turns green to signal the daily goal has been reached. */
  goalReached?: boolean;
}

export function ProgressBar({ current, total, goalReached = false }: ProgressBarProps) {
  const percentage = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0;

  return (
    <div className="w-full h-1 bg-muted fixed top-0 left-0 z-50">
      <div
        className={`h-full transition-all duration-300 ease-out ${goalReached ? "bg-green-500" : "bg-primary"}`}
        style={{ width: `${percentage}%` }}
        data-testid="progress-bar-fill"
      />
    </div>
  );
}

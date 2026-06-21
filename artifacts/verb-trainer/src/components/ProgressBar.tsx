interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0;
  
  return (
    <div className="w-full h-1 bg-muted fixed top-0 left-0 z-50">
      <div 
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
        data-testid="progress-bar-fill"
      />
    </div>
  );
}

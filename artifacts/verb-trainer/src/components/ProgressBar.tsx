import { cn } from "../lib/utils";

interface ProgressBarProps {
  current: number;
  total: number;
  /** When true the fill and counter turn green to signal the daily goal has been reached. */
  goalReached?: boolean;
}

/**
 * Compact daily-progress block rendered inside the Practice header.
 *
 * Layout:
 *   DAILY PROGRESS          18 / 20
 *   ████████████████████░░░░░░
 *
 * Purple fill while in progress → smooth transition to green on goal reached.
 */
export function ProgressBar({ current, total, goalReached = false }: ProgressBarProps) {
  const percentage = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0;

  return (
    <div className="w-full mt-1.5">
      {/* Label row */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Daily Progress
        </span>
        <span
          className={cn(
            "text-xs font-bold tabular-nums transition-colors duration-300",
            goalReached ? "text-green-500" : "text-primary",
          )}
        >
          {current} / {total}
        </span>
      </div>

      {/* Progress track */}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            goalReached ? "bg-green-500" : "bg-primary",
          )}
          style={{ width: `${percentage}%` }}
          data-testid="progress-bar-fill"
        />
      </div>
    </div>
  );
}

import { cn } from "../lib/utils";
import { Check, X } from "lucide-react";

interface ProgressBarProps {
  current: number;
  total: number;
  correct: number;
  incorrect: number;
  /** When true the fill and counter turn green to signal the daily goal has been reached. */
  goalReached?: boolean;
}

/**
 * Compact daily-progress block rendered inside the Practice header.
 *
 * Layout:
 *   ████████████████████░░░░░░
 *   DAILY PROGRESS  18 / 20                 ✓ 18  × 0
 *
 * Purple fill while in progress → smooth transition to green on goal reached.
 */
export function ProgressBar({
  current,
  total,
  correct,
  incorrect,
  goalReached = false,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0;

  return (
    <div className="w-full mt-1.5">
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

      {/* Unified information row below the progress track */}
      <div className="flex items-center justify-between gap-3 mt-1.5 text-xs font-semibold">
        <div className="flex items-center gap-2 min-w-0">
          <span className="uppercase tracking-widest text-muted-foreground">
            Daily Progress
          </span>
          <span
            className={cn(
              "tabular-nums transition-colors duration-300",
              goalReached ? "text-green-500" : "text-primary",
            )}
          >
            {current} / {total}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 tabular-nums">
          <div className="flex items-center gap-1 text-green-600">
            <Check size={14} strokeWidth={2.5} />
            <span>{correct}</span>
          </div>
          <div className="flex items-center gap-1 text-red-500">
            <X size={14} strokeWidth={2.5} />
            <span>{incorrect}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

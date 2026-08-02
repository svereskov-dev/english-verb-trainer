import { useState, useRef } from "react";
import { cn } from "../lib/utils";

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  feedback?: "correct" | "incorrect" | null;
  submittedValue?: string;
  compact?: boolean;
  /**
   * The correct answer for this exercise.
   * When provided, enables character-by-character color guidance while typing:
   * matching prefix stays in the normal text color; the first wrong character and
   * everything after it turns red instantly.  The Check button and all SRS logic
   * are completely unaffected — this is purely a visual layer.
   */
  expectedAnswer?: string;
}

export function AnswerInput({
  onSubmit,
  onValueChange,
  disabled,
  feedback,
  submittedValue,
  compact = false,
  expectedAnswer,
}: AnswerInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim() && !disabled) {
      onSubmit(value);
    }
  };

  const handleFocus = () => {
    requestAnimationFrame(() => {
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const isPostSubmit = !!feedback;
  const displayValue = isPostSubmit ? (submittedValue ?? "") : value;

  // ── Guidance layer ──────────────────────────────────────────────────────────
  // Active only while the user is typing (pre-submit) and an expected answer is
  // known.  Finds the index of the first mismatched character; everything from
  // that index onward is shown in red.
  const isGuidanceActive = !isPostSubmit && !!expectedAnswer;

  const firstErrorIdx =
    isGuidanceActive && value.length > 0
      ? (() => {
          const idx = value
            .split("")
            .findIndex((ch, i) => ch !== expectedAnswer![i]);
          return idx; // -1 means fully correct so far
        })()
      : -1;

  // ── Post-submit colours ─────────────────────────────────────────────────────
  const borderClass =
    feedback === "correct"
      ? "border-green-500"
      : feedback === "incorrect"
        ? "border-red-500"
        : "border-transparent";

  const textClass =
    feedback === "correct"
      ? "text-green-400"
      : feedback === "incorrect"
        ? "text-red-400"
        : "text-foreground";

  return (
    <div className={cn(
      "w-full rounded-2xl bg-card border border-border flex items-center",
      compact ? "p-1.5" : "p-2"
    )}>
      {/*
        The guidance overlay sits in a relative wrapper over the native <input>.
        When guidance is active:
          • the <input> text is made transparent (only the caret stays visible)
          • the overlay renders the same text with per-character colouring
        The overlay is pointer-events-none so all touch/click events reach the
        input. Font size, weight, and centering are identical on both layers so
        the glyphs sit exactly on top of the invisible input text.
      */}
      <div className="relative w-full">

        {/* Guidance overlay — only shown when the user has started typing */}
        {isGuidanceActive && value.length > 0 && (
          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-0 pointer-events-none z-10",
              "flex items-center justify-center",
              "font-semibold select-none whitespace-pre",
              compact ? "text-lg" : "text-xl",
            )}
          >
            {firstErrorIdx === -1 ? (
              // All typed characters match so far
              <span className="text-foreground">{value}</span>
            ) : firstErrorIdx === 0 ? (
              // First character already wrong — entire input is red
              <span className="text-red-400">{value}</span>
            ) : (
              // Split at first divergence
              <>
                <span className="text-foreground">{value.slice(0, firstErrorIdx)}</span>
                <span className="text-red-400">{value.slice(firstErrorIdx)}</span>
              </>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          value={displayValue}
          onChange={(e) => {
            if (!disabled) {
              setValue(e.target.value);
              onValueChange?.(e.target.value);
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          readOnly={isPostSubmit}
          className={cn(
            "w-full mx-auto block rounded-xl border-2 bg-background px-3 py-2",
            "transition-colors duration-150",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "font-semibold",
            compact
              ? "text-lg text-center h-10"
              : "text-xl text-center h-14",
            borderClass,
            // When guidance is active the text itself is rendered by the overlay;
            // make the input text transparent so only the caret remains visible.
            // The placeholder colour is unaffected: placeholder:text-muted-foreground
            // sets ::placeholder { color } explicitly, which is not inherited from the
            // element colour.
            isGuidanceActive ? "text-transparent" : textClass,
          )}
          // caretColor keeps the blinking cursor visible even when text is transparent.
          style={isGuidanceActive
            ? { caretColor: "var(--color-foreground)" }
            : undefined}
          placeholder="Type your answer..."
          type="text"
          inputMode="text"
          enterKeyHint="done"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          data-testid="input-answer"
        />
      </div>
    </div>
  );
}

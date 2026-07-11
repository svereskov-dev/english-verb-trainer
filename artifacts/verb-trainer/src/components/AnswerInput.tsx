import { useState, useRef } from "react";
import { cn } from "../lib/utils";

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  feedback?: "correct" | "incorrect" | null;
  submittedValue?: string;
  compact?: boolean;
}

export function AnswerInput({
  onSubmit,
  onValueChange,
  disabled,
  feedback,
  submittedValue,
  compact = false,
}: AnswerInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim() && !disabled) {
      onSubmit(value);
    }
  };

  const isPostSubmit = !!feedback;
  const displayValue = isPostSubmit ? (submittedValue ?? "") : value;

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
          textClass,
        )}
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
  );
}

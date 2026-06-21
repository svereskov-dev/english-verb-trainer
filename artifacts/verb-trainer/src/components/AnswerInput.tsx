import { useState, useRef, useEffect } from "react";

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  feedback?: "correct" | "incorrect" | null;
  submittedValue?: string;
}

export function AnswerInput({ onSubmit, disabled, feedback, submittedValue }: AnswerInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim() && !disabled) {
      onSubmit(value);
    }
  };

  const displayValue = feedback ? (submittedValue ?? "") : value;

  const borderClass = feedback === "correct"
    ? "border-green-500 focus-visible:ring-green-500"
    : feedback === "incorrect"
    ? "border-red-500 focus-visible:ring-red-500"
    : "focus-visible:ring-primary";

  const textClass = feedback === "correct"
    ? "text-green-400"
    : feedback === "incorrect"
    ? "text-red-400"
    : "";

  return (
    <input
      ref={inputRef}
      value={displayValue}
      onChange={(e) => { if (!disabled) setValue(e.target.value); }}
      onKeyDown={handleKeyDown}
      readOnly={!!disabled}
      className={[
        "text-2xl text-center h-16 w-full max-w-md mx-auto block",
        "rounded-md border bg-background px-3 py-2",
        "transition-colors duration-150",
        "placeholder:text-muted-foreground",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "font-semibold",
        borderClass,
        textClass,
      ].join(" ")}
      placeholder="Type your answer..."
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      data-testid="input-answer"
    />
  );
}

import { useState, useRef, useEffect } from "react";
import { isCorrect } from "../engine/validate";

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  expectedAnswer: string | string[];
  disabled?: boolean;
  feedback?: "correct" | "incorrect" | null;
  submittedValue?: string;
}

export function AnswerInput({
  onSubmit,
  expectedAnswer,
  disabled,
  feedback,
  submittedValue,
}: AnswerInputProps) {
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

  // After submit: show the submitted value (colored by feedback from parent)
  // While typing: live-validate and color in real time
  const isPostSubmit = feedback !== null && feedback !== undefined;

  const displayValue = isPostSubmit ? (submittedValue ?? "") : value;

  // Determine color state
  let colorState: "correct" | "incorrect" | "neutral";
  if (isPostSubmit) {
    colorState = feedback as "correct" | "incorrect";
  } else if (value.trim() === "") {
    colorState = "neutral";
  } else if (isCorrect(value, expectedAnswer)) {
    colorState = "correct";
  } else {
    colorState = "incorrect";
  }

  const borderClass =
    colorState === "correct"
      ? "border-green-500 focus-visible:ring-green-500"
      : colorState === "incorrect"
        ? "border-red-500 focus-visible:ring-red-500"
        : "border-input focus-visible:ring-primary";

  const textClass =
    colorState === "correct"
      ? "text-green-400"
      : colorState === "incorrect"
        ? "text-red-400"
        : "text-foreground";

  return (
    <input
      ref={inputRef}
      value={displayValue}
      onChange={(e) => {
        if (!disabled) setValue(e.target.value);
      }}
      onKeyDown={handleKeyDown}
      readOnly={isPostSubmit}
      className={[
        "text-2xl text-center h-16 w-full max-w-md mx-auto block",
        "rounded-md border-2 bg-background px-3 py-2",
        "transition-colors duration-100",
        "placeholder:text-muted-foreground",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
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

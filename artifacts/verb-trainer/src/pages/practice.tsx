import { useState, useEffect } from "react";
import { useExerciseSession } from "../hooks/useExerciseSession";
import { ExerciseCard } from "../components/ExerciseCard";
import { AnswerInput } from "../components/AnswerInput";
import { ProgressBar } from "../components/ProgressBar";
import { ModeSelector } from "../components/ModeSelector";
import { Flame, SkipForward } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { Button } from "../components/ui/button";

export default function Practice() {
  const [mode, setMode] = useState<any>("mixed");
  const [submittedValue, setSubmittedValue] = useState<string>("");

  const {
    currentExercise,
    sessionCount,
    streak,
    feedback,
    showAnswer,
    submitAnswer,
    nextExercise,
    skipExercise,
    dailyGoal
  } = useExerciseSession(mode);

  // Advance on Enter during feedback phase
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && feedback !== null) {
        nextExercise();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [feedback, nextExercise]);

  const handleSubmit = (answer: string) => {
    setSubmittedValue(answer);
    submitAnswer(answer);
  };

  const handleSkip = () => {
    setSubmittedValue("");
    skipExercise();
  };

  const handleNext = () => {
    setSubmittedValue("");
    nextExercise();
  };

  if (!currentExercise) return null;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <ProgressBar current={sessionCount} total={dailyGoal} />

      <div className="p-4 flex justify-between items-center w-full max-w-3xl mx-auto">
        <ModeSelector currentMode={mode} onSelect={(m) => { setSubmittedValue(""); setMode(m); }} />
        <div className="flex items-center gap-1 text-orange-500 shrink-0 ml-4">
          <Flame size={20} className={streak > 2 ? "fill-current animate-pulse" : ""} />
          <span className="font-bold">{streak}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-3xl mx-auto">
        <div className="w-full mb-10">
          <ExerciseCard exercise={currentExercise} />
        </div>

        <div className="w-full flex flex-col items-center gap-4">
          <AnswerInput
            key={currentExercise.id}
            onSubmit={handleSubmit}
            expectedAnswer={currentExercise.answer}
            disabled={feedback !== null}
            feedback={feedback}
            submittedValue={submittedValue}
          />

          {/* Feedback + correct answer */}
          <div className="h-14 flex flex-col items-center justify-center">
            {feedback === "incorrect" && showAnswer && (
              <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-200">
                <p className="text-muted-foreground text-sm mb-0.5">Correct answer</p>
                <p className="text-xl font-bold text-primary">{showAnswer}</p>
              </div>
            )}
            {feedback === "correct" && (
              <p className="text-green-500 font-semibold text-lg animate-in fade-in duration-150">
                Correct!
              </p>
            )}
          </div>

          {/* Skip button — always visible when no feedback; Next when showing feedback */}
          {feedback === null ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground gap-1.5"
              data-testid="button-skip"
            >
              <SkipForward size={15} />
              Skip
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-next"
            >
              Next →
            </Button>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

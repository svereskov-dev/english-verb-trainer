import { useState } from "react";
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
  const [pendingAnswer, setPendingAnswer] = useState<string>("");

  const {
    currentExercise,
    sessionCount,
    streak,
    feedback,
    showAnswer,
    submitAnswer,
    nextExercise,
    skipExercise,
    dailyGoal,
  } = useExerciseSession(mode);

  const handleAnswerChange = (value: string) => {
    setPendingAnswer(value);
  };

  const handleCheck = () => {
    if (!pendingAnswer.trim() || feedback !== null) return;
    setSubmittedValue(pendingAnswer);
    submitAnswer(pendingAnswer);
  };

  const handleSkip = () => {
    setSubmittedValue("");
    setPendingAnswer("");
    skipExercise();
  };

  const handleNext = () => {
    setSubmittedValue("");
    setPendingAnswer("");
    nextExercise();
  };

  if (!currentExercise) return null;

  const showingFeedback = feedback !== null;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <ProgressBar current={sessionCount} total={dailyGoal} />

      <div className="p-4 flex justify-between items-center w-full max-w-3xl mx-auto">
        <ModeSelector
          currentMode={mode}
          onSelect={(m) => {
            setSubmittedValue("");
            setPendingAnswer("");
            setMode(m);
          }}
        />
        <div className="flex items-center gap-1 text-orange-500 shrink-0 ml-4">
          <Flame size={20} className={streak > 2 ? "fill-current animate-pulse" : ""} />
          <span className="font-bold">{streak}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-3xl mx-auto">
        {/* Task card */}
        <div className="w-full mb-8">
          <ExerciseCard exercise={currentExercise} />
        </div>

        {/* Answer input */}
        <div className="w-full flex flex-col items-center gap-3">
          <AnswerInput
            key={currentExercise.id}
            onSubmit={handleCheck}
            onValueChange={handleAnswerChange}
            disabled={showingFeedback}
            feedback={feedback}
            submittedValue={submittedValue}
          />

          {/* Submit / correct answer / Next row */}
          {!showingFeedback ? (
            <>
              {/* Check button — prominent */}
              <Button
                onClick={handleCheck}
                disabled={!pendingAnswer.trim()}
                className="w-full max-w-md h-12 text-base font-semibold"
                data-testid="button-check"
              >
                Check
              </Button>

              {/* Skip — smaller, ghost */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground gap-1.5"
                data-testid="button-skip"
              >
                <SkipForward size={14} />
                Skip
              </Button>
            </>
          ) : (
            <>
              {/* Correct answer reveal on mistake */}
              <div className="h-10 flex flex-col items-center justify-center">
                {feedback === "incorrect" && showAnswer && (
                  <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <span className="text-muted-foreground text-sm">Correct: </span>
                    <span className="text-xl font-bold text-green-400">{showAnswer}</span>
                  </div>
                )}
                {feedback === "correct" && (
                  <p className="text-green-500 font-semibold text-lg animate-in fade-in duration-150">
                    Correct!
                  </p>
                )}
              </div>

              {/* Next button replaces Skip */}
              <Button
                onClick={handleNext}
                className="w-full max-w-md h-12 text-base font-semibold"
                data-testid="button-next"
              >
                Next →
              </Button>
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

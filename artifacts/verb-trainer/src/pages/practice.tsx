import { useState } from "react";
import { useExerciseSession } from "../hooks/useExerciseSession";
import { ExerciseCard } from "../components/ExerciseCard";
import { AnswerInput } from "../components/AnswerInput";
import { ProgressBar } from "../components/ProgressBar";
import { TrainingMenu, DEFAULT_SESSION } from "../components/TrainingMenu";
import { SessionConfig } from "../engine/exercises";
import { Flame, SkipForward } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { Button } from "../components/ui/button";

export default function Practice() {
  const [config, setConfig]               = useState<SessionConfig>(DEFAULT_SESSION);
  const [submittedValue, setSubmittedValue] = useState("");
  const [pendingAnswer, setPendingAnswer]   = useState("");

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
    noMistakes,
  } = useExerciseSession(config);

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

  const handleSelectConfig = (next: SessionConfig) => {
    setSubmittedValue("");
    setPendingAnswer("");
    setConfig(next);
  };

  // ── Mistakes mode with nothing to review ───────────────────────────────────
  if (noMistakes) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-5 text-center">
          <div className="text-6xl">🎉</div>
          <div>
            <h2 className="text-xl font-bold mb-1">No mistakes to review</h2>
            <p className="text-muted-foreground text-sm">
              Keep practicing — items you miss will appear here.
            </p>
          </div>
          <TrainingMenu current={config} onSelect={handleSelectConfig} />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!currentExercise) return null;

  const showingFeedback = feedback !== null;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <ProgressBar current={sessionCount} total={dailyGoal} />

      {/* Header row: mode selector + streak */}
      <div className="p-4 flex justify-between items-center w-full max-w-3xl mx-auto">
        <TrainingMenu current={config} onSelect={handleSelectConfig} />
        <div className="flex items-center gap-1 text-orange-500 shrink-0 ml-4">
          <Flame size={20} className={streak > 2 ? "fill-current animate-pulse" : ""} />
          <span className="font-bold">{streak}</span>
        </div>
      </div>

      {/* Exercise area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-3xl mx-auto">
        <div className="w-full mb-8">
          <ExerciseCard exercise={currentExercise} />
        </div>

        <div className="w-full flex flex-col items-center gap-3">
          <AnswerInput
            key={currentExercise.id}
            onSubmit={handleCheck}
            onValueChange={setPendingAnswer}
            disabled={showingFeedback}
            feedback={feedback}
            submittedValue={submittedValue}
          />

          {!showingFeedback ? (
            <>
              <Button
                onClick={handleCheck}
                disabled={!pendingAnswer.trim()}
                className="w-full max-w-md h-12 text-base font-semibold"
                data-testid="button-check"
              >
                Check
              </Button>
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

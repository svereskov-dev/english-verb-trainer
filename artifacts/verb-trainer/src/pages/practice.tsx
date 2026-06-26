import { useState, useEffect } from "react";
import { useExerciseSession } from "../hooks/useExerciseSession";
import { useStats } from "../hooks/useStats";
import { ExerciseCard } from "../components/ExerciseCard";
import { AnswerInput } from "../components/AnswerInput";
import { ProgressBar } from "../components/ProgressBar";
import { TrainingMenu, DEFAULT_SESSION } from "../components/TrainingMenu";
import { SessionConfig } from "../engine/exercises";
import { Check, X, SkipForward } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { Button } from "../components/ui/button";

const CONFIG_KEY = "practice_config";
const CONFIG_DATE_KEY = "practice_config_date";

function isNewDay(): boolean {
  const saved = localStorage.getItem(CONFIG_DATE_KEY);
  if (!saved) return true;
  const savedDate = new Date(parseInt(saved, 10));
  const now = new Date();
  return (
    savedDate.getFullYear() !== now.getFullYear() ||
    savedDate.getMonth() !== now.getMonth() ||
    savedDate.getDate() !== now.getDate()
  );
}

function loadPersistedConfig(): SessionConfig | null {
  if (isNewDay()) {
    localStorage.removeItem(CONFIG_KEY);
    return null;
  }
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionConfig;
    // Backward compatibility: old configs without selectedIds
    if (!parsed.selectedIds) {
      parsed.selectedIds = [parsed.id];
    }
    // Backward compatibility: old configs without userCustomized
    if (parsed.userCustomized === undefined) {
      parsed.userCustomized = true;
    }
    return parsed;
  } catch {
    return null;
  }
}

function savePersistedConfig(config: SessionConfig) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    localStorage.setItem(CONFIG_DATE_KEY, Date.now().toString());
  } catch {
    // ignore
  }
}

export default function Practice() {
  const [config, setConfig]               = useState<SessionConfig>(
    loadPersistedConfig() ?? DEFAULT_SESSION
  );
  const [submittedValue, setSubmittedValue] = useState("");
  const [pendingAnswer, setPendingAnswer]   = useState("");

  const {
    currentExercise,
    dailyCorrect,
    dailyIncorrect,
    streak,
    feedback,
    showAnswer,
    submitAnswer,
    nextExercise,
    skipExercise,
    dailyGoal,
    noMistakes,
    reviewExhausted,
    onClearReview,
  } = useExerciseSession(config);

  const { stats } = useStats();

  // ── Check for a Mistakes-review session on first load ───────────────────
  useEffect(() => {
    const raw = sessionStorage.getItem("mistakeReview");
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as { verbs: string[]; mode: string };
      if (data.verbs && data.verbs.length > 0) {
        setConfig({
          id: "mistake-review",
          label: "Review Mistakes",
          groupLabel: "Mistakes Review",
          selectedIds: ["mistakes"],
          exerciseTypes: ["verbform", "irregular"],
          verbPool: "all",
          reviewVerbs: data.verbs,
          contextEnabled: false,
          userCustomized: true,
        });
      }
    } catch {
      sessionStorage.removeItem("mistakeReview");
    }
  }, []);

  // ── Persist config changes to localStorage ──────────────────────────────
  useEffect(() => {
    savePersistedConfig(config);
  }, [config]);

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
    // If user manually picks a mode, clear the transient review session
    onClearReview();
  };

  // ── Mistakes mode with nothing to review ───────────────────────────────────
  if (noMistakes) {
    return (
      <div className="min-h-[100dvh] bg-background pb-20 flex flex-col">
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

  // ── Review session finished (all verbs now correct) ───────────────────────
  if (reviewExhausted) {
    return (
      <div className="min-h-[100dvh] bg-background pb-20 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-5 text-center">
          <div className="text-6xl">🎉</div>
          <div>
            <h2 className="text-xl font-bold mb-1">Review Complete</h2>
            <p className="text-muted-foreground text-sm">
              You answered correctly on all verbs from this review.
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
    <div className="min-h-[100dvh] bg-background pb-20 flex flex-col">
      <ProgressBar current={stats?.sessionAnswers ?? 0} total={dailyGoal} />

      {/* Header row: mode selector + daily counters */}
      <div className="p-4 flex justify-between items-center w-full max-w-3xl mx-auto">
        <TrainingMenu current={config} onSelect={handleSelectConfig} />
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <div className="flex items-center gap-1 text-green-600">
            <Check size={18} />
            <span className="font-bold">{dailyCorrect}</span>
          </div>
          <div className="flex items-center gap-1 text-red-500">
            <X size={18} />
            <span className="font-bold">{dailyIncorrect}</span>
          </div>
        </div>
      </div>

      {/* Exercise area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto gap-4">
        <div className="w-full">
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
              <div className="flex flex-col items-center justify-center gap-1">
                {showAnswer && (
                  <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <span className="text-muted-foreground text-sm">Correct: </span>
                    <span className="text-xl font-bold text-green-400">{showAnswer}</span>
                  </div>
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

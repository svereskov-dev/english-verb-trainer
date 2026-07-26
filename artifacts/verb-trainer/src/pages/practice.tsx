import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useExerciseSession } from "../hooks/useExerciseSession";
import { useKeyboardVisible } from "../hooks/useKeyboardVisible";
import { ExerciseCard } from "../components/ExerciseCard";
import { AnswerInput } from "../components/AnswerInput";
import { ProgressBar } from "../components/ProgressBar";
import { TrainingMenu, DEFAULT_SESSION } from "../components/TrainingMenu";
import { SessionConfig } from "../engine/exercises";
import { Check, X, SkipForward, Sparkles, ChevronRight } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

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
  const [, navigate] = useLocation();
  const [config, setConfig]               = useState<SessionConfig>(
    loadPersistedConfig() ?? DEFAULT_SESSION
  );
  const [submittedValue, setSubmittedValue] = useState("");
  const [pendingAnswer, setPendingAnswer]   = useState("");

  // Keyboard-aware compact layout
  const keyboardVisible = useKeyboardVisible();

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

  const handleOpenTenses = () => {
    // Pass the single tense being practiced as context, if applicable
    const singleTense = config.tenses?.length === 1 ? config.tenses[0] : null;
    try {
      if (singleTense) {
        sessionStorage.setItem("tensesContext", JSON.stringify({ tenseId: singleTense }));
      } else {
        sessionStorage.removeItem("tensesContext");
      }
    } catch { /* ignore */ }
    navigate("/tenses");
  };

  // ── Mistakes mode with nothing to review ───────────────────────────────────
  if (noMistakes) {
    return (
      <div className="h-[100dvh] overflow-hidden bg-background nav-safe-pad pt-safe flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-5 text-center overflow-y-auto">
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
      <div className="h-[100dvh] overflow-hidden bg-background nav-safe-pad pt-safe flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-5 text-center overflow-y-auto">
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
    /* overflow-hidden is critical: it prevents any child overflow from
       escaping to document level and growing the layout across mode switches. */
    <div className={cn(
      "h-[100dvh] overflow-hidden bg-background pt-safe flex flex-col",
      keyboardVisible ? "" : "nav-safe-pad"
    )}>
      {/* Progress is driven by the live session counters from useExerciseSession.
          They update immediately on every answer and are persisted via the stats hook. */}
      <ProgressBar
        current={dailyCorrect + dailyIncorrect}
        total={dailyGoal}
      />

      {/* Header — compact when keyboard is open */}
      <div className={cn(
        "w-full max-w-3xl mx-auto",
        keyboardVisible ? "px-3 pt-1 pb-0.5" : "px-4 pt-2 pb-1"
      )}>
        {/* Row 1: Training Mode (left) | English Tenses (right) */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <TrainingMenu
            current={config}
            onSelect={handleSelectConfig}
            compact={keyboardVisible}
          />
          {!keyboardVisible && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenTenses}
              className="rounded-full shrink-0 gap-1.5 font-semibold border-primary/30 hover:border-primary/50 hover:bg-card hover:text-foreground shadow-sm"
              aria-label="English Tenses reference"
            >
              <Sparkles size={13} className="text-primary" />
              <span>English Tenses</span>
              <ChevronRight size={13} className="text-muted-foreground -ml-0.5" />
            </Button>
          )}
        </div>

        {/* Row 2: Counters — hidden when keyboard is open */}
        {!keyboardVisible && (
          <div className="flex justify-end gap-3 mt-1">
            <div className="flex items-center gap-1 text-green-600">
              <Check size={15} />
              <span className="font-bold text-sm">{dailyCorrect}</span>
            </div>
            <div className="flex items-center gap-1 text-red-500">
              <X size={15} />
              <span className="font-bold text-sm">{dailyIncorrect}</span>
            </div>
          </div>
        )}
      </div>

      {/* Exercise area — scrolls when keyboard is open so input stays visible */}
      <div className={cn(
        "flex-1 flex flex-col items-center w-full max-w-md mx-auto overflow-y-auto min-h-0",
        keyboardVisible
          ? "p-2 gap-2 justify-start pt-1"
          : "p-4 gap-3 justify-center"
      )}>
        <div className="w-full shrink-0">
          <ExerciseCard exercise={currentExercise} compact={keyboardVisible} />
        </div>

        <div className="w-full flex flex-col items-center gap-3 shrink-0">
          <AnswerInput
            key={currentExercise.id}
            onSubmit={handleCheck}
            onValueChange={setPendingAnswer}
            disabled={showingFeedback}
            feedback={feedback}
            submittedValue={submittedValue}
            compact={keyboardVisible}
          />

          {!showingFeedback ? (
            <>
              <Button
                onClick={handleCheck}
                disabled={!pendingAnswer.trim()}
                className={cn(
                  "w-full max-w-md font-semibold",
                  keyboardVisible ? "h-10 text-sm" : "h-12 text-base"
                )}
                data-testid="button-check"
              >
                Check
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className={cn(
                  "text-muted-foreground hover:text-foreground gap-1.5",
                  keyboardVisible && "text-xs h-8 px-2"
                )}
                data-testid="button-skip"
              >
                <SkipForward size={keyboardVisible ? 12 : 14} />
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
                className={cn(
                  "w-full max-w-md font-semibold",
                  keyboardVisible ? "h-10 text-sm" : "h-12 text-base"
                )}
                data-testid="button-next"
              >
                Next →
              </Button>
            </>
          )}
        </div>
      </div>

      {!keyboardVisible && <BottomNav />}
    </div>
  );
}

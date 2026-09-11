import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getAllProgress } from "../db/progress";
import { useExerciseSession } from "../hooks/useExerciseSession";
import { useKeyboardVisible } from "../hooks/useKeyboardVisible";
import { useAudioFeedback } from "../hooks/useAudioFeedback";
import { ExerciseCard } from "../components/ExerciseCard";
import { AnswerInput } from "../components/AnswerInput";
import { LetterBuilder } from "../components/LetterBuilder";
import { ProgressBar } from "../components/ProgressBar";
import { TrainingMenu, DEFAULT_SESSION } from "../components/TrainingMenu";
import { SessionConfig, toPersistedSessionConfig } from "../engine/exercises";
import { createExactReviewConfig, getActiveMistakeRecords } from "../engine/reviewQueue";
import { SkipForward, ChevronRight } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { isDailyGoalReached } from "../lib/dailyProgress";
import { useFullAccess } from "../purchases/FullAccessContext";
import { isPremiumSessionConfig } from "../purchases/access";

const CONFIG_KEY = "practice_config";
const CONFIG_DATE_KEY = "practice_config_date";
// Set to "true" when the user explicitly selects Mistakes Review from
// TrainingMenu. Cleared when the review ends (all solved / all skipped /
// user switches mode). Lets Practice re-enter the review on remount.
const MISTAKES_REVIEW_KEY = "practice_mistakes_review_active";
// Preserve the Letter Builder choice while an active review survives route
// navigation. The normal practice config is intentionally kept separate.
const MISTAKES_REVIEW_LETTER_BUILDER_KEY = "practice_mistakes_review_letter_builder";

function loadReviewLetterBuilderPreference(): boolean {
  return localStorage.getItem(MISTAKES_REVIEW_LETTER_BUILDER_KEY) !== "false";
}

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
    localStorage.setItem(CONFIG_KEY, JSON.stringify(toPersistedSessionConfig(config)));
    localStorage.setItem(CONFIG_DATE_KEY, Date.now().toString());
  } catch {
    // ignore
  }
}

function createFullConjugationConfig(letterBuilderEnabled: boolean): SessionConfig {
  return {
    ...DEFAULT_SESSION,
    letterBuilderEnabled,
    userCustomized: true,
  };
}

export default function Practice() {
  const [, navigate] = useLocation();
  const {
    entitlementReady,
    hasFullAccess,
    openPaywall,
  } = useFullAccess();
  const [config, setConfig]               = useState<SessionConfig>(
    loadPersistedConfig() ?? DEFAULT_SESSION
  );
  const sessionConfig = config.mistakesOnly || config.id === "mistake-review"
    ? config
    : (!entitlementReady || (!hasFullAccess && isPremiumSessionConfig(config)))
      ? DEFAULT_SESSION
      : config;

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
    reviewComplete,
    onClearReview,
    exerciseSeq,
    getReviewQueueLength,
    pendingAnswer,
    submittedValue,
    letterBuilderState,
    setPendingAnswer,
    setSubmittedValue,
    setLetterBuilderState,
  } = useExerciseSession(sessionConfig);

  useEffect(() => {
    if (!entitlementReady || hasFullAccess || !isPremiumSessionConfig(config)) return;
    sessionStorage.removeItem("exercise_session");
    setConfig({
      ...DEFAULT_SESSION,
      letterBuilderEnabled: config.letterBuilderEnabled ?? true,
      userCustomized: false,
    });
  }, [config, entitlementReady, hasFullAccess]);

  // ── Check for a Mistakes-review session on first load ───────────────────
  useEffect(() => {
    // Priority 1: navigated here directly from the Mistakes page.
    const raw = sessionStorage.getItem("mistakeReview");
    if (raw) {
      try {
        const data = JSON.parse(raw) as {
          mistakeIds?: string[];
          mode: string;
        };
        getAllProgress().then(all => {
          const activeMistakes = getActiveMistakeRecords(all);
          const requestedIds = data.mistakeIds?.length
            ? new Set(data.mistakeIds)
            : null;
          const reviewIds = activeMistakes
            .filter(record => !requestedIds || requestedIds.has(record.id))
            .map(record => record.id);

          if (reviewIds.length === 0) {
            // Never substitute a stale exact-ID snapshot with random exercises.
            sessionStorage.removeItem("mistakeReview");
            return;
          }

          setConfig(createExactReviewConfig(
            reviewIds,
            loadReviewLetterBuilderPreference(),
          ));
        });
      } catch {
        sessionStorage.removeItem("mistakeReview");
      }
      return;
    }

    // Priority 2: user explicitly selected Mistakes Review via TrainingMenu
    // and left Practice (navigated to another tab and back). Rebuild the review
    // from the current IDB mistake list — mistakes may have changed.
    if (localStorage.getItem(MISTAKES_REVIEW_KEY) === "true") {
      getAllProgress().then(all => {
        const mistakes = getActiveMistakeRecords(all)
          .sort((a, b) => b.failureCount - a.failureCount);
        const mistakeIds  = mistakes.map(r => r.id);
        if (mistakeIds.length > 0) {
          setConfig(createExactReviewConfig(
            mistakeIds,
            loadReviewLetterBuilderPreference(),
          ));
        } else {
          // All mistakes were solved elsewhere — exit review mode silently.
          localStorage.removeItem(MISTAKES_REVIEW_KEY);
          localStorage.removeItem(MISTAKES_REVIEW_LETTER_BUILDER_KEY);
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist config changes to localStorage ──────────────────────────────
  // Never persist the transient review config — if the user returns to Practice
  // later it should open as a normal practice session, not restart a review.
  useEffect(() => {
    if (config.id === "mistake-review") return;
    savePersistedConfig(config);
  }, [config]);

  // ── Return to Full Conjugation when Mistakes Review completes ─────────────
  // reviewComplete fires as soon as the last exact mistake is answered correctly.
  useEffect(() => {
    if (!reviewComplete) return;
    setSubmittedValue("");
    setPendingAnswer("");
    setLetterBuilderState(null);
    localStorage.removeItem(MISTAKES_REVIEW_KEY);
    localStorage.removeItem(MISTAKES_REVIEW_LETTER_BUILDER_KEY);
    setConfig(createFullConjugationConfig(config.letterBuilderEnabled ?? true));
    onClearReview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewComplete]);

  // ── Success sound ────────────────────────────────────────────────────────────
  const { playSuccess } = useAudioFeedback();
  useEffect(() => {
    if (feedback === "correct") playSuccess();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback]);

  const handleCheck = () => {
    if (!pendingAnswer.trim() || feedback !== null) return;
    setSubmittedValue(pendingAnswer);
    submitAnswer(pendingAnswer);
  };

  // ── Letter Builder callbacks ─────────────────────────────────────────────────
  const handleLetterBuilderSuccess = (answer: string) => {
    setSubmittedValue(answer);
    setLetterBuilderState(null);
    submitAnswer(answer);
  };

  const handleLetterBuilderFailure = () => {
    // Submit a clearly-wrong string so the existing failure flow fires
    submitAnswer("__lb_fail__");
  };

  const handleSkip = () => {
    setSubmittedValue("");
    setPendingAnswer("");
    setLetterBuilderState(null);

    // Case 2: last (or only) remaining mistake in the review queue.
    // Skipping it would just loop the same exercise forever, so auto-exit
    // Mistakes Review and return to Full Conjugation.
    // The mistake is NOT marked solved — it stays in the Mistakes list.
    if (config.id === "mistake-review" && getReviewQueueLength() <= 1) {
      localStorage.removeItem(MISTAKES_REVIEW_KEY);
      localStorage.removeItem(MISTAKES_REVIEW_LETTER_BUILDER_KEY);
      setConfig(createFullConjugationConfig(config.letterBuilderEnabled ?? true));
      onClearReview();
      return;
    }

    // Case 1: other mistakes remain — normal skip, stay in Mistakes Review.
    skipExercise();
  };

  const handleNext = () => {
    setSubmittedValue("");
    setPendingAnswer("");
    setLetterBuilderState(null);
    nextExercise();
  };

  const handleSelectConfig = async (next: SessionConfig) => {
    if (!hasFullAccess && isPremiumSessionConfig(next)) {
      openPaywall();
      return;
    }
    setSubmittedValue("");
    setPendingAnswer("");
    setLetterBuilderState(null);

    // When Mistakes Review is selected from TrainingMenu, perform the same
    // IDB lookup the Mistakes page does — build a proper reviewMistakeIds-based
    // config so the session starts immediately from the real mistake list.
    if (next.mistakesOnly) {
      const all = await getAllProgress();
      const mistakes = getActiveMistakeRecords(all)
        .sort((a, b) => b.failureCount - a.failureCount);
      const mistakeIds  = mistakes.map(r => r.id);

      if (mistakeIds.length > 0) {
        onClearReview();
        // Remember the user's explicit choice so Practice re-enters review on remount.
        localStorage.setItem(MISTAKES_REVIEW_KEY, "true");
        const letterBuilderEnabled = next.letterBuilderEnabled ?? true;
        localStorage.setItem(
          MISTAKES_REVIEW_LETTER_BUILDER_KEY,
          String(letterBuilderEnabled),
        );
        setConfig(createExactReviewConfig(mistakeIds, letterBuilderEnabled));
        return;
      }
      // No mistakes in IDB — fall through so the session shows the empty state
      // (noMistakes will be true and practice.tsx renders the "no mistakes" prompt).
    }

    // User switched to a normal mode — discard the Mistakes Review persistence.
    localStorage.removeItem(MISTAKES_REVIEW_KEY);
    setConfig(next);
    // If user manually picks a mode, clear the transient review session
    onClearReview();
  };

  // Fires immediately when the user flips a toggle (Context / Letter Builder)
  // inside the Training Mode sheet — no need to press "Start Training".
  // During an active Review Mistakes session, preserve the review queue while
  // applying the Letter Builder choice. Context remains locked off by the menu.
  const handleImmediateToggle = (next: SessionConfig) => {
    if (!hasFullAccess && isPremiumSessionConfig(next)) {
      openPaywall();
      return;
    }
    setSubmittedValue("");
    setPendingAnswer("");
    setLetterBuilderState(null);

    if (config.id === "mistake-review") {
      const letterBuilderEnabled = next.letterBuilderEnabled ?? true;
      localStorage.setItem(
        MISTAKES_REVIEW_LETTER_BUILDER_KEY,
        String(letterBuilderEnabled),
      );
      setConfig(prev => ({
        ...prev,
        contextEnabled: false,
        letterBuilderEnabled,
      }));
      return;
    }

    // Selecting Review Mistakes is committed by "To Training"; changing its
    // draft toggles should not start a review before that confirmation.
    if (next.mistakesOnly) return;

    setConfig(next);
    // Deliberately no onClearReview() — toggle changes should not discard
    // any in-progress review queue.
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
          <TrainingMenu
            current={config}
            onSelect={handleSelectConfig}
            onImmediateToggle={handleImmediateToggle}
            hasFullAccess={hasFullAccess}
            onLockedPreset={openPaywall}
          />
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
            onImmediateToggle={handleImmediateToggle}
            hasFullAccess={hasFullAccess}
            onLockedPreset={openPaywall}
            compact={keyboardVisible}
          />
          {!keyboardVisible && (
            <Button
              variant="secondary"
              size="compact"
              onClick={handleOpenTenses}
              className="shrink-0"
              aria-label="English Tenses reference"
            >
              <span>English Tenses</span>
              <ChevronRight size={13} className="text-muted-foreground -ml-0.5" />
            </Button>
          )}
        </div>

        {/* Row 2: Daily Progress block — visible only when keyboard is closed.
            Sits naturally below the top controls instead of at the screen edge. */}
        {!keyboardVisible && (
          <ProgressBar
            current={dailyCorrect + dailyIncorrect}
            total={dailyGoal}
            correct={dailyCorrect}
            incorrect={dailyIncorrect}
            goalReached={isDailyGoalReached(dailyCorrect + dailyIncorrect, dailyGoal)}
          />
        )}
      </div>

      {/* Exercise area — scrolls when keyboard is open so input stays visible */}
      <div className={cn(
        "flex-1 flex flex-col items-center w-full max-w-md mx-auto overflow-y-auto min-h-0",
        keyboardVisible
          ? "p-2 gap-2 justify-start pt-1"
          : "px-4 py-3 gap-2 justify-center"
      )}>
        <div className="w-full shrink-0">
          {/* Letter Builder needs the compact card — the letter UI is the focus,
              not the large-format verb display. */}
          <ExerciseCard
            exercise={currentExercise}
            compact={keyboardVisible || !!config.letterBuilderEnabled}
            irregularContext={
              !!config.exerciseTypes?.includes("irregular") &&
              !config.exerciseTypes?.includes("verbform")
            }
          />
        </div>

        <div className="w-full flex flex-col items-center gap-3 shrink-0">
          {config.letterBuilderEnabled ? (
            /* ── Letter Builder mode ──────────────────────────────────────── */
            !showingFeedback && (
              <LetterBuilder
                key={exerciseSeq}
                exercise={currentExercise}
                initialState={letterBuilderState}
                onStateChange={setLetterBuilderState}
                onSuccess={handleLetterBuilderSuccess}
                onFailure={handleLetterBuilderFailure}
                onSkip={handleSkip}
                compact={keyboardVisible}
              />
            )
          ) : (
            /* ── Traditional typing mode ──────────────────────────────────── */
            <AnswerInput
              key={exerciseSeq}
              value={pendingAnswer}
              onSubmit={handleCheck}
              onValueChange={setPendingAnswer}
              disabled={showingFeedback}
              feedback={feedback}
              submittedValue={submittedValue}
              compact={keyboardVisible}
              expectedAnswer={
                Array.isArray(currentExercise.answer)
                  ? currentExercise.answer[0]
                  : currentExercise.answer
              }
            />
          )}

          {!config.letterBuilderEnabled && !showingFeedback && (
            <>
              <Button
                size="lg"
                onClick={handleCheck}
                disabled={!pendingAnswer.trim()}
                className={cn(
                  "w-full max-w-md",
                  keyboardVisible && "h-10 text-sm"
                )}
                data-testid="button-check"
              >
                Check
              </Button>
              <Button
                variant="tertiary"
                size="compact"
                onClick={handleSkip}
                className={cn(
                  "hover:text-foreground",
                  keyboardVisible && "text-xs"
                )}
                data-testid="button-skip"
              >
                <SkipForward size={keyboardVisible ? 12 : 14} />
                Skip
              </Button>
            </>
          )}

          {showingFeedback && (
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
                size="lg"
                onClick={handleNext}
                className={cn(
                  "w-full max-w-md",
                  keyboardVisible && "h-10 text-sm"
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

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  SessionConfig,
  ExerciseItem,
  generateExerciseFromConfig,
  exerciseFromMistakeId,
  restorePersistedExercise,
  toPersistedSessionConfig,
} from '../engine/exercises';
import { LetterBuilderState } from './useLetterBuilder';
import { useSettings } from './useSettings';
import { useStats } from './useStats';
import { getProgress, saveProgress, getAllProgress } from '../db/progress';
import { updateSRS, ProgressRecord } from '../engine/srs';
import { isCorrect } from '../engine/validate';
import {
  canRestorePendingReviewQueue,
  createReviewQueue,
  getActiveMistakeRecords,
  removeCurrentReviewItem,
  rotateCurrentReviewItem,
} from '../engine/reviewQueue';

const SESSION_KEY = 'exercise_session';
const REVIEW_SESSION_KEY = 'mistake_review_session';

interface SessionState {
  config: SessionConfig;
  exercise: ExerciseItem;
  feedback: "correct" | "incorrect" | null;
  showAnswer: string | null;
  pendingAnswer: string;
  submittedValue: string;
  letterBuilderState?: LetterBuilderState | null;
  pendingMistakeIds?: string[];
}

function sessionKeyFor(config: SessionConfig): string {
  return isExactReviewConfig(config) ? REVIEW_SESSION_KEY : SESSION_KEY;
}

function saveSession(state: SessionState) {
  try {
    sessionStorage.setItem(
      sessionKeyFor(state.config),
      JSON.stringify({ ...state, config: toPersistedSessionConfig(state.config) }),
    );
  } catch {
    // ignore
  }
}

function loadSession(config: SessionConfig): SessionState | null {
  try {
    const raw = sessionStorage.getItem(sessionKeyFor(config));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(REVIEW_SESSION_KEY);
}

export function configsMatch(a: SessionConfig, b: SessionConfig): boolean {
  if (a.id !== b.id) return false;
  if (a.contextEnabled !== b.contextEnabled) return false;
  if (a.letterBuilderEnabled !== b.letterBuilderEnabled) return false;
  if (a.mistakesOnly !== b.mistakesOnly) return false;
  if (JSON.stringify(a.reviewMistakeIds) !== JSON.stringify(b.reviewMistakeIds)) return false;
  return true;
}

function isExactReviewConfig(config: SessionConfig): boolean {
  return config.id === "mistake-review" && !!config.reviewMistakeIds?.length;
}

function canRestoreReviewSession(stored: SessionState, config: SessionConfig): boolean {
  if (!isExactReviewConfig(stored.config) || !isExactReviewConfig(config)) return false;
  return canRestorePendingReviewQueue(
    stored.pendingMistakeIds,
    config.reviewMistakeIds ?? [],
  );
}

export function useExerciseSession(config: SessionConfig) {
  const { settings } = useSettings();
  const { stats, updateStats } = useStats();

  const [currentExercise, setCurrentExercise] = useState<ExerciseItem | null>(null);
  const [streak, setStreak]                   = useState(0);
  const [feedback, setFeedback]               = useState<"correct" | "incorrect" | null>(null);
  const [showAnswer, setShowAnswer]           = useState<string | null>(null);
  const [pendingAnswer, setPendingAnswer]     = useState("");
  const [submittedValue, setSubmittedValue]   = useState("");
  const [letterBuilderState, setLetterBuilderState] =
    useState<LetterBuilderState | null>(null);
  const [activeMistakeIds, setActiveMistakeIds] = useState<string[]>([]);
  const [mistakesReady, setMistakesReady]     = useState(!config.mistakesOnly);
  const [reviewComplete, setReviewComplete]   = useState(false);
  const [reviewQueueVersion, setReviewQueueVersion] = useState(0);
  // Increments on every nextExercise() so AnswerInput always remounts even if
  // the generated exercise id happens to be the same as the previous one.
  const [exerciseSeq, setExerciseSeq]         = useState(0);

  // ── Review-mode tracking ────────────────────────────────────────────────────
  // Ordered list of mistake IDs still to be answered correctly this session.
  const pendingMistakeIdsRef  = useRef<string[]>([]);

  // Keep latest values in refs so nextExercise closure is never stale
  const configRef             = useRef(config);
  // Track the previous contextEnabled so we can detect a false→true transition
  // and guarantee the first exercise after enabling Context is a gapfill.
  const prevContextEnabledRef = useRef(config.contextEnabled);
  configRef.current = config;

  // ── Load active mistake IDs from IDB when in review mode ────────────────────
  useEffect(() => {
    if (!config.mistakesOnly) {
      setActiveMistakeIds([]);
      setMistakesReady(true);
      return;
    }
    setMistakesReady(false);
    getAllProgress().then(records => {
      setActiveMistakeIds(getActiveMistakeRecords(records).map(record => record.id));
      setMistakesReady(true);
    });
  }, [config.mistakesOnly, config.id]);

  // ── Generate or restore exercise on mount/config change ────────────────────
  useEffect(() => {
    if (!settings || !mistakesReady) return;

    const stored = loadSession(config);
    const restoredExercise = stored
      ? restorePersistedExercise(stored.exercise)
      : null;
    if (isExactReviewConfig(config)) {
      if (
        stored &&
        restoredExercise &&
        canRestoreReviewSession(stored, config)
      ) {
        pendingMistakeIdsRef.current = stored.pendingMistakeIds ?? [];
        setCurrentExercise(restoredExercise);
        setFeedback(stored.feedback);
        setShowAnswer(stored.showAnswer);
        setPendingAnswer(stored.pendingAnswer ?? "");
        setSubmittedValue(stored.submittedValue ?? "");
        setLetterBuilderState(stored.letterBuilderState ?? null);
        setReviewComplete(false);
        return;
      }

      pendingMistakeIdsRef.current = createReviewQueue(config.reviewMistakeIds ?? []);
      setFeedback(null);
      setShowAnswer(null);
      setPendingAnswer("");
      setSubmittedValue("");
      setLetterBuilderState(null);
      setReviewComplete(false);
      clearSession();

      const firstId = pendingMistakeIdsRef.current[0];
      setCurrentExercise(firstId ? exerciseFromMistakeId(firstId) : null);
      setExerciseSeq(s => s + 1);
      return;
    }

    // A review is always configured with exact active IDs by Practice. Never
    // replace a stale/missing review snapshot with a random verb-only exercise.
    if (config.mistakesOnly) {
      setCurrentExercise(null);
      return;
    }

    if (
      stored &&
      restoredExercise &&
      configsMatch(stored.config, config)
    ) {
      setCurrentExercise(restoredExercise);
      setFeedback(stored.feedback);
      setShowAnswer(stored.showAnswer);
      setPendingAnswer(stored.pendingAnswer ?? "");
      setSubmittedValue(stored.submittedValue ?? "");
      setLetterBuilderState(stored.letterBuilderState ?? null);
      // Session restore: exerciseSeq unchanged — same exercise, same component state.
      return;
    }

    // When the user just enabled Context Mode, guarantee the first exercise is a
    // gapfill so the change is immediately visible (random pick could give verbform).
    const contextJustEnabled =
      config.contextEnabled && !prevContextEnabledRef.current;
    prevContextEnabledRef.current = config.contextEnabled;

    setFeedback(null);
    setShowAnswer(null);
    setPendingAnswer("");
    setSubmittedValue("");
    setLetterBuilderState(null);
    setCurrentExercise(
      generateExerciseFromConfig(
        config,
        settings.difficulty,
        contextJustEnabled ? "gapfill" : undefined,
      ),
    );
    // Bump so LetterBuilder / AnswerInput always remount on a fresh exercise,
    // whether the change came from nextExercise() or a config-driven regeneration.
    setExerciseSeq(s => s + 1);
    // config.id + contextEnabled track config identity.
    // letterBuilderEnabled is intentionally excluded — it controls the input
    // component only and must never trigger exercise regeneration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.id, config.contextEnabled, settings?.difficulty, mistakesReady]);

  // ── Save session state whenever exercise or feedback changes ─────────────────
  useEffect(() => {
    if (!currentExercise) return;
    saveSession({
      config,
      exercise: currentExercise,
      feedback,
      showAnswer,
      pendingAnswer,
      submittedValue,
      letterBuilderState: feedback === null ? letterBuilderState : null,
      pendingMistakeIds: isExactReviewConfig(config)
        ? pendingMistakeIdsRef.current
        : undefined,
    });
  }, [
    config,
    currentExercise,
    feedback,
    showAnswer,
    pendingAnswer,
    submittedValue,
    letterBuilderState,
    reviewQueueVersion,
  ]);

  // ── Next / Skip ────────────────────────────────────────────────────────────
  const nextExercise = () => {
    if (!settings) return;
    const cfg = configRef.current;

    setFeedback(null);
    setShowAnswer(null);
    setPendingAnswer("");
    setSubmittedValue("");
    setLetterBuilderState(null);
    setExerciseSeq(s => s + 1);

    // ── Specific-mistake-ID review mode ──────────────────────────────────────
    if (isExactReviewConfig(cfg)) {
      const pending = pendingMistakeIdsRef.current;

      if (pending.length === 0) {
        setReviewComplete(true);
        return;
      }

      const nextId = pending[0];
      setCurrentExercise(exerciseFromMistakeId(nextId));
      return;
    }

    setCurrentExercise(
      generateExerciseFromConfig(cfg, settings.difficulty),
    );
  };

  const setPendingAnswerValue = (value: string) => setPendingAnswer(value);
  const setSubmittedValueValue = (value: string) => setSubmittedValue(value);
  const updateLetterBuilderState = useCallback(
    (value: LetterBuilderState | null) => setLetterBuilderState(value),
    [],
  );

  // ── Submit ─────────────────────────────────────────────────────────────────
  const submitAnswer = async (answer: string) => {
    if (!currentExercise || feedback || !settings || !stats) return;

    setLetterBuilderState(null);
    const correct = isCorrect(answer, currentExercise.answer);
    setFeedback(correct ? "correct" : "incorrect");
    setShowAnswer(
      Array.isArray(currentExercise.answer)
        ? currentExercise.answer[0]
        : currentExercise.answer,
    );

    setStreak(prev => (correct ? prev + 1 : 0));

    const nextSessionAnswers = stats.sessionAnswers + 1;
    const nextDailyCorrect = stats.dailyCorrect + (correct ? 1 : 0);
    const nextDailyIncorrect = stats.dailyIncorrect + (correct ? 0 : 1);

    try {
      sessionStorage.setItem("progress-daily-total", String(nextDailyCorrect + nextDailyIncorrect));
    } catch { /* ignore */ }

    updateStats({
      sessionAnswers:    nextSessionAnswers,
      totalAnswers:      stats.totalAnswers + 1,
      totalCorrect:      stats.totalCorrect + (correct ? 1 : 0),
      totalIncorrect:    stats.totalIncorrect + (correct ? 0 : 1),
      dailyCorrect:      nextDailyCorrect,
      dailyIncorrect:    nextDailyIncorrect,
      currentStreak:   correct ? stats.currentStreak + 1 : 0,
      bestStreak:      Math.max(stats.bestStreak, correct ? stats.currentStreak + 1 : 0),
      lastStudyDate:   Date.now(),
    });

    // SRS update
    let record: ProgressRecord = (await getProgress(currentExercise.id)) ?? {
      id:             currentExercise.id,
      type:           currentExercise.type,
      verbInfinitive: currentExercise.question.verb || "",
      easeFactor:     2.5,
      interval:       0,
      dueDate:        0,
      successCount:    0,
      failureCount:    0,
      lastReviewDate:  0,
      lastFailureDate: 0,
    };

    record = updateSRS(record, correct);

    // ── Review-mode specific handling ─────────────────────────────────────────
    const cfg = configRef.current;

    if (isExactReviewConfig(cfg)) {
      const pending = pendingMistakeIdsRef.current;

      if (correct) {
        // Clear the failure marker so this item no longer shows on the Mistakes
        // screen.  SRS history (interval, easeFactor) is preserved.
        record.lastFailureDate = 0;
        pendingMistakeIdsRef.current = removeCurrentReviewItem(pending);
      } else {
        pendingMistakeIdsRef.current = rotateCurrentReviewItem(pending);
      }
      setReviewQueueVersion(version => version + 1);

      await saveProgress(record);

      // Notify the Mistakes screen so it can reload its list reactively.
      try { window.dispatchEvent(new CustomEvent("mistakes-updated")); } catch { /* ignore */ }

      // If this was the last mistake and it was just answered correctly, signal
      // the UI immediately — no need for the user to press Next.
      if (correct && pendingMistakeIdsRef.current.length === 0) {
        setReviewComplete(true);
      }
      return;
    }

    await saveProgress(record);
    // Keep TrainingMenu's Mistakes option in sync while the user remains
    // on the current screen.
    try { window.dispatchEvent(new CustomEvent("mistakes-updated")); } catch { /* ignore */ }

  };

  const noMistakes =
    !!config.mistakesOnly && mistakesReady && activeMistakeIds.length === 0;

  const onClearReview = () => {
    // Full teardown of review state so Practice returns to a clean slate.
    pendingMistakeIdsRef.current  = [];
    setReviewQueueVersion(version => version + 1);
    setReviewComplete(false);
    clearSession();
    sessionStorage.removeItem("mistakeReview");
  };

  // ── Skip ─────────────────────────────────────────────────────────────────────
  // Separate from nextExercise: no answer is submitted. In review mode it
  // consumes the current item for this session without touching stats, SRS,
  // or the stored mistake marker.
  const skipExercise = () => {
    if (!settings) return;
    const cfg = configRef.current;

    setFeedback(null);
    setShowAnswer(null);
    setPendingAnswer("");
    setSubmittedValue("");
    setLetterBuilderState(null);
    setExerciseSeq(s => s + 1);

    // ── Specific-mistake-ID review mode ────────────────────────────────────────
    if (isExactReviewConfig(cfg)) {
      const pending = pendingMistakeIdsRef.current;
      if (pending.length <= 1) {
        // Handled by handleSkip in practice.tsx before calling here; guard only.
        return;
      }
      // Remove the current mistake from the queue — one pass only.
      // The mistake is NOT marked solved; it stays on the Mistakes screen.
      // Rotating back is intentionally avoided so the user can never be
      // sent back to a mistake they already skipped this session.
      pendingMistakeIdsRef.current = removeCurrentReviewItem(pending);
      setReviewQueueVersion(version => version + 1);
      const nextId = pendingMistakeIdsRef.current[0];
      setCurrentExercise(exerciseFromMistakeId(nextId));
      return;
    }

    setCurrentExercise(generateExerciseFromConfig(cfg, settings.difficulty));
  };

  return {
    currentExercise,
    dailyCorrect:      stats?.dailyCorrect ?? 0,
    dailyIncorrect:    stats?.dailyIncorrect ?? 0,
    streak,
    feedback,
    showAnswer,
    pendingAnswer,
    submittedValue,
    letterBuilderState,
    setPendingAnswer: setPendingAnswerValue,
    setSubmittedValue: setSubmittedValueValue,
    setLetterBuilderState: updateLetterBuilderState,
    submitAnswer,
    nextExercise,
    skipExercise,
    dailyGoal: settings?.dailyGoal || 20,
    noMistakes,
    reviewComplete,
    onClearReview,
    exerciseSeq,
    /** Returns the number of mistake IDs still in the review queue (always fresh). */
    getReviewQueueLength: () => pendingMistakeIdsRef.current.length,
  };
}

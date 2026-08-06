import { useState, useEffect, useRef } from 'react';
import { SessionConfig, ExerciseItem, generateExerciseFromConfig, exerciseFromMistakeId } from '../engine/exercises';
import { useSettings } from './useSettings';
import { useStats } from './useStats';
import { getProgress, saveProgress, getAllProgress } from '../db/progress';
import { updateSRS, ProgressRecord } from '../engine/srs';
import { isCorrect } from '../engine/validate';

const SESSION_KEY = 'exercise_session';

interface SessionState {
  config: SessionConfig;
  exercise: ExerciseItem;
  feedback: "correct" | "incorrect" | null;
  showAnswer: string | null;
  pendingAnswer: string;
  submittedValue: string;
}

function saveSession(state: SessionState) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function loadSession(): SessionState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

function configsMatch(a: SessionConfig, b: SessionConfig): boolean {
  if (a.id !== b.id) return false;
  if (a.contextEnabled !== b.contextEnabled) return false;
  if (a.mistakesOnly !== b.mistakesOnly) return false;
  if (JSON.stringify(a.reviewVerbs) !== JSON.stringify(b.reviewVerbs)) return false;
  if (JSON.stringify(a.reviewMistakeIds) !== JSON.stringify(b.reviewMistakeIds)) return false;
  return true;
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
  const [mistakeVerbs, setMistakeVerbs]       = useState<string[]>([]);
  const [mistakesReady, setMistakesReady]     = useState(!config.mistakesOnly);
  const [reviewExhausted, setReviewExhausted] = useState(false);
  // Set to true when every mistakeId has been answered correctly — triggers
  // automatic navigation back to the Mistakes screen in the UI layer.
  const [reviewComplete, setReviewComplete]   = useState(false);
  // Increments on every nextExercise() so AnswerInput always remounts even if
  // the generated exercise id happens to be the same as the previous one.
  const [exerciseSeq, setExerciseSeq]         = useState(0);

  // ── Review-mode tracking ────────────────────────────────────────────────────
  // Ordered list of mistake IDs still to be answered correctly this session.
  const pendingMistakeIdsRef  = useRef<string[]>([]);
  // Legacy: track by verb name (used when only reviewVerbs is set)
  const reviewVerbsCorrectRef = useRef(new Set<string>());
  const reviewVerbsKeyRef     = useRef<string>("");
  // Remember the outcome of the last submitted answer so nextExercise() can act on it.
  const lastFeedbackRef       = useRef<"correct" | "incorrect" | null>(null);

  if (config.reviewVerbs) {
    const key = config.reviewVerbs.join(",");
    if (key !== reviewVerbsKeyRef.current) {
      reviewVerbsCorrectRef.current = new Set<string>();
      reviewVerbsKeyRef.current = key;
    }
  }

  // Keep latest values in refs so nextExercise closure is never stale
  const configRef       = useRef(config);
  const mistakeVerbsRef = useRef(mistakeVerbs);
  configRef.current       = config;
  mistakeVerbsRef.current = mistakeVerbs;

  // ── Load mistake verbs from IDB when in mistakes mode ──────────────────────
  useEffect(() => {
    if (!config.mistakesOnly) {
      setMistakeVerbs([]);
      setMistakesReady(true);
      return;
    }
    setMistakesReady(false);
    getAllProgress().then(records => {
      const found = [
        ...new Set(
          records
            .filter(r => r.failureCount > 0)
            .map(r => r.verbInfinitive)
            .filter(Boolean),
        ),
      ];
      setMistakeVerbs(found);
      setMistakesReady(true);
    });
  }, [config.mistakesOnly, config.id]);

  // ── Generate or restore exercise on mount/config change ────────────────────
  useEffect(() => {
    if (!settings || !mistakesReady) return;

    // When review mode is active with specific mistake IDs, always start fresh —
    // never restore from session (the ordering is per-session and session storage
    // may hold a stale exercise from a different review run).
    if (config.reviewMistakeIds && config.reviewMistakeIds.length > 0) {
      // Initialize the pending list (sorted: keep original order from DB query)
      pendingMistakeIdsRef.current = [...config.reviewMistakeIds];
      lastFeedbackRef.current = null;
      reviewVerbsCorrectRef.current = new Set<string>();
      setFeedback(null);
      setShowAnswer(null);
      setReviewExhausted(false);
      clearSession();

      const firstId = pendingMistakeIdsRef.current[0];
      const ex = exerciseFromMistakeId(firstId) ??
        generateExerciseFromConfig(config, settings.difficulty);
      setCurrentExercise(ex);
      return;
    }

    const stored = loadSession();
    if (stored && configsMatch(stored.config, config)) {
      setCurrentExercise(stored.exercise);
      setFeedback(stored.feedback);
      setShowAnswer(stored.showAnswer);
      setPendingAnswer(stored.pendingAnswer ?? "");
      setSubmittedValue(stored.submittedValue ?? "");
      return;
    }

    setFeedback(null);
    setShowAnswer(null);
    setCurrentExercise(
      generateExerciseFromConfig(
        config,
        settings.difficulty,
        config.mistakesOnly ? mistakeVerbs : undefined,
      ),
    );
    // mistakeVerbs intentionally read from state here (always fresh after
    // mistakesReady flips); config.id + contextEnabled track config identity.
    // letterBuilderEnabled is intentionally excluded — it controls the input
    // component only and must never trigger exercise regeneration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.id, config.contextEnabled, settings?.difficulty, mistakesReady]);

  // ── Save session state whenever exercise or feedback changes ─────────────────
  useEffect(() => {
    if (!currentExercise) return;
    // Don't persist review-mode sessions — they are always rebuilt from IDs.
    if (config.reviewMistakeIds && config.reviewMistakeIds.length > 0) return;
    saveSession({
      config,
      exercise: currentExercise,
      feedback,
      showAnswer,
      pendingAnswer,
      submittedValue,
    });
  }, [currentExercise, feedback, showAnswer, pendingAnswer, submittedValue]);

  // ── Next / Skip ────────────────────────────────────────────────────────────
  const nextExercise = () => {
    if (!settings) return;
    const cfg = configRef.current;
    const wasCorrect = lastFeedbackRef.current === "correct";
    lastFeedbackRef.current = null;

    setFeedback(null);
    setShowAnswer(null);
    setPendingAnswer("");
    setSubmittedValue("");
    setExerciseSeq(s => s + 1);

    // ── Specific-mistake-ID review mode ──────────────────────────────────────
    if (cfg.reviewMistakeIds && cfg.reviewMistakeIds.length > 0) {
      const pending = pendingMistakeIdsRef.current;

      // Current exercise's ID is pending[0].
      // If answered correctly it was already removed from the front in submitAnswer.
      // If answered incorrectly it was already rotated to the back in submitAnswer.
      // So just look at what's next.
      if (pending.length === 0) {
        // All mistakes have been cleared — signal the UI to navigate away.
        setReviewComplete(true);
        return;
      }

      const nextId = pending[0];
      const ex = exerciseFromMistakeId(nextId) ??
        generateExerciseFromConfig(cfg, settings.difficulty);
      setCurrentExercise(ex);
      return;
    }

    // ── Regular / legacy verb-name review mode ───────────────────────────────
    setCurrentExercise(
      generateExerciseFromConfig(
        cfg,
        settings.difficulty,
        cfg.mistakesOnly ? mistakeVerbsRef.current : undefined,
      ),
    );
  };

  const setPendingAnswerValue = (value: string) => setPendingAnswer(value);
  const setSubmittedValueValue = (value: string) => setSubmittedValue(value);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const submitAnswer = async (answer: string) => {
    if (!currentExercise || feedback || !settings || !stats) return;

    const correct = isCorrect(answer, currentExercise.answer);
    lastFeedbackRef.current = correct ? "correct" : "incorrect";
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

    if (cfg.reviewMistakeIds && cfg.reviewMistakeIds.length > 0) {
      const pending = pendingMistakeIdsRef.current;

      if (correct) {
        // Clear the failure marker so this item no longer shows on the Mistakes
        // screen.  SRS history (interval, easeFactor) is preserved.
        record.lastFailureDate = 0;
        // Remove from the front of the pending list.
        pendingMistakeIdsRef.current = pending.slice(1);
      } else {
        // Rotate to the back so the user will see it again after the rest.
        pendingMistakeIdsRef.current = [...pending.slice(1), pending[0]];
      }

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

    // Legacy verb-name review tracking
    if (correct) {
      const verb = currentExercise.question.verb;
      if (verb && cfg.reviewVerbs) {
        reviewVerbsCorrectRef.current.add(verb);
        const allCorrect = cfg.reviewVerbs.every(v => reviewVerbsCorrectRef.current.has(v));
        if (allCorrect) {
          setReviewExhausted(true);
        }
      }
    }
  };

  const noMistakes =
    !!config.mistakesOnly && mistakesReady && mistakeVerbs.length === 0;

  const onClearReview = () => {
    // Full teardown of review state so Practice returns to a clean slate.
    pendingMistakeIdsRef.current  = [];
    reviewVerbsCorrectRef.current = new Set<string>();
    lastFeedbackRef.current       = null;
    setReviewExhausted(false);
    setReviewComplete(false);
    clearSession();
    sessionStorage.removeItem("mistakeReview");
  };

  return {
    currentExercise,
    dailyCorrect:      stats?.dailyCorrect ?? 0,
    dailyIncorrect:    stats?.dailyIncorrect ?? 0,
    streak,
    feedback,
    showAnswer,
    submitAnswer,
    nextExercise,
    skipExercise: nextExercise,
    dailyGoal: settings?.dailyGoal || 20,
    noMistakes,
    reviewExhausted,
    reviewComplete,
    onClearReview,
    exerciseSeq,
    /** Returns the number of mistake IDs still in the review queue (always fresh). */
    getReviewQueueLength: () => pendingMistakeIdsRef.current.length,
  };
}

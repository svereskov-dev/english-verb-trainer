import { useState, useEffect, useRef } from 'react';
import { SessionConfig, ExerciseItem, generateExerciseFromConfig } from '../engine/exercises';
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

  // Track which review verbs have been answered correctly in this session
  const reviewVerbsCorrectRef = useRef(new Set<string>());
  const reviewVerbsKeyRef = useRef<string>("");
  if (config.reviewVerbs) {
    // Reset tracking whenever reviewVerbs list changes
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
    });
  }, [currentExercise, feedback, showAnswer, pendingAnswer, submittedValue]);

  // ── Next / Skip ────────────────────────────────────────────────────────────
  const nextExercise = () => {
    if (!settings) return;
    const cfg = configRef.current;
    setFeedback(null);
    setShowAnswer(null);
    setPendingAnswer("");
    setSubmittedValue("");
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
    setFeedback(correct ? "correct" : "incorrect");
    setShowAnswer(
      Array.isArray(currentExercise.answer)
        ? currentExercise.answer[0]
        : currentExercise.answer,
    );

    setStreak(prev => (correct ? prev + 1 : 0));

    updateStats({
      sessionAnswers:    stats.sessionAnswers + 1,
      totalAnswers:      stats.totalAnswers + 1,
      totalCorrect:      stats.totalCorrect + (correct ? 1 : 0),
      totalIncorrect:    stats.totalIncorrect + (correct ? 0 : 1),
      dailyCorrect:      stats.dailyCorrect + (correct ? 1 : 0),
      dailyIncorrect:    stats.dailyIncorrect + (correct ? 0 : 1),
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
    await saveProgress(record);

    if (correct) {
      const verb = currentExercise.question.verb;
      if (verb && config.reviewVerbs) {
        reviewVerbsCorrectRef.current.add(verb);
        const allCorrect = config.reviewVerbs.every(v => reviewVerbsCorrectRef.current.has(v));
        if (allCorrect) {
          setReviewExhausted(true);
        }
      }
    }
  };

  const noMistakes =
    !!config.mistakesOnly && mistakesReady && mistakeVerbs.length === 0;

  const onClearReview = () => {
    setReviewExhausted(false);
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
    dailyGoal: settings?.dailyGoal || 25,
    noMistakes,
    reviewExhausted,
    onClearReview,
  };
}

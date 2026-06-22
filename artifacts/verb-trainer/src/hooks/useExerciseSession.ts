import { useState, useEffect, useRef } from 'react';
import { SessionConfig, ExerciseItem, generateExerciseFromConfig } from '../engine/exercises';
import { useSettings } from './useSettings';
import { useStats } from './useStats';
import { getProgress, saveProgress, getAllProgress } from '../db/progress';
import { updateSRS, ProgressRecord } from '../engine/srs';
import { isCorrect } from '../engine/validate';

export function useExerciseSession(config: SessionConfig) {
  const { settings } = useSettings();
  const { stats, updateStats } = useStats();

  const [currentExercise, setCurrentExercise] = useState<ExerciseItem | null>(null);
  const [sessionCount, setSessionCount]       = useState(0);
  const [streak, setStreak]                   = useState(0);
  const [feedback, setFeedback]               = useState<"correct" | "incorrect" | null>(null);
  const [showAnswer, setShowAnswer]           = useState<string | null>(null);
  const [mistakeVerbs, setMistakeVerbs]       = useState<string[]>([]);
  const [mistakesReady, setMistakesReady]     = useState(!config.mistakesOnly);

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

  // ── Generate first exercise whenever config or difficulty changes ───────────
  useEffect(() => {
    if (!settings || !mistakesReady) return;
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

  // ── Next / Skip ────────────────────────────────────────────────────────────
  const nextExercise = () => {
    if (!settings) return;
    const cfg = configRef.current;
    setFeedback(null);
    setShowAnswer(null);
    setCurrentExercise(
      generateExerciseFromConfig(
        cfg,
        settings.difficulty,
        cfg.mistakesOnly ? mistakeVerbsRef.current : undefined,
      ),
    );
  };

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
      sessionAnswers: stats.sessionAnswers + 1,
      totalAnswers:   stats.totalAnswers + 1,
      totalCorrect:   stats.totalCorrect + (correct ? 1 : 0),
      currentStreak:  correct ? stats.currentStreak + 1 : 0,
      bestStreak:     Math.max(stats.bestStreak, correct ? stats.currentStreak + 1 : 0),
    });

    setSessionCount(prev => prev + 1);

    // SRS update
    let record: ProgressRecord = (await getProgress(currentExercise.id)) ?? {
      id:             currentExercise.id,
      type:           currentExercise.type,
      verbInfinitive: currentExercise.question.verb || "",
      easeFactor:     2.5,
      interval:       0,
      dueDate:        0,
      successCount:   0,
      failureCount:   0,
      lastReviewDate: 0,
    };

    record = updateSRS(record, correct);
    await saveProgress(record);

    if (correct) {
      setTimeout(() => {
        setFeedback(prev => {
          if (prev !== null) nextExercise();
          return null;
        });
      }, 1200);
    }
  };

  const noMistakes =
    !!config.mistakesOnly && mistakesReady && mistakeVerbs.length === 0;

  return {
    currentExercise,
    sessionCount,
    streak,
    feedback,
    showAnswer,
    submitAnswer,
    nextExercise,
    skipExercise: nextExercise,
    dailyGoal: settings?.dailyGoal || 25,
    noMistakes,
  };
}

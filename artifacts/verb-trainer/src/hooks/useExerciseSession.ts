import { useState, useEffect, useRef } from 'react';
import { ExerciseMode, ExerciseItem, generateExercise } from '../engine/exercises';
import { useSettings } from './useSettings';
import { useStats } from './useStats';
import { getProgress, saveProgress, getDueProgress } from '../db/progress';
import { updateSRS, ProgressRecord } from '../engine/srs';
import { isCorrect } from '../engine/validate';

export function useExerciseSession(mode: ExerciseMode | 'mixed' = 'mixed') {
  const { settings } = useSettings();
  const { stats, updateStats } = useStats();
  
  const [currentExercise, setCurrentExercise] = useState<ExerciseItem | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [showAnswer, setShowAnswer] = useState<string | null>(null);

  const nextExercise = () => {
    if (!settings) return;
    setFeedback(null);
    setShowAnswer(null);
    const m = mode === 'mixed' ? (["verbform", "irregular", "gapfill"] as ExerciseMode[])[Math.floor(Math.random() * 3)] : mode as ExerciseMode;
    setCurrentExercise(generateExercise(m, settings.difficulty));
  };

  const skipExercise = () => {
    if (!settings) return;
    setFeedback(null);
    setShowAnswer(null);
    const m = mode === 'mixed' ? (["verbform", "irregular", "gapfill"] as ExerciseMode[])[Math.floor(Math.random() * 3)] : mode as ExerciseMode;
    setCurrentExercise(generateExercise(m, settings.difficulty));
  };

  useEffect(() => {
    if (settings && !currentExercise) {
      nextExercise();
    }
  }, [settings, currentExercise]);

  const submitAnswer = async (answer: string) => {
    if (!currentExercise || feedback || !settings || !stats) return;
    
    const correct = isCorrect(answer, currentExercise.answer);
    
    setFeedback(correct ? "correct" : "incorrect");
    setShowAnswer(Array.isArray(currentExercise.answer) ? currentExercise.answer[0] : currentExercise.answer);
    
    const newStreak = correct ? streak + 1 : 0;
    setStreak(newStreak);
    
    // Update stats
    updateStats({
      sessionAnswers: stats.sessionAnswers + 1,
      totalAnswers: stats.totalAnswers + 1,
      totalCorrect: stats.totalCorrect + (correct ? 1 : 0),
      currentStreak: correct ? stats.currentStreak + 1 : 0,
      bestStreak: Math.max(stats.bestStreak, correct ? stats.currentStreak + 1 : 0),
    });
    
    setSessionCount(prev => prev + 1);

    // Update SRS
    let record = await getProgress(currentExercise.id);
    if (!record) {
      record = {
        id: currentExercise.id,
        type: currentExercise.type,
        verbInfinitive: currentExercise.question.verb || "",
        easeFactor: 2.5,
        interval: 0,
        dueDate: 0,
        successCount: 0,
        failureCount: 0,
        lastReviewDate: 0
      };
    }
    
    record = updateSRS(record, correct);
    await saveProgress(record);

    // Only auto-advance on correct answers; incorrect waits for manual Next click
    if (correct) {
      setTimeout(() => {
        setFeedback(prev => {
          if (prev !== null) {
            nextExercise();
          }
          return null;
        });
      }, 1200);
    }
  };

  return {
    currentExercise,
    sessionCount,
    streak,
    feedback,
    showAnswer,
    submitAnswer,
    nextExercise,
    skipExercise,
    dailyGoal: settings?.dailyGoal || 25
  };
}

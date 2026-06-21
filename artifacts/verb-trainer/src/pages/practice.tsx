import { useState, useEffect } from "react";
import { useExerciseSession } from "../hooks/useExerciseSession";
import { ExerciseCard } from "../components/ExerciseCard";
import { AnswerInput } from "../components/AnswerInput";
import { ProgressBar } from "../components/ProgressBar";
import { ModeSelector } from "../components/ModeSelector";
import { Flame } from "lucide-react";
import { BottomNav } from "../components/BottomNav";

export default function Practice() {
  const [mode, setMode] = useState<any>("mixed");
  const { 
    currentExercise, 
    sessionCount, 
    streak, 
    feedback, 
    showAnswer, 
    submitAnswer, 
    nextExercise,
    dailyGoal
  } = useExerciseSession(mode);

  // Handle manual advance during feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && feedback !== null) {
        nextExercise();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [feedback, nextExercise]);

  if (!currentExercise) return null;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <ProgressBar current={sessionCount} total={dailyGoal} />
      
      <div className="p-4 flex justify-between items-center w-full max-w-3xl mx-auto">
        <ModeSelector currentMode={mode} onSelect={setMode} />
        <div className="flex items-center gap-1 text-orange-500 shrink-0 ml-4">
          <Flame size={20} className={streak > 2 ? "fill-current animate-pulse" : ""} />
          <span className="font-bold">{streak}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-3xl mx-auto relative">
        <div className="w-full mb-12">
          <ExerciseCard exercise={currentExercise} />
        </div>

        <div className="w-full relative">
          <AnswerInput 
            onSubmit={submitAnswer} 
            disabled={feedback !== null} 
          />
          
          {feedback && (
            <div 
              className={`absolute top-20 left-0 w-full text-center text-xl font-bold animate-in fade-in slide-in-from-bottom-4 ${
                feedback === "correct" ? "text-green-500" : "text-destructive"
              }`}
            >
              {feedback === "correct" ? "Correct!" : "Incorrect"}
              {showAnswer && feedback === "incorrect" && (
                <div className="text-foreground mt-2 font-medium">
                  Answer: <span className="text-primary">{showAnswer}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

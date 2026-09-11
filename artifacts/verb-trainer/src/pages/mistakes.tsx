import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { ChevronRight } from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { Button } from "../components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { getAllProgress, saveProgress } from "../db/progress";
import { ProgressRecord } from "../engine/srs";
import { verbs } from "../data/verbs";
import { exerciseFromMistakeId } from "../engine/exercises";
import { getActiveMistakeRecords } from "../engine/reviewQueue";
import { getTenseLabel } from "../data/grammar";

function describeMistake(record: ProgressRecord): string {
  const exercise = exerciseFromMistakeId(record.id);
  if (!exercise) return "Saved exercise";
  if (exercise.type === "irregular") {
    return exercise.question.askFor === "past"
      ? `${getTenseLabel("pastSimple")} (V2)`
      : "Past Participle (V3)";
  }

  const tense = getTenseLabel(exercise.question.tense);
  if (exercise.type === "gapfill") {
    const subject = exercise.question.displaySubject ?? exercise.question.subject;
    return `Context · ${tense}${subject ? ` · ${subject}` : ""}`;
  }
  return `${tense}${exercise.question.subject ? ` · ${exercise.question.subject}` : ""}`;
}

export default function Mistakes() {
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  const loadMistakes = useCallback(() => {
    getAllProgress().then(all => {
      // Mistakes persist indefinitely — a verb stays here until it is
      // answered correctly in Mistakes Review (lastFailureDate → 0) or
      // the user manually clears the list. No midnight reset.
      const mistakes = getActiveMistakeRecords(all)
        .sort((a, b) => b.failureCount - a.failureCount);
      setRecords(mistakes);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadMistakes();

    // Reload reactively when the Practice page resolves a mistake.
    window.addEventListener("mistakes-updated", loadMistakes);
    // Also reload when the user returns to this tab / screen.
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("mistakes-updated", loadMistakes);
      document.removeEventListener("visibilitychange", handleVisibility);
    };

    function handleVisibility() {
      if (document.visibilityState === "visible") loadMistakes();
    }
  }, [loadMistakes]);

  const handlePractice = () => {
    sessionStorage.setItem(
      "mistakeReview",
      JSON.stringify({
        mistakeIds: records.map(r => r.id),
        mode: "review",
      })
    );
    navigate("/practice");
  };

  // Clears only the review queue — sets lastFailureDate to 0 for every
  // current mistake record. Statistics (correct/incorrect counts, streaks,
  // progress) are entirely separate fields and are NOT touched.
  const handleClearMistakes = async () => {
    await Promise.all(
      records.map(r => saveProgress({ ...r, lastFailureDate: 0 }))
    );
    // Notify Practice so it can update its own mistake-related state.
    try { window.dispatchEvent(new CustomEvent("mistakes-updated")); } catch { /* ignore */ }
    loadMistakes();
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-background nav-safe-pad pt-safe flex flex-col">
      <div className="w-full max-w-md mx-auto p-6 flex-1 min-h-0 flex flex-col">
        <h1 className="text-2xl font-bold mb-1">Mistakes</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Items you've answered incorrectly
        </p>

        {loading ? (
          <p className="text-muted-foreground text-center py-16">Loading…</p>
        ) : records.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="text-5xl mb-4">🎉</div>
            <p className="font-semibold text-lg">No mistakes yet</p>
            <p className="text-muted-foreground text-sm">
              Keep practicing — items you miss will appear here.
            </p>
            <Button variant="secondary" className="mt-4" onClick={handlePractice}>
              Start Practice
            </Button>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col">
            {/* Summary + CTA */}
            <div className="shrink-0 space-y-4">
              <div className="rounded-xl border border-border p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{records.length} exercise{records.length !== 1 ? "s" : ""} to review</p>
                </div>
                <Button size="compact" onClick={handlePractice}>Practice →</Button>
              </div>

              {/* Clear Mistakes — elevated secondary style, between summary and list */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="secondary"
                    className="w-full"
                  >
                    Clear Mistakes
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-2xl border-border/80 bg-card p-7 text-center shadow-2xl sm:max-w-sm">
                  <AlertDialogHeader className="space-y-3 !text-center">
                    <AlertDialogTitle className="text-center text-xl font-bold tracking-tight">
                      Clear all mistakes?
                    </AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogDescription className="sr-only">
                    Confirm whether to permanently clear all saved mistakes.
                  </AlertDialogDescription>
                  <AlertDialogFooter className="!flex-row !justify-center !space-x-0 gap-3">
                    <AlertDialogCancel className="mt-0">
                      No
                    </AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={handleClearMistakes}
                    >
                      Yes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="mt-4 flex-1 min-h-0 overflow-y-auto scrollbar-hidden">
              {/* Each row is one exact exercise. Tap to open the verb details. */}
              <div className="space-y-4 pb-4">
                {records.slice(0, 60).map(record => {
                  const verb = verbs.find(v => v.infinitive === record.verbInfinitive);
                  return (
                    <div
                      key={record.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/dictionary/${record.verbInfinitive}`)}
                      onKeyDown={e => e.key === "Enter" && navigate(`/dictionary/${record.verbInfinitive}`)}
                      className="flex items-center rounded-xl border border-border px-4 py-3 gap-3 cursor-pointer hover:bg-muted/50 active:bg-muted transition-colors"
                    >
                      <div className="min-w-0 flex flex-col gap-0.5 flex-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-semibold">{record.verbInfinitive}</span>
                          {verb?.translation && (
                            <span className="text-muted-foreground text-sm truncate">
                              {verb.translation}
                            </span>
                          )}
                        </div>
                        <span className="text-muted-foreground text-sm">
                          {describeMistake(record)}
                        </span>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
                    </div>
                  );
                })}

                {records.length > 60 && (
                  <p className="text-center text-muted-foreground text-sm py-2">
                    Showing top 60 of {records.length}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

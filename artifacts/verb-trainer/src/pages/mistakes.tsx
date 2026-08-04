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

export default function Mistakes() {
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  const loadMistakes = useCallback(() => {
    getAllProgress().then(all => {
      // Mistakes persist indefinitely — a verb stays here until it is
      // answered correctly in Mistakes Review (lastFailureDate → 0) or
      // the user manually clears the list. No midnight reset.
      const mistakes = all
        .filter(r => r.lastFailureDate > 0)
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

  const uniqueVerbs = [...new Set(records.map(r => r.verbInfinitive))];

  const handlePractice = () => {
    sessionStorage.setItem(
      "mistakeReview",
      JSON.stringify({
        verbs: uniqueVerbs,
        // Pass the full record IDs so Practice can reconstruct the exact
        // exercises (same verb + type + tense/form that was originally missed).
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
    <div className="min-h-[100dvh] bg-background nav-safe-pad pt-safe flex flex-col">
      <div className="w-full max-w-md mx-auto p-6">
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
            <Button variant="outline" className="mt-4" onClick={handlePractice}>
              Start Practice
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary + CTA */}
            <div className="rounded-xl border border-border p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{uniqueVerbs.length} verb{uniqueVerbs.length !== 1 ? "s" : ""} to review</p>
              </div>
              <Button size="sm" onClick={handlePractice}>Practice →</Button>
            </div>

            {/* Mistake list — grouped by unique verb. Tap to open verb details. */}
            {uniqueVerbs.map(inf => {
              const verb = verbs.find(v => v.infinitive === inf);
              return (
                <div
                  key={inf}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/dictionary/${inf}`)}
                  onKeyDown={e => e.key === "Enter" && navigate(`/dictionary/${inf}`)}
                  className="flex items-center rounded-xl border border-border px-4 py-3 gap-3 cursor-pointer hover:bg-muted/50 active:bg-muted transition-colors"
                >
                  <div className="min-w-0 flex items-baseline gap-2 flex-wrap flex-1">
                    <span className="font-semibold">{inf}</span>
                    {verb?.translation && (
                      <span className="text-muted-foreground text-sm truncate">
                        {verb.translation}
                      </span>
                    )}
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

            {/* Clear Mistakes — removes review queue only, never touches stats */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-2"
                >
                  Clear Mistakes
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all mistakes?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes {uniqueVerbs.length} verb{uniqueVerbs.length !== 1 ? "s" : ""} from your
                    review queue. Your practice statistics, progress, and streaks will not change.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleClearMistakes}
                  >
                    Clear Mistakes
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

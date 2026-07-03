import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "../components/BottomNav";
import { Button } from "../components/ui/button";
import { getAllProgress } from "../db/progress";
import { ProgressRecord } from "../engine/srs";
import { verbs } from "../data/verbs";

function getTodayStart(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  return start.getTime();
}

export default function Mistakes() {
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    const todayStart = getTodayStart();
    getAllProgress().then(all => {
      const mistakes = all
        .filter(r => r.lastFailureDate >= todayStart)
        .sort((a, b) => b.failureCount - a.failureCount);
      setRecords(mistakes);
      setLoading(false);
    });
  }, []);

  const uniqueVerbs = [...new Set(records.map(r => r.verbInfinitive))];

  const handlePractice = () => {
    sessionStorage.setItem(
      "mistakeReview",
      JSON.stringify({ verbs: uniqueVerbs, mode: "review" })
    );
    navigate("/practice");
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

            {/* Mistake list — grouped by unique verb */}
            {uniqueVerbs.map(inf => {
              const verb = verbs.find(v => v.infinitive === inf);
              return (
                <div
                  key={inf}
                  className="flex items-center rounded-xl border border-border px-4 py-3 gap-3"
                >
                  <div className="min-w-0 flex items-baseline gap-2 flex-wrap">
                    <span className="font-semibold">{inf}</span>
                    {verb?.translation && (
                      <span className="text-muted-foreground text-sm truncate">
                        {verb.translation}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {records.length > 60 && (
              <p className="text-center text-muted-foreground text-sm py-2">
                Showing top 60 of {records.length}
              </p>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

import { useState, useEffect } from "react";
import { BottomNav } from "../components/BottomNav";
import { Button } from "../components/ui/button";
import { Link } from "wouter";
import { getAllProgress } from "../db/progress";
import { ProgressRecord } from "../engine/srs";
import { verbs } from "../data/verbs";

export default function Mistakes() {
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProgress().then(all => {
      const mistakes = all
        .filter(r => r.failureCount > 0)
        .sort((a, b) => b.failureCount - a.failureCount);
      setRecords(mistakes);
      setLoading(false);
    });
  }, []);

  const uniqueVerbs = [...new Set(records.map(r => r.verbInfinitive))];

  return (
    <div className="min-h-[100dvh] bg-background pb-24 flex flex-col">
      <div className="w-full max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-1">Mistakes</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Items you've answered incorrectly, sorted by error count
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
            <Link href="/practice">
              <Button variant="outline" className="mt-4">Start Practice</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary + CTA */}
            <div className="rounded-xl border border-border p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{uniqueVerbs.length} verb{uniqueVerbs.length !== 1 ? "s" : ""} to review</p>
                <p className="text-muted-foreground text-sm">{records.length} total incorrect answer{records.length !== 1 ? "s" : ""}</p>
              </div>
              <Link href="/practice">
                <Button size="sm">Practice →</Button>
              </Link>
            </div>

            {/* Mistake list */}
            {records.slice(0, 60).map(r => {
              const verb = verbs.find(v => v.infinitive === r.verbInfinitive);
              const [exerciseType, , detail] = r.id.split(":");
              const typeLabel =
                exerciseType === "irregular" ? (detail === "past" ? "Past Simple" : "Past Participle") :
                exerciseType === "gapfill"   ? "Gap-fill" :
                detail?.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase()) ?? exerciseType;

              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-3 gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-semibold">{r.verbInfinitive}</span>
                      {verb?.translation && (
                        <span className="text-muted-foreground text-sm truncate">
                          {verb.translation}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{typeLabel}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-destructive font-bold">{r.failureCount}✗</span>
                    <p className="text-xs text-muted-foreground">{r.successCount}✓</p>
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

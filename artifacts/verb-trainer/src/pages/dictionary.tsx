import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { BottomNav } from "../components/BottomNav";
import { Input } from "../components/ui/input";
import { verbs } from "../data/verbs";

type VerbFilter = "all" | "regular" | "irregular";
const DICTIONARY_FILTER_KEY = "dictionary-verb-filter";

export default function Dictionary() {
  const [search, setSearch] = useState("");
  const [verbFilter, setVerbFilter] = useState<VerbFilter>(() => {
    const saved = sessionStorage.getItem(DICTIONARY_FILTER_KEY);
    return saved === "regular" || saved === "irregular" ? saved : "all";
  });

  useEffect(() => {
    sessionStorage.setItem(DICTIONARY_FILTER_KEY, verbFilter);
  }, [verbFilter]);

  const sorted = useMemo(
    () => [...verbs].sort((a, b) => a.infinitive.localeCompare(b.infinitive)),
    [],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const byType = verbFilter === "all"
      ? sorted
      : sorted.filter(v => verbFilter === "irregular" ? v.isIrregular : !v.isIrregular);

    if (!q) return byType;
    return byType.filter(
      v =>
        v.infinitive.includes(q) ||
        (v.translation && v.translation.toLowerCase().includes(q)),
    );
  }, [search, sorted, verbFilter]);

  return (
    <div className="min-h-[100dvh] bg-background nav-safe-pad pt-safe flex flex-col">
      <div className="w-full max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-1">Dictionary</h1>
        <p className="text-muted-foreground text-sm mb-4">
          {verbs.length} verbs
        </p>

        <div
          className="flex w-full rounded-xl bg-muted p-1 mb-3"
          role="group"
          aria-label="Filter verbs by type"
        >
          {([
            ["all", "All"],
            ["regular", "Regular"],
            ["irregular", "Irregular"],
          ] as const).map(([value, label]) => {
            const active = verbFilter === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setVerbFilter(value)}
                className={`flex-1 rounded-lg px-2 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <Input
          placeholder="Search verbs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-4"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />

        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">
            No verbs found for "{search}"
          </p>
        ) : (
          <div className="space-y-1">
            {filtered.map(verb => (
              <Link key={verb.infinitive} href={`/dictionary/${verb.infinitive}`}>
                <div className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-muted transition-colors cursor-pointer">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-semibold">{verb.infinitive}</span>
                    {verb.translation && (
                      <span className="text-muted-foreground text-sm">
                        {verb.translation}
                      </span>
                    )}
                  </div>
                  {verb.isIrregular && (
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      irregular
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

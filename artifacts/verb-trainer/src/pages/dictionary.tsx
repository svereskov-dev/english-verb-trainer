import { useState, useMemo } from "react";
import { Link } from "wouter";
import { BottomNav } from "../components/BottomNav";
import { Input } from "../components/ui/input";
import { verbs } from "../data/verbs";

export default function Dictionary() {
  const [search, setSearch] = useState("");

  const sorted = useMemo(
    () => [...verbs].sort((a, b) => a.infinitive.localeCompare(b.infinitive)),
    [],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      v =>
        v.infinitive.includes(q) ||
        (v.translation && v.translation.toLowerCase().includes(q)),
    );
  }, [search, sorted]);

  return (
    <div className="min-h-[100dvh] bg-background pb-24 flex flex-col">
      <div className="w-full max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-1">Dictionary</h1>
        <p className="text-muted-foreground text-sm mb-4">
          {verbs.length} verbs
        </p>

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

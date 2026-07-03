import { Link, useParams } from "wouter";
import { BottomNav } from "../components/BottomNav";
import { verbs } from "../data/verbs";
import { ChevronLeft } from "lucide-react";

export default function DictionaryVerb() {
  const { verb: infinitive } = useParams<{ verb: string }>();
  const verb = verbs.find(v => v.infinitive === infinitive);

  if (!verb) {
    return (
      <div className="min-h-[100dvh] bg-background nav-safe-pad pt-safe flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
          <p className="text-muted-foreground">Verb not found.</p>
          <Link href="/dictionary" className="text-primary underline text-sm">
            Back to Dictionary
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const type = verb.isIrregular ? "Irregular" : "Regular";

  return (
    <div className="min-h-[100dvh] bg-background pb-24 flex flex-col">
      <div className="w-full max-w-md mx-auto p-6">
        {/* Back link */}
        <Link
          href="/dictionary"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft size={16} />
          Dictionary
        </Link>

        {/* English verb */}
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
          English Verb
        </p>
        <h1 className="text-3xl font-black uppercase mb-6">{verb.infinitive}</h1>

        {/* Info cards */}
        <div className="space-y-3">
          {/* Translation */}
          <div className="rounded-xl border border-border px-5 py-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Translation
            </p>
            <p className="text-lg font-semibold">{verb.translation ?? "—"}</p>
          </div>

          {/* Type */}
          <div className="rounded-xl border border-border px-5 py-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Type
            </p>
            <p className="text-lg font-semibold">{type}</p>
          </div>

          {/* Forms */}
          <div className="rounded-xl border border-border px-5 py-4 space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Forms
            </p>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground pt-0.5">Base Form (V1)</span>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="font-semibold">{verb.infinitive}</span>
                  {verb.infinitiveIPA && (
                    <span className="text-sm text-muted-foreground/80 tracking-wide">{verb.infinitiveIPA}</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground pt-0.5">Past Simple (V2)</span>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="font-semibold">{verb.past}</span>
                  {verb.pastIPA && (
                    <span className="text-sm text-muted-foreground/80 tracking-wide">{verb.pastIPA}</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground pt-0.5">Past Participle (V3)</span>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="font-semibold">{verb.pastParticiple}</span>
                  {verb.pastParticipleIPA && (
                    <span className="text-sm text-muted-foreground/80 tracking-wide">{verb.pastParticipleIPA}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

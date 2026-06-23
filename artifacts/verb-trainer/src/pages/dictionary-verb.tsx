import { Link, useParams } from "wouter";
import { BottomNav } from "../components/BottomNav";
import { verbs } from "../data/verbs";
import { ChevronLeft } from "lucide-react";

export default function DictionaryVerb() {
  const { verb: infinitive } = useParams<{ verb: string }>();
  const verb = verbs.find(v => v.infinitive === infinitive);

  if (!verb) {
    return (
      <div className="min-h-[100dvh] bg-background pb-24 flex flex-col">
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
        <h1 className="text-5xl font-black uppercase mb-6">{verb.infinitive}</h1>

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
          <div className="rounded-xl border border-border px-5 py-4 space-y-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Forms
            </p>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Base Form</span>
                <span className="font-semibold">{verb.infinitive}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Past Simple</span>
                <span className="font-semibold">{verb.past}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Past Participle</span>
                <span className="font-semibold">{verb.pastParticiple}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

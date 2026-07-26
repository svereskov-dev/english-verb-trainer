import { ExerciseItem } from "../engine/exercises";
import { verbs } from "../data/verbs";
import { cn } from "../lib/utils";

interface ExerciseCardProps {
  exercise: ExerciseItem;
}

const formatTenseName = (tense: string) => {
  return tense.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

function getVerbData(infinitive: string) {
  return verbs.find(v => v.infinitive === infinitive);
}

function getTranslation(infinitive: string): string {
  return getVerbData(infinitive)?.translation ?? "";
}

function getIPA(infinitive: string): string {
  return getVerbData(infinitive)?.infinitiveIPA ?? "";
}

export function ExerciseCard({ exercise, compact = false }: ExerciseCardProps & { compact?: boolean }) {
  if (exercise.type === "verbform") {
    const translation = getTranslation(exercise.question.verb);
    const ipa = getIPA(exercise.question.verb);
    return (
      <div className={cn("flex flex-col items-center w-full", compact ? "gap-1.5" : "gap-3")}>
        {/* Tense pill */}
        <span className="bg-primary/15 text-primary text-xs font-bold tracking-[0.18em] uppercase px-4 py-1 rounded-full border border-primary/30 max-w-full text-center break-words">
          {formatTenseName(exercise.question.tense)}
        </span>

        {/* Subject card */}
        <div className={cn(
          "w-full rounded-2xl bg-card border border-border flex flex-col items-center gap-0.5",
          compact ? "p-2.5" : "p-5"
        )}>
          <p className={cn(
            "uppercase tracking-widest text-muted-foreground font-semibold",
            compact ? "text-[9px]" : "text-[10px]"
          )}>Subject</p>
          <p className={cn(
            "font-bold tracking-tight",
            compact ? "text-2xl" : "text-3xl md:text-4xl"
          )}>{exercise.question.subject}</p>
        </div>

        {/* Verb card */}
        <div className={cn(
          "w-full rounded-2xl bg-card border border-primary/20 flex flex-col items-center",
          compact ? "p-2.5 gap-0.5" : "p-5 gap-1"
        )}>
          <p className={cn(
            "uppercase tracking-widest text-muted-foreground font-semibold",
            compact ? "text-[9px]" : "text-[10px]"
          )}>Verb</p>
          <p className={cn(
            "font-black tracking-tight text-primary",
            compact ? "text-2xl" : "text-4xl md:text-5xl"
          )}>{exercise.question.verb}</p>
          {ipa && (
            <p className={cn(
              "text-muted-foreground tracking-wide",
              compact ? "text-xs mt-0.5" : "text-sm mt-3"
            )}>{ipa}</p>
          )}
          {translation && (
            <p className={cn(
              "text-muted-foreground",
              compact ? "text-xs mt-0" : "text-base mt-1"
            )}>{translation}</p>
          )}
        </div>
      </div>
    );
  }

  if (exercise.type === "irregular") {
    const askForMap: Record<string, string> = {
      past: "Past Simple",
      pastParticiple: "Past Participle",
    };
    const translation = getTranslation(exercise.question.verb);
    const ipa = getIPA(exercise.question.verb);
    return (
      <div className={cn("flex flex-col items-center w-full", compact ? "gap-1.5" : "gap-3")}>
        {/* Form pill */}
        <span className="bg-primary/15 text-primary text-xs font-bold tracking-[0.18em] uppercase px-4 py-1 rounded-full border border-primary/30 max-w-full text-center break-words">
          Irregular Form: {askForMap[exercise.question.askFor]}
        </span>

        {/* Verb card */}
        <div className={cn(
          "w-full rounded-2xl bg-card border border-primary/20 flex flex-col items-center",
          compact ? "p-2.5 gap-0.5" : "p-5 gap-1"
        )}>
          <p className={cn(
            "uppercase tracking-widest text-muted-foreground font-semibold",
            compact ? "text-[9px]" : "text-[10px]"
          )}>Verb</p>
          <p className={cn(
            "font-black tracking-tight text-primary",
            compact ? "text-2xl" : "text-4xl md:text-5xl"
          )}>{exercise.question.verb}</p>
          {ipa && (
            <p className={cn(
              "text-muted-foreground tracking-wide",
              compact ? "text-xs mt-0.5" : "text-sm mt-3"
            )}>{ipa}</p>
          )}
          {translation && (
            <p className={cn(
              "text-muted-foreground",
              compact ? "text-xs mt-0" : "text-base mt-1"
            )}>{translation}</p>
          )}
        </div>
      </div>
    );
  }

  if (exercise.type === "gapfill") {
    const translation = getTranslation(exercise.question.verb ?? "");
    const ipa = getIPA(exercise.question.verb ?? "");
    return (
      <div className={cn("flex flex-col items-center w-full", compact ? "gap-1.5" : "gap-3")}>
        {/* Tense pill */}
        <span className="bg-primary/15 text-primary text-xs font-bold tracking-[0.18em] uppercase px-4 py-1 rounded-full border border-primary/30 max-w-full text-center break-words">
          {formatTenseName(exercise.question.tense)}
        </span>

        {/* Sentence card */}
        <div className={cn(
          "w-full rounded-2xl bg-card border border-border flex flex-col items-center",
          compact ? "p-2.5 gap-1.5" : "p-5 gap-3"
        )}>
          <p className={cn(
            "uppercase tracking-widest text-muted-foreground font-semibold",
            compact ? "text-[9px]" : "text-[10px]"
          )}>Sentence</p>
          <p className={cn(
            "font-bold tracking-tight leading-relaxed text-center",
            compact ? "text-lg" : "text-2xl md:text-3xl"
          )}>
            {exercise.question.template.replace("_____", "______")}
          </p>
          <p className={cn(
            "text-primary font-medium",
            compact ? "text-base" : "text-xl"
          )}>{exercise.question.hint}</p>
          {ipa && (
            <p className={cn(
              "text-muted-foreground tracking-wide",
              compact ? "text-xs" : "text-sm"
            )}>{ipa}</p>
          )}
          {translation && (
            <p className={cn(
              "text-muted-foreground",
              compact ? "text-xs" : "text-base"
            )}>{translation}</p>
          )}
        </div>
      </div>
    );
  }

  return null;
}

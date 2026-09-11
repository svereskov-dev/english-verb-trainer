import { ExerciseItem } from "../engine/exercises";
import { verbs } from "../data/verbs";
import { getTenseLabel } from "../data/grammar";
import { cn } from "../lib/utils";

interface ExerciseCardProps {
  exercise: ExerciseItem;
}

function getVerbData(infinitive: string) {
  return verbs.find(v => v.infinitive === infinitive);
}

function getTranslation(infinitive: string): string {
  return getVerbData(infinitive)?.translation ?? "";
}

function getIPA(infinitive: string): string {
  return getVerbData(infinitive)?.infinitiveIPA ?? "";
}

/** When true, gapfill exercises show "Irregular Form: …" instead of just the tense name. */
const PERFECT_TENSES = new Set(["presentPerfect", "pastPerfect", "futurePerfect"]);

function irregularGapfillLabel(tense: string): string {
  const form = PERFECT_TENSES.has(tense)
    ? "Past Participle"
    : getTenseLabel("pastSimple");
  return `Irregular Form: ${form}`;
}

export function ExerciseCard({
  exercise,
  compact = false,
  irregularContext = false,
}: ExerciseCardProps & { compact?: boolean; irregularContext?: boolean }) {
  if (exercise.type === "verbform") {
    const translation = getTranslation(exercise.question.verb);
    const ipa = getIPA(exercise.question.verb);
    return (
      <div className={cn("flex flex-col items-center w-full", compact ? "gap-1.5" : "gap-2")}>
        {/* Tense pill */}
        <span className="bg-primary/15 text-primary text-xs font-bold tracking-[0.18em] uppercase px-4 py-1 rounded-full border border-primary/30 max-w-full text-center break-words">
          {getTenseLabel(exercise.question.tense)}
        </span>

        {/* Subject card */}
        <div className={cn(
          "w-full rounded-2xl bg-card border border-border flex flex-col items-center gap-0.5",
          compact ? "p-2.5" : "p-4"
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
          compact ? "p-2.5 gap-0.5" : "p-4 gap-1"
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
              compact ? "text-xs mt-0.5" : "text-sm mt-2"
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
      past: getTenseLabel("pastSimple"),
      pastParticiple: "Past Participle",
    };
    const translation = getTranslation(exercise.question.verb);
    const ipa = getIPA(exercise.question.verb);
    return (
      <div className={cn("flex flex-col items-center w-full", compact ? "gap-1.5" : "gap-2")}>
        {/* Form pill */}
        <span className="bg-primary/15 text-primary text-xs font-bold tracking-[0.18em] uppercase px-4 py-1 rounded-full border border-primary/30 max-w-full text-center break-words">
          Irregular Form: {askForMap[exercise.question.askFor]}
        </span>

        {/* Verb card */}
        <div className={cn(
          "w-full rounded-2xl bg-card border border-primary/20 flex flex-col items-center",
          compact ? "p-2.5 gap-0.5" : "p-4 gap-1"
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
      <div className={cn("flex flex-col items-center w-full", compact ? "gap-1.5" : "gap-2")}>
        {/* Tense / form pill */}
        <span className="bg-primary/15 text-primary text-xs font-bold tracking-[0.18em] uppercase px-4 py-1 rounded-full border border-primary/30 max-w-full text-center break-words">
          {irregularContext
            ? irregularGapfillLabel(exercise.question.tense)
            : getTenseLabel(exercise.question.tense)}
        </span>

        {/* Sentence card */}
        <div className={cn(
          "w-full rounded-2xl bg-card border border-border flex flex-col items-center",
          compact ? "p-2.5 gap-1.5" : "p-4 gap-2"
        )}>
          <p className={cn(
            "uppercase tracking-widest text-muted-foreground font-semibold",
            compact ? "text-[9px]" : "text-[10px]"
          )}>Sentence</p>
          <p className={cn(
            "font-bold tracking-tight leading-relaxed text-center",
            compact ? "text-lg" : "text-2xl md:text-3xl"
          )}>
            {exercise.question.template}
          </p>
          <p className={cn(
            "text-primary font-black leading-tight break-words max-w-full",
          )}
            style={{
              fontSize: compact
                ? "clamp(1.125rem, min(6vw, 3.5vh), 1.5rem)"
                : "clamp(1.375rem, min(7vw, 4vh), 2rem)",
            }}
          >{exercise.question.hint}</p>
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

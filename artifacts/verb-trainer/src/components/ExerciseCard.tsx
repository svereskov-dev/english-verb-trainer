import { ExerciseItem } from "../engine/exercises";
import { verbs } from "../data/verbs";

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

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  if (exercise.type === "verbform") {
    const translation = getTranslation(exercise.question.verb);
    const ipa = getIPA(exercise.question.verb);
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Tense pill */}
        <span className="bg-primary/15 text-primary text-xs font-bold tracking-[0.18em] uppercase px-4 py-1.5 rounded-full border border-primary/30">
          {formatTenseName(exercise.question.tense)}
        </span>

        {/* Subject card */}
        <div className="w-full rounded-2xl bg-card border border-border p-5 flex flex-col items-center gap-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Subject</p>
          <p className="text-4xl md:text-5xl font-bold tracking-tight">{exercise.question.subject}</p>
        </div>

        {/* Verb card */}
        <div className="w-full rounded-2xl bg-card border border-primary/20 p-5 flex flex-col items-center gap-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Verb</p>
          <p className="text-5xl md:text-6xl font-black tracking-tight text-primary">{exercise.question.verb}</p>
          {ipa && (
            <p className="text-muted-foreground text-sm mt-0.5 tracking-wide">{ipa}</p>
          )}
          {translation && (
            <p className="text-muted-foreground text-base mt-1">{translation}</p>
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
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Form pill */}
        <span className="bg-primary/15 text-primary text-xs font-bold tracking-[0.18em] uppercase px-4 py-1.5 rounded-full border border-primary/30">
          Irregular Form: {askForMap[exercise.question.askFor]}
        </span>

        {/* Verb card */}
        <div className="w-full rounded-2xl bg-card border border-primary/20 p-5 flex flex-col items-center gap-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Verb</p>
          <p className="text-5xl md:text-6xl font-black tracking-tight text-primary">{exercise.question.verb}</p>
          {ipa && (
            <p className="text-muted-foreground text-sm mt-0.5 tracking-wide">{ipa}</p>
          )}
          {translation && (
            <p className="text-muted-foreground text-base mt-1">{translation}</p>
          )}
        </div>
      </div>
    );
  }

  if (exercise.type === "gapfill") {
    const translation = getTranslation(exercise.question.verb ?? "");
    const ipa = getIPA(exercise.question.verb ?? "");
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Tense pill */}
        <span className="bg-primary/15 text-primary text-xs font-bold tracking-[0.18em] uppercase px-4 py-1.5 rounded-full border border-primary/30">
          {formatTenseName(exercise.question.tense)}
        </span>

        {/* Sentence card */}
        <div className="w-full rounded-2xl bg-card border border-border p-5 flex flex-col items-center gap-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Sentence</p>
          <p className="text-2xl md:text-3xl font-bold tracking-tight leading-relaxed text-center">
            {exercise.question.template.replace("_____", "______")}
          </p>
          <p className="text-xl text-primary font-medium">{exercise.question.hint}</p>
          {ipa && (
            <p className="text-muted-foreground text-sm tracking-wide">{ipa}</p>
          )}
          {translation && (
            <p className="text-muted-foreground text-base">{translation}</p>
          )}
        </div>
      </div>
    );
  }

  return null;
}

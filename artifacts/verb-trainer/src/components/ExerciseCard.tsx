import { ExerciseItem } from "../engine/exercises";
import { verbs } from "../data/verbs";

interface ExerciseCardProps {
  exercise: ExerciseItem;
}

const formatTenseName = (tense: string) => {
  return tense.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

function getTranslation(infinitive: string): string {
  return verbs.find(v => v.infinitive === infinitive)?.translation ?? "";
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  if (exercise.type === "verbform") {
    const translation = getTranslation(exercise.question.verb);
    return (
      <div className="text-center space-y-3">
        <h2 className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
          {formatTenseName(exercise.question.tense)}
        </h2>
        <div className="text-5xl md:text-7xl font-bold tracking-tight">
          {exercise.question.subject} <span className="text-primary">{exercise.question.verb}</span>
        </div>
        {translation && (
          <p className="text-muted-foreground text-lg font-normal">{translation}</p>
        )}
      </div>
    );
  }

  if (exercise.type === "irregular") {
    const askForMap: Record<string, string> = {
      past: "Past Simple",
      pastParticiple: "Past Participle",
    };
    const translation = getTranslation(exercise.question.verb);
    return (
      <div className="text-center space-y-3">
        <h2 className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
          Irregular Form: {askForMap[exercise.question.askFor]}
        </h2>
        <div className="text-5xl md:text-7xl font-bold tracking-tight">
          {exercise.question.verb}
        </div>
        {translation && (
          <p className="text-muted-foreground text-lg font-normal">{translation}</p>
        )}
      </div>
    );
  }

  if (exercise.type === "gapfill") {
    const translation = getTranslation(exercise.question.verb ?? "");
    return (
      <div className="text-center space-y-3">
        <h2 className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
          Fill the gap
        </h2>
        <div className="text-3xl md:text-5xl font-bold tracking-tight leading-relaxed">
          {exercise.question.template.replace("_____", "______")}
        </div>
        <div className="text-xl text-primary font-medium">
          {exercise.question.hint}
        </div>
        {translation && (
          <p className="text-muted-foreground text-lg font-normal">{translation}</p>
        )}
      </div>
    );
  }

  return null;
}

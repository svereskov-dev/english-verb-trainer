import { ExerciseItem } from "../engine/exercises";

interface ExerciseCardProps {
  exercise: ExerciseItem;
}

const formatTenseName = (tense: string) => {
  return tense.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  if (exercise.type === "verbform") {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
          {formatTenseName(exercise.question.tense)}
        </h2>
        <div className="text-5xl md:text-7xl font-bold tracking-tight">
          {exercise.question.subject} <span className="text-primary">{exercise.question.verb}</span>
        </div>
      </div>
    );
  }

  if (exercise.type === "tenserecognition") {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
          Identify the Tense
        </h2>
        <div className="text-3xl md:text-5xl font-bold tracking-tight">
          {exercise.question.sentence}
        </div>
      </div>
    );
  }

  if (exercise.type === "irregular") {
    const askForMap: any = {
      past: "Past Simple",
      pastParticiple: "Past Participle",
      both: "Past & Past Participle"
    };
    return (
      <div className="text-center space-y-4">
        <h2 className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
          Irregular Form: {askForMap[exercise.question.askFor]}
        </h2>
        <div className="text-5xl md:text-7xl font-bold tracking-tight">
          {exercise.question.verb}
        </div>
      </div>
    );
  }

  if (exercise.type === "gapfill") {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
          Fill the gap
        </h2>
        <div className="text-3xl md:text-5xl font-bold tracking-tight leading-relaxed">
          {exercise.question.template.replace("_____", "______")}
        </div>
        <div className="text-xl text-primary font-medium">
          {exercise.question.hint}
        </div>
      </div>
    );
  }

  return null;
}

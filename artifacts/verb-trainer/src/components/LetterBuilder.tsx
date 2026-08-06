import { useEffect } from "react";
import { SkipForward } from "lucide-react";
import { ExerciseItem } from "../engine/exercises";
import { useLetterBuilder } from "../hooks/useLetterBuilder";
import { useAudioFeedback } from "../hooks/useAudioFeedback";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LetterBuilderProps {
  exercise: ExerciseItem;
  /** Called with the correct answer string when all letters are revealed. */
  onSuccess: (answer: string) => void;
  /** Called when the user exhausts all 3 wrong-tap attempts. */
  onFailure: () => void;
  onSkip: () => void;
  compact?: boolean;
}

// ─── Placeholder display ──────────────────────────────────────────────────────

interface PlaceholderProps {
  chars: string[];
  revealed: boolean[];
  nextPos: number;
  compact: boolean;
}

function Placeholder({ chars, revealed, nextPos, compact }: PlaceholderProps) {
  // Group chars into words (split on spaces) so we can add word gaps
  const words: { char: string; idx: number }[][] = [];
  let current: { char: string; idx: number }[] = [];

  chars.forEach((ch, i) => {
    if (ch === " ") {
      if (current.length > 0) {
        words.push(current);
        current = [];
      }
    } else {
      current.push({ char: ch, idx: i });
    }
  });
  if (current.length > 0) words.push(current);

  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 min-h-[3rem] items-end py-1">
      {words.map((word, wi) => (
        <div key={wi} className="flex gap-1.5 items-end">
          {word.map(({ char, idx }) => {
            const isRevealed = revealed[idx];
            const isNext = idx === nextPos;
            return (
              <div key={idx} className="flex flex-col items-center gap-0.5">
                <span
                  className={cn(
                    "font-bold leading-none transition-all duration-150 select-none",
                    compact ? "text-xl w-5 text-center" : "text-2xl w-6 text-center",
                    isRevealed
                      ? "text-foreground"
                      : "text-transparent"
                  )}
                >
                  {/* Always render the char to keep width stable */}
                  {char.toUpperCase()}
                </span>
                {/* Underline: filled (primary) for revealed, accent pulse for next, muted for rest */}
                <div
                  className={cn(
                    "rounded-full transition-colors duration-150",
                    compact ? "h-[2px] w-5" : "h-[2.5px] w-6",
                    isRevealed
                      ? "bg-primary"
                      : isNext
                        ? "bg-primary/50 animate-pulse"
                        : "bg-muted-foreground/30"
                  )}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Wrong-tap dots ───────────────────────────────────────────────────────────

function WrongDots({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={cn(
            "w-2.5 h-2.5 rounded-full transition-colors duration-200",
            i < count ? "bg-red-500" : "bg-muted/50"
          )}
        />
      ))}
    </div>
  );
}

// ─── Letter buttons ───────────────────────────────────────────────────────────

interface LetterButtonsProps {
  choices: string[];
  disabledLetters: Set<string>;
  onTap: (letter: string) => void;
  compact: boolean;
}

function LetterButtons({ choices, disabledLetters, onTap, compact }: LetterButtonsProps) {
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {choices.map((letter, i) => {
        const isDisabled = disabledLetters.has(letter);
        return (
          <button
            key={`${letter}-${i}`}
            onClick={() => onTap(letter)}
            disabled={isDisabled}
            aria-label={`Letter ${letter}`}
            className={cn(
              "rounded-2xl font-bold transition-all duration-100 select-none",
              "border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              "active:scale-90",
              compact ? "w-12 h-12 text-lg" : "w-14 h-14 text-xl",
              isDisabled
                ? "opacity-25 border-muted bg-muted text-muted-foreground cursor-not-allowed"
                : "border-primary/25 bg-card text-foreground shadow-sm hover:bg-primary/8 hover:border-primary/50 cursor-pointer"
            )}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LetterBuilder({
  exercise,
  onSuccess,
  onFailure,
  onSkip,
  compact = false,
}: LetterBuilderProps) {
  // Normalise answer: for irregular exercises the answer is string[]
  const answer = Array.isArray(exercise.answer)
    ? exercise.answer[0]
    : exercise.answer;

  const {
    chars,
    revealed,
    wrongTaps,
    disabledLetters,
    choices,
    isDone,
    isFailed,
    nextPos,
    tapLetter,
  } = useLetterBuilder(answer);

  const { playClick } = useAudioFeedback();

  // Fire success / failure callbacks exactly once
  useEffect(() => {
    if (isDone) onSuccess(answer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone]);

  useEffect(() => {
    if (isFailed) onFailure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFailed]);

  const handleTap = (letter: string) => {
    const up = letter.toUpperCase();
    if (disabledLetters.has(up)) return;
    // Play the click only on a correct tap — wrong taps are intentionally silent
    // so incorrect selections feel neutral rather than punishing.
    const isCorrectTap = up === (chars[nextPos]?.toUpperCase() ?? "");
    if (isCorrectTap) playClick();
    tapLetter(letter);
  };

  const finished = isDone || isFailed;

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Character placeholder row */}
      <Placeholder
        chars={chars}
        revealed={revealed}
        nextPos={nextPos}
        compact={compact}
      />

      {/* Wrong-tap error dots */}
      <WrongDots count={wrongTaps} />

      {/* Letter choice buttons — hidden once the exercise is decided */}
      {!finished && (
        <LetterButtons
          choices={choices}
          disabledLetters={disabledLetters}
          onTap={handleTap}
          compact={compact}
        />
      )}

      {/* Skip — always available so the user is never stuck */}
      {!finished && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className={cn(
            "text-muted-foreground hover:text-foreground gap-1.5 mt-1",
            compact && "text-xs h-8 px-2"
          )}
          data-testid="button-skip"
        >
          <SkipForward size={compact ? 12 : 14} />
          Skip
        </Button>
      )}
    </div>
  );
}

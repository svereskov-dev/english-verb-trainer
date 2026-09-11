import { useState, useEffect, useMemo, useRef, useCallback } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** Generate 5 shuffled choices: exactly 1 correct + 4 unique distractors. */
export function generateChoices(correctLetter: string): string[] {
  const correct = correctLetter.toUpperCase();
  const pool = ALPHABET.filter(c => c !== correct);

  // Pick 4 unique distractors
  const distractors: string[] = [];
  const available = [...pool];
  while (distractors.length < 4 && available.length > 0) {
    const idx = Math.floor(Math.random() * available.length);
    distractors.push(available.splice(idx, 1)[0]);
  }

  const all = [...distractors, correct];

  // Fisher-Yates shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }

  return all;
}

export interface LetterBuilderState {
  revealed: boolean[];
  wrongTaps: number;
  disabledLetters: string[];
  choices: string[];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * State machine for the Letter Builder exercise mode.
 *
 * - Spaces in `rawAnswer` are pre-revealed (user never taps them).
 * - Choices are regenerated automatically after each correct tap.
 * - After 3 wrong taps `isFailed` becomes true.
 * - When all non-space chars are revealed `isDone` becomes true.
 */
export function useLetterBuilder(
  rawAnswer: string,
  initialState?: LetterBuilderState | null,
  onStateChange?: (state: LetterBuilderState) => void,
) {
  const chars = useMemo(() => rawAnswer.split(""), [rawAnswer]);
  const hasValidInitialState =
    !!initialState &&
    initialState.revealed.length === chars.length &&
    initialState.wrongTaps >= 0 &&
    initialState.wrongTaps <= 3;

  // revealed[i] = true means chars[i] is shown; spaces start revealed
  const [revealed, setRevealed] = useState<boolean[]>(() =>
    hasValidInitialState
      ? initialState!.revealed
      : chars.map(ch => ch === " ")
  );

  // Use a ref so tapLetter closure always sees the freshest count without
  // adding wrongTaps to every callback dependency.
  const wrongTapsRef = useRef(hasValidInitialState ? initialState!.wrongTaps : 0);
  const [wrongTaps, setWrongTaps] = useState(
    hasValidInitialState ? initialState!.wrongTaps : 0,
  );

  const [disabledLetters, setDisabledLetters] = useState<Set<string>>(
    () => new Set(hasValidInitialState ? initialState!.disabledLetters : []),
  );
  const [choices, setChoices] = useState<string[]>(
    hasValidInitialState ? initialState!.choices : [],
  );
  // A restored choice set already belongs to the current position. The first
  // choices effect must not replace it with a new random set.
  const restoredChoicesRef = useRef(
    hasValidInitialState && initialState!.choices.length > 0,
  );

  // Derived state
  const nextPos = revealed.findIndex(r => !r); // -1 when all revealed
  const isDone = nextPos === -1;
  const isFailed = wrongTaps >= 3;

  // Regenerate choices whenever we advance to a new position
  useEffect(() => {
    if (isDone || isFailed) return;
    if (restoredChoicesRef.current) {
      restoredChoicesRef.current = false;
      return;
    }
    setDisabledLetters(new Set());
    setChoices(generateChoices(chars[nextPos]));
    // chars is stable within a single mounted instance (keyed by exerciseSeq)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextPos, isDone, isFailed]);

  useEffect(() => {
    if (!onStateChange || isDone || isFailed) return;
    onStateChange({
      revealed,
      wrongTaps,
      disabledLetters: [...disabledLetters],
      choices,
    });
  }, [revealed, wrongTaps, disabledLetters, choices, isDone, isFailed, onStateChange]);

  const tapLetter = useCallback(
    (letter: string) => {
      // Guard: already finished, letter disabled, or failed
      if (wrongTapsRef.current >= 3) return;

      const up = letter.toUpperCase();

      if (disabledLetters.has(up)) return;

      // We read nextPos / isDone from the closure — they're in the dep array
      // so the callback is always fresh after state updates.
      if (isDone) return;

      const correctLetter = chars[nextPos]?.toUpperCase() ?? "";

      if (up === correctLetter) {
        // Correct tap — reveal this character
        setRevealed(prev => {
          const next = [...prev];
          next[nextPos] = true;
          return next;
        });
      } else {
        // Wrong tap — disable this button and increment counter
        setDisabledLetters(prev => new Set([...prev, up]));
        wrongTapsRef.current += 1;
        setWrongTaps(wrongTapsRef.current);
      }
    },
    [isDone, disabledLetters, chars, nextPos]
  );

  return {
    chars,
    revealed,
    wrongTaps,
    disabledLetters,
    choices,
    isDone,
    isFailed,
    nextPos,
    tapLetter,
  };
}

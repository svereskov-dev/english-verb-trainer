import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
import { wrapIndex } from "../lib/circularNavigation";
import { getTenseLabel, Tense } from "../data/grammar";

// ─── Tense data ───────────────────────────────────────────────────────────────

interface TenseDef {
  id: Tense;
  russian: string;
  structure: string;
  example: string;
}

interface Period {
  id: "past" | "present" | "future";
  label: string;
  tenses: TenseDef[];
  standaloneCard?: TenseDef;   // e.g. Past Simple sits above the timeline
  accentClass: string;
  accentBg: string;
  dotBg: string;
  ringClass: string;
}

const PERIODS: Period[] = [
  {
    id: "past",
    label: "Past",
    accentClass: "text-sky-600 dark:text-sky-400",
    accentBg: "bg-sky-600 dark:bg-sky-400",
    dotBg: "bg-sky-500 dark:bg-sky-400",
    ringClass: "ring-sky-400/50",
    standaloneCard: {
      id: "pastSimple",
      russian: "Что произошло?",
      structure: "Subject + V2",
      example: "I worked.",
    },
    tenses: [
      // Chronological order: earliest (left) → latest (right)
      {
        id: "pastPerfectContinuous",
        russian: "Что происходило до другого события?",
        structure: "Subject + had been + V-ing",
        example: "I had been working.",
      },
      {
        id: "pastPerfect",
        russian: "Что произошло раньше другого события?",
        structure: "Subject + had + V3",
        example: "I had worked.",
      },
      {
        id: "pastContinuous",
        russian: "Что происходило в определённый момент?",
        structure: "Subject + was/were + V-ing",
        example: "I was working.",
      },
    ],
  },
  {
    id: "present",
    label: "Present",
    accentClass: "text-primary",
    accentBg: "bg-primary",
    dotBg: "bg-primary",
    ringClass: "ring-primary/50",
    standaloneCard: {
      id: "presentSimple",
      russian: "Что происходит обычно?",
      structure: "Subject + V1",
      example: "I work.",
    },
    tenses: [
      // Logical flow: longest continuing action → completed present result → happening right now
      {
        id: "presentPerfectContinuous",
        russian: "Что продолжается до настоящего момента?",
        structure: "Subject + have/has been + V-ing",
        example: "I have been working.",
      },
      {
        id: "presentPerfect",
        russian: "Какой результат есть сейчас?",
        structure: "Subject + have/has + V3",
        example: "I have worked.",
      },
      {
        id: "presentContinuous",
        russian: "Что происходит прямо сейчас?",
        structure: "Subject + am/is/are + V-ing",
        example: "I am working.",
      },
    ],
  },
  {
    id: "future",
    label: "Future",
    accentClass: "text-amber-600 dark:text-amber-400",
    accentBg: "bg-amber-600 dark:bg-amber-400",
    dotBg: "bg-amber-500 dark:bg-amber-400",
    ringClass: "ring-amber-400/50",
    standaloneCard: {
      id: "futureSimple",
      russian: "Что произойдёт?",
      structure: "Subject + will + V1",
      example: "I will work.",
    },
    tenses: [
      // Logical flow: continuing up to future moment → completed by future moment → in progress at future moment
      {
        id: "futurePerfectContinuous",
        russian: "Что будет продолжаться к определённому моменту?",
        structure: "Subject + will have been + V-ing",
        example: "I will have been working.",
      },
      {
        id: "futurePerfect",
        russian: "Что завершится к определённому моменту?",
        structure: "Subject + will have + V3",
        example: "I will have worked.",
      },
      {
        id: "futureContinuous",
        russian: "Что будет происходить в определённый момент?",
        structure: "Subject + will be + V-ing",
        example: "I will be working.",
      },
    ],
  },
];

// Map tense ID to period index
function periodIndexForTense(tenseId: string): number {
  if (tenseId.startsWith("past")) return 0;
  if (tenseId.startsWith("present")) return 1;
  if (tenseId.startsWith("future")) return 2;
  return 1;
}

// ─── Timeline section ─────────────────────────────────────────────────────────

function TimelineSection({
  period,
  highlightId,
  visible,
}: {
  period: Period;
  highlightId: string | null;
  visible: boolean;
}) {
  const highlightRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll highlighted column into center view when section becomes visible
  useEffect(() => {
    if (!visible) return;
    if (!highlightRef.current || !scrollRef.current) return;
    const container = scrollRef.current;
    const el = highlightRef.current;
    const offset = el.offsetLeft - container.clientWidth / 2 + el.offsetWidth / 2;
    container.scrollTo({ left: Math.max(0, offset), behavior: "smooth" });
  }, [visible, highlightId]);

  const card = period.standaloneCard;
  const cardHighlighted = card ? highlightId === card.id : false;
  const n = period.tenses.length;

  return (
    <>
      {/* ── Standalone card (e.g. Past Simple above timeline) ── */}
      {card && (
        <div className="flex justify-center px-4 pt-4 pb-2">
          <div
            className={cn(
              "rounded-2xl px-5 py-3 text-center max-w-[240px] w-full border transition-all duration-300",
              cardHighlighted
                ? "border-primary/40 bg-primary/10 shadow-sm"
                : "border-border bg-card",
            )}
          >
            <p className={cn(
              "text-base font-semibold mb-2 leading-tight",
              cardHighlighted ? period.accentClass : "text-foreground",
            )}>
              {getTenseLabel(card.id)}
            </p>
            <p className={cn(
              "text-sm leading-tight mb-2",
              cardHighlighted ? "text-foreground font-medium" : "text-muted-foreground",
            )}>
              {card.russian}
            </p>
            <p className="text-xs text-muted-foreground font-mono leading-tight mb-2">
              {card.structure}
            </p>
            <p className="text-sm font-medium text-foreground italic leading-tight">
              {card.example}
            </p>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="w-full overflow-x-auto overscroll-x-contain relative"
        style={{ scrollbarWidth: "none" }}
      >
        {/* ── CSS Grid: 1 column per tense, 5 explicit rows ── */}
        <div
          className="grid gap-x-4 px-6 py-2 relative z-0"
          style={{
            minWidth: `max(100%, ${n * 196 + (n - 1) * 16 + 48}px)`,
            gridTemplateColumns: `repeat(${n}, minmax(180px, 1fr))`,
            gridTemplateRows: "auto 16px 28px 16px auto",
            alignItems: "start",
          }}
        >
          {/* Horizontal timeline line runs through the dot row (row 3) */}
          <div
            className="bg-border z-0"
            style={{
              gridColumn: `1 / span ${n}`,
              gridRow: 3,
              alignSelf: "center",
              height: "2px",
            }}
          />

          {/* Left fade */}
          <div
            className="absolute left-0 w-6 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none"
            style={{ top: 0, bottom: 0 }}
          />
          {/* Right fade */}
          <div
            className="absolute right-0 w-6 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none"
            style={{ top: 0, bottom: 0 }}
          />

          {/* ── Row 1: Russian question bubbles ── */}
          {period.tenses.map((tense, idx) => {
            const isHighlighted = tense.id === highlightId;
            return (
              <div
                key={`${tense.id}-q`}
                ref={isHighlighted ? highlightRef : undefined}
                className="flex justify-center px-2 pt-5"
                style={{ gridColumn: idx + 1, gridRow: 1 }}
              >
                <div
                  className={cn(
                    "rounded-2xl px-3 py-2 text-center max-w-[148px] w-full",
                    "border transition-all duration-300",
                    isHighlighted
                      ? "border-primary/40 bg-primary/10 shadow-sm"
                      : "border-border bg-card",
                  )}
                >
                  <p className={cn(
                    "text-sm leading-tight",
                    isHighlighted ? "text-foreground font-medium" : "text-muted-foreground",
                  )}>
                    {tense.russian}
                  </p>
                </div>
              </div>
            );
          })}

          {/* ── Row 2: Upper connectors ── */}
          {period.tenses.map((tense, idx) => {
            const isHighlighted = tense.id === highlightId;
            return (
              <div
                key={`${tense.id}-uc`}
                className="flex justify-center"
                style={{ gridColumn: idx + 1, gridRow: 2 }}
              >
                <div
                  className={cn(
                    "w-px",
                    isHighlighted ? "bg-primary/40" : "bg-border",
                  )}
                  style={{ height: "100%" }}
                />
              </div>
            );
          })}

          {/* ── Row 3: Timeline dots ── */}
          {period.tenses.map((tense, idx) => {
            const isHighlighted = tense.id === highlightId;
            return (
              <div
                key={`${tense.id}-dot`}
                className="flex items-center justify-center"
                style={{ gridColumn: idx + 1, gridRow: 3, position: "relative", zIndex: 1 }}
              >
                <div
                  className={cn(
                    "rounded-full border-2 border-background transition-all duration-300",
                    period.dotBg,
                    isHighlighted
                      ? "w-5 h-5 ring-4 shadow-lg " + period.ringClass
                      : "w-3 h-3",
                  )}
                />
              </div>
            );
          })}

          {/* ── Row 4: Lower connectors ── */}
          {period.tenses.map((tense, idx) => {
            const isHighlighted = tense.id === highlightId;
            return (
              <div
                key={`${tense.id}-lc`}
                className="flex justify-center"
                style={{ gridColumn: idx + 1, gridRow: 4 }}
              >
                <div
                  className={cn(
                    "w-px",
                    isHighlighted ? "bg-primary/40" : "bg-border",
                  )}
                  style={{ height: "100%" }}
                />
              </div>
            );
          })}

          {/* ── Row 5: English tense cards ── */}
          {period.tenses.map((tense, idx) => {
            const isHighlighted = tense.id === highlightId;
            return (
              <div
                key={`${tense.id}-card`}
                className="flex justify-center px-2 pb-5"
                style={{ gridColumn: idx + 1, gridRow: 5 }}
              >
                <div
                  className={cn(
                    "rounded-2xl px-3 py-3 text-center max-w-[148px] w-full",
                    "border transition-all duration-300",
                    isHighlighted
                      ? "border-primary/40 bg-primary/10 shadow-sm"
                      : "border-border bg-card",
                  )}
                >
                  <p className={cn(
                    "text-sm font-semibold mb-2 leading-tight",
                    isHighlighted ? period.accentClass : "text-foreground",
                  )}>
                    {getTenseLabel(tense.id)}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono leading-tight mb-2">
                    {tense.structure}
                  </p>
                  <p className="text-sm font-medium text-foreground italic leading-tight">
                    {tense.example}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Tenses() {
  const [, navigate] = useLocation();

  // Determine initial state from sessionStorage context
  const [currentPeriod, setCurrentPeriod] = useState<number>(() => {
    try {
      const raw = sessionStorage.getItem("tensesContext");
      if (!raw) return 1; // default: Present
      const { tenseId } = JSON.parse(raw) as { tenseId: string };
      return periodIndexForTense(tenseId);
    } catch {
      return 1;
    }
  });

  const [highlightId, setHighlightId] = useState<string | null>(() => {
    try {
      const raw = sessionStorage.getItem("tensesContext");
      if (!raw) return null;
      const { tenseId } = JSON.parse(raw) as { tenseId: string };
      return tenseId;
    } catch {
      return null;
    }
  });

  const goTo = useCallback((idx: number) => {
    setCurrentPeriod(wrapIndex(idx, PERIODS.length));
  }, []);

  // Enable pinch-to-zoom on this page; restore on unmount
  useEffect(() => {
    const viewport = document.querySelector("meta[name=viewport]");
    if (!viewport) return;
    const original = viewport.getAttribute("content") ?? "";
    viewport.setAttribute(
      "content",
      "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes",
    );
    return () => {
      viewport.setAttribute("content", original);
    };
  }, []);

  const period = PERIODS[currentPeriod];

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col select-none pt-safe">

      {/* ── Header ── */}
      <div className="shrink-0 flex items-center gap-3 px-4 pt-4 pb-3 border-b border-border">
        <button
          onClick={() => navigate("/practice")}
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Back to Practice"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-base font-semibold">English Tenses</h1>
        </div>
        {/* Spacer to balance the back button */}
        <div className="w-9" />
      </div>

      {/* ── Period tabs ── */}
      <div className="shrink-0 flex items-center justify-center gap-1 px-4 py-3">
        {PERIODS.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => goTo(idx)}
            className={cn(
              "flex-1 max-w-[120px] py-2 px-4 rounded-full text-sm font-medium transition-all duration-200",
              idx === currentPeriod
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Timeline viewer ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Period label with nav arrows */}
        <div className="flex items-center justify-between px-6 pt-2 pb-1">
          <button
            onClick={() => goTo(currentPeriod - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <span className={cn("text-sm font-semibold", period.accentClass)}>
              {period.label}
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              {currentPeriod + 1} / 3
            </span>
          </div>
          <button
            onClick={() => goTo(currentPeriod + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Period strip — navigation via tabs/arrows only, no swipe */}
        <div
          className="relative flex-1 overflow-hidden"
        >
          <div
            className="flex h-full"
            style={{
              width: "300%",
              transform: `translateX(${(-currentPeriod * 100) / 3}%)`,
              transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {PERIODS.map((p, idx) => (
              <div
                key={p.id}
                className="flex flex-col justify-center"
                style={{ width: "33.333%", opacity: idx === currentPeriod ? 1 : 0.3, transition: "opacity 300ms" }}
              >
                <TimelineSection
                  period={p}
                  highlightId={highlightId}
                  visible={idx === currentPeriod}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dot pagination indicators */}
        <div className="flex justify-center gap-2 py-4">
          {PERIODS.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => goTo(idx)}
              className={cn(
                "rounded-full transition-all duration-200",
                idx === currentPeriod
                  ? cn("w-5 h-2", period.accentBg)
                  : "w-2 h-2 bg-border hover:bg-muted-foreground",
              )}
              aria-label={`Go to ${p.label}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

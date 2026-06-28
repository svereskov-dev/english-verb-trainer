import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";

// ─── Tense data ───────────────────────────────────────────────────────────────

interface TenseDef {
  id: string;
  name: string;
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
      name: "Past Simple",
      russian: "Что произошло?",
      structure: "Subject + V2",
      example: "I worked.",
    },
    tenses: [
      // Chronological order: earliest (left) → latest (right)
      {
        id: "pastPerfectContinuous",
        name: "Past Perfect Continuous",
        russian: "Что происходило до другого события?",
        structure: "Subject + had been + V-ing",
        example: "I had been working.",
      },
      {
        id: "pastPerfect",
        name: "Past Perfect",
        russian: "Что произошло раньше другого события?",
        structure: "Subject + had + V3",
        example: "I had worked.",
      },
      {
        id: "pastContinuous",
        name: "Past Continuous",
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
    tenses: [
      {
        id: "presentSimple",
        name: "Present Simple",
        russian: "Что происходит обычно?",
        structure: "Subject + V1",
        example: "I work.",
      },
      {
        id: "presentContinuous",
        name: "Present Continuous",
        russian: "Что происходит прямо сейчас?",
        structure: "Subject + am/is/are + V-ing",
        example: "I am working.",
      },
      {
        id: "presentPerfect",
        name: "Present Perfect",
        russian: "Какой результат есть сейчас?",
        structure: "Subject + have/has + V3",
        example: "I have worked.",
      },
      {
        id: "presentPerfectContinuous",
        name: "Present Perfect Continuous",
        russian: "Что продолжается до настоящего момента?",
        structure: "Subject + have/has been + V-ing",
        example: "I have been working.",
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
    tenses: [
      {
        id: "futureSimple",
        name: "Future Simple",
        russian: "Что произойдёт?",
        structure: "Subject + will + V1",
        example: "I will work.",
      },
      {
        id: "futureContinuous",
        name: "Future Continuous",
        russian: "Что будет происходить в определённый момент?",
        structure: "Subject + will be + V-ing",
        example: "I will be working.",
      },
      {
        id: "futurePerfect",
        name: "Future Perfect",
        russian: "Что завершится к определённому моменту?",
        structure: "Subject + will have + V3",
        example: "I will have worked.",
      },
      {
        id: "futurePerfectContinuous",
        name: "Future Perfect Continuous",
        russian: "Что будет длиться к определённому моменту?",
        structure: "Subject + will have been + V-ing",
        example: "I will have been working.",
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

  // Scroll highlighted tense into center view when section becomes visible
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
              "text-sm font-semibold mb-1.5 leading-tight",
              cardHighlighted ? period.accentClass : "text-foreground",
            )}>
              {card.name}
            </p>
            <p className={cn(
              "text-xs leading-tight mb-2",
              cardHighlighted ? "text-foreground font-medium" : "text-muted-foreground",
            )}>
              {card.russian}
            </p>
            <p className="text-[11px] text-muted-foreground font-mono leading-tight mb-1.5">
              {card.structure}
            </p>
            <p className="text-xs font-medium text-foreground italic leading-tight">
              {card.example}
            </p>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="w-full overflow-x-auto overscroll-x-contain pb-2"
        style={{ scrollbarWidth: "none" }}
      >
      {/* Inner strip: wider than screen so content is scrollable */}
      <div className="relative inline-flex items-stretch min-w-full px-6" style={{ minWidth: "max(100%, 672px)" }}>

        {/* ── Continuous timeline line ── */}
        <div
          className="absolute left-0 right-0 bg-border"
          style={{ top: "calc(50% - 1px)", height: "2px" }}
        />

        {/* Left continuation gradient */}
        <div
          className="absolute left-0 w-6 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none"
          style={{ top: "0", bottom: "0" }}
        />
        {/* Right continuation gradient */}
        <div
          className="absolute right-0 w-6 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none"
          style={{ top: "0", bottom: "0" }}
        />

        {/* ── Markers ── */}
        {period.tenses.map((tense) => {
          const isHighlighted = tense.id === highlightId;
          return (
            <div
              key={tense.id}
              ref={isHighlighted ? highlightRef : undefined}
              className={cn(
                "flex-1 flex flex-col items-center gap-0 transition-all duration-300",
                "min-w-[160px]"
              )}
            >
              {/* ── Upper bubble (Russian) ── */}
              <div className="flex-1 flex flex-col items-center justify-end pb-4 pt-6 px-2">
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
                    "text-xs leading-tight",
                    isHighlighted ? "text-foreground font-medium" : "text-muted-foreground",
                  )}>
                    {tense.russian}
                  </p>
                </div>
                {/* Stem from bubble down to line */}
                <div className={cn("w-px h-4 mt-2", isHighlighted ? "bg-primary/40" : "bg-border")} />
              </div>

              {/* ── Timeline dot ── */}
              <div className="relative z-10 flex items-center justify-center">
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

              {/* ── Lower bubble (English) ── */}
              <div className="flex-1 flex flex-col items-center justify-start pt-4 pb-6 px-2">
                {/* Stem from line down to bubble */}
                <div className={cn("w-px h-4 mb-2", isHighlighted ? "bg-primary/40" : "bg-border")} />
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
                    "text-xs font-semibold mb-1.5 leading-tight",
                    isHighlighted ? period.accentClass : "text-foreground",
                  )}>
                    {tense.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono leading-tight mb-2">
                    {tense.structure}
                  </p>
                  <p className="text-xs font-medium text-foreground italic leading-tight">
                    {tense.example}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </>);
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

  // Touch / swipe handling
  const touchStartX = useRef<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx > 2) return;
    setIsAnimating(true);
    setCurrentPeriod(idx);
    setTimeout(() => setIsAnimating(false), 320);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      if (delta > 0) goTo(currentPeriod + 1);
      else goTo(currentPeriod - 1);
    }
    touchStartX.current = null;
  };

  const period = PERIODS[currentPeriod];

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col select-none">

      {/* ── Header ── */}
      <div className="shrink-0 flex items-center gap-3 px-4 pt-safe pt-4 pb-3 border-b border-border">
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
            disabled={currentPeriod === 0}
            className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:pointer-events-none"
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
            disabled={currentPeriod === 2}
            className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Swipeable strip */}
        <div
          className="relative flex-1 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
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

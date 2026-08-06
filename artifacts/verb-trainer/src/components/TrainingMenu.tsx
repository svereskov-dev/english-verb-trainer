import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { cn } from "../lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SessionConfig, VerbPoolSpec, IrregularForm } from "../engine/exercises";
import { Tense } from "../data/grammar";

// ─── Preset definitions ───────────────────────────────────────────────────────

interface PresetDef {
  id: string;
  label: string;
  exerciseTypes: ("verbform" | "irregular")[];
  verbPool: VerbPoolSpec;
  tenses?: Tense[];
  irregularForm?: IrregularForm;
  mistakesOnly?: boolean;
}

interface GroupDef {
  id: string;
  label: string;
  presets: PresetDef[];
}

const GROUPS: GroupDef[] = [
  // ── Past Tenses ─────────────────────────────────────────────────────────────
  {
    id: "past-tenses",
    label: "Past Tenses",
    presets: [
      // "past-simple" is a new ID (no old equivalent); cont-past/perf-past kept for saved-config compat.
      { id: "past-simple", label: "Past Simple",             exerciseTypes: ["verbform"], verbPool: "all", tenses: ["pastSimple"] },
      { id: "cont-past",   label: "Past Continuous",         exerciseTypes: ["verbform"], verbPool: "all", tenses: ["pastContinuous"] },
      { id: "perf-past",   label: "Past Perfect",            exerciseTypes: ["verbform"], verbPool: "all", tenses: ["pastPerfect"] },
      { id: "past-pc",     label: "Past Perfect Continuous", exerciseTypes: ["verbform"], verbPool: "all", tenses: ["pastPerfectContinuous"] },
      { id: "past-mixed",  label: "Mixed",                   exerciseTypes: ["verbform"], verbPool: "all", tenses: ["pastSimple", "pastContinuous", "pastPerfect", "pastPerfectContinuous"] },
    ],
  },

  // ── Present Tenses ──────────────────────────────────────────────────────────
  {
    id: "present-tenses",
    label: "Present Tenses",
    presets: [
      // ps-all / cont-pres / perf-pres kept for saved-config compat.
      { id: "ps-all",      label: "Present Simple",             exerciseTypes: ["verbform"], verbPool: "all", tenses: ["presentSimple"] },
      { id: "cont-pres",   label: "Present Continuous",         exerciseTypes: ["verbform"], verbPool: "all", tenses: ["presentContinuous"] },
      { id: "perf-pres",   label: "Present Perfect",            exerciseTypes: ["verbform"], verbPool: "all", tenses: ["presentPerfect"] },
      { id: "pres-pc",     label: "Present Perfect Continuous", exerciseTypes: ["verbform"], verbPool: "all", tenses: ["presentPerfectContinuous"] },
      { id: "pres-mixed",  label: "Mixed",                      exerciseTypes: ["verbform"], verbPool: "all", tenses: ["presentSimple", "presentContinuous", "presentPerfect", "presentPerfectContinuous"] },
    ],
  },

  // ── Future Tenses ───────────────────────────────────────────────────────────
  {
    id: "future-tenses",
    label: "Future Tenses",
    presets: [
      // cont-fut / perf-fut kept for saved-config compat; others are new IDs.
      { id: "fut-simple",  label: "Future Simple",             exerciseTypes: ["verbform"], verbPool: "all", tenses: ["futureSimple"] },
      { id: "cont-fut",    label: "Future Continuous",         exerciseTypes: ["verbform"], verbPool: "all", tenses: ["futureContinuous"] },
      { id: "perf-fut",    label: "Future Perfect",            exerciseTypes: ["verbform"], verbPool: "all", tenses: ["futurePerfect"] },
      { id: "fut-pc",      label: "Future Perfect Continuous", exerciseTypes: ["verbform"], verbPool: "all", tenses: ["futurePerfectContinuous"] },
      { id: "fut-mixed",   label: "Mixed",                     exerciseTypes: ["verbform"], verbPool: "all", tenses: ["futureSimple", "futureContinuous", "futurePerfect", "futurePerfectContinuous"] },
    ],
  },

  // ── Irregular Verb Forms ────────────────────────────────────────────────────
  // Intentionally separate: these are verb forms, not tenses.
  {
    id: "irregular-forms",
    label: "Irregular Verb Forms",
    presets: [
      // irr-* IDs kept for saved-config compat; labels clarified with V2/V3 notation.
      { id: "irr-past",  label: "Past Simple (V2)",    exerciseTypes: ["irregular"], verbPool: "irregular", irregularForm: "past" },
      { id: "irr-pp",    label: "Past Participle (V3)", exerciseTypes: ["irregular"], verbPool: "irregular", irregularForm: "pastParticiple" },
      { id: "irr-mixed", label: "Mixed",                exerciseTypes: ["irregular"], verbPool: "irregular", irregularForm: "mixed" },
    ],
  },

  // ── Full Conjugation ────────────────────────────────────────────────────────
  {
    id: "full",
    label: "Full Conjugation",
    presets: [
      { id: "full-all", label: "All Tenses", exerciseTypes: ["verbform"], verbPool: "all" },
    ],
  },

  // ── Mistakes Review ─────────────────────────────────────────────────────────
  {
    id: "mistakes",
    label: "Mistakes Review",
    presets: [
      { id: "mistakes", label: "Review Mistakes", exerciseTypes: ["verbform", "irregular"], verbPool: "all", mistakesOnly: true },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildConfig(
  selectedIds: string[],
  contextEnabled: boolean,
  letterBuilderEnabled: boolean,
): SessionConfig {
  const presets = selectedIds.map(id => findGroupAndPreset(id)).filter(Boolean);
  if (presets.length === 0) {
    const fallback = findGroupAndPreset("full-all")!;
    return {
      id: "full-all",
      label: fallback.preset.label,
      groupLabel: fallback.group.label,
      selectedIds: ["full-all"],
      exerciseTypes: fallback.preset.exerciseTypes,
      verbPool: fallback.preset.verbPool,
      tenses: fallback.preset.tenses,
      contextEnabled,
      letterBuilderEnabled,
    };
  }

  // Merge all selected presets
  const allTenses = new Set<Tense>();
  const allTypes = new Set<("verbform" | "irregular")>();
  const allIrregularForms = new Set<IrregularForm>();
  const allMistakesOnly = new Set<boolean>();
  let verbPool: VerbPoolSpec = "all";

  for (const p of presets) {
    p!.preset.tenses?.forEach(t => allTenses.add(t));
    p!.preset.exerciseTypes.forEach(t => allTypes.add(t));
    if (p!.preset.irregularForm) allIrregularForms.add(p!.preset.irregularForm);
    if (p!.preset.mistakesOnly) allMistakesOnly.add(true);
    if (p!.preset.verbPool !== "all") verbPool = p!.preset.verbPool;
  }

  // Pick a representative label and groupLabel
  const first = presets[0]!;
  const label = selectedIds.length === 1
    ? first.preset.label
    : `${first.group.label} (×${selectedIds.length})`;
  const groupLabel = selectedIds.length === 1
    ? first.group.label
    : "Mixed";

  return {
    id: selectedIds.join("+"),
    label,
    groupLabel,
    selectedIds: [...selectedIds],
    exerciseTypes: [...allTypes],
    verbPool,
    tenses: allTenses.size > 0 ? [...allTenses] : undefined,
    irregularForm: allIrregularForms.size === 1 ? [...allIrregularForms][0] : undefined,
    mistakesOnly: allMistakesOnly.size > 0,
    contextEnabled,
    letterBuilderEnabled,
    userCustomized: true,
  };
}

function findGroupAndPreset(id: string) {
  for (const group of GROUPS) {
    const preset = group.presets.find(p => p.id === id);
    if (preset) return { group, preset };
  }
  return null;
}

// ─── Default session ──────────────────────────────────────────────────────────

const _DEFAULT_SESSION: SessionConfig = buildConfig(
  ["full-all"], // Full Conjugation → All Tenses
  false,
  true,         // Letter Builder enabled by default for new users
);

export const DEFAULT_SESSION: SessionConfig = {
  ..._DEFAULT_SESSION,
  userCustomized: false,
};

// ─── Component ────────────────────────────────────────────────────────────────

interface TrainingMenuProps {
  current: SessionConfig;
  onSelect: (config: SessionConfig) => void;
  compact?: boolean;
}

export function TrainingMenu({ current, onSelect, compact = false }: TrainingMenuProps) {
  const [open, setOpen]               = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(current.selectedIds);
  const [contextOn, setContextOn]     = useState(current.contextEnabled);
  // Letter Builder defaults to true for new users (current.letterBuilderEnabled may be undefined for old saved configs)
  const [letterBuilderOn, setLetterBuilderOn] = useState(current.letterBuilderEnabled ?? true);

  // ── Scroll indicators ──────────────────────────────────────────────────────
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollUp,   setCanScrollUp]   = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    if (!open) return;

    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      setCanScrollUp(el.scrollTop > 4);
      setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
    };

    // Defer first check so the sheet animation has settled and scrollHeight is accurate.
    const raf = requestAnimationFrame(update);
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [open]);

  // Auto-open when navigated from Home via "Choose Training Mode"
  useEffect(() => {
    if (sessionStorage.getItem("openTrainingMenu") === "true") {
      sessionStorage.removeItem("openTrainingMenu");
      setOpen(true);
    }
  }, []);

  const handleOpen = (o: boolean) => {
    if (o) {
      setSelectedIds(current.selectedIds);
      setContextOn(current.contextEnabled);
      setLetterBuilderOn(current.letterBuilderEnabled ?? true);
    }
    setOpen(o);
  };

  const handleStart = () => {
    onSelect(buildConfig(selectedIds, contextOn, letterBuilderOn));
    setOpen(false);
  };

  // All verbform preset IDs (for Full Conjugation exclusivity)
  const allVerbformIds = GROUPS.flatMap(g =>
    g.presets.filter(p => p.exerciseTypes.includes("verbform")).map(p => p.id)
  );

  const togglePreset = (id: string) => {
    setSelectedIds(prev => {
      // 0. Fully exclusive options: selecting them clears everything else
      if (id === "mistakes") {
        return ["mistakes"];
      }
      if (id === "full-all") {
        return ["full-all"];
      }

      const group = GROUPS.find(g => g.presets.some(p => p.id === id));
      if (!group) return prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id];

      const groupIds = group.presets.map(p => p.id);
      const mixedId = group.presets.find(p => p.label === "Mixed")?.id;

      // Strip any fully-exclusive option if it was active
      const base = prev.includes("mistakes") || prev.includes("full-all")
        ? prev.filter(p => p !== "mistakes" && p !== "full-all")
        : prev;

      // 1. Deselect
      if (base.includes(id)) {
        return base.filter(p => p !== id);
      }

      // 2. Selecting Mixed: remove all other presets in this group
      if (id === mixedId) {
        return [...base.filter(p => !groupIds.includes(p)), id];
      }

      // 3. Selecting a verbform preset while full-all was active (already stripped above)
      // — just apply normal logic: remove Mixed from this group, add individual
      const withoutMixed = mixedId ? base.filter(p => p !== mixedId) : base;
      return [...withoutMixed, id];
    });
  };

  const contextLabel = current.contextEnabled ? " · Context" : "";
  const buttonLabel = current.userCustomized
    ? `${current.groupLabel}${contextLabel}`
    : "Training Mode";

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "rounded-full flex items-center gap-1.5 font-semibold min-w-0 overflow-hidden",
            compact ? "max-w-[180px] h-7 text-xs px-2" : "max-w-[220px]"
          )}
        >
          <span className="truncate text-left min-w-0">{buttonLabel}</span>
          <ChevronDown size={compact ? 12 : 14} className="shrink-0 opacity-60" />
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[88dvh] flex flex-col p-0 rounded-t-2xl">
        <SheetHeader className="px-6 pt-5 pb-4 border-b shrink-0">
          <SheetTitle className="text-left text-base">Training Mode</SheetTitle>
        </SheetHeader>

        {/* Scroll area with fade indicators ──────────────────────────────── */}
        <div className="relative flex-1 min-h-0">
          {/* Scrollable content — native div for direct scroll-position access */}
          <div
            ref={scrollRef}
            className="h-full overflow-y-auto"
            // Hide native scrollbar on WebKit/Blink; indicator fades replace it.
            style={{ scrollbarWidth: "none" }}
          >
            <div className="px-5 py-4 space-y-3">
              {GROUPS.map(group => {
                const hasActive = group.presets.some(p => selectedIds.includes(p.id));

                return (
                  <div
                    key={group.id}
                    className={cn(
                      "rounded-xl border p-5 flex flex-col space-y-5 transition-colors",
                      hasActive
                        ? "border-primary/50 bg-primary/5"
                        : "border-border",
                    )}
                  >
                    {/* Group header */}
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        hasActive ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {group.label}
                    </span>

                    {/* Preset chips */}
                    <div className="flex flex-wrap gap-2">
                      {group.presets.map(preset => {
                        const chosen = selectedIds.includes(preset.id);
                        return (
                          <button
                            key={preset.id}
                            onClick={() => togglePreset(preset.id)}
                            className={cn(
                              "text-sm px-3 py-1.5 rounded-full border transition-colors font-medium",
                              chosen
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-foreground hover:border-primary/50 hover:bg-muted",
                            )}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top fade + up-arrow — visible when content exists above the viewport */}
          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-x-0 top-0 h-14 pointer-events-none z-10",
              "flex items-start justify-center pt-1",
              "bg-gradient-to-b from-background via-background/70 to-transparent",
              "transition-opacity duration-200",
              canScrollUp ? "opacity-100" : "opacity-0",
            )}
          >
            <ChevronUp size={18} className="text-muted-foreground mt-1" />
          </div>

          {/* Bottom fade + down-arrow — visible when content exists below the viewport */}
          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-x-0 bottom-0 h-14 pointer-events-none z-10",
              "flex items-end justify-center pb-1",
              "bg-gradient-to-t from-background via-background/70 to-transparent",
              "transition-opacity duration-200",
              canScrollDown ? "opacity-100" : "opacity-0",
            )}
          >
            <ChevronDown size={18} className="text-muted-foreground mb-1" />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t px-6 pt-4 space-y-3 bg-background" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
          <div className="flex items-center justify-between">
            <Label htmlFor="ctx-toggle" className="text-sm font-medium cursor-pointer">
              Context sentences
              <span className="block text-xs text-muted-foreground font-normal">
                Mix in gap-fill exercises
              </span>
            </Label>
            <Switch
              id="ctx-toggle"
              checked={contextOn}
              onCheckedChange={setContextOn}
              className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="lb-toggle" className="text-sm font-medium cursor-pointer">
              Letter Builder
              <span className="block text-xs text-muted-foreground font-normal">
                Tap letters instead of typing
              </span>
            </Label>
            <Switch
              id="lb-toggle"
              checked={letterBuilderOn}
              onCheckedChange={setLetterBuilderOn}
              className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
            />
          </div>
          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={handleStart}
            disabled={selectedIds.length === 0}
          >
            {selectedIds.length === 0 ? "Select at least one mode" : "Start Training"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

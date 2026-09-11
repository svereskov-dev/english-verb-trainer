import { useState, useEffect, useRef, useCallback } from "react";
import { useAudioFeedback } from "../hooks/useAudioFeedback";
import { getAllProgress } from "../db/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { cn } from "../lib/utils";
import { ChevronDown, ChevronUp, Lock } from "lucide-react";
import { SessionConfig, VerbPoolSpec, IrregularForm } from "../engine/exercises";
import { getTenseLabel, Tense } from "../data/grammar";
import { isPremiumSessionConfig, resolveTrainingSelection } from "../purchases/access";

// ─── Preset definitions ───────────────────────────────────────────────────────

interface PresetDef {
  id: string;
  label: string;
  exerciseTypes: ("verbform" | "irregular")[];
  verbPool: VerbPoolSpec;
  tenses?: Tense[];
  irregularForm?: IrregularForm;
  mistakesOnly?: boolean;
  mode?: "mixed";
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
      { id: "past-simple", label: getTenseLabel("pastSimple"),             exerciseTypes: ["verbform"], verbPool: "all", tenses: ["pastSimple"] },
      { id: "cont-past",   label: getTenseLabel("pastContinuous"),         exerciseTypes: ["verbform"], verbPool: "all", tenses: ["pastContinuous"] },
      { id: "perf-past",   label: getTenseLabel("pastPerfect"),            exerciseTypes: ["verbform"], verbPool: "all", tenses: ["pastPerfect"] },
      { id: "past-pc",     label: getTenseLabel("pastPerfectContinuous"), exerciseTypes: ["verbform"], verbPool: "all", tenses: ["pastPerfectContinuous"] },
      { id: "past-mixed",  label: "Mixed",                   mode: "mixed", exerciseTypes: ["verbform"], verbPool: "all", tenses: ["pastSimple", "pastContinuous", "pastPerfect", "pastPerfectContinuous"] },
    ],
  },

  // ── Present Tenses ──────────────────────────────────────────────────────────
  {
    id: "present-tenses",
    label: "Present Tenses",
    presets: [
      // ps-all / cont-pres / perf-pres kept for saved-config compat.
      { id: "ps-all",      label: getTenseLabel("presentSimple"),             exerciseTypes: ["verbform"], verbPool: "all", tenses: ["presentSimple"] },
      { id: "cont-pres",   label: getTenseLabel("presentContinuous"),         exerciseTypes: ["verbform"], verbPool: "all", tenses: ["presentContinuous"] },
      { id: "perf-pres",   label: getTenseLabel("presentPerfect"),            exerciseTypes: ["verbform"], verbPool: "all", tenses: ["presentPerfect"] },
      { id: "pres-pc",     label: getTenseLabel("presentPerfectContinuous"), exerciseTypes: ["verbform"], verbPool: "all", tenses: ["presentPerfectContinuous"] },
      { id: "pres-mixed",  label: "Mixed",                      mode: "mixed", exerciseTypes: ["verbform"], verbPool: "all", tenses: ["presentSimple", "presentContinuous", "presentPerfect", "presentPerfectContinuous"] },
    ],
  },

  // ── Future Tenses ───────────────────────────────────────────────────────────
  {
    id: "future-tenses",
    label: "Future Tenses",
    presets: [
      // cont-fut / perf-fut kept for saved-config compat; others are new IDs.
      { id: "fut-simple",  label: getTenseLabel("futureSimple"),             exerciseTypes: ["verbform"], verbPool: "all", tenses: ["futureSimple"] },
      { id: "cont-fut",    label: getTenseLabel("futureContinuous"),         exerciseTypes: ["verbform"], verbPool: "all", tenses: ["futureContinuous"] },
      { id: "perf-fut",    label: getTenseLabel("futurePerfect"),            exerciseTypes: ["verbform"], verbPool: "all", tenses: ["futurePerfect"] },
      { id: "fut-pc",      label: getTenseLabel("futurePerfectContinuous"), exerciseTypes: ["verbform"], verbPool: "all", tenses: ["futurePerfectContinuous"] },
      { id: "fut-mixed",   label: "Mixed",                     mode: "mixed", exerciseTypes: ["verbform"], verbPool: "all", tenses: ["futureSimple", "futureContinuous", "futurePerfect", "futurePerfectContinuous"] },
    ],
  },

  // ── Irregular Verb Forms ────────────────────────────────────────────────────
  // Intentionally separate: these are verb forms, not tenses.
  {
    id: "irregular-forms",
    label: "Irregular Verb Forms",
    presets: [
      // irr-* IDs kept for saved-config compat; labels clarified with V2/V3 notation.
      { id: "irr-past",  label: `${getTenseLabel("pastSimple")} (V2)`,    exerciseTypes: ["irregular"], verbPool: "irregular", irregularForm: "past" },
      { id: "irr-pp",    label: "Past Participle (V3)", exerciseTypes: ["irregular"], verbPool: "irregular", irregularForm: "pastParticiple" },
      { id: "irr-mixed", label: "Mixed",                mode: "mixed", exerciseTypes: ["irregular"], verbPool: "irregular", irregularForm: "mixed" },
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
    label: "Mistakes",
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

function getConfigGroupLabel(config: SessionConfig): string {
  const selectedIds = config.selectedIds?.length ? config.selectedIds : [config.id];
  const matches = selectedIds.map(findGroupAndPreset).filter(Boolean);

  if (matches.length === 1) return matches[0]!.group.label;
  if (matches.length > 1) return "Mixed";
  return config.groupLabel ?? "Training Mode";
}

// ─── Default session ──────────────────────────────────────────────────────────

const _DEFAULT_SESSION: SessionConfig = buildConfig(
  ["ps-all"],
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
  /** Fires immediately when a toggle (Context / Letter Builder) changes,
   *  before the user presses "Start Training", so the exercise updates instantly. */
  onImmediateToggle?: (config: SessionConfig) => void;
  hasFullAccess?: boolean;
  onLockedPreset?: () => void;
  compact?: boolean;
}

export function TrainingMenu({
  current,
  onSelect,
  onImmediateToggle,
  hasFullAccess = false,
  onLockedPreset,
  compact = false,
}: TrainingMenuProps) {
  const [open, setOpen]               = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(current.selectedIds);
  const [contextOn, setContextOn]     = useState(current.contextEnabled);
  // Letter Builder defaults to true for new users (current.letterBuilderEnabled may be undefined for old saved configs)
  const [letterBuilderOn, setLetterBuilderOn] = useState(current.letterBuilderEnabled ?? true);
  const [hasMistakes, setHasMistakes] = useState<boolean | null>(null);

  const { playToggle } = useAudioFeedback();

  const refreshMistakeAvailability = useCallback(() => {
    getAllProgress().then(records => {
      setHasMistakes(records.some(record => record.lastFailureDate > 0));
    });
  }, []);

  useEffect(() => {
    refreshMistakeAvailability();
    window.addEventListener("mistakes-updated", refreshMistakeAvailability);
    return () => window.removeEventListener("mistakes-updated", refreshMistakeAvailability);
  }, [refreshMistakeAvailability]);

  // ── Review Mistakes behavior ──────────────────────────────────────────────
  // Derived from the LOCAL draft selection — updates immediately when the user
  // taps "Review Mistakes", before pressing "To Training".
  const isDraftReviewMode = selectedIds.includes("mistakes");

  // Persist the pre-review toggle values so we can restore them if the user
  // switches away from Review Mistakes without pressing "To Training".
  const preReviewContextRef      = useRef(contextOn);
  const preReviewLetterBuilderRef = useRef(letterBuilderOn);

  // Sync toggle state immediately when review mode is selected / deselected.
  useEffect(() => {
    if (isDraftReviewMode) {
      // Capture current values before locking
      preReviewContextRef.current      = contextOn;
      preReviewLetterBuilderRef.current = letterBuilderOn;
      setContextOn(false);
    } else if (current.id === "mistake-review") {
      // Restore the values the user had before entering review mode
      setContextOn(preReviewContextRef.current);
      setLetterBuilderOn(preReviewLetterBuilderRef.current);
    } else {
      // The review may have been exited outside this menu (for example by
      // skipping its final item). In that case, sync with the new normal
      // session instead of restoring the stale pre-review draft.
      setContextOn(current.contextEnabled);
      setLetterBuilderOn(current.letterBuilderEnabled ?? true);
    }
  // Only re-run when the review-mode selection itself changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDraftReviewMode]);

  useEffect(() => {
    if (hasMistakes === false && isDraftReviewMode) {
      setSelectedIds(["full-all"]);
    }
  }, [hasMistakes, isDraftReviewMode]);

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
      refreshMistakeAvailability();
      setSelectedIds(current.selectedIds);
      // Restore current committed toggle values — the isDraftReviewMode effect
      // will immediately override them if review mode is selected.
      setContextOn(current.contextEnabled);
      setLetterBuilderOn(current.letterBuilderEnabled ?? true);
    }
    setOpen(o);
  };

  const handleStart = () => {
    const next = buildConfig(selectedIds, contextOn, letterBuilderOn);
    const result = resolveTrainingSelection(current, next, hasFullAccess);
    if (result.openPaywall) {
      onLockedPreset?.();
      return;
    }
    onSelect(result.config);
    setOpen(false);
  };

  // All verbform preset IDs (for Full Conjugation exclusivity)
  const allVerbformIds = GROUPS.flatMap(g =>
    g.presets.filter(p => p.exerciseTypes.includes("verbform")).map(p => p.id)
  );

  const togglePreset = (id: string) => {
    if (id === "mistakes" && hasMistakes === false) return;
    const match = findGroupAndPreset(id);
    if (
      match
      && !hasFullAccess
      && isPremiumSessionConfig(buildConfig([id], contextOn, letterBuilderOn))
    ) {
      onLockedPreset?.();
      return;
    }

    // Review Mistakes is the only preset that can be toggled off by clicking
    // the active option. Exit immediately into the neutral Full Conjugation
    // mode instead of requiring the user to pick another preset first.
    if (id === "mistakes" && selectedIds.includes("mistakes")) {
      const restoredContext = preReviewContextRef.current;
      const restoredLetterBuilder = preReviewLetterBuilderRef.current;
      const nextConfig = buildConfig(
        ["full-all"],
        restoredContext,
        restoredLetterBuilder,
      );

      setSelectedIds(["full-all"]);
      setContextOn(restoredContext);
      setLetterBuilderOn(restoredLetterBuilder);
      onSelect(nextConfig);
      setOpen(false);
      return;
    }

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
      const mixedId = group.presets.find(p => p.mode === "mixed")?.id;

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
    ? `${getConfigGroupLabel(current)}${contextLabel}`
    : "Training Mode";

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="compact"
          className={cn(
            "min-w-0 overflow-hidden",
            compact ? "max-w-[180px] h-7 px-2" : "max-w-[220px]"
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
                        const disabled = preset.mistakesOnly && hasMistakes === false;
                        const locked = !hasFullAccess && isPremiumSessionConfig(
                          buildConfig([preset.id], contextOn, letterBuilderOn),
                        );
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => togglePreset(preset.id)}
                            disabled={disabled}
                            className={cn(
                              "text-sm px-3 py-1.5 rounded-full border transition-colors font-medium inline-flex items-center gap-1.5",
                              locked
                                ? "border-muted-foreground/40 bg-muted/30 text-muted-foreground opacity-60 hover:border-muted-foreground/50 hover:bg-muted/50"
                                : chosen
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-foreground hover:border-primary/50 hover:bg-muted",
                              disabled && "opacity-40 cursor-not-allowed pointer-events-none",
                            )}
                          >
                            {preset.label}
                            {locked && (
                              <Lock size={12} className="-translate-y-px" aria-label="Full Access" />
                            )}
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
          {/* Context sentences toggle — locked OFF during Review Mistakes */}
          <div className={cn("flex items-center justify-between", isDraftReviewMode && "opacity-40 pointer-events-none")}>
            <Label htmlFor="ctx-toggle" className="text-sm font-medium cursor-pointer">
              Context sentences
              <span className="block text-xs text-muted-foreground font-normal">
                {isDraftReviewMode ? "Disabled during Mistakes review" : "Mix in gap-fill exercises"}
              </span>
            </Label>
            <Switch
              id="ctx-toggle"
              checked={contextOn}
              onCheckedChange={(checked) => {
                setContextOn(checked);
                playToggle();
                onImmediateToggle?.(buildConfig(selectedIds, checked, letterBuilderOn));
              }}
              className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
            />
          </div>
          {/* Letter Builder remains user-configurable during Review Mistakes */}
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
              onCheckedChange={(checked) => {
                setLetterBuilderOn(checked);
                playToggle();
                onImmediateToggle?.(buildConfig(selectedIds, contextOn, checked));
              }}
              className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
            />
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={handleStart}
            disabled={selectedIds.length === 0}
          >
            {selectedIds.length === 0 ? "Select at least one mode" : "To Training"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

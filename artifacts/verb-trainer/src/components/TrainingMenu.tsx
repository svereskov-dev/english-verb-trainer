import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "../lib/utils";
import {
  ChevronDown, Zap, Clock, Activity, Star,
  BookOpen, AlertCircle,
} from "lucide-react";
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
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  presets: PresetDef[];
}

const GROUPS: GroupDef[] = [
  {
    id: "irregular",
    label: "Irregular Verbs",
    Icon: Zap,
    presets: [
      { id: "irr-past",  label: "Past Simple",      exerciseTypes: ["irregular"], verbPool: "irregular", irregularForm: "past" },
      { id: "irr-pp",    label: "Past Participle",   exerciseTypes: ["irregular"], verbPool: "irregular", irregularForm: "pastParticiple" },
      { id: "irr-mixed", label: "Mixed",             exerciseTypes: ["irregular"], verbPool: "irregular", irregularForm: "mixed" },
    ],
  },
  {
    id: "present-simple",
    label: "Present Simple",
    Icon: Clock,
    presets: [
      { id: "ps-all", label: "All Subjects", exerciseTypes: ["verbform"], verbPool: "all", tenses: ["presentSimple"] },
    ],
  },
  {
    id: "continuous",
    label: "Continuous Forms",
    Icon: Activity,
    presets: [
      { id: "cont-pres",  label: "Present",  exerciseTypes: ["verbform"], verbPool: "all", tenses: ["presentContinuous"] },
      { id: "cont-past",  label: "Past",     exerciseTypes: ["verbform"], verbPool: "all", tenses: ["pastContinuous"] },
      { id: "cont-fut",   label: "Future",   exerciseTypes: ["verbform"], verbPool: "all", tenses: ["futureContinuous"] },
      { id: "cont-mixed", label: "Mixed",    exerciseTypes: ["verbform"], verbPool: "all", tenses: ["presentContinuous", "pastContinuous", "futureContinuous"] },
    ],
  },
  {
    id: "perfect",
    label: "Perfect Forms",
    Icon: Star,
    presets: [
      { id: "perf-pres",  label: "Present", exerciseTypes: ["verbform"], verbPool: "all", tenses: ["presentPerfect"] },
      { id: "perf-past",  label: "Past",    exerciseTypes: ["verbform"], verbPool: "all", tenses: ["pastPerfect"] },
      { id: "perf-fut",   label: "Future",  exerciseTypes: ["verbform"], verbPool: "all", tenses: ["futurePerfect"] },
      { id: "perf-mixed", label: "Mixed",   exerciseTypes: ["verbform"], verbPool: "all", tenses: ["presentPerfect", "pastPerfect", "futurePerfect"] },
    ],
  },
  {
    id: "full",
    label: "Full Conjugation",
    Icon: BookOpen,
    presets: [
      { id: "full-all", label: "All Tenses", exerciseTypes: ["verbform"], verbPool: "all" },
    ],
  },
  {
    id: "mistakes",
    label: "Mistakes Review",
    Icon: AlertCircle,
    presets: [
      { id: "mistakes", label: "Review Mistakes", exerciseTypes: ["verbform", "irregular"], verbPool: "all", mistakesOnly: true },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildConfig(
  selectedIds: string[],
  contextEnabled: boolean,
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

export const DEFAULT_SESSION: SessionConfig = buildConfig(
  ["full-all"], // Full Conjugation → All Tenses
  false,
);

// ─── Component ────────────────────────────────────────────────────────────────

interface TrainingMenuProps {
  current: SessionConfig;
  onSelect: (config: SessionConfig) => void;
}

export function TrainingMenu({ current, onSelect }: TrainingMenuProps) {
  const [open, setOpen]             = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(current.selectedIds);
  const [contextOn, setContextOn]   = useState(current.contextEnabled);

  const handleOpen = (o: boolean) => {
    if (o) {
      setSelectedIds(current.selectedIds);
      setContextOn(current.contextEnabled);
    }
    setOpen(o);
  };

  const handleStart = () => {
    onSelect(buildConfig(selectedIds, contextOn));
    setOpen(false);
  };

  const togglePreset = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const contextLabel = current.contextEnabled ? " · Context" : "";
  const buttonLabel  = `${current.groupLabel}${contextLabel}`;

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full flex items-center gap-1.5 max-w-[220px]"
        >
          <span className="truncate text-left">{buttonLabel}</span>
          <ChevronDown size={14} className="shrink-0 opacity-60" />
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[88dvh] flex flex-col p-0 rounded-t-2xl">
        <SheetHeader className="px-6 pt-5 pb-4 border-b shrink-0">
          <SheetTitle className="text-left text-base">Training Mode</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-4 py-4 space-y-3">
            {GROUPS.map(group => {
              const { Icon } = group;
              const hasActive = group.presets.some(p => selectedIds.includes(p.id));

              return (
                <div
                  key={group.id}
                  className={cn(
                    "rounded-xl border p-4 space-y-3 transition-colors",
                    hasActive
                      ? "border-primary/50 bg-primary/5"
                      : "border-border",
                  )}
                >
                  {/* Group header */}
                  <div className="flex items-center gap-2">
                    <Icon
                      size={15}
                      className={cn(
                        "shrink-0",
                        hasActive ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        hasActive ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {group.label}
                    </span>
                  </div>

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
        </ScrollArea>

        {/* Footer */}
        <div className="shrink-0 border-t px-6 py-4 space-y-3 bg-background">
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

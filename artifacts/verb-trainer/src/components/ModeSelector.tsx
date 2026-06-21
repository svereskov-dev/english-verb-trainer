import { Button } from "./ui/button";

interface ModeSelectorProps {
  currentMode: string;
  onSelect: (mode: any) => void;
}

export function ModeSelector({ currentMode, onSelect }: ModeSelectorProps) {
  const modes = [
    { id: "mixed", label: "Mixed" },
    { id: "verbform", label: "Form" },
    { id: "irregular", label: "Irregular" },
    { id: "gapfill", label: "Context" },
  ];

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none w-full justify-start md:justify-center">
      {modes.map(m => (
        <Button
          key={m.id}
          variant={currentMode === m.id ? "default" : "outline"}
          size="sm"
          className="rounded-full shrink-0"
          onClick={() => onSelect(m.id)}
          data-testid={`mode-${m.id}`}
        >
          {m.label}
        </Button>
      ))}
    </div>
  );
}

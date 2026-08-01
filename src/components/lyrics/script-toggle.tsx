"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import { useReaderPreferences } from "@/stores/reader-preferences";
import type { Script } from "@/types";

interface ScriptToggleProps {
  showBothOption?: boolean;
  /** Most of the library is Urdu-only; hide the switch when there is nothing to switch to. */
  romanAvailable?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function ScriptToggle({
  showBothOption = true,
  romanAvailable = true,
  className,
  size = "md",
}: ScriptToggleProps) {
  const { script, showBothScripts, setScript, setShowBothScripts } = useReaderPreferences();
  const hydrated = useHydrated();
  const activeScript: Script = hydrated ? script : "urdu";
  const both = hydrated && showBothScripts;

  if (!romanAvailable) {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        Urdu only — no transliteration yet
      </p>
    );
  }

  const compact = size === "sm";

  return (
    <div className={cn("flex flex-wrap items-center gap-2 sm:gap-3", className)}>
      <div
        role="group"
        aria-label="Script"
        className={cn(
          "inline-flex rounded-md border bg-muted/40 p-0.5",
          compact && "text-xs",
        )}
      >
        <ScriptOption
          label="اردو"
          selected={!both && activeScript === "urdu"}
          compact={compact}
          onClick={() => setScript("urdu")}
        />
        <ScriptOption
          label="Roman"
          selected={!both && activeScript === "roman"}
          compact={compact}
          onClick={() => setScript("roman")}
        />
      </div>

      {showBothOption && (
        <div className="flex items-center gap-2">
          <Switch
            id="both-scripts"
            checked={both}
            onCheckedChange={(checked) => setShowBothScripts(Boolean(checked))}
          />
          <Label htmlFor="both-scripts" className="text-xs text-muted-foreground">
            Show both
          </Label>
        </div>
      )}
    </div>
  );
}

function ScriptOption({
  label,
  selected,
  compact,
  onClick,
}: {
  label: string;
  selected: boolean;
  compact: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-sm px-2.5 font-medium transition-colors",
        compact ? "h-7 px-2 text-xs" : "h-8 text-sm",
        selected
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

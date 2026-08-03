"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LyricSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  "aria-label"?: string;
  id?: string;
  className?: string;
  inputClassName?: string;
  size?: "sm" | "default";
};

export function LyricSearchInput({
  value,
  onChange,
  placeholder = "Search title, lines, poet, reciter…",
  "aria-label": ariaLabel = "Search lyrics",
  id,
  className,
  inputClassName,
  size = "default",
}: LyricSearchInputProps) {
  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
      <Search
        className={cn(
          "pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground",
          size === "sm" ? "size-3.5" : "size-4",
        )}
      />
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(
          "pl-8",
          size === "sm" ? "h-8 text-sm" : "h-8 text-sm sm:h-9",
          value && "pr-8",
          inputClassName,
        )}
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-1 size-6 -translate-y-1/2 text-muted-foreground"
          aria-label="Clear search"
          onClick={() => onChange("")}
        >
          <X className="size-3.5" />
        </Button>
      ) : null}
    </div>
  );
}

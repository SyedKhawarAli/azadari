"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { LyricSearchInput } from "@/components/lyrics/lyric-search-input";
import { ScriptToggle } from "@/components/lyrics/script-toggle";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LYRIC_TYPES } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

const ANY = "__any__";

interface LyricFiltersProps {
  personalities: string[];
  events: string[];
  poets: string[];
  reciters: string[];
}

export function LyricFilters({ personalities, events, poets, reciters }: LyricFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const apply = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === ANY) params.delete(key);
      else params.set(key, value);
    }
    const search = params.toString();
    startTransition(() => router.replace(search ? `/?${search}` : "/", { scroll: false }));
  };

  // Typing should filter as you go without a request on every keystroke.
  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (query === current) return;
    const timer = setTimeout(() => apply({ q: query }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const filterKeys = ["type", "personality", "event", "poet", "reciter"] as const;
  const activeFilterCount = filterKeys.filter((key) => searchParams.get(key)).length;

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of filterKeys) params.delete(key);
    const search = params.toString();
    startTransition(() => router.replace(search ? `/?${search}` : "/", { scroll: false }));
  };

  return (
    <div className="flex items-center gap-2" data-pending={pending ? "" : undefined}>
      <LyricSearchInput
        value={query}
        onChange={setQuery}
        aria-label="Search the library"
      />

      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="icon-sm"
              className="relative shrink-0 sm:size-9"
              aria-label={
                activeFilterCount > 0
                  ? `Filters and script, ${activeFilterCount} active`
                  : "Filters and script"
              }
            />
          }
        >
          <SlidersHorizontal className="size-3.5" />
          {activeFilterCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {activeFilterCount}
            </span>
          ) : null}
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 space-y-4 p-4">
          <PopoverHeader>
            <PopoverTitle>Filters & script</PopoverTitle>
          </PopoverHeader>

          <div className="space-y-2">
            <p className="text-xs font-medium">Script</p>
            <ScriptToggle size="sm" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium">Filters</p>
              {activeFilterCount > 0 ? (
                <Button variant="ghost" size="xs" onClick={clearFilters}>
                  <X className="size-3" />
                  Clear
                </Button>
              ) : null}
            </div>
            <div className="grid gap-2">
              <FilterSelect
                label="Type"
                value={searchParams.get("type")}
                options={LYRIC_TYPES}
                onChange={(value) => apply({ type: value })}
              />
              <FilterSelect
                label="Personality"
                value={searchParams.get("personality")}
                options={personalities}
                onChange={(value) => apply({ personality: value })}
              />
              <FilterSelect
                label="Occasion"
                value={searchParams.get("event")}
                options={events}
                onChange={(value) => apply({ event: value })}
              />
              <FilterSelect
                label="Poet"
                value={searchParams.get("poet")}
                options={poets}
                onChange={(value) => apply({ poet: value })}
              />
              <FilterSelect
                label="Reciter"
                value={searchParams.get("reciter")}
                options={reciters}
                onChange={(value) => apply({ reciter: value })}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  if (options.length === 0) return null;

  const items = [
    { value: ANY, label: `Any ${label.toLowerCase()}` },
    ...options.map((option) => ({ value: option, label: option })),
  ];

  return (
    <Select value={value ?? ANY} onValueChange={(next) => onChange(String(next))} items={items}>
      <SelectTrigger size="sm" className={cn("w-full text-xs sm:text-sm")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

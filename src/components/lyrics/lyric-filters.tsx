"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LYRIC_TYPES } from "@/lib/taxonomy";

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

  const activeCount = ["type", "personality", "event", "poet", "reciter", "q"].filter((key) =>
    searchParams.get(key),
  ).length;

  return (
    <div className="space-y-3" data-pending={pending ? "" : undefined}>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, poet, reciter…"
          className="h-8 pl-8 text-sm sm:h-9"
          aria-label="Search the catalogue"
        />
      </div>

      <div className="flex flex-wrap gap-2">
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

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              startTransition(() => router.replace("/", { scroll: false }));
            }}
          >
            <X className="size-3.5" />
            Clear {activeCount}
          </Button>
        )}
      </div>
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
      <SelectTrigger size="sm" className="max-w-44 text-xs sm:max-w-52 sm:text-sm">
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

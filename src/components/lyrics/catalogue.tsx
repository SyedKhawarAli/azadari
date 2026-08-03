"use client";

import { Suspense, useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { LyricCard } from "@/components/lyrics/lyric-card";
import { LyricFilters } from "@/components/lyrics/lyric-filters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LYRIC_SORT_OPTIONS,
  listContributors,
  listIslamicEvents,
  listLyrics,
  listPersonalities,
  parseLyricSort,
} from "@/lib/db/queries";
import { LYRIC_TYPES } from "@/lib/taxonomy";
import type { LyricFilters as Filters, LyricType } from "@/types";

function readParam(params: URLSearchParams, key: string): string | undefined {
  const value = params.get(key);
  return value && value.length > 0 ? value : undefined;
}

function CatalogueBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const rawType = readParam(searchParams, "type");
  const sort = parseLyricSort(searchParams.get("sort"));

  const filters: Filters = useMemo(
    () => ({
      q: readParam(searchParams, "q"),
      type: LYRIC_TYPES.includes(rawType as LyricType) ? (rawType as LyricType) : undefined,
      personality: readParam(searchParams, "personality"),
      event: readParam(searchParams, "event"),
      poet: readParam(searchParams, "poet"),
      reciter: readParam(searchParams, "reciter"),
    }),
    [searchParams, rawType],
  );

  const lyrics = useMemo(
    () => listLyrics(filters, sort),
    [filters, sort],
  );

  const personalities = useMemo(() => listPersonalities().map((p) => p.name), []);
  const events = useMemo(() => listIslamicEvents().map((e) => e.event_name), []);
  const contributors = useMemo(() => listContributors(), []);

  const applySort = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!next || next === "title") params.delete("sort");
    else params.set("sort", next);
    const search = params.toString();
    startTransition(() => router.replace(search ? `/?${search}` : "/", { scroll: false }));
  };

  return (
    <>
      <LyricFilters
        personalities={personalities}
        events={events}
        poets={contributors.poets}
        reciters={contributors.reciters}
      />

      <div
        className="mt-3 mb-2 flex flex-wrap items-center justify-between gap-2 sm:mt-4 sm:mb-3"
        data-pending={pending ? "" : undefined}
      >
        <p className="text-[0.7rem] text-muted-foreground sm:text-xs">
          {lyrics.length} {lyrics.length === 1 ? "result" : "results"}
        </p>

        {!filters.q && (
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="size-3.5 text-muted-foreground" aria-hidden />
            <Select
              value={sort}
              onValueChange={(value) => applySort(String(value))}
              items={LYRIC_SORT_OPTIONS}
            >
              <SelectTrigger
                size="sm"
                className="h-7 max-w-40 text-xs sm:max-w-44"
                aria-label="Sort results"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {LYRIC_SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {lyrics.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center sm:p-10">
          <p className="text-sm font-medium">Nothing matches these filters</p>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Try clearing a filter or searching for a different poet or reciter.
          </p>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
          {lyrics.map((lyric) => (
            <LyricCard key={lyric.id} lyric={lyric} />
          ))}
        </div>
      )}
    </>
  );
}

export function Catalogue() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-4 sm:py-6">
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <CatalogueBody />
      </Suspense>
    </div>
  );
}

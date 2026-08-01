"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/lyrics/favorite-button";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { titleForScript } from "@/lib/text-title";
import { cn } from "@/lib/utils";
import { useReaderPreferences } from "@/stores/reader-preferences";
import type { Lyric } from "@/types";

export function LyricCard({ lyric }: { lyric: Lyric }) {
  const hydrated = useHydrated();
  const { script, showBothScripts } = useReaderPreferences();
  const titleView = titleForScript(
    lyric,
    hydrated ? script : "urdu",
    hydrated && showBothScripts,
  );
  const byline = [lyric.poet_name, lyric.reciter_name].filter(Boolean).join(" · ");
  const tags = lyric.personalities.slice(0, 2);
  const extraTags = Math.max(0, lyric.personalities.length - 2);

  return (
    <Link
      href={`/lyrics/${lyric.id}`}
      className="group relative block rounded-lg border px-2.5 py-2 transition-colors hover:border-foreground/25 hover:bg-muted/40 sm:px-3.5 sm:py-3"
    >
      <FavoriteButton
        lyric={lyric}
        className={cn(
          "absolute top-1.5 z-10",
          titleView.rtlPrimary ? "left-1.5" : "right-1.5",
        )}
      />

      <h3
        className={cn(
          titleView.rtlPrimary
            ? "urdu-title ps-8 text-sm sm:text-base"
            : "pe-8 text-xs font-semibold leading-snug sm:text-sm",
        )}
      >
        {titleView.primary}
      </h3>
      {titleView.secondary && (
        <p className="mt-0.5 pe-8 text-[0.65rem] text-muted-foreground sm:text-xs">
          {titleView.secondary}
        </p>
      )}

      <div
        className={cn(
          "mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[0.65rem] text-muted-foreground sm:mt-2.5 sm:text-xs",
          titleView.rtlPrimary && "justify-end",
        )}
      >
        <Badge
          variant="secondary"
          className="h-4 px-1.5 text-[0.6rem] font-normal sm:h-5 sm:text-[0.65rem]"
        >
          {lyric.type}
        </Badge>
        {lyric.scale_pitch && <span className="tabular-nums">{lyric.scale_pitch}</span>}
        {byline && (
          <span className="hidden truncate sm:inline">{byline}</span>
        )}
        {tags.length > 0 && (
          <span className="truncate">
            {tags.join(" · ")}
            {extraTags > 0 ? ` +${extraTags}` : ""}
          </span>
        )}
      </div>
    </Link>
  );
}

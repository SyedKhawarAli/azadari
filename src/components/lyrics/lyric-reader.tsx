"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Settings2, Share2, Type } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/lyrics/favorite-button";
import { LyricBody } from "@/components/lyrics/lyric-body";
import { LyricCacheSync } from "@/components/lyrics/lyric-cache-sync";
import { MediaLink } from "@/components/lyrics/media-link";
import { ScriptToggle } from "@/components/lyrics/script-toggle";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useWakeLock } from "@/lib/hooks/use-wake-lock";
import { shareHref } from "@/lib/planner/share-codec";
import { titleForScript } from "@/lib/text-title";
import { cn } from "@/lib/utils";
import {
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  useReaderPreferences,
} from "@/stores/reader-preferences";
import type { LyricWithBands } from "@/types";

function lyricShareUrl(id: string) {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
  const path = `${base}/lyrics/${id}`;
  if (typeof window === "undefined") {
    const origin = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
    return origin ? `${origin}${path}` : path;
  }
  return `${window.location.origin}${path}`;
}

function LyricBackLinkFallback() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-3.5" />
      <span className="hidden sm:inline">Back to library</span>
      <span className="sm:hidden">Library</span>
    </Link>
  );
}

function LyricBackLink() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const programmeHash = searchParams.get("h");
  const eventId = searchParams.get("eid");

  const back = useMemo(() => {
    if (from === "programme" && programmeHash) {
      return {
        href: shareHref(programmeHash),
        long: "Back to programme",
        short: "Programme",
      };
    }
    if (from === "planner" && eventId) {
      return {
        href: `/planner/edit?id=${encodeURIComponent(eventId)}`,
        long: "Back to programme",
        short: "Programme",
      };
    }
    if (from === "planner") {
      return {
        href: "/planner",
        long: "Back to planner",
        short: "Planner",
      };
    }
    return {
      href: "/",
      long: "Back to library",
      short: "Library",
    };
  }, [from, programmeHash, eventId]);

  return (
    <Link
      href={back.href}
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-3.5" />
      <span className="hidden sm:inline">{back.long}</span>
      <span className="sm:hidden">{back.short}</span>
    </Link>
  );
}

export function LyricReader({ lyric }: { lyric: LyricWithBands }) {
  const hydrated = useHydrated();
  const { supported, enabled, setLock } = useWakeLock();
  const { fontScale, setFontScale, script, showBothScripts } = useReaderPreferences();
  const activeScale = hydrated ? fontScale : 1.2;
  const romanAvailable =
    Boolean(lyric.title_roman?.trim()) ||
    lyric.bands.some((band) => Boolean(band.roman_misras?.length));
  const titleView = titleForScript(
    lyric,
    hydrated ? script : "urdu",
    hydrated && showBothScripts,
  );
  const tags = [...lyric.personalities, ...lyric.events];
  const byline = [lyric.poet_name, lyric.reciter_name].filter(Boolean).join(" · ");

  const shareLyric = async () => {
    const url = lyricShareUrl(lyric.id);
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title: titleView.primary, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied.");
      } catch {
        toast.error("Could not share this lyric.");
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-3 py-3 sm:px-4 sm:py-5">
      <LyricCacheSync lyric={lyric} />

      <div className="mb-2 flex items-center justify-between gap-2">
        <Suspense fallback={<LyricBackLinkFallback />}>
          <LyricBackLink />
        </Suspense>

        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Share lyric"
            onClick={() => void shareLyric()}
          >
            <Share2 className="size-3.5" />
          </Button>

          <Popover>
            <PopoverTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Reading options" />
              }
            >
              <Settings2 className="size-3.5" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 space-y-4 p-4">
              <div className="space-y-2">
                <p className="text-xs font-medium">Script</p>
                <ScriptToggle romanAvailable={romanAvailable} size="sm" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label className="inline-flex items-center gap-1.5 text-xs">
                    <Type className="size-3.5" />
                    Font size
                  </Label>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {activeScale.toFixed(1)}×
                  </span>
                </div>
                <Slider
                  value={[activeScale]}
                  min={FONT_SCALE_MIN}
                  max={FONT_SCALE_MAX}
                  step={0.1}
                  onValueChange={(value) =>
                    setFontScale(Array.isArray(value) ? value[0] : Number(value))
                  }
                  aria-label="Font size"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor="wake-lock" className="text-xs">
                    Keep screen awake
                  </Label>
                  <p className="text-[0.7rem] text-muted-foreground">
                    {supported
                      ? "Useful while reading in a hall."
                      : "Not available in this browser."}
                  </p>
                </div>
                <Switch
                  id="wake-lock"
                  checked={enabled}
                  disabled={!supported}
                  onCheckedChange={(checked) => void setLock(Boolean(checked))}
                />
              </div>
            </PopoverContent>
          </Popover>

          <FavoriteButton lyric={lyric} size="icon-sm" />
        </div>
      </div>

      <header className={cn(titleView.rtlPrimary && "text-right")}>
        <h1
          className={cn(
            titleView.rtlPrimary
              ? "urdu-title text-lg leading-snug sm:text-2xl md:text-3xl"
              : "text-base font-semibold tracking-tight sm:text-xl",
          )}
        >
          {titleView.primary}
        </h1>
        {titleView.secondary && (
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">{titleView.secondary}</p>
        )}

        <div
          className={cn(
            "mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground",
            titleView.rtlPrimary && "justify-end",
          )}
        >
          <Badge variant="secondary" className="h-5 px-1.5 text-[0.65rem] font-normal">
            {lyric.type}
          </Badge>
          {lyric.scale_pitch && (
            <span className="tabular-nums">{lyric.scale_pitch}</span>
          )}
          {byline && <span className="truncate">{byline}</span>}
          <MediaLink
            urls={lyric.media_urls}
            url={lyric.audio_url}
            compact
            className={cn(titleView.rtlPrimary && "justify-end")}
          />
        </div>

        {tags.length > 0 && (
          <div
            className={cn(
              "mt-1.5 flex flex-wrap gap-1",
              titleView.rtlPrimary && "justify-end",
            )}
          >
            {lyric.personalities.map((name) => (
              <Link key={name} href={`/?personality=${encodeURIComponent(name)}`}>
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[0.65rem] font-normal hover:bg-secondary"
                >
                  {name}
                </Badge>
              </Link>
            ))}
            {lyric.events.map((name) => (
              <Link key={name} href={`/?event=${encodeURIComponent(name)}`}>
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[0.65rem] font-normal hover:bg-secondary"
                >
                  {name}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </header>

      <LyricBody bands={lyric.bands} applyFontScale className="mt-4 border-t pt-4 pb-16 sm:mt-5" />
    </div>
  );
}

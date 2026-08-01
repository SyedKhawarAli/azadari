"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Heart, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { FavoriteButton } from "@/components/lyrics/favorite-button";
import { db } from "@/lib/offline/db";
import { isRtlText } from "@/lib/text";
import { cn } from "@/lib/utils";

export function FavoritesList() {
  const favorites = useLiveQuery(
    async () => (db ? db.favorites.orderBy("addedAt").reverse().toArray() : []),
    [],
    [],
  );

  if (favorites.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <Heart className="mx-auto size-8 text-muted-foreground/50" />
        <p className="mt-3 text-sm font-medium">No favourites yet</p>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Tap the heart on any lyric. Favourites stay on this device.
        </p>
        <Link href="/" className={cn(buttonVariants({ size: "sm" }), "mt-4")}>
          Browse the library
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y rounded-lg border">
      {favorites.map((favorite) => (
        <li key={favorite.lyricId} className="flex items-center gap-3 px-3 py-3">
          <Link href={`/lyrics/${favorite.lyricId}`} className="min-w-0 flex-1 hover:underline">
            <p className={cn(isRtlText(favorite.title) ? "urdu-title text-sm sm:text-base" : "text-xs font-medium sm:text-sm")}>
              {favorite.title}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary">{favorite.type}</Badge>
              {(favorite.poetName || favorite.reciterName) && (
                <span className="text-xs text-muted-foreground">
                  {[favorite.poetName, favorite.reciterName].filter(Boolean).join(" · ")}
                </span>
              )}
            </div>
          </Link>
          <Link
            href={`/planner?add=${favorite.lyricId}`}
            className={buttonVariants({ variant: "outline", size: "icon-sm" })}
            aria-label={`Add ${favorite.title} to a programme`}
          >
            <Plus className="size-3.5" />
          </Link>
          <FavoriteButton
            lyric={{
              id: favorite.lyricId,
              title: favorite.title,
              type: favorite.type,
              poet_name: favorite.poetName,
              reciter_name: favorite.reciterName,
            }}
          />
        </li>
      ))}
    </ul>
  );
}

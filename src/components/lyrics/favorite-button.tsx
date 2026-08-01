"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { db, toggleFavorite } from "@/lib/offline/db";
import type { Lyric } from "@/types";

type FavoriteTarget = Pick<Lyric, "id" | "title" | "type" | "poet_name" | "reciter_name">;

export function FavoriteButton({
  lyric,
  className,
  size = "icon-sm",
}: {
  lyric: FavoriteTarget;
  className?: string;
  size?: "icon-sm" | "icon";
}) {
  const isFavorite = useLiveQuery(
    async () => (db ? Boolean(await db.favorites.get(lyric.id)) : false),
    [lyric.id],
    false,
  );

  const handleClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const added = await toggleFavorite(lyric);
    toast.success(added ? "Saved to favourites." : "Removed from favourites.");
  };

  return (
    <Button
      variant="ghost"
      size={size}
      aria-label={isFavorite ? `Remove ${lyric.title} from favourites` : `Save ${lyric.title} to favourites`}
      aria-pressed={isFavorite}
      onClick={handleClick}
      className={className}
    >
      <Heart className={cn("size-3.5", isFavorite && "fill-current text-rose-500")} />
    </Button>
  );
}

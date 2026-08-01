import { ExternalLink, Play } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { classifyMediaUrl, mediaLabel } from "@/lib/media";
import { resolveMediaUrls } from "@/lib/media-urls";
import { cn } from "@/lib/utils";

function singleLabel(url: string, index: number, total: number) {
  const kind = classifyMediaUrl(url);
  if (!kind) return `Open link ${index + 1}`;
  if (total === 1) return mediaLabel(kind);
  return `${mediaLabel(kind)} ${index + 1}`;
}

export function MediaLink({
  url,
  urls,
  className,
  compact = false,
}: {
  /** @deprecated Prefer `urls` — kept for call sites that still pass one link. */
  url?: string | null;
  urls?: string[] | null;
  className?: string;
  /** Inline text links for tight headers. */
  compact?: boolean;
}) {
  const list = resolveMediaUrls({
    media_urls: urls ?? undefined,
    audio_url: url ?? null,
  });
  if (list.length === 0) return null;

  // Direct audio files still get an inline player; everything else is a link.
  if (list.length === 1 && classifyMediaUrl(list[0]) === "audio") {
    return (
      <div className={cn("space-y-2", className)}>
        <p className="text-xs text-muted-foreground">{mediaLabel("audio")}</p>
        <audio src={list[0]} controls preload="none" className="w-full" />
      </div>
    );
  }

  if (compact) {
    return (
      <span className={cn("inline-flex flex-wrap items-center gap-x-2 gap-y-0.5", className)}>
        {list.map((href, index) => {
          const kind = classifyMediaUrl(href);
          return (
            <a
              key={`${href}-${index}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-foreground underline-offset-2 hover:underline"
            >
              {kind === "youtube" || kind === "tiktok" ? (
                <Play className="size-3" />
              ) : (
                <ExternalLink className="size-3" />
              )}
              {singleLabel(href, index, list.length)}
            </a>
          );
        })}
      </span>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {list.map((href, index) => {
        const kind = classifyMediaUrl(href);
        return (
          <a
            key={`${href}-${index}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {kind === "youtube" || kind === "tiktok" ? (
              <Play className="size-3.5" />
            ) : (
              <ExternalLink className="size-3.5" />
            )}
            {singleLabel(href, index, list.length)}
          </a>
        );
      })}
    </div>
  );
}

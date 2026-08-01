"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { resolveLyricRef } from "@/lib/db/queries";
import { decodeShareProgramme, shareUrl } from "@/lib/planner/share-codec";
import { isRtlText } from "@/lib/text";
import { cn } from "@/lib/utils";

type ResolvedItem = {
  id: string;
  title: string;
  note: string | null;
  lyricId: string | null;
  kind: string;
};

export function PublicEventView() {
  const [hash, setHash] = useState("");

  useEffect(() => {
    const read = () => setHash(window.location.hash);
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const programme = useMemo(() => decodeShareProgramme(hash), [hash]);

  const shareLink = useMemo(() => {
    if (!hash) return "";
    return shareUrl(hash.replace(/^#/, ""));
  }, [hash]);

  if (!hash) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="text-sm font-medium">No programme in this link</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Open a share link from the planner, or ask the organiser to copy theirs again.
        </p>
        <Link href="/" className={cn(buttonVariants({ size: "sm" }), "mt-4")}>
          Browse library
        </Link>
      </div>
    );
  }

  if (!programme) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="text-sm font-medium">Could not read this programme</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The link may be truncated or corrupted. Ask the organiser to share it again.
        </p>
        <Link href="/" className={cn(buttonVariants({ size: "sm" }), "mt-4")}>
          Browse library
        </Link>
      </div>
    );
  }

  const items: ResolvedItem[] = programme.i.map((item, index) => {
    const lyric = resolveLyricRef(item.l);
    return {
      id: `${index}-${item.l ?? item.t}`,
      title: lyric?.title ?? item.t ?? "Untitled",
      note: item.n ?? null,
      lyricId: lyric?.id ?? item.l ?? null,
      kind: item.l ? "Lyric" : "Segment",
    };
  });

  return (
    <EventSurface
      title={programme.t}
      date={programme.d ?? null}
      items={items}
      shareUrl={shareLink}
      programmeHash={hash.replace(/^#/, "")}
    />
  );
}

function EventSurface({
  title,
  date,
  items,
  shareUrl: url,
  programmeHash,
}: {
  title: string;
  date: string | null;
  items: ResolvedItem[];
  shareUrl: string;
  programmeHash: string;
}) {
  const shareProgramme = async () => {
    if (!url) return;
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title, url, text: `Majlis programme: ${title}` });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Share link copied.");
      } catch {
        toast.error("Could not share this programme.");
      }
    }
  };

  return (
    <div className="space-y-5 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] tracking-wide text-muted-foreground uppercase sm:text-xs">
            Majlis programme
          </p>
          <h1 className="mt-1 text-lg font-semibold tracking-tight sm:text-2xl">{title}</h1>
          {date && <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">{date}</p>}
          <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
          {url && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 print-hidden"
              onClick={() => void shareProgramme()}
            >
              <Share2 className="size-3.5" />
              Share programme
            </Button>
          )}
        </div>
        {url && (
          <div className="shrink-0 self-start rounded-lg border bg-white p-2 sm:p-3 print-hidden">
            <QRCodeSVG value={url} size={112} level="M" includeMargin />
          </div>
        )}
      </div>

      <ol className="space-y-2.5 sm:space-y-3">
        {items.map((item, index) => {
          const rtlTitle = isRtlText(item.title);
          const rtlNote = isRtlText(item.note);
          const row = (
            <>
              <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground sm:w-6 sm:text-sm">
                {index + 1}.
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <p
                    className={cn(
                      "min-w-0 flex-1",
                      rtlTitle
                        ? "urdu-title text-base sm:text-lg"
                        : "text-sm font-medium sm:text-base",
                    )}
                    dir={rtlTitle ? "rtl" : undefined}
                    lang={rtlTitle ? "ur" : undefined}
                  >
                    {item.title}
                  </p>
                  <Badge
                    variant="outline"
                    className="h-5 shrink-0 px-1.5 text-[0.65rem] font-normal"
                  >
                    {item.kind}
                  </Badge>
                </div>
                {item.note && (
                  <p
                    className={cn(
                      "mt-1 text-xs text-muted-foreground sm:text-sm",
                      rtlNote && "urdu-title",
                    )}
                    dir={rtlNote ? "rtl" : undefined}
                    lang={rtlNote ? "ur" : undefined}
                  >
                    {item.note}
                  </p>
                )}
              </div>
            </>
          );

          return (
            <li key={item.id} className="border-b pb-2.5 sm:pb-3">
              {item.lyricId ? (
                <Link
                  href={`/lyrics/${item.lyricId}?from=programme&h=${encodeURIComponent(programmeHash)}`}
                  className="-mx-2 flex gap-2 rounded-md px-2 py-1.5 sm:gap-3 sm:py-2 hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {row}
                </Link>
              ) : (
                <div className="flex gap-2 sm:gap-3">{row}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { getChorus, getVerseBands } from "@/lib/db/payload";
import { BAND_TYPE_LABELS } from "@/lib/taxonomy";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useReaderPreferences } from "@/stores/reader-preferences";
import type { LyricBand } from "@/types";

interface LyricBodyProps {
  bands: LyricBand[];
  /** When true, apply the reader's font-size preference. */
  applyFontScale?: boolean;
  className?: string;
}

export function LyricBody({
  bands,
  applyFontScale = false,
  className,
}: LyricBodyProps) {
  const { script, showBothScripts, fontScale } = useReaderPreferences();
  const hydrated = useHydrated();

  const activeScript = hydrated ? script : "urdu";
  const showBoth = hydrated && showBothScripts;
  const scale = applyFontScale && hydrated ? fontScale : 1;

  const chorus = getChorus(bands);
  const verses = getVerseBands(bands);

  // Matla and Saani Matla are named, so only plain stanzas carry a number.
  const labels = verses.reduce<string[]>((accumulated, band) => {
    if (band.band_type !== "stanza") {
      accumulated.push(BAND_TYPE_LABELS[band.band_type]);
      return accumulated;
    }
    const stanzaNumber = accumulated.filter((label) =>
      label.startsWith(BAND_TYPE_LABELS.stanza),
    ).length;
    accumulated.push(`${BAND_TYPE_LABELS.stanza} ${stanzaNumber + 1}`);
    return accumulated;
  }, []);

  return (
    <div
      className={cn("lyric-body space-y-5 sm:space-y-6", className)}
      style={{ "--reader-scale": scale } as CSSProperties}
    >
      {chorus && (
        <div className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5 sm:px-4 sm:py-3">
          <p className="mb-1 text-[0.65em] font-medium tracking-wide text-muted-foreground uppercase">
            Tip / Astai
          </p>
          <Misras band={chorus} script={activeScript} showBoth={showBoth} />
        </div>
      )}

      <div className="space-y-5 sm:space-y-6">
        {verses.map((band, index) => (
          <section key={band.id} className="space-y-1">
            <p className="text-[0.65em] font-medium tracking-wide text-muted-foreground uppercase">
              {labels[index]}
            </p>
            <Misras band={band} script={activeScript} showBoth={showBoth} />
          </section>
        ))}
      </div>
    </div>
  );
}

function Misras({
  band,
  script,
  showBoth,
}: {
  band: LyricBand;
  script: "urdu" | "roman";
  showBoth: boolean;
}) {
  const hasRoman = Boolean(band.roman_misras?.length);
  const showRoman = hasRoman && (showBoth || script === "roman");
  // Most of the library is Urdu-only, so fall back rather than render nothing.
  const showUrdu = showBoth || script === "urdu" || !hasRoman;

  return (
    <div className="space-y-1 sm:space-y-1.5">
      {band.urdu_misras.map((urdu, index) => (
        <div key={index} className={cn(showBoth && "border-l-2 border-muted pl-2 sm:pl-3")}>
          {showUrdu && (
            <p className="urdu-line text-[1.15em] sm:text-[1.35em]">{urdu}</p>
          )}
          {showRoman && (
            <p
              className={cn(
                "text-[0.95em] leading-relaxed sm:text-[1.05em]",
                showBoth && "text-muted-foreground",
              )}
            >
              {band.roman_misras?.[index]}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

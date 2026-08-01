import type { LyricBand, LyricImportPayload, LyricWithBands } from "@/types";
import { resolveMediaUrls } from "@/lib/media-urls";

/**
 * Flattens the documented import shape (separate `astai_chorus` + `structure`
 * with per-misra objects) into `lyric_bands` rows, where the chorus is band 0.
 */
export function payloadToBands(
  payload: LyricImportPayload,
): Omit<LyricBand, "id">[] {
  const bands: Omit<LyricBand, "id">[] = [];

  if (payload.astai_chorus?.urdu?.length) {
    bands.push({
      band_number: 0,
      band_type: "tip_chorus",
      urdu_misras: payload.astai_chorus.urdu,
      roman_misras: payload.astai_chorus.roman ?? null,
    });
  }

  for (const band of payload.structure ?? []) {
    const misras = [...band.misras].sort((a, b) => a.misra_number - b.misra_number);
    bands.push({
      band_number: band.band_number,
      band_type: band.band_type,
      urdu_misras: misras.map((m) => m.urdu),
      roman_misras: misras.some((m) => m.roman) ? misras.map((m) => m.roman ?? "") : null,
    });
  }

  return bands;
}

export function payloadToLyric(payload: LyricImportPayload, id: string): LyricWithBands {
  const mediaUrls = resolveMediaUrls(payload);
  return {
    id,
    title: payload.title,
    title_roman: payload.title_roman?.trim() || null,
    type: payload.type,
    poet_name: payload.poet_name ?? null,
    reciter_name: payload.reciter_name ?? null,
    scale_pitch: payload.scale_pitch ?? null,
    audio_url: mediaUrls[0] ?? null,
    media_urls: mediaUrls,
    created_at: new Date(0).toISOString(),
    personalities: payload.personalities ?? [],
    events: payload.events ?? [],
    bands: payloadToBands(payload).map((band, index) => ({
      ...band,
      id: `${id}-band-${index}`,
    })),
  };
}

export function sortBands(bands: LyricBand[]) {
  return [...bands].sort((a, b) => a.band_number - b.band_number);
}

export function getChorus(bands: LyricBand[]) {
  return bands.find((band) => band.band_type === "tip_chorus") ?? null;
}

export function getVerseBands(bands: LyricBand[]) {
  return sortBands(bands.filter((band) => band.band_type !== "tip_chorus"));
}

import { STARTER_LIBRARY } from "@/lib/db/starter-library";
import type { LyricWithBands } from "@/types";

/** Strip diacritics / honorifics and normalize common Urdu letter variants. */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u0610-\u061A\u06D6-\u06ED]/g, "")
    .replace(/\u0640/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/[يى]/g, "ی")
    .replace(/[ةه]/g, "ہ")
    .replace(/ك/g, "ک")
    .toLowerCase()
    .trim();
}

export function tokenizeSearchQuery(query: string): string[] {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];
  return normalized.split(/\s+/).filter(Boolean);
}

function buildLyricSearchBlob(lyric: LyricWithBands): string {
  const parts: string[] = [
    lyric.title,
    lyric.title_roman ?? "",
    lyric.type,
    lyric.poet_name ?? "",
    lyric.reciter_name ?? "",
    ...lyric.personalities,
    ...lyric.events,
  ];

  for (const band of lyric.bands) {
    parts.push(...band.urdu_misras);
    if (band.roman_misras) parts.push(...band.roman_misras);
  }

  return normalizeSearchText(parts.filter(Boolean).join(" "));
}

const searchBlobById = new Map<string, string>();

function getSearchBlob(lyricId: string): string {
  if (searchBlobById.size === 0) {
    for (const lyric of STARTER_LIBRARY) {
      searchBlobById.set(lyric.id, buildLyricSearchBlob(lyric));
    }
  }
  return searchBlobById.get(lyricId) ?? "";
}

/**
 * True when every query token appears in the lyric’s metadata or body
 * (Astai + misras, Urdu and Roman).
 */
export function matchesLyricQuery(
  lyricIdOrLyric: string | { id: string },
  query: string | undefined | null,
): boolean {
  const tokens = tokenizeSearchQuery(query ?? "");
  if (tokens.length === 0) return true;

  const id = typeof lyricIdOrLyric === "string" ? lyricIdOrLyric : lyricIdOrLyric.id;
  const blob = getSearchBlob(id);
  if (!blob) return false;
  return tokens.every((token) => blob.includes(token));
}

/**
 * Calculate relevance score for a lyric based on where the search query matches.
 * Higher scores indicate better matches.
 * - Title match: 100 points
 * - Title roman match: 90 points
 * - Content match only: 0 points
 */
export function calculateRelevanceScore(
  lyric: { title: string; title_roman?: string | null },
  query: string | undefined | null,
): number {
  const tokens = tokenizeSearchQuery(query ?? "");
  if (tokens.length === 0) return 0;

  const normalizedTitle = normalizeSearchText(lyric.title);
  const normalizedTitleRoman = normalizeSearchText(lyric.title_roman ?? "");

  let score = 0;
  for (const token of tokens) {
    if (normalizedTitle.includes(token)) {
      score += 100;
    } else if (normalizedTitleRoman && normalizedTitleRoman.includes(token)) {
      score += 90;
    }
  }

  return score;
}

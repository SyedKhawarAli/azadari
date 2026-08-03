import { STARTER_LIBRARY } from "@/lib/db/starter-library";
import type { LyricWithBands } from "@/types";

/**
 * Bidirectional Roman spelling groups that vowel-folding alone does not unify
 * (e.g. hussain → hssn vs husain → hsn).
 */
const ROMAN_ALIAS_GROUPS: readonly (readonly string[])[] = [
  ["hussain", "husain", "hosein", "hussayn"],
  ["zahra", "zahraa", "zehra"],
  ["zainab", "zenab", "zaynib"],
  ["fatima", "fatimah", "fatmh"],
  ["abbas", "abas"],
  ["qasim", "qasm"],
  ["jafar", "jaafar", "jafr"],
];

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

/**
 * Fold Roman Urdu spelling noise by stripping vowels from longer Latin words.
 * `akbar` and `akbr` both become `kbr`. Short tokens stay unchanged so
 * `ali` does not collapse to `l`.
 */
export function foldRomanToken(token: string): string {
  if (!/^[a-z][a-z'-]*$/i.test(token)) return token;
  if (token.length < 4) return token;
  const folded = token.replace(/[aeiou]/gi, "");
  return folded.length >= 3 ? folded : token;
}

/** Apply {@link foldRomanToken} to every Latin word in a string. */
export function foldRomanInText(text: string): string {
  return text.replace(/[a-z]+(?:'[a-z]+)*/gi, (word) => foldRomanToken(word));
}

function expandAliases(token: string): string[] {
  const lower = token.toLowerCase();
  for (const group of ROMAN_ALIAS_GROUPS) {
    if (group.includes(lower)) {
      return [...new Set([lower, ...group])];
    }
  }
  return [lower];
}

/** Query variants to try for one token: aliases, then Roman vowel-folding. */
function tokenSearchVariants(token: string): string[] {
  return [...new Set(expandAliases(token).map(foldRomanToken))];
}

export function tokenizeSearchQuery(query: string): string[] {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];
  const tokens = normalized.split(/\s+/).filter(Boolean);
  return [...new Set(tokens)];
}

/** Normalized + Roman-folded text used for matching. */
export function prepareSearchText(value: string): string {
  return foldRomanInText(normalizeSearchText(value));
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

  return prepareSearchText(parts.filter(Boolean).join(" "));
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

function textMatchesToken(haystack: string, token: string): boolean {
  return tokenSearchVariants(token).some((variant) => haystack.includes(variant));
}

/**
 * True when every query token appears in the lyric's metadata or body
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
  return tokens.every((token) => textMatchesToken(blob, token));
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

  const normalizedTitle = prepareSearchText(lyric.title);
  const normalizedTitleRoman = prepareSearchText(lyric.title_roman ?? "");

  let score = 0;
  for (const token of tokens) {
    if (textMatchesToken(normalizedTitle, token)) {
      score += 100;
    } else if (normalizedTitleRoman && textMatchesToken(normalizedTitleRoman, token)) {
      score += 90;
    }
  }

  return score;
}

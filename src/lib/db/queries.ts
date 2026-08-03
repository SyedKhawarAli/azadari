import { STARTER_LIBRARY } from "./starter-library";
import { matchesLyricQuery, calculateRelevanceScore } from "@/lib/search/lyrics";
import { PERSONALITIES, ISLAMIC_EVENTS, LYRIC_TYPES } from "@/lib/taxonomy";
import type {
  Lyric,
  LyricFilters,
  LyricSort,
  LyricWithBands,
  Personality,
  IslamicEvent,
} from "@/types";

export const LYRIC_SORT_OPTIONS: { value: LyricSort; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "type", label: "Type" },
  { value: "poet", label: "Poet" },
  { value: "reciter", label: "Reciter" },
];

function compareNullable(a: string | null | undefined, b: string | null | undefined) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b, "ur", { sensitivity: "base" });
}

export function parseLyricSort(value: string | undefined | null): LyricSort {
  if (LYRIC_SORT_OPTIONS.some((option) => option.value === value)) {
    return value as LyricSort;
  }
  return "title";
}

export function sortLyrics<T extends Lyric>(lyrics: T[], sort: LyricSort): T[] {
  const typed = [...lyrics];
  typed.sort((a, b) => {
    switch (sort) {
      case "title":
        return a.title.localeCompare(b.title, "ur", { sensitivity: "base" });
      case "type": {
        const typeOrder =
          LYRIC_TYPES.indexOf(a.type) - LYRIC_TYPES.indexOf(b.type) ||
          a.title.localeCompare(b.title, "ur", { sensitivity: "base" });
        return typeOrder;
      }
      case "poet":
        return (
          compareNullable(a.poet_name, b.poet_name) ||
          a.title.localeCompare(b.title, "ur", { sensitivity: "base" })
        );
      case "reciter":
        return (
          compareNullable(a.reciter_name, b.reciter_name) ||
          a.title.localeCompare(b.title, "ur", { sensitivity: "base" })
        );
      default:
        return 0;
    }
  });
  return typed;
}

function toLyric(lyric: LyricWithBands): Lyric {
  return {
    id: lyric.id,
    title: lyric.title,
    title_roman: lyric.title_roman,
    type: lyric.type,
    poet_name: lyric.poet_name,
    reciter_name: lyric.reciter_name,
    scale_pitch: lyric.scale_pitch,
    audio_url: lyric.audio_url,
    media_urls: lyric.media_urls ?? (lyric.audio_url ? [lyric.audio_url] : []),
    created_at: lyric.created_at,
    personalities: lyric.personalities,
    events: lyric.events,
  };
}

export function matchesFilters(lyric: Lyric, filters: LyricFilters) {
  if (filters.type && lyric.type !== filters.type) return false;
  if (filters.personality && !lyric.personalities.includes(filters.personality)) return false;
  if (filters.event && !lyric.events.includes(filters.event)) return false;
  if (filters.poet && lyric.poet_name !== filters.poet) return false;
  if (filters.reciter && lyric.reciter_name !== filters.reciter) return false;
  if (filters.q && !matchesLyricQuery(lyric.id, filters.q)) return false;
  return true;
}

export function listLyrics(filters: LyricFilters = {}, sort: LyricSort = "title"): Lyric[] {
  const filteredLyrics = STARTER_LIBRARY.filter((lyric) => matchesFilters(lyric, filters)).map(toLyric);
  
  if (filters.q) {
    return filteredLyrics.sort((a, b) => {
      const scoreA = calculateRelevanceScore(a, filters.q);
      const scoreB = calculateRelevanceScore(b, filters.q);
      
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      
      return a.title.localeCompare(b.title, "ur", { sensitivity: "base" });
    });
  }
  
  return sortLyrics(filteredLyrics, sort);
}

/** Resolve a full UUID or short share-link prefix to a catalogue lyric. */
export function resolveLyricRef(ref: string | null | undefined): LyricWithBands | null {
  if (!ref) return null;
  const exact = STARTER_LIBRARY.find((lyric) => lyric.id === ref);
  if (exact) return exact;
  if (ref.length >= 8) {
    const matches = STARTER_LIBRARY.filter((lyric) => lyric.id.startsWith(ref));
    if (matches.length === 1) return matches[0];
  }
  return null;
}

export function getLyric(id: string): LyricWithBands | null {
  return STARTER_LIBRARY.find((lyric) => lyric.id === id) ?? null;
}

export function listLyricsByIds(ids: string[]): Pick<Lyric, "id" | "title" | "type" | "poet_name" | "reciter_name">[] {
  return STARTER_LIBRARY.filter((lyric) => ids.includes(lyric.id)).map(
    ({ id, title, type, poet_name, reciter_name }) => ({
      id,
      title,
      type,
      poet_name,
      reciter_name,
    }),
  );
}

export function listPersonalities(): Personality[] {
  return PERSONALITIES.map((personality, index) => ({
    id: `local-personality-${index}`,
    name: personality.name,
    title_alias: personality.title_alias,
  }));
}

export function listIslamicEvents(): IslamicEvent[] {
  return ISLAMIC_EVENTS.map((event, index) => ({
    id: `local-event-${index}`,
    event_name: event.event_name,
    hijri_month: event.hijri_month,
    hijri_day: event.hijri_day,
  }));
}

export function listContributors(): { poets: string[]; reciters: string[] } {
  const poets = new Set<string>();
  const reciters = new Set<string>();
  for (const lyric of STARTER_LIBRARY) {
    if (lyric.poet_name) poets.add(lyric.poet_name);
    if (lyric.reciter_name) reciters.add(lyric.reciter_name);
  }
  return { poets: [...poets].sort(), reciters: [...reciters].sort() };
}

export function allLyricIds(): string[] {
  return STARTER_LIBRARY.map((lyric) => lyric.id);
}

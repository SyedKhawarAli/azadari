export type LyricType =
  | "Noha"
  | "Manqabat"
  | "Marsiya"
  | "Soz"
  | "Salam"
  | "Ziyarat"
  | "Hadith-e-Kisa";

export type BandType = "matla" | "saani_matla" | "stanza" | "tip_chorus";

export type Script = "urdu" | "roman";

export interface Personality {
  id: string;
  name: string;
  title_alias: string | null;
}

export interface IslamicEvent {
  id: string;
  event_name: string;
  hijri_month: number | null;
  hijri_day: number | null;
}

export interface LyricBand {
  id: string;
  band_number: number;
  band_type: BandType;
  urdu_misras: string[];
  roman_misras: string[] | null;
}

export interface Lyric {
  id: string;
  title: string;
  /** Optional Roman Urdu title; falls back to `title` when missing. */
  title_roman: string | null;
  type: LyricType;
  poet_name: string | null;
  reciter_name: string | null;
  scale_pitch: string | null;
  /** Primary / first media link — kept for Supabase column compatibility. */
  audio_url: string | null;
  /** All reference recordings or videos for this piece (YouTube, TikTok, etc.). */
  media_urls: string[];
  created_at: string;
  personalities: string[];
  events: string[];
}

export interface LyricWithBands extends Lyric {
  bands: LyricBand[];
}

/**
 * Shape used by lyric JSON files under content/lyrics and the built content/library.json.
 */
export interface LyricImportPayload {
  id?: string;
  title: string;
  title_roman?: string | null;
  type: LyricType;
  poet_name?: string | null;
  reciter_name?: string | null;
  scale_pitch?: string | null;
  audio_url?: string | null;
  media_urls?: string[];
  personalities?: string[];
  events?: string[];
  astai_chorus?: { urdu: string[]; roman?: string[] };
  structure: {
    band_number: number;
    band_type: Exclude<BandType, "tip_chorus">;
    misras: { misra_number: number; urdu: string; roman?: string }[];
  }[];
}

export interface LyricFilters {
  q?: string;
  type?: LyricType;
  personality?: string;
  event?: string;
  poet?: string;
  reciter?: string;
}

export type LyricSort = "title" | "type" | "poet" | "reciter";

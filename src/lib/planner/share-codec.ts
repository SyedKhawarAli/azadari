/** Compact Majlis programme payload for `/e#…` share links. */

import { STARTER_LIBRARY } from "@/lib/db/starter-library";

export type ShareProgrammeItem = {
  /** Lyric id (full UUID or short unique prefix) when the row is from the catalogue. */
  l?: string;
  /** Display title for segments, or legacy lyric title snapshot. */
  t?: string;
  /** Optional organiser note (truncated when encoding). */
  n?: string;
};

export type ShareProgramme = {
  /** Programme title. */
  t: string;
  /** ISO date string, if any. */
  d?: string;
  /** Ordered agenda items. */
  i: ShareProgrammeItem[];
};

const MAX_NOTE_CHARS = 120;
const MAX_PAYLOAD_CHARS = 1800;

export function appBasePath(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  // Runtime fallback when the env var was not inlined at build time
  // (e.g. Pages `configure-pages` set next.config basePath but not NEXT_PUBLIC_*).
  if (typeof document !== "undefined") {
    const script = document.querySelector('script[src*="/_next/"]');
    const src = script?.getAttribute("src");
    if (src) {
      try {
        const pathname = new URL(src, window.location.origin).pathname;
        const idx = pathname.indexOf("/_next/");
        if (idx > 0) return pathname.slice(0, idx).replace(/\/$/, "");
      } catch {
        /* ignore */
      }
    }
  }

  return "";
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(payload: string): Uint8Array {
  const padded = payload.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

/** Shortest unique id prefix for share links (falls back to full UUID on collision). */
export function compactLyricId(id: string): string {
  for (let len = 8; len < id.length; len += 1) {
    const prefix = id.slice(0, len);
    const matches = STARTER_LIBRARY.filter((lyric) => lyric.id.startsWith(prefix));
    if (matches.length === 1) return prefix;
  }
  return id;
}

export function encodeShareProgramme(input: {
  title: string;
  eventDate: string | null;
  items: { lyricId: string | null; title: string; note: string | null }[];
}): { hash: string; truncated: boolean } {
  let truncated = false;

  const programme: ShareProgramme = {
    t: truncate(input.title.trim() || "Majlis", 80),
    ...(input.eventDate ? { d: input.eventDate } : {}),
    i: input.items.map((item) => {
      const row: ShareProgrammeItem = {};
      if (item.lyricId) {
        // Titles are looked up from the static library — omit them from the URL.
        row.l = compactLyricId(item.lyricId);
      } else {
        row.t = truncate(item.title.trim() || "Untitled", 100);
      }
      if (item.note?.trim()) {
        const note = truncate(item.note.trim(), MAX_NOTE_CHARS);
        if (note.length < item.note.trim().length) truncated = true;
        row.n = note;
      }
      return row;
    }),
  };

  let json = JSON.stringify(programme);
  while (json.length > MAX_PAYLOAD_CHARS && programme.i.length > 0) {
    truncated = true;
    const last = programme.i[programme.i.length - 1];
    if (last.n) {
      delete last.n;
    } else {
      programme.i.pop();
    }
    json = JSON.stringify(programme);
  }

  const hash = toBase64Url(new TextEncoder().encode(json));
  return { hash, truncated };
}

export function decodeShareProgramme(hash: string): ShareProgramme | null {
  const raw = hash.replace(/^#/, "").trim();
  if (!raw) return null;

  try {
    const json = new TextDecoder().decode(fromBase64Url(raw));
    const data = JSON.parse(json) as ShareProgramme;
    if (!data || typeof data.t !== "string" || !Array.isArray(data.i)) return null;
    return {
      t: data.t,
      ...(typeof data.d === "string" ? { d: data.d } : {}),
      i: data.i
        .filter((item) => item && (typeof item.t === "string" || typeof item.l === "string"))
        .map((item) => ({
          ...(typeof item.t === "string" ? { t: item.t } : {}),
          ...(typeof item.l === "string" ? { l: item.l } : {}),
          ...(typeof item.n === "string" ? { n: item.n } : {}),
        })),
    };
  } catch {
    return null;
  }
}

/**
 * In-app href for `next/link` / the App Router.
 * Do not include basePath — Next.js prefixes it automatically.
 */
export function shareHref(hash: string): string {
  return `/e#${hash.replace(/^#/, "")}`;
}

/** Path including basePath for absolute URLs, clipboard, and QR codes. */
export function sharePath(hash: string): string {
  return `${appBasePath()}/e#${hash.replace(/^#/, "")}`;
}

export function shareUrl(hash: string, origin?: string): string {
  const path = sharePath(hash);
  const resolvedOrigin =
    (origin || "").replace(/\/$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "") ||
    (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  if (resolvedOrigin) return `${resolvedOrigin}${path}`;
  return path;
}

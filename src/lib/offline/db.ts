"use client";

import Dexie, { type Table } from "dexie";
import type { LyricType, LyricWithBands } from "@/types";

/** Cap on cached lyrics so the offline store cannot grow without bound. */
const LYRIC_CACHE_LIMIT = 200;

export interface CachedLyric {
  id: string;
  data: LyricWithBands;
  cachedAt: number;
}

export interface FavoriteRecord {
  lyricId: string;
  title: string;
  type: LyricType;
  poetName: string | null;
  reciterName: string | null;
  addedAt: number;
}

export interface LocalEventItem {
  id: string;
  lyricId: string | null;
  title: string;
  note: string | null;
}

export interface LocalEvent {
  id: string;
  title: string;
  eventDate: string | null;
  items: LocalEventItem[];
  updatedAt: number;
}

class AzadariDatabase extends Dexie {
  lyrics!: Table<CachedLyric, string>;
  favorites!: Table<FavoriteRecord, string>;
  events!: Table<LocalEvent, string>;

  constructor() {
    super("azadari");
    this.version(1).stores({
      lyrics: "id, cachedAt",
      favorites: "lyricId, addedAt",
      events: "id, updatedAt",
    });
  }
}

export const db: AzadariDatabase | null =
  typeof window === "undefined" ? null : new AzadariDatabase();

export async function cacheLyric(lyric: LyricWithBands) {
  if (!db) return;
  await db.lyrics.put({ id: lyric.id, data: lyric, cachedAt: Date.now() });

  const count = await db.lyrics.count();
  if (count > LYRIC_CACHE_LIMIT) {
    const stale = await db.lyrics
      .orderBy("cachedAt")
      .limit(count - LYRIC_CACHE_LIMIT)
      .primaryKeys();
    await db.lyrics.bulkDelete(stale);
  }
}

export async function getCachedLyric(id: string) {
  if (!db) return null;
  const record = await db.lyrics.get(id);
  return record?.data ?? null;
}

export async function toggleFavorite(lyric: {
  id: string;
  title: string;
  type: LyricType;
  poet_name: string | null;
  reciter_name: string | null;
}) {
  if (!db) return false;
  const existing = await db.favorites.get(lyric.id);
  if (existing) {
    await db.favorites.delete(lyric.id);
    return false;
  }
  await db.favorites.put({
    lyricId: lyric.id,
    title: lyric.title,
    type: lyric.type,
    poetName: lyric.poet_name,
    reciterName: lyric.reciter_name,
    addedAt: Date.now(),
  });
  return true;
}

export function createLocalEvent(title: string, eventDate: string | null): LocalEvent {
  return {
    id: crypto.randomUUID(),
    title,
    eventDate,
    items: [],
    updatedAt: Date.now(),
  };
}

export async function saveLocalEvent(event: LocalEvent) {
  if (!db) return;
  await db.events.put({ ...event, updatedAt: Date.now() });
}

export async function deleteLocalEvent(id: string) {
  if (!db) return;
  await db.events.delete(id);
}

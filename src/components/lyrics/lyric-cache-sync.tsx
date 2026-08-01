"use client";

import { useEffect } from "react";
import { cacheLyric } from "@/lib/offline/db";
import type { LyricWithBands } from "@/types";

/** Stores the opened lyric in IndexedDB so it reopens instantly and offline. */
export function LyricCacheSync({ lyric }: { lyric: LyricWithBands }) {
  useEffect(() => {
    void cacheLyric(lyric);
  }, [lyric]);

  return null;
}

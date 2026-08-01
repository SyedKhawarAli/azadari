"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Script } from "@/types";

interface ReaderPreferences {
  script: Script;
  /** Show Urdu and Roman together instead of one script at a time. */
  showBothScripts: boolean;
  fontScale: number;
  setScript: (script: Script) => void;
  toggleScript: () => void;
  setShowBothScripts: (value: boolean) => void;
  setFontScale: (value: number) => void;
}

export const FONT_SCALE_MIN = 0.4;
export const FONT_SCALE_MAX = 2.6;

export const useReaderPreferences = create<ReaderPreferences>()(
  persist(
    (set, get) => ({
      script: "urdu",
      showBothScripts: false,
      fontScale: 1.2,
      setScript: (script) => set({ script, showBothScripts: false }),
      toggleScript: () =>
        set({
          script: get().script === "urdu" ? "roman" : "urdu",
          showBothScripts: false,
        }),
      setShowBothScripts: (showBothScripts) => set({ showBothScripts }),
      setFontScale: (fontScale) =>
        set({ fontScale: Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, fontScale)) }),
    }),
    { name: "azadari-reader-preferences" },
  ),
);

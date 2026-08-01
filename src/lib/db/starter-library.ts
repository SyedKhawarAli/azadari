import libraryData from "@content/library.json";
import { payloadToLyric } from "./payload";
import type { LyricImportPayload, LyricWithBands } from "@/types";

/**
 * Library bundled with the app from `content/library.json`
 * (regenerate with `npm run build:library`).
 */
export const STARTER_LIBRARY: LyricWithBands[] = (
  libraryData as unknown as (LyricImportPayload & { id: string })[]
).map((payload) => payloadToLyric(payload, payload.id));

/**
 * Prefer the explicit `media_urls` list; fall back to the legacy single
 * `audio_url` so older rows and imports keep working.
 */
export function resolveMediaUrls(lyric: {
  media_urls?: string[] | null;
  audio_url?: string | null;
}): string[] {
  if (lyric.media_urls && lyric.media_urls.length > 0) {
    return [...new Set(lyric.media_urls.filter(Boolean))];
  }
  return lyric.audio_url ? [lyric.audio_url] : [];
}

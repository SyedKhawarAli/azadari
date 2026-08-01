export type MediaKind = "youtube" | "tiktok" | "audio" | "link";

export function classifyMediaUrl(url: string | null | undefined): MediaKind | null {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("youtube.com") || host === "youtu.be") return "youtube";
    if (host.includes("tiktok.com")) return "tiktok";
    if (/\.(mp3|m4a|ogg|wav)(\?|$)/i.test(url)) return "audio";
    return "link";
  } catch {
    return null;
  }
}

export function mediaLabel(kind: MediaKind) {
  switch (kind) {
    case "youtube":
      return "Watch on YouTube";
    case "tiktok":
      return "Open on TikTok";
    case "audio":
      return "Audio reference";
    default:
      return "Open media";
  }
}

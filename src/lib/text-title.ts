import { isRtlText } from "@/lib/text";
import type { Script } from "@/types";

/** Pick which title to show from the saved script preference. */
export function titleForScript(
  lyric: { title: string; title_roman?: string | null },
  script: Script,
  showBoth = false,
): { primary: string; secondary: string | null; rtlPrimary: boolean } {
  const roman = lyric.title_roman?.trim() || null;

  if (showBoth && roman) {
    return {
      primary: lyric.title,
      secondary: roman,
      rtlPrimary: isRtlText(lyric.title),
    };
  }

  if (script === "roman" && roman) {
    return { primary: roman, secondary: null, rtlPrimary: false };
  }

  return {
    primary: lyric.title,
    secondary: null,
    rtlPrimary: isRtlText(lyric.title),
  };
}

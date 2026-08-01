const RTL_RANGE = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * Titles come from the Urdu source documents, so headings and cards need to
 * switch direction and typeface per record rather than per page.
 */
export function isRtlText(value: string | null | undefined) {
  return Boolean(value && RTL_RANGE.test(value));
}

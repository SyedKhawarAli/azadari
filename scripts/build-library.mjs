/**
 * Builds content/library.json from every JSON file under content/lyrics/
 * (files whose names start with underscore, such as _template.json, are skipped).
 *
 * Usage: node scripts/build-library.mjs
 */

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LYRICS_DIR = join(ROOT, "content/lyrics");
const OUT = join(ROOT, "content/library.json");

const LYRIC_TYPES = new Set([
  "Noha",
  "Manqabat",
  "Marsiya",
  "Soz",
  "Salam",
  "Ziyarat",
  "Hadith-e-Kisa",
]);

function deterministicUuid(seed) {
  const bytes = Buffer.from(createHash("sha1").update(`azadari:${seed}`).digest().subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

function walkJsonFiles(dir, files = []) {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return files;
  for (const name of readdirSync(dir)) {
    if (name.startsWith("_")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkJsonFiles(full, files);
    else if (name.endsWith(".json")) files.push(full);
  }
  return files;
}

function normalizeEntry(raw, filePath) {
  if (!raw || typeof raw !== "object") {
    throw new Error(`${filePath}: expected a JSON object`);
  }
  const title = String(raw.title ?? "").trim();
  if (!title) throw new Error(`${filePath}: title is required`);
  if (!LYRIC_TYPES.has(raw.type)) {
    throw new Error(`${filePath}: invalid type ${JSON.stringify(raw.type)}`);
  }
  if (!Array.isArray(raw.structure) || raw.structure.length === 0) {
    throw new Error(`${filePath}: structure must be a non-empty array`);
  }

  const mediaUrls = [
    ...new Set(
      [
        ...(Array.isArray(raw.media_urls) ? raw.media_urls : []),
        raw.audio_url,
      ].filter((value) => typeof value === "string" && value.trim().length > 0),
    ),
  ];

  return {
    id: raw.id && String(raw.id).length > 0 ? String(raw.id) : deterministicUuid(title),
    title,
    ...(raw.title_roman && String(raw.title_roman).trim()
      ? { title_roman: String(raw.title_roman).trim() }
      : {}),
    type: raw.type,
    poet_name: raw.poet_name ?? null,
    reciter_name: raw.reciter_name ?? null,
    scale_pitch: raw.scale_pitch ?? null,
    audio_url: mediaUrls[0] ?? null,
    media_urls: mediaUrls,
    personalities: Array.isArray(raw.personalities) ? raw.personalities : [],
    events: Array.isArray(raw.events) ? raw.events : [],
    ...(raw.astai_chorus ? { astai_chorus: raw.astai_chorus } : {}),
    structure: raw.structure,
  };
}

const files = walkJsonFiles(LYRICS_DIR).sort();
if (files.length === 0) {
  console.error("No lyric files found under content/lyrics/");
  process.exit(1);
}

const library = [];
const seenIds = new Set();

for (const file of files) {
  const rel = relative(ROOT, file);
  const raw = JSON.parse(readFileSync(file, "utf8"));
  const entry = normalizeEntry(raw, rel);
  if (seenIds.has(entry.id)) {
    throw new Error(`Duplicate id ${entry.id} in ${rel}`);
  }
  seenIds.add(entry.id);
  library.push(entry);
}

writeFileSync(OUT, `${JSON.stringify(library, null, 2)}\n`, "utf8");

const byType = library.reduce((totals, entry) => {
  totals[entry.type] = (totals[entry.type] ?? 0) + 1;
  return totals;
}, {});

console.log(`Wrote ${library.length} entries from ${files.length} files → content/library.json`);
console.log(byType);
console.log(
  `with media: ${library.filter((e) => e.media_urls.length).length}, ` +
    `with roman tip: ${library.filter((e) => e.astai_chorus?.roman?.length).length}`,
);

#!/usr/bin/env node
/**
 * Validates every lyric JSON file under content/lyrics for CI.
 * Usage: node scripts/validate-lyrics.mjs
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LYRICS_DIR = join(ROOT, "content/lyrics");

const LYRIC_TYPES = new Set([
  "Noha",
  "Manqabat",
  "Marsiya",
  "Soz",
  "Salam",
  "Ziyarat",
  "Hadith-e-Kisa",
]);
const BAND_TYPES = new Set(["matla", "saani_matla", "stanza"]);

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith("_")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (name.endsWith(".json")) files.push(full);
  }
  return files;
}

const errors = [];
const ids = new Map();

for (const file of walk(LYRICS_DIR).sort()) {
  const rel = relative(ROOT, file);
  let raw;
  try {
    raw = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`${rel}: invalid JSON (${error.message})`);
    continue;
  }

  if (!raw.title || !String(raw.title).trim()) errors.push(`${rel}: missing title`);
  if (!LYRIC_TYPES.has(raw.type)) errors.push(`${rel}: invalid type`);
  if (!Array.isArray(raw.structure) || raw.structure.length === 0) {
    errors.push(`${rel}: structure must be a non-empty array`);
  } else {
    raw.structure.forEach((band, index) => {
      if (!BAND_TYPES.has(band.band_type)) {
        errors.push(`${rel}: structure[${index}].band_type invalid`);
      }
      if (!Array.isArray(band.misras) || band.misras.length === 0) {
        errors.push(`${rel}: structure[${index}].misras empty`);
      } else {
        band.misras.forEach((misra, misraIndex) => {
          if (!misra?.urdu || !String(misra.urdu).trim()) {
            errors.push(`${rel}: structure[${index}].misras[${misraIndex}].urdu required`);
          }
        });
      }
    });
  }

  if (raw.id) {
    if (ids.has(raw.id)) errors.push(`${rel}: duplicate id also in ${ids.get(raw.id)}`);
    else ids.set(raw.id, rel);
  }

  if (raw.media_urls && !Array.isArray(raw.media_urls)) {
    errors.push(`${rel}: media_urls must be an array`);
  }
}

if (errors.length) {
  console.error(`Lyric validation failed (${errors.length} issue(s)):\n`);
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log(`Validated ${walk(LYRICS_DIR).length} lyric file(s).`);

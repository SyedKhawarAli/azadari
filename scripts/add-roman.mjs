#!/usr/bin/env node
/**
 * Adds / refreshes Roman Urdu on lyric JSON under content/lyrics.
 * Uses word lexicon + phonetic fallback. Hand-tuned files are skipped unless --force.
 *
 * Usage:
 *   node scripts/add-roman.mjs
 *   node scripts/add-roman.mjs --force          # overwrite all including hand-tuned
 *   node scripts/add-roman.mjs --force-auto     # overwrite auto-filled only
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { dirname, join, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LYRICS_DIR = join(ROOT, "content/lyrics");
const FORCE = process.argv.includes("--force");
const FORCE_AUTO = process.argv.includes("--force-auto") || FORCE;

/** Files with carefully written Roman — never overwrite unless --force. */
const HAND_TUNED = new Set([
  "036e24cc.json",
  "akbar-tumhein.json",
]);

/** Common azadari / Urdu tokens → Roman Urdu (longest keys first via sort). */
const WORDS = {
  بسم: "bism",
  اللہ: "Allah",
  محمد: "Muhammad",
  احمد: "Ahmad",
  علی: "Ali",
  حسن: "Hasan",
  حسین: "Hussain",
  حسینؑ: "Hussain AS",
  عباس: "Abbas",
  زینب: "Zainab",
  زہرا: "Zahra",
  فاطمہ: "Fatima",
  فاطمه: "Fatima",
  سکینہ: "Sakina",
  قاسم: "Qasim",
  اکبر: "Akbar",
  اصغر: "Asghar",
  پنجتن: "Panjatan",
  کربلا: "Karbala",
  کربلاء: "Karbala",
  مدینہ: "Madina",
  مدینے: "Madine",
  مکہ: "Makkah",
  کعبہ: "Kaaba",
  کعبے: "Kaabe",
  خدا: "Khuda",
  رب: "Rabb",
  ربا: "Rabba",
  یا: "Ya",
  اے: "Aye",
  او: "o",
  اور: "aur",
  میں: "mein",
  میرے: "mere",
  میری: "meri",
  میرا: "mera",
  مجھ: "mujh",
  مجھے: "mujhe",
  تم: "tum",
  تمہیں: "tumhein",
  تیرا: "tera",
  تیری: "teri",
  تیرے: "tere",
  وہ: "woh",
  یہ: "yeh",
  یہی: "yehi",
  یہیں: "yehin",
  جو: "jo",
  کیا: "kya",
  کیوں: "kyun",
  کہاں: "kahan",
  کہ: "keh",
  کی: "ki",
  کا: "ka",
  کے: "ke",
  کو: "ko",
  سے: "se",
  پر: "par",
  بھی: "bhi",
  نہیں: "nahi",
  نہ: "na",
  ہے: "hai",
  ہیں: "hain",
  تھا: "tha",
  تھے: "the",
  تھی: "thi",
  ہو: "ho",
  ہوگا: "hoga",
  ہوگی: "hogi",
  ہوں: "hoon",
  گا: "ga",
  گی: "gi",
  گے: "ge",
  رہا: "raha",
  رہی: "rahi",
  رہے: "rahe",
  رہوں: "rahoon",
  گیا: "gaya",
  گئی: "gayi",
  گئے: "gaye",
  آیا: "aaya",
  آئی: "aayi",
  آئے: "aaye",
  آج: "aaj",
  اب: "ab",
  پھر: "phir",
  تو: "to",
  اگر: "agar",
  مگر: "magar",
  لیکن: "lekin",
  چونکہ: "chunkay",
  جب: "jab",
  تک: "tak",
  سب: "sab",
  ہم: "hum",
  ہمارے: "hamare",
  ہماری: "hamari",
  ان: "un",
  اس: "iss",
  ایک: "aik",
  دو: "do",
  تین: "teen",
  جان: "jaan",
  جسم: "jism",
  دل: "dil",
  سر: "sar",
  سرور: "sarwar",
  آنکھ: "aankh",
  آنکھیں: "aankhein",
  نور: "noor",
  چمکا: "chamka",
  روشن: "roshan",
  سینہ: "seena",
  سینے: "seene",
  رات: "raat",
  دن: "din",
  نات: "naat",
  پڑھتا: "parhta",
  رہتا: "rehta",
  مزہ: "maza",
  آرہا: "aa-raha",
  جینے: "jeene",
  روح: "rooh",
  ثنا: "sana",
  درود: "darood",
  سلام: "salaam",
  دعا: "dua",
  عبادت: "ibadat",
  عبادات: "ibadaat",
  ولایت: "wilayat",
  مسئلہ: "masla",
  ملاں: "mullan",
  نماز: "namaz",
  نمازیں: "namazein",
  روزہ: "roza",
  روزے: "roze",
  قضا: "qaza",
  رضا: "raza",
  مودت: "mawaddat",
  ویلا: "wila",
  ردا: "rida",
  چادر: "chadar",
  ظالم: "zalim",
  بے: "be",
  رحم: "raham",
  آہوزاری: "aah-o-zari",
  روزوشب: "roz-o-shab",
  حقیقت: "haqeeqat",
  نالائق: "nalaiq",
  لڑکے: "ladke",
  آدم: "Adam",
  حوا: "Hawwa",
  پیغمبر: "Payghambar",
  پیغامبر: "Payghambar",
  آل: "Aal",
  آلے: "Aal-e",
  اہل: "Ahl",
  بیت: "Bait",
  آخری: "aakhri",
  جنگ: "jang",
  اقصٰی: "Aqsa",
  اقصی: "Aqsa",
  معلوم: "maloom",
  مانگ: "maang",
  باپ: "baap",
  مرنے: "marne",
  عالم: "aalam",
  غربت: "ghurbat",
  دشت: "dasht",
  مصیبت: "musibat",
  وقت: "waqt",
  قیامت: "qayamat",
  وداع: "widaa",
  اذن: "izn",
  لال: "laal",
  پاک: "paak",
  خیر: "khair",
  جہان: "jahan",
  روضہ: "rauza",
  لبوں: "labon",
  پے: "pe",
  جن: "jin",
};

const DIGRAPHS = [
  ["کھ", "kh"],
  ["گھ", "gh"],
  ["چھ", "chh"],
  ["جھ", "jh"],
  ["تھ", "th"],
  ["ٹھ", "th"],
  ["دھ", "dh"],
  ["ڈھ", "dh"],
  ["پھ", "ph"],
  ["بھ", "bh"],
  ["شھ", "shh"],
];

const SINGLE = {
  آ: "aa",
  ا: "a",
  ب: "b",
  پ: "p",
  ت: "t",
  ٹ: "t",
  ث: "s",
  ج: "j",
  چ: "ch",
  ح: "h",
  خ: "kh",
  د: "d",
  ڈ: "d",
  ذ: "z",
  ر: "r",
  ڑ: "r",
  ز: "z",
  ژ: "zh",
  س: "s",
  ش: "sh",
  ص: "s",
  ض: "z",
  ط: "t",
  ظ: "z",
  ع: "a",
  غ: "gh",
  ف: "f",
  ق: "q",
  ک: "k",
  گ: "g",
  ل: "l",
  م: "m",
  ن: "n",
  ں: "n",
  و: "o",
  ہ: "h",
  ھ: "h",
  ی: "i",
  ئ: "y",
  ے: "e",
  ء: "",
  أ: "a",
  إ: "i",
  ؤ: "o",
  "َ": "a",
  "ِ": "i",
  "ُ": "u",
  "ً": "an",
  "ٌ": "un",
  "ٍ": "in",
  "ّ": "",
  "ْ": "",
  "ٰ": "aa",
  "،": ",",
  "؛": ";",
  "؟": "?",
  "۔": ".",
  "ﷺ": " SAWW",
  "ؑ": " AS",
  "ؓ": " RA",
};

const WORD_ENTRIES = Object.entries(WORDS).sort((a, b) => b[0].length - a[0].length);

function phoneticWord(word) {
  let text = word;
  for (const [from, to] of DIGRAPHS) text = text.split(from).join(to);
  let out = "";
  for (const ch of text) {
    if (SINGLE[ch] !== undefined) out += SINGLE[ch];
    else if (/[A-Za-z0-9'’-]/.test(ch)) out += ch;
  }
  // Final ی often sounds like e in Urdu words (مرے→mare already handled; کئی etc.)
  out = out.replace(/ii$/g, "i").replace(/aa$/g, "a");
  return out;
}

function stripMarks(word) {
  return word
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/[ؐ-ؕﷺ]/g, "");
}

function transliterate(urdu) {
  if (!urdu || typeof urdu !== "string") return "";
  let text = urdu.normalize("NFC");

  text = text
    .replace(/علیہ\s*السلام/g, "AS")
    .replace(/صلی اللہ علیہ[^\s]*/g, "SAWW");

  const parts = text.split(/(\s+|[,.!?;:()"'«»]+)/);
  const romanParts = parts.map((part) => {
    if (!part || /^\s+$/.test(part) || /^[,.!?;:()"'«»]+$/.test(part)) return part;

    const clean = stripMarks(part);
    const honorific = /ؑ/.test(part)
      ? " AS"
      : /ﷺ/.test(part)
        ? " SAWW"
        : /ؓ/.test(part)
          ? " RA"
          : "";
    const izafat = /[ِ]/.test(part) ? "-e" : "";

    for (const [ur, ro] of WORD_ENTRIES) {
      if (part === ur || clean === ur || clean === stripMarks(ur)) {
        return ro + izafat + honorific;
      }
    }

    if (izafat) {
      return `${phoneticWord(clean).replace(/^./, (c) => c.toLowerCase())}-e${honorific}`;
    }

    return phoneticWord(clean) + honorific;
  });

  let out = romanParts
    .join("")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;?!])/g, "$1")
    .trim();

  if (!out) return "";
  return out.replace(/^./, (c) => c.toUpperCase());
}

function fillRoman(lyric, { overwrite }) {
  const next = structuredClone(lyric);
  if (overwrite || !next.title_roman?.trim()) {
    next.title_roman = transliterate(next.title);
  }
  if (next.astai_chorus?.urdu?.length) {
    const existing = next.astai_chorus.roman || [];
    next.astai_chorus.roman = next.astai_chorus.urdu.map((line, i) =>
      !overwrite && existing[i]?.trim() ? existing[i] : transliterate(line),
    );
  }
  next.structure = (next.structure || []).map((band) => ({
    ...band,
    misras: (band.misras || []).map((misra) => ({
      ...misra,
      roman:
        !overwrite && misra.roman && String(misra.roman).trim()
          ? misra.roman
          : transliterate(misra.urdu),
    })),
  }));
  return next;
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith("_")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (name.endsWith(".json")) files.push(full);
  }
  return files;
}

let updated = 0;
let skipped = 0;

for (const file of walk(LYRICS_DIR).sort()) {
  const name = basename(file);
  const raw = JSON.parse(readFileSync(file, "utf8"));
  const isHand = HAND_TUNED.has(name);

  if (isHand && !FORCE) {
    skipped += 1;
    continue;
  }

  const overwrite = FORCE || (FORCE_AUTO && !isHand);
  const filled = fillRoman(raw, { overwrite });
  if (JSON.stringify(filled) === JSON.stringify(raw)) {
    skipped += 1;
    continue;
  }
  writeFileSync(file, `${JSON.stringify(filled, null, 2)}\n`, "utf8");
  updated += 1;
  console.log("updated", relative(ROOT, file));
}

console.log(`Done. updated=${updated} skipped=${skipped}`);

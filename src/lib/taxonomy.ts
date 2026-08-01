import type { BandType, LyricType } from "@/types";

export const LYRIC_TYPES: LyricType[] = [
  "Noha",
  "Manqabat",
  "Marsiya",
  "Soz",
  "Salam",
  "Ziyarat",
  "Hadith-e-Kisa",
];

export const BAND_TYPES: BandType[] = [
  "matla",
  "saani_matla",
  "stanza",
  "tip_chorus",
];

export const BAND_TYPE_LABELS: Record<BandType, string> = {
  matla: "Matla",
  saani_matla: "Saani Matla",
  stanza: "Band",
  tip_chorus: "Tip / Astai",
};

/**
 * Reference taxonomy used for filters and planner segments.
 */
export const PERSONALITIES: { name: string; title_alias: string | null }[] = [
  { name: "Prophet Muhammad (SAWW)", title_alias: "Khatam-un-Nabiyyin" },
  { name: "Imam Hussain (AS)", title_alias: "Sayyid-ush-Shuhada" },
  { name: "Hazrat Abbas (AS)", title_alias: "Alamdar-e-Karbala" },
  { name: "Hazrat Ali Akbar (AS)", title_alias: "Shabih-e-Paighambar" },
  { name: "Hazrat Ali Asghar (AS)", title_alias: "Shaheed-e-Shir Khwar" },
  { name: "Hazrat Qasim (AS)", title_alias: "Naunihal-e-Hasan" },
  { name: "Bibi Sakina (SA)", title_alias: "Dukhtar-e-Hussain" },
  { name: "Syeda Zainab (SA)", title_alias: "Sani-e-Zahra" },
  { name: "Imam Ali (AS)", title_alias: "Ameer-ul-Momineen" },
  { name: "Bibi Fatima Zahra (SA)", title_alias: "Sayyida-tun-Nisa" },
  { name: "Imam Hassan (AS)", title_alias: "Sayyid-ush-Shabab" },
  { name: "Imam Zain-ul-Abideen (AS)", title_alias: "Sajjad" },
  { name: "Imam Mahdi (AJ)", title_alias: "Sahib-uz-Zaman" },
  { name: "Hazrat Muslim ibn Aqeel (AS)", title_alias: "Safeer-e-Hussain" },
  { name: "Hazrat Habib ibn Mazahir (AS)", title_alias: null },
  { name: "Hazrat Zainab's Sons (AS)", title_alias: "Aun-o-Muhammad" },
  { name: "Ahlulbayt (AS)", title_alias: null },
];

export const ISLAMIC_EVENTS: {
  event_name: string;
  hijri_month: number | null;
  hijri_day: number | null;
}[] = [
  { event_name: "1st Muharram", hijri_month: 1, hijri_day: 1 },
  { event_name: "2nd Muharram", hijri_month: 1, hijri_day: 2 },
  { event_name: "3rd Muharram", hijri_month: 1, hijri_day: 3 },
  { event_name: "4th Muharram", hijri_month: 1, hijri_day: 4 },
  { event_name: "5th Muharram", hijri_month: 1, hijri_day: 5 },
  { event_name: "6th Muharram", hijri_month: 1, hijri_day: 6 },
  { event_name: "7th Muharram", hijri_month: 1, hijri_day: 7 },
  { event_name: "8th Muharram", hijri_month: 1, hijri_day: 8 },
  { event_name: "9th Muharram", hijri_month: 1, hijri_day: 9 },
  { event_name: "Shab-e-Ashura", hijri_month: 1, hijri_day: 9 },
  { event_name: "Day of Ashura", hijri_month: 1, hijri_day: 10 },
  { event_name: "Shaam-e-Ghareeban", hijri_month: 1, hijri_day: 11 },
  { event_name: "Chehlum / Arbaeen", hijri_month: 2, hijri_day: 20 },
  { event_name: "21st Ramadan", hijri_month: 9, hijri_day: 21 },
  { event_name: "Ayyam-e-Fatimiyya", hijri_month: 6, hijri_day: 3 },
];

const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi-ul-Awwal",
  "Rabi-us-Sani",
  "Jamadi-ul-Awwal",
  "Jamadi-us-Sani",
  "Rajab",
  "Shaban",
  "Ramadan",
  "Shawwal",
  "Zil-Qad",
  "Zil-Hajj",
];

export function formatHijriDate(month: number | null, day: number | null) {
  if (!month || !day) return null;
  return `${day} ${HIJRI_MONTHS[month - 1] ?? ""}`.trim();
}

/** Free-text program items that are not lyrics from the catalogue. */
export const PROGRAM_SEGMENTS = [
  "Tilawat-e-Quran",
  "Hadith-e-Kisa",
  "Soz / Salam",
  "Marsiya",
  "Main Majlis",
  "Nohay",
  "Matam",
  "Ziyarat",
  "Dua-e-Faraj",
];

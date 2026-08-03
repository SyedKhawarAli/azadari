import type { MetadataRoute } from "next";

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Azadari — Nohay & Majlis Planner",
    short_name: "Azadari",
    description:
      "Nohay, Manqabat, Marsiya, Soz and Salam in Urdu and Roman Urdu, with a Majlis programme planner that works offline.",
    start_url: `${basePath}/` || "/",
    scope: `${basePath}/` || "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    categories: ["books", "education", "lifestyle"],
    icons: [
      { src: `${basePath}/icons/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${basePath}/icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: `${basePath}/icons/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Favourites", url: `${basePath}/favorites` },
      { name: "Majlis Planner", url: `${basePath}/planner` },
    ],
  };
}

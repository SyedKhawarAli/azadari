# Azadari

Static, open-source reader for Shia Azadari content — Nohay, Manqabat, Marsiya and more — plus a
guest Majlis planner. Host it on GitHub Pages or any static host. No login required.

## Features

- **Catalogue** — search, filter, and sort by title, type, poet, or reciter
- **Lyric reader** — dual Urdu / Roman Urdu (or both), font scaling, optional screen wake lock
- **Favourites** — stored on this device (IndexedDB)
- **Majlis Planner** — drag-and-drop agenda, PDF export, QR code
- **Share programmes** — the agenda is encoded in the URL hash (`/e#…`); anyone with the link sees the same programme
- **Contribute lyrics** — one JSON file per piece via pull request ([CONTRIBUTING.md](CONTRIBUTING.md))

## Quick start

```bash
npm install
npm run build:library   # optional if library.json is already committed
npm run dev
```

Open http://localhost:3000 (or another port if prompted).

## Contribute a lyric

1. Copy [`content/lyrics/_template.json`](content/lyrics/_template.json) to `content/lyrics/<type>/<slug>.json`
2. Fill in Urdu text (optional Roman, media URLs, tags)
3. Run `npm run validate:lyrics` and `npm run build:library`, then open a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Build static site

```bash
npm run build:library
npm run validate:lyrics
npm run typecheck
npm run build
```

Output lands in `out/`. Preview locally:

```bash
npx serve out
```

For a project-site preview that matches GitHub Pages:

```bash
NEXT_PUBLIC_BASE_PATH=/azadari npm run build
npx serve out
# then open http://localhost:3000/azadari/
```

## Deploy to GitHub Pages

The app is a pure static export (`output: "export"`). Deploy is handled by
[`.github/workflows/pages.yml`](.github/workflows/pages.yml).

### One-time setup

1. Push this repo to GitHub (default branch `main`).
2. **Settings → Pages → Build and deployment → Source:** GitHub Actions.
3. **Settings → Secrets and variables → Actions → Variables** — add:
   - `NEXT_PUBLIC_BASE_PATH` = `/azadari` for a **project site**
     (`https://syedkhawarali.github.io/azadari/`)
   - leave it unset/empty for a **user/org root site** (`https://<user>.github.io/`)
   - optional: `NEXT_PUBLIC_APP_URL` = the public origin (e.g. `https://syedkhawarali.github.io`)
     used as a fallback for absolute share/QR URLs

### Deploy

Push to `main` (or run the workflow manually via **Actions → Deploy GitHub Pages**).

After deploy, smoke-check:

- Home catalogue (search / filters / sort / Urdu·Roman·Show both)
- A lyric page and “Back to library”
- Planner → copy share link → `/e#…` → Open lyric → “Back to programme”
- Favourites and offline revisit of a cached page

## Content layout

| Path | Role |
| --- | --- |
| `content/lyrics/**/*.json` | Source of truth — one file per lyric |
| `content/library.json` | Build artifact (committed so clones work without an extra step) |

Regenerate the library after editing lyric files:

```bash
npm run build:library
```

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js App Router (`output: 'export'`) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Client state | Zustand (reader prefs) |
| Offline | Dexie + `public/sw.js` |
| Export | `@react-pdf/renderer`, `qrcode.react` |

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Static export → `out/` |
| `npm run lint` / `typecheck` | Quality checks |
| `npm run build:library` | Glob `content/lyrics` → `library.json` |
| `npm run validate:lyrics` | CI-style validation of lyric JSON |

## License

MIT — see [LICENSE](LICENSE).

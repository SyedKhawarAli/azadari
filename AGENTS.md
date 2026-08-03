# AGENTS.md

## Cursor Cloud specific instructions

Azadari is a **fully static** Next.js (App Router, `output: "export"`) app — no backend, no
database, no auth. Favourites and the Majlis planner live on-device (IndexedDB via Dexie), and
shared programmes are encoded in the URL hash (`/e#…`). There is nothing external to provision.

Dependencies are installed on startup via the update script (`npm ci`), so you do not need to
reinstall unless the lockfile changed.

### Running the app

- Dev server: `npm run dev` (Next.js + Turbopack) serves on `http://localhost:3000`. This is the
  command to use for development/testing — not the production `build`/`start` flow.
- Prefer running `npm run dev` in a persistent tmux session so it survives across commands.

### Quality checks (mirror `.github/workflows/pages.yml`)

Run these from the repo root; standard scripts are defined in `package.json`:

- `npm run validate:lyrics` — validates every `content/lyrics/**/*.json`.
- `npm run build:library` — regenerates `content/library.json` from the lyric files. Do NOT
  hand-edit `content/library.json`; it is a build artifact (committed so clones work without a
  build step). Regenerate it after changing any lyric file.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run lint` — ESLint (flat config). Note: `main` currently has a pre-existing lint error in
  `src/components/lyrics/lyric-filters.tsx` and one a11y warning in
  `src/components/planner/event-editor.tsx`; these are not caused by env setup.

### Static build (only when verifying the export)

`npm run build` produces the static export in `out/`. For a GitHub-Pages-style project-site
preview, set `NEXT_PUBLIC_BASE_PATH=/azadari` before building (see `README.md`); leaving it unset
builds for a root site.

## Summary

<!-- What does this PR change? -->

## Lyrics checklist (if adding or editing content)

- [ ] New file is under `content/lyrics/<type>/<ascii-slug>.json` (not a hand-edit of `library.json`)
- [ ] Copied from `content/lyrics/_template.json` or matched its shape
- [ ] `title`, `type`, and at least one band with Urdu misras are filled in
- [ ] Ran `npm run validate:lyrics` and `npm run build:library` locally
- [ ] Media links (if any) open correctly

## App / tooling checklist (if changing code)

- [ ] `npm run typecheck` passes
- [ ] Static export still works (`npm run build` produces `out/`)

---
name: tilo-site-publish
description: Load before committing or pushing any change to the heytilo.ai marketing site (this repo), to check pages at desktop and phone width, catch broken links and old addresses, and publish safely.
---

# Publishing a heytilo.ai change

Every push to `main` is live within two minutes and costs Netlify credits. CLAUDE.md holds the content rules; this is the pre-push routine.

## Routine

1. `git pull --rebase` before editing; again just before pushing.
2. If the change touches pricing, plans, brand, legal name, addresses or claims, check `DECISIONS.md` first and add a dated line after (in this repo and in `../noricap-app`).
3. Serve the folder: `python3 -m http.server 8088` (run it in the background), then run
   `node .claude/skills/tilo-site-publish/scripts/check-pages.js http://localhost:8088 / /pricing.html` with the changed paths.
   It reports sideways scrolling and console errors at 1366px and 390px, broken internal links, any `noricap.com` link (only email addresses are allowed to keep it, and there should be none), and canonical mismatches. Look at a screenshot of anything you changed visually (`--shots <dir>`).
4. Stop the server (find its PID; never `pkill -f`, which can kill your own shell).
5. Commit with a plain-English message of what visitors will see. Batch small edits into one push. Use `[skip netlify]` when only notes or instructions changed.
6. After pushing, confirm on the live site (fetch the page with `cache: 'no-store'` and look for the new text).

## Gotchas

- The repo is public and the whole folder is published. New non-public files (notes, drafts, skills) must be blocked in `_redirects` with `404!`, as `CLAUDE.md`, `DECISIONS.md`, `content/*` and `.claude/*` are.
- The homepage FAQ exists twice (visible HTML and the `faq-ld` JSON-LD). Change both.
- New or renamed pages need `sitemap.xml` and, for old addresses, `_redirects` entries. Canonical and `og:url` must be the page's own `.html` address, not a forwarding one.
- Card-grid layouts at 1024px are the usual place text overflows; check that width when adding grid columns.
- Feature claims must match the app (`../noricap-app`). If unsure, grep the app before writing.

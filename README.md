# mg-ghanbari.netlify.app

Portfolio site — 3D & VFX, AI automation, apps and games.

Static site: plain HTML, one shared `detail.css`, no build step, no framework.
Everything in this repository is deployed as-is.

## Structure

```
index.html          landing page — hero, three tabs (VFX / AI / Apps), contact
apps/               one page per project
ai/                 AI project pages
assets/             images, video, per-project folders
detail.css          shared styles for every sub-page
stats.html          private traffic page (noindex, not linked from the site)
assets/visit-counter.js   one hit per browsing session
```

## Deploying

**Live site:** https://mg-ghanbari.netlify.app
**Netlify project:** https://app.netlify.com/projects/mg-ghanbari

Every push to `main` deploys automatically once the repository is linked in
Netlify (Site configuration → Build & deploy → Repository).

Manual deploy, if ever needed:

```bash
netlify deploy --prod --dir=.
```

## Editing

Open any `.html` file and edit it. There is no build, so what you save is what
ships. Relative paths only — the site is served from the domain root.

When adding a project page:

1. Create `apps/<name>.html`, copying the structure of an existing page.
2. Add its assets under `assets/<name>/`.
3. Add a card to the relevant tab in `index.html`.

## Traffic

`stats.html` shows total visits and a 14-day chart. It is excluded from search
engines and is not linked from any page — the URL is the key.

## Video

Clips are H.264 MP4, `+faststart`, and served from the same origin. Keep them
under ~5 MB each; anything heavier should be re-encoded before committing.

# massimojj.github.io/mg-ghanbari

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

**Live site:** https://massimojj.github.io/mg-ghanbari
**Hosted on:** GitHub Pages (free, public repo)

Every push to `main` deploys automatically — GitHub Pages builds from the
`main` branch root. No build command, no credit card, nothing to configure.

There is no manual deploy step; just push to `main`.

## Editing

Open any `.html` file and edit it. There is no build, so what you save is what
ships. Relative paths only — the site is served from a subpath (`/mg-ghanbari/`),
so all links are relative.

When adding a project page:

1. Create `apps/<name>.html`, copying the structure of an existing page.
2. Add its assets under `assets/<name>/`.
3. Add a card to the relevant tab in `index.html`.

## Traffic

`stats.html` shows total visits, a 14-day chart, and a per-page breakdown of the
most-viewed pages. It is excluded from search engines and is not linked from any
page — the URL is the key:

    https://massimojj.github.io/mg-ghanbari/stats.html

## Video

Clips are H.264 MP4, `+faststart`, and served from the same origin. Keep them
under ~5 MB each; anything heavier should be re-encoded before committing.

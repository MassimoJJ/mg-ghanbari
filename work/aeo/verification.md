# AI-search verification — 2026-11-18

Site: https://massimojj.github.io/mg-ghanbari/index.html#works

## Live checks (HTTP 200)

- `index.html` — contains `id="works"`, `id="ai"`, `id="apps"`; 19 `card-desc` paragraphs.
- `llms.txt` — 5741 bytes; canonical home, services, citation guidance, links to sitemap/feed/full text.
- `llms-full.txt` — 6522 bytes; 19 project entries plus technical notes.
- `robots.txt` — allows `*` plus GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot,
  Claude-Web, PerplexityBot, Google-Extended, Applebot-Extended and CCBot.
- `sitemap.xml` — 27 URLs, per-page `lastmod`.

## Structured data

Homepage JSON-LD `@graph` (parsed from live HTML):

- `Person`
- `WebSite` (with `SearchAction`)
- `CollectionPage` (`@id .../works`) with `ItemList` of **19** `CreativeWork` entries
- `Service` (provider = Person, worldwide)

Project and note pages carry `Person`, `CreativeWork` and `BreadcrumbList`.

## Free discovery submissions

`node scripts/ping-engines.mjs` run after deployment:

- IndexNow api.indexnow.org — HTTP 200 accepted
- IndexNow www.bing.com — HTTP 200 accepted
- IndexNow yandex.com — HTTP 202 accepted
- IndexNow search.seznam.cz — HTTP 200 accepted
- Bing Webmaster API skipped (no `BING_API_KEY` in environment)

## Commits pushed

- `5516ea7` Improve AI-search discoverability: anchors, descriptions, structured data, llms files
- `5b42c94` Reconcile AI-search metadata with latest site copy

## Note

`https://mg-ghanbari.netlify.app/` currently returns HTTP 404; the working,
submitted deployment is GitHub Pages. No paid service was used.

# Verification report - MG Ghanbari portfolio (AEO / LLMO deliverable)

- Verifier: oracle (second opinion / fact-check)
- Date of checks: 2026-11-18 (retrieval timestamp 2026-11-18T17:26:31Z)
- Mode: verification only. No new job planned, nothing rebuilt.
- Scope: https://massimojj.github.io/mg-ghanbari/index.html#works and the four machine-readable files.

## What was fetched

| URL | Status | Size |
|---|---|---|
| /index.html | 200 | 60,285 bytes |
| /llms.txt | 200 | 5,723 bytes |
| /llms-full.txt | 200 | 6,464 bytes |
| /robots.txt | 200 | 791 bytes |
| /sitemap.xml | 200 | 5,755 bytes |

All five URLs returned HTTP 200 and real content; none was an error page, login wall or empty shell.

## Anchor check

The requested fragments exist as element IDs in the served HTML: `#works`, `#ai`, `#apps` are all present.
The full ID list is: top, work, tab-works, works, disciplines, tab-ai, ai, tab-apps, apps, contact,
brief-form, brief-name, brief-need, brief-body. There are no `name=` anchors; the sections are
targeted by `id`, which is what `#works` / `#ai` / `#apps` resolve to. No gap.

## JSON-LD check

One `<script type="application/ld+json">` block, containing a `@graph` of exactly four typed nodes:
Person, WebSite, CollectionPage, Service - the required set.

- CollectionPage `@id` = `.../#works`, `isPartOf` -> website, `about` -> person.
- `mainEntity` is an ItemList with `numberOfItems: 19` and exactly 19 `ListItem` entries.
- Positions run 1 to 19 with no gaps or duplicates.
- Each item is a CreativeWork carrying name, url, creator, isPartOf, description and image.
- Service node present: "3D, VFX and AI production", with 7 service offers and an availability
  description.

So the JSON-LD matches the requested shape: 4 types, 19 items, declared count equals actual count.

## Visible card descriptions

Parsed card markup in the page:

- `.card` elements: 19
- `.card-content`: 19
- `.card-title`: 19
- `.card-desc`: 19
- `.card-desc` containing a `<p>` with more than 20 characters: 19 of 19

Description lengths range from 57 to 211 characters, so all 19 cards render a real sentence,
not a placeholder. `.card-desc` is styled in normal flow (`font-size: 0.86rem`, colour `#888888`);
no `display:none`, `visibility:hidden` or `opacity:0` rule targets `.card-desc`, so the descriptions
are visible rather than hidden. Verdict: 19 of 19 visible.

## AI crawler access

robots.txt contains `User-agent: *` + `Allow: /`, plus explicit groups for GPTBot, OAI-SearchBot,
ChatGPT-User, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, Applebot-Extended and CCBot -
each `Allow: /`. AI crawlers are therefore allowed both by the wildcard and by name.
The file also declares the sitemap and deliberately omits `/stats.html`, which carries a noindex tag;
that is correct behaviour (naming a noindex URL in robots.txt would only advertise it).

## Supporting files

- sitemap.xml: 27 `<url>` entries.
- llms-full.txt: 26 project headings, and all 19 project URLs from the JSON-LD ItemList are present;
  the missing-URL check returned an empty list.
- llms.txt: carries the canonical home, the works URL, contact address, services list and pointers to
  the machine-readable files.

## Verdict

Correct. The live deployment matches the specification: the three anchors exist, the JSON-LD carries
Person + WebSite + CollectionPage + Service with 19 declared and 19 actual items, all 19 card
descriptions are present and visible, and AI crawlers are allowed. No blocking gap.

## Residual notes (non-blocking, not defects)

1. The served HTML does not contain the literal string `index.html#works`; the homepage reaches the
   section via `#works`. The full `.../index.html#works` URL is published in llms.txt, so the
   canonical link target is still advertised to machines. No action needed.
2. The three `display:none` rules in the stylesheet belong to other components, not to `.card-desc`;
   no card description is hidden by them.
3. The plain-text fetch rendered a handful of em/en dashes as U+FFFD. The page declares UTF-8, so this
   is consistent with the retrieval decoding rather than with the site; it does not affect anchors,
   JSON-LD or robots. Worth a quick visual glance only if rendered typography matters.

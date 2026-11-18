# AI-search round 2 — 2026-11-18

Question asked: is the site good enough, or can it still be improved for AI search?

Answer: round 1 gave a strong machine-readable foundation. Round 2 adds the
missing "answer engine" layer: explicit questions with direct answers, entity
hints on every project/notes page, and freshness dates.

## Added in commits `ddbd483` and `5aadf35`

- Visible FAQ section on the homepage with six direct answers:
  who MG Ghanbari is, what can be hired for, VFX/3D projects, AI pipelines,
  shipped apps, and where the full project list lives.
- `FAQPage` JSON-LD node generated from those visible answers, so the same
  text is both human-readable and machine-readable.
- Project and notes pages now carry `dateModified` from git history, plus
  `keywords` and `about` entities derived from the page's own title and
  description (e.g. Gemini/OpenAI for Ghan Cinematic, Unreal Engine for
  Precision Strike).
- `llms.txt` now advertises the `#faq` URL.
- `.gitignore` excludes Python caches from the local SEO generator.

## Why these help (realistically)

Answer engines prefer text that can be lifted without inference. A visible
question followed by a short factual answer is easier to quote than a gallery
of image cards. Entity and freshness fields help disambiguate which tools and
which version of the work is being described.

This still cannot force ChatGPT, Gemini or Perplexity to cite the site. It
raises the chance that a crawl produces correct, quotable facts.

## Live verification (after deployment)

- Homepage JSON-LD types: Person, WebSite, CollectionPage, Service, FAQPage.
- FAQPage contains 6 questions and 6 answers.
- Ghan Cinematic page: keywords `Gemini, OpenAI`; `dateModified` from git.
- `llms.txt`, `llms-full.txt`, `robots.txt`, `sitemap.xml` all HTTP 200.
- Free IndexNow re-ping accepted by api.indexnow.org, Bing, Yandex and Seznam.

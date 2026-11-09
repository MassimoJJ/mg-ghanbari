#!/usr/bin/env node
/**
 * Regenerates sitemap.xml and feed.xml from the HTML files actually in the repo.
 *
 * Pure generator: no network calls, never fails a build, safe to run from a
 * GitHub Actions workflow. Search-engine submissions live in ping-engines.mjs.
 *
 * lastmod is derived per file from git history, so untouched pages keep their
 * real timestamp instead of being stamped with today's date on every build.
 */
import { readdirSync, statSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const BASE = "https://massimojj.github.io/mg-ghanbari";
const SKIP = new Set(["stats.html", "404.html", "404_dump.html"]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".") || name === "node_modules" ||
        name === "assets" || name === "scripts" || name === "_site") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith(".html") && !SKIP.has(name)) out.push(full);
  }
  return out;
}

function fileLastmod(rel) {
  try {
    const iso = execSync(`git log -1 --format=%cI -- "${rel}"`, { encoding: "utf8" }).trim();
    if (iso && !Number.isNaN(new Date(iso).getTime())) return iso;
  } catch { /* no git history (e.g. fresh CI checkout) */ }
  return new Date().toISOString();
}

const entries = walk(ROOT).map((f) => {
  const rel = relative(ROOT, f).split("\\").join("/");
  let p = "/" + rel;
  if (p === "/index.html") p = "/";
  else if (p.endsWith("/index.html")) p = p.slice(0, -"index.html".length);
  else p = p.replace(/\.html$/, "");
  return { path: p, lastmod: fileLastmod(rel) };
}).sort((a, b) => a.path.localeCompare(b.path));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${BASE}${e.path}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${e.path === "/" ? "1.0" : "0.8"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

writeFileSync(join(ROOT, "sitemap.xml"), xml);
console.log(`sitemap.xml written — ${entries.length} urls (per-page lastmod)`);

// ---- RSS feed for the Notes section --------------------------------------
try {
  const notesDir = join(ROOT, "notes");
  if (existsSync(notesDir)) {
    const esc = (s) =>
      String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const notes = readdirSync(notesDir).filter((n) => n.endsWith(".html") && n !== "index.html").sort();
    const items = notes.map((n) => {
      const rel = "notes/" + n;
      const html = readFileSync(join(notesDir, n), "utf8");
      const title = ((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || n).trim();
      const when = new Date(fileLastmod(rel));
      const link = `${BASE}/notes/${n.replace(/\.html$/, "")}`;
      return `    <item>
      <title>${esc(title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${when.toUTCString()}</pubDate>
    </item>`;
    });
    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>MG Ghanbari — Notes</title>
    <link>${BASE}/notes/</link>
    <description>Technical notes written while building: animation, web 3D, game loops and AI interfaces.</description>
${items.join("\n")}
  </channel>
</rss>
`;
    writeFileSync(join(ROOT, "feed.xml"), feed);
    console.log(`feed.xml written — ${items.length} notes`);
  }
} catch (err) {
  console.log(`feed.xml failed (non-fatal): ${err.message}`);
}

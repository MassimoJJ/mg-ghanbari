#!/usr/bin/env node
/**
 * Runs on every Netlify deploy.
 *
 *  1. regenerates sitemap.xml from the HTML files actually in the repo
 *  2. tells IndexNow (Bing, Yandex, Seznam, Naver) that the URLs exist
 *
 * No dependencies — Netlify's Node image can run this as-is.
 * Google ignores IndexNow; it discovers the site through the sitemap instead.
 */
import { readdirSync, statSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const BASE = "https://mg-ghanbari.netlify.app";
const SKIP = new Set(["stats.html", "404.html"]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".") || name === "node_modules" || name === "assets" || name === "scripts") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith(".html") && !SKIP.has(name)) out.push(full);
  }
  return out;
}

function lastCommitDate() {
  try {
    return execSync("git log -1 --format=%cI", { encoding: "utf8" }).trim();
  } catch {
    return new Date().toISOString();
  }
}

const pages = walk(ROOT)
  .map((f) => "/" + relative(ROOT, f).split("\\").join("/"))
  .map((p) => {
    if (p === "/index.html") return "/";
    if (p.endsWith("/index.html")) return p.slice(0, -"index.html".length);
    return p.replace(/\.html$/, "");
  })
  .sort();

const lastmod = lastCommitDate();

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${BASE}${p === "/" ? "/" : p}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${p === "/" ? "1.0" : "0.8"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

writeFileSync(join(ROOT, "sitemap.xml"), xml);
console.log(`sitemap.xml written — ${pages.length} urls, lastmod ${lastmod}`);

// ---- RSS feed for the Notes section --------------------------------------
// Same convention as the Bing/IndexNow blocks: a feed failure is logged and
// never fails the deploy. Items are the notes/*.html pages (the hub index is
// the channel, not an item), dated from each file's last git commit.
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
      let when;
      try {
        const iso = execSync(`git log -1 --format=%cI -- "${rel}"`, { encoding: "utf8" }).trim();
        const d = new Date(iso);
        when = Number.isNaN(d.getTime()) ? new Date() : d;
      } catch {
        when = new Date();
      }
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

// ---- Bing Webmaster Tools URL submission --------------------------------
// IndexNow rejects this host (403), but the official Bing API accepts
// submissions once the site is verified. A new site only gets a small daily
// quota (~10), so submit only the pages this commit actually changed rather
// than all of them — the sitemap already covers full discovery.
function changedUrls() {
  try {
    const out = execSync("git diff --name-only HEAD~1 HEAD", { encoding: "utf8" });
    const urls = out
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.endsWith(".html") && !SKIP.has(f.split("/").pop()))
      .map((f) => {
        if (f === "index.html") return BASE + "/";
        if (f.endsWith("/index.html")) return BASE + "/" + f.slice(0, -"index.html".length);
        return BASE + "/" + f.replace(/\.html$/, "");
      });
    return [...new Set(urls)];
  } catch {
    return [];
  }
}

const changed = changedUrls();
const bingKey = process.env.BING_API_KEY;

if (!bingKey) {
  console.log("no BING_API_KEY in this environment — skipping Bing submission");
} else if (!changed.length) {
  console.log("Bing: no page changes in this commit — nothing to submit");
} else {
  try {
    // Ask Bing how much quota is left — a new site gets ~10 URLs a day, and
    // exceeding it fails the whole batch rather than trimming it.
    const qRes = await fetch(
      `https://ssl.bing.com/webmaster/api.svc/json/GetUrlSubmissionQuota` +
      `?apikey=${bingKey}&siteUrl=${encodeURIComponent(BASE + "/")}`
    );
    const quota = qRes.ok ? (await qRes.json())?.d?.DailyQuota : null;
    const allowance = Math.min(changed.length, 10, quota === null ? 10 : quota);
    if (allowance <= 0) {
      console.log(`Bing: daily quota exhausted (${quota} left) — sitemap still covers it`);
      process.exit(0);
    }
    const res = await fetch(
      `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${bingKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ siteUrl: BASE + "/", urlList: changed.slice(0, allowance) }),
      }
    );
    const text = await res.text();
    if (res.ok && !/error/i.test(text)) {
      console.log(`Bing: submitted ${allowance} of ${changed.length} changed url(s)`);
      for (const u of changed.slice(0, allowance)) console.log(`  ${u}`);
    } else {
      console.log(`Bing submission rejected (${res.status}): ${text.slice(0, 160)}`);
    }
  } catch (err) {
    console.log(`Bing submission failed (non-fatal): ${err.message}`);
  }
}

// ---- IndexNow (Bing, Yandex, Seznam, Naver) -----------------------------
const keyFile = readdirSync(ROOT).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
if (keyFile) {
  const key = readFileSync(join(ROOT, keyFile), "utf8").trim();
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(BASE).host,
        key,
        keyLocation: `${BASE}/${keyFile}`,
        urlList: pages.map((p) => `${BASE}${p}`),
      }),
    });
    if (res.status === 200 || res.status === 202) {
      console.log(`IndexNow accepted ${pages.length} urls (${res.status})`);
    }
    // 403 here means the key handshake is not trusted yet — the Bing API above
    // already covers discovery, so this is intentionally quiet.
  } catch (err) {
    console.log(`IndexNow ping failed (non-fatal): ${err.message}`);
  }
}

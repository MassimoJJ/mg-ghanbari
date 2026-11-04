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

// ---- IndexNow -------------------------------------------------------------
const keyFile = readdirSync(ROOT).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
if (!keyFile) {
  console.log("no IndexNow key file found — skipping ping");
} else {
  const key = readFileSync(join(ROOT, keyFile), "utf8").trim();
  const body = {
    host: new URL(BASE).host,
    key,
    keyLocation: `${BASE}/${keyFile}`,
    urlList: pages.map((p) => `${BASE}${p}`),
  };
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });
    if (res.status === 200 || res.status === 202) {
      console.log(`IndexNow accepted ${body.urlList.length} urls (${res.status})`);
    } else if (res.status === 403) {
      console.log("IndexNow declined (403): the host is not verified with Bing yet. " +
                  "Harmless — search engines still read sitemap.xml. Verify the site in " +
                  "Bing Webmaster Tools to enable instant submission.");
    } else {
      console.log(`IndexNow ping: ${res.status} ${res.statusText} (${body.urlList.length} urls)`);
    }
  } catch (err) {
    console.log(`IndexNow ping failed (non-fatal): ${err.message}`);
  }
}

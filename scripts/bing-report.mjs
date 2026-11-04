#!/usr/bin/env node
/**
 * Prints Bing search performance for the site — the queries people actually
 * typed, plus daily impressions and clicks.
 *
 *   node scripts/bing-report.mjs
 *
 * Key comes from BING_API_KEY, or from .env.local (gitignored) when run locally.
 * The site is new, so an empty result for the first days is expected, not an error.
 */
import { readFileSync, existsSync } from "node:fs";

const SITE = "https://mg-ghanbari.netlify.app/";
const API = "https://ssl.bing.com/webmaster/api.svc/json";

function loadKey() {
  if (process.env.BING_API_KEY) return process.env.BING_API_KEY;
  if (existsSync(".env.local")) {
    const line = readFileSync(".env.local", "utf8")
      .split("\n")
      .find((l) => l.startsWith("BING_API_KEY="));
    if (line) return line.split("=")[1].trim().replace(/^["']|["']$/g, "");
  }
  return null;
}

const key = loadKey();
if (!key) {
  console.log("No Bing API key (set BING_API_KEY or create .env.local)");
  process.exit(0);
}

const site = encodeURIComponent(SITE);

async function call(path) {
  try {
    const res = await fetch(`${API}/${path}?apikey=${key}&siteUrl=${site}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.d || null;
  } catch {
    return null;
  }
}

const queries = await call("GetQueryStats");
const traffic = await call("GetRankAndTrafficStats");

if (queries === null && traffic === null) {
  console.log("Bing: could not read stats (key revoked or API unreachable)");
  process.exit(0);
}

// ---- last 7 days of traffic
const days = (traffic || []).slice(-7);
const impressions = days.reduce((a, d) => a + (d.Impressions || 0), 0);
const clicks = days.reduce((a, d) => a + (d.Clicks || 0), 0);

if (!days.length && !(queries || []).length) {
  console.log("Bing: no data yet — normal for a new site (allow 3–5 days).");
  process.exit(0);
}

console.log(`Bing — last 7 days: ${impressions} impressions, ${clicks} clicks`);

// ---- top queries across the whole period
const byQuery = new Map();
for (const q of queries || []) {
  const k = q.Query || "(unknown)";
  const cur = byQuery.get(k) || { impressions: 0, clicks: 0 };
  cur.impressions += q.Impressions || 0;
  cur.clicks += q.Clicks || 0;
  byQuery.set(k, cur);
}

const top = [...byQuery.entries()]
  .sort((a, b) => b[1].impressions - a[1].impressions)
  .slice(0, 8);

if (!top.length) {
  console.log("No query data yet — the sitemap was accepted but nothing has been searched for.");
} else {
  console.log("Top queries:");
  for (const [q, v] of top) {
    console.log(`  ${String(v.impressions).padStart(4)} imp  ${String(v.clicks).padStart(3)} clk  ${q}`);
  }
}

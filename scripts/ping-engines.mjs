#!/usr/bin/env node
/**
 * Free search-engine discovery pings — no account, no posting, no paid service.
 *
 * Reads every URL from sitemap.xml and submits them to:
 *   - Bing Webmaster Tools API   -> Bing, DuckDuckGo, Yahoo, Ecosia, Copilot
 *   - IndexNow fan-out           -> Bing, Yandex, Seznam, Naver
 *
 * Google has no public unauthenticated submission API (its sitemap ping was
 * retired). Googlebot discovers this site through the sitemap in robots.txt and
 * through the public GitHub repo / profile README backlinks instead.
 *
 * Usage:  BING_API_KEY=xxxx node scripts/ping-engines.mjs
 * Nothing throws: a failed engine is logged and the rest still run.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const BASE = "https://massimojj.github.io/mg-ghanbari";
const SITE = BASE + "/";
const TIMEOUT = 20000;

const urls = [...readFileSync(join(ROOT, "sitemap.xml"), "utf8")
  .matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

const bingKey = (process.env.BING_API_KEY || "").trim();
const keyFile = readdirSync(ROOT).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
const indexNowKey = keyFile ? readFileSync(join(ROOT, keyFile), "utf8").trim() : "";

console.log(`ping-engines: ${urls.length} urls from sitemap.xml`);

async function post(url, body) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT),
  });
}

// ---- 1. Bing Webmaster Tools (verified via BingSiteAuth.xml) -------------
if (!bingKey) {
  console.log("Bing API: no BING_API_KEY set — skipped");
} else {
  try {
    const q = await fetch(
      `https://ssl.bing.com/webmaster/api.svc/json/GetUrlSubmissionQuota` +
      `?apikey=${bingKey}&siteUrl=${encodeURIComponent(SITE)}`,
      { signal: AbortSignal.timeout(TIMEOUT) }
    );
    const quota = q.ok ? (await q.json())?.d?.DailyQuota : null;
    const allowance = Math.min(urls.length, 100, quota === null ? 100 : quota);
    if (allowance <= 0) {
      console.log(`Bing API: daily quota exhausted (${quota} left) — will retry on next run`);
    } else {
      const res = await fetch(
        `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${bingKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ siteUrl: SITE, urlList: urls.slice(0, allowance) }),
          signal: AbortSignal.timeout(TIMEOUT),
        }
      );
      const text = await res.text();
      console.log(`Bing API: submitted ${allowance} urls -> HTTP ${res.status} ${text.slice(0, 120)}`);
    }
  } catch (err) {
    console.log(`Bing API: failed (non-fatal): ${err.message}`);
  }
}

// ---- 2. IndexNow fan-out (Bing, Yandex, Seznam, Naver) ------------------
// One payload, several endpoints: some engines reject keys hosted on a shared
// host like github.io, so fan out instead of relying on the aggregator alone.
if (!indexNowKey) {
  console.log("IndexNow: no 32-hex key file found — skipped");
} else {
  const payload = {
    host: new URL(BASE).host,
    key: indexNowKey,
    keyLocation: `${BASE}/${keyFile}`,
    urlList: urls,
  };
  const endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
    "https://yandex.com/indexnow",
    "https://search.seznam.cz/indexnow",
  ];
  for (const ep of endpoints) {
    try {
      const res = await post(ep, payload);
      const ok = res.status === 200 || res.status === 202;
      console.log(`IndexNow ${new URL(ep).hostname}: HTTP ${res.status}${ok ? " accepted" : ""}`);
    } catch (err) {
      console.log(`IndexNow ${new URL(ep).hostname}: failed (non-fatal): ${err.message}`);
    }
  }
}

console.log("ping-engines: done");

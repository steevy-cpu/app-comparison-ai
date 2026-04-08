#!/usr/bin/env node
// IndexNow URL submission utility for AppRival
// Usage: node scripts/indexnow.mjs <url1> <url2> ...
// Notifies Bing, Yandex, and other IndexNow-compatible search engines of new/updated URLs.

const API_KEY = process.env.INDEXNOW_KEY;
if (!API_KEY) throw new Error('INDEXNOW_KEY environment secret is not set — add it to GitHub Actions secrets');
const HOST = 'apprival.net';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

async function submitUrls(urls) {
  if (!urls.length) {
    console.log('IndexNow: No URLs to submit.');
    return;
  }

  console.log(`IndexNow: Submitting ${urls.length} URL(s)...`);
  urls.forEach(u => console.log(`  → ${u}`));

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: HOST,
        key: API_KEY,
        keyLocation: `https://${HOST}/${API_KEY}.txt`,
        urlList: urls,
      }),
    });

    if (res.ok || res.status === 202) {
      console.log(`IndexNow: ✓ Submitted successfully (${res.status})`);
    } else {
      const text = await res.text();
      console.warn(`IndexNow: ⚠ Response ${res.status}: ${text}`);
    }
  } catch (err) {
    console.warn(`IndexNow: ⚠ Failed to submit: ${err.message}`);
  }
}

// CLI entry point
const urls = process.argv.slice(2).filter(u => u.startsWith('https://'));

if (urls.length === 0) {
  console.log('IndexNow: No URLs provided. Usage: node scripts/indexnow.mjs <url1> <url2> ...');
  process.exit(0);
}

submitUrls(urls).catch(err => {
  console.error('IndexNow: Fatal error:', err.message);
  process.exit(1);
});

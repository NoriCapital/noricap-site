// Checks heytilo.ai pages before publishing.
// Usage: node check-pages.js <base-url> [paths...] [--shots <dir>]
// Default paths: every page in sitemap.xml. Needs Playwright (preinstalled in Claude's workspace).
'use strict';
const path = require('path');
const { chromium } = require(require.resolve('playwright', { paths: [process.cwd(), '/usr/lib/node_modules', '/usr/local/lib/node_modules'] }));

const args = process.argv.slice(2);
const base = (args.shift() || 'http://localhost:8088').replace(/\/$/, '');
const shotIdx = args.indexOf('--shots');
const shots = shotIdx >= 0 ? args.splice(shotIdx, 2)[1] : null;

(async () => {
  let paths = args;
  if (!paths.length) {
    const sm = await (await fetch(base + '/sitemap.xml')).text();
    paths = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  }
  const browser = await chromium.launch();
  const problems = [];
  const links = new Map();
  for (const p of paths) {
    for (const w of [1366, 390]) {
      const page = await browser.newPage({ viewport: { width: w, height: 900 } });
      const errs = [];
      page.on('pageerror', (e) => errs.push(e.message));
      // Resource load failures are left out: fonts and analytics are blocked in some sandboxes, and the
      // homepage's /.netlify/functions/issues only exists on Netlify. Broken internal links are checked below.
      page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
      const res = await page.goto(base + p, { waitUntil: 'load' });
      await page.waitForTimeout(300);
      if (!res || res.status() >= 400) problems.push(`${p}: HTTP ${res && res.status()}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (overflow > 0) problems.push(`${p} @${w}px: scrolls sideways by ${overflow}px`);
      if (errs.length) problems.push(`${p} @${w}px: console errors: ${errs.slice(0, 3).join(' | ')}`);
      if (w === 1366) {
        const info = await page.evaluate(() => ({
          canon: document.querySelector('link[rel=canonical]')?.href || '',
          old: [...document.querySelectorAll('a[href],link[href],script[src],img[src]')].map((e) => e.getAttribute('href') || e.getAttribute('src')).filter((v) => /noricap\.com/.test(v || '')),
          internal: [...document.querySelectorAll('a[href]')].map((a) => a.href).filter((h) => h.startsWith(location.origin)),
        }));
        if (info.old.length) problems.push(`${p}: old noricap.com links: ${[...new Set(info.old)].join(', ')}`);
        if (info.canon && !/^https:\/\/heytilo\.ai\//.test(info.canon)) problems.push(`${p}: canonical is ${info.canon}`);
        for (const h of info.internal) { const u = new URL(h); if (!links.has(u.pathname)) links.set(u.pathname, p); }
      }
      if (shots) await page.screenshot({ path: path.join(shots, `${p.replace(/[^a-z0-9]+/gi, '_') || 'home'}-${w}.png`), fullPage: true });
      await page.close();
    }
  }
  for (const [lp, from] of links) {
    const get = async (u) => { const r = await fetch(u); await r.arrayBuffer().catch(() => {}); return r.status; };
    let status = await get(base + lp);
    // Netlify serves /page as /page.html (and _redirects adds short URLs); a plain local server doesn't.
    if (status === 404 && !/\.[a-z]+$/.test(lp) && !lp.endsWith('/')) status = await get(base + lp + '.html');
    if (status >= 400) problems.push(`broken link ${lp} (from ${from}): HTTP ${status}`);
  }
  await browser.close();
  console.log(problems.length ? 'PROBLEMS:\n- ' + problems.join('\n- ') : `OK: ${paths.length} page(s), ${links.size} internal link(s) checked`);
  process.exit(problems.length ? 1 : 0);
})();

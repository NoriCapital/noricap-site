// Makes a Tilo newsletter cover image (1600x1000 JPG) in img/news/<slug>.jpg.
// Usage (from the repo root):
//   node tools/news-cover/make-cover.js <slug> <Federal|State|Local> "<big>" "<line>" [stone|peach|ink]
// <big> is a short figure or date (e.g. "$50K", "Nov 20", "75%"), at most 7 characters.
// <line> is one plain sentence fragment explaining it, under about 70 characters, and must be true and sourced in the issue.
// Needs Playwright (require('playwright')) and its Chromium. Publish the image by committing and pushing; it is then at
// https://heytilo.ai/img/news/<slug>.jpg (use that as the Beehiiv thumbnail_image_url).
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const [slug, kicker, big, sub, theme = 'stone'] = process.argv.slice(2);
if (!slug || !kicker || !big || !sub) { console.error('usage: make-cover.js <slug> <level> "<big>" "<line>" [stone|peach|ink]'); process.exit(1); }
if (!/^[a-z0-9-]+$/.test(slug)) { console.error('slug must be lowercase letters, numbers and hyphens'); process.exit(1); }
const themes = {
  ink:   { bg:'#120C08', fg:'#F9F8F5', sub:'#CFC8BD', acc:'#FF8A2E', rule:'#3A322C', mark:'#F9F8F5', markT:'#120C08' },
  stone: { bg:'#EDE8DE', fg:'#120C08', sub:'#4A4440', acc:'#B84E00', rule:'#D8D1C0', mark:'#120C08', markT:'#F9F8F5' },
  peach: { bg:'#FFE9D6', fg:'#120C08', sub:'#4A4440', acc:'#B84E00', rule:'#F2CDAE', mark:'#120C08', markT:'#F9F8F5' },
};
const c = themes[theme] || themes.stone;
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const fonts = path.join(__dirname, 'fonts');
const ff = (fam, w, file, style='normal') => `@font-face{font-family:'${fam}';font-weight:${w};font-style:${style};src:url(file://${fonts}/${file})}`;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${ff('Newsreader',300,'newsreader-latin-300-normal.woff2')}${ff('Newsreader',400,'newsreader-latin-400-normal.woff2')}
${ff('DM Sans',400,'dm-sans-latin-400-normal.woff2')}${ff('DM Sans',500,'dm-sans-latin-500-normal.woff2')}
${fs.existsSync(path.join(fonts,'dm-sans-latin-600-normal.woff2')) ? ff('DM Sans',600,'dm-sans-latin-600-normal.woff2') : ''}
${fs.existsSync(path.join(fonts,'dm-sans-latin-700-normal.woff2')) ? ff('DM Sans',700,'dm-sans-latin-700-normal.woff2') : ''}
*{margin:0;box-sizing:border-box}body{width:1600px;height:1000px;background:${c.bg};color:${c.fg};font-family:'DM Sans';padding:130px;display:flex;flex-direction:column;justify-content:space-between}
.top{display:flex;justify-content:space-between;align-items:center}
.brand{display:flex;align-items:center;gap:16px;font-weight:600;font-size:40px;letter-spacing:-0.04em}
.m{width:52px;height:52px;border-radius:12px;background:${c.mark};color:${c.markT};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:34px;letter-spacing:0}
.k{font-size:24px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:${c.acc}}
.big{font-family:Newsreader;font-weight:300;font-size:${big.length>4?230:280}px;line-height:.9;letter-spacing:-0.035em}
.sub{font-family:Newsreader;font-weight:400;font-size:62px;line-height:1.12;letter-spacing:-0.01em;color:${c.sub};max-width:1200px;margin-top:22px}
.bot{display:flex;justify-content:space-between;border-top:2px solid ${c.rule};padding-top:22px;font-size:22px;color:${c.sub};letter-spacing:.04em}
</style></head><body><div class="top"><div class="brand"><div class="m">T</div>tilo</div><div class="k">${esc(kicker)}</div></div>
<div><div class="big">${esc(big)}</div><div class="sub">${esc(sub)}</div></div>
<div class="bot"><span>news.heytilo.ai</span><span>Funding guide</span></div></body></html>`;
(async () => {
  const out = path.join(__dirname, '..', '..', 'img', 'news', `${slug}.jpg`);
  const tmp = path.join(require('os').tmpdir(), `cover-${slug}.html`);
  fs.writeFileSync(tmp, html);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
  await p.goto('file://' + tmp);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(200);
  await p.screenshot({ path: out, type: 'jpeg', quality: 86 });
  await b.close();
  console.log(out);
})();

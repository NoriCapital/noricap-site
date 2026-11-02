// Adds an email to the Unboring newsletter on Beehiiv. Needs BEEHIIV_API_KEY in Netlify's
// environment variables; until it's set, the page falls back to Beehiiv's own sign-up page.
const PUB = process.env.BEEHIIV_PUBLICATION_ID || 'pub_33fc39da-0050-4b90-9654-59c87c8b3bf5';
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'method' });
  const origin = req.headers.get('origin') || '';
  if (origin && !/^https:\/\/([a-z0-9-]+\.)*noricap\.com$|^https:\/\/[a-z0-9-]+--[a-z0-9-]+\.netlify\.app$|^http:\/\/localhost(:\d+)?$/.test(origin)) return json(403, { error: 'origin' });
  let data;
  try { data = await req.json(); } catch { return json(400, { error: 'bad request' }); }
  if (data.website) return json(200, { ok: true }); // honeypot: bots fill hidden fields
  const email = String(data.email || '').trim().toLowerCase();
  if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(email)) return json(400, { error: 'email' });
  if (!process.env.BEEHIIV_API_KEY) return json(503, { error: 'not configured' });
  const r = await fetch(`https://api.beehiiv.com/v2/publications/${PUB}/subscriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email, reactivate_existing: false, send_welcome_email: true,
      utm_source: 'noricap.com', utm_medium: String(data.source || 'website').slice(0, 40), referring_site: 'https://noricap.com',
    }),
  });
  if (!r.ok) { console.error('beehiiv', r.status, (await r.text()).slice(0, 300)); return json(502, { error: 'newsletter' }); }
  return json(200, { ok: true });
};

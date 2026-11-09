// Adds an email to the Tilo newsletter on Beehiiv. Needs BEEHIIV_API_KEY in Netlify's
// environment variables; until it's set, the page falls back to Beehiiv's own sign-up page.
const PUB = process.env.BEEHIIV_PUBLICATION_ID || 'pub_33fc39da-0050-4b90-9654-59c87c8b3bf5';
// Welcome automations in Beehiiv (each has an "Added by API" trigger). Beehiiv's "Signed up"
// trigger skips API sign-ups, so each sign-up is enrolled in its welcome automation directly.
const WELCOME_MAIN = 'aut_eb1a1667-9fa7-4bba-86b7-55d9ba9db8cb';
const WELCOME_TEMPLATE = 'aut_949c3d59-b954-4063-9640-46a20314e372';
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const add = (payload) => fetch(`https://api.beehiiv.com/v2/publications/${PUB}/subscriptions`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'method' });
  const origin = req.headers.get('origin') || '';
  if (origin && !/^https:\/\/([a-z0-9-]+\.)*(noricap\.com|heytilo\.ai)$|^https:\/\/[a-z0-9-]+--[a-z0-9-]+\.netlify\.app$|^http:\/\/localhost(:\d+)?$/.test(origin)) return json(403, { error: 'origin' });
  let data;
  try { data = await req.json(); } catch { return json(400, { error: 'bad request' }); }
  if (data.website) return json(200, { ok: true }); // honeypot: bots fill hidden fields
  // Bots submit within a moment of the page loading; people take longer. Pretend success so they move on.
  if (!(Number(data.elapsed) >= 3000)) { console.log('subscribe blocked: too_fast'); return json(200, { ok: true }); }
  const email = String(data.email || '').trim().toLowerCase();
  if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(email)) return json(400, { error: 'email' });
  if (!process.env.BEEHIIV_API_KEY) return json(503, { error: 'not configured' });
  const source = String(data.source || 'website').slice(0, 40);
  const base = {
    email, reactivate_existing: false, send_welcome_email: true,
    utm_source: 'heytilo.ai', utm_medium: source, referring_site: 'https://heytilo.ai',
  };
  let r = await add({ ...base, automation_ids: [source === 'template-optin' ? WELCOME_TEMPLATE : WELCOME_MAIN] });
  if (!r.ok && r.status >= 400 && r.status < 500 && r.status !== 429) {
    // If Beehiiv refuses the automation (e.g. it was paused), still subscribe the reader.
    console.error('beehiiv (retrying without automation)', r.status, (await r.text()).slice(0, 300));
    r = await add(base);
  }
  if (!r.ok) { console.error('beehiiv', r.status, (await r.text()).slice(0, 300)); return json(502, { error: 'newsletter' }); }
  return json(200, { ok: true });
};

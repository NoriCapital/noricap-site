// The latest Unboring issues for the newsletter section on noricap.com: title, subtitle, date and
// link, straight from Beehiiv. Cached at Netlify's edge for an hour so Beehiiv is asked rarely.
const PUB = process.env.BEEHIIV_PUBLICATION_ID || 'pub_33fc39da-0050-4b90-9654-59c87c8b3bf5';
const json = (status, body, maxAge) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=300, s-maxage=${maxAge}` },
});

export default async () => {
  if (!process.env.BEEHIIV_API_KEY) return json(503, { issues: [] }, 60);
  try {
    const r = await fetch(`https://api.beehiiv.com/v2/publications/${PUB}/posts?status=confirmed&limit=6&order_by=publish_date&direction=desc`, {
      headers: { Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}` }, signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return json(502, { issues: [] }, 60);
    const data = (await r.json()).data || [];
    const issues = data
      .filter((p) => p.web_url && (p.publish_date || 0) * 1000 <= Date.now() && !p.hidden_from_feed)
      .slice(0, 4)
      .map((p) => ({ title: String(p.title || '').slice(0, 160), subtitle: String(p.subtitle || '').slice(0, 220), url: p.web_url, date: p.publish_date }));
    return json(200, { issues }, 3600);
  } catch {
    return json(502, { issues: [] }, 60);
  }
};

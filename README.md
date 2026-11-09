# heytilo.ai (formerly noricap.com)

The marketing site for Tilo, the AI CFO. Plain static HTML with no build step.

Netlify deploys this repository automatically on every push to `main`:
build command none, publish directory `.` (the repository root).

- `index.html`: homepage
- `guides/`: articles
- `_redirects`: retired /sample/ and /demo/ pages point to the homepage
- Netlify Forms: `partners` and `questions` (detected from the HTML at deploy)

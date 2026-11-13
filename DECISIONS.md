# Tilo decisions log

Business decisions that change what customers see or pay: pricing, plans, brand, legal name, addresses, domains, claims on the site. Newest first. The same log lives in both repos (`noricap-site` and `noricap-app`); add a new entry to both.

**Rule for both Claude sessions (Philip's and Pratibha's):** before changing anything listed above, read this file. After making such a change, add a line: date, who decided, what changed, where. If a change reverses an earlier entry, say so. Don't change a decision someone else made without asking the person you're working with first.

| Date | Who | Decision | Where it shows |
|---|---|---|---|
| 2026-11-12 | Philip | New accounts confirm their email address before starting the trial or joining a team (closes the invitation-capture gap from the security review); app emails now come from no-reply@heytilo.ai | App sign-up, emails |
| 2026-11-12 | Philip | Stripe moved to Tilo LLC: legal name TILO LLC with Tilo LLC's EIN, payouts to Tilo LLC's Chase account, card statements read HEYTILO.AI (short form TILO), support email hello@heytilo.ai, terms and privacy links on heytilo.ai | Stripe |
| 2026-11-11 | Philip (security review, approved without review) | Sample company: Ask Tilo answers 10 questions a day per person; admins need a database flag as well as an admin email address | App |
| 2026-11-11 | Philip | Keep this decisions log in both repos; both Claude sessions check it before pricing, brand or policy changes | DECISIONS.md, CLAUDE.md |
| 2026-11-09 | Philip | App emails send as "Tilo"; sending address to move to no-reply@heytilo.ai once Resend verifies heytilo.ai (until then no-reply@noricap.com); replies go to hello@heytilo.ai | Render EMAIL_FROM, src/lib/mail.js |
| 2026-11-09 | Philip | Company is Tilo LLC (Wyoming; formed, final documents pending). Terms and Privacy name Tilo LLC | terms.html, privacy.html |
| 2026-11-09 | Philip | No "Nori" or "Nori Cap" anywhere customers look; everything says Tilo. Stripe keeps Nori Capital LLC until Tilo LLC's bank account is connected | Site, app, emails |
| 2026-11-09 | Philip | Contact email everywhere is hello@heytilo.ai (alias of pa@noricap.com) | Site, app |
| 2026-11-09 | Philip | Site moved to heytilo.ai, app to app.heytilo.ai; old noricap.com addresses forward | Netlify, Render, Squarespace DNS |
| 2026-11-09 | Philip | Netlify upgraded to Pro ($20/month, 3,000 credits) | Netlify billing |
| 2026-11-09 | Philip | Tilo app ($799) gets its own card on the Pricing page | pricing.html |
| 2026-11-09 | Philip, Pratibha | Pricing page plans: Collections agent $349/month, Bookkeeping from $499/month, Scale $1,500 to $5,000/month (sold through "Talk to us") | pricing.html, homepage |
| 2026-11-09 | Pratibha | App price for new sign-ups is $799/month after a 7-day free trial (was $499); existing subscribers keep their price | App checkout, site, terms |
| 2026-11-09 | Pratibha | Collections agent listed as available while it is still being built (the app flags late payers but doesn't send reminders yet) | pricing.html, homepage |
| 2026-11-09 | Pratibha | The five homepage "Tilo wins" results are real, shown without "example" labels | Homepage |
| 2026-11-05 | Philip | Product and newsletter renamed Tilo (from Nori and Unboring); newsletter mailing address PO Box 331338, Murfreesboro, TN 37133 | Everywhere |
| 2026-11-04 | Philip | Site repo made public on GitHub so both accounts can publish | GitHub |
| 2026-11-04 | Philip | App price $499/month after a 7-day free trial, no review call (later changed to $799 on 2026-11-09) | App, site |

## Open questions (not decided yet)

- Which industry to focus marketing on first. Current lean: HVAC, plumbing and electrical, with automotive and transport as a second test (listings data, 2026-11-10). Not decided.
- Whether to roll up small bookkeeping and tax firms. Not decided.
- Bookkeeping "from $499" includes the Tilo app, which costs $799 on its own; wording or pricing to be settled by Philip and Pratibha.

# Monetization

Revenue options ranked by fit with a trust-first cost estimator.

## Principles

1. **Estimates stay neutral** — affiliates cannot inflate or hide cost lines.
2. **Free tier must be genuinely useful** — adoption drives everything.
3. **Paid features = power user workflow**, not hiding basic truth behind paywall.

## Model comparison

| Model | Fit | Notes |
|-------|-----|-------|
| **Freemium subscription** | ★★★★★ | Business mode, compare, export, data updates |
| **One-time Pro purchase** | ★★★ | Simpler but weak recurring revenue |
| **Affiliate / referrals** | ★★★★ | Insurance, warranties, lenders — label clearly |
| **B2B agent license** | ★★★★ | Co-branded reports for clients |
| **Data/API licensing** | ★★ | Long-term if datasets become valuable |
| **Ads in extension** | ★ | Destroys trust; avoid |

## Recommended stack

### Free tier

- Zillow (and 1–2 sites) support
- Owner-occupier estimate
- Basic profile (credit tier, spending style)
- Monthly breakdown + capex timeline
- Local save up to 5 listings

### Pro (~$6–12/mo or ~$59/yr)

- Unlimited saved listings + compare table (web sync)
- **Business / rental mode** with cash-flow view
- Export PDF/CSV for investors
- Multiple profiles
- Priority regional data updates
- Short-term rental assumptions (when shipped)

### Team / Agent (~$29–49/mo)

- Everything in Pro
- Client-ready PDF with agent branding
- Bulk compare (e.g. 20 listings)
- Early site adapters

## Affiliate opportunities (optional module)

Show **after** estimate, clearly separated:

| Partner type | UX | Ethics |
|--------------|-----|--------|
| Insurance quote | "Get quotes near this estimate" | Do not replace insurance line with affiliate quote as "the number" |
| Home warranty | "Optional warranty vs self-insuring" | Show as scenario, not default |
| Mortgage refinance | Only in settings/education | No rate manipulation |

FTC: disclose "We may earn a fee if you use this link."

## B2B: real estate agents

Agents want clients to understand affordability beyond pre-approval.

Offer:

- Embeddable report link per listing
- "Powered by List Price Plus" on agent site
- Volume pricing

Sales motion: Facebook agent groups, broker partnerships.

## B2B: property managers / small investors

Pro features align with existing workflow (capex reserves). Content marketing: "True cost of rental property" calculators driving extension installs.

## What not to monetize early

- Paywalling tax or mortgage lines — users bounce
- Selling aggregated browsing data — reputational kill
- Crypto / lead spam

## Revenue projections (illustrative)

Assumptions: 50k installs year 1, 3% Pro conversion, $8/mo avg

| Stream | Year 1 (rough) |
|--------|----------------|
| Pro subscriptions | 50k × 3% × $8 × 6 mo avg ≈ **$72k** |
| Affiliates | Highly variable; **$10–40k** if careful |
| Agent tier | 100 seats × $35 × 6 mo ≈ **$21k** |

Conservative total **$50–100k ARR** year 1 with decent marketing — not guaranteed; validates side-project to small business scale.

## Payment infrastructure

- **Stripe** for web subscriptions
- Extension: license key via account login, or Chrome Web Store payments (limited) — prefer web account + token in extension

## Metrics to track

- Install → profile complete → first estimate → day-7 retention
- Free → Pro conversion trigger (which feature clicked before paywall)
- Churn on Pro
- Affiliate click-through vs. user satisfaction

## Open decision

Launch **fully free** for 3–6 months to build reviews and adapters, then introduce Pro — recommended for store ranking and trust.

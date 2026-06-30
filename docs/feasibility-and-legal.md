# Feasibility and legal

## Can this work technically?

**Yes.** Similar extensions exist for crime maps, school overlays, and rent calculators. The hard parts are:

| Challenge | Mitigation |
|-----------|------------|
| Site DOM changes | Versioned adapters; quick release cycle; manual override |
| Missing data on listing | Regional defaults + wide ranges + confidence labels |
| Utility bill accuracy | Benchmark models, not bills; user can refine |
| SPA navigation | URL + history listeners |
| Extension store rejection | Clear privacy policy; minimal permissions; no scraping off-site |

Accuracy target: **directionally correct** monthly total within ~15–25% for a typical US SFH when listing tax/sqft present — not accounting-grade.

## Can it work as a business?

**Yes**, if distribution (Chrome Web Store SEO, Reddit/RE forums, agent partnerships) and trust (neutral numbers) are executed. Real estate tools have willing payers (investors, agents). See [monetization.md](monetization.md).

## Legal and terms of service

### Not legal advice

Consult an attorney before launch. This doc flags issues for discussion.

### Zillow / third-party site ToS

Real estate sites generally:

- Allow **personal browsing**
- Restrict **automated scraping**, **bulk extraction**, and **commercial reuse of their data**

A browser extension that:

- Runs **only when the user visits** a page they already loaded
- Reads **visible page content** in the user's browser (like a user copying numbers)
- Does **not** bulk crawl, resell Zillow data, or republish listings

…is a **gray area** but **common** for extensions. Risk remains that Zillow could change ToS or block injection.

**Risk reduction:**

- Do not store or transmit full listing HTML to servers (v1)
- Do not display Zillow trademarks in a way that implies partnership
- Do not redistribute listing photos or descriptions
- Provide estimates derived from **user-visible facts** + **your own models/datasets**
- Support **manual entry** so product works without any site adapter

### Intellectual property

- **List Price Plus brand, UI, cost engine, datasets:** yours
- **Listing content:** belongs to site/MLS; don't cache long-term or build a competing index

### Financial regulations

- Estimates are **not** loan offers, insurance quotes, or investment advice
- Prominent disclaimer; no guaranteed returns in investor mode
- Affiliate links labeled per FTC guidelines

### Privacy

| Data | v1 handling |
|------|-------------|
| Property address | Process locally; optional save local-only |
| User profile | `chrome.storage.local` |
| Analytics | Opt-in only; no address in events |

GDPR/CCPA: if accounts added, privacy policy + export/delete.

### Accessibility (legal)

- Panel UI: WCAG 2.1 AA target
- Disability **profile** affects cost assumptions only with explicit consent

## Accuracy disclaimer (product copy draft)

> List Price Plus provides estimated monthly property-related costs based on public listing information, regional benchmarks, and your settings. Actual costs vary. This is not financial, insurance, or tax advice. Verify all figures with qualified professionals before making decisions.

## Competitive / platform risk

| Risk | Severity | Notes |
|------|----------|-------|
| Zillow blocks extension DOM | Medium | Fallback web calc; other sites |
| Chrome policy change | Low | MV3 compliant design |
| Liability from wrong estimate | Medium | Disclaimers; ranges; no "approval" language |
| Incumbent adds feature | Medium | Differentiate on capex timeline + profiles + investor mode |

## Open questions for counsel

1. Is localized DOM parsing on user-initiated page views distinct from "scraping" under Zillow ToS?
2. Do MLS rules apply to facts shown on public Zillow pages when reused in a derivative calculation?
3. State-specific requirements for insurance referral or mortgage lead fees if affiliates added?

## Feasibility verdict

| Dimension | Verdict |
|-----------|---------|
| Technical MVP on Zillow | **Feasible** in 6–10 weeks for one developer |
| Multi-browser | **Feasible** with WXT |
| Useful without perfect data | **Yes** with ranges |
| Legal risk zero | **No** — mitigate with policy and design choices |
| Monetizable | **Yes** — freemium + B2B paths |

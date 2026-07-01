# Site adapter priority

Where List Price Plus should work next, and why. Optimized for **Indiana realtors** (FC Tucker, regional MLS sites) while building toward national coverage.

## How we pick sites

| Factor | Weight |
|--------|--------|
| Mom / pilot users actually browse listings there | Highest |
| Public page has price + sqft + beds (extraction viability) | High |
| Adapter reuse (same parent company or SPA patterns) | Medium |
| Store marketing (“works on X”) | Medium |
| Franchise subdomain complexity | Negative |

One adapter per **concrete URL pattern**, not “all of RE/MAX.”

---

## Tier 1 — Do next (best ROI)

### 1. FC Tucker (`talktotucker.com`) — shipped v1

| | |
|--|--|
| **Why** | Mom's brokerage — primary Indiana listing site |
| **URL** | `talktotucker.com/homes/{address-slug}/{listing-id}` |
| **Next** | Validate on 3+ live Tucker listings; save HTML fixtures if DOM differs |

### 2. Redfin (`redfin.com`) — shipped v1

| | |
|--|--|
| **URL** | `redfin.com/.../home/{listing-id}` |
| **Next** | Live QA on Indiana listings |

### 3. Realtor.com (`realtor.com`) — shipped v1

| | |
|--|--|
| **URL** | `realtor.com/realestateandhomes-detail/...` |
| **Next** | Live QA — site uses bot protection; extension runs in user's normal browser |

---

## Tier 2 — Strong follow-ups

### 4. Trulia (`trulia.com`)

Zillow Group — extraction patterns may overlap with Zillow (JSON-LD, similar hydration). Good if clients use Trulia branding instead of Zillow.

### 5. Homes.com (`homes.com`)

Growing portal; often similar listing detail layout to other national sites.

### 6. One RE/MAX office site (not all of remax.com)

Pick **one** subdomain mom uses (e.g. a local office). Franchise sites differ — do not boil the ocean.

---

## Tier 3 — Later or niche

| Site | Notes |
|------|-------|
| **Coldwell Banker / BHHS** | Franchise subdomains — same “one office first” rule |
| **Apartments.com** | Renters; different cost model (needs rental-focused UX) |
| **LoopNet** | Commercial — out of scope for residential POC |
| **Facebook Marketplace / Craigslist** | Unstructured; low reliability |

---

## Indiana-specific brokers (ask mom)

Before building, ask which sites she opens in a typical week:

- FC Tucker
- MIBOR / local MLS consumer portals (if any public listing URLs)
- Berkshire Hathaway HomeServices Indiana
- Century 21 Scheetz (Indiana)

**Build adapters for URLs she actually uses**, not a generic national list.

---

## Suggested build order

```text
Zillow (done) → FC Tucker → Redfin OR Realtor.com → Trulia → second regional broker
```

Parallel track: **Phase 9 polish** (privacy, store) does not block adapter work — different files, can interleave.

---

## Per-site checklist (before marking “supported”)

1. 3+ live listing URLs saved as sanitized HTML fixtures
2. Automated tests: fixture → expected `PropertyFacts`
3. Manual row on [extraction-checklist.md](extraction-checklist.md)
4. Registry entry + `host_permissions` in `wxt.config.ts`
5. Popup / home page “supported sites” list updated

See [data-sources.md](data-sources.md) for field-level extraction notes.

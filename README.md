# List Price Plus

**Realistic monthly property cost estimates — on the listing page.**

List Price Plus is a browser extension (with an optional companion web app) that shows the full picture of what it actually costs to live in or operate a property. It works on real estate listing sites like Zillow and surfaces mortgage, taxes, insurance, utilities, maintenance reserves, and scheduled capital expenses — adjusted for your personal profile.

> **Status:** Phase 0 complete — extension scaffold + Firebase Hosting live at https://list-price-plus.web.app

---

## The problem

Listing sites show price, beds, and baths. They rarely answer: *"What will this place cost me every month, realistically?"*

Buyers underestimate ongoing costs. Investors miss capex timing. Renters don't see utility and fee load. List Price Plus fills that gap without leaving the listing.

---

## What List Price Plus estimates

| Category | Examples |
|----------|----------|
| **Financing** | Mortgage payment, PMI, interest rate by credit tier |
| **Fixed carrying costs** | Property tax, HOA, landlord/rental insurance |
| **Utilities** | Electric, gas, water/sewer, trash, internet — sized to sqft, climate, occupancy |
| **Routine maintenance** | Lawn, pest, filters, minor repairs |
| **Capital expenditures** | Roof, HVAC, water heater, appliances — scheduled by age and lifespan |
| **Amenities** | Pool, septic, well, solar, EV charger |
| **Business mode** | Vacancy, management fees, capex reserve, depreciation (informational) |

Food, furniture, and general lifestyle spending are **out of scope** — only costs tied to the property.

---

## Recommended form factor

| Layer | Role |
|-------|------|
| **Browser extension** (primary) | Injects a cost panel on listing pages; reads page data |
| **Shared calculation engine** | TypeScript library used by extension + web |
| **Companion website** (phase 2) | Account, settings sync, compare saved listings, business reports |

See [docs/architecture.md](docs/architecture.md) and [docs/extension-strategy.md](docs/extension-strategy.md).

---

## Project structure

```
list-price-plus/
├── docs/
├── packages/core/           # Cost engine, profiles, capex scheduler
├── extension/               # Browser extension
├── web/                     # Companion site
└── data/                    # Regional defaults, lifespan tables
```

---

## Getting started

### Browser extension (local — no store needed)

```bash
pnpm install
pnpm dev
```

Then in Chrome: `chrome://extensions` → **Developer mode** → **Load unpacked** → select `extension/.output/chrome-mv3-dev`.

See [extension/README.md](extension/README.md) for Chrome, Firefox, and Edge steps.

### Web app

```bash
pnpm dev:web          # local
pnpm deploy:hosting   # deploy to Firebase
```

Live: https://list-price-plus.web.app

Firebase manual steps: [docs/firebase-setup.md](docs/firebase-setup.md)

---

## Documentation index

| Document | Contents |
|----------|----------|
| [docs/roadmap.md](docs/roadmap.md) | Development roadmap |
| [docs/firebase-setup.md](docs/firebase-setup.md) | Firebase console steps |
| [docs/hosting.md](docs/hosting.md) | Hosting strategy & costs |
| [docs/product-vision.md](docs/product-vision.md) | Goals, personas, scope |

---

## Disclaimer

List Price Plus provides **estimates for informational purposes only**, not financial, legal, or tax advice. Actual costs vary by property condition, region, and provider.

# Extension strategy

## Why extension first

| Approach | Pros | Cons |
|----------|------|------|
| **Browser extension** | Zero context switch; reads live listing data; best UX on Zillow | Store review; site breakage; per-browser packaging |
| **Website only** | Easier deploy; no store policies | User must copy/paste address and facts; friction kills adoption |
| **Bookmarklet** | No store | Weak permissions story; users don't install bookmarklets |
| **Mobile app** | — | Zillow browsing is desktop-heavy for research phase |

**Recommendation:** Ship **extension as primary**, add **companion website** for settings/compare, optional **manual-entry web** for unsupported sites.

## Browser support

All target **WebExtensions Manifest V3**:

| Browser | Store | Notes |
|---------|-------|-------|
| Chrome | Chrome Web Store | Primary dev target |
| Edge | Edge Add-ons | Same package, minor manifest tweaks |
| Firefox | AMO | `browser_specific_settings`; MV3 supported |
| Opera | Opera Add-ons | Chromium-based; Chrome build often works |

Use **[WXT](https://wxt.dev/)** or **Plasmo** for unified builds, or raw Vite + `@crxjs/vite-plugin`.

## Manifest sketch (draft)

```json
{
  "manifest_version": 3,
  "name": "List Price Plus — True Property Costs",
  "version": "0.1.0",
  "description": "See realistic monthly property costs on Zillow and more.",
  "permissions": ["storage"],
  "host_permissions": [
    "https://www.zillow.com/*"
  ],
  "action": {
    "default_popup": "popup.html"
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://www.zillow.com/homedetails/*"],
      "js": ["content.js"],
      "css": ["content.css"],
      "run_at": "document_idle"
    }
  ]
}
```

Add host permissions only as new site adapters ship.

## UI placement on Zillow

Options (test in UX research):

1. **Fixed side panel** (right dock) — always visible while scrolling
2. **Collapsible chip** on price header — expands to breakdown
3. **Browser side panel API** (Chrome) — native panel, less DOM fighting

Start with **Shadow DOM injected panel** to avoid CSS conflicts with Zillow.

Panel sections:

- Header: monthly total range + confidence badge
- Accordion: Financing, Taxes & fees, Utilities, Maintenance, Capex timeline, Pool/amenities
- Footer: "Adjust assumptions" → inline sliders / link to popup
- Disclaimer line

## Content script lifecycle

```
URL match → wait for shell → extract (retry 3x, 500ms backoff)
→ if missing critical fields, show "Help us fill in" form
→ compute → render
→ observe URL changes (SPA navigation) → re-run
```

Zillow is SPA-heavy; listen to `history.pushState` and popstate.

## Site adapter versioning

```
extension/adapters/
  zillow/
    v1.ts
    v2.ts   # when Zillow breaks v1
    index.ts  # tries v2, fallback v1
```

Telemetry (opt-in): which adapter version succeeded — no address.

## Settings UI (popup)

- Profile presets: thrifty / standard / comfortable
- Credit tier dropdown
- Down payment %, loan term
- Use case: live here / rental / STR
- Accessibility toggles (see user-profiles.md)
- Link: "Open full settings on web" (phase 2)

## Testing strategy

- **Fixture HTML:** saved Zillow pages (check legal — use sanitized mocks, not committed full pages if ToS restricts)
- **Parser unit tests** against HTML snippets in `extension/adapters/zillow/__fixtures__/`
- **Core integration:** PropertyFacts JSON → estimate snapshots
- **Manual:** extension loaded unpacked on live Zillow

## Store listing requirements

- Clear privacy policy: local processing, optional sync
- Single purpose description
- Screenshots: panel on listing, breakdown, settings
- No misleading "official Zillow" branding

## Fallback when extension fails

1. Show manual fact entry in panel
2. Link to `listpriceplus.app/calc?q=...` with URL-encoded partial facts (phase 2)

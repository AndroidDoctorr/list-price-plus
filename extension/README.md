# List Price Plus browser extension

Manifest V3 WebExtension built with [WXT](https://wxt.dev/) — Chrome, Edge, Firefox, and Opera from one codebase.

## Local development (no store required)

### Chrome / Edge

1. From repo root: `pnpm dev`
2. Open `chrome://extensions` (or `edge://extensions`)
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select `extension/.output/chrome-mv3-dev`

### Firefox

1. `pnpm --filter list-price-plus-extension dev:firefox`
2. Open `about:debugging` → **This Firefox** → **Load Temporary Add-on**
3. Pick any file inside `.output/firefox-mv3-dev` (e.g. `manifest.json`)

### Production-like build

```bash
pnpm --filter list-price-plus-extension build
pnpm --filter list-price-plus-extension build:firefox
```

Load from `.output/chrome-mv3` or `.output/firefox-mv3`.

## Store publishing (later)

| Browser | Portal | Notes |
|---------|--------|-------|
| Chrome | Chrome Web Store | One-time $5 developer fee |
| Firefox | AMO | Manual review, no fee |
| Edge | Partner Center | Often reuses Chrome package |

## Current behavior (Phase 0–1)

- Teal **"List Price Plus loaded"** badge on all pages (Phase 2 will restrict to Zillow)
- Popup with enable/disable toggle

See [docs/roadmap.md](../docs/roadmap.md) for next phases.

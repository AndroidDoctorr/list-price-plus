# List Price Plus browser extension

Manifest V3 WebExtension built with [WXT](https://wxt.dev/) — Chrome, Edge, Firefox, and Opera from one codebase.

## Local development — use your real Chrome

**Do not rely on the browser window WXT used to auto-open.** It launches a fresh, automation-style Chrome profile. Sites like Zillow treat that as a bot and show CAPTCHAs that never clear.

Instead:

1. **Terminal:** from repo root, run the dev watcher (rebuilds on save, no browser launch):
   ```bash
   pnpm dev
   ```
2. **Your normal Chrome:** open `chrome://extensions`
3. Enable **Developer mode**
4. **Load unpacked** → select `extension/.output/chrome-mv3-dev`
5. Browse Zillow in **that same Chrome**

Click **Reload** on `chrome://extensions` after pulling changes or when adding new manifest permissions.

### One-off build (no watcher)

```bash
pnpm --filter list-price-plus-extension build
```

Load unpacked from `extension/.output/chrome-mv3`.

## Multi-browser builds (Phase 3)

One source tree; separate output folders per browser:

| Browser | Build command | Load unpacked from |
|---------|---------------|-------------------|
| **Chrome** | `pnpm --filter list-price-plus-extension build` | `.output/chrome-mv3` |
| **Edge** | same as Chrome | `.output/chrome-mv3` on `edge://extensions` |
| **Opera** | same as Chrome | `.output/chrome-mv3` on `opera://extensions` |
| **Firefox** | `pnpm --filter list-price-plus-extension build:firefox` | `.output/firefox-mv2` via `about:debugging` |

Build both targets:

```bash
pnpm build:extension
```

### Firefox notes

- **Temporary add-on:** `about:debugging` → This Firefox → Load Temporary Add-on → pick any file in `.output/firefox-mv2` (e.g. `manifest.json`). Removed when Firefox closes.
- **Gecko ID** is set in `wxt.config.ts` (`list-price-plus@listpriceplus.app`) — required for persistence if you sign the XPI later.

### Edge notes

Edge is Chromium-based. The Chrome build loads directly; no separate build step.

## Store publishing (later)

| Browser | Portal | Notes |
|---------|--------|-------|
| Chrome | Chrome Web Store | One-time $5 developer fee |
| Firefox | AMO | Manual review, no fee |
| Edge | Partner Center | Often reuses Chrome package |

## Current behavior (Phase 7)

- Property facts panel + **estimated monthly cost** on **Zillow**, **FC Tucker** (talktotucker.com), **Redfin**, and **Realtor.com**
- Expandable **monthly breakdown** and **upcoming major expenses**
- Popup **Your assumptions**: spending style, credit tier, down payment %, loan term
- **Realtor mode**: agent profile + **Share with client** → Firestore link + branded PDF download

Run tests: `pnpm --filter @list-price-plus/core test` · `pnpm --filter list-price-plus-extension test`

### Realtor sharing setup

1. **Firebase Console** → Project `list-price-plus` → enable **Firestore** (production mode).
2. Deploy security rules: `pnpm deploy:firestore` (from repo root).
3. **Project settings → Your apps** → copy the Web API key into **two separate files**:
   - `extension/.env` (inside the `extension/` folder, not repo root) → `WXT_FIREBASE_API_KEY=…`
   - `web/.env` → `VITE_FIREBASE_API_KEY=…`
   - The extension also accepts `VITE_FIREBASE_API_KEY` in `extension/.env`, but the file must live under `extension/`.
4. Rebuild the extension after creating or changing `extension/.env`:
   - Dev: `pnpm dev` → load unpacked from `extension/.output/chrome-mv3-dev`
   - Production build: `pnpm build:extension` → load unpacked from `extension/.output/chrome-mv3`
   - Env vars are baked in at build time — reloading Chrome without rebuilding is not enough.
5. Deploy the web app: `pnpm deploy:hosting`
6. In the popup: fill **Realtor profile**, enable **Realtor mode**, open a listing, tap **Share with client**.

The share link is copied to clipboard and a PDF downloads. Clients open `https://list-price-plus.web.app/r/{uuid}`.

Privacy policy (required for store listing): https://list-price-plus.web.app/privacy  
Store submission checklist: [docs/store-listing.md](../docs/store-listing.md)  
Next site adapters: [docs/site-priority.md](../docs/site-priority.md)

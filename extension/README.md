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
4. **Load unpacked** → select:
   ```
   extension/.output/chrome-mv3-dev
   ```
   (Use an absolute path if needed, e.g. `C:\Users\...\list-price-plus\extension\.output\chrome-mv3-dev`)

5. Browse Zillow in **that same Chrome** — you're logged in, no bot profile, CAPTCHA should behave normally.

**First time only:** load unpacked. After that, `pnpm dev` hot-reloads most code changes automatically. Click **Reload** on `chrome://extensions` only when you add new files or change manifest permissions.

### One-off build (no watcher)

```bash
pnpm --filter list-price-plus-extension build
```

Load unpacked from `extension/.output/chrome-mv3` instead.

### Firefox

1. `pnpm --filter list-price-plus-extension dev:firefox` (with runner disabled, load manually)
2. `about:debugging` → **This Firefox** → **Load Temporary Add-on**
3. Pick `manifest.json` inside `.output/firefox-mv3-dev`

Use your normal Firefox profile the same way — don't use a throwaway automation window for Zillow.

## Store publishing (later)

| Browser | Portal | Notes |
|---------|--------|-------|
| Chrome | Chrome Web Store | One-time $5 developer fee |
| Firefox | AMO | Manual review, no fee |
| Edge | Partner Center | Often reuses Chrome package |

## Current behavior (Phase 2)

- **"List Price Plus · Zillow"** badge on Zillow `/homedetails/` pages only
- No badge on other sites
- Popup shows whether the current tab is a supported listing
- Enable/disable toggle (persists via `chrome.storage.local`)

Supported sites are defined in `adapters/registry.ts`. More sites added in Phase 4.

See [docs/roadmap.md](../docs/roadmap.md) for next phases.

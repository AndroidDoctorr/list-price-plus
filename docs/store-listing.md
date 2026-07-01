# Web store MVP checklist

Everything you need to publish **List Price Plus** on the Chrome Web Store (and optionally Firefox). Start with **Chrome unlisted** — that's enough for mom to install without sideloading.

---

## MVP scope (what you're shipping)

- Monthly cost panel on **Zillow, FC Tucker (talktotucker.com), Redfin, Realtor.com**
- User assumptions in popup (credit, down payment, etc.)
- Realtor mode: branded **PDF + share link** (requires Firebase API key baked into your build)
- Privacy policy on the website
- **Not required for MVP:** public store listing, Firefox, Auth, paid tier, error telemetry

---

## 1. Accounts & fees

| Item | Cost | Link |
|------|------|------|
| **Chrome Web Store developer account** | **$5 one-time** | [Developer Dashboard](https://chrome.google.com/webstore/devconsole) |
| Firefox AMO (optional for MVP) | Free | [addons.mozilla.org/developers](https://addons.mozilla.org/developers/) |
| Firebase / Hosting | $0 at family scale | Already set up |
| Custom domain (optional) | ~$12/yr | Not required — `list-price-plus.web.app` is fine |

---

## 2. Must be live before submit

| Item | Status / action |
|------|-----------------|
| **Privacy policy** | Deploy web app → https://list-price-plus.web.app/privacy |
| **Production extension zip** | `pnpm --filter list-price-plus-extension zip` → upload `.output/*-mv3.zip` |
| **Firebase key in build** | `extension/.env` with `WXT_FIREBASE_API_KEY` before `zip` — sharing won't work in the store build otherwise |
| **Support contact** | Use a real email you monitor (e.g. `hello@listpriceplus.app` or your Gmail). Update privacy page if needed. |
| **Smoke test on store build** | Load the **zip contents** unpacked once — Zillow + Tucker listing + share flow |

---

## 3. Store listing assets (Chrome)

### Required

| Asset | Spec | What to capture |
|-------|------|-----------------|
| **Name** | ≤ 75 chars | `List Price Plus` |
| **Short description** | ≤ 132 chars | See copy below |
| **Detailed description** | Plain text | See copy below |
| **Category** | Pick one | **Shopping** or **Productivity** |
| **Language** | | English |
| **Privacy policy URL** | HTTPS | `https://list-price-plus.web.app/privacy` |
| **Icon** | 128×128 PNG | Already in extension output (`icon/128.png`) — reuse for store |
| **Screenshots** | At least **1**, max 5 | **1280×800** or **640×400** recommended |

### Screenshots to take (minimum viable: 2–3)

1. **Listing panel** — Zillow or Tucker page with monthly total visible
2. **Breakdown expanded** — monthly categories or capex section open
3. **Popup** — assumptions + realtor profile (optional but helps review)
4. **Share success** (optional) — “Link copied · PDF downloaded” + Copy link again

Tip: use Windows Snipping Tool or Chrome DevTools device mode at 1280×800, or screenshot the listing page with panel in frame.

### Optional but helpful

| Asset | Spec |
|-------|------|
| **Promotional tile** | 440×280 — small banner for store features |
| **Marquee promo** | 1400×560 — only if you want featured placement later |
| **YouTube video** | Skip for MVP |

---

## 4. Listing copy (ready to paste)

**Short description (132 chars):**
```
Realistic monthly property costs on listing pages — mortgage, tax, insurance, utilities, maintenance, and major repairs.
```

**Detailed description:**
```
List Price Plus shows what a property really costs each month while you browse listings.

Supported sites: Zillow, FC Tucker (talktotucker.com), Redfin, and Realtor.com.

• Estimated monthly total with low/mid/high range
• Breakdown: mortgage, taxes, insurance, utilities, maintenance, capex reserve
• Upcoming major expenses timeline
• Adjust assumptions: credit tier, down payment, loan term, spending style
• Edit extracted facts when the listing page is incomplete

For realtors:
• Realtor mode with your name, brokerage, and contact info
• Share with client — branded PDF download + shareable link for clients

All estimates run locally in your browser. Estimates are illustrative, not financial or legal advice.

Privacy policy: https://list-price-plus.web.app/privacy
```

**Single purpose statement (for privacy questionnaire):**
```
Shows realistic monthly property cost estimates on supported real estate listing pages.
```

---

## 5. Permissions justification (Chrome review)

Chrome will ask why you need each permission. Paste-ready answers:

| Permission | Justification |
|------------|---------------|
| `storage` | Saves user preferences (credit tier, down payment, realtor profile) and per-listing manual fact edits locally. |
| `activeTab` | Detects whether the current tab is a supported listing URL so the panel only appears on listing pages. |
| `clipboardWrite` | Copies the client share link to the clipboard when the realtor taps Share with client or Copy link again. |
| `host_permissions` — listing sites | Reads publicly visible listing data (price, beds, baths, sqft, tax) from the page to compute cost estimates. Only runs on supported listing URLs. |
| `host_permissions` — `firestore.googleapis.com` | Writes optional shared client reports when a realtor uses Share with client. No data sent unless the user explicitly shares. |

**Host permissions in the manifest:**
- zillow.com
- talktotucker.com
- redfin.com
- realtor.com
- firestore.googleapis.com

---

## 6. Privacy practices questionnaire (Chrome)

Chrome Web Store → **Privacy** tab. Answers below match List Price Plus MVP.

### Single purpose

**Does your extension have a single purpose?**  
Yes.

**Single purpose description:**
```
Shows realistic monthly property cost estimates on supported real estate listing pages (Zillow, FC Tucker, Redfin, Realtor.com).
```

---

### Permission justifications (if prompted separately)

| Permission | User-facing justification |
|------------|---------------------------|
| `storage` | Save your cost assumptions, realtor profile, and per-listing edits on your device. |
| `activeTab` | Detect when you're on a supported listing page so the cost panel can appear. |
| `clipboardWrite` | Copy a client share link when you tap Share with client or Copy link again. |
| Host: listing sites | Read public listing details (price, beds, baths, sqft, tax) from the page you opened to calculate estimates. |
| Host: firestore.googleapis.com | Save an optional shared client report when you explicitly tap Share with client. |

---

### Data use certification

**Does this extension collect or transmit user data?**  
Select: **Yes**, the extension collects or transmits user data.

(Chrome requires "Yes" because shared reports include realtor contact info and property data sent to Firebase when the user explicitly shares.)

---

### Data types collected

Check only what applies:

| Data type | Collected? | Notes |
|-----------|------------|-------|
| **Personally identifiable information** | Yes (optional) | Realtor name, phone, email — only when Share with client is used; stored in Firestore report |
| **Financial / payment info** | No | Estimates only; no payment processing |
| **Authentication information** | No | No login in MVP |
| **Personal communications** | No | |
| **Location** | No | Does not read GPS; listing pages may imply city/state from URL |
| **Web history** | No | Only reads the active tab when it's a supported listing URL |
| **User activity** | No | No analytics in MVP |
| **Website content** | Yes | Public listing facts read from the open listing page |

---

### Data handling

| Question | Answer |
|----------|--------|
| **Is data sold to third parties?** | No |
| **Is data used for purposes unrelated to the extension's single purpose?** | No |
| **Is data used for creditworthiness or lending decisions?** | No |
| **Encrypted in transit?** | Yes (HTTPS to Firebase Hosting and Firestore) |
| **Privacy policy URL** | https://list-price-plus.web.app/privacy |

---

### Developer program policy

Certify that:
- The privacy policy accurately describes data handling
- The extension requests minimum permissions needed
- You comply with Chrome Web Store policies

---

### Contact email

Use the same address as your privacy policy (e.g. `hello@listpriceplus.app`). Google may email you here during review.

---

## 7. Build & upload steps

```bash
# 1. Ensure API key is in extension/.env
# 2. Bump version in extension/package.json (e.g. 1.0.0 for first store release)

pnpm --filter list-price-plus-extension zip
# Output: extension/.output/list-price-plus-extension-*.zip (or chrome-mv3.zip)

# 3. Chrome Web Store → New item → Upload zip
# 4. Fill listing → Submit for review
# 5. Choose "Unlisted" visibility for mom-only testing
```

**Visibility recommendation:** Start **Unlisted** — only people with the link can install. Switch to **Public** after mom dogfoods for 1–2 weeks.

Review: usually **1–3 business days**. Rejections are often permission wording or missing privacy policy — fix and resubmit.

---

## 8. Firefox (optional, not MVP-blocking)

```bash
pnpm --filter list-price-plus-extension zip:firefox
```

Submit XPI to AMO with same privacy URL and descriptions. Review can take **several days to weeks**. Mom on Chrome only? Skip for now.

---

## 9. After approval

- [ ] Copy Chrome Web Store URL → `web/.env` as `VITE_CHROME_STORE_URL=...`
- [ ] `pnpm deploy:hosting` — **Install for Chrome** button appears on homepage
- [ ] Send mom the **unlisted install link**
- [ ] Git tag release (e.g. `extension-v1.0.0`)
- [ ] Keep a changelog of what each store version contains

---

## 10. Not needed for MVP (skip)

- Google/Firebase **Auth** for agents
- Marketing website beyond landing + privacy + `/r/:id`
- Custom domain
- Error reporting / analytics
- Edge Add-ons (can sideload Chrome build on Edge)
- Video, marquee graphics, A/B listing copy

---

## Quick pre-flight checklist

```
[ ] Privacy policy deployed
[ ] Support email works
[ ] extension/.env → production zip built with Firebase key
[ ] Version bumped
[ ] 2+ screenshots captured
[ ] Listing copy pasted
[ ] $5 Chrome developer fee paid
[ ] Submitted as Unlisted
[ ] Mom tested install from store link (not unpacked)
```

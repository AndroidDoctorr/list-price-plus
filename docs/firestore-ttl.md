# Firestore TTL for shared reports

Client reports include an `expiresAt` field (90 days after creation). Two layers enforce expiry:

1. **Web app** — `/r/:id` checks `expiresAt` and shows “Report expired”
2. **Firestore TTL** (optional but recommended) — Google auto-deletes old documents

---

## Enable TTL in Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/) → project **list-price-plus**
2. **Firestore Database** → **TTL** tab (or **Indexes** → TTL depending on console version)
3. **Create policy**
   - Collection group: `reports`
   - TTL field: `expiresAt`
4. Save

New reports written by the extension store `expiresAt` as a **Firestore Timestamp** (required for TTL). Older reports with ISO string `expiresAt` still work in the web app but may not be picked up by TTL until re-shared.

Propagation can take up to 72 hours after enabling TTL.

---

## Verify

1. Share a test report from the extension
2. Firestore → **Data** → `reports` → open document
3. Confirm `expiresAt` shows as **timestamp** type (not string)

---

## Cost

TTL deletes are free. At family-scale volume, Firestore stays on the free tier.

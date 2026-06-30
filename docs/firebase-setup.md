# Firebase setup — List Price Plus

Project: **list-price-plus**  
Console: https://console.firebase.google.com/project/list-price-plus/overview  
Live site: https://list-price-plus.web.app

---

## What's already done (via CLI)

- [x] Firebase project created (`list-price-plus`)
- [x] Firebase Hosting configured (`firebase.json` → `web/dist`)
- [x] `.firebaserc` points at `list-price-plus`

Redeploy anytime:

```bash
pnpm deploy:hosting
```

---

## What you should do manually (when ready)

Nothing is **required** to keep developing locally. Do these when you reach the matching phase.

### Now (optional)

| Step | Where | Why |
|------|-------|-----|
| Bookmark console | [Firebase overview](https://console.firebase.google.com/project/list-price-plus/overview) | Quick access |
| Set billing budget alert | Google Cloud Console → Billing → Budgets | Blaze needed later for Functions; alert at $5 |

### Phase 8 — Client share links (`/r/{uuid}`)

1. **Enable Firestore**
   - Console → Build → Firestore Database → **Create database**
   - Start in **production mode**
   - Location: `us-central1` (pick once)

2. **Deploy rules**
   ```bash
   firebase deploy --only firestore:rules --project list-price-plus
   ```

3. **Enable Authentication** (for realtor login)
   - Console → Build → Authentication → Get started
   - Enable **Google** and/or **Email link**

4. **Register web app** (for Firebase SDK in React)
   - Console → Project settings → Your apps → **Add app** → Web
   - Copy config into `web/.env.local`:
     ```
     VITE_FIREBASE_API_KEY=...
     VITE_FIREBASE_AUTH_DOMAIN=list-price-plus.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=list-price-plus
     ...
     ```
   - **Do not commit** `.env.local`

5. **Upgrade to Blaze** (only when adding Cloud Functions)
   - Set budget alert first

6. **Custom domain** (optional, recommended before clients use auth)
   - Hosting → Add custom domain → follow DNS steps
   - Hides `list-price-plus.web.app` from shared links and OAuth screens

### Service account JSON?

**Not needed** for Hosting or client-side Firebase SDK.

---

## Cost expectation

| Service | Current usage | Cost |
|---------|---------------|------|
| Hosting | Static placeholder | $0 |
| Firestore | Not enabled yet | $0 |
| Auth | Not enabled yet | $0 |
| Functions | Not deployed | $0 |

---

## CLI reference

```bash
firebase use list-price-plus
firebase deploy --only hosting
firebase deploy --only firestore:rules   # after Firestore enabled
```

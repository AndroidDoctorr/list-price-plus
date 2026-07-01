import { defineConfig } from 'wxt';
import { loadEnv } from 'vite';

export default defineConfig({
  vite: (env) => {
    const vars = loadEnv(env.mode, import.meta.dirname, ['WXT', 'VITE']);
    const apiKey = vars.WXT_FIREBASE_API_KEY || vars.VITE_FIREBASE_API_KEY;
    if (!apiKey) {
      console.warn(
        '[List Price Plus] No Firebase API key in extension/.env — "Share with client" will not work until WXT_FIREBASE_API_KEY is set and you rebuild.',
      );
    }
    return {};
  },
  // Do not auto-open Chrome — WXT uses a fresh automation profile that sites
  // like Zillow block with CAPTCHA. Load unpacked in your normal Chrome instead.
  webExt: {
    disabled: true,
  },
  manifest: ({ browser }) => ({
    name: 'List Price Plus',
    description:
      'Realistic monthly property cost estimates on real estate listing sites.',
    permissions: ['storage', 'activeTab', 'clipboardWrite'],
    host_permissions: [
      'https://www.zillow.com/*',
      'https://zillow.com/*',
      'https://www.talktotucker.com/*',
      'https://talktotucker.com/*',
      'https://www.redfin.com/*',
      'https://redfin.com/*',
      'https://www.realtor.com/*',
      'https://realtor.com/*',
      'https://firestore.googleapis.com/*',
    ],
    ...(browser === 'firefox'
      ? {
          browser_specific_settings: {
            gecko: {
              id: 'list-price-plus@listpriceplus.app',
              strict_min_version: '109.0',
            },
          },
        }
      : {}),
  }),
});

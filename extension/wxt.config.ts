import { defineConfig } from 'wxt';

export default defineConfig({
  // Do not auto-open Chrome — WXT uses a fresh automation profile that sites
  // like Zillow block with CAPTCHA. Load unpacked in your normal Chrome instead.
  runner: {
    disabled: true,
  },
  manifest: {
    name: 'List Price Plus',
    description:
      'Realistic monthly property cost estimates on real estate listing sites.',
    permissions: ['storage', 'activeTab'],
    host_permissions: [
      'https://www.zillow.com/*',
      'https://zillow.com/*',
    ],
  },
});

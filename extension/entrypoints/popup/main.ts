import './style.css';

import { getSiteForUrl } from '@/adapters/registry';

const statusEl = document.querySelector<HTMLParagraphElement>('#status')!;
const pageEl = document.querySelector<HTMLParagraphElement>('#page-status')!;
const toggleEl = document.querySelector<HTMLInputElement>('#enabled')!;

async function loadSettings() {
  const { enabled } = await browser.storage.local.get('enabled');
  const isEnabled = enabled !== false;
  toggleEl.checked = isEnabled;
  statusEl.textContent = isEnabled ? 'Extension is enabled.' : 'Extension is paused.';
}

async function updatePageStatus() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url;

  if (!url || url.startsWith('chrome://') || url.startsWith('edge://')) {
    pageEl.textContent = 'Open a listing on a supported site to get started.';
    return;
  }

  const site = getSiteForUrl(url);
  if (site) {
    pageEl.textContent = `Active on ${site.label} listing.`;
    pageEl.dataset.state = 'active';
  } else {
    pageEl.textContent = 'Go to a Zillow listing page to use List Price Plus.';
    pageEl.dataset.state = 'idle';
  }
}

toggleEl.addEventListener('change', async () => {
  const enabled = toggleEl.checked;
  await browser.storage.local.set({ enabled });
  statusEl.textContent = enabled ? 'Extension is enabled.' : 'Extension is paused.';

  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    await browser.tabs.sendMessage(tab.id, { type: 'lpp-settings-changed' }).catch(() => {
      // Tab may not have a content script (non-listing page)
    });
  }
});

void loadSettings();
void updatePageStatus();

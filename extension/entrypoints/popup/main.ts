import './style.css';

import { getSiteForUrl } from '@/adapters/registry';
import {
  loadUserProfile,
  notifyContentScripts,
  saveUserProfile,
} from '@/utils/profile-storage';
import type { UserProfile } from '@list-price-plus/core';

const statusEl = document.querySelector<HTMLParagraphElement>('#status')!;
const pageEl = document.querySelector<HTMLParagraphElement>('#page-status')!;
const toggleEl = document.querySelector<HTMLInputElement>('#enabled')!;
const spendingEl = document.querySelector<HTMLSelectElement>('#spendingStyle')!;
const creditEl = document.querySelector<HTMLSelectElement>('#creditTier')!;
const downEl = document.querySelector<HTMLInputElement>('#downPayment')!;
const termEl = document.querySelector<HTMLSelectElement>('#loanTerm')!;

async function loadSettings() {
  const { enabled } = await browser.storage.local.get('enabled');
  const isEnabled = enabled !== false;
  toggleEl.checked = isEnabled;
  statusEl.textContent = isEnabled ? 'Extension is enabled.' : 'Extension is paused.';

  const profile = await loadUserProfile();
  spendingEl.value = profile.spendingStyle;
  creditEl.value = profile.creditTier;
  downEl.value = String(profile.downPaymentPercent);
  termEl.value = String(profile.loanTermYears);
}

async function persistProfile() {
  const profile: UserProfile = {
    ...(await loadUserProfile()),
    spendingStyle: spendingEl.value as UserProfile['spendingStyle'],
    creditTier: creditEl.value as UserProfile['creditTier'],
    downPaymentPercent: Number(downEl.value) || 20,
    loanTermYears: Number(termEl.value) as UserProfile['loanTermYears'],
  };
  await saveUserProfile(profile);
  await notifyContentScripts();
}

async function updatePageStatus() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url;

  if (!url || url.startsWith('chrome://') || url.startsWith('edge://')) {
    pageEl.textContent = 'Open a listing on a supported site to get started.';
    pageEl.dataset.state = 'idle';
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
  await notifyContentScripts();
});

for (const el of [spendingEl, creditEl, downEl, termEl]) {
  el.addEventListener('change', () => void persistProfile());
}

void loadSettings();
void updatePageStatus();

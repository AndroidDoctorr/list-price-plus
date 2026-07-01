import './style.css';

import { getSiteForUrl } from '@/adapters/registry';
import {
  loadAgentProfile,
  loadRealtorMode,
  notifyAllContentScripts,
  saveAgentProfile,
  saveRealtorMode,
} from '@/utils/agent-profile';
import {
  loadUserProfile,
  notifyContentScripts,
  saveUserProfile,
} from '@/utils/profile-storage';
import type { AgentBranding, UserProfile } from '@list-price-plus/core';

const statusEl = document.querySelector<HTMLParagraphElement>('#status')!;
const pageEl = document.querySelector<HTMLParagraphElement>('#page-status')!;
const toggleEl = document.querySelector<HTMLInputElement>('#enabled')!;
const spendingEl = document.querySelector<HTMLSelectElement>('#spendingStyle')!;
const creditEl = document.querySelector<HTMLSelectElement>('#creditTier')!;
const downEl = document.querySelector<HTMLInputElement>('#downPayment')!;
const termEl = document.querySelector<HTMLSelectElement>('#loanTerm')!;
const realtorModeEl = document.querySelector<HTMLInputElement>('#realtorMode')!;
const agentNameEl = document.querySelector<HTMLInputElement>('#agentName')!;
const agentBrokerageEl = document.querySelector<HTMLInputElement>('#agentBrokerage')!;
const agentPhoneEl = document.querySelector<HTMLInputElement>('#agentPhone')!;
const agentEmailEl = document.querySelector<HTMLInputElement>('#agentEmail')!;
const agentLogoUrlEl = document.querySelector<HTMLInputElement>('#agentLogoUrl')!;

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

  realtorModeEl.checked = await loadRealtorMode();

  const agent = await loadAgentProfile();
  agentNameEl.value = agent.name;
  agentBrokerageEl.value = agent.brokerage;
  agentPhoneEl.value = agent.phone;
  agentEmailEl.value = agent.email;
  agentLogoUrlEl.value = agent.logoUrl ?? '';
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

async function persistAgentProfile() {
  const profile: AgentBranding = {
    name: agentNameEl.value.trim(),
    brokerage: agentBrokerageEl.value.trim(),
    phone: agentPhoneEl.value.trim(),
    email: agentEmailEl.value.trim(),
    logoUrl: agentLogoUrlEl.value.trim() || undefined,
  };
  await saveAgentProfile(profile);
  await notifyAllContentScripts();
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
    pageEl.textContent =
      'Go to a supported listing (Zillow, FC Tucker, Redfin, or Realtor.com).';
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

realtorModeEl.addEventListener('change', async () => {
  await saveRealtorMode(realtorModeEl.checked);
  await notifyAllContentScripts();
});

for (const el of [
  agentNameEl,
  agentBrokerageEl,
  agentPhoneEl,
  agentEmailEl,
  agentLogoUrlEl,
]) {
  el.addEventListener('change', () => void persistAgentProfile());
}

void loadSettings();
void updatePageStatus();

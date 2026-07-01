import {
  AGENT_PROFILE_STORAGE_KEY,
  defaultAgentBranding,
  REALTOR_MODE_STORAGE_KEY,
  type AgentBranding,
} from '@list-price-plus/core';

export async function loadAgentProfile(): Promise<AgentBranding> {
  const data = await browser.storage.local.get(AGENT_PROFILE_STORAGE_KEY);
  const stored = data[AGENT_PROFILE_STORAGE_KEY];
  if (stored && typeof stored === 'object') {
    return { ...defaultAgentBranding(), ...(stored as AgentBranding) };
  }
  return defaultAgentBranding();
}

export async function saveAgentProfile(profile: AgentBranding): Promise<void> {
  await browser.storage.local.set({ [AGENT_PROFILE_STORAGE_KEY]: profile });
}

export async function loadRealtorMode(): Promise<boolean> {
  const data = await browser.storage.local.get(REALTOR_MODE_STORAGE_KEY);
  return data[REALTOR_MODE_STORAGE_KEY] === true;
}

export async function saveRealtorMode(enabled: boolean): Promise<void> {
  await browser.storage.local.set({ [REALTOR_MODE_STORAGE_KEY]: enabled });
}

export function isAgentProfileComplete(profile: AgentBranding): boolean {
  return Boolean(
    profile.name.trim() &&
      profile.brokerage.trim() &&
      profile.phone.trim() &&
      profile.email.trim(),
  );
}

export async function notifyAllContentScripts(): Promise<void> {
  const tabs = await browser.tabs.query({});
  await Promise.all(
    tabs.map((tab) =>
      tab.id
        ? browser.tabs
            .sendMessage(tab.id, { type: 'lpp-settings-changed' })
            .catch(() => undefined)
        : undefined,
    ),
  );
}

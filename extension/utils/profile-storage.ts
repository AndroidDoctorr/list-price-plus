import {
  defaultUserProfile,
  PROFILE_STORAGE_KEY,
  type UserProfile,
} from '@list-price-plus/core';

export async function loadUserProfile(): Promise<UserProfile> {
  const data = await browser.storage.local.get(PROFILE_STORAGE_KEY);
  const stored = data[PROFILE_STORAGE_KEY];
  if (stored && typeof stored === 'object') {
    return { ...defaultUserProfile(), ...(stored as UserProfile) };
  }
  return defaultUserProfile();
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await browser.storage.local.set({ [PROFILE_STORAGE_KEY]: profile });
}

export async function notifyContentScripts(): Promise<void> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    await browser.tabs
      .sendMessage(tab.id, { type: 'lpp-settings-changed' })
      .catch(() => undefined);
  }
}

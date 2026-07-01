import { getAdapterForSite } from '@/adapters';
import { getContentScriptMatches, getSiteForUrl } from '@/adapters/registry';
import {
  isAgentProfileComplete,
  loadAgentProfile,
  loadRealtorMode,
} from '@/utils/agent-profile';
import { isExtensionEnabled } from '@/utils/badge';
import { isFirebaseConfigured } from '@/utils/firebase';
import { downloadClientPdf } from '@/utils/pdf-report';
import {
  applyOverrides,
  clearOverridesForUrl,
  loadOverridesForUrl,
  saveOverridesForUrl,
} from '@/utils/overrides';
import { loadUserProfile } from '@/utils/profile-storage';
import {
  isOnlyPanelMountMutation,
  removeListingPanel,
  showListingPanel,
} from '@/utils/panel';
import { copyTextToClipboard, publishSharedReport } from '@/utils/share-report';
import { estimateMonthlyCosts } from '@list-price-plus/core';

export default defineContentScript({
  matches: getContentScriptMatches(),
  runAt: 'document_idle',
  main() {
    let lastUrl = location.href;
    let extractTimer: number | undefined;
    let isEditingFacts = false;
    let pendingRefresh = false;

    async function refresh() {
      if (isEditingFacts) {
        pendingRefresh = true;
        return;
      }
      pendingRefresh = false;

      const site = getSiteForUrl(location.href);
      if (!site || !(await isExtensionEnabled())) {
        removeListingPanel();
        return;
      }

      const adapter = getAdapterForSite(site.id);
      if (!adapter) {
        removeListingPanel();
        return;
      }

      const extracted = adapter.extract(document, location.href);
      const overrides = await loadOverridesForUrl(location.href);
      const facts = applyOverrides(extracted.facts, overrides);
      const result = { ...extracted, facts };

      const profile = await loadUserProfile();
      const costEstimate = estimateMonthlyCosts(facts, profile);
      const realtorMode = await loadRealtorMode();
      const listingTitle = document.title.replace(/\s*\|\s*Zillow.*$/i, '').trim();

      showListingPanel(result, site.label, {
        onEditingChange(editing) {
          isEditingFacts = editing;
          if (!editing && pendingRefresh) {
            void refresh();
          }
        },
        onCollapsedChange(collapsed) {
          if (!collapsed && pendingRefresh) {
            void refresh();
          }
        },
        onSaveOverrides: async (patch) => {
          const current = await loadOverridesForUrl(location.href);
          await saveOverridesForUrl(location.href, { ...current, ...patch });
          await refresh();
        },
        onResetOverrides: async () => {
          await clearOverridesForUrl(location.href);
          await refresh();
        },
        onShareWithClient: async () => {
          if (!isFirebaseConfigured()) {
            throw new Error(
              'Firebase is not configured. Add the API key to extension/.env (WXT_FIREBASE_API_KEY or VITE_FIREBASE_API_KEY), then rebuild the extension.',
            );
          }

          const branding = await loadAgentProfile();
          if (!isAgentProfileComplete(branding)) {
            throw new Error(
              'Complete your realtor profile in the extension popup first.',
            );
          }

          const { shareUrl } = await publishSharedReport({
            branding,
            sourceUrl: location.href,
            propertyFacts: facts,
            profileSnapshot: profile,
            estimate: costEstimate,
            listingTitle: listingTitle || undefined,
          });

          downloadClientPdf({
            listingTitle: listingTitle || undefined,
            sourceUrl: location.href,
            facts,
            estimate: costEstimate,
            branding,
            shareUrl,
          });

          await copyTextToClipboard(shareUrl);
          return shareUrl;
        },
      }, costEstimate, { realtorMode, listingUrl: location.href });
    }

    function scheduleRefresh() {
      if (isEditingFacts) {
        pendingRefresh = true;
        return;
      }
      if (extractTimer) window.clearTimeout(extractTimer);
      extractTimer = window.setTimeout(() => void refresh(), 800);
    }

    function init() {
      void refresh();

      browser.storage.onChanged.addListener((changes, area) => {
        if (
          area === 'local' &&
          ('enabled' in changes ||
            'listingOverrides' in changes ||
            'userProfile' in changes ||
            'agentProfile' in changes ||
            'realtorMode' in changes)
        ) {
          if (isEditingFacts) {
            pendingRefresh = true;
            return;
          }
          void refresh();
        }
      });

      browser.runtime.onMessage.addListener((message) => {
        if (message?.type === 'lpp-settings-changed') {
          scheduleRefresh();
        }
      });

      window.addEventListener('popstate', () => {
        isEditingFacts = false;
        scheduleRefresh();
      });

      const observer = new MutationObserver((mutations) => {
        if (isOnlyPanelMountMutation(mutations)) return;

        if (location.href !== lastUrl) {
          lastUrl = location.href;
          isEditingFacts = false;
          scheduleRefresh();
          return;
        }
        scheduleRefresh();
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });

      window.setTimeout(() => scheduleRefresh(), 2000);
      window.setTimeout(() => scheduleRefresh(), 5000);
    }

    if (document.body) {
      init();
    } else {
      document.addEventListener('DOMContentLoaded', init, { once: true });
    }
  },
});

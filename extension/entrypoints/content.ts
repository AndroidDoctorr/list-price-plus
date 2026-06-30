import { getAdapterForSite } from '@/adapters';
import { getContentScriptMatches, getSiteForUrl } from '@/adapters/registry';
import { isExtensionEnabled } from '@/utils/badge';
import {
  applyOverrides,
  clearOverridesForUrl,
  loadOverridesForUrl,
  saveOverridesForUrl,
} from '@/utils/overrides';
import { removeListingPanel, showListingPanel } from '@/utils/panel';

export default defineContentScript({
  matches: getContentScriptMatches(),
  runAt: 'document_idle',
  main() {
    let lastUrl = location.href;
    let extractTimer: number | undefined;

    async function refresh() {
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

      showListingPanel(result, site.label, {
        onSaveOverrides: async (patch) => {
          const current = await loadOverridesForUrl(location.href);
          await saveOverridesForUrl(location.href, { ...current, ...patch });
          await refresh();
        },
        onResetOverrides: async () => {
          await clearOverridesForUrl(location.href);
          await refresh();
        },
      });
    }

    function scheduleRefresh() {
      if (extractTimer) window.clearTimeout(extractTimer);
      extractTimer = window.setTimeout(() => void refresh(), 350);
    }

    function init() {
      void refresh();

      browser.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && ('enabled' in changes || 'listingOverrides' in changes)) {
          void refresh();
        }
      });

      browser.runtime.onMessage.addListener((message) => {
        if (message?.type === 'lpp-settings-changed') {
          void refresh();
        }
      });

      window.addEventListener('popstate', scheduleRefresh);

      const observer = new MutationObserver(() => {
        if (location.href !== lastUrl) {
          lastUrl = location.href;
          scheduleRefresh();
          return;
        }
        scheduleRefresh();
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });

      window.setTimeout(() => void refresh(), 1500);
      window.setTimeout(() => void refresh(), 4000);
    }

    if (document.body) {
      init();
    } else {
      document.addEventListener('DOMContentLoaded', init, { once: true });
    }
  },
});

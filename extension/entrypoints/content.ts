import { getContentScriptMatches, getSiteForUrl } from '@/adapters/registry';
import {
  isExtensionEnabled,
  removeBadge,
  showBadge,
} from '@/utils/badge';

export default defineContentScript({
  matches: getContentScriptMatches(),
  runAt: 'document_idle',
  main() {
    let lastUrl = location.href;

    async function updateBadge() {
      const site = getSiteForUrl(location.href);
      if (!site || !(await isExtensionEnabled())) {
        removeBadge();
        return;
      }

      showBadge(`List Price Plus · ${site.label}`);
    }

    function init() {
      void updateBadge();

      browser.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && 'enabled' in changes) {
          void updateBadge();
        }
      });

      browser.runtime.onMessage.addListener((message) => {
        if (message?.type === 'lpp-settings-changed') {
          void updateBadge();
        }
      });

      window.addEventListener('popstate', () => void updateBadge());

      const observer = new MutationObserver(() => {
        if (location.href === lastUrl) return;
        lastUrl = location.href;
        void updateBadge();
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    }

    if (document.body) {
      init();
    } else {
      document.addEventListener('DOMContentLoaded', init, { once: true });
    }
  },
});

const BADGE_ID = 'lpp-loaded-badge';

export default defineContentScript({
  matches: ['*://*/*'],
  runAt: 'document_idle',
  main() {
    if (document.getElementById(BADGE_ID)) return;

    const host = document.createElement('div');
    host.id = BADGE_ID;
    const shadow = host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      :host { all: initial; }
      .badge {
        position: fixed;
        bottom: 16px;
        right: 16px;
        z-index: 2147483646;
        padding: 8px 12px;
        border-radius: 8px;
        background: #0f766e;
        color: #fff;
        font: 600 13px/1.2 system-ui, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,.2);
        pointer-events: none;
      }
    `;

    const badge = document.createElement('div');
    badge.className = 'badge';
    badge.textContent = 'List Price Plus loaded';

    shadow.append(style, badge);
    document.documentElement.append(host);
  },
});

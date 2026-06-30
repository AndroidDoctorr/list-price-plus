const BADGE_HOST_ID = 'lpp-loaded-badge';

export function removeBadge(): void {
  document.getElementById(BADGE_HOST_ID)?.remove();
}

export function showBadge(label: string): void {
  removeBadge();

  const host = document.createElement('div');
  host.id = BADGE_HOST_ID;
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
  badge.textContent = label;

  shadow.append(style, badge);
  document.documentElement.append(host);
}

export async function isExtensionEnabled(): Promise<boolean> {
  const { enabled = true } = await browser.storage.local.get('enabled');
  return enabled;
}

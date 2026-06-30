import './style.css';

const statusEl = document.querySelector<HTMLParagraphElement>('#status')!;
const toggleEl = document.querySelector<HTMLInputElement>('#enabled')!;

async function loadSettings() {
  const { enabled = true } = await browser.storage.local.get('enabled');
  toggleEl.checked = enabled;
  statusEl.textContent = enabled ? 'Extension is enabled.' : 'Extension is paused.';
}

toggleEl.addEventListener('change', async () => {
  const enabled = toggleEl.checked;
  await browser.storage.local.set({ enabled });
  statusEl.textContent = enabled ? 'Extension is enabled.' : 'Extension is paused.';
});

void loadSettings();

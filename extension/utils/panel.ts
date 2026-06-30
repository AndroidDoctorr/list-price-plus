import type { ExtractResult } from '@/adapters/types';
import {
  formatFieldLabel,
  formatFieldValue,
} from '@/adapters/parse-utils';
import type { ExtractionConfidence } from '@/utils/confidence';
import { scoreExtractionConfidence } from '@/utils/confidence';
import {
  EDITABLE_FIELDS,
  formDefaults,
  overridesFromForm,
} from '@/utils/overrides';
import type { PropertyFacts } from '@list-price-plus/core';

const PANEL_HOST_ID = 'lpp-listing-panel';

const DISPLAY_FIELDS: (keyof PropertyFacts)[] = [
  'listPrice',
  'sqft',
  'beds',
  'baths',
  'yearBuilt',
  'lotSqft',
  'annualTax',
  'hoaMonthly',
  'monthlyRentEstimate',
  'hasPool',
];

export interface PanelHandlers {
  onSaveOverrides: (overrides: Partial<PropertyFacts>) => Promise<void>;
  onResetOverrides: () => Promise<void>;
}

function provenanceLabel(
  prov: PropertyFacts['fieldProvenance'],
  key: string,
): string {
  const source = prov?.[key];
  if (source === 'page') return 'from page';
  if (source === 'inferred') return 'inferred';
  if (source === 'user') return 'manual';
  return 'missing';
}

function confidenceClass(level: ExtractionConfidence): string {
  return `confidence-${level}`;
}

const STYLES = `
  :host {
    position: fixed;
    bottom: 16px;
    right: 16px;
    z-index: 2147483646;
    font-family: system-ui, sans-serif;
    font-size: 13px;
    color: #0f172a;
  }
  .shell {
    width: min(340px, calc(100vw - 32px));
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
    overflow: hidden;
    border: 1px solid #cbd5e1;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 12px;
    background: #0f766e;
    color: #fff;
  }
  .title { font-weight: 600; font-size: 13px; line-height: 1.2; }
  .icon-btn {
    all: unset;
    cursor: pointer;
    width: 24px;
    height: 24px;
    text-align: center;
    line-height: 24px;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 700;
  }
  .icon-btn:hover { background: rgba(255,255,255,0.15); }
  .body { padding: 10px 12px 12px; }
  .body[hidden] { display: none; }
  .meta { margin: 0 0 8px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
  .subtitle {
    margin: 0;
    font-size: 11px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .confidence {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 2px 6px;
    border-radius: 4px;
  }
  .confidence-high { background: #ccfbf1; color: #0f766e; }
  .confidence-medium { background: #fef3c7; color: #b45309; }
  .confidence-low { background: #fee2e2; color: #b91c1c; }
  .summary { margin: 0 0 8px; font-size: 11px; color: #64748b; line-height: 1.35; }
  table { width: 100%; border-collapse: collapse; }
  th {
    text-align: left;
    font-weight: 500;
    color: #475569;
    padding: 4px 8px 4px 0;
    vertical-align: middle;
    width: 38%;
  }
  td { padding: 4px 0; font-weight: 600; vertical-align: middle; }
  .prov {
    padding-left: 6px;
    font-size: 10px;
    font-weight: 500;
    color: #94a3b8;
    text-align: right;
    white-space: nowrap;
  }
  .errors { margin: 8px 0 0; font-size: 11px; color: #b45309; }
  .actions { margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap; }
  .btn {
    all: unset;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    background: #f8fafc;
    color: #0f172a;
  }
  .btn:hover { background: #f1f5f9; }
  .btn-primary { background: #0f766e; color: #fff; border-color: #0f766e; }
  .btn-primary:hover { background: #0d9488; }
  .edit-form[hidden], .view-table[hidden] { display: none; }
  .field-input {
    width: 100%;
    box-sizing: border-box;
    font: inherit;
    padding: 4px 6px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
  }
`;

function buildViewTable(facts: PropertyFacts): HTMLTableElement {
  const table = document.createElement('table');
  table.className = 'view-table';
  const tbody = document.createElement('tbody');

  for (const key of DISPLAY_FIELDS) {
    const tr = document.createElement('tr');
    const value = facts[key];
    tr.innerHTML = `
      <th scope="row">${formatFieldLabel(key)}</th>
      <td>${formatFieldValue(key, value)}</td>
      <td class="prov">${value !== undefined ? provenanceLabel(facts.fieldProvenance, key) : '—'}</td>`;
    tbody.append(tr);
  }

  table.append(tbody);
  return table;
}

function buildEditForm(facts: PropertyFacts): {
  form: HTMLFormElement;
  saveBtn: HTMLButtonElement;
  cancelBtn: HTMLButtonElement;
} {
  const form = document.createElement('form');
  form.className = 'edit-form';

  const defaults = formDefaults(facts);
  const table = document.createElement('table');
  const tbody = document.createElement('tbody');

  for (const key of EDITABLE_FIELDS) {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.scope = 'row';
    th.textContent = formatFieldLabel(key);

    const td = document.createElement('td');
    td.colSpan = 2;

    if (key === 'hasPool') {
      const select = document.createElement('select');
      select.name = key;
      select.className = 'field-input';
      for (const [val, label] of [
        ['', 'Unknown'],
        ['true', 'Yes'],
        ['false', 'No'],
      ] as const) {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = label;
        if (defaults[key] === val) opt.selected = true;
        select.append(opt);
      }
      td.append(select);
    } else {
      const input = document.createElement('input');
      input.type = 'text';
      input.name = key;
      input.className = 'field-input';
      input.placeholder = '—';
      input.value = defaults[key] ?? '';
      td.append(input);
    }

    tr.append(th, td);
    tbody.append(tr);
  }

  table.append(tbody);
  form.append(table);

  const formActions = document.createElement('div');
  formActions.className = 'actions';
  const saveBtn = document.createElement('button');
  saveBtn.type = 'submit';
  saveBtn.className = 'btn btn-primary';
  saveBtn.textContent = 'Save';
  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn';
  cancelBtn.textContent = 'Cancel';
  formActions.append(saveBtn, cancelBtn);
  form.append(formActions);

  return { form, saveBtn, cancelBtn };
}

export function removeListingPanel(): void {
  document.getElementById(PANEL_HOST_ID)?.remove();
}

export function showListingPanel(
  result: ExtractResult,
  siteLabel: string,
  handlers: PanelHandlers,
): void {
  removeListingPanel();

  const confidence = scoreExtractionConfidence(result.facts);
  const host = document.createElement('div');
  host.id = PANEL_HOST_ID;
  const shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = STYLES;

  const shell = document.createElement('div');
  shell.className = 'shell';

  const header = document.createElement('header');
  header.className = 'header';
  const title = document.createElement('span');
  title.className = 'title';
  title.textContent = `List Price Plus · ${siteLabel}`;
  const collapseBtn = document.createElement('button');
  collapseBtn.type = 'button';
  collapseBtn.className = 'icon-btn collapse-btn';
  collapseBtn.title = 'Collapse';
  collapseBtn.setAttribute('aria-expanded', 'true');
  collapseBtn.textContent = '−';
  header.append(title, collapseBtn);

  const body = document.createElement('div');
  body.className = 'body';

  const meta = document.createElement('div');
  meta.className = 'meta';
  const subtitle = document.createElement('p');
  subtitle.className = 'subtitle';
  subtitle.textContent = `Property facts · adapter v${result.adapterVersion}`;
  const badge = document.createElement('span');
  badge.className = `confidence ${confidenceClass(confidence.level)}`;
  badge.textContent = `${confidence.level} confidence`;
  meta.append(subtitle, badge);

  const summary = document.createElement('p');
  summary.className = 'summary';
  summary.textContent = confidence.summary;

  const viewTable = buildViewTable(result.facts);
  const { form: editForm, saveBtn, cancelBtn } = buildEditForm(result.facts);
  editForm.hidden = true;

  const actions = document.createElement('div');
  actions.className = 'actions';

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'btn';
  editBtn.textContent = 'Edit facts';

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'btn';
  resetBtn.textContent = 'Reset manual edits';

  actions.append(editBtn, resetBtn);

  body.append(meta, summary, viewTable, editForm, actions);

  if (result.errors.length > 0) {
    const errors = document.createElement('p');
    errors.className = 'errors';
    errors.textContent = result.errors.slice(0, 4).join(' · ');
    body.insertBefore(errors, actions);
  }
  shell.append(header, body);
  shadow.append(style, shell);
  (document.body ?? document.documentElement).append(host);

  collapseBtn.addEventListener('click', () => {
    const expanded = collapseBtn.getAttribute('aria-expanded') === 'true';
    collapseBtn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    collapseBtn.textContent = expanded ? '+' : '−';
    body.toggleAttribute('hidden', expanded);
  });

  editBtn.addEventListener('click', () => {
    viewTable.hidden = true;
    editForm.hidden = false;
    editBtn.hidden = true;
  });

  cancelBtn.addEventListener('click', () => {
    viewTable.hidden = false;
    editForm.hidden = true;
    editBtn.hidden = false;
  });

  editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const overrides = overridesFromForm(new FormData(editForm));
    void handlers.onSaveOverrides(overrides).then(() => {
      viewTable.hidden = false;
      editForm.hidden = true;
      editBtn.hidden = false;
    });
  });

  resetBtn.addEventListener('click', () => {
    void handlers.onResetOverrides();
  });
}

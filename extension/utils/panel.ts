import type { ExtractResult } from '@/adapters/types';
import {
  formatFieldLabel,
  formatFieldValue,
} from '@/adapters/parse-utils';
import type { ExtractionConfidence } from '@/utils/confidence';
import { scoreExtractionConfidence } from '@/utils/confidence';
import {
  buildCostSectionHtml,
  COST_SECTION_STYLES,
} from '@/utils/cost-view';
import {
  EDITABLE_FIELDS,
  formDefaults,
  overridesFromForm,
} from '@/utils/overrides';
import type { CostEstimate, PropertyFacts } from '@list-price-plus/core';

export const PANEL_HOST_ID = 'lpp-listing-panel';

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
  onEditingChange?: (editing: boolean) => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

interface PanelHost extends HTMLDivElement {
  __lppHandlers?: PanelHandlers;
  __lppFactsExpanded?: boolean;
}

/** Skip Zillow refresh when the only DOM change was our panel mounting. */
export function isOnlyPanelMountMutation(mutations: MutationRecord[]): boolean {
  let sawPanelNode = false;

  for (const mutation of mutations) {
    for (const node of [...mutation.addedNodes, ...mutation.removedNodes]) {
      if (node instanceof Element && node.id === PANEL_HOST_ID) {
        sawPanelNode = true;
        continue;
      }
      return false;
    }
  }

  return sawPanelNode;
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
  .body { padding: 0; }
  .body[hidden] { display: none; }
  .body-scroll {
    max-height: min(70vh, calc(100dvh - 100px));
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 10px 12px 12px;
  }
  .facts-section { margin: 0; }
  .facts-section[open] .facts-summary { margin-bottom: 8px; }
  .facts-summary {
    cursor: pointer;
    font-size: 11px;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    list-style: none;
  }
  .facts-summary::-webkit-details-marker { display: none; }
  .facts-summary::before {
    content: '▸ ';
    display: inline-block;
    transition: transform 0.15s ease;
  }
  .facts-section[open] > .facts-summary::before { transform: rotate(90deg); }
  .facts-inner { padding-top: 2px; }
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
  ${COST_SECTION_STYLES}
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

function syncEditFormFields(form: HTMLFormElement, facts: PropertyFacts): void {
  const defaults = formDefaults(facts);
  for (const key of EDITABLE_FIELDS) {
    const field = form.elements.namedItem(key);
    if (!field) continue;
    if (field instanceof HTMLSelectElement || field instanceof HTMLInputElement) {
      field.value = defaults[key] ?? '';
    }
  }
}

function updateErrorsBlock(factsInner: Element, errors: string[]): void {
  factsInner.querySelector('.errors')?.remove();
  if (errors.length === 0) return;

  const errorsEl = document.createElement('p');
  errorsEl.className = 'errors';
  errorsEl.textContent = errors.slice(0, 4).join(' · ');
  const actions = factsInner.querySelector('.view-actions');
  if (actions) factsInner.insertBefore(errorsEl, actions);
  else factsInner.append(errorsEl);
}

function syncCostSection(bodyScroll: Element, estimate?: CostEstimate): void {
  bodyScroll.querySelector('.cost-section')?.remove();
  if (!estimate) return;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = buildCostSectionHtml(estimate);
  const section = wrapper.firstElementChild;
  if (section) {
    section.classList.add('cost-section-first');
    bodyScroll.insertBefore(section, bodyScroll.firstChild);
  }
}

function syncFactsSectionOpen(
  factsSection: HTMLDetailsElement | null,
  costEstimate: CostEstimate | undefined,
  editing: boolean,
  userExpanded: boolean,
): void {
  if (!factsSection) return;
  if (editing || userExpanded) {
    factsSection.open = true;
    return;
  }
  factsSection.open = !costEstimate;
}

function updatePanelContent(
  shadow: ShadowRoot,
  result: ExtractResult,
  siteLabel: string,
  costEstimate?: CostEstimate,
): void {
  const confidence = scoreExtractionConfidence(result.facts);
  const editing = shadow.querySelector('.edit-form:not([hidden])') !== null;
  const factsSection = shadow.querySelector('.facts-section');
  const host = shadow.host as PanelHost;

  shadow.querySelector('.title')!.textContent = `List Price Plus · ${siteLabel}`;

  shadow.querySelector('.facts-summary')!.textContent =
    `Property facts · adapter v${result.adapterVersion}`;

  const badge = shadow.querySelector('.confidence')!;
  badge.className = `confidence ${confidenceClass(confidence.level)}`;
  badge.textContent = `${confidence.level} confidence`;

  shadow.querySelector('.summary')!.textContent = confidence.summary;

  if (!editing) {
    shadow.querySelector('.view-table')?.replaceWith(buildViewTable(result.facts));
    const form = shadow.querySelector('.edit-form');
    if (form instanceof HTMLFormElement) {
      syncEditFormFields(form, result.facts);
    }
  }

  const factsInner = shadow.querySelector('.facts-inner');
  const bodyScroll = shadow.querySelector('.body-scroll');
  if (factsInner) updateErrorsBlock(factsInner, result.errors);
  if (bodyScroll) syncCostSection(bodyScroll, costEstimate);
  syncFactsSectionOpen(
    factsSection instanceof HTMLDetailsElement ? factsSection : null,
    costEstimate,
    editing,
    host.__lppFactsExpanded ?? false,
  );
}

function wirePanelEvents(shadow: ShadowRoot, host: PanelHost): void {
  const body = shadow.querySelector('.body')!;
  const collapseBtn = shadow.querySelector('.collapse-btn')!;
  const viewTable = shadow.querySelector('.view-table')!;
  const editForm = shadow.querySelector('.edit-form') as HTMLFormElement;
  const editBtn = shadow.querySelector('.edit-btn')!;
  const cancelBtn = shadow.querySelector('.cancel-btn')!;
  const resetBtn = shadow.querySelector('.reset-btn')!;

  const factsSection = shadow.querySelector('.facts-section');
  factsSection?.addEventListener('toggle', () => {
    if (factsSection instanceof HTMLDetailsElement) {
      host.__lppFactsExpanded = factsSection.open;
    }
  });

  collapseBtn.addEventListener('click', () => {
    const expanded = collapseBtn.getAttribute('aria-expanded') === 'true';
    const nowCollapsed = expanded;
    collapseBtn.setAttribute('aria-expanded', nowCollapsed ? 'false' : 'true');
    collapseBtn.textContent = nowCollapsed ? '+' : '−';
    body.toggleAttribute('hidden', nowCollapsed);
    host.__lppHandlers?.onCollapsedChange?.(nowCollapsed);
  });

  editBtn.addEventListener('click', () => {
    const factsSectionEl = shadow.querySelector('.facts-section');
    if (factsSectionEl instanceof HTMLDetailsElement) {
      factsSectionEl.open = true;
      host.__lppFactsExpanded = true;
    }
    host.__lppHandlers?.onEditingChange?.(true);
    (viewTable as HTMLElement).hidden = true;
    editForm.hidden = false;
    (editBtn as HTMLElement).hidden = true;
  });

  cancelBtn.addEventListener('click', () => {
    host.__lppHandlers?.onEditingChange?.(false);
    (viewTable as HTMLElement).hidden = false;
    editForm.hidden = true;
    (editBtn as HTMLElement).hidden = false;
  });

  editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    host.__lppHandlers?.onEditingChange?.(false);
    const overrides = overridesFromForm(new FormData(editForm));
    void host.__lppHandlers?.onSaveOverrides(overrides).then(() => {
      (viewTable as HTMLElement).hidden = false;
      editForm.hidden = true;
      (editBtn as HTMLElement).hidden = false;
    });
  });

  resetBtn.addEventListener('click', () => {
    void host.__lppHandlers?.onResetOverrides();
  });
}

function createPanel(
  result: ExtractResult,
  siteLabel: string,
  handlers: PanelHandlers,
  costEstimate?: CostEstimate,
): PanelHost {
  const confidence = scoreExtractionConfidence(result.facts);
  const host = document.createElement('div') as PanelHost;
  host.id = PANEL_HOST_ID;
  host.__lppHandlers = handlers;
  host.__lppFactsExpanded = false;

  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = STYLES;

  const shell = document.createElement('div');
  shell.className = 'shell';

  const header = document.createElement('header');
  header.className = 'header';
  header.innerHTML = `
    <span class="title">List Price Plus · ${siteLabel}</span>
    <button type="button" class="icon-btn collapse-btn" aria-expanded="true" title="Collapse">−</button>`;

  const body = document.createElement('div');
  body.className = 'body';

  const bodyScroll = document.createElement('div');
  bodyScroll.className = 'body-scroll';

  const factsSection = document.createElement('details');
  factsSection.className = 'facts-section';
  factsSection.open = !costEstimate;

  const factsSummary = document.createElement('summary');
  factsSummary.className = 'facts-summary';
  factsSummary.textContent = `Property facts · adapter v${result.adapterVersion}`;

  const factsInner = document.createElement('div');
  factsInner.className = 'facts-inner';
  factsInner.innerHTML = `
    <div class="meta">
      <span class="confidence ${confidenceClass(confidence.level)}">${confidence.level} confidence</span>
    </div>
    <p class="summary">${confidence.summary}</p>`;

  const viewTable = buildViewTable(result.facts);
  const editForm = document.createElement('form');
  editForm.className = 'edit-form';
  editForm.hidden = true;

  const defaults = formDefaults(result.facts);
  const editTable = document.createElement('table');
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
  editTable.append(tbody);
  editForm.append(editTable);

  const formActions = document.createElement('div');
  formActions.className = 'actions';
  formActions.innerHTML = `
    <button type="submit" class="btn btn-primary">Save</button>
    <button type="button" class="btn cancel-btn">Cancel</button>`;
  editForm.append(formActions);

  const actions = document.createElement('div');
  actions.className = 'actions view-actions';
  actions.innerHTML = `
    <button type="button" class="btn edit-btn">Edit facts</button>
    <button type="button" class="btn reset-btn">Reset manual edits</button>`;

  factsInner.append(viewTable, editForm, actions);
  factsSection.append(factsSummary, factsInner);
  bodyScroll.append(factsSection);
  updateErrorsBlock(factsInner, result.errors);
  syncCostSection(bodyScroll, costEstimate);

  body.append(bodyScroll);
  shell.append(header, body);
  shadow.append(style, shell);
  wirePanelEvents(shadow, host);

  return host;
}

export function removeListingPanel(): void {
  document.getElementById(PANEL_HOST_ID)?.remove();
}

export function showListingPanel(
  result: ExtractResult,
  siteLabel: string,
  handlers: PanelHandlers,
  costEstimate?: CostEstimate,
): void {
  const existing = document.getElementById(PANEL_HOST_ID) as PanelHost | null;

  if (existing?.shadowRoot) {
    existing.__lppHandlers = handlers;
    updatePanelContent(existing.shadowRoot, result, siteLabel, costEstimate);
    return;
  }

  const host = createPanel(result, siteLabel, handlers, costEstimate);
  (document.body ?? document.documentElement).append(host);
}

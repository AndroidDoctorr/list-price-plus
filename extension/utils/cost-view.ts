import { formatCurrency, type CostEstimate } from '@list-price-plus/core';

export { formatCurrency };

export function buildCostSectionHtml(
  estimate: CostEstimate,
  options?: { showShare?: boolean },
): string {
  const { monthlyTotal, breakdown, capexTimeline, assumptions, confidence } =
    estimate;

  const lines = breakdown
    .map(
      (l) =>
        `<tr><th scope="row">${l.label}</th><td>${formatCurrency(l.monthlyMid)}</td><td class="prov">${formatCurrency(l.monthlyLow)}–${formatCurrency(l.monthlyHigh)}</td></tr>`,
    )
    .join('');

  const capex = capexTimeline
    .slice(0, 4)
    .map(
      (e) =>
        `<li><strong>${e.component}</strong> ~${formatCurrency(e.estimatedCost)} · ${e.estimatedYear}</li>`,
    )
    .join('');

  const assumptionText = assumptions.slice(0, 2).join(' ');
  const shareBtn = options?.showShare
    ? `<button type="button" class="btn btn-primary share-btn">Share with client</button>
        <div class="share-actions-secondary" hidden>
          <button type="button" class="btn copy-link-btn">Copy link again</button>
        </div>`
    : '';

  return `
    <section class="cost-section">
      <div class="cost-header">
        <p class="cost-label">Estimated monthly cost</p>
        <p class="cost-total">${formatCurrency(monthlyTotal.mid)}<span class="cost-range"> /mo</span></p>
        <p class="cost-band">${formatCurrency(monthlyTotal.low)} – ${formatCurrency(monthlyTotal.high)}</p>
        <span class="confidence confidence-${confidence}">${confidence} · estimate</span>
        ${shareBtn}
      </div>
      <p class="share-status" hidden></p>
      <details class="cost-details">
        <summary>Monthly breakdown</summary>
        <table class="cost-table"><tbody>${lines}</tbody></table>
      </details>
      <details class="cost-details">
        <summary>Upcoming major expenses</summary>
        <ul class="capex-list">${capex}</ul>
      </details>
      <p class="disclaimer">${assumptionText}</p>
    </section>`;
}

export const COST_SECTION_STYLES = `
  .cost-section {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #e2e8f0;
  }
  .cost-section-first {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
  }
  .cost-section-first + .facts-section {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #e2e8f0;
  }
  .cost-header { margin-bottom: 10px; }
  .cost-label {
    margin: 0;
    font-size: 11px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .cost-total {
    margin: 4px 0 0;
    font-size: 26px;
    font-weight: 700;
    color: #0f766e;
    line-height: 1.1;
  }
  .cost-range { font-size: 14px; font-weight: 600; color: #64748b; }
  .cost-band { margin: 2px 0 6px; font-size: 12px; color: #64748b; }
  .share-btn {
    display: block;
    width: 100%;
    margin-top: 10px;
    text-align: center;
    box-sizing: border-box;
  }
  .share-btn[disabled] { opacity: 0.65; cursor: wait; }
  .share-actions-secondary { margin-top: 8px; }
  .copy-link-btn {
    display: block;
    width: 100%;
    text-align: center;
    box-sizing: border-box;
  }
  .share-status {
    margin: 0 0 8px;
    font-size: 11px;
    line-height: 1.35;
  }
  .share-status[data-kind="success"] { color: #0f766e; }
  .share-status[data-kind="error"] { color: #b91c1c; }
  .cost-details { margin: 8px 0 0; }
  .cost-details summary {
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 6px;
  }
  .cost-table { width: 100%; border-collapse: collapse; }
  .cost-table th {
    font-weight: 500;
    color: #64748b;
    padding: 3px 8px 3px 0;
    font-size: 12px;
  }
  .cost-table td { font-size: 12px; font-weight: 600; padding: 3px 0; }
  .capex-list {
    margin: 0;
    padding-left: 18px;
    font-size: 11px;
    color: #475569;
    line-height: 1.5;
  }
  .disclaimer {
    margin: 10px 0 0;
    font-size: 10px;
    color: #94a3b8;
    line-height: 1.35;
  }
`;

import {
  formatCurrency,
  type AgentBranding,
  type CostEstimate,
  type PropertyFacts,
  type SharedReport,
} from '@list-price-plus/core';

function formatFieldValue(key: keyof PropertyFacts, value: unknown): string {
  if (value === undefined || value === null || value === '') return '—';
  if (key === 'listPrice' || key === 'annualTax' || key === 'hoaMonthly') {
    return formatCurrency(Number(value));
  }
  if (key === 'hasPool') return value ? 'Yes' : 'No';
  if (key === 'sqft' || key === 'lotSqft') return Number(value).toLocaleString();
  return String(value);
}

const FACT_FIELDS: (keyof PropertyFacts)[] = [
  'listPrice',
  'sqft',
  'beds',
  'baths',
  'yearBuilt',
  'annualTax',
  'hoaMonthly',
  'hasPool',
];

function propertyFactsSummary(facts: PropertyFacts): string {
  const parts: string[] = [];
  if (facts.listPrice) parts.push(formatCurrency(facts.listPrice));
  if (facts.beds !== undefined) parts.push(`${facts.beds} bd`);
  if (facts.baths !== undefined) parts.push(`${facts.baths} ba`);
  if (facts.sqft) parts.push(`${facts.sqft.toLocaleString()} sqft`);
  return parts.join(' · ');
}

function AgentFooter({ branding }: { branding: AgentBranding }) {
  return (
    <footer className="agent-footer">
      {branding.logoUrl ? (
        <img className="agent-logo" src={branding.logoUrl} alt="" />
      ) : null}
      <div>
        <p className="agent-name">{branding.name}</p>
        <p>{branding.brokerage}</p>
        <p>
          {branding.phone}
          {branding.phone && branding.email ? ' · ' : ''}
          {branding.email ? (
            <a href={`mailto:${branding.email}`}>{branding.email}</a>
          ) : null}
        </p>
      </div>
    </footer>
  );
}

function CostBreakdown({ estimate }: { estimate: CostEstimate }) {
  return (
    <>
      <div className="cost-hero">
        <p className="eyebrow">Estimated monthly cost</p>
        <p className="cost-total">
          {formatCurrency(estimate.monthlyTotal.mid)}
          <span className="cost-suffix"> /mo</span>
        </p>
        <p className="cost-band">
          {formatCurrency(estimate.monthlyTotal.low)} –{' '}
          {formatCurrency(estimate.monthlyTotal.high)}
        </p>
        <span className={`badge badge-${estimate.confidence}`}>
          {estimate.confidence} confidence
        </span>
      </div>

      <section className="report-section">
        <h2>Monthly breakdown</h2>
        <table className="report-table">
          <tbody>
            {estimate.breakdown.map((line) => (
              <tr key={line.category}>
                <th scope="row">{line.label}</th>
                <td>{formatCurrency(line.monthlyMid)}</td>
                <td className="muted">
                  {formatCurrency(line.monthlyLow)}–{formatCurrency(line.monthlyHigh)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {estimate.capexTimeline.length > 0 ? (
        <section className="report-section">
          <h2>Upcoming major expenses</h2>
          <ul className="capex-list">
            {estimate.capexTimeline.slice(0, 6).map((event) => (
              <li key={`${event.component}-${event.estimatedYear}`}>
                <strong>{event.component}</strong> · ~
                {formatCurrency(event.estimatedCost)} · {event.estimatedYear}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="disclaimer">
        {estimate.assumptions.slice(0, 2).join(' ')} Estimates are illustrative,
        not financial advice.
      </p>
    </>
  );
}

export function SharedReportView({ report }: { report: SharedReport }) {
  const title =
    report.listingTitle?.trim() || propertyFactsSummary(report.propertyFacts);

  return (
    <article className="report">
      <header className="report-header">
        <p className="eyebrow">List Price Plus · client report</p>
        <h1>{title}</h1>
        {report.sourceUrl ? (
          <a href={report.sourceUrl} target="_blank" rel="noreferrer">
            View original listing
          </a>
        ) : null}
      </header>

      <CostBreakdown estimate={report.estimate} />

      <section className="report-section">
        <h2>Property facts</h2>
        <table className="report-table">
          <tbody>
            {FACT_FIELDS.map((key) => (
              <tr key={key}>
                <th scope="row">{key.replace(/([A-Z])/g, ' $1')}</th>
                <td colSpan={2}>{formatFieldValue(key, report.propertyFacts[key])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <AgentFooter branding={report.branding} />
    </article>
  );
}

import { Link } from 'react-router-dom';
import { SiteFooter } from './SiteFooter';

export function PrivacyPage() {
  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">Legal</p>
        <h1>Privacy policy</h1>
        <p className="lede">Last updated: June 30, 2026</p>
      </header>

      <section className="card prose">
        <h2>Overview</h2>
        <p>
          List Price Plus (“we”, “the extension”) helps users estimate monthly
          property costs on public real estate listing pages and, optionally,
          share those estimates with clients. This policy describes what data
          the extension and website collect and how it is used.
        </p>

        <h2>What runs on your device</h2>
        <p>The browser extension:</p>
        <ul>
          <li>
            Reads publicly visible information from supported listing pages
            (for example price, beds, baths, square footage, tax hints) to
            compute cost estimates.
          </li>
          <li>
            Stores your preferences (spending style, credit tier, down payment,
            realtor profile) in <strong>browser local storage</strong> on your
            computer — not on our servers unless you share a report.
          </li>
          <li>
            Stores manual fact edits per listing URL in local storage so your
            overrides persist when you revisit a property.
          </li>
          <li>
            Generates PDF reports locally in your browser when you choose{' '}
            <strong>Share with client</strong>.
          </li>
        </ul>
        <p>
          We do not read your browsing history outside supported listing URLs.
          The extension only activates on sites we explicitly support.
        </p>

        <h2>What we store in the cloud</h2>
        <p>
          When a realtor uses <strong>Share with client</strong>, we write a
          report to Google Firebase Firestore containing:
        </p>
        <ul>
          <li>Property facts and cost estimate snapshot</li>
          <li>Realtor branding (name, brokerage, phone, email, optional logo URL)</li>
          <li>Source listing URL and optional listing title</li>
          <li>Creation and expiry timestamps</li>
        </ul>
        <p>
          Each report gets an unguessable link (<code>/r/&#123;uuid&#125;</code>
          ). Anyone with the link can view that report until it expires (90 days).
          Reports are not indexed or listed publicly.
        </p>
        <p>
          We do not collect client names, email addresses, or payment information
          in shared reports.
        </p>

        <h2>What we do not do</h2>
        <ul>
          <li>We do not sell personal data.</li>
          <li>We do not use listing data for advertising profiles.</li>
          <li>
            We do not guarantee accuracy of estimates — they are planning tools
            based on public listing data and configurable assumptions.
          </li>
        </ul>

        <h2>Third-party services</h2>
        <ul>
          <li>
            <strong>Google Firebase</strong> — hosts client report pages and
            stores shared report documents.
          </li>
          <li>
            <strong>Listing sites</strong> (e.g. Zillow) — the extension reads
            their public pages; your use of those sites is governed by their
            terms.
          </li>
        </ul>

        <h2>Data retention</h2>
        <p>
          Shared client reports expire after 90 days and are eligible for
          automatic deletion from Firestore. Local extension data stays on your
          device until you uninstall the extension or clear extension storage.
        </p>

        <h2>Your choices</h2>
        <ul>
          <li>Disable the extension at any time in the popup.</li>
          <li>Reset manual fact edits per listing from the panel.</li>
          <li>
            Avoid using Share with client if you do not want a cloud copy of an
            estimate.
          </li>
        </ul>

        <h2>Children</h2>
        <p>
          List Price Plus is not directed at children under 13 and is intended
          for adults evaluating property costs.
        </p>

        <h2>Changes</h2>
        <p>
          We may update this policy as features change. Material updates will
          be reflected on this page with a revised date.
        </p>

        <h2>Contact</h2>
        <p>
          Questions:{' '}
          <a href="mailto:hello@listpriceplus.app">hello@listpriceplus.app</a>
        </p>
      </section>

      <p>
        <Link to="/">← Back home</Link>
      </p>

      <SiteFooter />
    </main>
  );
}

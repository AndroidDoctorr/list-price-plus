import { Link, Route, Routes, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PageShell } from './PageShell';
import { PrivacyPage } from './PrivacyPage';
import { SharedReportView } from './ReportView';
import {
  isReportExpired,
  loadSharedReport,
  type SharedReport,
} from './report-api';
import { isFirebaseConfigured } from './firebase';

function HomePage() {
  return (
    <PageShell>
      <main className="page">
        <header className="hero">
          <p className="eyebrow">List Price Plus</p>
          <h1>The whole picture, every property.</h1>
          <p className="lede">
            Realistic monthly property costs — mortgage, taxes, utilities,
            maintenance, and major repairs — on the listing page.
          </p>
        </header>
        <section className="card">
          <h2>For realtors</h2>
          <p>
            Install the browser extension, turn on realtor mode, and tap{' '}
            <strong>Share with client</strong> on any listing. Your client gets a
            branded PDF and a link like <code>/r/your-report-id</code>.
          </p>
        </section>
        <section className="card">
          <h2>Supported listing sites</h2>
          <p>
            Currently: <strong>Zillow</strong>, <strong>FC Tucker</strong>{' '}
            (talktotucker.com), <strong>Redfin</strong>, and{' '}
            <strong>Realtor.com</strong> listing pages. See{' '}
            <Link to="/privacy">privacy policy</Link> for how data is handled.
          </p>
        </section>
      </main>
    </PageShell>
  );
}

function ReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState<SharedReport | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setReport(null);
      return;
    }

    if (!isFirebaseConfigured()) {
      setError('Report hosting is not configured yet.');
      setReport(null);
      return;
    }

    let cancelled = false;
    void loadSharedReport(id)
      .then((loaded) => {
        if (!cancelled) setReport(loaded);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load report.');
          setReport(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (report === undefined) {
    return (
      <PageShell>
        <main className="page">
          <section className="card">
            <p className="eyebrow">Client report</p>
            <p>Loading report…</p>
          </section>
        </main>
      </PageShell>
    );
  }

  if (error || !report) {
    return (
      <PageShell>
        <main className="page">
          <section className="card">
            <p className="eyebrow">Client report</p>
            <h1>Report not found</h1>
            <p>{error ?? 'This link may be invalid or expired.'}</p>
            <Link to="/">Back home</Link>
          </section>
        </main>
      </PageShell>
    );
  }

  if (isReportExpired(report)) {
    return (
      <PageShell>
        <main className="page">
          <section className="card">
            <p className="eyebrow">Client report</p>
            <h1>Report expired</h1>
            <p>
              This report is no longer available. Ask your realtor for an updated
              link.
            </p>
            <Link to="/">Back home</Link>
          </section>
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className="page">
        <SharedReportView report={report} />
      </main>
    </PageShell>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/r/:id" element={<ReportPage />} />
    </Routes>
  );
}

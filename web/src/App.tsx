import { Link, Route, Routes, useParams } from 'react-router-dom';

function HomePage() {
  return (
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
        <h2>Coming soon</h2>
        <p>
          Install the browser extension to see cost estimates on Zillow and
          other listing sites. Shared client reports will appear at links like{' '}
          <code>/r/your-report-id</code>.
        </p>
      </section>
    </main>
  );
}

function ReportPage() {
  const { id } = useParams();

  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">Client report</p>
        <h1>Report {id}</h1>
        <p>
          Placeholder for the realtor share view. Phase 8 will load report data
          from Firestore and render the cost breakdown here.
        </p>
        <Link to="/">Back home</Link>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/r/:id" element={<ReportPage />} />
    </Routes>
  );
}

import { Link } from 'react-router-dom';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        <Link to="/privacy">Privacy policy</Link>
        {' · '}
        <a href="mailto:hello@listpriceplus.app">Contact</a>
      </p>
      <p className="footer-note">
        Estimates are illustrative, not financial or legal advice.
      </p>
    </footer>
  );
}

import type { ReactNode } from 'react';
import { SiteFooter } from './SiteFooter';

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}

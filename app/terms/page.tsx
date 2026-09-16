import type { Metadata } from 'next';
import { LegalPage } from '@/components/dom/LegalPage';
import { termsPage, site } from '@/content/site';

export const metadata: Metadata = {
  title: `${termsPage.heading} — ${site.name}`,
  description: termsPage.summary,
  alternates: { canonical: termsPage.route },
};

export default function TermsPage() {
  return <LegalPage page={termsPage} />;
}

import type { Metadata } from 'next';
import { LegalPage } from '@/components/dom/LegalPage';
import { privacyPage, site } from '@/content/site';

export const metadata: Metadata = {
  title: `${privacyPage.heading} — ${site.name}`,
  description: privacyPage.summary,
  alternates: { canonical: privacyPage.route },
};

export default function PrivacyPage() {
  return <LegalPage page={privacyPage} />;
}

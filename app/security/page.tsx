import type { Metadata } from 'next';
import { LegalPage } from '@/components/dom/LegalPage';
import { securityPage, site } from '@/content/site';

export const metadata: Metadata = {
  title: `${securityPage.heading} — ${site.name}`,
  description: securityPage.summary,
  alternates: { canonical: securityPage.route },
};

/**
 * The page an enterprise healthcare buyer looks for first (§2.4).
 *
 * The live site's footer asserts "HIPAA compliant. SOC 2 ready." with no page
 * behind it. Per §13.2 items 1 and 19 the rebuild says "HIPAA-aligned" and
 * drops the SOC 2 claim entirely until PRISM supplies the actual status in
 * writing — Type I, Type II and "audit in progress" are materially different
 * claims, and an unqualified one is exactly what a security reviewer will ask
 * you to prove.
 */
export default function SecurityPage() {
  return <LegalPage page={securityPage} />;
}

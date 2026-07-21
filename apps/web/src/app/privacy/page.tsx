import { Navbar } from '@/components/ui/Navbar';
import { Container } from '@/components/ui/Container';

export const metadata = {
  title: 'Privacy Policy — MP Production',
  description: 'Exhaustive Privacy Policy and Global Data Protection Policy governing MP Production, talent directory data, and client media processing.',
};

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <main className="page-content pt-32 pb-28 bg-background text-foreground">
        <Container size="md">
          {/* Header */}
          <div className="border-b border-border pb-10 mb-14">
            <span className="text-brand text-xs font-bold tracking-widest uppercase mb-3 block">
              Data Sovereignty & Global Protection
            </span>
            <h1 className="text-4xl sm:text-6xl font-serif text-foreground font-light mb-4 leading-tight">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Document Reference: LEGAL-PRIV-2026-V2 · Effective Date: January 1, 2026 · Last Updated: July 2026
            </p>
          </div>

          {/* Legal Content */}
          <div className="space-y-14 text-muted-foreground leading-relaxed font-light text-base md:text-lg">
            
            {/* Section 1 */}
            <section className="space-y-5">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                1. Executive Privacy Framework & Regulatory Alignment
              </h2>
              <p>
                At <strong>MP Production</strong> ("Company", "we", "us", or "our"), safeguarding your personal data, physical specifications, and creative media assets is an uncompromised organizational commitment. This Privacy Policy details our operational practices regarding the collection, processing, storage, sharing, and security of personal information.
              </p>
              <p>
                Our privacy framework operates in full compliance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act India)</strong>, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, the <strong>General Data Protection Regulation (GDPR)</strong> for European/UK subjects, and international data protection standards.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-5">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                2. Categories of Information We Collect
              </h2>
              <p>
                We collect personal information depending on your relationship with MP Production (as a Talent Roster Applicant, Commercial Client, or Site Visitor).
              </p>

              <div className="space-y-6 pt-2">
                
                <div className="bg-card border border-border p-6 rounded-2xl space-y-3">
                  <h3 className="text-foreground font-bold text-lg">A. Talent Applicants & Roster Members</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <p className="text-foreground font-semibold mb-1">Personal Identity & Contact:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Legal full name, stage name, alias.</li>
                        <li>Verified mobile number, WhatsApp, email address.</li>
                        <li>Home state, city, pincode, residential address.</li>
                        <li>Date of birth, age range, gender identity, nationality.</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-foreground font-semibold mb-1">Physical Specifications & Media:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Height, weight, bust/chest, waist, hips, shoe size.</li>
                        <li>Eye color, hair color, skin tone, tattoos/piercings.</li>
                        <li>High-res headshots, portfolio photos, showreel links.</li>
                        <li>Vocal audio clips, language proficiencies, special skills.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border p-6 rounded-2xl space-y-3">
                  <h3 className="text-foreground font-bold text-lg">B. Commercial Clients & Casting Directors</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li><strong>Corporate Details:</strong> Brand/Agency legal entity name, corporate office address, tax ID (GSTIN/PAN/VAT).</li>
                    <li><strong>Contact Personnel:</strong> Executive producer name, business email, direct phone number, billing contact.</li>
                    <li><strong>Project Telemetry:</strong> Script briefs, casting requirements, shoot dates, invoice & transaction history.</li>
                  </ul>
                </div>

                <div className="bg-card border border-border p-6 rounded-2xl space-y-3">
                  <h3 className="text-foreground font-bold text-lg">C. Technical & Telemetry Information</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li><strong>Device Telemetry:</strong> IP address, device type, operating system, browser specifications, language preferences.</li>
                    <li><strong>Session Logs:</strong> NextAuth authentication tokens, MFA challenge logs, time spent on pages, referrer URLs.</li>
                  </ul>
                </div>

              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-5">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                3. Methods & Channels of Data Collection
              </h2>
              <p>
                We gather data through transparent interaction channels:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-sm sm:text-base">
                <li><strong>Direct Submissions:</strong> Form inputs submitted during talent registration, profile setup, contact inquiries, or project booking requests.</li>
                <li><strong>Automated Platform Telemetry:</strong> Cookies, local storage, security middleware tokens, and web analytics headers.</li>
                <li><strong>Auditions & Submissions:</strong> Video tapes, call-back recordings, and headshot updates submitted during active casting calls.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-5">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                4. Purposes & Legal Bases for Processing Data
              </h2>
              <p>
                We process your personal information strictly under established legal bases:
              </p>
              
              <div className="bg-surface border border-border p-6 rounded-2xl space-y-4">
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>
                    <strong className="text-foreground font-bold">1. Contract Performance:</strong> Facilitating talent casting shortlists, booking studio dates, processing invoice settlements, and issuing deal memos.
                  </li>
                  <li>
                    <strong className="text-foreground font-bold">2. Legitimate Business Interest:</strong> Curating a searchable talent directory for brand directors, optimizing website UI performance, preventing fraud, and securing API endpoints.
                  </li>
                  <li>
                    <strong className="text-foreground font-bold">3. Legal Obligation:</strong> Tax filings, statutory audit compliance, income reporting, and compliance with court directives.
                  </li>
                  <li>
                    <strong className="text-foreground font-bold">4. Explicit Consent:</strong> Sending agency newsletters, casting updates, and featured talent spotlights.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-5">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                5. Data Sharing, Disclosures & Infrastructure Partners
              </h2>
              <p>
                <strong>MP Production strictly does NOT sell, rent, or monetize your personal data or talent portfolios to third-party data brokers or marketing agencies.</strong>
              </p>
              <p>
                We disclose personal information only to essential infrastructure partners and commercial clients under strict confidentiality agreements:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-muted-foreground text-sm sm:text-base">
                <li><strong>Verified Casting Clients:</strong> Approved talent profiles, physical measurements, and showreels are shared with verified commercial directors, brand producers, and casting agents for booking decisions.</li>
                <li><strong>Encrypted Database Infrastructure:</strong> Database records are hosted on Supabase (PostgreSQL with AES-256 encryption at rest) and cached via Redis.</li>
                <li><strong>Media CDN Delivery:</strong> High-resolution portfolio photographs and showreel video clips are processed and served securely through Cloudinary CDN.</li>
                <li><strong>Banking & Financial Gateways:</strong> Payment details are processed through PCI-DSS compliant banking gateways for invoice settlements.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-5">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                6. Biometric Data Protection & AI Model Disclaimer
              </h2>
              <p>
                MP Production maintains a strict ethics policy regarding talent media:
              </p>
              <div className="bg-surface border border-border p-6 rounded-2xl space-y-3 text-sm">
                <p className="text-foreground font-bold">A. No Biometric Profiling:</p>
                <p>We do NOT use facial recognition technology, iris scanning, voice pattern extraction, or biometric identification on talent photographs or showreels.</p>
                <p className="text-foreground font-bold">B. AI Training Ban:</p>
                <p>We do NOT license, sell, or allow third-party AI developers to scrape or train generative AI models (such as deepfake video generators or synthetic voice clones) on your talent media assets.</p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="space-y-5">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                7. Technical Safeguards & Infrastructure Security
              </h2>
              <p>
                We implement multi-layered technical, administrative, and physical security measures to safeguard your data against loss, unauthorized access, or disclosure:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-sm sm:text-base">
                <li><strong>TLS 1.3 Encryption:</strong> All platform traffic is encrypted in transit using industry-standard TLS 1.3 HTTPS protocols.</li>
                <li><strong>Role-Based Access Control (RBAC):</strong> Internal access to private talent contact data (phone numbers, full address) is strictly gated by NextAuth roles (`SUPER_ADMIN`, `ADMIN`).</li>
                <li><strong>Zero Secrets Policy:</strong> Database credentials, JWT auth secrets, and API keys are stored in secure environment vaults and never written to source code repositories.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section className="space-y-5">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                8. Data Retention, Archiving & Account Deletion Policy
              </h2>
              <p>
                Talent profile information and media files are retained for the duration of your active representation account.
              </p>
              <p>
                <strong>Account Deletion & Data Purge:</strong> If you request account deletion, your profile, contact data, physical measurements, and media assets are permanently purged from active databases within thirty (30) calendar days. Transactional invoices and signed commercial deal memos are retained for seven (7) years to comply with statutory taxation requirements under the Indian Income Tax Act.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-5">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                9. Your Rights as a Data Principal / Subject
              </h2>
              <p>
                Under applicable privacy statutes (DPDP Act, GDPR), you possess the following enforceable data rights:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-sm">
                <div className="bg-card border border-border p-5 rounded-xl">
                  <strong className="text-foreground font-bold block mb-1">Right to Access & Portability:</strong>
                  Request a complete machine-readable copy of your personal talent record.
                </div>
                <div className="bg-card border border-border p-5 rounded-xl">
                  <strong className="text-foreground font-bold block mb-1">Right to Correction:</strong>
                  Edit or update inaccurate physical measurements, city, or phone numbers via your Talent Dashboard.
                </div>
                <div className="bg-card border border-border p-5 rounded-xl">
                  <strong className="text-foreground font-bold block mb-1">Right to Erasure ("Forgotten"):</strong>
                  Request permanent deletion of your public portfolio and registration data.
                </div>
                <div className="bg-card border border-border p-5 rounded-xl">
                  <strong className="text-foreground font-bold block mb-1">Right to Withdraw Consent:</strong>
                  Opt out of marketing communications or toggle public profile visibility off at any time.
                </div>
              </div>
            </section>

            {/* Section 10 */}
            <section className="space-y-5">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                10. International Data Transfers & Cross-Border Compliance
              </h2>
              <p>
                As a global production house, talent profiles may be viewed by international brand clients located in the UK, USA, UAE, Europe, and APAC regions. When transferring data across borders, we ensure adequate safeguards through Standard Contractual Clauses (SCCs) and encrypted transport mechanisms.
              </p>
            </section>

            {/* Section 11 */}
            <section className="space-y-5">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                11. Children's & Minor Talent Privacy Policy
              </h2>
              <p>
                Talent under the age of eighteen (18) may register on MP Production only with the explicit consent and supervision of a parent or legal guardian. Parental co-management of accounts is required for all minor casting bookings.
              </p>
            </section>

            {/* Section 12 */}
            <section className="space-y-5 border-t border-border pt-10">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                12. Policy Updates & Data Protection Officer Contact
              </h2>
              <p>
                We may revise this Privacy Policy periodically to reflect technological or regulatory updates. Any changes will be published here with a revised "Last Updated" timestamp.
              </p>
              
              <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl space-y-3 text-foreground mt-4">
                <h3 className="font-bold text-lg text-brand">MP Production Privacy & Data Protection Office</h3>
                <p className="text-muted-foreground text-sm">
                  <strong>Data Protection Officer (DPO):</strong> <a href="mailto:privacy@mpproduction.com" className="text-foreground underline">privacy@mpproduction.com</a> / <a href="mailto:hello@mpproduction.com" className="text-foreground underline">hello@mpproduction.com</a>
                </p>
                <p className="text-muted-foreground text-sm">
                  <strong>Corporate Studio HQ:</strong> Studio 4B, Film City Complex, Goregaon East, Mumbai, Maharashtra 400065, India
                </p>
                <p className="text-muted-foreground text-sm">
                  <strong>Grievance Response Time:</strong> Within 48 business hours
                </p>
              </div>
            </section>

          </div>
        </Container>
      </main>
    </>
  );
}

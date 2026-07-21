import { Navbar } from '@/components/ui/Navbar';
import { Container } from '@/components/ui/Container';

export const metadata = {
  title: 'Terms of Service — MP Production',
  description: 'Comprehensive Terms of Service and legal governance framework for MP Production media, studio, casting, and talent management operations.',
};

export default function TermsOfService() {
  return (
    <>
      <Navbar />
      <main className="page-content pt-32 pb-28 bg-background text-foreground">
        <Container size="md">
          {/* Header */}
          <div className="border-b border-border pb-10 mb-14">
            <span className="text-brand text-xs font-bold tracking-widest uppercase mb-3 block">
              Legal Governance & Binding Agreement
            </span>
            <h1 className="text-4xl sm:text-6xl font-serif text-foreground font-light mb-4 leading-tight">
              Terms of Service
            </h1>
            <p className="text-sm text-muted-foreground">
              Document Reference: LEGAL-TOS-2026-V2 · Effective Date: January 1, 2026 · Last Updated: July 2026
            </p>
          </div>

          {/* Legal Content */}
          <div className="space-y-14 text-muted-foreground leading-relaxed font-light text-base md:text-lg">
            
            {/* Section 1 */}
            <section className="space-y-5">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                1. Acceptance of Terms & Corporate Governance
              </h2>
              <p>
                Welcome to <strong>MP Production</strong> ("Company", "we", "us", or "our"). These Terms of Service ("Terms") constitute a legally binding agreement entered into between MP Production and you ("User", "Client", "Talent", or "Subscriber"), whether individually or on behalf of a corporate entity, brand, agency, or production partner.
              </p>
              <p>
                By accessing, browsing, registering an account, booking studio services, submitting talent applications, or utilizing any portion of our digital platform and physical studio facilities (collectively, the "Services"), you acknowledge that you have read, understood, and agree to be bound by all of these Terms, alongside our incorporated <a href="/privacy" className="text-brand underline">Privacy Policy</a>.
              </p>
              <div className="bg-surface border border-border p-6 rounded-2xl space-y-3">
                <h3 className="text-foreground font-bold text-sm uppercase tracking-wider">Defined Terms in This Agreement:</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li><strong>"Platform":</strong> The website located at mpproduction.com, associated client portals, talent dashboards, API endpoints, and mobile applications.</li>
                  <li><strong>"Talent":</strong> Models, actors, vocalists, dancers, directors, cinematographers, and creative artists registered on our talent roster directory.</li>
                  <li><strong>"Client":</strong> Brands, corporate entities, advertising agencies, casting directors, and producers booking production or talent services.</li>
                  <li><strong>"Master Footage / Deliverables":</strong> High-resolution digital cinema files (R3D, ARRIRAW, ProRes), color graded masters, audio stems, and finished commercial films.</li>
                  <li><strong>"Deal Memo / MSA":</strong> The specific Master Services Agreement or commercial invoice executed between MP Production and a Client.</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-5">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                2. Scope of Commercial & Studio Services
              </h2>
              <p>
                MP Production operates a full-service creative media studio, providing high-end commercial cinema production, Dolby Vision post-production, spatial audio engineering, and exclusive representation of talent rosters.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3">
                <div className="bg-card border border-border p-6 rounded-2xl space-y-2">
                  <h3 className="text-foreground font-bold text-base">A. Cinema Production</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Full-scale commercial filming, 4K/8K cinematography, anamorphic optics, high-speed camera robotics, FPV drone operation, location fixing, and studio soundstage rental.
                  </p>
                </div>
                <div className="bg-card border border-border p-6 rounded-2xl space-y-2">
                  <h3 className="text-foreground font-bold text-base">B. Post & Color Finishing</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Offline & online edit suites, ACES color management, Dolby Vision HDR mastering, custom film print LUT emulation, VFX composition, Foley, and Dolby Atmos mixing.
                  </p>
                </div>
                <div className="bg-card border border-border p-6 rounded-2xl space-y-2">
                  <h3 className="text-foreground font-bold text-base">C. Talent Roster Agency</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Curating verified talent shortlists, casting call management, digital headshot directory, performance audition management, and legal buy-out negotiations.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-5">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                3. Talent Roster Registration & Code of Conduct
              </h2>
              <p>
                Talent registering on our platform must provide truthful, current, and precise information regarding their identity, measurements, experience level, contact credentials, and portfolio media.
              </p>
              
              <div className="space-y-4 text-foreground/90">
                <h3 className="text-foreground font-serif text-xl font-normal">3.1 Media License Grant for Portfolio Showcase</h3>
                <p className="text-muted-foreground">
                  By submitting headshots, photos, video showreels, or audio clips to your talent profile, you grant MP Production a worldwide, non-exclusive, royalty-free license to host, display, stream, format, and present such media to verified casting directors, corporate clients, and public agency promotional channels (website, lookbooks, social channels) for the explicit purpose of securing commercial bookings for you.
                </p>

                <h3 className="text-foreground font-serif text-xl font-normal">3.2 On-Set Professional Code of Conduct</h3>
                <p className="text-muted-foreground">
                  All Talent booked for MP Production shoots or third-party client shoots agree to adhere strictly to professional standards:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-sm sm:text-base">
                  <li><strong>Punctuality:</strong> Arrive on set at least 15 minutes prior to the designated call time in pre-agreed wardrobe/grooming state.</li>
                  <li><strong>Zero-Substance Policy:</strong> Intoxication or possession of illegal substances on set will result in immediate dismissal, forfeiture of booking fees, and permanent removal from our roster.</li>
                  <li><strong>Strict Non-Disclosure (NDA):</strong> Talent are strictly forbidden from capturing behind-the-scenes photographs, videos, or disclosing unreleased garments, scripts, celebrity appearances, or client campaign details on personal social media without prior written clearance.</li>
                </ul>

                <h3 className="text-foreground font-serif text-xl font-normal">3.3 Anti-Bypass & Direct Client Engagement Clause</h3>
                <p className="text-muted-foreground">
                  Talent introduced to a client through MP Production’s platform or casting calls agree not to circumvent MP Production by negotiating direct bookings or payments with said client for a period of twenty-four (24) months following the initial introduction, unless explicit written consent is granted by MP Production management.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-5">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                4. Client Bookings, Commercial Estimates & Financial Terms
              </h2>
              <p>
                Inquiries, quotes, and calendar reservations submitted through the site become legally binding production agreements only upon execution of a formal Deal Memo or Master Services Agreement (MSA) accompanied by the required advance deposit.
              </p>
              
              <div className="bg-surface border border-border p-6 rounded-2xl space-y-4">
                <h3 className="text-foreground font-bold text-base uppercase tracking-wider">Standard Billing & Payment Milestone Schedule:</h3>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
                  <li><strong>50% Advance Booking Retainer:</strong> Due upon contract execution to reserve studio dates, crew, cameras, and talent.</li>
                  <li><strong>25% Mid-Production Milestone:</strong> Due upon completion of principal photography prior to offline editing.</li>
                  <li><strong>25% Final Master Delivery Milestone:</strong> Due prior to the release of high-resolution un-watermarked 4K deliverables or ProRes master files.</li>
                </ol>
                <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                  <strong>Late Payment Interest:</strong> Overdue invoices accrue interest at the rate of 1.5% per month (18% per annum) or the maximum allowed by applicable law.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-foreground font-serif text-xl font-normal">4.2 Production Cancellation & Rescheduling Fees</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Rescheduling or canceling confirmed shoot dates requires written notice. Because equipment, studio space, and crew are exclusively committed, the following cancellation charges apply:
                </p>
                <ul className="list-disc pl-6 space-y-1.5 text-sm text-muted-foreground">
                  <li><strong>Notice 14+ Days Prior:</strong> 15% administrative processing fee.</li>
                  <li><strong>Notice 7–13 Days Prior:</strong> 30% of total estimated production budget.</li>
                  <li><strong>Notice 48 Hours – 6 Days Prior:</strong> 50% of total estimated production budget.</li>
                  <li><strong>Notice Less Than 48 Hours:</strong> 100% of total estimated production budget (to cover crew retainers, gear rentals, and talent hold fees).</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-5">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                5. Intellectual Property Rights & Master Content Ownership
              </h2>
              <div className="space-y-4">
                <p>
                  Intellectual property rights associated with produced media are categorized strictly as follows:
                </p>
                <ul className="list-disc pl-6 space-y-3 text-muted-foreground text-sm sm:text-base">
                  <li><strong>Pre-Existing Proprietary Tools:</strong> All custom color lookup tables (LUTs), software algorithms, project templates, brand guidelines, design tokens, and website infrastructure remain the sole property of MP Production.</li>
                  <li><strong>Client Master Deliverables:</strong> Subject to full payment of all invoices, the Client is granted exclusive, licensed commercial usage rights as defined in their Deal Memo (e.g., 1-Year Regional Broadcast, Digital Global, etc.).</li>
                  <li><strong>Raw Unedited Sensor Files (RAW Rights):</strong> Unedited sensor camera files (ARRIRAW, RED R3D, Sony MXF) remain the intellectual property of MP Production unless a specific RAW Master Purchase Agreement is negotiated and paid in full.</li>
                  <li><strong>Talent Likeness Buy-Out Scope:</strong> Usage of talent likeness beyond the contracted term, territory, or media format requires additional usage buy-out payments to the talent and MP Production agency.</li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section className="space-y-5">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                6. Acceptable Use Policy & System Integrity
              </h2>
              <p>
                Users of the platform agree not to engage in any activity that compromises security, system performance, or data privacy. Prohibited actions include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-sm sm:text-base">
                <li>Using automated web scrapers, bots, or AI scrapers to extract talent contact info, images, or media assets without written consent.</li>
                <li>Training machine learning or generative AI models on talent photographs, vocal tracks, or showreels hosted on our platform.</li>
                <li>Attempting to probe, scan, or breach system security, JWT authentication guards, or database API controls.</li>
                <li>Impersonating another person, talent agent, corporate brand, or casting director.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="space-y-5">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                7. Confidentiality & Non-Disclosure (NDA)
              </h2>
              <p>
                During the course of interactions, parties may gain access to non-public confidential information, including unreleased campaign ideas, commercial scripts, product designs, marketing budgets, and client identities. Both Client and Talent agree to hold all confidential information in strict confidence and refrain from disclosing it to any third party during and perpetually after the term of engagement.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-5">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                8. Indemnification & Liability Hold Harmless
              </h2>
              <p>
                You agree to defend, indemnify, and hold harmless MP Production, its directors, officers, employees, fixers, and agents from and against any third-party claims, damages, losses, liabilities, and legal expenses (including reasonable attorney fees) arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground text-sm">
                <li>Your breach of any provision of these Terms of Service.</li>
                <li>Copyright or trademark infringement of client-supplied graphics, music, or script materials.</li>
                <li>Personal injury or property damage caused by gross negligence or willful misconduct during a shoot.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section className="space-y-5">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                9. Limitation of Liability & Force Majeure
              </h2>
              <p>
                To the maximum extent permitted by applicable law, MP Production shall not be liable for indirect, incidental, consequential, special, or punitive damages (including loss of profits, commercial opportunity, or brand reputation) arising out of or in connection with our services.
              </p>
              <p>
                <strong>Maximum Liability Cap:</strong> In all circumstances, MP Production's total aggregate liability shall be limited strictly to the actual net fees received by MP Production from the client for the specific project giving rise to the claim.
              </p>
              <p>
                <strong>Force Majeure:</strong> Neither party shall be liable for delay or failure in performance resulting from acts of God, extreme natural disasters, pandemic lockdowns, civil unrest, government embargoes, or power grid failures beyond reasonable control.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-5">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                10. Termination & Account Deactivation
              </h2>
              <p>
                MP Production reserves the right to suspend or terminate your access to the platform or roster representation immediately, without prior notice, in the event of a material breach of these Terms, unethical conduct on set, non-payment of invoices, or platform abuse.
              </p>
            </section>

            {/* Section 11 */}
            <section className="space-y-5">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                11. Governing Law & Binding Arbitration
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any dispute, controversy, or claim arising out of or relating to these Terms shall be resolved first through informal negotiations (30 days), and if unresolved, referred to binding arbitration under the Arbitration and Conciliation Act, 1996 in Mumbai, India, before a sole arbitrator appointed by MP Production.
              </p>
              <p>
                The courts located in <strong>Mumbai, Maharashtra, India</strong> shall have exclusive jurisdiction over any legal proceedings that cannot be arbitrated.
              </p>
            </section>

            {/* Section 12 */}
            <section className="space-y-5 border-t border-border pt-10">
              <h2 className="text-2xl md:text-4xl font-serif text-foreground font-normal border-l-2 border-brand pl-4">
                12. Amendments & Corporate Legal Cell Contact
              </h2>
              <p>
                We reserve the right to revise these Terms of Service at any time. Updated versions will be posted with a revised "Last Updated" timestamp. Continued use of our Services following updates constitutes acceptance of the amended Terms.
              </p>
              
              <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl space-y-3 text-foreground mt-4">
                <h3 className="font-bold text-lg text-brand">MP Production Corporate Legal Cell</h3>
                <p className="text-muted-foreground text-sm">
                  <strong>Legal Email:</strong> <a href="mailto:legal@mpproduction.com" className="text-foreground underline">legal@mpproduction.com</a> / <a href="mailto:hello@mpproduction.com" className="text-foreground underline">hello@mpproduction.com</a>
                </p>
                <p className="text-muted-foreground text-sm">
                  <strong>Corporate Studio HQ:</strong> Studio 4B, Film City Complex, Goregaon East, Mumbai, Maharashtra 400065, India
                </p>
                <p className="text-muted-foreground text-sm">
                  <strong>Support Desk:</strong> +91 98200 11223 (Mon – Fri, 10:00 AM – 7:00 PM IST)
                </p>
              </div>
            </section>

          </div>
        </Container>
      </main>
    </>
  );
}

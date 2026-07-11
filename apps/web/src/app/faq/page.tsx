'use client';

import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { HelpCircle, CreditCard, Film, Award, Package } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAPI } from '@/lib/api-client';
import Image from 'next/image';

const defaultCategories = [
  { name: "General", icon: <HelpCircle className="w-4 h-4" /> },
  { name: "Booking & Payments", icon: <CreditCard className="w-4 h-4" /> },
  { name: "Production", icon: <Film className="w-4 h-4" /> },
  { name: "Talent", icon: <Award className="w-4 h-4" /> },
  { name: "Deliverables", icon: <Package className="w-4 h-4" /> },
];

const defaultFaqs: Record<string, { q: string; a: string }[]> = {
  "General": [
    { q: "What services does MP Productions offer?", a: "We offer cinematic production (commercials, narratives, documentaries), talent management (models, influencers, actors), and full post-production services (color grading, VFX, sound design, editorial finishing)." },
    { q: "Where is MP Productions based?", a: "Our headquarters are in Los Angeles, CA with satellite studios in Mumbai and Dubai. We operate globally and have executed projects across 15+ countries." },
    { q: "How do I get started with a project?", a: "The fastest way is to book through our client portal. Select your service, pick a date, and we'll generate an instant quote. Alternatively, contact us directly for a discovery call." },
    { q: "What industries do you serve?", a: "We serve fashion, automotive, FMCG, tech, real estate, entertainment, and lifestyle brands. Our portfolio spans from Fortune 500 campaigns to independent short films." },
  ],
  "Booking & Payments": [
    { q: "How does the booking process work?", a: "Select a service → choose a date from our live availability calendar → fill in your project brief → receive an auto-generated quote → pay the advance (30%) → booking confirmed. The entire process takes under 5 minutes." },
    { q: "What payment methods are accepted?", a: "We accept UPI, Net Banking, Credit/Debit Cards, Wallets, and EMI through our secure Razorpay gateway. All payments are PCI-DSS compliant — we never store card data." },
    { q: "Can I reschedule my booking?", a: "Yes. Rescheduling is free if done 72+ hours before the shoot date. Within 72 hours, a 10% rescheduling fee applies. Contact your project manager or use the client portal." },
    { q: "What is your refund policy?", a: "Cancellations 72+ hours before the shoot receive a full advance refund. Within 72 hours, 50% of the advance is retained. No refunds after the shoot date." },
  ],
  "Production": [
    { q: "What cameras and equipment do you use?", a: "We shoot on RED Komodo, ARRI Alexa Mini LF, and Sony Venice 2. Our lighting inventory includes ARRI SkyPanels, Aputure 600d's, and Nanlite PavoTube series. Drone footage is captured on DJI Inspire 3." },
    { q: "Do you provide crew and location?", a: "All packages include a core crew (cinematographer, sound, PA). Location scouting, talent, drone operators, and specialized crew are available as add-ons or included in Professional/Enterprise packages." },
    { q: "What's the typical turnaround time?", a: "Starter packages: 5 business days. Professional: 10 business days. Enterprise: custom timeline agreed during onboarding. Rush delivery available for an additional fee." },
    { q: "Can I attend the shoot?", a: "Absolutely. Clients are welcome on set. Your project manager will provide a call sheet with the location, parking, and call time 48 hours before the shoot." },
  ],
  "Talent": [
    { q: "How do I join the talent network?", a: "Visit our Talent page and click 'Join as Talent'. Fill in your profile, upload portfolio items, and submit. Our team will review your application within 48 hours." },
    { q: "Is registration free for talent?", a: "Yes. Talent registration and profile hosting on our marketplace is completely free. MP Productions earns through production bookings, not talent fees." },
    { q: "How does the casting board work?", a: "We publish open casting calls for active projects. Registered talent matching the requirements can apply with a single click. You'll be notified of your application status via WhatsApp." },
    { q: "Can external clients hire talent directly?", a: "Yes. Anyone can browse our public talent directory and submit a 'Hire Request' for any artist. Our team coordinates the engagement, scheduling, and payment." },
  ],
  "Deliverables": [
    { q: "How do I receive my final files?", a: "All deliverables are uploaded to your secure client portal. You'll receive a WhatsApp notification when files are ready. Download links are valid for 90 days." },
    { q: "What formats do you deliver in?", a: "Standard delivery includes MP4 (H.264 for web, ProRes for broadcast), with aspect ratios for 16:9, 9:16, and 1:1 as needed. RAW files available on request for Enterprise clients." },
    { q: "How do revisions work?", a: "You can provide timestamped feedback directly in our video player. Each comment pins to the exact frame. Revision rounds are defined by your package tier." },
    { q: "How long do you store my files?", a: "Deliverables are stored for 90 days post-delivery. After 1 year, files are archived. Permanent storage is available as an add-on for Enterprise clients." },
  ],
};

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState("General");
  const [faqs, setFaqs] = useState<Record<string, { q: string; a: string }[]>>(defaultFaqs);
  const [categories, setCategories] = useState<any[]>(defaultCategories);
  const [hero, setHero] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAPI('/cms/faq').catch(() => null),
      fetchAPI('/cms/hero?page=faq').catch(() => null)
    ])
      .then(([faqRes, heroRes]) => {
        if (faqRes && faqRes.success && faqRes.data && Object.keys(faqRes.data).length > 0) {
          setFaqs(faqRes.data);
          if (Array.isArray(faqRes.categories)) {
            const mappedCats = faqRes.categories.map((c: string) => {
              const existing = defaultCategories.find(dc => dc.name === c);
              return existing || { name: c, icon: <HelpCircle className="w-4 h-4" /> };
            });
            setCategories(mappedCats);
            if (mappedCats.length > 0 && !mappedCats.some((c: any) => c.name === activeCategory)) {
              setActiveCategory(mappedCats[0].name);
            }
          }
        }
        if (heroRes && heroRes.success && heroRes.data) {
          setHero(heroRes.data);
        }
      })
      .catch(() => {
        toast.error('Failed to load FAQ items');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar />
      <main className="page-content">
        <Container size="md">

          {/* Header Section */}
        <section className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden mb-20 text-center -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12 w-[calc(100%+2rem)] sm:w-[calc(100%+4rem)] lg:w-[calc(100%+6rem)] rounded-none">
          <Image 
            src="/images/bg-luxury.jpg" 
            alt="FAQ & Support" 
            fill 
            className="object-cover" 
            priority sizes="100vw" />
          <div className="absolute inset-0 dark:bg-black/60 bg-black/40" />
          <div className="absolute bottom-0 left-0 right-0 h-32 dark:bg-gradient-to-t dark:from-background bg-gradient-to-t from-background to-transparent" />
          
          <Container className="relative z-10 w-full max-w-5xl mx-auto px-4">
            <Reveal direction="up">
              <span className="text-brand tracking-[0.2em] text-sm uppercase font-semibold mb-4 block drop-shadow-md">
                {hero?.tagline || "Support"}
              </span>
              <h1 className="text-6xl sm:text-8xl font-display text-white tracking-editorial leading-[0.92] mb-8 font-light drop-shadow-lg whitespace-pre-line">
                {hero?.heading || "FAQ."}
              </h1>
              <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-light leading-relaxed mb-12 drop-shadow">
                {hero?.subheading || "Find answers to the most common questions about our services, booking process, and deliverables."}
              </p>
            </Reveal>
          </Container>
        </section>

          {/* Category Filters */}
          <Reveal direction="up" delay={0.1}>
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`pill-btn flex items-center gap-2 ${
                    activeCategory === cat.name
                      ? 'pill-btn-active'
                      : 'text-muted-foreground bg-surface'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </Reveal>

          {/* FAQ Accordion */}
          {loading ? (
            <div className="space-y-4 py-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="border border-border rounded-xl p-6 bg-muted/20 animate-pulse space-y-2">
                  <div className="h-6 bg-muted/40 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(faqs[activeCategory] || []).map((faq, idx) => (
                <Reveal key={`${activeCategory}-${idx}`} direction="up" delay={idx * 0.05}>
                  <details className="group accordion-item">
                    <summary className="flex items-center justify-between px-8 py-6 cursor-pointer text-foreground font-medium hover:text-primary transition-colors list-none [&::-webkit-details-marker]:hidden">
                      <span>{faq.q}</span>
                      <svg className="w-5 h-5 text-muted-foreground/70 group-open:rotate-180 transition-transform duration-300 flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </summary>
                    <div className="px-8 pb-6 text-muted-foreground font-light leading-relaxed border-t border-border pt-4">
                      {faq.a}
                    </div>
                  </details>
                </Reveal>
              ))}
            </div>
          )}

          {/* WhatsApp Support CTA */}
          <Reveal direction="up">
            <div className="cta-section mt-20">
              <h2 className="text-2xl font-serif text-white mb-4">Still have questions?</h2>
              <p className="text-white/80 font-light mb-8 max-w-md mx-auto">
                Chat with us directly on WhatsApp for instant support, or send us an email.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer" className="px-8 py-3 bg-[#25D366] text-white uppercase tracking-widest text-sm hover:brightness-110 transition-all rounded-full shadow-sm inline-flex items-center justify-center gap-2 font-medium">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  WhatsApp Support
                </a>
                <Button href="/contact" size="lg" variant="accent" className="!rounded-full">
                  Contact Form
                </Button>
              </div>
            </div>
          </Reveal>

        </Container>
      </main>
    </>
  );
}

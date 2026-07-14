"use client";

import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { fetchAPI } from '@/lib/api-client';
import Image from 'next/image';

const defaultPackages = [
  {
    name: "Starter",
    price: "₹25,000",
    period: "per project",
    description: "Perfect for social media content and short-form brand videos.",
    features: [
      "Up to 1 shoot day",
      "1 Cinematographer",
      "Basic color grading",
      "3 final deliverables",
      "5 business day turnaround",
      "1 revision round",
    ],
    highlighted: false,
    cta: "Get Started"
  },
  {
    name: "Professional",
    price: "₹75,000",
    period: "per project",
    description: "Full-service production for brand campaigns and premium content.",
    features: [
      "Up to 3 shoot days",
      "Full crew (DOP, Sound, PA)",
      "Professional color grading",
      "10 final deliverables",
      "10 business day turnaround",
      "3 revision rounds",
      "Drone footage included",
      "Licensed music",
    ],
    highlighted: true,
    cta: "Most Popular"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "quoted",
    description: "Large-scale productions, documentaries, and multi-day shoots.",
    features: [
      "Unlimited shoot days",
      "Full crew + talent sourcing",
      "Cinema-grade color grading",
      "Unlimited deliverables",
      "Custom timeline",
      "Unlimited revisions",
      "VFX & motion graphics",
      "Dedicated project manager",
      "Priority support",
    ],
    highlighted: false,
    cta: "Contact Sales"
  },
];

const faqs = [
  { q: "What's included in the base price?", a: "Every package includes professional cinematography, basic editing, and digital delivery via our client portal. Equipment, crew, and post-production scope vary by tier." },
  { q: "Can I customize a package?", a: "Absolutely. Our pricing packages are starting points. We tailor every proposal to your project's specific needs after a discovery call." },
  { q: "What payment methods do you accept?", a: "We accept UPI, Net Banking, Credit/Debit Cards, and EMI options through our secure Razorpay gateway. A 30% advance is required to confirm your booking." },
  { q: "What is your cancellation policy?", a: "Cancellations 72+ hours before the shoot date receive a full refund of the advance. Within 72 hours, 50% of the advance is retained as a scheduling fee." },
];

export default function Pricing() {
  const [packages, setPackages] = useState<any[]>(defaultPackages);
  const [hero, setHero] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAPI('/cms/pricing').catch(() => null),
      fetchAPI('/cms/hero?page=pricing').catch(() => null)
    ])
      .then(([pricingRes, heroRes]) => {
        if (pricingRes && pricingRes.success && pricingRes.data) {
          const fetchedTiers = Array.isArray(pricingRes.data)
            ? pricingRes.data
            : (pricingRes.data.tiers && Array.isArray(pricingRes.data.tiers))
              ? pricingRes.data.tiers
              : null;
          if (fetchedTiers && fetchedTiers.length > 0) {
            setPackages(fetchedTiers);
          }
        }
        if (heroRes && heroRes.success && heroRes.data) {
          setHero(heroRes.data);
        }
      })
      .catch(() => {
        toast.error('Failed to load pricing packages');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar />
      <main className="page-content">
        <Container>

          {/* Header Section */}
        <section className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden mb-20 text-center -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12 w-[calc(100%+2rem)] sm:w-[calc(100%+4rem)] lg:w-[calc(100%+6rem)] rounded-none">
          <Image 
            src="/images/pricing-hero.jpg" 
            alt="Investment" 
            fill 
            className="object-cover" 
            priority sizes="100vw" />
          <div className="absolute inset-0 dark:bg-black/60 bg-black/40" />
          <div className="absolute bottom-0 left-0 right-0 h-32 dark:bg-gradient-to-t dark:from-background bg-gradient-to-t from-background to-transparent" />
          
          <Container className="relative z-10 w-full max-w-5xl mx-auto px-4">
            <Reveal direction="up">
              <span className="text-brand tracking-[0.2em] text-sm uppercase font-semibold mb-4 block drop-shadow-md">
                {hero?.tagline || "Investment"}
              </span>
              <h1 className="text-6xl sm:text-8xl font-display text-white tracking-editorial leading-[0.92] mb-8 font-light drop-shadow-lg whitespace-pre-line">
                {hero?.heading || "TRANSPARENT PRICING."}
              </h1>
              <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-light leading-relaxed mb-12 drop-shadow">
                {hero?.subheading || "Choose a package that fits your project, or request a custom quote for bespoke productions. All prices are exclusive of 18% GST."}
              </p>
            </Reveal>
          </Container>
        </section>

          {/* Pricing Cards */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-32">
              {[1, 2, 3].map((n) => (
                <div key={n} className="border border-border rounded-2xl p-8 bg-muted/20 animate-pulse h-[550px] flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="h-5 bg-muted/40 rounded w-1/3" />
                    <div className="h-10 bg-muted/40 rounded w-1/2" />
                    <div className="h-16 bg-muted/40 rounded w-full" />
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-4 bg-muted/40 rounded w-full" />
                    ))}
                  </div>
                  <div className="h-12 bg-muted/40 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-32">
              {packages.map((pkg, idx) => (
                <Reveal key={pkg.id || idx} direction="up" delay={idx * 0.1}>
                  <Card padding="none" hover className={`flex flex-col h-full overflow-hidden ${
                    pkg.highlighted 
                      ? 'border-2 border-primary shadow-xl relative' 
                      : ''
                  }`}>
                    {pkg.highlighted && (
                      <div className="bg-primary text-white text-center py-2 text-xs uppercase tracking-widest font-semibold">
                        Recommended
                      </div>
                    )}
                    <div className="p-8 md:p-10 flex flex-col flex-grow">
                      <h3 className="text-lg uppercase tracking-widest text-muted-foreground font-medium mb-2">{pkg.name}</h3>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-serif text-foreground">{pkg.price}</span>
                        <span className="text-sm text-muted-foreground/70">{pkg.period}</span>
                      </div>
                      <p className="text-muted-foreground font-light text-sm mb-8">{pkg.description}</p>

                      <ul className="space-y-4 mb-10 flex-grow">
                        {(pkg.features || []).map((feature: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                            <svg className="w-4 h-4 text-[var(--success)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button 
                        href={pkg.price === "Custom" ? "/contact" : "/login"} 
                        variant={pkg.highlighted ? "primary" : "outline"}
                        size="lg"
                        className="w-full justify-center"
                      >
                        {pkg.cta || "Get Started"}
                      </Button>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          )}

          {/* FAQ Section */}
          <Reveal direction="up">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-serif text-foreground text-center mb-12">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <details key={idx} className="group accordion-item">
                    <summary className="flex items-center justify-between px-8 py-6 cursor-pointer text-foreground font-medium hover:text-primary transition-colors list-none [&::-webkit-details-marker]:hidden">
                      <span>{faq.q}</span>
                      <svg className="w-5 h-5 text-muted-foreground/70 group-open:rotate-180 transition-transform duration-300 flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </summary>
                    <div className="px-8 pb-6 text-muted-foreground font-light leading-relaxed border-t border-border pt-4">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Custom Quote CTA */}
          <Reveal direction="up">
            <div className="cta-section mt-20">
              <h2 className="text-3xl font-serif text-white mb-4">Need a Custom Quote?</h2>
              <p className="text-white/80 font-light max-w-lg mx-auto mb-8">
                For bespoke productions, multi-day shoots, or enterprise partnerships, our team will craft a tailored proposal.
              </p>
              <Button href="/contact" size="lg" variant="accent">
                Request Custom Quote
              </Button>
            </div>
          </Reveal>

        </Container>
      </main>
    </>
  );
}

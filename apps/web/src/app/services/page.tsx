"use client";

import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { fetchAPI } from '@/lib/api-client';
import Image from 'next/image';

export default function Services() {
  const defaultServices = [
    {
      id: "cinematic",
      title: "Cinematic Production",
      desc: "Full-scale commercial, narrative, and documentary production utilizing industry-leading cinema cameras and lighting.",
      img: "/images/services-hero.jpg",
      features: ["RED & ARRI Camera Packages", "Professional Crew & Lighting", "Location Scouting", "Full Production Insurance"],
      pricing: "Starts at ₹50,000 / Day"
    },
    {
      id: "talent",
      title: "Talent Management",
      desc: "Exclusive representation of elite models, actors, and digital creators worldwide. Bridging the gap between brands and the perfect face.",
      img: "/images/join-hero.jpg",
      features: ["Access to 50k+ Roster", "Casting Direction", "Contract Negotiation", "On-set Talent Handling"],
      pricing: "Custom Quote"
    },
    {
      id: "post",
      title: "Post-Production",
      desc: "High-end color grading, VFX, sound design, and editorial finishing. We deliver the final polish that turns footage into cinema.",
      img: "/images/portfolio-equipment.jpg",
      features: ["DaVinci Resolve Color Grading", "Offline & Online Editing", "Sound Mixing & Foley", "VFX & Compositing"],
      pricing: "Starts at ₹20,000 / Project"
    }
  ];

  const [services, setServices] = useState<any[]>(defaultServices);
  const [hero, setHero] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAPI('/cms/services').catch(() => null),
      fetchAPI('/cms/hero?page=services').catch(() => null)
    ])
      .then(([servicesRes, heroRes]) => {
        if (servicesRes?.data && Array.isArray(servicesRes.data) && servicesRes.data.length > 0) {
          const mapped = servicesRes.data.map((s: any, idx: number) => ({
            id: s.id || s.slug,
            title: s.title || s.name,
            desc: s.desc || s.description || s.shortDesc,
            img: s.img || s.imageUrl || s.coverImage || defaultServices[idx % defaultServices.length].img,
            features: s.features && Array.isArray(s.features) ? s.features : (typeof s.features === 'string' ? JSON.parse(s.features || '[]') : defaultServices[idx % defaultServices.length].features),
            pricing: s.pricing || s.price || "Custom Quote"
          }));
          setServices(mapped);
        }
        if (heroRes?.data) {
          setHero(heroRes.data);
        }
      })
      .catch(() => {
        toast.error('Failed to load services data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar />
      <main className="page-content">
        
        {/* Header */}
        <section className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden mb-20 text-center">
          <Image 
            src="/images/services-hero.jpg" 
            alt="Services" 
            fill 
            className="object-cover" 
            priority sizes="100vw" />
          <div className="absolute inset-0 dark:bg-black/60 bg-black/40" />
          <div className="absolute bottom-0 left-0 right-0 h-32 dark:bg-gradient-to-t dark:from-background bg-gradient-to-t from-background to-transparent" />
          
          <Container className="relative z-10 w-full max-w-5xl mx-auto px-4">
            {loading && !hero ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-white/20 rounded w-28 mx-auto" />
                <div className="h-16 bg-white/20 rounded max-w-lg mx-auto" />
              </div>
            ) : (
              <Reveal direction="up">
                <span className="text-brand tracking-[0.2em] text-sm uppercase font-semibold mb-4 block drop-shadow-md">
                  {hero?.tagline || "Our Capabilities"}
                </span>
                <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 drop-shadow-lg">
                  {hero?.heading || "Premium Services"}
                </h1>
                <p className="text-lg text-white/80 max-w-2xl mx-auto text-balance font-light drop-shadow">
                  {hero?.subheading || "From conceptualization to the final grade, MP Productions provides end-to-end media solutions tailored for global brands and elite agencies."}
                </p>
              </Reveal>
            )}
          </Container>
        </section>

        {/* Service Cards */}
        <section className="mb-24">
          <Container>
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="border border-border rounded-2xl overflow-hidden aspect-[4/5] bg-muted/20 animate-pulse p-8 flex flex-col justify-between">
                    <div className="w-full aspect-video bg-muted/40 rounded-xl mb-4" />
                    <div className="h-6 bg-muted/40 rounded w-3/4 mb-2" />
                    <div className="h-16 bg-muted/40 rounded w-full mb-4" />
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-muted/40 rounded w-full" />
                      <div className="h-4 bg-muted/40 rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {services.map((svc, idx) => (
                  <Reveal key={idx} direction="up" delay={idx * 0.1}>
                    <div id={svc.id} className="h-full scroll-mt-24">
                      <div className="relative overflow-hidden flex flex-col h-full min-h-[500px] rounded-[2rem] border border-border group shadow-2xl">
                        {/* Background Image */}
                        <Image 
                          src={svc.img} 
                          alt={svc.title} 
                          fill 
                          className="object-cover transition-transform duration-1000 group-hover:scale-105" sizes="100vw" />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />
                        
                        <div className="relative z-10 p-8 flex flex-col flex-grow text-white">
                          <h3 className="text-3xl font-serif mb-4 text-white drop-shadow-md">{svc.title}</h3>
                          <p className="text-white/80 font-light leading-relaxed mb-6 flex-grow drop-shadow-sm">
                            {svc.desc}
                          </p>
                          
                          {svc.features && Array.isArray(svc.features) && svc.features.length > 0 && (
                            <ul className="space-y-3 mb-8 pt-6 border-t border-white/20">
                              {svc.features.map((feature: string, i: number) => (
                                <li key={i} className="flex items-center text-sm text-white/90 font-light">
                                  <svg className="w-4 h-4 text-brand mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          )}

                          <div className="flex items-center justify-between border-t border-white/20 pt-6 mt-auto">
                            <span className="text-sm font-semibold tracking-wide text-brand drop-shadow-sm">{svc.pricing}</span>
                            <Button href="/pricing" size="sm" className="bg-white text-black hover:bg-gray-200">
                              Book
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </Container>
        </section>

        {/* Booking CTA */}
        <section className="py-20">
          <Container size="sm">
            <div className="cta-section">
              <Reveal direction="up">
                <h2 className="text-3xl md:text-5xl font-serif text-foreground mb-6">Ready to start your project?</h2>
                <p className="text-foreground/80 max-w-xl mx-auto font-light mb-10 text-lg">
                  Log into the client portal to generate a custom quote, view availability, and secure your production dates instantly.
                </p>
                <Button href="/login" size="lg" variant="accent">
                  Launch Client Portal
                </Button>
              </Reveal>
            </div>
          </Container>
        </section>

      </main>
    </>
  );
}

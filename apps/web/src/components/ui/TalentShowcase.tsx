import React from 'react';
import Link from 'next/link';
import { Container } from './Container';
import { Reveal } from './Reveal';

interface FeaturedTalent {
  id: string;
  slug?: string;
  user: { firstName: string; lastName: string };
  type?: string;
  profileImageUrl?: string;
}

async function getFeaturedTalent(): Promise<FeaturedTalent[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${apiUrl}/talent/featured`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function TalentShowcase() {
  const talents = await getFeaturedTalent();

  if (talents.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-background">
      <Container>
        <Reveal direction="up">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <span className="text-primary tracking-widest text-sm uppercase mb-2 block font-medium">
                The Faces
              </span>
              <h2 className="text-4xl md:text-5xl font-serif text-foreground">
                Featured Talent
              </h2>
            </div>
            <Link href="/talent" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-300 uppercase text-xs font-semibold tracking-widest">
              View Roster &rarr;
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {talents.map((talent, index) => (
            <Reveal key={talent.id} direction="up" delay={index * 0.1}>
              <Link href={`/talent/${talent.slug || talent.id}`} className="group block relative overflow-hidden rounded-2xl aspect-[3/4] bg-surface border border-border shadow-sm hover:shadow-2xl transition-all duration-500">
                {/* Background Image */}
                {talent.profileImageUrl ? (
                  <div 
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    style={{ backgroundImage: `url(${talent.profileImageUrl})` }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-surface flex items-center justify-center">
                    <span className="text-6xl font-serif text-muted-foreground">{talent.user.firstName?.[0]}</span>
                  </div>
                )}
                
                {/* Gradient Overlay for Text Visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Hover Reveal Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                  <span className="px-6 py-3 bg-[var(--cinematic-text)]/10 backdrop-blur-md border border-[var(--cinematic-border)] text-[var(--cinematic-text)] rounded-sm font-semibold tracking-widest uppercase text-xs hover:bg-[var(--cinematic-text)] hover:text-[var(--cinematic-bg)] transition-colors">
                    View Comp Card
                  </span>
                </div>

                {/* Info block */}
                <div className="absolute bottom-0 left-0 w-full p-6 transform transition-transform duration-500 group-hover:translate-y-[-10px]">
                  <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1 shadow-black drop-shadow-md">
                    {talent.type ? talent.type.replace('_', ' ') : 'Talent'}
                  </p>
                  <h3 className="text-2xl font-serif text-white shadow-black drop-shadow-lg">
                    {talent.user.firstName} {talent.user.lastName}
                  </h3>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

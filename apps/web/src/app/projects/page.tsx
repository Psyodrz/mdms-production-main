'use client';

import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { useState, useEffect } from 'react';


export default function Portfolio() {
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All', 'Fashion', 'Music Video', 'Commercial', 'Corporate']);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
        const res = await fetch(`${apiUrl}/cms/portfolio`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && json.data.length > 0) {
            setPortfolioItems(json.data);
            const cats = Array.from(new Set(json.data.map((i: any) => i.category))) as string[];
            setCategories(['All', ...cats]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch portfolio', err);
      }
    }
    fetchPortfolio();
  }, []);
  
  const filtered = activeFilter === 'All' 
    ? portfolioItems 
    : portfolioItems.filter(i => i.category === activeFilter);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground pt-24 pb-32">
        {/* Header Section */}
        <section className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden mb-20 text-center">
          <img 
            src="/images/projects-hero.jpg" 
            alt="Our Projects" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 dark:bg-black/60 bg-black/40" />
          <div className="absolute bottom-0 left-0 right-0 h-32 dark:bg-gradient-to-t dark:from-background bg-gradient-to-t from-background to-transparent" />
          
          <Container className="relative z-10 w-full max-w-5xl mx-auto px-4">
            <Reveal direction="up">
              <span className="text-brand tracking-[0.2em] text-sm uppercase font-semibold mb-4 block drop-shadow-md">
                Our Legacy
              </span>
              <h1 className="text-6xl sm:text-8xl font-display text-white tracking-editorial leading-[0.92] mb-8 font-light drop-shadow-lg">
                SELECTED WORKS
              </h1>
              <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-light leading-relaxed mb-12 drop-shadow">
                Explore our curated collection of cinematic productions, editorial shoots, and high-impact digital campaigns. Each project represents our commitment to absolute excellence.
              </p>
            </Reveal>
          </Container>
        </section>

        <Container>

          {/* Filter Buttons */}
          <Reveal direction="up" delay={0.2}>
            <div className="flex gap-3 mb-12 overflow-x-auto pb-4">
              {categories.map((filter) => (
                <button 
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`pill-btn ${
                    activeFilter === filter
                      ? 'pill-btn-active' 
                      : 'text-muted-foreground bg-surface'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Portfolio Grid */}
          {isLoading ? (
             <div className="py-20 text-center text-muted-foreground">Loading projects...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((item, idx) => (
                <Reveal key={item.id} direction="up" delay={(idx % 3) * 0.1}>
                  <Link href={`/portfolio/${item.slug}`}>
                    <Card padding="none" hover className="group cursor-pointer overflow-hidden flex flex-col h-full">
                      <div className="relative aspect-[4/5] overflow-hidden portfolio-img-wrap border-b border-border">
                        <div className="absolute inset-0 bg-primary/30 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                          <span className="px-6 py-3 border border-white text-white uppercase tracking-widest text-xs translate-y-4 group-hover:translate-y-0 transition-all duration-500 font-medium">
                            View Project
                          </span>
                        </div>
                        <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-in-out" />
                      </div>
                      <div className="p-6 flex justify-between items-start flex-grow">
                        <div>
                          <h3 className="text-2xl font-serif text-foreground group-hover:text-primary transition-colors duration-300">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground text-sm mt-2 uppercase tracking-wider font-semibold">
                            {item.category}
                          </p>
                        </div>
                        <span className="text-muted-foreground/70 text-sm font-light">{item.year}</span>
                      </div>
                    </Card>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </main>
    </>
  );
}

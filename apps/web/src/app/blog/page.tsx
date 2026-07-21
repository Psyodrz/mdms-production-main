"use client";

import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { fetchAPI } from '@/lib/api-client';
import Image from 'next/image';


export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [hero, setHero] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAPI('/cms/blog', { cache: 'no-store' }).catch(() => null),
      fetchAPI('/cms/hero?page=blog', { cache: 'no-store' }).catch(() => null)
    ])
      .then(([blogRes, heroRes]) => {
        if (blogRes && blogRes.success && blogRes.data && blogRes.data.length > 0) {
          setPosts(blogRes.data);
        }
        if (heroRes && heroRes.success && heroRes.data) {
          setHero(heroRes.data);
        }
      })
      .catch(() => {
        toast.error('Failed to load blog articles');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const featured = posts[0] || null;
  const gridPosts = posts.slice(1);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground pb-24 relative overflow-hidden">
        {/* Header Section — Full Bleed Merged With Navbar */}
        <section className="relative w-full h-[70vh] sm:h-[80vh] flex items-center justify-center overflow-hidden mb-20 text-center pt-28 sm:pt-36">
          <Image 
            src="/images/about-hero.jpg" 
            alt="The Journal" 
            fill 
            className="object-cover object-center" 
            priority sizes="100vw" />
          
          {/* Top Vignette Overlay for Navbar Integration */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-1 pointer-events-none" />
          <div className="absolute inset-0 dark:bg-black/60 bg-black/40 z-1" />
          <div className="absolute bottom-0 left-0 right-0 h-40 dark:bg-gradient-to-t dark:from-background bg-gradient-to-t from-background to-transparent z-2" />
          
          <Container className="relative z-10 w-full max-w-5xl mx-auto px-4">
            <Reveal direction="up">
              <span className="text-brand tracking-[0.2em] text-sm uppercase font-semibold mb-4 block drop-shadow-md">
                {hero?.tagline || "Insights & Journal"}
              </span>
              <h1 className="text-6xl sm:text-8xl font-display text-white tracking-editorial leading-[0.92] mb-8 font-light drop-shadow-lg whitespace-pre-line">
                {hero?.heading || "THE JOURNAL."}
              </h1>
              <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-light leading-relaxed mb-12 drop-shadow">
                {hero?.subheading || "Industry insights, production breakdowns, and behind-the-scenes stories from the MP Productions team."}
              </p>
            </Reveal>
          </Container>
        </section>

        <Container>
          {loading ? (
            <div className="mb-16 aspect-video lg:aspect-[2/1] rounded-2xl bg-muted/20 animate-pulse border border-border" />
          ) : featured ? (
            <Reveal direction="up" delay={0.1}>
              <div className="mb-16 group cursor-pointer">
                <Link href={`/blog/${featured.slug}`}>
                  <Card padding="none" hover className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden border border-border">
                    <div className="relative aspect-video lg:aspect-auto overflow-hidden bg-neutral-900">
                      {featured.coverImageUrl ? (
                        <img src={featured.coverImageUrl} alt={featured.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-neutral-800 to-neutral-900 flex items-center justify-center">
                          <span className="text-6xl font-serif text-muted-foreground">{featured.title?.[0]}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                      <span className="text-accent uppercase tracking-widest text-xs font-semibold mb-4">{featured.category || "Production"}</span>
                      <h2 className="text-3xl font-serif text-foreground mb-4 group-hover:text-primary transition-colors">{featured.title}</h2>
                      <p className="text-muted-foreground font-light leading-relaxed mb-6">{featured.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground/70">
                        <span>{featured.author || "Admin"}</span>
                        <span>·</span>
                        <span>{new Date(featured.publishedAt || featured.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            </Reveal>
          ) : (
            <div className="text-center py-20 border border-[var(--color-border)] bg-[var(--color-surface)]">
              <p className="text-muted-foreground italic">No articles published yet.</p>
            </div>
          )}

          {/* Post Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="border border-border rounded-2xl overflow-hidden bg-muted/20 animate-pulse h-96 flex flex-col justify-between p-6">
                  <div className="h-48 bg-muted/40 rounded-xl mb-4" />
                  <div className="h-6 bg-muted/40 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted/40 rounded w-full" />
                </div>
              ))}
            </div>
          ) : gridPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {gridPosts.map((post, idx) => (
                <Reveal key={post.id || idx} direction="up" delay={idx * 0.1}>
                  <Link href={`/blog/${post.slug}`} className="block h-full">
                    <Card padding="none" hover className="group cursor-pointer overflow-hidden flex flex-col h-full border border-border">
                      <div className="relative aspect-video overflow-hidden bg-neutral-900">
                        {post.coverImageUrl ? (
                          <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-neutral-800 to-neutral-900 flex items-center justify-center">
                            <span className="text-4xl font-serif text-muted-foreground">{post.title?.[0]}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <span className="text-accent uppercase tracking-widest text-xs font-semibold mb-3">{post.category || "General"}</span>
                        <h3 className="text-xl font-serif text-foreground mb-3 group-hover:text-primary transition-colors flex-grow">{post.title}</h3>
                        <p className="text-muted-foreground font-light text-sm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground/70 pt-4 border-t border-border mt-auto">
                          <span>{post.author || "Admin"}</span>
                          <span>·</span>
                          <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : null}

        </Container>
      </main>
      
    </>
  );
}

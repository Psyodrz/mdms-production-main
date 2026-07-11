'use client';

import { Navbar } from '@/components/ui/Navbar';

import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicViewerModal, ProjectSpec } from '@/components/ui/CinematicViewerModal';
import { Play, ArrowUpRight, Grid, LayoutGrid, Sparkles, Film, Eye, Camera, Sliders } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PortfolioProject extends ProjectSpec {
  id: string;
  slug: string;
  title: string;
  category: string;
  year: string;
  mediaUrl: string;
  description: string;
  aspectRatio?: 'tall' | 'wide' | 'square';
}

export const FALLBACK_PORTFOLIO: PortfolioProject[] = [
  {
    id: '1',
    slug: 'neon-city',
    title: 'Neon Silk · The Metamorphosis',
    category: 'Fashion Film',
    client: 'VOGUE x DIOR ARCHIVE',
    year: '2026',
    mediaUrl: '/images/portfolio-hero.jpg',
    coverImage: '/images/portfolio-hero.jpg',
    description: 'High-fashion cinematic editorial shot across cyberpunk neon alleyways in Mumbai and nocturnal studios in London. Exploring tactile silk movement against harsh industrial concrete.',
    videoUrl: '/videos/project_1.mp4',
    director: 'Aarav Mehta',
    dop: 'Elena Rostova',
    camera: 'ARRI ALEXA 35 (8K Open Gate)',
    lenses: 'Cooke Anamorphic /i Special Flare',
    colorGrade: 'Dolby Vision HDR · Custom Kodak 2383 Print Emulation',
    awards: ['Awwwards Site of the Day 2026', 'Cannes Lions Bronze Film Craft', 'Vimeo Staff Pick Premiere'],
    aspectRatio: 'tall',
  },
  {
    id: '2',
    slug: 'midnight-run',
    title: 'Midnight Anthem · VOLT Music',
    category: 'Music Video',
    client: 'VOLT RECORDS GLOBAL',
    year: '2026',
    mediaUrl: '/images/about-bts.jpg',
    coverImage: '/images/about-bts.jpg',
    description: 'A surrealist exploration of haute couture set against the stark, brutalist architecture of Eastern Europe. Shot entirely on 35mm film stock.',
    videoUrl: '/videos/project_2.mp4',
    director: 'Siddharth Kapoor',
    dop: 'Marcus Vance',
    camera: 'RED V-Raptor XL 8K VV',
    lenses: 'Panavision C-Series Anamorphic',
    colorGrade: 'High-Contrast Cyberpunk Technicolor Grade',
    awards: ['UK Music Video Awards Winner', 'Berlin Commercial Best Cinematography'],
    aspectRatio: 'wide',
  },
  {
    id: '3',
    slug: 'vantage-point',
    title: "Curinel's Reserve · Timeless Heritage",
    category: 'Commercial',
    client: 'CURINEL LUXURY SPIRITS',
    year: '2025',
    mediaUrl: '/images/careers-meeting.jpg',
    coverImage: '/images/careers-meeting.jpg',
    description: 'An atmospheric brand commercial shot on location across secluded coastal cliffs in South Goa and heritage Scottish distilleries. A symphony of amber light and slow motion.',
    videoUrl: '/videos/project_3.mp4',
    director: 'Maya Lin & Kabir Nair',
    dop: 'Jean-Luc Moreau',
    camera: 'ARRI ALEXA Mini LF',
    lenses: 'Zeiss Supreme Primes Radiance',
    colorGrade: 'Warm Gold Organic Film Grain Grade',
    awards: ['D&AD Yellow Pencil Cinematography', 'Clio Awards Silver Commercial'],
    aspectRatio: 'square',
  },
  {
    id: '4',
    slug: 'heritage-foundation',
    title: 'Skyline Suits · Executive Mastery',
    category: 'Brand Campaign',
    client: 'SKYLINE HAUTE COUTURE',
    year: '2025',
    mediaUrl: '/images/services-lighting.jpg',
    coverImage: '/images/services-lighting.jpg',
    description: 'Dynamic editorial campaign blending 16mm film grit with hyper-polished digital intermediate finishing, establishing a new visual standard for streetwear.',
    videoUrl: '/videos/reel_1.mp4',
    director: 'Kabir Nair',
    dop: 'Aarav Mehta',
    camera: 'Sony VENICE 2 8K',
    lenses: 'Arri/Zeiss Master Anamorphic',
    colorGrade: 'Monochrome Silver Retention Emulation',
    awards: ['ADC 104th Annual Awards Gold', 'Webby Awards Best Video Campaign'],
    aspectRatio: 'tall',
  },
  {
    id: '5',
    slug: 'echoes-of-silence',
    title: 'Echoes of Silence · Contemporary Ballet',
    category: 'Art & Theatre',
    client: 'ROYAL ACADEMY OF MOTION',
    year: '2026',
    mediaUrl: '/images/bg-abstract.jpg',
    coverImage: '/images/bg-abstract.jpg',
    description: 'An immersive 360-degree sensory exploration of human movement and architectural acoustic spaces, captured with robotic motion control arms.',
    videoUrl: '/videos/reel_2.mp4',
    director: 'Elena Rostova',
    dop: 'Siddharth Kapoor',
    camera: 'ARRI ALEXA 35 + Bolt High-Speed Rig',
    lenses: 'Canon K-35 Vintage Primes',
    colorGrade: 'Naturalistic Chiaroscuro Profile',
    awards: ['Tribeca X Official Selection 2026'],
    aspectRatio: 'wide',
  },
  {
    id: '6',
    slug: 'solstice-chronicles',
    title: 'Solstice · The Electric Odyssey',
    category: 'Commercial',
    client: 'SOLSTICE EV AUTOMOTIVE',
    year: '2025',
    mediaUrl: '/images/bg-luxury.jpg',
    coverImage: '/images/bg-luxury.jpg',
    description: 'High-speed precision tracking shots across salt flats at dawn, showcasing aerodynamic engineering with custom FPV cinema drone cinematography.',
    videoUrl: '/videos/reel_3.mp4',
    director: 'Marcus Vance',
    dop: 'Jean-Luc Moreau',
    camera: 'RED V-Raptor 8K + Freefly Wave',
    lenses: 'Angenieux Optimo Ultra Compact Zooms',
    colorGrade: 'Hyper-Clean Metallic Grade',
    awards: ['Motor Film Festival Best Commercial'],
    aspectRatio: 'square',
  },
];

export default function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioProject[]>(FALLBACK_PORTFOLIO);
  const [activeFilter, setActiveFilter] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All', 'Fashion Film', 'Music Video', 'Commercial', 'Brand Campaign', 'Art & Theatre']);
  const [isLoading, setIsLoading] = useState(true);
  const [viewLayout, setViewLayout] = useState<'masonry' | 'grid'>('masonry');
  
  // Cinematic Viewer State
  const [selectedProject, setSelectedProject] = useState<ProjectSpec | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
        const res = await fetch(`${apiUrl}/cms/portfolio`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && json.data.length > 0) {
            const mapped = json.data.map((item: any, i: number) => ({
              ...item,
              coverImage: item.coverImage || item.mediaUrl || FALLBACK_PORTFOLIO[i % FALLBACK_PORTFOLIO.length].mediaUrl,
              aspectRatio: i % 3 === 0 ? 'tall' : i % 3 === 1 ? 'wide' : 'square',
              camera: item.camera || FALLBACK_PORTFOLIO[i % FALLBACK_PORTFOLIO.length].camera,
              lenses: item.lenses || FALLBACK_PORTFOLIO[i % FALLBACK_PORTFOLIO.length].lenses,
              colorGrade: item.colorGrade || FALLBACK_PORTFOLIO[i % FALLBACK_PORTFOLIO.length].colorGrade,
              awards: item.awards || FALLBACK_PORTFOLIO[i % FALLBACK_PORTFOLIO.length].awards,
            }));
            setPortfolioItems(mapped);
            const cats = Array.from(new Set(mapped.map((i: any) => i.category))) as string[];
            setCategories(['All', ...cats]);
          }
        }
      } catch (err) {
        toast.error('Using offline master archive');
      } finally {
        setIsLoading(false);
      }
    }
    fetchPortfolio();
  }, []);

  const filtered = activeFilter === 'All' 
    ? portfolioItems 
    : portfolioItems.filter(i => i.category === activeFilter);

  const handleOpenViewer = (project: PortfolioProject) => {
    setSelectedProject({
      title: project.title,
      category: project.category,
      client: project.client,
      year: project.year,
      description: project.description,
      videoUrl: project.videoUrl || '/videos/project_1.mp4',
      coverImage: project.mediaUrl,
      director: project.director || 'Kabir Nair',
      dop: project.dop || 'Aarav Mehta',
      camera: project.camera || 'ARRI ALEXA 35',
      lenses: project.lenses || 'Cooke Anamorphic /i',
      colorGrade: project.colorGrade || 'Dolby Vision HDR Grade',
      awards: project.awards || ['Awwwards Nominee', 'Staff Pick'],
    });
    setIsViewerOpen(true);
  };

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-background text-foreground pt-24 pb-32 relative overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[180px] pointer-events-none" />
        <div className="absolute top-2/3 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[200px] pointer-events-none" />

        {/* Header Section */}
        <section className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden mb-20 text-center">
          <Image 
            src="/images/portfolio-hero.jpg" 
            alt="Portfolio Showcase" 
            fill 
            className="object-cover" 
            priority sizes="100vw" />
          <div className="absolute inset-0 dark:bg-black/60 bg-black/40" />
          <div className="absolute bottom-0 left-0 right-0 h-32 dark:bg-gradient-to-t dark:from-background bg-gradient-to-t from-background to-transparent" />
          
          <Container className="relative z-10 w-full max-w-5xl mx-auto px-4">
            <Reveal direction="up">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-mono tracking-[0.25em] text-white uppercase font-bold mb-6 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-brand" />
                <span>Selected Works · Master Archive</span>
              </div>
              
              <h1 className="text-6xl sm:text-8xl font-display text-white tracking-editorial leading-[0.92] mb-8 font-light drop-shadow-lg">
                THE EDITORIAL <br />
                <span className="italic font-extralight text-white/80">SHOWCASE.</span>
              </h1>
              
              <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-light leading-relaxed mb-12 drop-shadow">
                Every frame is an engineering marvel. We fuse high-speed motion control, bespoke anamorphic optics, and editorial world-building to create campaigns that transcend advertising.
              </p>
            </Reveal>
          </Container>
        </section>

        <Container>
          <Reveal direction="up">
            <div className="max-w-5xl mb-20 mt-12">
              {/* Technical Studio Stat Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 px-8 rounded-3xl bg-muted/30 border border-border backdrop-blur-xl max-w-4xl">
                <div>
                  <span className="block font-mono text-[9px] tracking-widest text-muted-foreground/55 uppercase">Master Archive</span>
                  <span className="text-xl font-serif font-bold text-foreground">120+ Films</span>
                </div>
                <div>
                  <span className="block font-mono text-[9px] tracking-widest text-muted-foreground/55 uppercase">Global Trophies</span>
                  <span className="text-xl font-serif font-bold text-brand">24 Awwwards</span>
                </div>
                <div>
                  <span className="block font-mono text-[9px] tracking-widest text-muted-foreground/55 uppercase">Primary Capture</span>
                  <span className="text-xl font-serif font-bold text-foreground">ARRI / RED 8K</span>
                </div>
                <div>
                  <span className="block font-mono text-[9px] tracking-widest text-muted-foreground/55 uppercase">Color Standard</span>
                  <span className="text-xl font-serif font-bold text-foreground">Dolby Vision</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Filter & Layout Control Bar */}
          <Reveal direction="up" delay={0.15}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-14 pb-6 border-b border-border">
              <div className="flex flex-wrap items-center gap-2.5">
                {categories.map((filter) => {
                  const isActive = activeFilter === filter;
                  return (
                    <button 
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={cn(
                        "px-5 py-2.5 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all duration-300",
                        isActive 
                          ? "bg-brand text-primary-foreground shadow-glow" 
                          : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border"
                      )}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>

              {/* View Layout Switcher */}
              <div className="flex items-center gap-2 bg-muted/40 border border-border p-1.5 rounded-full self-end md:self-auto">
                <button
                  onClick={() => setViewLayout('masonry')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all",
                    viewLayout === 'masonry' ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Masonry</span>
                </button>
                <button
                  onClick={() => setViewLayout('grid')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all",
                    viewLayout === 'grid' ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
              </div>
            </div>
          </Reveal>

          {/* Portfolio Showcase Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeFilter}-${viewLayout}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {filtered.length === 0 ? (
                <div className="py-24 text-center rounded-4xl border border-border bg-muted/10">
                  <Film className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-serif text-foreground mb-2">No productions found in this category.</h3>
                  <p className="text-muted-foreground/60 font-light max-w-sm mx-auto text-xs">Select 'All' to browse our complete catalog of award-winning campaigns.</p>
                </div>
              ) : (
                <div className={cn(
                  viewLayout === 'masonry'
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8"
                    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                )}>
                  {filtered.map((item, idx) => {
                    // Masonry spans that perfectly fill 12 columns
                    const isMasonry = viewLayout === 'masonry';
                    // Pattern: Row 1 (8,4), Row 2 (4,4,4), Row 3 (4,8), Row 4 (4,4,4)
                    const isBig = isMasonry && (idx % 10 === 0 || idx % 10 === 6);
                    const colSpan = isMasonry 
                      ? (isBig ? 'lg:col-span-8 md:col-span-2' : 'lg:col-span-4 md:col-span-1')
                      : '';
                    const aspect = isMasonry 
                      ? (isBig ? 'aspect-[16/10] lg:aspect-[16/11]' : 'aspect-[3/4]')
                      : 'aspect-[4/5]';

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        className={cn(
                          "group relative flex flex-col justify-end overflow-hidden transition-all duration-500 cursor-pointer rounded-sm",
                          colSpan, aspect
                        )}
                      >
                        {/* Background Media */}
                        <div className="absolute inset-0 z-0 overflow-hidden bg-muted/10">
                          <Image 
                            src={item.mediaUrl} 
                            alt={item.title} 
                            fill
                            className="object-cover transition-transform duration-1200 ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100" sizes="100vw" />
                          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
                        </div>

                        {/* Top Metadata */}
                        <div className="absolute top-0 left-0 right-0 z-10 p-6 flex items-start justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <span className="text-brand font-mono text-[10px] font-bold uppercase tracking-widest">
                            {item.category}
                          </span>
                          <span className="text-white/60 font-mono text-[10px] tracking-wider">
                            {item.year}
                          </span>
                        </div>

                        {/* Center Play Button */}
                        <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleOpenViewer(item);
                            }}
                            className="h-16 w-16 rounded-full border border-white/20 text-white flex items-center justify-center backdrop-blur-md hover:bg-white hover:text-black transition-colors duration-300"
                          >
                            <Play className="w-5 h-5 ml-1" />
                          </button>
                        </div>

                        {/* Bottom Info */}
                        <div className="relative z-10 p-6 sm:p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          {item.camera && (
                            <div className="flex items-center gap-2 text-white/40 font-mono text-[9px] tracking-wider uppercase mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                              <Camera className="w-3.5 h-3.5 text-brand" />
                              <span className="truncate">{item.camera}</span>
                            </div>
                          )}

                          <h3 className="text-3xl sm:text-4xl font-display text-white leading-tight mb-2">
                            {item.title.split('·')[0]}
                          </h3>

                          {item.client && (
                            <p className="text-brand font-mono text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-150 mb-3">
                              {item.client}
                            </p>
                          )}

                          <p className="text-white/60 text-sm font-light line-clamp-2 leading-relaxed opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20 transition-all duration-500 delay-200">
                            {item.description}
                          </p>

                          <div className="mt-6 flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300">
                            <Link
                              href={`/portfolio/${item.slug}`}
                              className="flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase text-white/50 hover:text-white transition-colors"
                            >
                              <span>View Details</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </Container>
      </main>

      <CinematicViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        project={selectedProject}
      />
    </>
  );
}

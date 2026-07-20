'use client';

import { Navbar } from '@/components/ui/Navbar';

import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { Camera, Film, Smartphone, Music, Mic, Video, Smile, Aperture, Play, ArrowUpRight, Sparkles, CheckCircle2, Star, ShieldCheck, Eye, Compass, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { CinematicViewerModal, ProjectSpec } from '@/components/ui/CinematicViewerModal';
import { cn } from '@/lib/utils';
import { fetchAPI } from '@/lib/api-client';
import Image from 'next/image';

const talentTypes = [
  { id: '01', name: "High-Fashion & Runway", desc: "Global cover models and editorial muses for luxury lookbooks.", icon: <Camera className="w-5 h-5 text-brand" />, count: "18k+" },
  { id: '02', name: "A-List Actors & Drama", desc: "Trained performers for feature films and premium brand cinema.", icon: <Film className="w-5 h-5 text-brand" />, count: "7k+" },
  { id: '03', name: "Digital Influencers", desc: "High-engagement cultural tastemakers for viral campaigns.", icon: <Smartphone className="w-5 h-5 text-brand" />, count: "14k+" },
  { id: '04', name: "Movement & Dancers", desc: "Conceptual movement artists for music films and choreography.", icon: <Music className="w-5 h-5 text-brand" />, count: "6k+" },
];


export default function TalentPage() {
  const [featuredTalent, setFeaturedTalent] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  
  // Cinematic Showreel Viewer State
  const [selectedTalent, setSelectedTalent] = useState<ProjectSpec | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    fetchAPI('/talent', { cache: 'no-store' })
      .then(res => {
        if (res && res.data && Array.isArray(res.data)) {
          const raw = res.data.slice(0, 4); // Just take first 4 for featured
          if (raw.length > 0) {
            const mapped = raw.map((t: any, i: number) => ({
              id: t.slug || t.id,
              name: t.user ? `${t.user.firstName} ${t.user.lastName}` : 'Unknown Talent',
              type: t.talentTypes && t.talentTypes.length > 0 ? t.talentTypes[0].replace('_', ' ') : 'General Talent',
              followers: t.profileViews ? `${t.profileViews}k+` : '0+',
              location: t.city || 'Unknown Location',
              img: (t.user && t.user.avatarUrl) ? t.user.avatarUrl : (t.coverBannerUrl || '/assets/placeholder.jpg'),
              videoUrl: t.introductionVideoUrl || '',
              client: t.brandsWorkedWith ? t.brandsWorkedWith.join(' · ') : '',
              description: t.bio || '',
              awards: t.awards || [],
            }));
            setFeaturedTalent(mapped);
          }
        }
      })
      .catch(err => {
        console.error("Failed to load featured talent:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePreviewShowreel = (talent: any) => {
    setSelectedTalent({
      title: `${talent.name} · Official Showreel`,
      category: talent.type,
      client: talent.client || 'MP PRODUCTION EXCLUSIVE ROSTER',
      year: '2026 ACTIVE ROSTER',
      description: talent.description,
      videoUrl: talent.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      coverImage: talent.img,
      director: 'Talent Showreel Archive',
      dop: `${talent.location || 'Global Roster'} · ${talent.followers || 'Verified'} Audience`,
      camera: 'Cinematic Studio Capture',
      lenses: 'Anamorphic Profile',
      colorGrade: 'Dolby Vision HDR',
      awards: talent.awards || ['Verified MP Roster', 'Top Tier Talent'],
    });
    setIsViewerOpen(true);
  };

  const categories = ['All', 'High-Fashion Model', 'Contemporary Dance', 'Feature Film Actor', 'Director & Photographer'];

  const filteredTalent = activeCategory === 'All'
    ? featuredTalent
    : featuredTalent.filter(t => t.type.toLowerCase().includes(activeCategory.toLowerCase()) || activeCategory.toLowerCase().includes(t.type.toLowerCase()));

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-background text-foreground pt-24 pb-32 relative overflow-hidden">
        {/* Subtle Luxury Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-[80vh] bg-linear-to-b from-brand/5 via-brand/1 to-transparent blur-[140px] pointer-events-none z-0" />
        
        {/* Hero Section */}
        <section className="relative w-full min-h-[75vh] py-24 flex items-center justify-center overflow-hidden mb-16 text-center">
          <Image 
            src="/images/projects-outdoor.jpg" 
            alt="Talent Roster" 
            fill 
            className="object-cover" 
            priority sizes="100vw" />
          <div className="absolute inset-0 dark:bg-black/60 bg-black/50" />
          <div className="absolute bottom-0 left-0 right-0 h-32 dark:bg-gradient-to-t dark:from-background bg-gradient-to-t from-background to-transparent pointer-events-none z-5" />
          
          <Container className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8">
            <Reveal direction="up">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-mono tracking-[0.25em] text-white uppercase font-bold mb-6 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-brand" />
                <span>Global Roster · Selected Talents Only</span>
              </div>

              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display text-white tracking-editorial leading-[0.95] mb-6 font-light drop-shadow-lg">
                THE ICONIC <br />
                <span className="italic font-extralight text-white/90">REPRESENTATION.</span>
              </h1>

              <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto mb-10 font-light leading-relaxed drop-shadow">
                We represent a highly vetted ecosystem of cover models, actors, choreographers, and visual directors who transcend normal standards to define the cultural vanguard.
              </p>

              {/* Editorial Grid Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center z-20 relative">
                <Link
                  href="/talent/directory"
                  data-cursor="hover"
                  data-cursor-label="ENTER"
                  className="w-full sm:w-auto px-9 py-3.5 rounded-full bg-brand hover:bg-white hover:text-black text-white font-mono font-bold text-xs uppercase tracking-[0.25em] transition-all duration-300 shadow-glow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Explore Directory</span>
                  <Compass className="w-4 h-4" />
                </Link>

                <Link
                  href="/join/talent"
                  data-cursor="hover"
                  data-cursor-label="APPLY"
                  className="w-full sm:w-auto px-9 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 font-mono font-bold text-xs uppercase tracking-[0.25em] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Apply for Roster</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* Dynamic Editorial Roster Grid */}
        <section className="py-24 relative z-10">
          <Container>
            {/* Filter Hub */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 pb-8 border-b border-border">
              <div className="flex flex-wrap items-center gap-3">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "px-6 py-2.5 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all duration-300",
                        isActive
                          ? "bg-brand text-primary-foreground shadow-glow"
                          : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border"
                      )}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              <div className="text-right font-mono text-xs text-muted-foreground/50 tracking-wider">
                ROSTER QUANTITY: <span className="text-foreground font-bold">{filteredTalent.length}</span>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="border border-border rounded-4xl overflow-hidden aspect-3/4 bg-muted/20 animate-pulse" />
                ))}
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredTalent.map((talent, idx) => {
                    const isFeatured = idx % 3 === 0;
                    const colSpan = isFeatured ? "lg:col-span-8 md:col-span-2" : "lg:col-span-4 md:col-span-1";
                    const aspect = isFeatured ? "aspect-[16/10] lg:aspect-[16/11]" : "aspect-3/4";

                    return (
                      <motion.div
                        key={talent.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className={cn(
                          "group relative rounded-[2.5rem] overflow-hidden border border-border bg-card shadow-2xl flex flex-col justify-between transition-all duration-500 hover:border-brand/40 hover:shadow-[0_0_35px_rgba(235,61,38,0.15)]",
                          colSpan, aspect
                        )}
                      >
                        {/* Portrait Background */}
                        <div className="absolute inset-0 z-0 overflow-hidden">
                          <img
                            src={talent.img}
                            alt={talent.name}
                            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 opacity-70 group-hover:opacity-90"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent opacity-95 group-hover:opacity-85 transition-opacity" />
                        </div>

                        {/* Top Metadata Strip */}
                        <div className="relative z-10 p-8 flex items-start justify-between">
                          <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-brand font-mono text-[9px] font-bold uppercase tracking-widest">
                            {talent.type}
                          </span>
                          <span className="px-3.5 py-1.5 rounded-full bg-white/8 backdrop-blur-md text-white/80 font-mono text-[9px] tracking-wider">
                            {talent.followers}
                          </span>
                        </div>

                        {/* Hover Play Button */}
                        <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handlePreviewShowreel(talent);
                            }}
                            className="pointer-events-auto h-20 w-20 rounded-full bg-brand/90 backdrop-blur-xl border border-white/30 text-white flex items-center justify-center shadow-[0_0_40px_rgba(235,61,38,0.5)] transform scale-75 group-hover:scale-100 transition-all duration-500 hover:bg-brand"
                          >
                            <Play className="w-8 h-8 fill-white ml-1" />
                          </button>
                        </div>

                        {/* Bottom Information */}
                        <div className="relative z-10 p-8 mt-auto bg-linear-to-t from-black via-black/85 to-transparent pt-12">
                          <div className="flex items-end justify-between gap-4 mb-2">
                            <div>
                              <h3 className="text-2xl font-serif text-white group-hover:text-brand transition-colors leading-tight">
                                {talent.name.split('·')[0]}
                              </h3>
                              <p className="text-white/40 font-mono text-[10px] uppercase tracking-wider mt-1">
                                {talent.location}
                              </p>
                            </div>
                            <span className="hidden sm:inline-block text-[10px] font-mono text-white/50 tracking-widest border-b border-white/20 pb-0.5">
                              {talent.client?.split('·')[0]}
                            </span>
                          </div>

                          <p className="text-white/60 text-xs font-light line-clamp-2 leading-relaxed opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20 transition-all duration-500 pt-2">
                            {talent.description}
                          </p>

                          <div className="pt-4 flex items-center gap-3 border-t border-white/10 mt-4">
                            <button
                               onClick={() => handlePreviewShowreel(talent)}
                              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-brand text-white font-mono text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/10"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Showreel</span>
                            </button>
                            <Link
                              href={`/talent/${talent.id}`}
                              className="px-5 py-2.5 rounded-xl bg-white text-black font-mono text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1"
                            >
                              <span>Book</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </Container>
        </section>

        {/* Divisions / Categories Overview */}
        <section className="py-24 bg-muted/10 border-y border-border relative z-10">
          <Container>
            <Reveal direction="up">
              <div className="text-center max-w-2xl mx-auto mb-20">
                <span className="text-brand font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-3">● Division Architecture</span>
                <h2 className="text-4xl sm:text-5xl font-serif text-foreground mb-6">Taxonomy Divisions</h2>
                <p className="text-muted-foreground font-light text-sm sm:text-base leading-relaxed">
                  We align talents across four core operational divisions to guarantee absolute alignment for fashion lookbooks and commercial cinema.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {talentTypes.map((type, idx) => (
                <Reveal key={type.id} direction="up" delay={idx * 0.05}>
                  <Link href={`/talent/directory?type=${type.name.split(' ')[0]}`} className="block h-full">
                    <div className="group h-full p-8 rounded-3xl bg-card border border-border hover:border-brand hover:bg-muted/20 transition-all duration-300 flex flex-col justify-between shadow-xl">
                      <div className="flex items-center justify-between mb-8">
                        <span className="font-mono text-xs font-bold tracking-widest text-muted-foreground/40 group-hover:text-brand transition-colors">
                          / {type.id}
                        </span>
                        <div className="p-3 rounded-2xl bg-muted/30 border border-border group-hover:border-brand/40 transition-colors">
                          {type.icon}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-serif text-foreground mb-3 group-hover:text-brand transition-colors">
                          {type.name}
                        </h3>
                        <p className="text-muted-foreground font-light text-xs leading-relaxed mb-6">
                          {type.desc}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-mono tracking-wider">
                        <span className="text-brand font-bold">{type.count}</span>
                        <span className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all flex items-center gap-1">
                          Explore <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        {/* Talent Protections & Standard */}
        <section className="py-28 relative z-10">
          <Container>
            <Reveal direction="up">
              <div className="text-center max-w-3xl mx-auto mb-20">
                <span className="text-brand font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-3">● Vetting Protections</span>
                <h2 className="text-4xl sm:text-5xl font-serif text-foreground mb-6">Why Creative Icons Choose MP.</h2>
                <p className="text-muted-foreground font-light text-sm sm:text-base leading-relaxed">
                  We eliminate agency friction by implementing standard representation contracts and secure transaction escrows.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'Verified Global Agency Access', desc: 'Direct mapping to leading visual producers, modeling coordinators, and global luxury ateliers.' },
                { title: 'Secure Escrow Architecture', desc: 'Standardized rate agreements with secure 48-hour escrow protection on all authorized campaigns.' },
                { title: 'Custom 4K Lookbook kits', desc: 'We build immersive media portfolios for top-tier talents, complete with real-time casting metrics.' }
              ].map((b, idx) => (
                <Reveal key={idx} direction="up" delay={idx * 0.08}>
                  <div className="p-10 rounded-3xl bg-card border border-border hover:border-brand/40 transition-all duration-300 shadow-2xl flex flex-col justify-between h-full">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-6">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-serif text-foreground mb-4">{b.title}</h3>
                      <p className="text-muted-foreground font-light text-xs leading-relaxed">{b.desc}</p>
                    </div>
                    <div className="mt-8 pt-4 border-t border-border flex items-center gap-2 text-[10px] font-mono text-brand tracking-widest uppercase font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Studio Certified</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      </main>

      <CinematicViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        project={selectedTalent}
      />
    </>
  );
}

"use client";

import { Navbar } from "@/components/ui/Navbar";
import { HoverFooter as Footer } from "@/components/ui/hover-footer";
import { Reveal } from "@/components/ui/Reveal";
import { CinematicProductScrollSection } from "@/components/ui/cinematic-product-scroll-section";
import { CinematicViewerModal, ProjectSpec } from "@/components/ui/CinematicViewerModal";
import { CinematicTestimonial } from "@/components/ui/cinematic-testimonial";
import { MagneticButton } from "@/components/motion/MagneticButton";
import DecryptedText from "@/components/motion/DecryptedText";
import Link from "next/link";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { fetchAPI } from "@/lib/api-client";
import { toast } from "sonner";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Play,
  Camera,
  Video,
  Sparkles,
  Film,
  Users,
  Megaphone,
  Star,
  Quote,
  Award,
  Zap,
  CheckCircle2,
  Sliders,
  Globe,
  Compass,
  ArrowUpRight,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Check
} from "lucide-react";
import Image from "next/image";

/* ═══════════════════════════════════════════════════════════
   Counter Hook
   ═══════════════════════════════════════════════════════════ */
function useCountUp(target: number, duration = 1600) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (t: number) => {
              const p = Math.min((t - start) / duration, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              setValue(Math.round(eased * target));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [target, duration]);
  return { ref, value };
}

function Counter({ n, suffix = "" }: { n: number; suffix?: string }) {
  const { ref, value } = useCountUp(n);
  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   Icons Helper
   ═══════════════════════════════════════════════════════════ */
const ICON_MAP: Record<string, any> = {
  Video,
  Camera,
  Film,
  Sparkles,
  Megaphone,
  Users,
  Sliders,
};

function getServiceIcon(iconName?: string) {
  if (!iconName) return Sparkles;
  return ICON_MAP[iconName] || Sparkles;
}

/* ═══════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════ */
export default function Home() {
  const [hero, setHero] = useState<any>(null);
  const [intro, setIntro] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [talent, setTalent] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalProject, setActiveModalProject] = useState<ProjectSpec | null>(null);
  const [currentReelIndex, setCurrentReelIndex] = useState(1);

  useEffect(() => {
    Promise.all([
      fetchAPI("/cms/hero?page=home").catch(() => null),
      fetchAPI("/cms/config/intro").catch(() => null),
      fetchAPI("/cms/stats").catch(() => null),
      fetchAPI("/cms/services?active=true").catch(() => null),
      fetchAPI("/cms/portfolio?featured=true&limit=6").catch(() => null),
      fetchAPI("/talent?featured=true&limit=6").catch(() => null),
      fetchAPI("/cms/testimonials?published=true").catch(() => null),
      fetchAPI("/cms/faq?limit=8").catch(() => null),
    ])
      .then(([heroRes, introRes, statsRes, servRes, portRes, talentRes, testRes, faqRes]) => {
        if (heroRes?.data) setHero(heroRes.data);
        if (introRes?.data) setIntro(introRes.data);
        if (statsRes?.data) setStats(statsRes.data);
        if (servRes?.data) setServices(servRes.data);
        if (portRes?.data) setPortfolio(portRes.data);
        if (talentRes?.data) setTalent(talentRes.data);
        if (testRes?.data) setTestimonials(testRes.data);
        if (faqRes?.data) setFaqs(faqRes.data);
      })
      .catch(() => {
        toast.error("Failed to load page content");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-background min-h-screen text-foreground overflow-x-clip">
      <Navbar />
      <Hero 
        hero={hero} 
        onOpenModal={setActiveModalProject} 
      />
      <ScrollyTelling />
      <CinematicProductScrollSection items={portfolio} />
      <Intro intro={intro} />
      <Services services={services} loading={loading} />
      <FeaturedProjects portfolio={portfolio} loading={loading} onOpenModal={setActiveModalProject} />
      <FeaturedTalent talent={talent} loading={loading} />
      <Stats stats={stats} />
      <Process />
      <CinematicTestimonial />
      <Faq faqs={faqs} loading={loading} />
      <ContactCta />

      {/* Theatrical Production Reel & Spec Sheet Lightbox Modal */}
      <CinematicViewerModal
        isOpen={!!activeModalProject}
        onClose={() => setActiveModalProject(null)}
        project={activeModalProject}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO — Cinematic split layout
   ═══════════════════════════════════════════════════════════ */
function Hero({ hero, onOpenModal }: { hero?: any; onOpenModal?: (project: ProjectSpec) => void }) {
  const bgRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          y: "20%",
          ease: "none",
          scrollTrigger: {
            trigger: bgRef.current.parentElement,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    });
    return () => ctx.revert();
  }, []);

  const headingText = hero?.heading || "Stories built\nframe by frame.";
  const subheadingText =
    hero?.subheading ||
    "MP Production is a full-service creative house — high-fashion campaigns, cinematic commercials, and exclusive talent representation.";
  const ctaText = hero?.ctaText || "Explore Portfolio";
  const ctaUrl = hero?.ctaUrl || "/portfolio";

  const headingWords = headingText.split(/(\s+)/);

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden isolate pb-0 px-4 sm:px-6 lg:px-8">
      {/* Background layer */}
      <div className="absolute inset-x-4 sm:inset-x-6 lg:inset-x-8 top-4 bottom-4 -z-10 bg-[#060608] overflow-hidden select-none rounded-[2rem] sm:rounded-[3rem] border border-[var(--cinematic-border)]/50">
        <div ref={bgRef} className="absolute inset-0 h-[120%] w-full -top-[10%]">
          <video
            className="absolute inset-0 h-full w-full object-cover object-center"
            autoPlay={true}
            muted={true}
            loop={true}
            playsInline={true}
            poster="/images/about-hero.jpg"
            preload="auto"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 dark:bg-black/65 bg-black/45 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none dark:bg-gradient-to-t dark:from-black bg-gradient-to-t from-white to-transparent" />
        <div className="absolute inset-0 bg-[var(--hero-gradient-left)] pointer-events-none" />
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl w-full px-6 sm:px-10 pb-20 pt-40 md:pt-48 z-10">
        {/* Eyebrow */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-3 mb-8"
        >
          <span className="h-[1px] w-12 bg-brand" />
          <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-[var(--hero-text-muted)]">
            Production House · Est. 2018
          </span>
        </motion.div>

        {/* Heading */}
        <div className="max-w-4xl">
          <h1 className="font-display text-5xl sm:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] text-[var(--hero-text)] leading-[0.95] tracking-tight">
            {headingWords.map((word: string, i: number) => {
              if (word.match(/\s+/)) {
                if (word.includes("\n")) return <br key={i} />;
                return <span key={i}> </span>;
              }
              return (
                <motion.span
                  key={i}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.15 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block origin-bottom"
                >
                  {word}
                </motion.span>
              );
            })}
          </h1>
        </div>

        {/* Subheading */}
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 max-w-xl text-base sm:text-lg text-[var(--hero-text-muted)] leading-relaxed font-light"
        >
          {subheadingText}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <MagneticButton strength={20}>
            <Link
              href={ctaUrl}
              className="group inline-flex items-center gap-3 rounded-full bg-brand hover:bg-[var(--hero-text)] hover:text-black px-8 py-4 text-sm font-semibold tracking-wide text-[var(--primary-foreground)] transition-all duration-300"
            >
              <span>{ctaText}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </MagneticButton>

          <MagneticButton strength={20}>
            <Link
              href="/reel"
              className="group bg-[var(--hero-bg-elevated)]/40 hover:bg-[var(--hero-bg-elevated)]/85 text-[var(--hero-text)] inline-flex items-center gap-3 rounded-full border border-[var(--hero-border)] px-8 py-4 text-sm font-medium tracking-wide transition-all cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-[var(--hero-text)] text-[var(--hero-text)]" />
              <span>Play Reel</span>
            </Link>
          </MagneticButton>

          <MagneticButton strength={20}>
            <Link
              href="/join/talent"
              className="group bg-[var(--hero-bg-elevated)]/40 hover:bg-[var(--hero-bg-elevated)]/85 text-[var(--hero-text)] inline-flex items-center gap-3 rounded-full border border-[var(--hero-border)] px-8 py-4 text-sm font-medium tracking-wide transition-all cursor-pointer"
            >
              <span>Register as Talent</span>
            </Link>
          </MagneticButton>
        </motion.div>

        {/* ── Counter strip ── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 pt-8 border-t border-[var(--hero-border)] flex flex-wrap items-center gap-x-12 gap-y-6"
        >
          {[
            { n: 500, s: "+", label: "Productions" },
            { n: 1200, s: "+", label: "Talent Roster" },
            { n: 40, s: "+", label: "Brand Partners" },
            { n: 18, s: "M+", label: "Impressions" },
          ].map(({ n, s, label }) => (
            <div key={label} className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-display font-semibold text-[var(--hero-text)] drop-shadow-sm">
                <Counter n={n} suffix={s} />
              </span>
              <span className="text-[11px] text-[var(--hero-text)]/80 font-medium tracking-wider uppercase drop-shadow-sm">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCROLLYTELLING — Keep with minor refinements
   ═══════════════════════════════════════════════════════════ */
function ScrollyTelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const text1Opacity = useTransform(scrollYProgress, [0, 0.2, 0.35], [0, 1, 0]);
  const text1Y = useTransform(scrollYProgress, [0, 0.2, 0.35], [40, 0, -40]);
  const text2Opacity = useTransform(scrollYProgress, [0.33, 0.5, 0.68], [0, 1, 0]);
  const text2Y = useTransform(scrollYProgress, [0.33, 0.5, 0.68], [40, 0, -40]);
  const text3Opacity = useTransform(scrollYProgress, [0.66, 0.83, 1], [0, 1, 0]);
  const text3Y = useTransform(scrollYProgress, [0.66, 0.83, 1], [40, 0, -40]);
  const img1Opacity = useTransform(scrollYProgress, [0, 0.3, 0.4], [1, 1, 0]);
  const img2Opacity = useTransform(scrollYProgress, [0.3, 0.4, 0.63, 0.73], [0, 1, 1, 0]);
  const img3Opacity = useTransform(scrollYProgress, [0.63, 0.73, 1], [0, 1, 1]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);

  const acts = [
    { opacity: text1Opacity, y: text1Y, label: "Act I · The Vision", heading: "Every detail matters.", body: "We look beyond the surface, finding the exact optical composition and emotional resonance that moves the needle for luxury brands." },
    { opacity: text2Opacity, y: text2Y, label: "Act II · The Craft", heading: "Crafted with intent.", body: "Lighting, framing, and pacing — synchronized on set and in post-production to deliver theatrical quality across every screen." },
    { opacity: text3Opacity, y: text3Y, label: "Act III · The Legacy", heading: "Built to last.", body: "Films, campaigns, and lookbooks that echo in the culture long after launch. Your story, immortalized in high definition." },
  ];

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-background">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="relative h-full w-full max-w-[1600px] overflow-hidden bg-black rounded-[2rem] sm:rounded-[3rem] border border-[var(--cinematic-border)]/50">

          <motion.img style={{ scale: imageScale, opacity: img1Opacity }} src="/images/services-lighting.jpg" alt="Visual setup 1" className="absolute inset-0 h-full w-full object-cover object-center" />
          <motion.img style={{ scale: imageScale, opacity: img2Opacity }} src="/images/about-bts.jpg" alt="Visual setup 2" className="absolute inset-0 h-full w-full object-cover object-center" />
          <motion.img style={{ scale: imageScale, opacity: img3Opacity }} src="/images/careers-meeting.jpg" alt="Visual setup 3" className="absolute inset-0 h-full w-full object-cover object-[center_20%]" />

          <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
            {acts.map((act, i) => (
              <motion.div
                key={i}
                style={{ opacity: act.opacity, y: act.y }}
                className="absolute text-center max-w-xl"
              >
                <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-brand mb-4 drop-shadow-xl">
                  {act.label}
                </span>
                <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white drop-shadow-xl leading-tight">
                  {act.heading}
                </h2>
                <p className="mt-5 text-base sm:text-lg text-white/90 font-medium leading-relaxed max-w-md mx-auto drop-shadow-lg">
                  {act.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTRO — Editorial split layout
   ═══════════════════════════════════════════════════════════ */
function Intro({ intro }: { intro?: any }) {
  const defaultHeading = "We represent the new epoch of";
  const defaultItalic = "aesthetic storytelling.";
  const defaultBody = "Bridging the gap between award-winning directors and verified international modeling talent. We assemble crews, lock locations, shoot RAW, and color-grade to theatrical standards.";
  const defaultLocations = ["London", "Mumbai", "Dubai"];

  const heading = intro?.heading || defaultHeading;
  const italic = intro?.italicText || defaultItalic;
  const body = intro?.body || defaultBody;
  const locations = intro?.locations || defaultLocations;
  const extraContent = intro?.extraContent; // New optional field for extra spacing/content

  return (
    <section className="mx-auto max-w-7xl px-6 sm:px-10 py-16 lg:py-24">
      <Reveal direction="up">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left — Pull quote */}
          <div>
            <span className="h-[1px] w-16 bg-brand block mb-8" />
            <h2 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] text-foreground leading-[1.1] tracking-tight">
              {heading}{" "}
              <span className="italic text-muted-foreground">{italic}</span>
            </h2>
          </div>

          {/* Right — Body */}
          <div className="lg:pt-4">
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-light whitespace-pre-wrap">
              {body}
            </p>
            {extraContent && (
              <p className="mt-6 text-sm text-muted-foreground leading-relaxed font-light whitespace-pre-wrap">
                {extraContent}
              </p>
            )}
            <div className="mt-8 flex items-center flex-wrap gap-6 text-[11px] tracking-[0.2em] uppercase text-muted-foreground/50">
              {locations.map((loc: string, idx: number) => (
                <div key={idx} className="flex items-center gap-6">
                  <span>{loc}</span>
                  {idx < locations.length - 1 && (
                    <span className="h-1 w-1 rounded-full bg-foreground/20" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cinematic Visual Fill */}
        <div className="mt-20 lg:mt-32 relative w-full h-[300px] sm:h-[450px] lg:h-[600px] rounded-3xl overflow-hidden group">
          <div className="absolute inset-0 bg-black/20 z-10 group-hover:bg-transparent transition-colors duration-700" />
          <Image
            src={intro?.imageUrl || "/images/portfolio-equipment.jpg"}
            alt="Cinematic showcase"
            fill
            className="object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-[1.5s] ease-out" sizes="100vw" />
        </div>
      </Reveal>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SERVICES — Bento grid (asymmetric)
   ═══════════════════════════════════════════════════════════ */
function Services({ services = [], loading }: { services?: any[]; loading?: boolean }) {
  const displayServices =
    services.length > 0
      ? services
      : [
          { slug: "cinematic", title: "Commercial Cinema", desc: "Premium brand commercials and high-dynamic automotive storytelling.", icon: "Film", image: "/assets/service_pre_production.png" },
          { slug: "talent", title: "High-Fashion Lookbooks", desc: "Editorial and runway campaigns for luxury fashion ateliers.", icon: "Camera", image: "/assets/service_production.png" },
          { slug: "post", title: "Post & Color Grade", desc: "Dolby Vision color grading, offline editing, and bespoke sound design.", icon: "Sliders", image: "/assets/service_post_production.png" },
          { slug: "talent", title: "Casting & Roster", desc: "Direct access to over 1,200 verified models and dramatic actors.", icon: "Users", image: "/assets/service_casting.png" },
        ];

  return (
    <section className="pt-8 pb-16 lg:pb-24 bg-background">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        {/* Header */}
        <Reveal direction="up" className="max-w-xl mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[1px] w-12 bg-brand" />
            <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-brand">Capabilities</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display text-foreground leading-tight">
            <DecryptedText text="Our Creative" animateOn="view" speed={50} sequential={true} revealDirection="start" /><br />
            <DecryptedText text="Disciplines" animateOn="view" speed={50} sequential={true} revealDirection="start" />
          </h2>
        </Reveal>

        {/* Boxed Layout */}
        <div className="flex flex-col gap-6">
          {loading && services.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse h-40 rounded-2xl border border-border bg-card" />
            ))
          ) : (
            displayServices.map((item, i) => {
              const Icon = getServiceIcon(item.icon);
              // CMS Service model stores the image under `imageUrl`; the static
              // fallback list uses `image`. When neither is set, rotate through
              // distinct default assets by index so cards aren't all identical.
              const SERVICE_FALLBACK_IMAGES = [
                "/assets/service_pre_production.png",
                "/assets/service_production.png",
                "/assets/service_post_production.png",
                "/assets/service_casting.png",
              ];
              const imageSrc =
                item.image ||
                item.imageUrl ||
                SERVICE_FALLBACK_IMAGES[i % SERVICE_FALLBACK_IMAGES.length];
              return (
                <Reveal key={item.id || item.title || i} direction="up" delay={0.05 * i}>
                  <div className="group relative border border-border dark:border-white/10 rounded-[2rem] p-3 md:p-4 bg-surface shadow-sm transition-all duration-500 hover:border-foreground/30 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-white/5">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                      
                      {/* Left: Content */}
                      <div className="lg:col-span-7 flex flex-col justify-center p-6 md:p-8">
                        <div className="flex items-center gap-6 mb-6">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full border border-border bg-muted/50 text-brand opacity-80 group-hover:opacity-100 group-hover:border-brand/30 group-hover:bg-brand/10 transition-all duration-300 shrink-0">
                            <span className="font-mono text-sm tracking-widest">0{i + 1}</span>
                          </div>
                          <h3 className="font-display text-3xl sm:text-4xl text-foreground group-hover:text-brand transition-colors leading-tight h-[90px] sm:h-[100px] flex items-center">
                            <DecryptedText text={item.title} animateOn="hover" speed={40} sequential={true} revealDirection="start" useOriginalCharsOnly={true} />
                          </h3>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pl-[4.5rem]">
                          <p className="text-base text-muted-foreground font-light leading-relaxed max-w-sm group-hover:text-foreground/80 transition-colors">
                            {item.description || item.desc}
                          </p>
                          
                          <Link href={`/services${item.slug ? `#${item.slug}` : ''}`} className="shrink-0 flex items-center gap-3 text-[11px] font-medium tracking-widest uppercase text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer">
                            <span className="hidden sm:inline-block">Explore</span>
                            <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center group-hover:border-brand group-hover:bg-brand group-hover:text-primary-foreground transition-all duration-300">
                              <ArrowRight className="h-4 w-4 group-hover:-rotate-45 transition-transform duration-300" />
                            </div>
                          </Link>
                        </div>
                      </div>

                      {/* Right: Cinematic Image */}
                      <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full rounded-[1.5rem] overflow-hidden border border-border/50 group-hover:border-white/20 transition-colors duration-500">
                        <Image
                          src={imageSrc}
                          alt={item.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 40vw"
                          className="object-cover scale-105 group-hover:scale-100 transition-transform duration-[1.5s] ease-out brightness-[0.7] group-hover:brightness-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-500" />
                      </div>

                    </div>
                  </div>
                </Reveal>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FEATURED PROJECTS — Magazine masonry
   ═══════════════════════════════════════════════════════════ */
function FeaturedProjects({
  portfolio = [],
  loading,
  onOpenModal,
}: {
  portfolio?: any[];
  loading?: boolean;
  onOpenModal?: (project: ProjectSpec) => void;
}) {
  const displayProjects =
    portfolio.length > 0
      ? portfolio
      : [
          { img: "/assets/project-fashion.jpg", slug: "neon-city", title: "Neon Silk Campaign", category: "High Fashion", location: "Mumbai · London", client: "ATLAS Luxury", director: "Marcus Vance", camera: "ARRI Alexa 35" },
          { img: "/assets/project-music.jpg", slug: "midnight-run", title: "Midnight Anthem", category: "Music Cinema", location: "Delhi · Tokyo", client: "VOLT Records", director: "Elena Rostova", camera: "RED V-Raptor 8K" },
          { img: "/assets/project-commercial.jpg", slug: "vantage-point", title: "Curinel's Reserve", category: "Commercial Film", location: "Goa · Zurich", client: "Curinel Spirits", director: "Arav Khanna", camera: "ARRI Alexa Mini LF" },
          { img: "/assets/project-corporate.jpg", slug: "heritage-foundation", title: "Skyline Suits 2026", category: "Lookbook & Film", location: "Bangalore", client: "Skyline Couture", director: "Marcus Vance", camera: "Sony VENICE 2" },
        ];

  const buildModalSpec = (p: any, i: number): ProjectSpec => ({
    title: p.title,
    category: p.category,
    client: p.client || p.location || "Luxury Brand",
    year: "2026",
    description: p.description || `High-impact ${p.category?.toLowerCase()} production delivered across international locations.`,
    videoUrl: p.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    director: p.director || "Marcus Vance",
    dop: p.dop || "Elena Rostova",
    camera: p.camera || "ARRI Alexa 35 (Anamorphic)",
    lenses: p.lenses || "Cooke S7/i Full Frame Anamorphic",
    colorGrade: "Kodak 2383 Emulation / Dolby Vision HDR",
    awards: i === 0 ? ["Awwwards SOTD", "Vimeo Staff Pick"] : ["Vimeo Staff Pick"],
  });

  return (
    <section className="mx-auto max-w-7xl px-6 sm:px-10 py-32">
      {/* Header row */}
      <Reveal direction="up" className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-16">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="h-[1px] w-12 bg-brand" />
            <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-brand">Selected Work</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-tight">Featured Productions</h2>
        </div>
        <Link
          href="/portfolio"
          className="text-sm text-muted-foreground hover:text-[#eb3d26] transition-colors flex items-center gap-2"
        >
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Reveal>

      {loading && portfolio.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-12 h-[420px] rounded-2xl bg-white/[0.03] animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="md:col-span-4 h-[320px] rounded-2xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-12">
          {displayProjects.map((p, i) => {
            const handleClick = (e: React.MouseEvent) => {
              if (onOpenModal) {
                e.preventDefault();
                onOpenModal(buildModalSpec(p, i));
              }
            };

            // First item is full-width cinematic banner
            if (i === 0) {
              return (
                <Reveal key={p.id || p.title || i} direction="up" className="md:col-span-12">
                  <div
                    onClick={handleClick}
                    className="group relative overflow-hidden rounded-2xl cursor-pointer h-[420px] sm:h-[480px]"
                  >
                    <Image
                      src={p.coverImageUrl || p.mediaUrl || p.img || "/assets/project-fashion.jpg"}
                      alt={p.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 66vw"
                      className="object-cover object-[center_30%] transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

                    <div className="absolute bottom-0 left-0 p-8 sm:p-12 z-10 max-w-2xl">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#eb3d26]">{p.category}</span>
                        <span className="h-1 w-1 rounded-full bg-white/30" />
                        <span className="text-[11px] tracking-wider uppercase text-white/40">{p.client || p.location}</span>
                      </div>
                      <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white leading-tight group-hover:text-[#eb3d26] transition-colors">
                        {p.title}
                      </h3>
                      <p className="mt-4 text-sm text-white/40 group-hover:text-white/60 transition-colors">
                        View production details →
                      </p>
                    </div>

                    <div className="absolute right-8 top-8 h-12 w-12 grid place-items-center rounded-full bg-brand text-primary-foreground opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-100 scale-75">
                      <Play className="h-4 w-4 fill-primary-foreground text-primary-foreground ml-0.5" />
                    </div>
                  </div>
                </Reveal>
              );
            }

            // Remaining items in 3-col row
            return (
              <Reveal key={p.id || p.title || i} direction="up" delay={0.08 * i} className="md:col-span-4">
                <div
                  onClick={handleClick}
                  className="group relative overflow-hidden rounded-2xl cursor-pointer h-[320px] sm:h-[360px]"
                >
                  <Image
                    src={p.coverImageUrl || p.mediaUrl || p.img || "/assets/fashion_lookbook.png"}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                  <div className="absolute bottom-0 left-0 p-6 z-10">
                    <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#eb3d26] block mb-2">{p.category}</span>
                    <h3 className="font-display text-xl sm:text-2xl text-white leading-tight group-hover:text-[#eb3d26] transition-colors">
                      {p.title}
                    </h3>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FEATURED TALENT — Horizontal scroll strip
   ═══════════════════════════════════════════════════════════ */
function FeaturedTalent({ talent = [], loading }: { talent?: any[]; loading?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayTalent = (
    talent.length > 0
      ? talent
      : [
          { id: "1", slug: "aarya-k", user: { firstName: "Aarya", lastName: "K.", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop" }, talentTypes: ["INTERNATIONAL_MODEL"], instagramFollowers: 128000 },
          { id: "2", slug: "rohan-m", user: { firstName: "Rohan", lastName: "M.", avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop" }, talentTypes: ["CINEMA_DIRECTOR"], instagramFollowers: 540000 },
          { id: "3", slug: "isha-s", user: { firstName: "Isha", lastName: "S.", avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=600&auto=format&fit=crop" }, talentTypes: ["LEAD_ACTOR"], instagramFollowers: 72000 },
          { id: "4", slug: "devansh-p", user: { firstName: "Devansh", lastName: "P.", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop" }, talentTypes: ["DOP_CINEMATOGRAPHER"], instagramFollowers: 38000 },
          { id: "5", slug: "karan-j", user: { firstName: "Karan", lastName: "J.", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop" }, talentTypes: ["EXECUTIVE_PRODUCER"], instagramFollowers: 195000 },
        ]
  ).slice(0, 12); // Featured strip — cap to keep the homepage light; full roster on /talent

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const w = scrollRef.current.offsetWidth * 0.7;
      scrollRef.current.scrollBy({ left: dir === "left" ? -w : w, behavior: "smooth" });
    }
  };

  return (
    <section className="py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        {/* Header */}
        <Reveal direction="up" className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[1px] w-12 bg-brand" />
              <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-brand">Exclusive Roster</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-tight">Featured Talent</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => scroll("left")} className="h-10 w-10 rounded-full border border-border grid place-items-center text-muted-foreground hover:text-foreground hover:border-border transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scroll("right")} className="h-10 w-10 rounded-full border border-border grid place-items-center text-muted-foreground hover:text-foreground hover:border-border transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <Link href="/talent" className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-[#eb3d26] transition-colors ml-2">
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Horizontal scroll strip */}
      {loading && talent.length === 0 ? (
        <div className="flex gap-4 px-6 sm:px-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shrink-0 w-64 h-80 rounded-2xl bg-card animate-pulse" />
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide px-6 sm:px-10 pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {displayTalent.map((t: any, i: number) => (
            <Link
              key={t.id || t.slug || i}
              href={`/talent/${t.slug || t.id}`}
              className="group shrink-0 w-[240px] sm:w-[280px] snap-start flex flex-col items-center text-center"
            >
              <div className="relative h-48 w-48 sm:h-56 sm:w-56 rounded-full overflow-hidden mb-8 transition-transform duration-700 group-hover:scale-105">
                {/* Avatar placeholder / Image */}
                <div className="absolute inset-0 bg-card flex items-center justify-center">
                  {t.user?.avatarUrl ? (
                    <Image src={t.user.avatarUrl} alt={`${t.user.firstName ?? ''} ${t.user.lastName ?? ''}`.trim() || 'Talent'} fill className="object-cover" sizes="(max-width: 640px) 192px, 224px" />
                  ) : (
                    <div className="text-4xl font-display text-foreground/30 group-hover:text-[#eb3d26] transition-colors duration-500">
                      {t.user?.firstName?.[0] || "T"}
                      {t.user?.lastName?.[0] || "M"}
                    </div>
                  )}
                </div>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 z-10" />
              </div>

              {/* Info below avatar */}
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <CheckCircle2 className="h-3 w-3 text-brand" />
                  <span className="text-[10px] tracking-[0.2em] uppercase text-brand font-medium">Exclusive</span>
                </div>
                <h3 className="font-display text-2xl text-foreground group-hover:text-brand transition-colors leading-tight mb-2">
                  {t.user?.firstName || "Talent"} {t.user?.lastName || ""}
                </h3>
                <p className="text-[11px] text-muted-foreground tracking-widest uppercase mb-4">
                  {t.talentTypes?.[0]?.replace(/_/g, " ") || "Artist"}
                </p>
                <div className="flex items-center gap-2 text-[11px] font-medium text-foreground/20 group-hover:text-muted-foreground transition-colors">
                  <span>{t.instagramFollowers ? `${(t.instagramFollowers / 1000).toFixed(0)}K Followers` : "Verified"}</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   STATS — Single inline counter bar (no cards)
   ═══════════════════════════════════════════════════════════ */
function Stats({ stats }: { stats?: any }) {
  const items = [
    { n: stats?.totalPortfolio || 500, s: "+", label: "Productions Delivered", icon: Film },
    { n: stats?.totalTalent || 1200, s: "+", label: "Roster Members", icon: Users },
    { n: stats?.totalServices || 40, s: "+", label: "Brand Partners", icon: Award },
    { n: 18, s: "M+", label: "Audience Impressions", icon: Zap },
  ];

  return (
    <section className="border-y border-border bg-white/[0.01]">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 py-20">
        <Reveal direction="up">
          <div className="flex flex-wrap justify-between items-center gap-y-10">
            {items.map(({ n, s, label, icon: Icon }, i) => (
              <div key={label} className="flex items-center gap-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Icon className="h-5 w-5 text-brand" />
                    <span className="font-display text-4xl sm:text-5xl font-semibold text-foreground">
                      <Counter n={n} suffix={s} />
                    </span>
                  </div>
                  <span className="text-[11px] tracking-[0.2em] uppercase text-foreground/25 block">{label}</span>
                </div>
                {i < items.length - 1 && (
                  <div className="hidden md:block h-12 w-[1px] bg-white/[0.08]" />
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROCESS — Vertical timeline stepper
   ═══════════════════════════════════════════════════════════ */
function Process({ process = [] }: { process?: any[] }) {
  const displayProcess =
    process.length > 0
      ? process
      : [
          { step: "01", title: "Discovery & Brief", desc: "We unpack the creative intent, study reference cinema, and establish clear commercial targets." },
          { step: "02", title: "Visual Treatment", desc: "Directorial vision, lighting mood boards, exclusive talent shortlists, and locations locked." },
          { step: "03", title: "Principle Photography", desc: "Top-tier film crews, ARRI/RED cinema camera packages, and master directors on set." },
          { step: "04", title: "Post-Production", desc: "Offline editing, theatrical color grading (Kodak/Dolby), custom sound design, and master delivery." },
        ];

  return (
    <section className="py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
          {/* Pinned header */}
          <div className="lg:col-span-4">
            <Reveal direction="up" className="lg:sticky lg:top-32">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-[1px] w-12 bg-brand" />
                <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-brand">Methodology</span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-tight">
                Production Process
              </h2>
              <p className="mt-6 text-sm text-foreground/35 font-light leading-relaxed">
                A rigorous four-phase pipeline that eliminates friction between
                creative ambition and technical execution.
              </p>
            </Reveal>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-8 lg:pl-10">
            <div className="space-y-16">
              {displayProcess.map((p, i) => (
                <Reveal key={p.step || i} direction="up" delay={0.05 * i}>
                  <div className="group flex flex-col md:flex-row md:items-start gap-6 md:gap-12 border border-border dark:border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 bg-surface shadow-sm transition-all duration-500 hover:border-foreground/30 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5 min-h-[280px] md:min-h-[220px]">
                    {/* Number */}
                    <div className="text-brand font-mono text-xl md:text-2xl tracking-widest pt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      {p.step || `0${i + 1}`}
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="font-display text-3xl md:text-4xl text-foreground group-hover:text-brand transition-colors leading-tight mb-4 h-[90px] md:h-[100px] flex items-center">
                        <DecryptedText text={p.title} animateOn="hover" speed={40} sequential={true} revealDirection="start" useOriginalCharsOnly={true} />
                      </h3>
                      <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed max-w-xl">
                        {p.desc || p.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



/* ═══════════════════════════════════════════════════════════
   FAQ — Clean accordion (no card wrapper)
   ═══════════════════════════════════════════════════════════ */
function Faq({ faqs = [], loading }: { faqs?: any[]; loading?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);

  const displayFaqs =
    faqs.length > 0
      ? faqs
      : [
          { q: "How fast can you turn around a high-tier commercial?", a: "Most short-form campaigns and brand films ship in 2–3 weeks from concept approval. Larger theatrical productions run 4–8 weeks depending on location scouts." },
          { q: "Do you handle talent casting and contracting in-house?", a: "Yes. We maintain an exclusive roster of over 1,200 verified international models, lead actors, and creators across India and Europe." },
          { q: "Can new talent apply directly to join the MP roster?", a: "Absolutely — visit `/join/talent`, submit your portfolio specs, and our casting directors review applications weekly." },
        ];

  return (
    <section className="py-32">
      <div className="mx-auto max-w-3xl px-6 sm:px-10">
        <Reveal direction="up" className="text-center mb-16">
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-tight">
            Frequently Asked Questions
          </h2>
        </Reveal>

        {loading && faqs.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : (
          <Reveal direction="up" delay={0.1}>
            <div className="space-y-4">
              {displayFaqs.map((f, i) => {
                const isOpen = open === i;
                return (
                  <div key={f.id || f.q || f.question} className="border border-border dark:border-white/10 rounded-2xl p-6 md:p-8 bg-surface shadow-sm transition-all duration-300 hover:border-foreground/30 hover:shadow-md dark:hover:shadow-white/5">
                    <button
                      className="group flex w-full items-center justify-between gap-6 text-left transition"
                      onClick={() => setOpen(isOpen ? null : i)}
                    >
                      <span className="font-display text-xl md:text-2xl text-foreground font-light group-hover:text-brand transition-colors">{f.q || f.question}</span>
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                          isOpen ? "border-brand bg-brand text-foreground rotate-0" : "border-border text-muted-foreground"
                        }`}
                      >
                        {isOpen ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      </span>
                    </button>
                    <div
                      className="grid overflow-hidden text-sm text-muted-foreground font-light transition-all duration-300"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    >
                      <div className="min-h-0">
                        <p className="pt-6 pb-2 leading-relaxed">{f.a || f.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   CONTACT CTA — Full-bleed gradient (no card border)
   ═══════════════════════════════════════════════════════════ */
function ContactCta() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
      <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] py-16 md:py-24 bg-gradient-to-br from-[var(--cinematic-bg)] via-[#0e0810] to-[var(--cinematic-bg)]">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand/10 blur-[160px]" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-brand/5 blur-[120px]" />

      <div className="relative mx-auto max-w-4xl px-6 sm:px-10 text-center">
        <Reveal direction="up">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-medium tracking-[0.2em] uppercase text-white/50 border border-white/[0.08] mb-8">
            <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-brand" />
            Now Booking Q4 2026 / Q1 2027
          </div>

          <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl text-white leading-[0.95] tracking-tight">
            Got a vision to build?
            <br />
            <span className="italic text-white/60 font-light">Let&apos;s roll cameras.</span>
          </h2>

          <p className="mt-8 max-w-2xl mx-auto text-base text-white/40 font-light leading-relaxed">
            Whether you are a luxury brand launching a flagship campaign or an
            international artist dropping a narrative video — we assemble the
            master crew, lock the locations, and deliver the frames.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton strength={20}>
              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 rounded-full bg-brand px-10 py-4 text-sm font-semibold tracking-wide text-[var(--primary-foreground)] hover:shadow-glow transition-all duration-300"
              >
                <span>Commission Studio</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </MagneticButton>

            <MagneticButton strength={20}>
              <Link
                href="/join/talent"
                className="inline-flex items-center gap-3 rounded-full border border-white/20 px-10 py-4 text-sm font-medium tracking-wide text-white hover:bg-white/[0.05] transition-all"
              >
                Apply as Talent
              </Link>
            </MagneticButton>
          </div>
        </Reveal>
      </div>
      </div>
    </section>
  );
}

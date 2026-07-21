"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "next-themes";
import FlowingMenu from "@/components/motion/FlowingMenu";
import { fetchAPI } from "@/lib/api-client";

/* ─── Default nav items (structural fallback while CMS loads) ─── */
const DEFAULT_NAV_ITEMS = [
  { title: "Home", href: "/" },
  { title: "Showreels", href: "/reel" },
  { title: "Portfolio", href: "/portfolio" },
  { title: "Services", href: "/services" },
  { title: "Talent", href: "/talent" },
  { title: "About", href: "/about" },
  { title: "Blog", href: "/blog" },
  { title: "Contact", href: "/contact" },
];

/* Default image map for flowing menu — maps href to image */
const DEFAULT_MENU_IMAGES: Record<string, string> = {
  "/": "/assets/cinematic-16-9.png",
  "/reel": "/images/about-bts.jpg",
  "/portfolio": "/assets/project-fashion.jpg",
  "/services": "/assets/service_pre_production.png",
  "/talent": "/assets/service_casting.png",
  "/about": "/assets/project-corporate.jpg",
  "/blog": "/assets/project-music.jpg",
  "/contact": "/assets/project-commercial.jpg",
};

/* ─── Navbar ─── */
export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [navItems, setNavItems] = useState(DEFAULT_NAV_ITEMS);
  
  const isForcedDark = false; // Deprecated, theme variables are now light-aware
  const useLightText = resolvedTheme === "dark";

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 80);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Fetch navigation config from CMS
  useEffect(() => {
    fetchAPI('/cms/config/navigation')
      .then((res) => {
        if (res?.success && res?.data) {
          const val = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
          // Support: { links: [{ label, href }] } or direct array [{ label, href }]
          const links = Array.isArray(val) ? val : (val.links && Array.isArray(val.links)) ? val.links : null;
          if (links && links.length > 0) {
            setNavItems(links.map((item: any) => ({
              title: item.title || item.label || item.text || '',
              href: item.href || item.url || item.link || '/',
            })));
          }
        }
      })
      .catch(() => {
        // Silently keep defaults — navbar should never break
      });
  }, []);

  // Build flowing menu data from current navItems
  const flowingMenuData = navItems.map((item) => ({
    link: item.href,
    text: item.title,
    image: DEFAULT_MENU_IMAGES[item.href] || "/assets/cinematic-16-9.png",
  }));

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "py-2 dark:bg-black/90 bg-white/90 backdrop-blur-md shadow-sm border-b border-border"
            : "py-4 bg-transparent border-b border-transparent"
        )}
      >
        <nav className="mx-auto max-w-7xl px-5 sm:px-8 flex items-center justify-between">
          {/* ── Logo ── */}
          <Link href="/" className="relative z-10 shrink-0" data-cursor="hover">
            <img
              src="/logo.png"
              className={cn(
                "w-auto object-contain transition-all duration-500",
                scrolled ? "h-10 md:h-11" : "h-12 md:h-14"
              )}
              alt="MP Production"
            />
          </Link>

          {/* ── Right Side ── */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className={cn(
                "inline-flex items-center text-xs font-bold tracking-widest uppercase transition-all px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-md",
                scrolled 
                  ? "text-foreground hover:text-brand bg-surface/80 border-border" 
                  : "text-white hover:text-brand bg-black/50 border-white/20 drop-shadow"
              )}
            >
              Sign In
            </Link>
            <Link
              href="/join/talent"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold tracking-wider uppercase rounded-full transition-all duration-300 bg-brand text-white hover:bg-brand/90 hover:shadow-[0_0_15px_rgba(235,61,38,0.4)] shadow-md shrink-0 border border-brand/30"
              data-cursor="hover"
            >
              Talent Register
            </Link>

            <ThemeToggle />

            {/* ── Mobile Toggle ── */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                "relative z-50 p-2.5 rounded-full transition-all backdrop-blur-md border shadow-sm",
                scrolled 
                  ? "text-foreground bg-surface/80 hover:bg-surface border-border" 
                  : "text-white bg-black/50 border-white/20 hover:bg-black/70 drop-shadow"
              )}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* ── Fullscreen Flowing Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 w-screen h-screen z-40 bg-[var(--cinematic-bg)] overflow-hidden flex flex-col justify-between"
          >
            <div className="pt-24 flex-1 w-screen flex flex-col pb-4">
              <FlowingMenu 
                items={flowingMenuData} 
                onItemClick={() => setMobileOpen(false)}
                bgColor="transparent"
                textColor="var(--cinematic-text)"
                marqueeBgColor="var(--brand)"
                marqueeTextColor="var(--primary-foreground)"
                borderColor="var(--cinematic-border)"
              />
            </div>

            {/* Mobile Footer Action Bar */}
            <div className="w-full px-6 pb-8 pt-3 sm:hidden flex items-center justify-center gap-3 border-t border-border/40 bg-background/90 backdrop-blur-xl z-50">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 py-2.5 text-center text-xs font-semibold tracking-wider uppercase rounded-lg border border-border text-foreground hover:bg-surface"
              >
                Sign In
              </Link>
              <Link
                href="/join/talent"
                onClick={() => setMobileOpen(false)}
                className="flex-1 py-2.5 text-center text-xs font-bold tracking-wider uppercase rounded-lg bg-brand text-white shadow-md hover:bg-brand/90"
              >
                Talent Register
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Card3D stub for backward compat ─── */
export const Card3D = ({ children, className }: { children?: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={className}>{children}</div>
);

export default Navbar;

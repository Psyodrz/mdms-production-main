"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "next-themes";
import FlowingMenu from "@/components/motion/FlowingMenu";
import { fetchAPI } from "@/lib/api-client";

/* ─── Default nav items (structural fallback while CMS loads) ─── */
const DEFAULT_NAV_ITEMS = [
  { title: "Home", href: "/" },
  { title: "Become a YouTuber", href: "/become-a-youtuber" },
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
  "/become-a-youtuber": "/images/services-lighting.jpg",
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
  const [studentUser, setStudentUser] = useState<{ name: string; email: string } | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = sessionStorage.getItem('mp_student_logged_in') === 'true';
      const name = sessionStorage.getItem('mp_student_name');
      const email = sessionStorage.getItem('mp_student_email');
      if (isLoggedIn && name) {
        setStudentUser({ name, email: email || '' });
      }
    }
  }, []);

  function handleSignOut() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('mp_student_logged_in');
      sessionStorage.removeItem('mp_student_name');
      sessionStorage.removeItem('mp_student_email');
      sessionStorage.removeItem('mp_student_phone');
      sessionStorage.removeItem('mp_sec_token');
    }
    setStudentUser(null);
    setUserDropdownOpen(false);
    toast.success('👋 Signed out successfully!');
  }
  
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
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/become-a-youtuber"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-extrabold tracking-wider uppercase rounded-full transition-all duration-300 bg-gradient-to-r from-amber-500 via-rose-500 to-brand text-white hover:opacity-95 shadow-md shrink-0 border border-amber-300/40"
              data-cursor="hover"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
              <span>Become a YouTuber</span>
            </Link>

            {studentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 text-emerald-500 text-xs font-bold shadow-sm hover:bg-emerald-500/25 transition-all cursor-pointer"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>👤 {studentUser.name}</span>
                  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6"/></svg>
                </button>

                {userDropdownOpen && (
                  <div 
                    onClick={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-48 rounded-2xl bg-card border border-border p-2 shadow-2xl z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <Link
                      href="/creator-lab"
                      className="flex items-center gap-2 p-2 rounded-xl text-foreground font-bold hover:bg-muted transition-colors"
                    >
                      <svg className="w-4 h-4 text-brand fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h10M6 10h10"/></svg>
                      <span>My Student Academy</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-500 font-bold hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-rose-500 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                      <span>Sign Out / Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className={cn(
                  "inline-flex items-center text-xs font-bold tracking-widest uppercase transition-all px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-md hidden sm:inline-flex",
                  scrolled 
                    ? "text-foreground hover:text-brand bg-surface/80 border-border" 
                    : "text-white hover:text-brand bg-black/50 border-white/20 drop-shadow"
                )}
              >
                Sign In
              </Link>
            )}

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

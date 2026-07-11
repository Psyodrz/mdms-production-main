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

/* ─── Nav items ─── */
const navItems = [
  { title: "Home", href: "/" },
  { title: "Showreels", href: "/reel" },
  { title: "Portfolio", href: "/portfolio" },
  { title: "Services", href: "/services" },
  { title: "Talent", href: "/talent" },
  { title: "About", href: "/about" },
  { title: "Blog", href: "/blog" },
  { title: "Contact", href: "/contact" },
];

const flowingMenuData = [
  { link: "/", text: "Home", image: "/assets/cinematic-16-9.png" },
  { link: "/reel", text: "Showreels", image: "/images/about-bts.jpg" },
  { link: "/portfolio", text: "Portfolio", image: "/assets/project-fashion.jpg" },
  { link: "/services", text: "Services", image: "/assets/service_pre_production.png" },
  { link: "/talent", text: "Talent", image: "/assets/service_casting.png" },
  { link: "/about", text: "About", image: "/assets/project-corporate.jpg" },
  { link: "/blog", text: "Blog", image: "/assets/project-music.jpg" },
  { link: "/contact", text: "Contact", image: "/assets/project-commercial.jpg" },
];

/* ─── Navbar ─── */
export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  
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
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center text-xs font-semibold tracking-widest uppercase transition-colors text-foreground/80 hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold tracking-wider uppercase rounded-full transition-all duration-300 bg-foreground/10 text-foreground hover:bg-foreground hover:text-background border border-border/50"
              data-cursor="hover"
            >
              Talent Sign In
            </Link>

            <ThemeToggle />

            {/* ── Mobile Toggle ── */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="relative z-50 p-2 text-foreground"
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
            className="fixed inset-0 z-40 bg-[var(--cinematic-bg)]"
          >
            <div className="pt-24 h-screen w-full flex flex-col pb-6">
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

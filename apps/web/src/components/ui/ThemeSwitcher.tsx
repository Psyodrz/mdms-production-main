'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

const THEMES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
] as const;

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!mounted) return null;

  if (compact) {
    return (
      <div ref={panelRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--brand)] transition-all duration-300"
          aria-label="Switch theme"
        >
          {theme === 'dark' ? (
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
               <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
             </svg>
          ) : (
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
               <circle cx="12" cy="12" r="5"></circle>
               <line x1="12" y1="1" x2="12" y2="3"></line>
               <line x1="12" y1="21" x2="12" y2="23"></line>
               <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
               <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
               <line x1="1" y1="12" x2="3" y2="12"></line>
               <line x1="21" y1="12" x2="23" y2="12"></line>
               <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
               <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
             </svg>
          )}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[var(--muted-foreground)]">
            <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="absolute right-0 top-full mt-2 z-50 min-w-[150px] p-2 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-lg backdrop-blur-xl"
            >
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    theme === t.id
                      ? 'bg-[var(--brand)] text-white'
                      : 'hover:bg-[var(--surface)] text-[var(--foreground)]'
                  }`}
                >
                  <span className="text-sm font-medium">{t.label}</span>
                  {theme === t.id && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto w-4 h-4"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path d="M4 8L7 11L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full variant
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
            theme === t.id
              ? 'border-[var(--brand)] shadow-glow'
              : 'border-[var(--border)] hover:border-[var(--muted-foreground)]'
          }`}
        >
          <span className="text-sm font-medium text-[var(--foreground)]">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

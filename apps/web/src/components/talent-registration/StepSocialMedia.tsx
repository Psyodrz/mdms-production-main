'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FloatingInput } from './FormInputs';

interface StepSocialMediaProps {
  data: {
    instagram: string;
    youtube: string;
    facebook: string;
    linkedin: string;
    imdb: string;
    website: string;
    portfolio: string;
    behance: string;
    pinterest: string;
    spotify: string;
    tiktok: string;
  };
  onChange: (data: Partial<StepSocialMediaProps['data']>) => void;
  errors: Record<string, string>;
}

const PLATFORMS = [
  { key: 'instagram', label: 'Instagram', prefix: 'instagram.com/', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>, color: 'hover:text-[#E1306C] hover:border-[#E1306C]' },
  { key: 'youtube', label: 'YouTube', prefix: 'youtube.com/@', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>, color: 'hover:text-[#FF0000] hover:border-[#FF0000]' },
  { key: 'tiktok', label: 'TikTok', prefix: 'tiktok.com/@', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>, color: 'hover:text-[#00F2FE] hover:border-[#00F2FE]' },
  { key: 'linkedin', label: 'LinkedIn', prefix: 'linkedin.com/in/', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>, color: 'hover:text-[#0A66C2] hover:border-[#0A66C2]' },
  { key: 'behance', label: 'Behance', prefix: 'behance.net/', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-6"/><path d="M18 14h-6"/><path d="M9 10H4v8h5"/><path d="M4 14h4"/></svg>, color: 'hover:text-[#1769FF] hover:border-[#1769FF]' },
  { key: 'imdb', label: 'IMDb', prefix: 'imdb.com/name/', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 8 7 16 11 8 15 16 19 8 21 8 17 16 21 16 21 8 3 8"/></svg>, color: 'hover:text-[#F5C518] hover:border-[#F5C518]' },
  { key: 'spotify', label: 'Spotify', prefix: 'spotify.com/artist/', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12c4 0 7 2 8 4"/><path d="M7 15c3 0 5 1.5 6 3"/><path d="M9 9c4.5 0 8.5 2.5 10 6"/></svg>, color: 'hover:text-[#1DB954] hover:border-[#1DB954]' },
  { key: 'pinterest', label: 'Pinterest', prefix: 'pinterest.com/', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5"/><path d="M12 19c0-4.5 5-5 5-10"/></svg>, color: 'hover:text-[#E60023] hover:border-[#E60023]' },
  { key: 'facebook', label: 'Facebook', prefix: 'facebook.com/', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>, color: 'hover:text-[#1877F2] hover:border-[#1877F2]' },
  { key: 'portfolio', label: 'Other Portfolio', prefix: 'https://', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>, color: 'hover:text-[var(--brand)] hover:border-[var(--brand)]' },
  { key: 'website', label: 'Personal Website', prefix: 'https://', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, color: 'hover:text-[var(--brand)] hover:border-[var(--brand)]' },
] as const;

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as any } },
};

export function StepSocialMedia({ data, onChange, errors }: StepSocialMediaProps) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={item} className="text-center max-w-xl mx-auto mb-4">
        <div className="w-14 h-14 rounded-2xl bg-[var(--brand)]/10 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--brand)]"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </div>
        <h3 className="text-xl font-serif text-[var(--foreground)] mb-2">Connect Your Presence</h3>
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
          Link your social media profiles and portfolios. Verified accounts with high engagement rates receive priority placement in casting search results.
        </p>
      </motion.div>

      {/* Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {PLATFORMS.map((platform) => {
          const value = data[platform.key as keyof typeof data];
          const hasValue = value && value.length > 0;

          return (
            <div key={platform.key} className="relative group w-full">
              <FloatingInput
                icon={
                  <span className={`transition-colors duration-300 ${hasValue ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)] group-focus-within:text-[var(--brand)]'}`}>
                    {platform.icon}
                  </span>
                }
                label={platform.label}
                value={value}
                onChange={(e) => onChange({ [platform.key]: e.target.value })}
                error={errors[platform.key]}
                className={`font-mono text-xs ${hasValue ? platform.color.split(' ')[1].replace('border-', 'border-').replace('text-', '') : ''}`}
              />
              
              {/* Visual prefix hint when empty and focused */}
              {!hasValue && (
                <span className="absolute left-12 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--muted-foreground)]/50 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity z-10">
                  {platform.prefix}
                </span>
              )}
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

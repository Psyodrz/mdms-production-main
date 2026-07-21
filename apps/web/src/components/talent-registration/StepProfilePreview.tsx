'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ScrollImageTunnel } from '@/components/ui/scroll-image-tunnel';

interface StepProfilePreviewProps {
  data: any; // Entire wizard data state
  categories: { id: string; name: string; slug: string }[];
}

export function StepProfilePreview({ data, categories }: StepProfilePreviewProps) {
  const primaryCategory = categories.find(c => c.id === data.primaryTalentId);
  const secondaryCategories = categories.filter(c => data.secondaryTalentIds.includes(c.id));
  
  const coverUrl = data.coverBannerPreview || data.galleryImages?.[0]?.url || '';
  
  // Find profile photo
  const profileUrl = data.profilePhotoPreview || '';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-serif text-[var(--foreground)] mb-2">Profile Preview</h3>
        <p className="text-sm text-[var(--muted-foreground)]">
          This is exactly how casting directors and clients will see your profile.
        </p>
      </div>

      {/* Simulated Profile Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-xl">
        
        {/* Cover Banner */}
        <div className="w-full h-[200px] sm:h-[300px] relative bg-gradient-to-tr from-neutral-800 to-neutral-900">
          {coverUrl && (
            <img src={coverUrl} alt="Cover" className="w-full h-full object-cover object-top" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] to-transparent" />
        </div>

        <div className="px-6 sm:px-12 pb-12">
          <div className="flex flex-col sm:flex-row gap-8 relative -top-16 sm:-top-24 mb-[-4rem] sm:mb-[-6rem]">
            
            {/* Profile Photo */}
            <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-2xl sm:rounded-[2rem] border-4 border-[var(--surface)] overflow-hidden shadow-2xl flex-shrink-0 bg-[var(--card)] flex items-center justify-center">
              {profileUrl ? (
                <img src={profileUrl} alt={data.fullName} className="w-full h-full object-cover object-top" />
              ) : (
                <span className="text-4xl font-serif text-muted-foreground">{data.fullName?.[0] || 'T'}</span>
              )}
            </div>

            {/* Header Info */}
            <div className="flex-1 pt-4 sm:pt-28">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-serif text-[var(--foreground)]">
                  {data.stageName || data.fullName || 'Your Name'}
                </h1>
                <span className="px-3 py-1 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] text-[10px] font-bold tracking-wider uppercase border border-[var(--brand)]/20">
                  {primaryCategory?.name || 'Talent'}
                </span>
                <span className="w-6 h-6 rounded-full bg-[var(--success)] flex items-center justify-center text-white" title="Verified Member">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M3.5 8L6.5 11L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-4">
                <span>📍 {data.city || 'City'}, {data.country || 'Country'}</span>
                <span>•</span>
                <span>{data.experienceLevel?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Experience'}</span>
              </div>

              {secondaryCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {secondaryCategories.map(cat => (
                    <span key={cat.id} className="px-3 py-1 rounded-full border border-[var(--border)] text-xs font-medium text-[var(--muted-foreground)]">
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* CTA Button */}
            <div className="pt-4 sm:pt-28 flex-shrink-0">
              <button className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-semibold shadow-xl hover:scale-105 transition-transform">
                Hire Me
              </button>
            </div>
          </div>

          <hr className="border-[var(--border)] my-12" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column (Bio & Details) */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* Bio */}
              <section>
                <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--brand)] mb-4">About</h3>
                <p className="text-[var(--foreground)] leading-relaxed whitespace-pre-wrap font-medium">
                  {data.bio || 'Your professional bio will appear here. Write a compelling story about your career, experience, and artistic vision.'}
                </p>
              </section>

              {/* Gallery Grid -> Replaced with exact ScrollImageTunnel */}
              {data.galleryImages && data.galleryImages.length > 0 && (
                <section className="w-full">
                  <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--brand)] mb-4">Portfolio</h3>
                  <ScrollImageTunnel 
                    images={data.galleryImages.map((img: any, i: number) => ({
                      src: img.url,
                      alt: `Portfolio item ${i + 1}`
                    }))} 
                  />
                </section>
              )}

              {/* Video */}
              {data.introductionVideoPreview && (
                <section>
                  <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--brand)] mb-4">Showreel</h3>
                  <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-black">
                    <video src={data.introductionVideoPreview} controls className="w-full max-h-[400px] object-contain" />
                  </div>
                </section>
              )}
            </div>

            {/* Right Column (Meta) */}
            <div className="space-y-8">
              
              {/* Skills */}
              {data.skills && data.skills.length > 0 && (
                <section className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
                  <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--brand)] mb-4">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill: string) => (
                      <span key={skill} className="px-3 py-1.5 rounded-lg bg-[var(--surface)] text-xs font-medium text-[var(--foreground)]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Languages */}
              {data.languages && data.languages.length > 0 && (
                <section className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
                  <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--brand)] mb-4">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.languages.map((lang: string) => (
                      <span key={lang} className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--muted-foreground)]">
                        {lang}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Documents */}
              {(data.resumeName || data.compCardName) && (
                <section className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-3">
                  <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--brand)] mb-4">Documents</h3>
                  {data.resumeName && (
                    <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                      <span className="underline decoration-[var(--border)] underline-offset-4 cursor-not-allowed">Resume</span>
                    </div>
                  )}
                  {data.compCardName && (
                    <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <span className="underline decoration-[var(--border)] underline-offset-4 cursor-not-allowed">Comp Card</span>
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

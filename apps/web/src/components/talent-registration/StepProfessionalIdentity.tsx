'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingSelect } from './FormInputs';
import { TagInput } from './TagInput';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface StepProfessionalIdentityProps {
  data: {
    primaryTalentId: string;
    secondaryTalentIds: string[];
    experienceLevel: string;
    languages: string[];
    skills: string[];
  };
  categories: Category[];
  onChange: (data: Partial<StepProfessionalIdentityProps['data']>) => void;
  errors: Record<string, string>;
}

const EXPERIENCE_OPTIONS = [
  { value: 'fresher', label: 'Fresher (0-1 year)' },
  { value: '1-3-years', label: '1-3 Years' },
  { value: '3-5-years', label: '3-5 Years' },
  { value: '5-10-years', label: '5-10 Years' },
  { value: '10-plus-years', label: '10+ Years' },
];

const SUGGESTED_SKILLS = [
  'Fashion Photography', 'Brand Shoots', 'TV Commercials', 'Music Videos',
  'Wedding Photography', 'Product Photography', 'Street Photography',
  'Event Hosting', 'Live Events', 'Corporate Events', 'Voice Over',
  'Dubbing', 'Stage Performance', 'Method Acting', 'Classical Dance',
  'Hip Hop', 'Contemporary', 'Bollywood', 'Improv', 'Script Reading',
  'Content Creation', 'Reels', 'Vlogging', 'Fitness Modeling',
  'Runway Walk', 'Editorial', 'Commercial Modeling', 'Print Ads',
];

const SUGGESTED_LANGUAGES = [
  'Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati',
  'Kannada', 'Malayalam', 'Punjabi', 'Urdu', 'Odia', 'Assamese',
  'Sanskrit', 'French', 'Spanish', 'German', 'Japanese', 'Korean',
  'Arabic', 'Mandarin',
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as any } },
};

export function StepProfessionalIdentity({ data, categories, onChange, errors }: StepProfessionalIdentityProps) {
  const toggleSecondary = (id: string) => {
    if (id === data.primaryTalentId) return;
    const next = data.secondaryTalentIds.includes(id)
      ? data.secondaryTalentIds.filter((x) => x !== id)
      : [...data.secondaryTalentIds, id];
    onChange({ secondaryTalentIds: next });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-10">
      {/* Primary Talent */}
      <motion.div variants={item}>
        <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--brand)] mb-2">
          Primary Talent
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          Select your main profession. This will be your primary identity on the platform.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((cat) => {
            const isSelected = data.primaryTalentId === cat.id;
            return (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChange({ primaryTalentId: cat.id })}
                className={`
                  relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center
                  transition-all duration-300
                  ${isSelected
                    ? 'border-[var(--brand)] bg-[var(--brand)]/10 shadow-glow'
                    : 'border-[var(--border)] hover:border-[var(--brand)]/30 bg-[var(--card)]'
                  }
                `}
              >
                <span className={`text-lg font-serif font-medium ${data.primaryTalentId === cat.id ? 'text-[var(--brand)]' : 'text-[var(--foreground)]'}`}>
                  {cat.name.substring(0, 2).toUpperCase()}
                </span>
                <span className={`text-sm font-semibold ${isSelected ? 'text-[var(--brand)]' : 'text-[var(--foreground)]'}`}>
                  {cat.name}
                </span>
                {isSelected && (
                  <motion.div
                    layoutId="primaryBadge"
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--brand)] flex items-center justify-center"
                  >
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8L6.5 11L13 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
        {errors.primaryTalentId && (
          <p className="mt-2 text-xs text-[var(--destructive)] font-medium">{errors.primaryTalentId}</p>
        )}
      </motion.div>

      {/* Secondary Talents */}
      <motion.div variants={item}>
        <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--brand)] mb-2">
          Secondary Talents
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          Select additional talents to showcase your versatility. (Optional)
        </p>

        <div className="flex flex-wrap gap-2">
          {categories
            .filter((cat) => cat.id !== data.primaryTalentId)
            .map((cat) => {
              const isSelected = data.secondaryTalentIds.includes(cat.id);
              return (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSecondary(cat.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium
                    transition-all duration-300
                    ${isSelected
                      ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]'
                      : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--brand)]/30'
                    }
                  `}
                >
                  <span className={`text-xs font-serif font-medium ${isSelected ? 'text-[var(--brand)]' : 'text-[var(--foreground)]'}`}>
                    {cat.name.substring(0, 2).toUpperCase()}
                  </span>
                  {cat.name}
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="ml-1">
                      <path d="M3 8L6.5 11L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </motion.button>
              );
            })}
        </div>
      </motion.div>

      {/* Experience Level */}
      <motion.div variants={item} className="max-w-sm">
        <FloatingSelect
          label="Experience Level"
          value={data.experienceLevel}
          onChange={(e) => onChange({ experienceLevel: e.target.value })}
          options={EXPERIENCE_OPTIONS}
          error={errors.experienceLevel}
        />
      </motion.div>

      {/* Languages */}
      <motion.div variants={item}>
        <TagInput
          label="Languages"
          tags={data.languages}
          onChange={(languages) => onChange({ languages })}
          suggestions={SUGGESTED_LANGUAGES}
          maxTags={10}
          placeholder="Add languages..."
        />
      </motion.div>

      {/* Skills */}
      <motion.div variants={item}>
        <TagInput
          label="Skills & Specializations"
          tags={data.skills}
          onChange={(skills) => onChange({ skills })}
          suggestions={SUGGESTED_SKILLS}
          maxTags={20}
          placeholder="Add skills..."
          error={errors.skills}
        />
      </motion.div>
    </motion.div>
  );
}

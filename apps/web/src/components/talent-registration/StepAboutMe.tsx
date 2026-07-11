'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FloatingInput, FloatingTextarea, FloatingSelect } from './FormInputs';
import { TagInput } from './TagInput';

interface StepAboutMeProps {
  data: {
    bio: string;
    achievements: { title: string; year: string }[];
    education: { institution: string; degree: string; year: string }[];
    brandsWorkedWith: string[];
    pricingType: string;
    pricingAmount: string;
    isAvailableForTravel: boolean;
    isAvailableForRemote: boolean;
    isAvailableImmediate: boolean;
  };
  onChange: (data: Partial<StepAboutMeProps['data']>) => void;
  errors: Record<string, string>;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as any } },
};

const BRAND_SUGGESTIONS = [
  'Nike', 'Adidas', 'Puma', 'Zara', 'H&M', 'Myntra', 'Flipkart',
  'Amazon', 'Coca-Cola', 'Pepsi', 'Samsung', 'Apple', 'Lakme',
  'L\'Oreal', 'Maybelline', 'Nykaa', 'Titan', 'Tanishq', 'FabIndia',
  'Raymond', 'Allen Solly', 'Van Heusen', 'Manyavar', 'Kalyan Jewellers',
];

export function StepAboutMe({ data, onChange, errors }: StepAboutMeProps) {
  const addAchievement = () => {
    onChange({
      achievements: [...data.achievements, { title: '', year: '' }],
    });
  };

  const updateAchievement = (index: number, field: string, value: string) => {
    const updated = [...data.achievements];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ achievements: updated });
  };

  const removeAchievement = (index: number) => {
    onChange({ achievements: data.achievements.filter((_, i) => i !== index) });
  };

  const addEducation = () => {
    onChange({
      education: [...data.education, { institution: '', degree: '', year: '' }],
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...data.education];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ education: updated });
  };

  const removeEducation = (index: number) => {
    onChange({ education: data.education.filter((_, i) => i !== index) });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-10">
      {/* Bio */}
      <motion.div variants={item}>
        <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--brand)] mb-2">
          Professional Bio
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Tell your story. This appears on your public profile and is your chance to stand out.
        </p>
        <FloatingTextarea
          label="Write your professional bio..."
          value={data.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          maxChars={1000}
          error={errors.bio}
          rows={5}
        />
      </motion.div>

      {/* Achievements */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--brand)]">
              Achievements & Awards
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Optional but recommended</p>
          </div>
          <button
            onClick={addAchievement}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <line x1="8" y1="3" x2="8" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add
          </button>
        </div>
        <div className="space-y-3">
          {data.achievements.map((ach, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-3"
            >
              <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_120px] gap-3">
                <FloatingInput
                  label={`Achievement ${i + 1}`}
                  value={ach.title}
                  onChange={(e) => updateAchievement(i, 'title', e.target.value)}
                />
                <FloatingInput
                  label="Year"
                  type="number"
                  value={ach.year}
                  onChange={(e) => updateAchievement(i, 'year', e.target.value)}
                  min="1990"
                  max="2030"
                />
              </div>
              <button
                onClick={() => removeAchievement(i)}
                className="mt-4 w-8 h-8 rounded-full flex items-center justify-center text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 8 8" fill="none">
                  <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Education */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--brand)]">
              Education & Training
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Optional</p>
          </div>
          <button
            onClick={addEducation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <line x1="8" y1="3" x2="8" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add
          </button>
        </div>
        <div className="space-y-3">
          {data.education.map((edu, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-3"
            >
              <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_1fr_100px] gap-3">
                <FloatingInput
                  label="Institution"
                  value={edu.institution}
                  onChange={(e) => updateEducation(i, 'institution', e.target.value)}
                />
                <FloatingInput
                  label="Degree / Course"
                  value={edu.degree}
                  onChange={(e) => updateEducation(i, 'degree', e.target.value)}
                />
                <FloatingInput
                  label="Year"
                  type="number"
                  value={edu.year}
                  onChange={(e) => updateEducation(i, 'year', e.target.value)}
                  min="1990"
                  max="2030"
                />
              </div>
              <button
                onClick={() => removeEducation(i)}
                className="mt-4 w-8 h-8 rounded-full flex items-center justify-center text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 8 8" fill="none">
                  <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Brands Worked With */}
      <motion.div variants={item}>
        <TagInput
          label="Brands Worked With"
          tags={data.brandsWorkedWith}
          onChange={(brandsWorkedWith) => onChange({ brandsWorkedWith })}
          suggestions={BRAND_SUGGESTIONS}
          maxTags={30}
          placeholder="Add brands..."
        />
      </motion.div>

      {/* Pricing */}
      <motion.div variants={item}>
        <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--brand)] mb-6">
          Pricing & Availability
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <FloatingSelect
            label="Pricing Model"
            value={data.pricingType}
            onChange={(e) => onChange({ pricingType: e.target.value })}
            options={[
              { value: 'hourly', label: 'Per Hour' },
              { value: 'daily', label: 'Per Day' },
              { value: 'project', label: 'Per Project' },
              { value: 'negotiable', label: 'Negotiable' },
            ]}
          />
          {data.pricingType && data.pricingType !== 'negotiable' && (
            <FloatingInput
              label="Rate (₹)"
              type="number"
              value={data.pricingAmount}
              onChange={(e) => onChange({ pricingAmount: e.target.value })}
              icon={
                <span className="text-sm font-semibold text-[var(--muted-foreground)]">₹</span>
              }
            />
          )}
        </div>

        {/* Availability toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { key: 'isAvailableForTravel' as const, label: 'Available for Travel', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21.5 4c0 0-2 .5-3.5 2L14.5 9.5l-8.2-1.8c-1.3-.3-2.6.4-3 1.6L2 11l6 2 2 6 1.7-1.3c1.2-.4 1.9-1.7 1.6-3l-1.8-8.2z"/></svg> },
            { key: 'isAvailableForRemote' as const, label: 'Available for Remote', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg> },
            { key: 'isAvailableImmediate' as const, label: 'Available Immediately', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => onChange({ [key]: !data[key] })}
              className={`
                flex items-center gap-3 p-4 rounded-xl border transition-all duration-300
                ${data[key]
                  ? 'border-[var(--brand)] bg-[var(--brand)]/10'
                  : 'border-[var(--border)] hover:border-[var(--brand)]/30'
                }
              `}
            >
              <span className="text-lg">{icon}</span>
              <span className={`text-sm font-medium ${data[key] ? 'text-[var(--brand)]' : 'text-[var(--muted-foreground)]'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

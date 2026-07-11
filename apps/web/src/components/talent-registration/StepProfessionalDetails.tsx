'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FloatingInput, FloatingSelect } from './FormInputs';

interface CategoryField {
  id: string;
  name: string;
  label: string;
  type: 'TEXT' | 'NUMBER' | 'SELECT' | 'MULTISELECT' | 'FILE' | 'BOOLEAN';
  options?: string; // JSON stringified array
  isRequired: boolean;
  order: number;
}

interface StepProfessionalDetailsProps {
  categoryName: string;
  fields: CategoryField[];
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  errors: Record<string, string>;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as any } },
};

export function StepProfessionalDetails({
  categoryName,
  fields,
  data,
  onChange,
  errors,
}: StepProfessionalDetailsProps) {
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  const parseOptions = (optionsStr?: string): string[] => {
    if (!optionsStr) return [];
    try {
      return typeof optionsStr === 'string' ? JSON.parse(optionsStr) : optionsStr;
    } catch {
      return [];
    }
  };

  const updateField = (name: string, value: any) => {
    onChange({ ...data, [name]: value });
  };

  if (sortedFields.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-[var(--surface)] flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--brand)]">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No Additional Details Required</h3>
        <p className="text-sm text-[var(--muted-foreground)] max-w-md">
          Your selected profession doesn&apos;t have additional fields at this time. You can proceed to the next step.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={item}>
        <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--brand)] mb-2">
          {categoryName} Details
        </h3>
        <p className="text-sm text-[var(--muted-foreground)]">
          These details are specific to your profession and help clients find the right talent.
        </p>
      </motion.div>

      {/* Dynamic Fields */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedFields.map((field) => {
          const fieldError = errors[field.name];

          switch (field.type) {
            case 'SELECT': {
              const options = parseOptions(field.options as any);
              return (
                <FloatingSelect
                  key={field.id}
                  label={field.label + (field.isRequired ? ' *' : '')}
                  value={data[field.name] || ''}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  options={options.map((opt) => ({ value: opt, label: opt }))}
                  error={fieldError}
                />
              );
            }

            case 'NUMBER':
              return (
                <FloatingInput
                  key={field.id}
                  label={field.label + (field.isRequired ? ' *' : '')}
                  type="number"
                  value={data[field.name] || ''}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  error={fieldError}
                />
              );

            case 'BOOLEAN':
              return (
                <div key={field.id} className="flex items-center gap-3 h-14">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={!!data[field.name]}
                        onChange={(e) => updateField(field.name, e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`
                        w-5 h-5 rounded-md border-2 transition-all duration-300 flex items-center justify-center
                        ${data[field.name]
                          ? 'bg-[var(--brand)] border-[var(--brand)]'
                          : 'border-[var(--input)] group-hover:border-[var(--brand)]/50'
                        }
                      `}>
                        {data[field.name] && (
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8L6.5 11.5L13 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-[var(--foreground)]">{field.label}</span>
                  </label>
                </div>
              );

            case 'MULTISELECT': {
              const options = parseOptions(field.options as any);
              const selected: string[] = data[field.name] || [];
              return (
                <div key={field.id} className="md:col-span-2">
                  <label className="block text-[10px] font-semibold tracking-[0.15em] uppercase text-[var(--muted-foreground)] mb-3">
                    {field.label} {field.isRequired && '*'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {options.map((opt) => {
                      const isSelected = selected.includes(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            const next = isSelected
                              ? selected.filter((s) => s !== opt)
                              : [...selected, opt];
                            updateField(field.name, next);
                          }}
                          className={`
                            px-4 py-2 rounded-full border text-sm font-medium transition-all duration-300
                            ${isSelected
                              ? 'border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]'
                              : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--brand)]/30'
                            }
                          `}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {fieldError && (
                    <p className="mt-2 text-xs text-[var(--destructive)] font-medium">{fieldError}</p>
                  )}
                </div>
              );
            }

            case 'TEXT':
            default:
              return (
                <FloatingInput
                  key={field.id}
                  label={field.label + (field.isRequired ? ' *' : '')}
                  value={data[field.name] || ''}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  error={fieldError}
                />
              );
          }
        })}
      </motion.div>
    </motion.div>
  );
}

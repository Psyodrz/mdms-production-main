'use client';

import React, { forwardRef, useState, useId } from 'react';
import { motion } from 'framer-motion';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const id = useId();
    const hasValue = props.value !== undefined && props.value !== '';
    // Date/time/datetime-local inputs always show native UI text, so label must always float
    const alwaysFloat = props.type === 'date' || props.type === 'time' || props.type === 'datetime-local';
    const isFloating = isFocused || hasValue || alwaysFloat;

    return (
      <div className="relative w-full group">
        <div className="relative w-full">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] transition-colors duration-300 group-focus-within:text-[var(--brand)] z-10 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            {...props}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={`
              peer w-full h-14 rounded-xl border bg-transparent
              text-[var(--foreground)] text-sm font-medium
              transition-all duration-300 ease-out outline-none
              ${icon ? 'pl-12 pr-4' : 'px-4'} pt-5 pb-2
              ${error
                ? 'border-[var(--destructive)] focus:border-[var(--destructive)] focus:ring-1 focus:ring-[var(--destructive)]'
                : 'border-[var(--input)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)]'
              }
              placeholder-transparent
              ${className}
            `}
            placeholder={label}
          />
          <label
            htmlFor={id}
            className={`
              absolute transition-all duration-300 ease-out pointer-events-none
              ${icon ? 'left-12' : 'left-4'}
              ${isFloating
                ? 'top-2 text-[10px] font-semibold tracking-wider uppercase'
                : 'top-1/2 -translate-y-1/2 text-sm font-medium'
              }
              ${error
                ? 'text-[var(--destructive)]'
                : isFloating
                  ? 'text-[var(--brand)]'
                  : 'text-[var(--muted-foreground)]'
              }
            `}
          >
            {label}
          </label>
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-xs text-[var(--destructive)] font-medium pl-1"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';

interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  maxChars?: number;
}

export const FloatingTextarea = forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ label, error, maxChars, className = '', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const id = useId();
    const hasValue = props.value !== undefined && props.value !== '';
    const isFloating = isFocused || hasValue;
    const charCount = typeof props.value === 'string' ? props.value.length : 0;

    return (
      <div className="relative w-full group">
        <div className="relative">
          <textarea
            ref={ref}
            id={id}
            {...props}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={`
              peer w-full min-h-[120px] rounded-xl border bg-transparent
              text-[var(--foreground)] text-sm font-medium resize-y
              transition-all duration-300 ease-out outline-none
              px-4 pt-7 pb-3
              ${error
                ? 'border-[var(--destructive)] focus:border-[var(--destructive)] focus:ring-1 focus:ring-[var(--destructive)]'
                : 'border-[var(--input)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)]'
              }
              placeholder-transparent
              ${className}
            `}
            placeholder={label}
            maxLength={maxChars}
          />
          <label
            htmlFor={id}
            className={`
              absolute left-4 transition-all duration-300 ease-out pointer-events-none
              ${isFloating
                ? 'top-2 text-[10px] font-semibold tracking-wider uppercase'
                : 'top-4 text-sm font-medium'
              }
              ${error
                ? 'text-[var(--destructive)]'
                : isFloating
                  ? 'text-[var(--brand)]'
                  : 'text-[var(--muted-foreground)]'
              }
            `}
          >
            {label}
          </label>
        </div>
        <div className="flex justify-between mt-1.5 px-1">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-[var(--destructive)] font-medium"
            >
              {error}
            </motion.p>
          )}
          {maxChars && (
            <span className={`text-xs font-medium ml-auto ${charCount > maxChars * 0.9 ? 'text-[var(--destructive)]' : 'text-[var(--muted-foreground)]'}`}>
              {charCount}/{maxChars}
            </span>
          )}
        </div>
      </div>
    );
  }
);

FloatingTextarea.displayName = 'FloatingTextarea';

interface FloatingSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const FloatingSelect = forwardRef<HTMLSelectElement, FloatingSelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const id = useId();
    const hasValue = props.value !== undefined && props.value !== '';
    const isFloating = isFocused || hasValue;

    return (
      <div className="relative w-full group">
        <div className="relative">
          <select
            ref={ref}
            id={id}
            {...props}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={`
              peer w-full h-14 rounded-xl border bg-transparent appearance-none
              text-[var(--foreground)] text-sm font-medium
              transition-all duration-300 ease-out outline-none
              px-4 pt-5 pb-2
              ${error
                ? 'border-[var(--destructive)] focus:border-[var(--destructive)] focus:ring-1 focus:ring-[var(--destructive)]'
                : 'border-[var(--input)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)]'
              }
              ${className}
            `}
          >
            <option value="" disabled hidden></option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[var(--card)] text-[var(--foreground)]">
                {opt.label}
              </option>
            ))}
          </select>
          <label
            htmlFor={id}
            className={`
              absolute left-4 transition-all duration-300 ease-out pointer-events-none
              ${isFloating
                ? 'top-2 text-[10px] font-semibold tracking-wider uppercase'
                : 'top-1/2 -translate-y-1/2 text-sm font-medium'
              }
              ${error
                ? 'text-[var(--destructive)]'
                : isFloating
                  ? 'text-[var(--brand)]'
                  : 'text-[var(--muted-foreground)]'
              }
            `}
          >
            {label}
          </label>
          {/* Chevron */}
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" viewBox="0 0 16 16" fill="none">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-xs text-[var(--destructive)] font-medium pl-1"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

FloatingSelect.displayName = 'FloatingSelect';

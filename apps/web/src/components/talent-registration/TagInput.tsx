'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TagInputProps {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  maxTags?: number;
  error?: string;
  placeholder?: string;
}

export function TagInput({
  label,
  tags,
  onChange,
  suggestions = [],
  maxTags = 20,
  error,
  placeholder = 'Type and press Enter...',
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(s)
  ).slice(0, 8);

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim();
      if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
        onChange([...tags, trimmed]);
        setInputValue('');
        setShowSuggestions(false);
      }
    },
    [tags, onChange, maxTags]
  );

  const removeTag = useCallback(
    (index: number) => {
      onChange(tags.filter((_, i) => i !== index));
    },
    [tags, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-[10px] font-semibold tracking-[0.15em] uppercase text-[var(--muted-foreground)] mb-2">
        {label}
        {maxTags && (
          <span className="ml-2 text-[var(--muted-foreground)] normal-case tracking-normal">
            ({tags.length}/{maxTags})
          </span>
        )}
      </label>

      <div
        className={`
          relative flex flex-wrap gap-2 p-3 rounded-xl border min-h-[56px] cursor-text
          transition-all duration-300
          ${error
            ? 'border-[var(--destructive)]'
            : 'border-[var(--input)] focus-within:border-[var(--brand)] focus-within:ring-1 focus-within:ring-[var(--brand)]'
          }
        `}
        onClick={() => inputRef.current?.focus()}
      >
        <AnimatePresence mode="popLayout">
          {tags.map((tag, index) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              layout
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--brand)] text-white text-xs font-semibold tracking-wide"
            >
              {tag}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(index);
                }}
                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={tags.length === 0 ? placeholder : ''}
          disabled={tags.length >= maxTags}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
        />

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-0 right-0 top-full mt-1 z-50 max-h-48 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xl"
            >
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTag(suggestion);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  {suggestion}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
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

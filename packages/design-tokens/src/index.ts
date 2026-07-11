/**
 * MDMS Design Tokens — TypeScript Exports
 * ========================================
 * All color, typography, and spacing tokens as JS constants.
 * Used by Tailwind config, Framer Motion, and any JS-level styling.
 *
 * Reference: SRS Section 2 — Color System & Brand Identity
 */

// ── Color Tokens ────────────────────────────────

export const colors = {
  light: {
    bg: {
      base: '#F5F2EC',
      surface: '#FFFFFF',
      elevated: '#EDE9E1',
      overlay: '#E3DDD4',
    },
    primary: {
      DEFAULT: '#12213A',
      hover: '#1C3258',
    },
    accent: {
      DEFAULT: '#C8923A',
      hover: '#B07A28',
    },
    secondary: '#2A5F7F',
    text: {
      primary: '#1A1A1A',
      secondary: '#5A6272',
      tertiary: '#8A919E',
    },
    border: {
      DEFAULT: '#DDD9D0',
      focus: '#C8923A',
    },
    status: {
      success: '#2D7D4E',
      error: '#C0392B',
      warning: '#D4870F',
      info: '#2A5F7F',
    },
  },
  dark: {
    bg: {
      base: '#0C0F14',
      surface: '#141820',
      elevated: '#1C2130',
      overlay: '#252D3D',
    },
    primary: {
      DEFAULT: '#4A90D9',
      hover: '#5AA0E9',
    },
    accent: {
      DEFAULT: '#D4A855',
      hover: '#E4B865',
    },
    secondary: '#5BA3C9',
    text: {
      primary: '#EDE9E1',
      secondary: '#9AA3B2',
      tertiary: '#5E6778',
    },
    border: {
      DEFAULT: '#252D3D',
      focus: '#D4A855',
    },
    status: {
      success: '#3DA06A',
      error: '#E05A4F',
      warning: '#E8A020',
      info: '#5BA3C9',
    },
  },
} as const;

// ── Typography Tokens ───────────────────────────

export const fonts = {
  display: "'Playfair Display', Georgia, 'Times New Roman', serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
} as const;

export const fontSizes = {
  xs: '0.6875rem',    // 11px
  sm: '0.8125rem',    // 13px
  base: '0.875rem',   // 14px
  md: '1rem',         // 16px
  lg: '1.125rem',     // 18px
  xl: '1.5rem',       // 24px
  '2xl': '1.75rem',   // 28px
  '3xl': '2.5rem',    // 40px
  '4xl': '3rem',      // 48px
  '5xl': '5rem',      // 80px
} as const;

export const fontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// ── Spacing Scale ───────────────────────────────

export const spacing = {
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
} as const;

// ── Radius ──────────────────────────────────────

export const radius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

// ── Shadows ─────────────────────────────────────

export const shadows = {
  sm: '0 1px 2px rgba(18, 33, 58, 0.06)',
  md: '0 4px 12px rgba(18, 33, 58, 0.08)',
  lg: '0 8px 24px rgba(18, 33, 58, 0.12)',
  xl: '0 16px 48px rgba(18, 33, 58, 0.16)',
} as const;

// ── Z-Index Scale ───────────────────────────────

export const zIndex = {
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
} as const;

// ── Transitions ─────────────────────────────────

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

// ── Breakpoints ─────────────────────────────────

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ── Container Widths ────────────────────────────

export const containers = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

"use client";

import React, { useEffect, useState } from "react";

export function CinematicAtmosphere() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden select-none">
      {/* 35mm Film Grain Noise */}
      <svg 
        className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%] opacity-[0.055] dark:opacity-[0.065] pointer-events-none"
        style={{ transform: "translateZ(0)" }}
      >
        <filter id="cinematic-film-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#cinematic-film-grain)" />
      </svg>

      {/* Subtle Top Center Cinema Vignette Spotlight (Hidden in Light Mode to prevent pink fog) */}
      <div
        className="hidden dark:block absolute -top-[30%] left-1/2 -translate-x-1/2 w-[120vw] h-[70vh] rounded-full opacity-30 dark:opacity-45 blur-[140px]"
        style={{
          background: "radial-gradient(circle, oklch(0.58 0.24 27 / 0.18) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

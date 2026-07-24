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
      {/* Subtle Top Center Cinema Spotlight — Pure CSS Gradient for 60+ FPS performance */}
      <div
        className="hidden dark:block absolute -top-[30%] left-1/2 -translate-x-1/2 w-[120vw] h-[70vh] rounded-full pointer-events-none transform-gpu"
        style={{
          background: "radial-gradient(circle, oklch(0.58 0.24 27 / 0.12) 0%, transparent 65%)",
        }}
      />
    </div>
  );
}


"use client";

import React from "react";
import { useMagnetic, UseMagneticOptions } from "./useMagnetic";

export interface MagneticProps extends UseMagneticOptions {
  children: React.ReactNode;
  className?: string;
}

export function Magnetic({
  children,
  strength = 0.35,
  radius = 40,
  disabled = false,
  className = "",
}: MagneticProps) {
  const ref = useMagnetic<HTMLDivElement>({ strength, radius, disabled });

  return (
    <div
      ref={ref}
      className={`inline-block transition-transform duration-75 ease-out ${className}`}
      style={{ willChange: "transform" }}
    >
      {children}
    </div>
  );
}

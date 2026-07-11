"use client";

import { useEffect, useRef } from "react";

export interface UseMagneticOptions {
  strength?: number; // 0.1 to 1.0 (default 0.35)
  radius?: number;   // Bounding padding radius to trigger magnetic pull (default 40)
  disabled?: boolean;
}

export function useMagnetic<T extends HTMLElement = HTMLElement>(
  options: UseMagneticOptions = {}
) {
  const { strength = 0.35, radius = 40, disabled = false } = options;
  const elementRef = useRef<T>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el || disabled || typeof window === "undefined") return;

    // Check if touch device
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const animate = () => {
      pos.current.x = lerp(pos.current.x, target.current.x, 0.15);
      pos.current.y = lerp(pos.current.y, target.current.y, 0.15);

      if (Math.abs(pos.current.x) > 0.01 || Math.abs(pos.current.y) > 0.01) {
        el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
        rafRef.current = requestAnimationFrame(animate);
      } else {
        el.style.transform = "translate3d(0, 0, 0)";
        pos.current = { x: 0, y: 0 };
        target.current = { x: 0, y: 0 };
        rafRef.current = null;
      }
    };

    const startAnimate = () => {
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.hypot(distX, distY);

      const triggerRadius = Math.max(rect.width, rect.height) / 2 + radius;

      if (distance < triggerRadius) {
        // Calculate elastic pull inside radius
        const pullFactor = Math.pow(1 - distance / triggerRadius, 1.5);
        target.current.x = distX * strength * pullFactor;
        target.current.y = distY * strength * pullFactor;
        startAnimate();
      } else if (target.current.x !== 0 || target.current.y !== 0) {
        target.current = { x: 0, y: 0 };
        startAnimate();
      }
    };

    const handleMouseLeave = () => {
      target.current = { x: 0, y: 0 };
      startAnimate();
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [strength, radius, disabled]);

  return elementRef;
}

"use client";

import React, { useEffect, useRef } from "react";
import { useCursorContext } from "./useCursor";

export interface CursorTrailProps {
  length?: number; // max points in trail (default 16)
  color?: string;  // fallback trail hex/rgb (default "#eb3d26")
  size?: number;   // starting point radius (default 5)
  disabled?: boolean;
}

interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
  size: number;
  vx: number;
  vy: number;
}

export function CursorTrail({
  length = 16,
  color = "#eb3d26",
  size = 5,
  disabled = false,
}: CursorTrailProps) {
  const { isTouchDevice, state } = useCursorContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<TrailPoint[]>([]);
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (disabled || isTouchDevice || typeof window === "undefined") return;

    // Check prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;

      if (!lastMousePos.current) {
        lastMousePos.current = { x, y };
        return;
      }

      const vx = x - lastMousePos.current.x;
      const vy = y - lastMousePos.current.y;
      const dist = Math.hypot(vx, vy);

      // Velocity-based spacing: only add new point if moved enough or fast
      if (dist > 3) {
        pointsRef.current.push({
          x,
          y,
          alpha: 0.65,
          size: size * Math.min(1.4, Math.max(0.7, dist / 15)),
          vx: vx * 0.1,
          vy: vy * 0.1,
        });

        if (pointsRef.current.length > length) {
          pointsRef.current.shift();
        }

        lastMousePos.current = { x, y };
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const animate = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw and update points
      const activePoints: TrailPoint[] = [];

      for (let i = 0; i < pointsRef.current.length; i++) {
        const p = pointsRef.current[i];
        p.alpha *= 0.88;
        p.size *= 0.95;
        p.x += p.vx;
        p.y += p.vy;

        if (p.alpha > 0.02 && p.size > 0.3) {
          activePoints.push(p);

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

          const trailColor = state.color || color;
          ctx.fillStyle = trailColor;
          ctx.globalAlpha = p.alpha;
          ctx.shadowColor = trailColor;
          ctx.shadowBlur = p.size * 2;
          ctx.fill();
          ctx.restore();
        }
      }

      pointsRef.current = activePoints;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [disabled, isTouchDevice, length, color, size, state.color]);

  if (disabled || isTouchDevice) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9996] w-full h-full"
      style={{ willChange: "transform" }}
    />
  );
}

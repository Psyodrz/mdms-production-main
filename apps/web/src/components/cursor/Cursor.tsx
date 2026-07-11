"use client";

import React, { useEffect, useRef, useState } from "react";
import { useCursorContext } from "./useCursor";
import { Play, ArrowUpRight, Hand, Eye, MousePointerClick, CalendarCheck } from "lucide-react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export function Cursor() {
  const { state, isTouchDevice, rippleCoords, particleBurst } = useCursorContext();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);
  const particlesCanvasRef = useRef<HTMLCanvasElement>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const lastRingPos = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number | null>(null);
  const particlesRafRef = useRef<number | null>(null);
  const particles = useRef<Particle[]>([]);
  const isHiddenRef = useRef(false);

  const [isVisible, setIsVisible] = useState(false);
  const [activeRipple, setActiveRipple] = useState<{ x: number; y: number; id: number } | null>(
    null
  );

  // Trigger ripple effect
  useEffect(() => {
    if (rippleCoords) {
      setActiveRipple(rippleCoords);
      const timer = setTimeout(() => setActiveRipple(null), 550);
      return () => clearTimeout(timer);
    }
  }, [rippleCoords]);

  // Trigger click particles burst
  useEffect(() => {
    if (particleBurst && particlesCanvasRef.current) {
      const colors = ["#eb3d26", "#ffffff", "#ff7a68", "#ffa194"];
      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI * 2 * i) / 10 + (Math.random() - 0.5) * 0.5;
        const speed = 2 + Math.random() * 4;
        particles.current.push({
          x: particleBurst.x,
          y: particleBurst.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }
  }, [particleBurst]);

  // Main animation loop (60-120 FPS) with spring physics, stretch velocity & idle breathing
  useEffect(() => {
    if (isTouchDevice || typeof window === "undefined") return;

    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    let idleTime = 0;

    const animate = (timestamp: number) => {
      if (isHiddenRef.current) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      // 1. Smooth inner dot position (fast tracking)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // 2. Spring interpolation for outer ring
      const factor = isReducedMotion ? 0.4 : 0.12;
      ringPos.current.x = lerp(ringPos.current.x, mousePos.current.x, factor);
      ringPos.current.y = lerp(ringPos.current.y, mousePos.current.y, factor);

      const vx = ringPos.current.x - lastRingPos.current.x;
      const vy = ringPos.current.y - lastRingPos.current.y;
      const velocity = Math.hypot(vx, vy);

      // Check if idle for sinusoidal breathing
      if (velocity < 0.1) {
        idleTime += 16;
      } else {
        idleTime = 0;
      }

      let scaleX = 1;
      let scaleY = 1;
      let angle = 0;

      // Calculate velocity stretch and direction rotation
      if (!isReducedMotion && velocity > 0.8 && !state.isHovered && state.type !== "caret") {
        const stretch = Math.min(velocity / 35, 0.45);
        scaleX = 1 + stretch;
        scaleY = 1 - stretch * 0.5;
        angle = Math.atan2(vy, vx) * (180 / Math.PI);
      } else if (idleTime > 200 && !state.isHovered && state.type === "default") {
        // Idle breathing animation
        const breath = Math.sin(timestamp * 0.004) * 0.07;
        scaleX = 1 + breath;
        scaleY = 1 + breath;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%) rotate(${angle}deg) scale3d(${scaleX}, ${scaleY}, 1)`;
      }

      if (contentRef.current && (state.text || state.image || state.type !== "default")) {
        contentRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      lastRingPos.current = { x: ringPos.current.x, y: ringPos.current.y };
      rafRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleVisibilityChange = () => {
      isHiddenRef.current = document.hidden;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isTouchDevice, isVisible, state.isHovered, state.text, state.image, state.type]);

  // Particles animation loop
  useEffect(() => {
    if (isTouchDevice || typeof window === "undefined") return;

    const canvas = particlesCanvasRef.current;
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

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (particles.current.length > 0) {
        const remaining: Particle[] = [];
        for (let i = 0; i < particles.current.length; i++) {
          const p = particles.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.94;
          p.vy *= 0.94;
          p.alpha -= 0.035;
          p.size *= 0.97;

          if (p.alpha > 0.05 && p.size > 0.2) {
            remaining.push(p);
            ctx.save();
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.restore();
          }
        }
        particles.current = remaining;
      }

      particlesRafRef.current = requestAnimationFrame(animateParticles);
    };

    particlesRafRef.current = requestAnimationFrame(animateParticles);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (particlesRafRef.current) cancelAnimationFrame(particlesRafRef.current);
    };
  }, [isTouchDevice]);

  if (isTouchDevice || !isVisible) return null;

  // Determine ring sizing & shape classes
  const getRingDimensions = () => {
    if (state.type === "caret") {
      return "w-1 h-8 rounded-full border-none bg-[#eb3d26] shadow-[0_0_12px_rgba(235,61,38,0.8)] animate-pulse";
    }
    if (state.type === "image" || state.image) {
      return "w-28 h-28 rounded-2xl border border-white/30 bg-black/80 backdrop-blur-md shadow-2xl overflow-hidden";
    }
    if (state.text && state.type !== "click") {
      return "min-w-28 h-12 px-4 rounded-full border border-white/40 bg-black/80 backdrop-blur-xl shadow-[0_0_30px_rgba(235,61,38,0.45)] scale-105";
    }
    if (state.size === "xl") {
      return "w-24 h-24 rounded-full border border-white/40 bg-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(235,61,38,0.4)]";
    }
    if (state.size === "large" || state.type === "view" || state.type === "open" || state.type === "play" || state.type === "drag" || state.type === "book") {
      return "w-16 h-16 rounded-full border border-white/40 bg-white/10 backdrop-blur-md shadow-[0_0_25px_rgba(235,61,38,0.35)] scale-105";
    }
    if (state.isHovered || state.type === "click") {
      return "w-12 h-12 rounded-full bg-white mix-blend-difference scale-110";
    }
    if (state.size === "small") {
      return "w-6 h-6 rounded-full border border-white/40 bg-white/5 backdrop-blur-[1px]";
    }
    return "w-8 h-8 rounded-full border border-white/50 bg-white/5 backdrop-blur-[1px] shadow-[0_0_15px_rgba(255,255,255,0.05)]";
  };

  const customRingColorStyle = state.color
    ? { borderColor: state.color, boxShadow: `0 0 20px ${state.color}40` }
    : undefined;

  return (
    <>
      {/* 1. Click Particles Canvas */}
      <canvas
        ref={particlesCanvasRef}
        className="fixed inset-0 pointer-events-none z-[9999] w-full h-full"
      />

      {/* 2. Inner Dot (Hidden during image/caret mode for cleanest look) */}
      {state.type !== "caret" && state.type !== "image" && !state.image && (
        <div
          ref={dotRef}
          className={`fixed top-0 left-0 pointer-events-none z-[9999] rounded-full transition-all duration-150 ${
            state.isHovered ? "w-2 h-2 bg-white" : "w-2 h-2 bg-[#eb3d26]"
          }`}
          style={{
            willChange: "transform",
            backgroundColor: state.color || undefined,
          }}
        />
      )}

      {/* 3. Outer Ring / Glassmorphism Box */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9998] transition-all duration-300 ease-out flex items-center justify-center ${getRingDimensions()}`}
        style={{
          willChange: "transform, width, height, border-radius",
          ...customRingColorStyle,
        }}
      >
        {/* Click Ripple Effect */}
        {activeRipple && (
          <div
            key={activeRipple.id}
            className="absolute inset-0 rounded-full border border-[#eb3d26] animate-ping opacity-75 pointer-events-none"
          />
        )}
      </div>

      {/* 4. Content Layer (Text / Image / Icons inside ring) */}
      {(state.text || state.image || state.type !== "default") && state.type !== "caret" && (
        <div
          ref={contentRef}
          className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center transition-opacity duration-200"
          style={{ willChange: "transform" }}
        >
          {/* Image Preview Morph */}
          {state.image && (
            <div className="w-28 h-28 rounded-2xl overflow-hidden relative shadow-lg animate-fade-in">
              <img
                src={state.image}
                alt="preview"
                className="w-full h-full object-cover scale-105 animate-pulse"
              />
              {state.text && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-white">
                  {state.text}
                </div>
              )}
            </div>
          )}

          {/* Text Labels / Icons */}
          {!state.image && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-fade-up">
              {state.type === "play" && <Play className="w-3.5 h-3.5 fill-white text-white animate-bounce" />}
              {state.type === "open" && <ArrowUpRight className="w-3.5 h-3.5 text-white animate-pulse" />}
              {state.type === "view" && <Eye className="w-3.5 h-3.5 text-white" />}
              {state.type === "drag" && <Hand className="w-3.5 h-3.5 text-white" />}
              {state.type === "book" && <CalendarCheck className="w-3.5 h-3.5 text-white" />}
              {state.type === "click" && !state.text && <MousePointerClick className="w-3.5 h-3.5 text-[#eb3d26]" />}
              {state.text && <span>{state.text}</span>}
            </div>
          )}
        </div>
      )}
    </>
  );
}

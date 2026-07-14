"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Film, Camera, Sliders, User, Award } from "lucide-react";
import { MagneticButton } from "@/components/motion/MagneticButton";

export interface ProjectSpec {
  title: string;
  category?: string;
  client?: string;
  year?: string;
  description?: string;
  videoUrl?: string;
  coverImage?: string;
  director?: string;
  dop?: string;
  camera?: string;
  lenses?: string;
  colorGrade?: string;
  awards?: string[];
}

interface CinematicViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectSpec | null;
}

export function CinematicViewerModal({
  isOpen,
  onClose,
  project,
}: CinematicViewerModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-10000 flex items-start justify-center bg-(--cinematic-bg)/95 backdrop-blur-2xl p-4 md:p-8 overflow-y-auto"
          onClick={onClose}
          data-lenis-prevent="true"
        >
          {/* Close Button */}
          <div className="fixed top-6 right-6 z-10001">
            <MagneticButton strength={20} onClick={onClose}>
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-(--cinematic-text)/10 hover:bg-brand border border-(--cinematic-border) hover:border-brand text-(--cinematic-text) text-xs font-mono tracking-widest uppercase transition-all duration-300 shadow-2xl">
                <span>Close Reel</span>
                <X className="w-4 h-4" />
              </div>
            </MagneticButton>
          </div>

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-6xl rounded-3xl border border-(--cinematic-border) bg-(--cinematic-bg-elevated) shadow-[0_0_80px_rgba(235,61,38,0.15)] overflow-hidden shrink-0 mt-8 mb-24 md:my-16"
          >
            {/* Cinematic 21:9 or 16:9 Widescreen Viewport */}
            <div className="relative w-full aspect-video md:aspect-21/9 bg-black overflow-hidden group">
              {project.videoUrl ? (
                project.videoUrl.includes("youtube.com") || project.videoUrl.includes("vimeo.com") ? (
                  <iframe
                    src={project.videoUrl}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={project.videoUrl}
                    poster={project.coverImage}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <img
                  src={
                    project.coverImage ||
                    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1920&q=80"
                  }
                  alt={project.title}
                  className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
                />
              )}

              {/* Top Film Reel Overlay Badge */}
              <div className="absolute top-4 left-6 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-(--cinematic-bg)/60 backdrop-blur-md border border-(--cinematic-border) text-[10px] font-mono tracking-widest text-brand uppercase">
                <Film className="w-3.5 h-3.5 animate-pulse" />
                <span>Cinematic Master Reel</span>
              </div>
            </div>

            {/* Technical Specifications & Details Grid */}
            <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-linear-to-b from-(--cinematic-bg-elevated) to-(--cinematic-bg)">
              {/* Left Column: Title & Description */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  {project.category && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono tracking-wider bg-brand/15 border border-brand/40 text-brand uppercase">
                      {project.category}
                    </span>
                  )}
                  {project.year && (
                    <span className="text-xs font-mono text-(--cinematic-text-muted)/70">{project.year}</span>
                  )}
                  {project.client && (
                    <span className="text-xs font-mono text-(--cinematic-text-muted)/90 border-l border-(--cinematic-border) pl-3">
                      Client: <span className="text-(--cinematic-text) font-semibold">{project.client}</span>
                    </span>
                  )}
                </div>

                <h2 className="text-3xl md:text-5xl font-display font-bold text-(--cinematic-text) tracking-tight">
                  {project.title}
                </h2>

                <p className="text-(--cinematic-text-muted) text-base md:text-lg leading-relaxed font-light">
                  {project.description ||
                    "An immersive visual journey engineered by MP Production. Shot on location with high-dynamic-range cinema cameras and precision optical lenses to capture breathtaking raw texture, depth, and atmospheric lighting."}
                </p>

                {project.awards && project.awards.length > 0 && (
                  <div className="pt-4 flex flex-wrap gap-2">
                    {project.awards.map((award, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/30 text-accent text-xs font-mono"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{award}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Technical Production Spec Sheet */}
              <div className="lg:col-span-5 rounded-2xl border border-(--cinematic-border) bg-(--cinematic-bg)/30 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-(--cinematic-border) pb-3">
                  <span className="text-xs font-mono tracking-widest text-(--cinematic-text-muted)/80 uppercase">
                    Technical Specifications
                  </span>
                  <Sliders className="w-4 h-4 text-brand" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-(--cinematic-text-muted)/60 text-[11px] font-mono uppercase">
                      <User className="w-3 h-3 text-brand" />
                      <span>Director / DOP</span>
                    </div>
                    <div className="text-sm font-medium text-(--cinematic-text)">
                      {project.director || project.dop || "Marcus Vance / Elena Rostova"}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-(--cinematic-text-muted)/60 text-[11px] font-mono uppercase">
                      <Camera className="w-3 h-3 text-brand" />
                      <span>Camera Body</span>
                    </div>
                    <div className="text-sm font-medium text-(--cinematic-text)">
                      {project.camera || "ARRI Alexa 35 (4.6K Open Gate)"}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-(--cinematic-text-muted)/60 text-[11px] font-mono uppercase">
                      <Film className="w-3 h-3 text-brand" />
                      <span>Optical Lenses</span>
                    </div>
                    <div className="text-sm font-medium text-(--cinematic-text)">
                      {project.lenses || "Cooke S7/i Full Frame Anamorphic"}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-(--cinematic-text-muted)/60 text-[11px] font-mono uppercase">
                      <Sliders className="w-3 h-3 text-brand" />
                      <span>Color Grade</span>
                    </div>
                    <div className="text-sm font-medium text-(--cinematic-text)">
                      {project.colorGrade || "Kodak 2383 Print LUT / HDR10"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CinematicViewerModal;

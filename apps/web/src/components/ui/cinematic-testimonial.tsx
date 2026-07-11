"use client";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Star, Play, Pause, Volume2, VolumeX } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function CinematicTestimonial() {
  const containerRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const finalTitleRef = useRef<HTMLHeadingElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Browsers only allow autoplay when the video is muted, and React does not
  // reliably set the `muted` attribute on <video>. Force it via the ref and
  // kick off playback on mount so the reel actually plays.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Refresh ScrollTrigger after a short delay to account for any lazy-loaded images above
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    let ctx = gsap.context(() => {
      // 1. Force initial states directly on the refs so they are guaranteed invisible to start
      gsap.set(starsRef.current, { opacity: 0, y: 20 });
      gsap.set(quoteRef.current, { opacity: 0, y: 30 });
      gsap.set(videoWrapperRef.current, { opacity: 0, x: "20vw", scale: 0.8 });
      gsap.set(servicesRef.current, { opacity: 0, y: 20 });
      gsap.set(finalTitleRef.current, { opacity: 0, scale: 0.9 });

      // 2. Create the scroll timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=3500",
          pin: true,
          scrub: 1,
        },
      });

      // Phase 1: Reveal stars and quote
      tl.to(scrollIndicatorRef.current, { opacity: 0, duration: 0.5 }, 0);
      tl.to(starsRef.current, { opacity: 1, y: 0, duration: 1 }, 0.2);
      tl.to(quoteRef.current, { opacity: 1, y: 0, duration: 1 }, 0.5);

      // Phase 2: Shift left and reveal video
      const p2 = "+=1.5";
      tl.to(quoteRef.current, { x: "-20vw", scale: 0.85, duration: 2, ease: "power2.inOut" }, p2);
      tl.to(starsRef.current, { x: "-20vw", scale: 0.85, duration: 2, ease: "power2.inOut" }, "<");
      tl.to(videoWrapperRef.current, { opacity: 1, x: "15vw", scale: 1, duration: 2, ease: "power2.inOut" }, "<");

      // Phase 3: Video expands to fullscreen, Text disappears
      const p3 = "+=1.5";
      tl.to(quoteRef.current, { opacity: 0, duration: 1 }, p3);
      tl.to(starsRef.current, { opacity: 0, duration: 1 }, "<");
      tl.to(
        videoWrapperRef.current,
        {
          x: 0,
          y: 0,
          scale: 1,
          width: "100vw",
          height: "100vh",
          borderRadius: "0px",
          duration: 3,
          ease: "power3.inOut",
        },
        "<"
      );
      
      // Reveal services
      tl.to(servicesRef.current, { opacity: 1, y: 0, duration: 1 }, "-=1");

      // Phase 4: Dissolve to black and huge typography
      const p4 = "+=2";
      tl.to(videoWrapperRef.current, { opacity: 0, duration: 2 }, p4);
      tl.to(servicesRef.current, { opacity: 0, duration: 1 }, "<");
      tl.to(finalTitleRef.current, { opacity: 1, scale: 1, duration: 2 }, "-=1");

    }, containerRef);

    return () => {
      clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, []);

  const quoteWords = ["MP", "Production", "delivered", "a", "film", "we", "couldn't", "stop", "watching."];
  const servicesList = ["Direction", "Casting", "Editing", "Color Grading", "VFX", "Delivery"];

  return (
    <div className="w-full bg-[var(--cinematic-bg)] relative z-50">
      <section 
        ref={containerRef} 
        className="h-screen w-full relative overflow-hidden" 
        style={{ backgroundColor: "var(--cinematic-bg)" }}
      >
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
          
          {/* Stars */}
          <div ref={starsRef} className="flex gap-2 absolute top-[30%] md:top-[35%] z-20">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-6 h-6 fill-brand text-brand" />
            ))}
          </div>

          {/* Quote */}
          <div ref={quoteRef} className="text-center max-w-4xl px-6 absolute top-[45%] md:top-[50%] -translate-y-1/2 z-20">
            <h2 className="font-display text-4xl sm:text-5xl lg:text-7xl font-light tracking-tight text-[var(--cinematic-text)] leading-tight">
              {quoteWords.join(" ")}
            </h2>
          </div>

          {/* Video Reel */}
          <div 
            ref={videoWrapperRef} 
            className="absolute w-[35vw] h-[50vh] min-w-[320px] min-h-[450px] rounded-2xl overflow-hidden pointer-events-auto group flex items-center justify-center bg-black z-10 border border-[var(--cinematic-border)]/50"
          >
            <video 
              ref={videoRef}
              autoPlay 
              muted={isMuted}
              loop 
              playsInline
              poster="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"
              className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
            >
              <source src="/videos/project_1.mp4" type="video/mp4" />
            </video>
            
            <div className="absolute bottom-6 left-6 right-6 p-5 rounded-xl bg-[var(--cinematic-bg-elevated)]/60 backdrop-blur-md border border-[var(--cinematic-border)] flex justify-between items-center text-[var(--cinematic-text)]">
              <div>
                <p className="font-semibold text-lg">Priya M.</p>
                <p className="text-sm opacity-80">Marketing Lead, LUXE Global</p>
              </div>
              <div className="flex items-center gap-2">
                <div onClick={toggleMute} className="w-10 h-10 rounded-full bg-[var(--cinematic-text)]/20 hover:bg-[var(--cinematic-text)]/30 flex items-center justify-center cursor-pointer transition-colors z-50">
                  {isMuted ? <VolumeX className="w-5 h-5 transition-opacity" /> : <Volume2 className="w-5 h-5 transition-opacity" />}
                </div>
                <div onClick={togglePlay} className="w-10 h-10 rounded-full bg-[var(--cinematic-text)]/20 hover:bg-[var(--cinematic-text)]/30 flex items-center justify-center cursor-pointer transition-colors z-50">
                  {isPlaying ? <Pause className="w-5 h-5 transition-opacity" /> : <Play className="w-5 h-5 transition-opacity" />}
                </div>
              </div>
            </div>
          </div>

          {/* Services List */}
          <div 
            ref={servicesRef} 
            className="absolute bottom-[10vh] left-0 w-full flex justify-center flex-wrap gap-4 md:gap-8 px-6 z-30 pointer-events-none"
          >
            {servicesList.map((service, i) => (
              <div key={i} className="text-[var(--cinematic-text)] font-display text-xl md:text-2xl tracking-widest uppercase text-shadow-sm">
                {service}
              </div>
            ))}
          </div>

          {/* Final Typography */}
          <h1 
            ref={finalTitleRef} 
            className="absolute text-5xl sm:text-7xl md:text-[8rem] lg:text-[10rem] font-display font-bold text-[var(--cinematic-text)] text-center leading-[0.9] tracking-tighter pointer-events-none z-40"
          >
            EVERY FRAME<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--cinematic-text)] to-[var(--cinematic-text)]/40">EARNS ATTENTION.</span>
          </h1>

          {/* Scroll Indicator */}
          <div ref={scrollIndicatorRef} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--cinematic-text-muted)] z-20">
            <span className="text-xs tracking-[0.2em] uppercase font-medium">Scroll to explore</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-[var(--cinematic-text)]/50 to-transparent" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default CinematicTestimonial;

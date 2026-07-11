import React from 'react';
import { Container } from './Container';

const brands = [
  "VOGUE", "HARPER'S BAZAAR", "GQ", "LVMH", "TECHNOVA", 
  "LUMIÈRE", "ROLEX", "BMW", "NETFLIX", "HBO MAX"
];

export function BrandMarquee() {
  return (
    <section className="py-12 bg-muted/30 border-y border-border overflow-hidden relative theme-transition">
      <Container className="mb-6">
        <h3 className="text-center text-xs uppercase tracking-[0.3em] text-primary font-semibold">
          Trusted By Global Brands
        </h3>
      </Container>
      
      {/* Marquee Container */}
      <div className="relative flex overflow-hidden group">
        {/* Gradient Fades for Smooth Edges */}
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee flex whitespace-nowrap items-center">
          {brands.concat(brands).concat(brands).map((brand, idx) => (
            <span 
              key={idx} 
              className="mx-8 md:mx-16 text-2xl md:text-3xl font-serif text-foreground/50 hover:text-foreground transition-colors duration-300 cursor-default"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
}

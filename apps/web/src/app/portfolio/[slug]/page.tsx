"use client";

import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
export default function ProjectDetails({ params }: { params: { slug: string } }) {
  const [slug, setSlug] = useState<string>('');
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.resolve(params).then((p) => {
      setSlug(p.slug);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      fetch(`${apiUrl}/cms/portfolio/${p.slug}`)
        .then(res => res.json())
        .then(json => {
          if (json.success && json.data) {
            setProject(json.data);
          } else {
            setProject(null);
          }
        })
        .catch(() => {
          toast.error('Failed to load project details');
          setProject(null);
        })
        .finally(() => {
          setLoading(false);
        });
    });
  }, [params]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <section className="relative h-[80vh] w-full flex items-end pb-24 overflow-hidden border-b border-border bg-muted/20 animate-pulse">
          <Container className="relative z-10 w-full space-y-4">
            <div className="h-4 bg-muted/40 rounded w-32" />
            <div className="h-20 bg-muted/40 rounded max-w-2xl" />
          </Container>
        </section>
        <section className="py-24">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 animate-pulse">
              <div className="lg:col-span-4 space-y-6">
                <div className="h-4 bg-muted/40 rounded w-24" />
                <div className="h-6 bg-muted/40 rounded w-36" />
                <div className="h-24 bg-muted/40 rounded w-full" />
              </div>
              <div className="lg:col-span-8">
                <div className="w-full aspect-video bg-muted/40 rounded-2xl" />
              </div>
            </div>
          </Container>
        </section>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-background min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-32">
          <Container className="text-center space-y-4">
            <h1 className="text-3xl font-serif">Project Not Found</h1>
            <p className="text-muted-foreground text-sm">The requested portfolio project could not be found.</p>
          </Container>
        </div>
        
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      
      {/* Hero Header */}
      <section className="relative h-[80vh] w-full flex items-end pb-24 overflow-hidden border-b border-border">
        <div className="absolute inset-0 z-0 bg-black">
          <img src={project.mediaUrl} alt={project.title} className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
        </div>
        <Container className="relative z-10 w-full">
          <Reveal direction="up">
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-primary font-semibold mb-4">
              <span>{project.category}</span>
              <span className="w-1 h-1 rounded-full bg-primary" />
              <span className="text-white/70">{project.year}</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display leading-[0.9] text-white">
              {project.title}
            </h1>
          </Reveal>
        </Container>
      </section>

      {/* Details & Video */}
      <section className="py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            
            {/* Meta Data Sidebar */}
            <div className="lg:col-span-4">
              <Reveal direction="up" delay={0.2} className="space-y-8 sticky top-32">
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Category</h3>
                  <p className="text-lg font-medium text-foreground">{project.category}</p>
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Year</h3>
                  <p className="text-lg font-medium text-foreground">{project.year || new Date().getFullYear()}</p>
                </div>
                <hr className="border-border" />
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {project.description || 'No description available for this project.'}
                </p>
              </Reveal>
            </div>

            {/* Real Video Player or Cover Image */}
            <div className="lg:col-span-8">
              <Reveal direction="up" delay={0.3}>
                {project.videoUrl ? (
                  <VideoPlayer videoUrl={project.videoUrl} posterUrl={project.mediaUrl} />
                ) : project.mediaUrl ? (
                  <div className="w-full aspect-video bg-surface rounded-2xl overflow-hidden relative border border-border">
                    <img src={project.mediaUrl} alt={project.title} className="w-full h-full object-cover" />
                  </div>
                ) : null}
                
                {/* Additional Gallery Images */}
                {project.galleryImages && project.galleryImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {project.galleryImages.map((imgUrl: string, i: number) => (
                      <div key={i} className="aspect-[4/3] rounded-2xl overflow-hidden border border-border">
                        <img src={imgUrl} alt={`${project.title} gallery ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </Reveal>
            </div>

          </div>
        </Container>
      </section>
    </div>
  );
}

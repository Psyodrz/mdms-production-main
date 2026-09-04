import { Navbar } from '@/components/ui/Navbar';

export const dynamic = 'force-dynamic';

import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Camera, Film, Users, Sparkles, ArrowUpRight, Award, CircleDot, Mail, Phone, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { serverFetchAPI } from '@/lib/server-api-client';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  photoUrl?: string;
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
  };
}



async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const res = await serverFetchAPI('/cms/team', { cache: 'no-store' });
    if (!res.success || !res.data || res.data.length === 0) return [];
    return res.data;
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
}

export default async function TeamPage() {
  const team = await getTeamMembers();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground pt-24 pb-32 relative overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-[80vh] bg-linear-to-b from-brand/8 via-brand/2 to-transparent blur-[140px] pointer-events-none z-0" />
        {/* Header Section */}
        <section className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden mb-24 text-center">
          <Image 
            src="/images/join-hero.jpg" 
            alt="MP Productions Team" 
            fill 
            className="object-cover" 
            priority sizes="100vw" />
          <div className="absolute inset-0 dark:bg-black/60 bg-black/40" />
          <div className="absolute bottom-0 left-0 right-0 h-32 dark:bg-gradient-to-t dark:from-background bg-gradient-to-t from-background to-transparent" />
          
          <Container className="relative z-10 w-full max-w-5xl mx-auto px-4">
            <Reveal direction="up">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-mono tracking-[0.25em] text-white uppercase font-bold mb-6 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-brand" />
                <span>The Core Crew · Creative Technologists</span>
              </div>
              
              <h1 className="text-6xl sm:text-8xl font-display text-white tracking-editorial leading-[0.92] mb-8 font-light drop-shadow-lg">
                THE MIND BEHIND <br />
                <span className="italic font-extralight text-white/80">THE CAMERA.</span>
              </h1>
              
              <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-light leading-relaxed mb-12 drop-shadow">
                Our core leadership is composed of award-winning film directors, VFX colorists, casting directors, and technical producers dedicated to pushing the boundaries of digital media.
              </p>
            </Reveal>
          </Container>
        </section>

        <Container className="relative z-10">

          {/* Team Grid */}
          {team.length === 0 ? (
            <div className="py-24 text-center rounded-[2.5rem] border border-border bg-card">
              <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground/40 font-mono text-xs tracking-wider uppercase">Initializing team roster...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {team.map((member, idx) => (
                <Reveal key={member.id || idx} direction="up" delay={(idx % 3) * 0.1}>
                  <div className="group rounded-[2.5rem] overflow-hidden border border-border bg-card shadow-2xl flex flex-col h-full transition-all duration-500 hover:border-brand/40 hover:shadow-[0_0_35px_rgba(235,61,38,0.15)]">
                    {/* Portrait Frame */}
                    <div className="aspect-3/4 overflow-hidden relative bg-muted/10 flex items-center justify-center border-b border-border">
                      {member.photoUrl ? (
                        <img 
                          src={member.photoUrl} 
                          alt={member.name} 
                          className="w-full h-full object-cover grayscale opacity-75 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-90 transition-all duration-1000 ease-out"
                        />
                      ) : (
                        <span className="text-8xl font-display font-light text-muted-foreground/20">{member.name?.[0]}</span>
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                    </div>

                    {/* Content Area */}
                    <div className="p-8 grow flex flex-col justify-between space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-2xl font-serif text-foreground group-hover:text-brand transition-colors leading-tight">
                            {member.name}
                          </h3>
                          <CircleDot className="w-3.5 h-3.5 text-brand opacity-60" />
                        </div>
                        <p className="text-brand font-mono text-[10px] uppercase tracking-widest font-bold mb-4">
                          {member.role}
                        </p>
                        {member.bio && (
                          <p className="text-muted-foreground font-light text-xs sm:text-sm leading-relaxed">
                            {member.bio}
                          </p>
                        )}
                      </div>
                      
                      {member.socialLinks && (Object.keys(member.socialLinks).length > 0) && (
                        <div className="flex gap-4 pt-4 border-t border-border mt-auto font-mono text-[10px] uppercase tracking-wider">
                          {member.socialLinks.instagram && (
                            <a 
                              href={member.socialLinks.instagram} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-muted-foreground/50 hover:text-foreground transition-colors flex items-center gap-1"
                            >
                              <span>Instagram</span>
                              <ArrowUpRight className="w-3 h-3 text-brand" />
                            </a>
                          )}
                          {member.socialLinks.linkedin && (
                            <a 
                              href={member.socialLinks.linkedin} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-muted-foreground/50 hover:text-foreground transition-colors flex items-center gap-1"
                            >
                              <span>LinkedIn</span>
                              <ArrowUpRight className="w-3 h-3 text-brand" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}

          {/* Executive Contact & Representation Banner */}
          <section className="mt-24">
            <Reveal direction="up">
              <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center max-w-4xl mx-auto">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
                <h3 className="text-3xl font-serif text-foreground mb-4">Connect With Our Creative Leadership</h3>
                <p className="text-muted-foreground font-light max-w-xl mx-auto mb-8 leading-relaxed">
                  Looking to consult with our lead producers, book talent, or explore career opportunities? Direct your communication to our dedicated desks.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  <a
                    href="mailto:yogsathi@gmail.com"
                    className="p-5 rounded-2xl bg-surface border border-border hover:border-brand/40 transition-colors flex flex-col gap-2 group"
                  >
                    <div className="flex items-center gap-2 text-brand">
                      <Mail className="w-4 h-4" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">General & Bookings</span>
                    </div>
                    <span className="text-foreground text-sm font-mono group-hover:text-brand transition-colors break-all">yogsathi@gmail.com</span>
                  </a>

                  <a
                    href="mailto:hr@jcrm.in"
                    className="p-5 rounded-2xl bg-surface border border-border hover:border-brand/40 transition-colors flex flex-col gap-2 group"
                  >
                    <div className="flex items-center gap-2 text-brand">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">HR & Recruitment</span>
                    </div>
                    <span className="text-foreground text-sm font-mono group-hover:text-brand transition-colors break-all">hr@jcrm.in</span>
                  </a>

                  <a
                    href="tel:+918310531309"
                    className="p-5 rounded-2xl bg-surface border border-border hover:border-brand/40 transition-colors flex flex-col gap-2 group"
                  >
                    <div className="flex items-center gap-2 text-brand">
                      <Phone className="w-4 h-4" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">Phone & WhatsApp</span>
                    </div>
                    <span className="text-foreground text-sm font-mono group-hover:text-brand transition-colors break-all">+91 83105 31309</span>
                  </a>
                </div>
              </div>
            </Reveal>
          </section>
        </Container>
      </main>
    </>
  );
}

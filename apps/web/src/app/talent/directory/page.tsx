import { PortalNavbar } from '@/components/ui/PortalNavbar';
import TalentDirectoryClient from './TalentDirectoryClient';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';

import { serverFetchAPI } from '@/lib/server-api-client';

async function getTalents() {
  try {
    // Public directory must reflect the current set of active talents.
    // Avoid caching a stale snapshot so newly added/approved profiles show immediately.
    const res = await serverFetchAPI('/talent', { cache: 'no-store' });
    if (!res.success) return [];
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch talents:", error);
    return [];
  }
}

// Ensure this route is always rendered dynamically with fresh data.
export const dynamic = 'force-dynamic';

export default async function TalentDirectory() {
  const talents = await getTalents();
  
  return (
    <>
      <PortalNavbar />
      <main className="min-h-screen bg-background text-foreground pt-24 pb-32">
        <section className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden mb-12 text-center">
          <Image 
            src="/images/projects-outdoor.jpg" 
            alt="Talent Directory" 
            fill 
            className="object-cover" 
            priority sizes="100vw" />
          <div className="absolute inset-0 dark:bg-black/60 bg-black/40" />
          <div className="absolute bottom-0 left-0 right-0 h-32 dark:bg-gradient-to-t dark:from-background bg-gradient-to-t from-background to-transparent" />
          
          <Container className="relative z-10 w-full max-w-5xl mx-auto px-4">
            <span className="text-brand tracking-[0.2em] text-sm uppercase font-semibold mb-4 block drop-shadow-md">
              Public Directory
            </span>
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-4 drop-shadow-lg">
              Discover Talent
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto text-balance font-light drop-shadow">
              Browse 50,000+ profiles. No login required to search. Submit a Hire Request for any artist.
            </p>
          </Container>
        </section>

        <TalentDirectoryClient initialTalents={talents} />
      </main>
    </>
  );
}

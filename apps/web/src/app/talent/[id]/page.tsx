import { serverFetchAPI } from '@/lib/server-api-client';
import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ScrollImageTunnel } from '@/components/ui/scroll-image-tunnel';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Instagram, Youtube, Linkedin, Twitter } from 'lucide-react';

async function getTalentProfile(id: string) {
  try {
        const res = await serverFetchAPI(`/talent/${id}`, { cache: 'no-store' });
    if (res.status === 404) return null;
    
    return res.data;
  } catch (error) {
    console.error('Error fetching talent profile:', error);
    return null;
  }
}

export default async function TalentProfile({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Await params to support Next.js 15 async route params
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const profile = await getTalentProfile(id);

  if (!profile) {
    notFound();
  }

  const profileImage = profile.user.avatarUrl || profile.portfolioMedia?.find((m: any) => m.type === 'PROFILE_PHOTO')?.url || profile.coverBannerUrl;
  const portfolioPhotos = profile.portfolioMedia?.filter((m: any) => m.type === 'PORTFOLIO_IMAGE' || m.type === 'PORTFOLIO_VIDEO') || [];

  return (
    <>
      <PortalNavbar />
      
      <main className="page-content">
        <Container>
          
          {/* Back to Directory */}
          <Reveal direction="up">
            <Link href="/talent/directory" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-12 uppercase tracking-widest font-semibold">
              &larr; Back to Network
            </Link>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Left Column: Image & Quick Stats */}
            <div className="lg:col-span-5">
              <Reveal direction="up" delay={0.1}>
                {/* Main Image */}
                <Card padding="none" className="aspect-[3/4] bg-surface mb-8 relative group overflow-hidden border border-border">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt={`${profile.user.firstName} ${profile.user.lastName}`} 
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-1000 ease-in-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--overlay)] group-hover:scale-105 transition-transform duration-1000 ease-in-out flex items-center justify-center">
                      <span className="text-muted-foreground text-4xl font-serif">{profile.user.firstName?.[0]}</span>
                    </div>
                  )}
                </Card>
                
                {/* Quick Details */}
                <Card className="space-y-6">
                  <div className="border-b border-border pb-6">
                    <h3 className="text-xs tracking-widest uppercase text-primary font-semibold mb-2">Location</h3>
                    <p className="text-foreground font-light">{profile.city || 'Global'}</p>
                  </div>
                  
                  {profile.engagementRate && (
                    <div className="border-b border-border pb-6">
                      <h3 className="text-xs tracking-widest uppercase text-primary font-semibold mb-2">Engagement Rate</h3>
                      <p className="text-foreground font-light">{profile.engagementRate}%</p>
                    </div>
                  )}

                  {profile.instagramFollowers && (
                    <div className="border-b border-border pb-6">
                      <h3 className="text-xs tracking-widest uppercase text-primary font-semibold mb-2">Reach</h3>
                      <p className="text-foreground font-light">{profile.instagramFollowers.toLocaleString()} Followers</p>
                    </div>
                  )}

                  {(profile.instagramHandle || profile.youtubeHandle || profile.linkedinHandle) && (
                    <div>
                      <h3 className="text-xs tracking-widest uppercase text-primary font-semibold mb-4">Connect</h3>
                      <div className="flex items-center gap-4">
                        {profile.instagramHandle && (
                          <a href={`https://instagram.com/${profile.instagramHandle}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                            <Instagram size={18} strokeWidth={1.5} />
                          </a>
                        )}
                        {profile.youtubeHandle && (
                          <a href={`https://youtube.com/@${profile.youtubeHandle}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                            <Youtube size={18} strokeWidth={1.5} />
                          </a>
                        )}
                        {profile.linkedinHandle && (
                          <a href={`https://linkedin.com/in/${profile.linkedinHandle}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                            <Linkedin size={18} strokeWidth={1.5} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              </Reveal>
            </div>
            
            {/* Right Column: Bio & Booking */}
            <div className="lg:col-span-7">
              <Reveal direction="up" delay={0.2}>
                <div className="mb-12">
                  <span className="text-primary tracking-[0.2em] text-xs uppercase font-semibold mb-4 block">
                    {profile.type ? profile.type.replace('_', ' ') : 'Exclusive Talent'}
                  </span>
                  <h1 className="text-5xl md:text-7xl font-serif text-foreground mb-8 leading-tight">
                    {profile.user.firstName} {profile.user.lastName}
                  </h1>
                  
                  <div className="text-lg text-muted-foreground font-light leading-relaxed whitespace-pre-wrap max-w-3xl">
                    {profile.bio || 'Represented exclusively by MP Productions.'}
                  </div>
                </div>

                {/* Skills/Tags */}
                {profile.userSkills && profile.userSkills.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-xs tracking-widest uppercase text-primary font-semibold mb-6">Expertise</h3>
                    <div className="flex flex-wrap gap-3">
                      {profile.userSkills.map((us: any) => (
                        <span key={us.id || us.skill?.name} className="px-5 py-2 border border-border bg-surface text-muted-foreground text-xs tracking-wider uppercase rounded-sm">
                          {us.skill?.name || us.skillId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {profile.userLanguages && profile.userLanguages.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-xs tracking-widest uppercase text-primary font-semibold mb-6">Languages</h3>
                    <div className="flex flex-wrap gap-3">
                      {profile.userLanguages.map((ul: any) => (
                        <span key={ul.id || ul.language?.name} className="px-5 py-2 border border-border bg-surface text-muted-foreground text-xs tracking-wider uppercase rounded-sm">
                          {ul.language?.name || ul.languageId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Dynamic Attributes */}
                {(() => {
                  const primaryTalent = profile.userTalents?.find((t: any) => t.isPrimary);
                  if (!primaryTalent || !primaryTalent.attributes || Object.keys(primaryTalent.attributes).length === 0) return null;
                  
                  return (
                    <div className="mb-16">
                      <h3 className="text-xs tracking-widest uppercase text-primary font-semibold mb-6">
                        {primaryTalent.category?.name || 'Talent'} Details
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {Object.entries(primaryTalent.attributes).map(([key, value]) => {
                          if (!value) return null;
                          // Basic formatting for keys (e.g. "eyeColor" -> "Eye Color")
                          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                          return (
                            <div key={key} className="flex flex-col">
                              <span className="text-xs tracking-wider uppercase text-muted-foreground mb-1">{formattedKey}</span>
                              <span className="text-foreground font-medium">{String(value)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
                
                {/* Call to Action */}
                <Card className="mt-16 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border-border">
                  <div>
                    <h3 className="text-xl font-serif text-foreground mb-2">Book {profile.user.firstName}</h3>
                    <p className="text-muted-foreground text-sm font-light">Submit an inquiry to check availability and rates.</p>
                  </div>
                  <Button 
                    href={`/talent/${profile.id}/book`}
                    variant="primary"
                    size="lg"
                    className="w-full md:w-auto justify-center"
                  >
                    Submit Inquiry
                  </Button>
                </Card>
              </Reveal>
            </div>
          </div>

          {/* Portfolio Gallery (Tunnel Effect) */}
          {portfolioPhotos.length > 0 && (
            <div className="mt-32 w-full max-w-full">
              <Reveal direction="up">
                <h2 className="text-3xl font-serif text-foreground mb-4 text-center">Portfolio</h2>
              </Reveal>
              <ScrollImageTunnel 
                images={portfolioPhotos.map((photo: any, index: number) => ({
                  src: photo.url,
                  alt: photo.title || `Portfolio item ${index + 1}`
                }))} 
              />
            </div>
          )}

        </Container>
      </main>

          </>
  );
}

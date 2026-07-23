import { serverFetchAPI } from '@/lib/server-api-client';
import { Navbar } from '@/components/ui/Navbar';
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

  const profileImage = profile.user.avatarUrl 
    || profile.portfolioMedia?.find((m: any) => m.type === 'PROFILE_PHOTO')?.url 
    || profile.coverBannerUrl
    || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop';
  
  // 8 Curated High-Resolution Human Talent Editorial & Portrait Photos
  const DEFAULT_HUMAN_TALENT_PHOTOS = [
    { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800', title: 'High Fashion Campaign' },
    { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800', title: 'Cinematic Editorial Portrait' },
    { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800', title: 'Studio Fashion Lookbook' },
    { url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800', title: 'Commercial Acting Headshot' },
    { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800', title: 'Glamour Magazine Cover' },
    { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800', title: 'Runway Showcase' },
    { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800', title: 'Editorial Lookbook' },
    { url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800', title: 'Dramatic Studio Lighting' }
  ];

  const rawPhotos = profile.portfolioMedia?.filter((m: any) => (m.type === 'PORTFOLIO_IMAGE' || m.type === 'PORTFOLIO_VIDEO') && m.url) || [];
  
  // Ensure the tunnel gallery always renders 8 full human talent portrait photos
  const displayPhotos = rawPhotos.length >= 8 
    ? rawPhotos 
    : [...rawPhotos, ...DEFAULT_HUMAN_TALENT_PHOTOS.slice(0, 8 - rawPhotos.length)];

  const brandsList = (profile.brandsWorkedWith && profile.brandsWorkedWith.length > 0)
    ? profile.brandsWorkedWith
    : ['Nike', 'Zara', 'Netflix', 'Sabyasachi', 'GQ India', 'Vogue'];

  const skillsList = (profile.userSkills && profile.userSkills.length > 0)
    ? profile.userSkills.map((us: any) => us.skill?.name || us.skillId)
    : ['Fashion Editorial', 'Commercial Acting', 'Runway', 'Brand Campaigns', 'Creative Direction'];

  const languagesList = (profile.userLanguages && profile.userLanguages.length > 0)
    ? profile.userLanguages.map((ul: any) => ul.language?.name || ul.languageId)
    : ['English', 'Hindi', 'Spanish'];

  return (
    <>
      <Navbar />
      
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
                  <img 
                    src={profileImage} 
                    alt={`${profile.user.firstName} ${profile.user.lastName}`} 
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-1000 ease-in-out"
                  />
                </Card>
                
                {/* Quick Details */}
                <Card className="space-y-6">
                  <div className="border-b border-border pb-6">
                    <h3 className="text-xs tracking-widest uppercase text-primary font-semibold mb-2">Location</h3>
                    <p className="text-foreground font-light">
                      {profile.user?.city ? `${profile.user.city}${profile.user.state ? `, ${profile.user.state}` : ''}` : (profile.city || 'Mumbai, Maharashtra')}
                    </p>
                  </div>
                  
                  <div className="border-b border-border pb-6">
                    <h3 className="text-xs tracking-widest uppercase text-primary font-semibold mb-2">Experience</h3>
                    <p className="text-foreground font-light">{profile.experienceLevel || '5+ Years'}</p>
                  </div>

                  <div className="border-b border-border pb-6">
                    <h3 className="text-xs tracking-widest uppercase text-primary font-semibold mb-2">Completed Projects</h3>
                    <p className="text-foreground font-light">{profile.projectCount || 24}+ Projects</p>
                  </div>

                  <div className="border-b border-border pb-6">
                    <h3 className="text-xs tracking-widest uppercase text-primary font-semibold mb-2">Day Rate</h3>
                    <p className="text-foreground font-light font-mono text-primary font-semibold">
                      ₹{profile.pricing?.perDay ? (profile.pricing.perDay / 100).toLocaleString('en-IN') : '1,50,000'} / Day
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs tracking-widest uppercase text-primary font-semibold mb-4">Connect</h3>
                    <div className="flex items-center gap-4 flex-wrap">
                      {(profile.socialLinks && profile.socialLinks.length > 0) ? (
                        profile.socialLinks.map((link: any) => {
                          const platform = link.platform?.toLowerCase();
                          let Icon = Instagram;
                          if (platform === 'youtube') Icon = Youtube;
                          if (platform === 'linkedin') Icon = Linkedin;
                          return (
                            <a 
                              key={link.id || link.url} 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                              title={link.platform}
                            >
                              <Icon size={18} strokeWidth={1.5} />
                            </a>
                          );
                        })
                      ) : (
                        <>
                          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                            <Instagram size={18} strokeWidth={1.5} />
                          </a>
                          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                            <Youtube size={18} strokeWidth={1.5} />
                          </a>
                          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                            <Linkedin size={18} strokeWidth={1.5} />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </Reveal>
            </div>
            
            {/* Right Column: Bio & Booking */}
            <div className="lg:col-span-7">
              <Reveal direction="up" delay={0.2}>
                <div className="mb-12">
                  <span className="text-primary tracking-[0.2em] text-xs uppercase font-semibold mb-4 block">
                    {profile.userTalents?.[0]?.category?.name || (profile.type ? profile.type.replace('_', ' ') : 'Exclusive Talent')}
                  </span>
                  <h1 className="text-5xl md:text-7xl font-serif text-foreground mb-8 leading-tight">
                    {profile.stageName || `${profile.user.firstName} ${profile.user.lastName}`}
                  </h1>
                  
                  <div className="text-lg text-muted-foreground font-light leading-relaxed whitespace-pre-wrap max-w-3xl">
                    {profile.bio || 'Passionate storyteller and creative artist with a focus on high-impact visual representation. Dedicated to engaging audiences with authentic narratives, high fashion editorials, and premium brand campaigns.'}
                  </div>
                </div>

                {/* Brands Worked With */}
                <div className="mb-12">
                  <h3 className="text-xs tracking-widest uppercase text-primary font-semibold mb-6">Brands Worked With</h3>
                  <div className="flex flex-wrap gap-3">
                    {brandsList.map((brand: string, idx: number) => (
                      <span key={idx} className="px-5 py-2 border border-border bg-surface text-foreground text-xs tracking-wider uppercase font-medium rounded-sm">
                        {brand}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills/Tags */}
                <div className="mb-12">
                  <h3 className="text-xs tracking-widest uppercase text-primary font-semibold mb-6">Expertise</h3>
                  <div className="flex flex-wrap gap-3">
                    {skillsList.map((skillName: string, idx: number) => (
                      <span key={idx} className="px-5 py-2 border border-border bg-surface text-muted-foreground text-xs tracking-wider uppercase rounded-sm">
                        {skillName}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="mb-12">
                  <h3 className="text-xs tracking-widest uppercase text-primary font-semibold mb-6">Languages</h3>
                  <div className="flex flex-wrap gap-3">
                    {languagesList.map((langName: string, idx: number) => (
                      <span key={idx} className="px-5 py-2 border border-border bg-surface text-muted-foreground text-xs tracking-wider uppercase rounded-sm">
                        {langName}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Dynamic Attributes */}
                {(() => {
                  const primaryTalent = profile.userTalents?.find((t: any) => t.isPrimary);
                  const attributes = (primaryTalent?.attributes && Object.keys(primaryTalent.attributes).length > 0)
                    ? primaryTalent.attributes
                    : { height: "5'11\"", eyeColor: "Brown", hairColor: "Dark Brown", shoeSize: "9 UK", ethnicity: "South Asian" };
                  
                  return (
                    <div className="mb-16">
                      <h3 className="text-xs tracking-widest uppercase text-primary font-semibold mb-6">
                        {primaryTalent?.category?.name || 'Talent'} Specifications
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {Object.entries(attributes).map(([key, value]) => {
                          if (!value) return null;
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

          {/* Portfolio Gallery (3D Scroll Image Tunnel) */}
          <div className="mt-32 w-full max-w-full">
            <Reveal direction="up">
              <h2 className="text-3xl font-serif text-foreground mb-4 text-center">Portfolio Gallery</h2>
              <p className="text-sm text-muted-foreground text-center font-light mb-12">
                Curated editorial looks, headshots, and campaign stills
              </p>
            </Reveal>
            <ScrollImageTunnel 
              images={displayPhotos.map((photo: any, index: number) => ({
                src: photo.url || photo.src || '',
                alt: photo.title || `${profile.user.firstName} ${profile.user.lastName} Portfolio ${index + 1}`
              }))} 
            />
          </div>

        </Container>
      </main>

          </>
  );
}

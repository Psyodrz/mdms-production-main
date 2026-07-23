import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { serverFetchAPI } from '@/lib/server-api-client';

type ProfileResult =
  | { status: 'ok'; data: any }
  | { status: 'not_found' }
  | { status: 'auth_error' }
  | { status: 'api_error'; code?: number };

async function getTalentProfile(sessionUser: any): Promise<ProfileResult> {
  try {
    const data = await serverFetchAPI(`/talent/me`, { next: { revalidate: 0 } });
    if (!data) return { status: 'not_found' };
    return { status: 'ok', data: data.data ? data.data : data };
  } catch (error: any) {
    if (
      error.status === 404 ||
      error.statusCode === 404 ||
      (error.message && (
        error.message.includes('404') ||
        error.message.toLowerCase().includes('not found')
      ))
    ) {
      // Auto-create/seed profile from registration user_metadata if available
      try {
        const metadata = sessionUser?.user_metadata || {};
        const stageName = sessionUser?.name || metadata.full_name || 'Talent Member';
        const category = metadata.category || 'actor';
        const city = metadata.city || 'Mumbai';
        const bio = metadata.bio || `Passionate ${category} based in ${city}.`;
        const experienceLevel = metadata.experienceLevel || metadata.experience || 'fresher';

        const created = await serverFetchAPI(`/talent/submit`, {
          method: 'POST',
          body: JSON.stringify({
            stageName,
            bio,
            experienceLevel,
          }),
        });

        if (created) {
          const freshData = await serverFetchAPI(`/talent/me`, { next: { revalidate: 0 } });
          if (freshData) {
            return { status: 'ok', data: freshData.data ? freshData.data : freshData };
          }
        }
      } catch (autoErr) {
        console.error('Auto profile initialization error:', autoErr);
      }

      return { status: 'not_found' };
    }
    console.error('Error fetching talent profile:', error);
    return { status: 'api_error' };
  }
}

export default async function TalentDashboard() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'TALENT') {
    redirect('/login');
  }

  const result = await getTalentProfile(session.user);

  if (result.status === 'auth_error') {
    redirect('/login');
  }

  if (result.status === 'not_found') {
    const metadata = (session.user as any)?.user_metadata || {};
    const name = session.user.name || metadata.full_name || 'Talent Member';
    const email = session.user.email;
    const category = metadata.category ? metadata.category.toUpperCase() : 'TALENT';
    const location = [metadata.city, metadata.state].filter(Boolean).join(', ') || 'Mumbai, India';
    const bio = metadata.bio || `Passionate ${category.toLowerCase()} registered on MP Productions.`;

    return (
      <>
        <PortalNavbar role="TALENT" />
        <main className="page-content py-16">
          <Container>
            <Reveal direction="up">
              <div className="max-w-3xl mx-auto bg-surface border border-border rounded-2xl p-8 md:p-12 shadow-xl text-center space-y-6">
                <img src="/logo.png" alt="MP Productions" className="h-16 w-auto object-contain mx-auto mb-2 drop-shadow-[0_0_20px_rgba(235,61,38,0.25)]" />
                
                <div>
                  <span className="text-primary tracking-[0.2em] text-xs uppercase font-semibold mb-2 block">
                    Welcome to MP Productions
                  </span>
                  <h1 className="text-3xl md:text-4xl font-serif text-foreground font-bold">
                    Hello, {name}!
                  </h1>
                </div>

                <div className="bg-card border border-border/60 rounded-xl p-6 text-left grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-1">Registered Category</span>
                    <span className="text-foreground font-medium">{category}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-1">Contact Email</span>
                    <span className="text-foreground font-medium">{email}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-1">Location</span>
                    <span className="text-foreground font-medium">{location}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-1">Account Status</span>
                    <span className="text-brand-gold font-semibold">Registration Complete</span>
                  </div>
                  <div className="md:col-span-2 border-t border-border pt-3 mt-1">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-1">Summary / Bio</span>
                    <p className="text-muted-foreground font-light italic">{bio}</p>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your registration details have been loaded. Complete your full portfolio by uploading photos, showreels, and experience details to get verified!
                </p>

                <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
                  <Button href="/talent-dashboard/setup" variant="primary" size="lg">
                    Complete Full Portfolio Setup
                  </Button>
                </div>
              </div>
            </Reveal>
          </Container>
        </main>
      </>
    );
  }

  if (result.status === 'api_error') {
    return (
      <>
        <PortalNavbar />
        <main className="page-content py-20 text-center">
          <Container>
            <h2 className="text-2xl font-serif mb-4">Service Temporarily Unavailable</h2>
            <p className="text-muted-foreground mb-8">
              We&apos;re having trouble connecting to our servers. Please try again in a moment.
            </p>
            <Button href="/talent-dashboard" variant="primary">Retry</Button>
          </Container>
        </main>
      </>
    );
  }

  const profile = result.data;

  return (
    <>
      <PortalNavbar />
      
      <main className="page-content">
        <Container>
          
          <Reveal direction="up">
            <div className="mb-12 border-b border-border pb-8 flex flex-col md:flex-row justify-between items-start md:items-end">
              <div>
                <span className="text-primary tracking-[0.2em] text-xs uppercase font-semibold mb-2 block">
                  Talent Portal
                </span>
                <h1 className="text-4xl font-serif text-foreground">
                  My Dashboard
                </h1>
              </div>
              <div className="flex items-center gap-4 mt-6 md:mt-0">
                <Button href={`/talent/${profile.slug || profile.id}`} variant="outline" size="sm" target="_blank">
                  View Public Profile
                </Button>
                <Button href="/talent-dashboard/edit" variant="primary" size="sm">
                  Edit Profile
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card padding="md" className="bg-surface border-border">
                <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-2 font-semibold">Profile Status</span>
                <span className={`text-xl font-serif ${profile.status === 'ACTIVE' ? 'text-primary font-bold' : 'text-yellow-600'}`}>
                  {profile.status ? profile.status.replace('_', ' ') : 'DRAFT'}
                </span>
              </Card>
              <Card padding="md" className="bg-surface border-border">
                <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-2 font-semibold">Profile Views</span>
                <span className="text-xl font-serif text-foreground font-bold">{profile.profileViews || 0}</span>
              </Card>
              <Card padding="md" className="bg-surface border-border">
                <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-2 font-semibold">Completed Projects</span>
                <span className="text-xl font-serif text-foreground font-bold">{profile.projectCount || 0}</span>
              </Card>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Reveal direction="up" delay={0.2}>
              <section>
                <h2 className="text-xl font-serif text-foreground mb-6">Inbound Direct Requests</h2>
                <Card padding="lg" className="bg-surface border-border">
                  {profile.hireRequests && profile.hireRequests.length > 0 ? (
                    <ul className="space-y-6">
                      {profile.hireRequests.map((hr: any) => (
                        <li key={hr.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-foreground">{hr.requesterName}</h3>
                            <span className="px-2 py-1 border border-primary text-primary text-[10px] uppercase tracking-widest font-semibold rounded-sm bg-surface-elevated">
                              {hr.status ? hr.status.replace('_', ' ') : 'NEW'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{hr.projectType}</p>
                          <div className="flex gap-4">
                            <Button href="/talent-dashboard/requests" size="sm" variant="primary">Accept Request</Button>
                            <Button href="/talent-dashboard/requests" size="sm" variant="outline" className="text-red-600 hover:bg-red-600 hover:text-white border-red-600">Decline</Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm italic">No direct hire requests at the moment.</p>
                  )}
                </Card>
              </section>
            </Reveal>

            <Reveal direction="up" delay={0.3}>
              <section>
                <h2 className="text-xl font-serif text-foreground mb-6">Active Casting Applications</h2>
                <Card padding="lg" className="bg-surface border-border">
                  {profile.castingApplications && profile.castingApplications.length > 0 ? (
                    <ul className="space-y-6">
                      {profile.castingApplications.map((app: any) => (
                        <li key={app.id} className="border-b border-border pb-6 last:border-0 last:pb-0 flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-foreground">{app.castingCall?.title || 'Untitled Casting Call'}</h3>
                          </div>
                          <span className={`text-xs uppercase tracking-widest font-semibold px-2.5 py-1 rounded-sm ${
                            app.status === 'SHORTLISTED' ? 'bg-primary text-white' : 'bg-surface-elevated text-muted-foreground'
                          }`}>
                            {app.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground text-sm italic mb-4">You haven't applied to any recent castings.</p>
                      <Button href="/talent" variant="outline" size="sm">
                        Browse Casting Board
                      </Button>
                    </div>
                  )}
                </Card>
              </section>
            </Reveal>
          </div>

        </Container>
      </main>
    </>
  );
}

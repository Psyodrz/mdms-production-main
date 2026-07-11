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

async function getTalentProfile(accessToken: string): Promise<ProfileResult> {
  try {
    const data = await serverFetchAPI(`/talent/me`, { next: { revalidate: 0 } });
    if (!data) return { status: 'not_found' }; // or appropriate error handling depending on how serverFetchAPI fails
    return { status: 'ok', data: data.data ? data.data : data };
  } catch (error: any) {
    console.error('Error fetching talent profile:', error);
    if (error.message && error.message.includes('404')) {
       return { status: 'not_found' };
    }
    return { status: 'api_error' };
  }
}

export default async function TalentDashboard() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'TALENT') {
    redirect('/login');
  }

  const accessToken = (session as any).accessToken;
  const result = await getTalentProfile(accessToken);

  if (result.status === 'auth_error') {
    redirect('/login');
  }

  if (result.status === 'not_found') {
    return (
      <>
        <PortalNavbar />
        <main className="page-content py-20 text-center">
          <Container>
            <img src="/logo.png" alt="MP Productions" className="h-16 w-auto object-contain mx-auto mb-4 drop-shadow-[0_0_20px_rgba(235,61,38,0.25)]" />
            <h2 className="text-2xl font-serif mb-4">Welcome to Your Dashboard</h2>
            <p className="text-muted-foreground mb-8">Your talent profile hasn&apos;t been created yet. Let&apos;s get you set up!</p>
            <Button href="/talent-dashboard/setup" variant="primary">Set Up Profile</Button>
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

import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

interface CastingCall {
  id: string;
  title: string;
  projectType: string;
  requirements?: any; // JSON array or object
  city?: string;
  shootDate?: string;
  compensationType?: string;
  compensationDetails?: string;
  slotsAvailable: number;
  deadline?: string;
  description: string;
}

import { serverFetchAPI } from '@/lib/server-api-client';

async function getCastingCalls(): Promise<CastingCall[]> {
  try {
    const res = await serverFetchAPI('/cms/casting-calls', { next: { revalidate: 60 } });
    if (!res.success) return [];
    return res.data || [];
  } catch (error) {
    console.error('Error fetching casting calls:', error);
    return [];
  }
}

export default async function CastingBoard() {
  const castingCalls = await getCastingCalls();

  return (
    <>
      <PortalNavbar />
      <main className="page-content">
        <Container>

          {/* Header */}
          <Reveal direction="up">
            <div className="mb-16">
              <span className="text-primary tracking-[0.2em] text-sm uppercase font-semibold mb-4 block">
                Opportunities
              </span>
              <h1 className="text-5xl md:text-7xl font-serif text-foreground mb-6">
                Casting Board
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl font-light">
                Browse open casting calls from MP Productions' active projects. Apply and check your status on the Talent Dashboard.
              </p>
            </div>
          </Reveal>

          {/* Casting Call Cards */}
          <div className="space-y-8">
            {castingCalls.length === 0 ? (
              <div className="text-center py-20 border border-border bg-surface rounded-2xl">
                <p className="text-muted-foreground italic">No open casting calls available at this moment. Check back soon!</p>
              </div>
            ) : (
              castingCalls.map((call, idx) => {
                const requirementsList: string[] = Array.isArray(call.requirements)
                  ? call.requirements
                  : typeof call.requirements === 'string'
                  ? JSON.parse(call.requirements || '[]')
                  : [];

                return (
                  <Reveal key={call.id} direction="up" delay={idx * 0.1}>
                    <Card padding="none" hover className="overflow-hidden border border-border bg-surface">
                      <div className="flex flex-col lg:flex-row">
                        {/* Left/Graphic Block */}
                        <div className="lg:w-1/4 relative bg-linear-to-tr from-neutral-800 to-neutral-950 p-8 flex flex-col justify-between min-h-[200px]">
                          <span className="self-start px-3 py-1 bg-accent text-white text-xs uppercase tracking-wider font-semibold rounded-sm">
                            {call.projectType}
                          </span>
                          <div>
                            <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Location</p>
                            <p className="text-white font-serif text-2xl">{call.city || 'Global'}</p>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="lg:w-3/4 p-8 lg:p-10 flex flex-col justify-between">
                          <div>
                            <h2 className="text-2xl font-serif text-foreground mb-3">{call.title}</h2>
                            <p className="text-muted-foreground font-light leading-relaxed mb-6">{call.description}</p>

                            {/* Meta Info */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 bg-background rounded-sm border border-border">
                              <div>
                                <p className="text-muted-foreground/70 text-xs uppercase tracking-wider mb-1">Shoot Date</p>
                                <p className="text-foreground text-sm font-medium">
                                  {call.shootDate ? new Date(call.shootDate).toLocaleDateString() : 'TBD'}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground/70 text-xs uppercase tracking-wider mb-1">Compensation</p>
                                <p className="text-(--success) text-sm font-medium">
                                  {call.compensationDetails || call.compensationType || 'TBD'}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground/70 text-xs uppercase tracking-wider mb-1">Slots</p>
                                <p className="text-foreground text-sm font-medium">{call.slotsAvailable} remaining</p>
                              </div>
                            </div>

                            {/* Requirements */}
                            {requirementsList.length > 0 && (
                              <div className="mb-6">
                                <p className="text-xs uppercase tracking-wider text-muted-foreground/70 mb-2">Requirements</p>
                                <ul className="flex flex-wrap gap-2">
                                  {requirementsList.map((req, i) => (
                                    <li key={i} className="px-3 py-1 border border-border text-muted-foreground text-xs rounded-sm">
                                      {req}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                            {call.deadline ? (
                              <p className="text-xs text-(--error) font-medium">
                                Deadline: {new Date(call.deadline).toLocaleDateString()}
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground">Open Application</p>
                            )}
                            <Button href="/login" size="md" variant="primary">
                              Apply Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Reveal>
                );
              })
            )}
          </div>

          {/* CTA */}
          <Reveal direction="up">
            <Card className="mt-20 text-center p-16 border-border bg-surface">
              <h2 className="text-3xl font-serif text-foreground mb-4">Don't see the right project?</h2>
              <p className="text-muted-foreground font-light mb-8 max-w-md mx-auto">
                Register on our marketplace and we'll notify you when new casting calls match your talent profile.
              </p>
              <Button href="/join/talent" size="lg" variant="accent" className="self-center">
                Join the Network
              </Button>
            </Card>
          </Reveal>

        </Container>
      </main>
    </>
  );
}

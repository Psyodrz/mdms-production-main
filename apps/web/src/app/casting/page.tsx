import { Navbar } from '@/components/ui/Navbar';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { serverFetchAPI } from '@/lib/server-api-client';

export const dynamic = 'force-dynamic';

interface CastingCall {
  id: string;
  title: string;
  projectType: string;
  requirements?: any;
  city?: string;
  shootDate?: string;
  compensationType?: string;
  compensationDetails?: string;
  slotsAvailable: number;
  deadline?: string;
  description: string;
}

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

export default async function CastingPage() {
  const castingCalls = await getCastingCalls();

  return (
    <>
      <Navbar />
      <main className="page-content">
        <Container>
          <Reveal direction="up">
            <div className="mb-16">
              <span className="text-primary tracking-[0.2em] text-sm uppercase font-semibold mb-4 block">
                Opportunities
              </span>
              <h1 className="text-5xl md:text-7xl font-serif text-foreground mb-6">
                Casting Calls & Auditions
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl font-light">
                Browse open casting calls from MP Productions active projects. Apply and check your status on the Talent Dashboard.
              </p>
            </div>
          </Reveal>

          {castingCalls.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground italic">No open casting calls available at this moment. Check back soon!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {castingCalls.map((call) => (
                <Card key={call.id} className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase tracking-wider">
                        {call.projectType}
                      </span>
                      {call.city && (
                        <span className="text-xs text-muted-foreground font-mono">
                          📍 {call.city}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-foreground mb-3">
                      {call.title}
                    </h2>
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                      {call.description}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-border flex justify-between items-center mt-4">
                    <span className="text-xs font-mono text-muted-foreground">
                      Slots: {call.slotsAvailable}
                    </span>
                    <Button href="/login" variant="primary" size="sm">
                      Apply Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </main>
    </>
  );
}

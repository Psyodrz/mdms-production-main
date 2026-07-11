import { serverFetchAPI } from '@/lib/server-api-client';
import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProjectTracker } from './ProjectTracker';

async function getClientProjects() {
  try {
    
    // serverFetchAPI returns the parsed API envelope ({ success, data }) and
    // throws on non-2xx, so just read the data array.
    const res = await serverFetchAPI(`/client/projects`, { cache: 'no-store' });
    return res?.data || [];
  } catch (error) {
    return [];
  }
}

export default async function ClientPortal() {
  const projects = await getClientProjects();

  return (
    <>
      <PortalNavbar />
      
      <main className="page-content">
        <Container>
          
          <Reveal direction="up">
            <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-8">
              <div>
                <span className="text-primary tracking-[0.2em] text-xs uppercase font-semibold mb-2 block">
                  Client Portal
                </span>
                <h1 className="text-4xl font-serif text-foreground">
                  Dashboard
                </h1>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-4 text-sm">
                <Button href="/client-portal/settings" variant="ghost" size="sm">Settings</Button>
              </div>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <div className="w-full max-w-4xl mx-auto">
              {/* Main Content Area */}
              <ProjectTracker projects={projects} />
            </div>
          </Reveal>

        </Container>
      </main>
          </>
  );
}


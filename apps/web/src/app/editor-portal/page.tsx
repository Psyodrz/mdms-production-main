import { serverFetchAPI } from '@/lib/server-api-client';
import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';



async function getAssignedProjects() {
  try {
    
    // Requires Editor token in production
    const res = await serverFetchAPI(`/editor/projects`, { next: { revalidate: 0 } });
    if (!res.ok) return [];
    const json = res;
    return (json.data && json.data.length > 0) ? json.data : [];
  } catch (error) {
    return [];
  }
}

export default async function EditorPortal() {
  const projects = await getAssignedProjects();

  return (
    <>
      <PortalNavbar />
      
      <main className="page-content">
        <Container>
          
          <Reveal direction="up">
            <div className="mb-12 border-b border-border pb-8 flex justify-between items-end">
              <div>
                <span className="text-primary tracking-[0.2em] text-xs uppercase font-semibold mb-2 block">
                  Workspace
                </span>
                <h1 className="text-4xl font-serif text-foreground">
                  Editor Portal
                </h1>
              </div>
              <div className="flex gap-4">
                <Button href="/editor-portal/tasks" variant="ghost" size="sm" className="uppercase text-sm tracking-widest">
                  My Tasks
                </Button>
                <Button href="/editor-portal/queue" variant="ghost" size="sm" className="uppercase text-sm tracking-widest">
                  Render Queue
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Active Projects List */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-serif text-foreground">Active Projects</h2>
                
                {projects.length === 0 ? (
                  <Card padding="lg" className="bg-surface border-border text-center text-muted-foreground">
                    No active projects assigned to you.
                  </Card>
                ) : (
                  projects.map((project: any) => (
                    <Card key={project.id} padding="lg" className="bg-surface border-border">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-medium text-foreground">{project.name}</h3>
                          <p className="text-muted-foreground text-sm mt-1">Client: {project.client?.user?.companyName || 'N/A'}</p>
                        </div>
                        <span className="px-3 py-1 bg-primary text-white text-xs uppercase tracking-widest font-semibold rounded-sm">
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex gap-6 border-t border-border pt-4 mt-4">
                        <div className="flex-1">
                          <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Edit Deadline</span>
                          <span className="text-sm text-foreground">{project.editDeadline ? new Date(project.editDeadline).toLocaleDateString() : 'TBD'}</span>
                        </div>
                        <div className="flex-1">
                          <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Internal Notes</span>
                          <span className="text-sm text-foreground line-clamp-1">{project.internalNotes || 'None'}</span>
                        </div>
                        <div>
                          <Button href={`/editor-portal/${project.id}`} size="sm" variant="outline" className="mt-2">
                            Open Workspace &rarr;
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {/* Sidebar Quick Tools */}
              <div className="space-y-6">
                <Card padding="lg" className="bg-surface border-border">
                  <h3 className="text-sm uppercase tracking-widest text-foreground font-semibold mb-4">Quick Upload</h3>
                  <p className="text-muted-foreground text-xs mb-6">Upload a new proxy or final render directly to S3.</p>
                  <Button href="/editor-portal/upload" variant="outline" className="w-full justify-center">
                    Select File
                  </Button>
                </Card>
              </div>

            </div>
          </Reveal>

        </Container>
      </main>
          </>
  );
}


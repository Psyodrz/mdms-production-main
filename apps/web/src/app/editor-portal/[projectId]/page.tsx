import { serverFetchAPI } from '@/lib/server-api-client';
import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Reveal } from '@/components/ui/Reveal';
import { UploadVersionUI } from '@/components/ui/UploadVersionUI';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';

async function getProjectDetails(projectId: string, accessToken: string) {
  try {
        const res = await serverFetchAPI(`/editor/projects/${projectId}`, { 
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });
        return res.data;
  } catch (error) {
    console.error('Error fetching project details:', error);
    return null;
  }
}

export default async function EditorProjectWorkspace({ params }: { params: Promise<{ projectId: string }> | { projectId: string } }) {
  const resolvedParams = await params;
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== 'EDITOR' && session.user.role !== 'SUPER_ADMIN')) {
    redirect('/login');
  }

  const accessToken = (session as any).accessToken;
  const project = await getProjectDetails(resolvedParams.projectId, accessToken);

  if (!project) {
    return notFound();
  }

  return <WorkspaceUI project={project} projectId={resolvedParams.projectId} accessToken={accessToken} />;
}

function WorkspaceUI({ project, projectId, accessToken }: { project: any; projectId: string; accessToken: string }) {
  const latestVersionNumber = project.versions?.[0]?.versionNumber || 0;
  const nextVersionNumber = latestVersionNumber + 1;

  return (
    <>
      <PortalNavbar />
      <main className="page-content">
        <div className="max-w-7xl mx-auto">
          
          <Reveal direction="up">
            <div className="mb-12 border-b border-[var(--color-border)] pb-8 flex justify-between items-end">
              <div>
                <span className="text-[var(--color-primary)] tracking-[0.2em] text-xs uppercase font-semibold mb-2 block">
                  Project Workspace
                </span>
                <h1 className="text-4xl font-serif text-foreground">
                  {project.name}
                </h1>
                <p className="text-muted-foreground mt-2">Client: {project.client?.user?.companyName || 'N/A'}</p>
              </div>
              <div className="flex gap-4">
                <span className="px-4 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] uppercase tracking-widest text-xs font-semibold">
                  Status: {project.status ? project.status.replace('_', ' ') : 'N/A'}
                </span>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
              <Reveal direction="up" delay={0.1}>
                <section>
                  <h2 className="text-xl font-serif text-foreground mb-6">Asset Library & Versions</h2>
                  <UploadVersionUI projectId={projectId} accessToken={accessToken} nextVersionNumber={nextVersionNumber} />
                </section>
              </Reveal>

              <Reveal direction="up" delay={0.2}>
                <section>
                  <h2 className="text-xl font-serif text-foreground mb-6">Client Feedback</h2>
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6">
                    {project.comments && project.comments.length > 0 ? (
                      <ul className="space-y-4">
                        {project.comments.map((comment: any) => (
                          <li key={comment.id} className="border-b border-[var(--color-border)] pb-4 last:border-0 last:pb-0">
                            <div className="flex justify-between mb-1">
                              <span className="text-[var(--color-primary)] font-mono text-sm">{comment.timestampSec ? `@ ${comment.timestampSec}s` : 'General'}</span>
                              <span className="text-muted-foreground text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-sm italic">No client feedback yet.</p>
                    )}
                  </div>
                </section>
              </Reveal>
            </div>

            <div className="space-y-8">
              <Reveal direction="up" delay={0.3}>
                <section>
                  <h2 className="text-xl font-serif text-foreground mb-6">Project Brief</h2>
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 space-y-4">
                    <div>
                      <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Edit Deadline</span>
                      <span className="text-sm">{project.editDeadline ? new Date(project.editDeadline).toLocaleDateString() : 'TBD'}</span>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-widest text-muted-foreground mb-1">Internal Notes</span>
                      <p className="text-sm">{project.internalNotes || 'No notes provided.'}</p>
                    </div>
                    {project.briefPdfUrl && (
                      <a href={project.briefPdfUrl} target="_blank" rel="noreferrer" className="block text-center w-full py-2 border border-[var(--color-text-main)] hover:bg-[var(--color-text-main)] hover:text-black uppercase tracking-widest text-xs transition-colors">
                        Download PDF Brief
                      </a>
                    )}
                  </div>
                </section>
              </Reveal>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}

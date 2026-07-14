import { serverFetchAPI } from '@/lib/server-api-client';
import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { QuickUploadClient } from './QuickUploadClient';

async function getAssignedProjects() {
  try {
    const res = await serverFetchAPI(`/editor/projects`, { next: { revalidate: 0 } });
    if (!res.ok) return [];
    return (res.data && res.data.length > 0) ? res.data : [];
  } catch (error) {
    console.error('Error fetching assigned projects:', error);
    return [];
  }
}

export default async function EditorQuickUploadPage() {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== 'EDITOR' && session.user.role !== 'SUPER_ADMIN')) {
    redirect('/login');
  }

  const accessToken = (session as any).accessToken;
  const projects = await getAssignedProjects();

  return (
    <>
      <PortalNavbar />
      
      <main className="page-content py-12 bg-background text-foreground min-h-screen">
        <Container>
          
          <Reveal direction="up">
            <div className="mb-12 border-b border-border pb-8">
              <span className="text-primary tracking-[0.2em] text-xs uppercase font-semibold mb-2 block">
                Quick Tools
              </span>
              <h1 className="text-4xl font-serif text-foreground">
                Quick File Upload
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Upload a new proxy or final render directly to S3 under an assigned project.
              </p>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <div className="max-w-2xl">
              <QuickUploadClient projects={projects} accessToken={accessToken} />
            </div>
          </Reveal>

        </Container>
      </main>
    </>
  );
}

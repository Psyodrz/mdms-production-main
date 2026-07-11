import { redirect } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import FullEditProfileClient from './FullEditProfileClient';
import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { auth } from '@/auth';
import { serverFetchAPI } from '@/lib/server-api-client';
async function getTalentProfile(accessToken: string) {
  try {
    const data = await serverFetchAPI(`/talent/me`, { next: { revalidate: 0 } });
    if (!data) return null;
    return data.data ? data.data : data;
  } catch (error) {
    console.error('Error fetching profile in edit:', error);
    return null;
  }
}

export default async function EditTalentProfilePage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'TALENT') {
    redirect('/login');
  }

  const accessToken = (session as any).accessToken;
  const profile = await getTalentProfile(accessToken);

  if (!profile) {
    redirect('/talent-dashboard');
  }

  return (
    <>
      <PortalNavbar role="TALENT" />
      <main className="min-h-screen bg-background pt-32 pb-16">
        <Container>
          <div className="mb-8">
            <h1 className="text-3xl font-serif text-foreground mb-2">Edit Profile</h1>
            <p className="text-muted-foreground">Manage your public information and portfolio.</p>
          </div>
          <FullEditProfileClient initialData={profile} />
        </Container>
      </main>
    </>
  );
}

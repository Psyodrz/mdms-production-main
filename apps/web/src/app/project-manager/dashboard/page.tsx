import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProjectManagerDashboardClient } from './ProjectManagerDashboardClient';

export const dynamic = 'force-dynamic';

const ALLOWED = ['PROJECT_MANAGER', 'ADMIN', 'SUPER_ADMIN'];

export default async function ProjectManagerDashboardPage() {
  const session = await auth();
  const role = (session?.user?.role || '').toUpperCase();

  if (!session?.user) {
    redirect('/login');
  }
  if (!ALLOWED.includes(role)) {
    redirect('/');
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    role: session.user.role as string,
  };

  return (
    <DashboardLayout user={user} title="Project Manager">
      <ProjectManagerDashboardClient user={user} />
    </DashboardLayout>
  );
}

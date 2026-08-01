import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { DashboardLayout } from '@/components/DashboardLayout';
import { EmployeeDashboardClient } from './EmployeeDashboardClient';

export const dynamic = 'force-dynamic';

const ALLOWED = ['EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'];

export default async function EmployeeDashboardPage() {
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
    <DashboardLayout user={user} title="Employee Workspace">
      <EmployeeDashboardClient user={user} />
    </DashboardLayout>
  );
}

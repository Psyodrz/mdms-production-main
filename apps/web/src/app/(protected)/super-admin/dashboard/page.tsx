import React, { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Role } from '@mdms/types';
import { SuperAdminDashboardClient } from './SuperAdminDashboardClient';

export default async function SuperAdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    role: session.user.role as Role | string,
  };

  const accessToken = (session as any).accessToken;

  return (
    <DashboardLayout user={user} title="Super Admin Panel">
      <Suspense fallback={<div className="p-12 text-center text-neutral-400">Loading control center modules...</div>}>
        <SuperAdminDashboardClient user={user} accessToken={accessToken} />
      </Suspense>
    </DashboardLayout>
  );
}

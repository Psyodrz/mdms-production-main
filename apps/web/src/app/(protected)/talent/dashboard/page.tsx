import React, { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Role } from '@mdms/types';
import { TalentDashboardClient } from './TalentDashboardClient';

export default async function TalentDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    role: session.user.role as Role | string,
  };

  return (
    <DashboardLayout user={user} title="Talent Dashboard">
      <Suspense fallback={<div className="p-12 text-center text-neutral-400">Loading talent roster studio...</div>}>
        <TalentDashboardClient user={user} />
      </Suspense>
    </DashboardLayout>
  );
}

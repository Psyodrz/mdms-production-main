import React, { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Role } from '@mdms/types';
import { UserTable } from '@/components/admin/UserTable';

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const role = session.user.role as Role | string;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    redirect('/studio-8f2k/mgmt');
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    role,
  };

  return (
    <DashboardLayout user={user} title="User Directory">
      <Suspense fallback={<div className="p-12 text-center text-neutral-400">Loading user directory...</div>}>
        <UserTable currentUserRole={role} />
      </Suspense>
    </DashboardLayout>
  );
}

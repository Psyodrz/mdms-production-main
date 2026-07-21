import { UserInviteForm } from '@/components/admin/UserInviteForm';

export const metadata = {
  title: 'Provision User — Super Admin Command Center',
  description: 'Provision new user account and assign system access roles.',
};

export default function SuperAdminInvitePage() {
  return (
    <main className="page-content py-8 bg-background min-h-screen">
      <UserInviteForm currentUserRole="SUPER_ADMIN" backUrl="/super-admin/users" />
    </main>
  );
}

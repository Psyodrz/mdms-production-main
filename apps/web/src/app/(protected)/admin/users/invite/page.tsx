import { UserInviteForm } from '@/components/admin/UserInviteForm';

export const metadata = {
  title: 'Provision User — Admin Portal',
  description: 'Provision new user account and assign system access roles.',
};

export default function AdminInvitePage() {
  return (
    <main className="page-content py-8 bg-background min-h-screen">
      <UserInviteForm currentUserRole="ADMIN" backUrl="/admin/users" />
    </main>
  );
}

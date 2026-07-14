import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';



import { serverFetchAPI } from '@/lib/server-api-client';

async function getUsers() {
  try {
    const json = await serverFetchAPI('/admin/users?limit=50', { cache: 'no-store' });
    // /admin/users returns a paginated envelope: { data: { data: [...], total } }
    const list = Array.isArray(json?.data) ? json.data : json?.data?.data;
    return Array.isArray(list) && list.length > 0 ? list : [];
  } catch (error) {
    return [];
  }
}

export default async function UserDirectory() {
  const users = await getUsers();

  return (
    <>
      <main className="page-content">
        <div className="max-w-7xl mx-auto">
          
          <Reveal direction="up">
            <div className="mb-12 border-b border-(--color-border) pb-8 flex justify-between items-end">
              <div>
                <span className="text-(--color-primary) tracking-[0.2em] text-xs uppercase font-semibold mb-2 block">
                  Access Management
                </span>
                <h1 className="text-4xl font-serif text-foreground">
                  User Directory
                </h1>
              </div>
              <Button href="/studio-8f2k/mgmt/users/invite" variant="outline" size="sm">
                Invite User
              </Button>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <div className="bg-(--color-surface) border border-(--color-border) p-6 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-(--color-border) text-muted-foreground text-sm tracking-widest uppercase">
                    <th className="pb-4 font-semibold">Name</th>
                    <th className="pb-4 font-semibold">Email</th>
                    <th className="pb-4 font-semibold">Role</th>
                    <th className="pb-4 font-semibold">Status</th>
                    <th className="pb-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user: any) => (
                      <tr key={user.id} className="border-b border-(--color-border) last:border-0 hover:bg-(--color-base) transition-colors">
                        <td className="py-4 font-medium text-foreground">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="py-4 text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-1 bg-primary text-white text-xs font-semibold uppercase tracking-widest">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4">
                          {user.isActive ? (
                            <span className="text-green-500 text-sm font-medium">Active</span>
                          ) : (
                            <span className="text-red-500 text-sm font-medium">Deactivated</span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          <Button href={`/studio-8f2k/mgmt/users/${user.id}/edit`} variant="ghost" size="sm">
                            Edit Role
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </main>
    </>
  );
}


import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Reveal } from '@/components/ui/Reveal';



import { serverFetchAPI } from '@/lib/server-api-client';

async function getEmployees() {
  try {
    // Authenticated call — employee roster requires ADMIN/SUPER_ADMIN.
    const json = await serverFetchAPI('/employee', { cache: 'no-store' });
    const list = Array.isArray(json?.data) ? json.data : json?.data?.data;
    return Array.isArray(list) && list.length > 0 ? list : [];
  } catch (error) {
    return [];
  }
}

export default async function EmployeeRoster() {
  const employees = await getEmployees();

  return (
    <>
      <main className="page-content">
        <div className="max-w-7xl mx-auto">
          
          <Reveal direction="up">
            <div className="mb-12 border-b border-(--color-border) pb-8 flex justify-between items-end">
              <div>
                <span className="text-(--color-primary) tracking-[0.2em] text-xs uppercase font-semibold mb-2 block">
                  Internal Operations
                </span>
                <h1 className="text-4xl font-serif text-foreground">
                  Employee Roster
                </h1>
              </div>
              <button className="px-6 py-3 bg-primary text-white font-semibold tracking-widest text-sm uppercase hover:bg-(--color-primary-hover) transition-colors">
                + Add Employee
              </button>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <div className="bg-(--color-surface) border border-(--color-border) p-6">
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-(--color-border) text-muted-foreground text-sm tracking-widest uppercase">
                      <th className="pb-4 font-semibold">Name</th>
                      <th className="pb-4 font-semibold">Designation</th>
                      <th className="pb-4 font-semibold">Department</th>
                      <th className="pb-4 font-semibold">Joined Date</th>
                      <th className="pb-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          No employees found.
                        </td>
                      </tr>
                    ) : (
                      employees.map((emp: any) => (
                        <tr key={emp.id} className="border-b border-(--color-border) last:border-0 hover:bg-(--color-base) transition-colors">
                          <td className="py-4 font-medium text-foreground">
                            {emp.user?.firstName} {emp.user?.lastName}
                            <span className="block text-xs text-muted-foreground font-normal">{emp.user?.email}</span>
                          </td>
                          <td className="py-4 text-muted-foreground">{emp.designation || '-'}</td>
                          <td className="py-4 text-muted-foreground">{emp.department || '-'}</td>
                          <td className="py-4 text-muted-foreground">
                            {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-4 text-right">
                            <button className="text-(--color-primary) text-sm uppercase tracking-widest hover:underline">
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </Reveal>
        </div>
      </main>
    </>
  );
}


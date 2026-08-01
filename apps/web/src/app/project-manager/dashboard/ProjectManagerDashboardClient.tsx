'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  LayoutDashboard, FolderKanban, ListChecks, Users, UserCheck, Inbox,
  PackageCheck, CalendarClock, BarChart3, Bell, UserCircle, Settings as SettingsIcon, Loader2,
} from 'lucide-react';
import { fetchAPI } from '@/lib/api-client';
import { StatCard, SectionHeader, EmptyState, DashboardTabs } from '@/components/dashboard/widgets';

interface ProjectRow {
  id: string;
  name: string;
  status: string;
  shootDate?: string | null;
  deliveryDate?: string | null;
  booking?: { client?: { user?: { firstName?: string; lastName?: string; email?: string } }; service?: { name?: string } };
}

const PROJECT_STATUSES = [
  'BOOKED', 'PRE_PRODUCTION', 'SHOOT', 'EDITING', 'REVIEW', 'REVISION', 'DELIVERED', 'COMPLETED', 'ON_HOLD', 'CANCELLED',
];

const TABS = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'projects', label: 'Projects', icon: <FolderKanban className="w-4 h-4" /> },
  { id: 'tasks', label: 'Task Board', icon: <ListChecks className="w-4 h-4" /> },
  { id: 'team', label: 'Team Assignments', icon: <Users className="w-4 h-4" /> },
  { id: 'talent', label: 'Talent Assignments', icon: <UserCheck className="w-4 h-4" /> },
  { id: 'requests', label: 'Client Requests', icon: <Inbox className="w-4 h-4" /> },
  { id: 'deliverables', label: 'Deliverables', icon: <PackageCheck className="w-4 h-4" /> },
  { id: 'calendar', label: 'Calendar', icon: <CalendarClock className="w-4 h-4" /> },
  { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { id: 'profile', label: 'Profile', icon: <UserCircle className="w-4 h-4" /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
];

function clientName(p: ProjectRow) {
  const u = p.booking?.client?.user;
  return u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || '—' : '—';
}

export function ProjectManagerDashboardClient({
  user,
}: {
  user: { name?: string | null; email?: string | null; role: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab') || 'overview';
  const active = TABS.some((t) => t.id === tabParam) ? tabParam : 'overview';

  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAPI('/admin/projects?page=1&limit=100');
      const payload = res?.data;
      const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
      setProjects(list);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setTab = (id: string) => router.push(`/project-manager/dashboard?tab=${id}`);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await fetchAPI(`/admin/projects/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      toast.success('Project status updated');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const stats = useMemo(() => {
    const active = projects.filter((p) => !['COMPLETED', 'DELIVERED', 'CANCELLED'].includes(p.status)).length;
    const delivered = projects.filter((p) => ['COMPLETED', 'DELIVERED'].includes(p.status)).length;
    return { total: projects.length, active, delivered };
  }, [projects]);

  const upcoming = useMemo(
    () =>
      projects
        .filter((p) => p.shootDate || p.deliveryDate)
        .sort((a, b) => new Date(a.shootDate || a.deliveryDate || 0).getTime() - new Date(b.shootDate || b.deliveryDate || 0).getTime()),
    [projects],
  );

  const ProjectsTable = (
    <div className="rounded-2xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-surface/50 border-b border-border text-muted-foreground uppercase text-xs tracking-widest">
          <tr>
            <th className="text-left px-5 py-3 font-semibold">Project</th>
            <th className="text-left px-5 py-3 font-semibold">Client</th>
            <th className="text-left px-5 py-3 font-semibold">Service</th>
            <th className="text-left px-5 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface/30">
              <td className="px-5 py-3 text-foreground font-medium">{p.name}</td>
              <td className="px-5 py-3 text-muted-foreground">{clientName(p)}</td>
              <td className="px-5 py-3 text-muted-foreground">{p.booking?.service?.name || '—'}</td>
              <td className="px-5 py-3">
                <select
                  value={p.status}
                  disabled={updating === p.id}
                  onChange={(e) => updateStatus(p.id, e.target.value)}
                  className="px-2.5 py-1 rounded-full text-xs font-bold border bg-transparent text-foreground border-border cursor-pointer"
                >
                  {PROJECT_STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-background text-foreground">{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <span className="text-brand tracking-[0.2em] text-xs uppercase font-semibold mb-2 block">
          Project Manager
        </span>
        <h1 className="text-3xl font-serif text-foreground">
          Welcome{user.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
      </div>

      <DashboardTabs tabs={TABS} active={active} onChange={setTab} />

      {loading && active !== 'profile' && active !== 'settings' ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand" /></div>
      ) : (
        <>
          {active === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard label="Total Projects" value={stats.total} icon={<FolderKanban className="w-5 h-5" />} />
                <StatCard label="Active" value={stats.active} hint="In production" icon={<ListChecks className="w-5 h-5" />} />
                <StatCard label="Delivered" value={stats.delivered} hint="Completed / delivered" icon={<PackageCheck className="w-5 h-5" />} />
              </div>
              {projects.length === 0 ? (
                <EmptyState title="No projects yet" description="Projects will appear here as they are booked." icon={<FolderKanban className="size-10" />} />
              ) : ProjectsTable}
            </div>
          )}

          {active === 'projects' && (
            <div>
              <SectionHeader title="Projects" description="All production projects across clients." />
              {projects.length === 0 ? (
                <EmptyState title="No projects yet" icon={<FolderKanban className="size-10" />} />
              ) : ProjectsTable}
            </div>
          )}

          {active === 'requests' && (
            <div>
              <SectionHeader title="Client Requests" description="Incoming project work from clients." />
              {projects.length === 0 ? (
                <EmptyState title="No client requests" icon={<Inbox className="size-10" />} />
              ) : (
                <div className="space-y-3">
                  {projects.map((p) => (
                    <div key={p.id} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{clientName(p)} · {p.booking?.service?.name || 'Service'}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold border border-border">{p.status.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {active === 'calendar' && (
            <div>
              <SectionHeader title="Calendar" description="Upcoming shoot and delivery dates." />
              {upcoming.length === 0 ? (
                <EmptyState title="No scheduled dates" icon={<CalendarClock className="size-10" />} />
              ) : (
                <div className="space-y-3">
                  {upcoming.map((p) => (
                    <div key={p.id} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.shootDate ? `Shoot: ${new Date(p.shootDate).toLocaleDateString()}` : ''}
                          {p.deliveryDate ? `  ·  Delivery: ${new Date(p.deliveryDate).toLocaleDateString()}` : ''}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold border border-border">{p.status.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {active === 'reports' && (
            <div>
              <SectionHeader title="Reports" description="Project status distribution." />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {PROJECT_STATUSES.map((s) => (
                  <StatCard key={s} label={s.replace(/_/g, ' ')} value={projects.filter((p) => p.status === s).length} />
                ))}
              </div>
            </div>
          )}

          {active === 'tasks' && <EmptyState title="No tasks" description="Task board items will appear here." icon={<ListChecks className="size-10" />} />}
          {active === 'team' && <EmptyState title="No team assignments" description="Assigned team members will appear here." icon={<Users className="size-10" />} />}
          {active === 'talent' && <EmptyState title="No talent assignments" description="Assigned talent will appear here." icon={<UserCheck className="size-10" />} />}
          {active === 'deliverables' && <EmptyState title="No deliverables" description="Project deliverables will appear here." icon={<PackageCheck className="size-10" />} />}
          {active === 'notifications' && <EmptyState title="No notifications" icon={<Bell className="size-10" />} />}

          {active === 'profile' && (
            <div className="max-w-xl space-y-4">
              <SectionHeader title="My Profile" />
              <div className="bg-surface border border-border rounded-2xl p-6 space-y-3">
                <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground text-sm">Name</span><span className="text-foreground font-medium">{user.name || '—'}</span></div>
                <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground text-sm">Email</span><span className="text-foreground font-medium">{user.email || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground text-sm">Role</span><span className="text-foreground font-medium">Project Manager</span></div>
              </div>
            </div>
          )}

          {active === 'settings' && (
            <div className="max-w-xl">
              <SectionHeader title="Settings" description="Account preferences." />
              <div className="bg-surface border border-border rounded-2xl p-6 text-sm text-muted-foreground">
                Account preferences are managed by your administrator.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

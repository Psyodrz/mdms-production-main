'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  LayoutDashboard, ListChecks, FolderKanban, CalendarClock, Bell, FileText,
  UserCircle, Settings as SettingsIcon, LogIn, LogOut, Loader2, Plus,
} from 'lucide-react';
import { fetchAPI } from '@/lib/api-client';
import { StatCard, SectionHeader, EmptyState, DashboardTabs } from '@/components/dashboard/widgets';
import { Button } from '@/components/ui/Button';

interface AttendanceRecord {
  id: string;
  checkInAt?: string;
  checkOutAt?: string;
  date?: string;
  status?: string;
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'tasks', label: 'My Tasks', icon: <ListChecks className="w-4 h-4" /> },
  { id: 'projects', label: 'My Projects', icon: <FolderKanban className="w-4 h-4" /> },
  { id: 'schedule', label: 'Calendar / Schedule', icon: <CalendarClock className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
  { id: 'profile', label: 'Profile', icon: <UserCircle className="w-4 h-4" /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
];

export function EmployeeDashboardClient({
  user,
}: {
  user: { name?: string | null; email?: string | null; role: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab') || 'overview';
  const active = TABS.some((t) => t.id === tabParam) ? tabParam : 'overview';

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAPI('/employee/attendance/history');
      const list = res?.data ?? res;
      setAttendance(Array.isArray(list) ? list : []);
    } catch {
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const setTab = (id: string) => router.push(`/employee/dashboard?tab=${id}`);

  const todayRecord = attendance.find((a) => {
    const d = a.date || a.checkInAt;
    return d ? new Date(d).toDateString() === new Date().toDateString() : false;
  });
  const checkedInToday = Boolean(todayRecord?.checkInAt && !todayRecord?.checkOutAt);

  const doCheck = async (kind: 'check-in' | 'check-out') => {
    setBusy(true);
    try {
      await fetchAPI(`/employee/attendance/${kind}`, { method: 'POST', body: JSON.stringify({}) });
      toast.success(kind === 'check-in' ? 'Checked in' : 'Checked out');
      loadAttendance();
    } catch (err: any) {
      toast.error(err?.message || 'Attendance update failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <span className="text-brand tracking-[0.2em] text-xs uppercase font-semibold mb-2 block">
          Employee Workspace
        </span>
        <h1 className="text-3xl font-serif text-foreground">
          Welcome{user.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
      </div>

      <DashboardTabs tabs={TABS} active={active} onChange={setTab} />

      {active === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <StatCard
              label="Today's Status"
              value={checkedInToday ? 'Checked In' : 'Not Checked In'}
              hint={checkedInToday ? 'You are currently on the clock' : 'Check in to start your day'}
              icon={<CalendarClock className="w-5 h-5" />}
            />
            <StatCard
              label="Attendance Records"
              value={attendance.length}
              hint="Total logged sessions"
              icon={<ListChecks className="w-5 h-5" />}
            />
            <StatCard label="Role" value="Employee" hint={user.email || ''} icon={<UserCircle className="w-5 h-5" />} />
          </div>
          <div className="flex gap-3">
            {checkedInToday ? (
              <Button variant="outline" disabled={busy} onClick={() => doCheck('check-out')}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />} Check Out
              </Button>
            ) : (
              <Button disabled={busy} onClick={() => doCheck('check-in')}>
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />} Check In
              </Button>
            )}
          </div>
        </div>
      )}

      {active === 'tasks' && (
        <EmptyState title="No tasks assigned" description="Tasks assigned to you will appear here." icon={<ListChecks className="size-10" />} />
      )}

      {active === 'projects' && (
        <EmptyState title="No projects assigned" description="Projects you are staffed on will appear here." icon={<FolderKanban className="size-10" />} />
      )}

      {active === 'schedule' && (
        <div>
          <SectionHeader
            title="Attendance & Schedule"
            description="Your logged check-ins and working sessions."
            action={
              checkedInToday ? (
                <Button variant="outline" size="sm" disabled={busy} onClick={() => doCheck('check-out')}>Check Out</Button>
              ) : (
                <Button size="sm" disabled={busy} onClick={() => doCheck('check-in')}>Check In</Button>
              )
            }
          />
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand" /></div>
          ) : attendance.length === 0 ? (
            <EmptyState title="No attendance yet" description="Check in to record your first session." icon={<CalendarClock className="size-10" />} />
          ) : (
            <div className="rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface/50 border-b border-border text-muted-foreground uppercase text-xs tracking-widest">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold">Date</th>
                    <th className="text-left px-5 py-3 font-semibold">Check In</th>
                    <th className="text-left px-5 py-3 font-semibold">Check Out</th>
                    <th className="text-left px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((a) => (
                    <tr key={a.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 text-foreground">{a.date ? new Date(a.date).toLocaleDateString() : '—'}</td>
                      <td className="px-5 py-3 text-muted-foreground">{a.checkInAt ? new Date(a.checkInAt).toLocaleTimeString() : '—'}</td>
                      <td className="px-5 py-3 text-muted-foreground">{a.checkOutAt ? new Date(a.checkOutAt).toLocaleTimeString() : '—'}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface border border-border uppercase tracking-wider">
                          {a.status || (a.checkOutAt ? 'COMPLETE' : 'ACTIVE')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {active === 'notifications' && (
        <EmptyState title="No notifications" description="Internal notifications will appear here." icon={<Bell className="size-10" />} />
      )}

      {active === 'documents' && (
        <EmptyState title="No documents" description="Shared documents and resources will appear here." icon={<FileText className="size-10" />} />
      )}

      {active === 'profile' && (
        <div className="max-w-xl space-y-4">
          <SectionHeader title="My Profile" />
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-3">
            <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground text-sm">Name</span><span className="text-foreground font-medium">{user.name || '—'}</span></div>
            <div className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground text-sm">Email</span><span className="text-foreground font-medium">{user.email || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground text-sm">Role</span><span className="text-foreground font-medium">Employee</span></div>
          </div>
        </div>
      )}

      {active === 'settings' && (
        <div className="max-w-xl">
          <SectionHeader title="Settings" description="Account preferences." />
          <div className="bg-surface border border-border rounded-2xl p-6 text-sm text-muted-foreground">
            Notification and account preferences are managed by your administrator.
          </div>
        </div>
      )}
    </div>
  );
}

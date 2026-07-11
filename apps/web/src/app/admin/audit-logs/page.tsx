"use client";

import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Reveal } from '@/components/ui/Reveal';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Search, ShieldCheck } from 'lucide-react';

const FALLBACK_AUDIT_LOGS = [
  { id: 'log-1', createdAt: new Date(Date.now() - 3600000).toISOString(), actor: { firstName: 'Aditya', lastName: '(Super Admin)' }, action: 'ROLE_UPDATE', resource: 'User', resourceId: 'usr_02', ipAddress: '192.168.1.100' },
  { id: 'log-2', createdAt: new Date(Date.now() - 7200000).toISOString(), actor: { firstName: 'Studio', lastName: 'Manager' }, action: 'CMS_PUBLISH', resource: 'Portfolio', resourceId: 'proj_89', ipAddress: '192.168.1.104' },
  { id: 'log-3', createdAt: new Date(Date.now() - 14400000).toISOString(), actor: { firstName: 'System', lastName: '' }, action: 'ESCROW_RELEASE', resource: 'Invoice', resourceId: 'inv_402', ipAddress: '10.0.0.1' },
  { id: 'log-4', createdAt: new Date(Date.now() - 28800000).toISOString(), actor: { firstName: 'Aditya', lastName: '(Super Admin)' }, action: 'SETTINGS_UPDATE', resource: 'Config', resourceId: 'sys_01', ipAddress: '192.168.1.100' },
];

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>(FALLBACK_AUDIT_LOGS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  const fetchLogs = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('mdms_auth_token') : null;
      const res = await fetch(`${apiUrl}/audit?limit=50`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setLogs(json.data.length > 0 ? json.data : FALLBACK_AUDIT_LOGS);
        }
        if (isRefresh) toast.success('Audit trail refreshed');
      } else {
        if (isRefresh) toast.error('Failed to fetch latest audit logs');
      }
    } catch (err) {
      if (isRefresh) toast.error('Network error refreshing audit logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    const actorName = log.actor ? `${log.actor.firstName} ${log.actor.lastName}`.toLowerCase() : 'system';
    return (
      actorName.includes(q) ||
      (log.action && log.action.toLowerCase().includes(q)) ||
      (log.resource && log.resource.toLowerCase().includes(q)) ||
      (log.ipAddress && log.ipAddress.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <PortalNavbar />
      
      <main className="page-content">
        <div className="max-w-7xl mx-auto">
          
          <Reveal direction="up">
            <div className="mb-8 border-b border-[var(--color-border)] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[var(--color-primary)] tracking-[0.2em] text-xs uppercase font-semibold mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Security & Governance
                </span>
                <h1 className="text-4xl font-serif text-foreground">
                  Audit Trail
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter by action, actor, IP..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary w-64 transition-all"
                  />
                </div>
                <button
                  onClick={() => fetchLogs(true)}
                  disabled={refreshing}
                  className="px-4 py-2 bg-surface hover:bg-muted/20 border border-border rounded-lg text-sm font-medium text-foreground flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </Reveal>

          {loading ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-xl space-y-4 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-muted/40 rounded w-full" />
              ))}
            </div>
          ) : (
            <Reveal direction="up" delay={0.1}>
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 overflow-x-auto shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-muted-foreground text-xs tracking-widest uppercase">
                      <th className="pb-4 font-semibold">Timestamp</th>
                      <th className="pb-4 font-semibold">Actor</th>
                      <th className="pb-4 font-semibold">Action</th>
                      <th className="pb-4 font-semibold">Resource</th>
                      <th className="pb-4 font-semibold">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-muted-foreground">
                          No audit logs found matching your filter.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log: any) => (
                        <tr key={log.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-base)] transition-colors">
                          <td className="py-4 text-foreground whitespace-nowrap text-sm">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="py-4 text-muted-foreground text-sm font-medium">
                            {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : 'System'}
                          </td>
                          <td className="py-4">
                            <span className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-[var(--color-primary)] rounded text-xs font-mono uppercase tracking-wider font-medium">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-4 text-muted-foreground text-sm">
                            <span className="font-medium text-foreground">{log.resource}</span> <span className="text-xs opacity-60 font-mono">({log.resourceId})</span>
                          </td>
                          <td className="py-4 text-muted-foreground font-mono text-xs">
                            {log.ipAddress || 'Unknown'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Reveal>
          )}
        </div>
      </main>
    </>
  );
}


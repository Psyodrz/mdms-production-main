import { Reveal } from '@/components/ui/Reveal';



const ACTION_STYLES: Record<string, string> = {
  ROLE_UPDATE: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  CMS_PUBLISH: 'bg-green-500/15 text-green-400 border border-green-500/30',
  ESCROW_RELEASE: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  SETTINGS_UPDATE: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  DEACTIVATE_USER: 'bg-red-500/15 text-red-400 border border-red-500/30',
  UPDATE_USER_ROLE: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  REACTIVATE_USER: 'bg-green-500/15 text-green-400 border border-green-500/30',
  RESET_MFA: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
};

const DEFAULT_ACTION_STYLE = 'bg-white/5 text-[var(--color-primary)] border border-white/10';

import { serverFetchAPI } from '@/lib/server-api-client';

async function getAuditLogs() {
  try {
    // Authenticated call — audit logs are SUPER_ADMIN only.
    const json = await serverFetchAPI('/audit?limit=20', { cache: 'no-store' });
    const d = json?.data;
    const list = Array.isArray(d) ? d : Array.isArray(d?.items) ? d.items : Array.isArray(d?.data) ? d.data : [];
    return list.length > 0 ? list : [];
  } catch (error) {
    return [];
  }
}

export default async function AuditLogs() {
  const logs = await getAuditLogs();

  return (
    <>
      <main className="page-content">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8">

          <Reveal direction="up">
            <div className="mb-10 border-b border-(--color-border) pb-8">
              <span className="text-(--color-primary) tracking-[0.2em] text-xs uppercase font-semibold mb-2 flex items-center gap-2">
                <span className="h-px w-8 bg-(--color-primary)" />
                Security
              </span>
              <h1 className="text-4xl font-display text-foreground mt-3">
                Audit Trail
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Complete activity log of all administrative actions across the platform.
              </p>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <div className="bg-(--color-surface) border border-(--color-border) rounded-xl overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-(--color-border) text-muted-foreground text-[11px] tracking-[0.15em] uppercase">
                    <th className="px-6 py-4 font-semibold">Timestamp</th>
                    <th className="px-6 py-4 font-semibold">Actor</th>
                    <th className="px-6 py-4 font-semibold">Action</th>
                    <th className="px-6 py-4 font-semibold">Resource</th>
                    <th className="px-6 py-4 font-semibold">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-2xl opacity-30">🔍</span>
                          <span>No audit logs found.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    logs.map((log: any) => (
                      <tr key={log.id} className="border-b border-(--color-border) last:border-0 hover:bg-(--color-surface-elevated)/50 transition-colors">
                        <td className="px-6 py-4 text-foreground whitespace-nowrap text-sm font-medium">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-foreground text-sm">
                          {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : 'System'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-semibold tracking-wider uppercase ${ACTION_STYLES[log.action] || DEFAULT_ACTION_STYLE}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-foreground text-sm">
                          {log.resource}{' '}
                          <span className="text-muted-foreground text-xs">({log.resourceId})</span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground font-mono text-sm">
                          {log.ipAddress || 'Unknown'}
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

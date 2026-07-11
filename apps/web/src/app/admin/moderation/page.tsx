"use client";

import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Reveal } from '@/components/ui/Reveal';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Loader2, Check, X, Eye } from 'lucide-react';

const FALLBACK_PENDING_PROFILES = [
  { id: 'tal-1', user: { firstName: 'Kavya', lastName: 'Nair' }, city: 'Mumbai', talentTypes: ['HIGH_FASHION', 'RUNWAY'], bio: 'Fashion model with experience in editorial print and luxury brand runways across Mumbai and Paris.' },
  { id: 'tal-2', user: { firstName: 'Sameer', lastName: 'Khanna' }, city: 'Delhi', talentTypes: ['COMMERCIAL_ACTOR', 'VOICEOVER'], bio: 'Commercial actor featured in national television advertisements and bilingual voiceover campaigns.' },
];

export default function ContentModeration() {
  const [pendingProfiles, setPendingProfiles] = useState<any[]>(FALLBACK_PENDING_PROFILES);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const fetchPendingProfiles = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('mdms_auth_token') : null;
      const res = await fetch(`${apiUrl}/talent/pending`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.ok) {
        const json = await res.json();
        const list = json.data || json;
        if (Array.isArray(list)) {
          setPendingProfiles(list.length > 0 ? list : FALLBACK_PENDING_PROFILES);
        }
        if (isRefresh) toast.success('Pending profiles refreshed');
      } else {
        if (isRefresh) toast.error('Failed to load pending profiles');
      }
    } catch (err) {
      if (isRefresh) toast.error('Network error refreshing profiles');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingProfiles();
  }, []);

  const handleModerate = async (profile: any, status: 'ACTIVE' | 'SUSPENDED') => {
    const actionName = status === 'ACTIVE' ? 'approve' : 'reject';
    if (!confirm(`Are you sure you want to ${actionName} ${profile.user?.firstName || 'this'} profile?`)) return;

    setActionLoading(prev => ({ ...prev, [profile.id]: true }));
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('mdms_auth_token') : null;
      const res = await fetch(`${apiUrl}/talent/${profile.id}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status })
      });

      if (!res.ok) throw new Error(`Failed to ${actionName} profile`);
      toast.success(`Profile ${status === 'ACTIVE' ? 'approved' : 'rejected'} successfully`);
      setPendingProfiles(prev => prev.filter(p => p.id !== profile.id));
      fetchPendingProfiles(true);
    } catch (err) {
      toast.error(`Error trying to ${actionName} profile`);
    } finally {
      setActionLoading(prev => ({ ...prev, [profile.id]: false }));
    }
  };

  return (
    <>
      <PortalNavbar />
      
      <main className="page-content">
        <div className="max-w-7xl mx-auto">
          
          <Reveal direction="up">
            <div className="mb-12 border-b border-[var(--color-border)] pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <span className="text-[var(--color-primary)] tracking-[0.2em] text-xs uppercase font-semibold mb-2 block">
                  Internal Operations
                </span>
                <h1 className="text-4xl font-serif text-foreground">
                  Talent Moderation
                </h1>
              </div>
              <button
                onClick={() => fetchPendingProfiles(true)}
                disabled={refreshing}
                className="px-4 py-3 bg-surface border border-border hover:border-primary rounded-sm text-sm font-semibold tracking-widest uppercase flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-primary ${refreshing ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>
          </Reveal>

          {loading ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-xl space-y-4 animate-pulse">
              <div className="h-6 w-48 bg-muted/40 rounded mb-6" />
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 bg-muted/40 rounded w-full" />
              ))}
            </div>
          ) : (
            <Reveal direction="up" delay={0.1}>
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-serif text-foreground mb-6">Pending Approvals ({pendingProfiles.length})</h2>
                
                <div className="space-y-4">
                  {pendingProfiles.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center border border-dashed border-border rounded">No profiles currently pending review.</p>
                  ) : (
                    pendingProfiles.map((profile: any) => {
                      const isActing = actionLoading[profile.id];
                      return (
                        <div key={profile.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-[var(--color-base)] border border-[var(--color-border)] rounded-sm gap-4 hover:border-primary/30 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <p className="text-foreground font-semibold text-lg">
                                {profile.user?.firstName || profile.firstName} {profile.user?.lastName || profile.lastName}
                              </p>
                              <span className="text-[10px] bg-yellow-500/10 text-yellow-600 border border-yellow-500/30 px-2 py-0.5 rounded uppercase tracking-widest font-bold">Pending</span>
                            </div>
                            <p className="text-muted-foreground text-xs uppercase tracking-widest mt-1">
                              Types: {profile.talentTypes?.map((t: string) => t.replace('_', ' ')).join(', ')} | City: {profile.city || 'Not specified'}
                            </p>
                            <p className="text-muted-foreground text-sm mt-2 max-w-2xl line-clamp-2">
                              {profile.bio || 'No bio provided.'}
                            </p>
                          </div>
                          
                          <div className="mt-2 md:mt-0 flex gap-3 w-full md:w-auto justify-end">
                            <a
                              href={`/talent/${profile.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 border border-[var(--color-border)] hover:border-primary transition-colors text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </a>
                            <button
                              onClick={() => handleModerate(profile, 'ACTIVE')}
                              disabled={isActing}
                              className="px-4 py-2 bg-primary text-white hover:bg-primary/80 transition-colors text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {isActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Approve
                            </button>
                            <button
                              onClick={() => handleModerate(profile, 'SUSPENDED')}
                              disabled={isActing}
                              className="px-4 py-2 bg-red-900/20 text-red-500 hover:bg-red-900/40 transition-colors border border-red-900/50 text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </main>
    </>
  );
}


'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { 
  Check, 
  X, 
  Eye, 
  RefreshCw, 
  Loader2, 
  UserCheck, 
  MapPin, 
  Mail, 
  Phone, 
  Sparkles,
  ShieldAlert,
  Calendar,
  Layers
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface TalentModerationClientProps {
  initialProfiles?: any[];
}

export function TalentModerationClient({ initialProfiles }: TalentModerationClientProps) {
  const [profiles, setProfiles] = useState<any[]>(initialProfiles || []);
  const [loading, setLoading] = useState(!initialProfiles || initialProfiles.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);

  const fetchPending = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/talent/pending', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const list = json.data || json;
        if (Array.isArray(list)) {
          setProfiles(list);
        }
        if (isRefresh) toast.success('Pending queue refreshed');
      } else {
        if (isRefresh) toast.error('Failed to load pending queue');
      }
    } catch (err) {
      if (isRefresh) toast.error('Network error loading pending talent queue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleModerate = async (profileId: string, action: 'APPROVE' | 'REJECT') => {
    const isApprove = action === 'APPROVE';
    const status = isApprove ? 'ACTIVE' : 'SUSPENDED';
    setActionLoading(prev => ({ ...prev, [profileId]: true }));

    try {
      const res = await fetch(`/api/talent/${profileId}/moderate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          reviewNote: isApprove ? 'Approved by Admin' : 'Rejected during moderation review'
        }),
      });

      const json = await res.json();

      if (res.ok && (json.success || json.ok)) {
        toast.success(isApprove ? 'Talent profile APPROVED live!' : 'Talent application REJECTED.');
        setProfiles(prev => prev.filter(p => p.id !== profileId));
        if (selectedProfile?.id === profileId) {
          setSelectedProfile(null);
        }
      } else {
        toast.error(json.error || json.message || `Failed to process profile.`);
      }
    } catch (err) {
      toast.error('Network error processing moderation decision.');
    } finally {
      setActionLoading(prev => ({ ...prev, [profileId]: false }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-primary tracking-[0.2em] text-xs uppercase font-semibold mb-1 block">
            Security & Compliance Queue
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-foreground flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-brand" /> Talent Moderation
          </h1>
        </div>

        <Button
          onClick={() => fetchPending(true)}
          variant="outline"
          size="sm"
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Queue ({profiles.length})
        </Button>
      </div>

      {/* Queue Listing */}
      {loading ? (
        <div className="p-16 text-center border border-border rounded-2xl bg-card space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand" />
          <p className="text-muted-foreground font-light text-sm">Loading pending talent applications...</p>
        </div>
      ) : profiles.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-border bg-muted/10 space-y-4">
          <Sparkles className="w-10 h-10 mx-auto text-brand" />
          <h3 className="text-xl font-serif text-foreground font-semibold">Pending Queue Clear</h3>
          <p className="text-muted-foreground text-sm font-light max-w-md mx-auto">
            All submitted talent applications have been reviewed. New talent registrations will appear here automatically.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {profiles.map((p) => {
            const isProcessing = actionLoading[p.id];
            const name = p.user?.name || `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim() || 'Applicant';
            const email = p.user?.email || p.email || 'N/A';
            const phone = p.user?.phone || p.phone || 'N/A';
            const city = p.city || p.location || 'Unspecified';
            const avatar = p.user?.avatarUrl || p.avatarUrl || p.coverBannerUrl;
            const category = p.type || p.categorySlug || 'Talent Applicant';

            return (
              <Card 
                key={p.id} 
                className="p-6 border-border hover:border-brand/40 transition-all bg-card shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                {/* Profile info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 rounded-full bg-surface border border-border overflow-hidden shrink-0 flex items-center justify-center text-lg font-serif font-bold text-foreground">
                    {avatar ? (
                      <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      name[0]
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-serif text-foreground font-bold">{name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-brand/10 text-brand border border-brand/20">
                        {category}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-light">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-brand" /> {city}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-brand" /> {email}
                      </span>
                      {phone !== 'N/A' && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-brand" /> {phone}
                        </span>
                      )}
                    </div>

                    {p.bio && (
                      <p className="text-xs text-muted-foreground line-clamp-2 pt-1 font-light leading-relaxed max-w-2xl">
                        {p.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-border">
                  <Button
                    onClick={() => setSelectedProfile(p)}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs uppercase font-bold tracking-wider"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Details
                  </Button>

                  <button
                    onClick={() => handleModerate(p.id, 'APPROVE')}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Approve
                  </button>

                  <button
                    onClick={() => handleModerate(p.id, 'REJECT')}
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                    Reject
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Applicant Detail Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={(open) => !open && setSelectedProfile(null)}>
        <DialogContent className="max-w-2xl bg-card border-border text-foreground">
          {selectedProfile && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif text-foreground">
                  Applicant Profile Review
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-light">
                  Submitted details for {selectedProfile.user?.name || `${selectedProfile.user?.firstName || ''} ${selectedProfile.user?.lastName || ''}`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 text-sm">
                <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-mono tracking-wider block mb-1">Category</span>
                    <span className="font-bold text-foreground">{selectedProfile.type || 'Talent'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-mono tracking-wider block mb-1">City / Location</span>
                    <span className="font-bold text-foreground">{selectedProfile.city || 'Unspecified'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-mono tracking-wider block mb-1">Email</span>
                    <span className="font-bold text-foreground">{selectedProfile.user?.email || selectedProfile.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-mono tracking-wider block mb-1">Phone</span>
                    <span className="font-bold text-foreground">{selectedProfile.user?.phone || selectedProfile.phone || 'N/A'}</span>
                  </div>
                </div>

                {selectedProfile.bio && (
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-primary font-bold mb-2">Biography / Pitch</h4>
                    <p className="text-muted-foreground leading-relaxed text-sm bg-background p-4 rounded-xl border border-border">
                      {selectedProfile.bio}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => handleModerate(selectedProfile.id, 'REJECT')}
                    className="px-5 py-2.5 rounded-lg bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white border border-red-500/30 text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleModerate(selectedProfile.id, 'APPROVE')}
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                  >
                    Approve Application
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

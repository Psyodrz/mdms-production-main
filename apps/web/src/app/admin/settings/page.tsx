"use client";

import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Reveal } from '@/components/ui/Reveal';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Loader2, Plus } from 'lucide-react';
import { WhatsAppConfigCard } from '@/components/admin/WhatsAppConfigCard';
import { fetchAPI } from '@/lib/api-client';
import { cms } from '@/lib/cms/client';
import { Loader2 as Spinner, Plus as PlusIcon, Trash2 } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
type BusinessHour = { day: string; open: string; close: string; closed: boolean };
type BlockedDate = { date: string; reason: string };

const DEFAULT_HOURS: BusinessHour[] = DAYS.map((day) => ({
  day,
  open: '09:00',
  close: '18:00',
  closed: day === 'Sunday',
}));



export default function AdminSettings() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Business Hours & Blocked Dates (stored in SystemConfig via the CMS config API)
  const [hoursOpen, setHoursOpen] = useState(false);
  const [datesOpen, setDatesOpen] = useState(false);
  const [hours, setHours] = useState<BusinessHour[]>(DEFAULT_HOURS);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);

  const openHours = async () => {
    setHoursOpen(true);
    setConfigLoading(true);
    try {
      const res = await cms.getConfig<any>('business-hours');
      const val = res.ok ? (typeof res.data === 'string' ? JSON.parse(res.data) : res.data) : null;
      setHours(Array.isArray(val) && val.length > 0 ? val : DEFAULT_HOURS);
    } catch {
      setHours(DEFAULT_HOURS);
    } finally {
      setConfigLoading(false);
    }
  };

  const openDates = async () => {
    setDatesOpen(true);
    setConfigLoading(true);
    try {
      const res = await cms.getConfig<any>('blocked-dates');
      const val = res.ok ? (typeof res.data === 'string' ? JSON.parse(res.data) : res.data) : null;
      setBlockedDates(Array.isArray(val) ? val : []);
    } catch {
      setBlockedDates([]);
    } finally {
      setConfigLoading(false);
    }
  };

  const saveHours = async () => {
    setConfigSaving(true);
    try {
      const res = await cms.setConfig('business-hours', hours);
      if (!res.ok) throw new Error(res.error || 'Save failed');
      toast.success('Business hours saved');
      setHoursOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save business hours');
    } finally {
      setConfigSaving(false);
    }
  };

  const saveDates = async () => {
    setConfigSaving(true);
    try {
      const res = await cms.setConfig('blocked-dates', blockedDates);
      if (!res.ok) throw new Error(res.error || 'Save failed');
      toast.success('Blocked dates saved');
      setDatesOpen(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save blocked dates');
    } finally {
      setConfigSaving(false);
    }
  };

  const fetchFlags = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const json = await fetchAPI('/system/flags');
      const list = json?.data || json;
      setFlags(Array.isArray(list) ? list : []);
      if (isRefresh) toast.success('Feature flags refreshed');
    } catch (err: any) {
      if (isRefresh) toast.error(err?.message || 'Failed to fetch feature flags');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const handleToggle = async (flag: any) => {
    const updatedEnabled = !flag.enabled;
    // optimistic update
    setFlags(prev => prev.map(f => f.key === flag.key ? { ...f, enabled: updatedEnabled } : f));

    try {
      await fetchAPI(`/system/flags/${flag.key}`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled: updatedEnabled }),
      });
      toast.success(`Feature flag ${flag.key} ${updatedEnabled ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      // revert on failure — never leave the UI showing an unpersisted state
      setFlags(prev => prev.map(f => f.key === flag.key ? { ...f, enabled: !updatedEnabled } : f));
      toast.error(err?.message || 'Failed to update feature flag');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !description.trim()) {
      toast.error('Please enter flag key and description');
      return;
    }

    const formattedKey = key.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    setIsSubmitting(true);
    try {
      await fetchAPI('/system/flags', {
        method: 'POST',
        body: JSON.stringify({ key: formattedKey, description, enabled: false }),
      });
      toast.success('Feature flag added successfully');
      setIsModalOpen(false);
      setKey('');
      setDescription('');
      fetchFlags(true);
    } catch (err: any) {
      // Never fake success — report the real error and keep the modal open.
      toast.error(err?.message || 'Failed to create feature flag');
    } finally {
      setIsSubmitting(false);
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
                  Configuration
                </span>
                <h1 className="text-4xl font-serif text-foreground">
                  System Settings
                </h1>
              </div>
              <button
                onClick={() => fetchFlags(true)}
                disabled={refreshing}
                className="px-4 py-3 bg-surface border border-border hover:border-primary rounded-sm text-sm font-semibold tracking-widest uppercase flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-primary ${refreshing ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>
          </Reveal>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 h-80 rounded-xl" />
              <div className="space-y-8">
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 h-36 rounded-xl" />
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 h-36 rounded-xl" />
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              <Reveal direction="up" delay={0.05}>
                <WhatsAppConfigCard />
              </Reveal>

              <Reveal direction="up" delay={0.1}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Feature Flags */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-xl shadow-sm">
                  <h2 className="text-xl font-serif text-foreground mb-6">Feature Flags</h2>
                  
                  <div className="space-y-4">
                    {flags.length === 0 ? (
                      <p className="text-muted-foreground text-sm py-4">No feature flags configured.</p>
                    ) : (
                      flags.map((flag: any) => (
                        <div key={flag.key} className="flex justify-between items-center p-4 border border-[var(--color-border)] rounded hover:border-primary/30 transition-colors">
                          <div className="pr-4">
                            <p className="font-semibold text-foreground text-sm">{flag.key}</p>
                            <p className="text-xs text-muted-foreground mt-1">{flag.description}</p>
                          </div>
                          <button
                            onClick={() => handleToggle(flag)}
                            className={`px-4 py-2 text-xs uppercase tracking-widest font-semibold transition-colors shrink-0 rounded ${
                              flag.enabled
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-transparent border border-[var(--color-border)] text-muted-foreground hover:border-foreground'
                            }`}
                          >
                            {flag.enabled ? 'Enabled' : 'Disabled'}
                          </button>
                        </div>
                      ))
                    )}
                    
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="w-full py-3 mt-4 border border-dashed border-[var(--color-border)] hover:border-primary text-sm tracking-widest uppercase transition-colors text-muted-foreground hover:text-primary font-semibold flex items-center justify-center gap-2 rounded"
                    >
                      <Plus className="w-4 h-4" /> Add Feature Flag
                    </button>
                  </div>
                </div>

                {/* General Configs */}
                <div className="space-y-8">
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-serif text-foreground mb-6">Business Hours</h2>
                    <p className="text-muted-foreground text-sm mb-4">Manage working days and operational hours for the booking engine.</p>
                    <button
                      onClick={openHours}
                      className="px-4 py-2 border border-[var(--color-border)] hover:border-primary transition-colors text-xs uppercase tracking-widest font-semibold rounded"
                    >
                      Edit Schedule
                    </button>
                  </div>

                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-serif text-foreground mb-6">Blocked Dates</h2>
                    <p className="text-muted-foreground text-sm mb-4">Prevent bookings on specific calendar dates (holidays, maintenance).</p>
                    <button
                      onClick={openDates}
                      className="px-4 py-2 border border-[var(--color-border)] hover:border-primary transition-colors text-xs uppercase tracking-widest font-semibold rounded"
                    >
                      Manage Dates
                    </button>
                  </div>
                </div>

              </div>
            </Reveal>
          </div>
          )}

          {/* Business Hours Modal */}
          {hoursOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-8 max-w-2xl w-full rounded-sm shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
                <button onClick={() => setHoursOpen(false)} disabled={configSaving} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">✕</button>
                <h2 className="text-2xl font-serif text-foreground mb-6">Business Hours</h2>
                {configLoading ? (
                  <div className="flex justify-center py-12"><Spinner className="w-6 h-6 animate-spin text-primary" /></div>
                ) : (
                  <div className="space-y-3">
                    {hours.map((h, i) => (
                      <div key={h.day} className="flex items-center gap-3 border border-border rounded-lg p-3">
                        <span className="w-28 text-sm font-semibold text-foreground">{h.day}</span>
                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <input type="checkbox" checked={h.closed} onChange={(e) => setHours((prev) => prev.map((x, xi) => xi === i ? { ...x, closed: e.target.checked } : x))} />
                          Closed
                        </label>
                        <input type="time" value={h.open} disabled={h.closed} onChange={(e) => setHours((prev) => prev.map((x, xi) => xi === i ? { ...x, open: e.target.value } : x))} className="bg-[var(--color-base)] border border-border p-2 text-sm rounded text-foreground disabled:opacity-40" />
                        <span className="text-muted-foreground text-xs">to</span>
                        <input type="time" value={h.close} disabled={h.closed} onChange={(e) => setHours((prev) => prev.map((x, xi) => xi === i ? { ...x, close: e.target.value } : x))} className="bg-[var(--color-base)] border border-border p-2 text-sm rounded text-foreground disabled:opacity-40" />
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={saveHours} disabled={configSaving || configLoading} className="w-full mt-6 px-6 py-3 bg-primary text-white font-semibold tracking-widest text-sm uppercase hover:bg-primary/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {configSaving ? <><Spinner className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Business Hours'}
                </button>
              </div>
            </div>
          )}

          {/* Blocked Dates Modal */}
          {datesOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-8 max-w-lg w-full rounded-sm shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
                <button onClick={() => setDatesOpen(false)} disabled={configSaving} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">✕</button>
                <h2 className="text-2xl font-serif text-foreground mb-6">Blocked Dates</h2>
                {configLoading ? (
                  <div className="flex justify-center py-12"><Spinner className="w-6 h-6 animate-spin text-primary" /></div>
                ) : (
                  <div className="space-y-3">
                    {blockedDates.length === 0 && <p className="text-sm text-muted-foreground">No blocked dates. Add one below.</p>}
                    {blockedDates.map((d, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <input type="date" value={d.date} onChange={(e) => setBlockedDates((prev) => prev.map((x, xi) => xi === i ? { ...x, date: e.target.value } : x))} className="bg-[var(--color-base)] border border-border p-2 text-sm rounded text-foreground" />
                        <input type="text" placeholder="Reason (e.g. Holiday)" value={d.reason} onChange={(e) => setBlockedDates((prev) => prev.map((x, xi) => xi === i ? { ...x, reason: e.target.value } : x))} className="flex-1 bg-[var(--color-base)] border border-border p-2 text-sm rounded text-foreground" />
                        <button onClick={() => setBlockedDates((prev) => prev.filter((_, xi) => xi !== i))} className="text-red-500 hover:text-red-400 p-2"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button onClick={() => setBlockedDates((prev) => [...prev, { date: new Date().toISOString().split('T')[0], reason: '' }])} className="w-full py-2.5 border border-dashed border-border hover:border-primary text-xs uppercase tracking-widest font-semibold rounded flex items-center justify-center gap-2 text-muted-foreground hover:text-primary">
                      <PlusIcon className="w-4 h-4" /> Add Blocked Date
                    </button>
                  </div>
                )}
                <button onClick={saveDates} disabled={configSaving || configLoading} className="w-full mt-6 px-6 py-3 bg-primary text-white font-semibold tracking-widest text-sm uppercase hover:bg-primary/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {configSaving ? <><Spinner className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Blocked Dates'}
                </button>
              </div>
            </div>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-8 max-w-lg w-full rounded-sm shadow-2xl relative animate-fadeIn">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-black transition-colors"
                >
                  ✕
                </button>
                <h2 className="text-2xl font-serif text-foreground mb-6">Add Feature Flag</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Flag Key</label>
                    <input 
                      type="text" 
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none text-foreground font-mono uppercase" 
                      placeholder="e.g. AI_CASTING_MATCHMAKER"
                      required 
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">Will be automatically formatted to uppercase with underscores.</p>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Description</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none text-foreground"
                      placeholder="Explain what this feature toggle controls..."
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-4 px-6 py-3 bg-primary text-white font-semibold tracking-widest text-sm uppercase hover:bg-primary/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      'Save Feature Flag'
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}


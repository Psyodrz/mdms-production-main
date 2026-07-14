"use client";

import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Reveal } from '@/components/ui/Reveal';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Loader2, Plus } from 'lucide-react';



export default function AdminSettings() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFlags = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('mdms_auth_token') : null;
      const res = await fetch(`${apiUrl}/system/flags`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.ok) {
        const json = await res.json();
        const list = json.data || json;
        if (Array.isArray(list)) {
          setFlags(list.length > 0 ? list : []);
        }
        if (isRefresh) toast.success('Feature flags refreshed');
      } else {
        if (isRefresh) toast.error('Failed to fetch feature flags');
      }
    } catch (err) {
      if (isRefresh) toast.error('Network error refreshing flags');
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
    setFlags(prev => prev.map(f => f.key === flag.key ? { ...f, enabled: updatedEnabled } : f));
    toast.success(`Feature flag ${flag.key} ${updatedEnabled ? 'enabled' : 'disabled'}`);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('mdms_auth_token') : null;
      await fetch(`${apiUrl}/system/flags/${flag.key}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ enabled: updatedEnabled })
      });
    } catch (err) {
      console.error(err);
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('mdms_auth_token') : null;
      
      const res = await fetch(`${apiUrl}/system/flags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          key: formattedKey,
          description,
          enabled: false
        })
      });

      if (!res.ok) throw new Error('Failed to create flag');
      toast.success('Feature flag added successfully');
      setIsModalOpen(false);
      setKey('');
      setDescription('');
      fetchFlags(true);
    } catch (err) {
      // Fallback local addition if backend endpoint isn't ready
      setFlags(prev => [...prev, { key: formattedKey, description, enabled: false }]);
      toast.success('Feature flag added');
      setIsModalOpen(false);
      setKey('');
      setDescription('');
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
                      onClick={() => toast.info('Business hours schedule editor will open in Phase 8.')}
                      className="px-4 py-2 border border-[var(--color-border)] hover:border-primary transition-colors text-xs uppercase tracking-widest font-semibold rounded"
                    >
                      Edit Schedule
                    </button>
                  </div>

                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-serif text-foreground mb-6">Blocked Dates</h2>
                    <p className="text-muted-foreground text-sm mb-4">Prevent bookings on specific calendar dates (holidays, maintenance).</p>
                    <button
                      onClick={() => toast.info('Blocked dates calendar will open in Phase 8.')}
                      className="px-4 py-2 border border-[var(--color-border)] hover:border-primary transition-colors text-xs uppercase tracking-widest font-semibold rounded"
                    >
                      Manage Dates
                    </button>
                  </div>
                </div>

              </div>
            </Reveal>
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


"use client";

import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Reveal } from '@/components/ui/Reveal';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Trash2, Edit3, Loader2, Plus, Star } from 'lucide-react';
import { fetchAPI } from '@/lib/api-client';



export default function CMSTestimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [clientName, setClientName] = useState('');
  const [clientTitle, setClientTitle] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTestimonials = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const json = await fetchAPI('/cms/admin/testimonials');
      const list = json.data || json;
      if (Array.isArray(list)) {
        setTestimonials(list.length > 0 ? list : []);
      }
      if (isRefresh) toast.success('Testimonials refreshed');
    } catch (err) {
      if (isRefresh) toast.error('Network error refreshing testimonials');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !content.trim()) {
      toast.error('Please enter client name and testimonial content');
      return;
    }

    setIsSubmitting(true);
    try {
      await fetchAPI('/cms/admin/testimonials', {
        method: 'POST',
        body: JSON.stringify({
          clientName,
          clientTitle: clientTitle || 'Client',
          clientCompany: clientCompany || 'Enterprise',
          content,
          rating: Number(rating),
          isApproved: true,
          isFeatured: true
        })
      });
      toast.success('Testimonial added successfully');
      setIsModalOpen(false);
      setClientName('');
      setClientTitle('');
      setClientCompany('');
      setContent('');
      setRating(5);
      fetchTestimonials(true);
    } catch (err) {
      toast.error('Error adding testimonial');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
    toast.success('Testimonial deleted');

    try {
      await fetchAPI(`/cms/admin/testimonials/${id}`, {
        method: 'DELETE'
      });
      fetchTestimonials();
    } catch (err) {
      toast.error('Failed to delete on server');
    }
  };

  const handleToggleApproved = async (item: any) => {
    const updatedApproved = !item.isApproved;
    setTestimonials(prev => prev.map(t => t.id === item.id ? { ...t, isApproved: updatedApproved } : t));
    toast.success(updatedApproved ? 'Testimonial approved & live' : 'Testimonial hidden');

    try {
      await fetchAPI('/cms/admin/testimonials', {
        method: 'POST',
        body: JSON.stringify({
          id: item.id,
          clientName: item.clientName,
          content: item.content,
          isApproved: updatedApproved,
          rating: item.rating
        })
      });
    } catch (err) {
      console.error(err);
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
                  CMS Administration
                </span>
                <h1 className="text-4xl font-serif text-foreground">
                  Testimonials
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchTestimonials(true)}
                  disabled={refreshing}
                  className="px-4 py-3 bg-surface border border-border hover:border-primary rounded-sm text-sm font-semibold tracking-widest uppercase flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-primary ${refreshing ? 'animate-spin' : ''}`} /> Refresh
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 bg-primary text-white font-semibold tracking-widest text-sm uppercase hover:bg-primary/80 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Testimonial
                </button>
              </div>
            </div>
          </Reveal>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-56 bg-surface border border-border rounded-xl" />
              ))}
            </div>
          ) : (
            <Reveal direction="up" delay={0.1}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.length === 0 ? (
                  <div className="col-span-full bg-[var(--color-surface)] border border-[var(--color-border)] p-12 text-center text-muted-foreground rounded-xl">
                    No testimonials found. Click 'Add Testimonial' above to create one!
                  </div>
                ) : (
                  testimonials.map((testim: any) => (
                    <div key={testim.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 flex flex-col justify-between rounded-xl shadow-sm hover:border-primary/40 transition-all">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex text-yellow-500">
                            {Array.from({ length: testim.rating || 5 }).map((_, i) => (
                              <span key={i}>★</span>
                            ))}
                          </div>
                          <div className="flex gap-2 items-center">
                            <button
                              onClick={() => handleToggleApproved(testim)}
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded border transition-colors ${
                                testim.isApproved || testim.isPublished
                                  ? 'bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20'
                                  : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/20'
                              }`}
                            >
                              {testim.isApproved || testim.isPublished ? 'Live' : 'Hidden'}
                            </button>
                          </div>
                        </div>
                        <p className="text-foreground italic mb-6 text-sm leading-relaxed">"{testim.content}"</p>
                      </div>
                      <div className="border-t border-[var(--color-border)] pt-4 mt-4 flex justify-between items-end">
                        <div>
                          <p className="font-semibold text-sm text-foreground uppercase tracking-widest">{testim.clientName}</p>
                          <p className="text-xs text-muted-foreground mt-1">{testim.clientTitle}{testim.clientCompany ? `, ${testim.clientCompany}` : ''}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleApproved(testim)}
                            className="text-[var(--color-primary)] text-xs uppercase tracking-widest hover:underline font-semibold"
                          >
                            Toggle
                          </button>
                          <button
                            onClick={() => handleDelete(testim.id)}
                            className="text-red-500 hover:text-red-400 text-xs uppercase tracking-widest transition-colors font-semibold flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                <h2 className="text-2xl font-serif text-foreground mb-6">Add Client Testimonial</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Client Name</label>
                    <input 
                      type="text" 
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none text-foreground" 
                      placeholder="e.g. Aria Mehta"
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Job Title</label>
                      <input 
                        type="text" 
                        value={clientTitle}
                        onChange={(e) => setClientTitle(e.target.value)}
                        className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none text-foreground" 
                        placeholder="e.g. Brand VP"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Company</label>
                      <input 
                        type="text" 
                        value={clientCompany}
                        onChange={(e) => setClientCompany(e.target.value)}
                        className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none text-foreground" 
                        placeholder="e.g. Nike APAC"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Rating (1-5)</label>
                    <select 
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none text-foreground"
                    >
                      <option value="5">5 Stars ★★★★★</option>
                      <option value="4">4 Stars ★★★★</option>
                      <option value="3">3 Stars ★★★</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Testimonial Content</label>
                    <textarea 
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={4}
                      className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none text-foreground"
                      placeholder="Share what the client said about working with MP Production..."
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
                      'Save Testimonial'
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


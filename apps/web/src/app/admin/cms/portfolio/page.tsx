"use client";

import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Reveal } from '@/components/ui/Reveal';
import { AddProjectButton } from '@/components/ui/AddProjectButton';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Trash2, Edit3, Loader2 } from 'lucide-react';
import { cms } from '@/lib/cms/client';



export default function CMSPortfolio() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Route through the same-origin CMS BFF (NextAuth session → service account),
      // like the rest of the CMS. Avoids the browser-token 401 on the admin API.
      const res = await cms.list<any[]>('portfolio');
      if (res.ok && Array.isArray(res.data)) {
        setItems(res.data);
        if (isRefresh) toast.success('Portfolio items refreshed');
      } else if (!res.ok) {
        if (isRefresh) toast.error(res.error || 'Failed to refresh items');
      }
    } catch (err) {
      if (isRefresh) toast.error('Network error refreshing items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id: string) => {
    // Confirm on the server before removing from the UI — no fake success.
    const res = await cms.remove('portfolio', id);
    if (res.ok) {
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success('Item moved to recycle bin');
    } else {
      toast.error(res.error || 'Failed to delete item');
    }
  };

  const handleToggleStatus = async (item: any) => {
    const updatedStatus = !(item.isPublished ?? item.isFeatured);
    // optimistic
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, isPublished: updatedStatus } : i));

    // Portfolio upserts re-validate the whole DTO (slug,title,category,mediaUrl
    // required), so send the full record with the toggled publish flag.
    const res = await cms.update('portfolio', item.id, {
      slug: item.slug,
      title: item.title,
      category: item.category,
      mediaUrl: item.mediaUrl,
      mediaType: item.mediaType,
      isPublished: updatedStatus,
    });

    if (res.ok) {
      toast.success(updatedStatus ? 'Project published live' : 'Project set to draft');
    } else {
      // revert on failure
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isPublished: !updatedStatus } : i));
      toast.error(res.error || 'Failed to update status');
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
                  Portfolio Gallery
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchItems(true)}
                  disabled={refreshing}
                  className="px-4 py-3 bg-surface border border-border hover:border-primary rounded-sm text-sm font-semibold tracking-widest uppercase flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-primary ${refreshing ? 'animate-spin' : ''}`} /> Refresh
                </button>
                <AddProjectButton onSuccess={() => fetchItems(true)} />
              </div>
            </div>
          </Reveal>

          {loading ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-xl space-y-4 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-muted/40 rounded w-full" />
              ))}
            </div>
          ) : (
            <Reveal direction="up" delay={0.1}>
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 overflow-x-auto shadow-sm rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-muted-foreground text-xs tracking-widest uppercase font-semibold">
                      <th className="pb-4">Title</th>
                      <th className="pb-4">Category</th>
                      <th className="pb-4">Media Type</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-muted-foreground">
                          No portfolio items found. Add your first project above!
                        </td>
                      </tr>
                    ) : (
                      items.map((item: any) => (
                        <tr key={item.id} className="hover:bg-[var(--color-base)] transition-colors">
                          <td className="py-4 font-medium text-foreground">
                            {item.title}
                            <span className="block text-xs text-muted-foreground font-normal font-mono">/{item.slug}</span>
                          </td>
                          <td className="py-4 text-muted-foreground capitalize text-sm">{item.category}</td>
                          <td className="py-4 text-muted-foreground capitalize text-sm">{item.mediaType || 'video'}</td>
                          <td className="py-4">
                            <button
                              onClick={() => handleToggleStatus(item)}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-sm uppercase tracking-wider border transition-colors ${
                                item.isFeatured || item.isPublished
                                  ? 'bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20'
                                  : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/20'
                              }`}
                            >
                              {item.isFeatured || item.isPublished ? 'Live' : 'Draft'}
                            </button>
                          </td>
                          <td className="py-4 text-right whitespace-nowrap">
                            <button 
                              onClick={() => handleToggleStatus(item)}
                              className="text-muted-foreground hover:text-primary text-xs uppercase tracking-widest transition-colors mr-4 font-semibold inline-flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> {item.isFeatured ? 'Unpublish' : 'Publish'}
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="text-red-500 hover:text-red-400 text-xs uppercase tracking-widest transition-colors font-semibold inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
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


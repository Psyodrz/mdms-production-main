"use client";

import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Reveal } from '@/components/ui/Reveal';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Trash2, Edit3, Loader2, Plus } from 'lucide-react';
import { fetchAPI } from '@/lib/api-client';

const FALLBACK_TEAM_MEMBERS = [
  { id: 'tm-1', name: 'Alok Verma', role: 'Executive Producer & Founder', isPublished: true },
  { id: 'tm-2', name: 'Siddharth Roy', role: 'Lead Creative Director', isPublished: true },
  { id: 'tm-3', name: 'Neelam Verma', role: 'Head of Brand Partnerships', isPublished: true },
  { id: 'tm-4', name: 'Vikramaditya Bose', role: 'VFX & Post-Production Supervisor', isPublished: false },
];

export default function CMSTeam() {
  const [team, setTeam] = useState<any[]>(FALLBACK_TEAM_MEMBERS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTeam = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const json = await fetchAPI('/cms/admin/team');
      const list = json.data || json;
      if (Array.isArray(list)) {
        setTeam(list.length > 0 ? list : FALLBACK_TEAM_MEMBERS);
      }
      if (isRefresh) toast.success('Team members refreshed');
    } catch (err) {
      if (isRefresh) toast.error('Network error refreshing team');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      toast.error('Please enter member name and role');
      return;
    }

    setIsSubmitting(true);
    try {
      await fetchAPI('/cms/admin/team', {
        method: 'POST',
        body: JSON.stringify({
          name,
          role,
          bio: bio || 'Key member of the MP Production team.',
          isPublished: true,
          order: team.length + 1
        })
      });
      toast.success('Team member added successfully');
      setIsModalOpen(false);
      setName('');
      setRole('');
      setBio('');
      fetchTeam(true);
    } catch (err) {
      toast.error('Error adding team member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setTeam(prev => prev.filter(m => m.id !== id));
    toast.success('Team member removed');

    try {
      await fetchAPI(`/cms/admin/team/${id}`, {
        method: 'DELETE'
      });
      fetchTeam();
    } catch (err) {
      toast.error('Failed to delete on server');
    }
  };

  const handleToggleStatus = async (member: any) => {
    const updatedPublished = !member.isPublished;
    setTeam(prev => prev.map(m => m.id === member.id ? { ...m, isPublished: updatedPublished } : m));
    toast.success(updatedPublished ? 'Member profile published live' : 'Member profile hidden');

    try {
      await fetchAPI('/cms/admin/team', {
        method: 'POST',
        body: JSON.stringify({
          id: member.id,
          name: member.name,
          role: member.role,
          isPublished: updatedPublished
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
                  Team Members
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchTeam(true)}
                  disabled={refreshing}
                  className="px-4 py-3 bg-surface border border-border hover:border-primary rounded-sm text-sm font-semibold tracking-widest uppercase flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-primary ${refreshing ? 'animate-spin' : ''}`} /> Refresh
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 bg-primary text-white font-semibold tracking-widest text-sm uppercase hover:bg-primary/80 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Member
                </button>
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
                      <th className="pb-4">Name</th>
                      <th className="pb-4">Role</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {team.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-muted-foreground">
                          No team members configured. Add your first member above!
                        </td>
                      </tr>
                    ) : (
                      team.map((member: any) => (
                        <tr key={member.id} className="hover:bg-[var(--color-base)] transition-colors">
                          <td className="py-4 font-medium text-foreground">
                            {member.name}
                          </td>
                          <td className="py-4 text-muted-foreground text-sm">{member.role}</td>
                          <td className="py-4">
                            <button
                              onClick={() => handleToggleStatus(member)}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-sm uppercase tracking-wider border transition-colors ${
                                member.isPublished
                                  ? 'bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20'
                                  : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/20'
                              }`}
                            >
                              {member.isPublished ? 'Live' : 'Draft'}
                            </button>
                          </td>
                          <td className="py-4 text-right whitespace-nowrap">
                            <button 
                              onClick={() => handleToggleStatus(member)}
                              className="text-muted-foreground hover:text-primary text-xs uppercase tracking-widest transition-colors mr-4 font-semibold inline-flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> {member.isPublished ? 'Hide' : 'Publish'}
                            </button>
                            <button 
                              onClick={() => handleDelete(member.id)}
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
                <h2 className="text-2xl font-serif text-foreground mb-6">Add Team Member</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none text-foreground" 
                      placeholder="e.g. Alok Verma"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Role / Job Title</label>
                    <input 
                      type="text" 
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none text-foreground" 
                      placeholder="e.g. Executive Producer"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Bio</label>
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none text-foreground"
                      placeholder="Short professional biography..."
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
                      'Save Member'
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


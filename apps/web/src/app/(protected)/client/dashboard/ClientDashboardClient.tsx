'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FolderKanban, Video, DollarSign, Users, CheckCircle2, ArrowRight, 
  Clock, Plus, Search, Check, X, FileText, Download, Eye, Calendar, 
  MapPin, Film, AlertCircle, Shield
} from 'lucide-react';
import { Role } from '@mdms/types';

interface ClientDashboardClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: Role | string;
  };
}

interface CampaignProject {
  id: string;
  title: string;
  category: string;
  stage: 'Pre-production' | 'Filming' | 'Post-Production' | 'Delivered';
  progress: number;
  deliveryDate: string;
  director: string;
}

interface ShootDay {
  id: string;
  project: string;
  dayNumber: string;
  location: string;
  date: string;
  callTime: string;
  status: 'Completed' | 'Live Filming' | 'Scheduled';
}

interface Invoice {
  id: string;
  number: string;
  project: string;
  amount: string;
  date: string;
  status: 'Paid' | 'Pending Escrow' | 'Overdue';
}

export function ClientDashboardClient({ user }: ClientDashboardClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams ? searchParams.get('tab') || 'overview' : 'overview';

  // State
  const [projects, setProjects] = useState<CampaignProject[]>([
    { id: 'cp-1', title: 'Autumn Editorial Lookbook Film', category: 'Fashion & Lookbook', stage: 'Post-Production', progress: 75, deliveryDate: 'Aug 18, 2026', director: 'Alok Verma' },
    { id: 'cp-2', title: 'Air Max Pulse Video Campaign', category: 'Commercial Video', stage: 'Filming', progress: 40, deliveryDate: 'Sep 05, 2026', director: 'Siddharth Roy' },
    { id: 'cp-3', title: 'Spring Digital Social Shorts', category: 'Reels & TikTok', stage: 'Pre-production', progress: 15, deliveryDate: 'Oct 12, 2026', director: 'Alok Verma' },
    { id: 'cp-4', title: 'Winter Collection Teaser Film', category: 'Commercial Video', stage: 'Delivered', progress: 100, deliveryDate: 'Jul 20, 2026', director: 'Rohan Singhania' },
  ]);

  const [shoots, setShoots] = useState<ShootDay[]>([
    { id: 'sh-1', project: 'Air Max Pulse Video', dayNumber: 'Day 2 of 3', location: 'Stage A (Main Floor)', date: 'Today, Aug 08', callTime: '08:00 AM EST', status: 'Live Filming' },
    { id: 'sh-2', project: 'Autumn Editorial Lookbook', dayNumber: 'Day 1 of 2', location: 'Stage B (Green Screen)', date: 'Aug 10, 2026', callTime: '09:30 AM EST', status: 'Scheduled' },
    { id: 'sh-3', project: 'Spring Digital Shorts', dayNumber: 'Day 1 of 1', location: 'Stage C (Soundstage)', date: 'Sep 15, 2026', callTime: '10:00 AM EST', status: 'Scheduled' },
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'inv-1', number: 'INV-2026-089', project: 'Autumn Editorial Lookbook', amount: '₹2,40,000', date: 'Jul 15, 2026', status: 'Paid' },
    { id: 'inv-2', number: 'INV-2026-104', project: 'Air Max Pulse Video', amount: '₹6,50,000', date: 'Aug 01, 2026', status: 'Pending Escrow' },
    { id: 'inv-3', number: 'INV-2026-042', project: 'Winter Collection Teaser', amount: '₹1,85,000', date: 'Jun 10, 2026', status: 'Paid' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Commercial Video');

  const handleCreateInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const newItem: CampaignProject = {
      id: `cp-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      stage: 'Pre-production',
      progress: 10,
      deliveryDate: 'Oct 30, 2026',
      director: 'TBD (Assigning)',
    };
    setProjects(prev => [newItem, ...prev]);
    setIsModalOpen(false);
    setNewTitle('');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* OVERVIEW TAB */}
      {currentTab === 'overview' && (
        <div className="space-y-8">
          {/* Welcome Banner */}
          <div className="p-8 rounded-2xl bg-gradient-to-r from-surface via-surface-elevated to-surface border border-border relative overflow-hidden shadow-xl">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2 block">
                Brand Partner Portal &bull; VIP Access
              </span>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
                Your Production Workspace
              </h2>
              <p className="text-sm text-muted-foreground font-light max-w-2xl">
                Track live shoot statuses, review rough cuts, download escrow invoices, and browse our curated talent directory for your next brand campaign.
              </p>
            </div>
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div onClick={() => router.push('?tab=projects')} className="p-6 rounded-2xl bg-surface border border-border hover:border-blue-500/50 cursor-pointer transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">My Projects</span>
                <FolderKanban className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{projects.length}</p>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <span>2 currently filming/edit</span>
                <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
              </span>
            </div>

            <div onClick={() => router.push('?tab=shoots')} className="p-6 rounded-2xl bg-surface border border-border hover:border-blue-500/50 cursor-pointer transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Shoot Status</span>
                <Video className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-3xl font-bold text-emerald-400 mb-1">On Schedule</p>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <span>Day 2 of 3 completed</span>
                <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
              </span>
            </div>

            <div onClick={() => router.push('?tab=invoices')} className="p-6 rounded-2xl bg-surface border border-border hover:border-blue-500/50 cursor-pointer transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Invoices</span>
                <DollarSign className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{invoices.filter(i => i.status === 'Paid').length} Paid</p>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <span>{invoices.filter(i => i.status !== 'Paid').length} pending balance</span>
                <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
              </span>
            </div>

            <Link href="/talent/directory" className="block h-full group">
              <div className="p-6 rounded-2xl bg-surface border border-border h-full flex flex-col justify-between group-hover:border-brand/50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Browse Talent</span>
                  <Users className="w-5 h-5 text-brand" />
                </div>
                <p className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
                  <span>Talent Roster</span>
                  <ArrowRight className="w-4 h-4 text-brand group-hover:translate-x-1 transition-transform" />
                </p>
                <span className="text-xs text-muted-foreground">Explore models & creators</span>
              </div>
            </Link>
          </div>

          {/* Active Project Tracker */}
          <div className="p-8 rounded-2xl bg-surface border border-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Film className="w-5 h-5 text-blue-400" />
                <span>Active Campaign Milestone Tracker</span>
              </h3>
              <Link href="?tab=projects" className="text-xs text-blue-400 hover:underline font-semibold uppercase tracking-wider">
                View All Campaigns &rarr;
              </Link>
            </div>
            
            <div className="space-y-6">
              {projects.filter(p => p.stage !== 'Delivered').map(p => (
                <div key={p.id} className="p-6 rounded-xl bg-background border border-border space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{p.category}</span>
                      <h4 className="text-xl font-serif font-bold text-foreground">{p.title}</h4>
                      <p className="text-xs text-muted-foreground">Lead Director: <strong className="text-foreground">{p.director}</strong> &bull; Est. Delivery: {p.deliveryDate}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold w-fit">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>{p.stage} ({p.progress}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-[#e11d48] h-full rounded-full transition-all duration-500" style={{ width: `${p.progress}%` }} />
                  </div>
                  <div className="grid grid-cols-4 text-[11px] text-muted-foreground">
                    <span className="text-emerald-400 font-medium">&bull; Pre-Production</span>
                    <span className={p.progress >= 40 ? 'text-emerald-400 font-medium' : ''}>&bull; Filming</span>
                    <span className={p.progress >= 75 ? 'text-emerald-400 font-medium' : ''}>&bull; Post-Production</span>
                    <span className="text-right">&bull; Final Delivery</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PROJECTS TAB */}
      {currentTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-1">My Brand Campaigns & Films</h2>
              <p className="text-xs text-muted-foreground">Review deliverables, track edit revisions, and submit new production briefs.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-foreground px-4 py-2.5 rounded-xl text-xs font-semibold shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Campaign Brief</span>
            </button>
          </div>

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fadeIn">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <h3 className="text-lg font-bold text-foreground">Submit New Campaign Brief</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleCreateInquiry} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">Campaign Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Autumn Footwear Promo"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-foreground mb-1">Production Category</label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-blue-500"
                    >
                      <option value="Commercial Video">Commercial Video</option>
                      <option value="Fashion & Lookbook">Fashion & Lookbook</option>
                      <option value="Reels & TikTok">Reels & TikTok Shorts</option>
                      <option value="Virtual Production">Virtual Soundstage Production</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-accent hover:text-accent-foreground font-semibold">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-foreground hover:bg-blue-500 font-semibold">Submit Brief</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map(p => (
              <div key={p.id} className="p-6 rounded-2xl bg-surface border border-border space-y-4 hover:border-blue-500/50 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">{p.category}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      p.stage === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      p.stage === 'Filming' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 animate-pulse' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {p.stage}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Lead Director: {p.director}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress:</span>
                    <strong className="text-foreground">{p.progress}%</strong>
                  </div>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${p.progress}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                    <span>Est. Delivery:</span>
                    <span className="text-foreground font-medium">{p.deliveryDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SHOOTS TAB */}
      {currentTab === 'shoots' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Live Shoot Day Tracker</h2>
              <p className="text-xs text-muted-foreground">Live studio stage assignments, call sheets, and daily filming schedules.</p>
            </div>
          </div>

          <div className="space-y-4">
            {shoots.map(s => (
              <div key={s.id} className="p-6 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-blue-500/50 transition-all">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    s.status === 'Live Filming' ? 'bg-brand/20 text-brand border border-[#e11d48]/40 animate-pulse' :
                    'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                  }`}>
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{s.project}</span>
                      <span className="text-neutral-600">&bull;</span>
                      <span className="text-xs text-foreground font-medium">{s.dayNumber}</span>
                    </div>
                    <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{s.location}</span>
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">Date: <strong className="text-foreground">{s.date}</strong> &bull; Call Time: <strong className="text-foreground">{s.callTime}</strong></p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    s.status === 'Live Filming' ? 'bg-brand text-primary-foreground shadow-[0_0_15px_rgba(225,29,72,0.4)]' :
                    'bg-muted text-foreground border border-border'
                  }`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INVOICES TAB */}
      {currentTab === 'invoices' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Escrow Invoices & Billing</h2>
              <p className="text-xs text-muted-foreground">Review production balances, download PDF tax receipts, and check escrow payment milestones.</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-muted-foreground text-[11px] font-semibold uppercase tracking-widest">
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Campaign Project</th>
                  <th className="p-4">Billing Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>{inv.number}</span>
                    </td>
                    <td className="p-4 font-semibold text-neutral-200">{inv.project}</td>
                    <td className="p-4 text-muted-foreground">{inv.date}</td>
                    <td className="p-4 font-mono font-bold text-emerald-400 text-sm">{inv.amount}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        inv.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => alert(`Downloading ${inv.number} PDF receipt...`)}
                        className="px-3 py-1.5 rounded-lg bg-muted hover:bg-accent hover:text-accent-foreground text-foreground font-semibold flex items-center gap-1.5 ml-auto transition-colors border border-border"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

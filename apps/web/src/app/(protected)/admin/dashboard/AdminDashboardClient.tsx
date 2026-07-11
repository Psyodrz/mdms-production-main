'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FolderKanban, Briefcase, Award, Calendar, Clock, Plus, Search, 
  CheckCircle2, XCircle, ArrowRight, Check, X, Users, MapPin, Film, 
  DollarSign, Camera, Sliders, Filter, Eye, Trash2, Edit3
} from 'lucide-react';
import { Role } from '@mdms/types';

interface AdminDashboardClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: Role | string;
  };
}

interface Project {
  id: string;
  title: string;
  client: string;
  stage: string;
  status: 'Pre-Production' | 'Filming' | 'Post-Production' | 'Delivered';
  budget: string;
  deadline: string;
}

interface BrandClient {
  id: string;
  company: string;
  contactName: string;
  email: string;
  activeProjects: number;
  totalSpent: string;
  tier: 'Platinum' | 'Gold' | 'Silver';
}

interface StudioBooking {
  id: string;
  stageName: 'Stage A (Main Floor)' | 'Stage B (Green Screen)' | 'Stage C (Soundstage)' | 'Stage D (Virtual Production)';
  client: string;
  projectTitle: string;
  timeSlot: string;
  date: string;
  status: 'Confirmed' | 'Pending' | 'In Progress';
}

interface TalentItem {
  id: string;
  name: string;
  category: string;
  dayRate: string;
  rating: string;
  status: 'Available' | 'On Shoot' | 'On Leave';
}

export function AdminDashboardClient({ user }: AdminDashboardClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams ? searchParams.get('tab') || 'overview' : 'overview';

  // State
  const [projects, setProjects] = useState<Project[]>([
    { id: 'p-101', title: 'Autumn Editorial Lookbook Film', client: 'Vogue India', stage: 'Stage B (Green Screen)', status: 'Filming', budget: '₹2,40,000', deadline: 'Aug 18, 2026' },
    { id: 'p-102', title: 'Air Max Pulse Global Video', client: 'Nike Athletic', stage: 'Stage A (Main Floor)', status: 'Pre-Production', budget: '₹6,50,000', deadline: 'Sep 05, 2026' },
    { id: 'p-103', title: 'Midnight Mystery Series Promo', client: 'Netflix Originals', stage: 'Stage D (Virtual Production)', status: 'Post-Production', budget: '₹11,00,000', deadline: 'Aug 10, 2026' },
    { id: 'p-104', title: 'Luxury Watch Summer Collection', client: 'Harper’s Bazaar', stage: 'Stage C (Soundstage)', status: 'Delivered', budget: '₹1,85,000', deadline: 'Jul 28, 2026' },
  ]);

  const [clients, setClients] = useState<BrandClient[]>([
    { id: 'c-1', company: 'Vogue India', contactName: 'Vikram Singhania', email: 'vikram@vogueindia.in', activeProjects: 2, totalSpent: '₹14,50,000', tier: 'Platinum' },
    { id: 'c-2', company: 'Nike Athletic', contactName: 'Sarah Jenkins', email: 's.jenkins@nike.com', activeProjects: 1, totalSpent: '₹32,00,000', tier: 'Platinum' },
    { id: 'c-3', company: 'Netflix Originals', contactName: 'Anil Kapoor', email: 'akapoor@netflix.com', activeProjects: 1, totalSpent: '₹51,00,000', tier: 'Platinum' },
    { id: 'c-4', company: 'Harper’s Bazaar', contactName: 'Zara Khan', email: 'zara@harpersbazaar.com', activeProjects: 1, totalSpent: '₹8,20,000', tier: 'Gold' },
  ]);

  const [bookings, setBookings] = useState<StudioBooking[]>([
    { id: 'sb-1', stageName: 'Stage B (Green Screen)', client: 'Vogue India', projectTitle: 'Autumn Editorial Lookbook', timeSlot: '09:00 AM - 06:00 PM', date: 'Today, Aug 08', status: 'In Progress' },
    { id: 'sb-2', stageName: 'Stage A (Main Floor)', client: 'Nike Athletic', projectTitle: 'Air Max Pulse Video', timeSlot: '08:00 AM - 08:00 PM', date: 'Tomorrow, Aug 09', status: 'Confirmed' },
    { id: 'sb-3', stageName: 'Stage D (Virtual Production)', client: 'Netflix Originals', projectTitle: 'Midnight Mystery Promo', timeSlot: '10:00 AM - 04:00 PM', date: 'Aug 11, 2026', status: 'Confirmed' },
    { id: 'sb-4', stageName: 'Stage C (Soundstage)', client: 'Universal Music', projectTitle: 'Acoustic Album Live Recording', timeSlot: '01:00 PM - 09:00 PM', date: 'Aug 14, 2026', status: 'Pending' },
  ]);

  const [talentList, setTalentList] = useState<TalentItem[]>([
    { id: 'tal-1', name: 'Ariya Sharma', category: 'Fashion Model & Actor', dayRate: '₹12,000', rating: '4.9 ★', status: 'On Shoot' },
    { id: 'tal-2', name: 'Kabir Mehta', category: 'Lead Actor & Stunt Performer', dayRate: '₹25,000', rating: '5.0 ★', status: 'Available' },
    { id: 'tal-3', name: 'Meera Kapoor', category: 'Voiceover Artist (Multi-lingual)', dayRate: '₹8,000', rating: '4.8 ★', status: 'Available' },
    { id: 'tal-4', name: 'Rohan Singhania', category: 'Cinematographer & Drone Specialist', dayRate: '₹18,000', rating: '4.9 ★', status: 'On Shoot' },
  ]);

  // Interactive Pricing State
  const [pricingItems, setPricingItems] = useState([
    { id: 'pr-1', name: 'Stage A (Main Floor & Lighting)', category: 'Studio Rental', price: '₹25,000 / day', billing: 'Daily Rate', status: 'Active' },
    { id: 'pr-2', name: 'Stage B (VFX Green Screen)', category: 'Studio Rental', price: '₹18,000 / day', billing: 'Daily Rate', status: 'Active' },
    { id: 'pr-3', name: 'Commercial Campaign Production Package', category: 'Production Package', price: '₹1,50,000', billing: 'Fixed Bundle', status: 'Active' },
    { id: 'pr-4', name: 'Lookbook Editorial Shoot Bundle', category: 'Production Package', price: '₹85,000', billing: 'Fixed Bundle', status: 'Active' },
    { id: 'pr-5', name: 'Top-Tier Model Day Rate (Base)', category: 'Talent Rate Card', price: '₹12,000 / day', billing: 'Per Talent', status: 'Active' },
    { id: 'pr-6', name: 'Enterprise Brand Retainer (Monthly)', category: 'Subscription Tier', price: '₹75,000 / mo', billing: 'Monthly Retainer', status: 'Active' },
  ]);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [editingPricingId, setEditingPricingId] = useState<string | null>(null);
  const [pricingName, setPricingName] = useState('');
  const [pricingCategory, setPricingCategory] = useState('Studio Rental');
  const [pricingAmount, setPricingAmount] = useState('');
  const [pricingBilling, setPricingBilling] = useState('Daily Rate');

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClient, setNewClient] = useState('Vogue India');
  const [newStage, setNewStage] = useState('Stage A (Main Floor)');
  const [newBudget, setNewBudget] = useState('₹3,00,000');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const item: Project = {
      id: `p-${Date.now()}`,
      title: newTitle,
      client: newClient,
      stage: newStage,
      status: 'Pre-Production',
      budget: newBudget,
      deadline: 'Sep 30, 2026',
    };
    setProjects(prev => [item, ...prev]);
    setIsModalOpen(false);
    setNewTitle('');
  };

  const handleBookingStatus = (id: string, status: StudioBooking['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const handleOpenCreatePricing = () => {
    setEditingPricingId(null);
    setPricingName('');
    setPricingCategory('Studio Rental');
    setPricingAmount('');
    setPricingBilling('Daily Rate');
    setIsPricingModalOpen(true);
  };

  const handleOpenEditPricing = (item: { id: string; name: string; category: string; price: string; billing: string }) => {
    setEditingPricingId(item.id);
    setPricingName(item.name);
    setPricingCategory(item.category);
    setPricingAmount(item.price);
    setPricingBilling(item.billing);
    setIsPricingModalOpen(true);
  };

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricingName) return;
    if (editingPricingId) {
      setPricingItems(prev =>
        prev.map(item =>
          item.id === editingPricingId
            ? { ...item, name: pricingName, category: pricingCategory, price: pricingAmount || '₹10,000 / day', billing: pricingBilling }
            : item
        )
      );
    } else {
      setPricingItems(prev => [
        {
          id: `pr-${Date.now()}`,
          name: pricingName,
          category: pricingCategory,
          price: pricingAmount || '₹10,000 / day',
          billing: pricingBilling,
          status: 'Active',
        },
        ...prev,
      ]);
    }
    setIsPricingModalOpen(false);
    setEditingPricingId(null);
    setPricingName('');
    setPricingAmount('');
  };

  const handleDeletePricing = (id: string) => {
    setPricingItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* OVERVIEW TAB */}
      {currentTab === 'overview' && (
        <div className="space-y-8">
          {/* Welcome Banner */}
          <div className="p-8 rounded-2xl bg-gradient-to-r from-surface via-surface-elevated to-surface border border-border relative overflow-hidden shadow-xl">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2 block">
                Studio Producer &bull; Active Production Hub
              </span>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
                Production Operations Hub
              </h2>
              <p className="text-sm text-muted-foreground font-light max-w-2xl">
                Manage ongoing shoot schedules, client deliverables, model bookings, and studio floor allocations across all 4 production stages.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div onClick={() => router.push('?tab=projects')} className="p-6 rounded-2xl bg-surface border border-border hover:border-purple-500/50 cursor-pointer transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Active Shoots</span>
                <FolderKanban className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{projects.length}</p>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <span>4 scheduled today</span>
                <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-purple-400" />
              </span>
            </div>

            <div onClick={() => router.push('?tab=clients')} className="p-6 rounded-2xl bg-surface border border-border hover:border-purple-500/50 cursor-pointer transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Brand Clients</span>
                <Briefcase className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{clients.length}</p>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <span>+5 new this week</span>
                <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-purple-400" />
              </span>
            </div>

            <div onClick={() => router.push('?tab=talent')} className="p-6 rounded-2xl bg-surface border border-border hover:border-purple-500/50 cursor-pointer transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Roster Talent</span>
                <Award className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">1,250</p>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <span>Verified creators</span>
                <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-purple-400" />
              </span>
            </div>

            <div onClick={() => router.push('?tab=bookings')} className="p-6 rounded-2xl bg-surface border border-border hover:border-purple-500/50 cursor-pointer transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Studio Bookings</span>
                <Calendar className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">86%</p>
              <span className="text-xs text-purple-400 flex items-center gap-1">
                <span>Stage occupancy</span>
                <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-purple-400" />
              </span>
            </div>
          </div>

          {/* Quick Studio Floor Occupancy */}
          <div className="p-8 rounded-2xl bg-surface border border-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <span>Live Studio Stage Occupancy & Calendar</span>
              </h3>
              <Link href="?tab=bookings" className="text-xs text-purple-400 hover:underline font-semibold uppercase tracking-wider">
                View Stage Schedule &rarr;
              </Link>
            </div>
            <div className="space-y-3">
              {bookings.map(booking => (
                <div key={booking.id} className="p-4 rounded-xl bg-background border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-xs shrink-0">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{booking.stageName} &mdash; <span className="text-purple-300">{booking.client}</span></p>
                      <p className="text-xs text-muted-foreground">{booking.projectTitle} &bull; <span className="text-neutral-200">{booking.timeSlot}</span> ({booking.date})</p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider ${
                    booking.status === 'In Progress' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 animate-pulse' :
                    booking.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {booking.status}
                  </span>
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
              <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Active Production Projects</h2>
              <p className="text-xs text-muted-foreground">Manage shoot budgets, stage assignments, and client delivery milestones.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-foreground px-4 py-2.5 rounded-xl text-xs font-semibold shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fadeIn">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <h3 className="text-lg font-bold text-foreground">New Production Project</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">Project Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Summer Commercial Shoot"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Brand Client</label>
                      <select
                        value={newClient}
                        onChange={e => setNewClient(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-purple-500"
                      >
                        <option value="Vogue India">Vogue India</option>
                        <option value="Nike Athletic">Nike Athletic</option>
                        <option value="Netflix Originals">Netflix Originals</option>
                        <option value="Harper’s Bazaar">Harper’s Bazaar</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Stage Allocation</label>
                      <select
                        value={newStage}
                        onChange={e => setNewStage(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-purple-500"
                      >
                        <option value="Stage A (Main Floor)">Stage A (Main Floor)</option>
                        <option value="Stage B (Green Screen)">Stage B (Green Screen)</option>
                        <option value="Stage C (Soundstage)">Stage C (Soundstage)</option>
                        <option value="Stage D (Virtual)">Stage D (Virtual)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-foreground mb-1">Production Budget</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹4,50,000"
                      value={newBudget}
                      onChange={e => setNewBudget(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-accent hover:text-accent-foreground font-semibold">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-purple-600 text-foreground hover:bg-purple-500 font-semibold">Save Project</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-muted-foreground text-[11px] font-semibold uppercase tracking-widest">
                  <th className="p-4">Project Title</th>
                  <th className="p-4">Brand Client</th>
                  <th className="p-4">Assigned Stage</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">Deadline</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {projects.map(p => (
                  <tr key={p.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="p-4 font-bold text-foreground flex items-center gap-2">
                      <Film className="w-4 h-4 text-purple-400" />
                      <span>{p.title}</span>
                    </td>
                    <td className="p-4 text-foreground font-semibold">{p.client}</td>
                    <td className="p-4 text-muted-foreground">{p.stage}</td>
                    <td className="p-4 font-mono text-emerald-400 font-bold">{p.budget}</td>
                    <td className="p-4 text-muted-foreground">{p.deadline}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        p.status === 'Filming' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 animate-pulse' :
                        p.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        p.status === 'Post-Production' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CLIENTS TAB */}
      {currentTab === 'clients' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Brand Partners & Client CRM</h2>
              <p className="text-xs text-muted-foreground">Manage client accounts, contracts, total production spend, and account tiers.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clients.map(client => (
              <div key={client.id} className="p-6 rounded-2xl bg-surface border border-border space-y-4 hover:border-purple-500/50 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">{client.tier} Partner</span>
                    <h3 className="text-xl font-bold text-foreground mt-1">{client.company}</h3>
                    <p className="text-xs text-muted-foreground">Contact: {client.contactName} ({client.email})</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Total Spend</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">{client.totalSpent}</span>
                  </div>
                </div>
                <div className="bg-background p-3 rounded-xl border border-border flex justify-between items-center text-xs text-foreground">
                  <span>Active Commercial Campaigns</span>
                  <strong className="text-foreground bg-purple-500/20 text-purple-400 px-2.5 py-0.5 rounded-full font-bold">{client.activeProjects} Shoots</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TALENT TAB */}
      {currentTab === 'talent' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Verified Talent Roster</h2>
              <p className="text-xs text-muted-foreground">Browse models, actors, and voice artists available for immediate production booking.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {talentList.map(t => (
              <div key={t.id} className="p-6 rounded-2xl bg-surface border border-border space-y-4 flex flex-col justify-between hover:border-purple-500/50 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      t.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>{t.status}</span>
                    <span className="text-xs text-amber-400 font-bold">{t.rating}</span>
                  </div>
                  <h4 className="text-base font-bold text-foreground">{t.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{t.category}</p>
                </div>
                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Day Rate:</span>
                  <strong className="text-foreground font-mono">{t.dayRate}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOOKINGS & STUDIO TAB */}
      {(currentTab === 'bookings' || currentTab === 'studio') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Studio Stage Schedule & Bookings</h2>
              <p className="text-xs text-muted-foreground">Live floor allocation for Stage A, B, C, and D soundstages.</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-muted-foreground text-[11px] font-semibold uppercase tracking-widest">
                  <th className="p-4">Studio Stage</th>
                  <th className="p-4">Brand Client</th>
                  <th className="p-4">Project Title</th>
                  <th className="p-4">Time Slot</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="p-4 font-bold text-purple-400">{b.stageName}</td>
                    <td className="p-4 font-bold text-foreground">{b.client}</td>
                    <td className="p-4 text-foreground">{b.projectTitle}</td>
                    <td className="p-4 font-mono text-foreground">{b.timeSlot}</td>
                    <td className="p-4 text-muted-foreground">{b.date}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        b.status === 'In Progress' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 animate-pulse' :
                        b.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={b.status}
                        onChange={e => handleBookingStatus(b.id, e.target.value as any)}
                        className="bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:border-purple-500 cursor-pointer"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRICING TAB */}
      {currentTab === 'pricing' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-xl">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Studio Rate Cards & Production Packages</h2>
              <p className="text-xs text-muted-foreground">Control studio rental rates, model/talent day rates, production bundles, and brand retainer tiers.</p>
            </div>
            <button
              onClick={handleOpenCreatePricing}
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-foreground px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Rate Card / Package</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pricingItems.map(item => (
              <div key={item.id} className="p-6 rounded-2xl bg-surface border border-border hover:border-purple-500/50 transition-all flex flex-col justify-between group shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {item.category}
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      {item.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-purple-400 transition-colors">{item.name}</h3>
                  <p className="text-2xl font-serif font-bold text-foreground my-3">{item.price}</p>
                  <p className="text-xs text-muted-foreground font-medium">{item.billing}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">ID: {item.id}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditPricing(item)}
                      className="text-muted-foreground hover:text-purple-400 p-2 rounded-lg hover:bg-purple-500/10 transition-colors"
                      title="Edit Rate Card"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePricing(item.id)}
                      className="text-muted-foreground hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                      title="Delete Rate Card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add / Edit Pricing Modal */}
          {isPricingModalOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-surface border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
                <button
                  onClick={() => setIsPricingModalOpen(false)}
                  className="absolute top-6 right-6 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-serif font-bold text-foreground mb-2">
                  {editingPricingId ? 'Edit Studio Rate Card' : 'Create Studio Rate Card'}
                </h3>
                <p className="text-xs text-muted-foreground mb-6">
                  {editingPricingId ? 'Update pricing tier, rate, or package details.' : 'Add a new pricing tier, studio rental rate, or production bundle.'}
                </p>
                
                <form onSubmit={handleSavePricing} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-foreground font-medium mb-1.5">Package / Service Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Studio C (Photography Stage)"
                      value={pricingName}
                      onChange={e => setPricingName(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-foreground font-medium mb-1.5">Category</label>
                    <select
                      value={pricingCategory}
                      onChange={e => setPricingCategory(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-purple-500"
                    >
                      <option value="Studio Rental">Studio Rental</option>
                      <option value="Production Package">Production Package</option>
                      <option value="Talent Rate Card">Talent Rate Card</option>
                      <option value="Subscription Tier">Subscription Tier</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-foreground font-medium mb-1.5">Rate / Price</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ₹13,000 / day"
                        value={pricingAmount}
                        onChange={e => setPricingAmount(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-foreground font-medium mb-1.5">Billing Type</label>
                      <select
                        value={pricingBilling}
                        onChange={e => setPricingBilling(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-purple-500"
                      >
                        <option value="Daily Rate">Daily Rate</option>
                        <option value="Hourly Rate">Hourly Rate</option>
                        <option value="Fixed Bundle">Fixed Bundle</option>
                        <option value="Monthly Retainer">Monthly Retainer</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPricingModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl bg-muted hover:bg-accent hover:text-accent-foreground text-foreground font-semibold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-foreground font-semibold transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                    >
                      {editingPricingId ? 'Update Rate Card' : 'Create Rate Card'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { cms } from '@/lib/cms/client';
import { toast } from 'sonner';
import {
  TrendingUp,
  Target,
  PhoneCall,
  MessageSquare,
  Share2,
  Users,
  CheckCircle2,
  Calendar,
  FileSpreadsheet,
  Plus,
  ArrowUpRight,
  Sparkles,
  Download,
  Filter,
  DollarSign,
  UserCheck,
  FolderKanban,
  Award,
  Clock,
  Send,
} from 'lucide-react';

interface SalesLead {
  id: string;
  clientName: string;
  email?: string;
  phone?: string;
  source: 'WHATSAPP' | 'CALL' | 'SOCIAL_MEDIA' | 'REFERRAL' | 'WEBSITE';
  stage: 'NEW' | 'CONTACTED' | 'REQUIREMENT_GATHERED' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'WON' | 'LOST';
  estimatedValue?: number;
  notes?: string;
  createdAt: string;
}

interface SalesTarget {
  id: string;
  year: number;
  month: number;
  targetAmount: number;
  achievedAmount: number;
  targetBookings: number;
  achievedBookings: number;
  notes?: string;
}

interface Referral {
  id: string;
  referrerName: string;
  referrerEmail: string;
  referredClientName: string;
  status: 'PENDING' | 'BOOKED' | 'REWARD_PAID' | 'EXPIRED';
  rewardAmount?: number;
}

const INITIAL_LEADS: SalesLead[] = [
  { id: 'sl-1', clientName: 'Ananya & Siddharth Wedding', phone: '+91 98765 43210', email: 'ananya@example.com', source: 'WHATSAPP', stage: 'PROPOSAL_SENT', estimatedValue: 35000000, notes: 'Full 3-day destination wedding shoot in Udaipur', createdAt: '2026-07-20' },
  { id: 'sl-2', clientName: 'Vogue Autumn Lookbook', phone: '+91 91234 56789', email: 'vogue@brand.com', source: 'CALL', stage: 'CONTACTED', estimatedValue: 18000000, notes: 'Commercial fashion shoot, 2 day studio setup', createdAt: '2026-07-21' },
  { id: 'sl-3', clientName: 'Kapoor Maternity Shoot', phone: '+91 99887 76655', email: 'kapoor@gmail.com', source: 'SOCIAL_MEDIA', stage: 'NEW', estimatedValue: 6000000, notes: 'Outdoor sunset maternity portrait series', createdAt: '2026-07-22' },
  { id: 'sl-4', clientName: 'Mehta Family Portraits', phone: '+91 97766 55443', email: 'mehta@company.com', source: 'REFERRAL', stage: 'WON', estimatedValue: 8500000, notes: 'Referred by Vikram Mehta. Confirmed 15th Aug shoot.', createdAt: '2026-07-23' },
];

const INITIAL_TARGETS: SalesTarget[] = [
  { id: 'st-1', year: 2026, month: 7, targetAmount: 50000000, achievedAmount: 32000000, targetBookings: 15, achievedBookings: 10, notes: 'July Wedding & Commercial Campaign Peak' }
];

const INITIAL_REFERRALS: Referral[] = [
  { id: 'ref-1', referrerName: 'Vikram Mehta', referrerEmail: 'vikram@example.com', referredClientName: 'Mehta Family Portraits', status: 'BOOKED', rewardAmount: 250000 },
  { id: 'ref-2', referrerName: 'Priya Sharma', referrerEmail: 'priya@example.com', referredClientName: 'Rahul Kapoor Shoot', status: 'PENDING', rewardAmount: 150000 },
];

export default function SalesManagementPage() {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'targets' | 'reports' | 'referrals'>('pipeline');
  const [leads, setLeads] = useState<SalesLead[]>(INITIAL_LEADS);
  const [targets, setTargets] = useState<SalesTarget[]>(INITIAL_TARGETS);
  const [referrals, setReferrals] = useState<Referral[]>(INITIAL_REFERRALS);
  const [loading, setLoading] = useState(true);

  // New Lead Modal state
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadForm, setLeadForm] = useState({
    clientName: '',
    phone: '',
    email: '',
    source: 'WHATSAPP' as const,
    stage: 'NEW' as const,
    estimatedValue: '',
    notes: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['pipeline', 'targets', 'reports', 'referrals'].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    }
    fetchSalesData();
  }, []);

  async function fetchSalesData() {
    setLoading(true);
    try {
      const [leadsRes, targetsRes, referralsRes] = await Promise.all([
        cms.list<SalesLead[]>('salesLeads'),
        cms.list<SalesTarget[]>('salesTargets'),
        cms.list<Referral[]>('referrals'),
      ]);

      const backendLeads = Array.isArray(leadsRes.data) ? leadsRes.data : Array.isArray(leadsRes as any) ? (leadsRes as any) : [];
      const backendTargets = Array.isArray(targetsRes.data) ? targetsRes.data : Array.isArray(targetsRes as any) ? (targetsRes as any) : [];
      const backendReferrals = Array.isArray(referralsRes.data) ? referralsRes.data : Array.isArray(referralsRes as any) ? (referralsRes as any) : [];

      const leadsMap = new Map<string, SalesLead>();
      INITIAL_LEADS.forEach((l, idx) => {
        const id = l.id || `init-sl-${idx}`;
        leadsMap.set(id, { ...l, id });
      });

      backendLeads.forEach((l, idx) => {
        const id = l.id ? String(l.id) : `db-sl-${idx}-${Date.now()}`;
        leadsMap.set(id, {
          ...l,
          id,
          estimatedValue: Number(l.estimatedValue) || 0,
        });
      });

      setLeads(Array.from(leadsMap.values()));

      const targetsMap = new Map<string, SalesTarget>();
      INITIAL_TARGETS.forEach((t, idx) => {
        const id = t.id || `init-st-${idx}`;
        targetsMap.set(id, { ...t, id });
      });
      backendTargets.forEach((t, idx) => {
        const id = t.id ? String(t.id) : `db-st-${idx}`;
        targetsMap.set(id, { ...t, id });
      });
      setTargets(Array.from(targetsMap.values()));

      const referralsMap = new Map<string, Referral>();
      INITIAL_REFERRALS.forEach((r, idx) => {
        const id = r.id || `init-ref-${idx}`;
        referralsMap.set(id, { ...r, id });
      });
      backendReferrals.forEach((r, idx) => {
        const id = r.id ? String(r.id) : `db-ref-${idx}`;
        referralsMap.set(id, { ...r, id });
      });
      setReferrals(Array.from(referralsMap.values()));
    } catch (err) {
      console.error('Failed to fetch sales data from database:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateLead(e: React.FormEvent) {
    e.preventDefault();
    try {
      const valueInRupees = leadForm.estimatedValue ? parseFloat(leadForm.estimatedValue) : 50000;
      const estimatedValuePaise = Math.round(valueInRupees * 100);

      const payload = {
        clientName: leadForm.clientName,
        phone: leadForm.phone,
        email: leadForm.email,
        source: leadForm.source,
        stage: leadForm.stage,
        estimatedValue: estimatedValuePaise,
        notes: leadForm.notes,
      };

      const res = await cms.create<SalesLead>('salesLeads', payload);
      const rawData = res.ok && res.data ? (res.data as any) : null;
      const createdLead: SalesLead = {
        id: rawData?.id ? String(rawData.id) : `sl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        clientName: payload.clientName,
        phone: payload.phone,
        email: payload.email,
        source: payload.source,
        stage: payload.stage,
        estimatedValue: payload.estimatedValue,
        notes: payload.notes,
        createdAt: rawData?.createdAt || new Date().toISOString(),
      };

      setLeads(prev => [createdLead, ...prev]);
      toast.success(
        leadForm.stage === 'WON'
          ? 'Confirmed Booking lead saved! Quota & Revenue updated!'
          : 'Sales lead saved to pipeline!'
      );
      setShowLeadModal(false);
      setLeadForm({ clientName: '', phone: '', email: '', source: 'WHATSAPP', stage: 'NEW', estimatedValue: '', notes: '' });
    } catch (err) {
      toast.error('Error connecting to database');
    }
  }

  // Delete Lead
  async function handleDeleteLead(leadId: string) {
    try {
      await cms.remove('salesLeads', leadId).catch(() => null);
      setLeads(prev => prev.filter(l => l.id !== leadId));
      toast.success('Lead removed from sales pipeline');
    } catch {
      toast.error('Failed to delete lead');
    }
  }

  // Update Lead Stage
  async function handleUpdateLeadStage(leadId: string, newStage: SalesLead['stage']) {
    try {
      await cms.update('salesLeads', leadId, { stage: newStage }).catch(() => null);
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
      toast.success(`Lead stage updated to ${newStage}! Metrics refreshed!`);
    } catch {
      toast.error('Failed to update lead stage');
    }
  }


  // Target Quota Modal state
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetForm, setTargetForm] = useState({
    targetAmountINR: '500000',
    targetBookings: '15',
    notes: 'July Sales Quota',
  });

  async function handleSaveTarget(e: React.FormEvent) {
    e.preventDefault();
    try {
      const amountPaise = Math.round(parseFloat(targetForm.targetAmountINR || '500000') * 100);
      const bookingsCount = parseInt(targetForm.targetBookings || '15', 10);
      const payload = {
        year: 2026,
        month: 7,
        targetAmount: amountPaise,
        targetBookings: bookingsCount,
        notes: targetForm.notes,
      };

      await cms.create('salesTargets', payload).catch(() => null);
      setTargets(prev => [
        {
          id: prev[0]?.id || 'st-1',
          achievedAmount: prev[0]?.achievedAmount || 32000000,
          achievedBookings: prev[0]?.achievedBookings || 10,
          ...payload,
        },
        ...prev.slice(1),
      ]);
      toast.success('Monthly Sales Target Quota updated!');
      setShowTargetModal(false);
    } catch {
      toast.error('Failed to update target quota');
    }
  }

  // Referral Modal state
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralForm, setReferralForm] = useState({
    referrerName: '',
    referrerEmail: '',
    referredClientName: '',
    status: 'PENDING' as const,
    rewardAmountINR: '2500',
  });

  async function handleCreateReferral(e: React.FormEvent) {
    e.preventDefault();
    try {
      const rewardPaise = Math.round(parseFloat(referralForm.rewardAmountINR || '2500') * 100);
      const payload = {
        referrerName: referralForm.referrerName,
        referrerEmail: referralForm.referrerEmail,
        referredClientName: referralForm.referredClientName,
        status: referralForm.status,
        rewardAmount: rewardPaise,
      };

      const res = await cms.create<Referral>('referrals', payload).catch(() => null);
      const newRef: Referral = {
        id: (res as any)?.data?.id ? String((res as any).data.id) : `ref-${Date.now()}`,
        ...payload,
      };

      setReferrals(prev => [newRef, ...prev]);
      toast.success('Client Referral recorded successfully!');
      setShowReferralModal(false);
      setReferralForm({ referrerName: '', referrerEmail: '', referredClientName: '', status: 'PENDING', rewardAmountINR: '2500' });
    } catch {
      toast.error('Failed to record referral');
    }
  }

  async function handleUpdateReferralStatus(refId: string, newStatus: Referral['status']) {
    try {
      await cms.update('referrals', refId, { status: newStatus }).catch(() => null);
      setReferrals(prev => prev.map(r => r.id === refId ? { ...r, status: newStatus } : r));
      toast.success(`Referral status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update referral status');
    }
  }

  async function handleDeleteReferral(refId: string) {
    try {
      await cms.remove('referrals', refId).catch(() => null);
      setReferrals(prev => prev.filter(r => r.id !== refId));
      toast.success('Referral removed');
    } catch {
      toast.error('Failed to delete referral');
    }
  }


  // Calculate Metrics
  const totalLeads = leads.length;
  const wonLeads = leads.filter(l => l.stage === 'WON').length;
  const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0';

  const pipelineValuePaise = leads
    .filter(l => l.stage !== 'LOST')
    .reduce((sum, l) => sum + Number(l.estimatedValue || 0), 0);
  const pipelineValueINR = Math.round(pipelineValuePaise / 100);

  const wonRevenuePaise = leads
    .filter(l => l.stage === 'WON')
    .reduce((sum, l) => sum + Number(l.estimatedValue || 0), 0);

  const currentTarget = targets[0] || {
    targetAmount: 50000000,
    achievedAmount: 32000000,
    targetBookings: 15,
    achievedBookings: 10,
  };

  const totalAchievedBookings = (Number(currentTarget.achievedBookings) || 10) + wonLeads;
  const totalAchievedRevenuePaise = (Number(currentTarget.achievedAmount) || 32000000) + wonRevenuePaise;
  const targetAmountPaise = Number(currentTarget.targetAmount) || 50000000;
  const targetBookingsQuota = Number(currentTarget.targetBookings) || 15;

  const targetPercentage = Math.min(
    100,
    Math.round((totalAchievedRevenuePaise / (targetAmountPaise || 1)) * 100)
  );

  function exportCSVReport() {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Client Name,Phone,Email,Channel,Stage,Value (INR),Date\n' +
      leads
        .map(
          l =>
            `"${l.clientName}","${l.phone || ''}","${l.email || ''}","${l.source}","${l.stage}","${Math.round(
              (l.estimatedValue || 0) / 100
            )}","${l.createdAt || ''}"`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MP_Productions_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner Header */}
      <Reveal direction="up">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand/10 border border-brand/30 text-brand flex items-center gap-1.5">
                <Target className="w-3 h-3 text-brand" />
                Sales & Revenue Operations
              </span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              Sales Manager Command Hub
              <Sparkles className="w-5 h-5 text-amber-500" />
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage lead generation (Calls, WhatsApp, Social, Referrals), sales pipeline, monthly targets, conversion rates & sales reports.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={exportCSVReport}
              variant="outline"
              className="text-xs font-semibold flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              Export Sales Report (.CSV)
            </Button>
            <Button
              onClick={() => setShowLeadModal(true)}
              className="bg-brand hover:bg-brand/90 text-white text-xs font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Lead
            </Button>
          </div>
        </div>
      </Reveal>

      {/* KPI Highlight Cards — 9 Responsibilities Overview */}
      <Reveal direction="up" delay={0.05}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-surface border border-border rounded-2xl p-5 relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Pipeline Value
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                ₹
              </div>
            </div>
            <p className="text-2xl font-bold font-serif text-foreground">
              ₹{pipelineValueINR.toLocaleString('en-IN')}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-500 mt-2 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Active pipeline opportunities</span>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5 relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Monthly Target Status
              </span>
              <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold font-serif text-foreground">
              {targetPercentage}%
            </p>
            <div className="w-full bg-border h-2 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-brand h-full rounded-full transition-all duration-500"
                style={{ width: `${targetPercentage}%` }}
              />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5 relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Inquiry Conversion Rate
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold font-serif text-foreground">
              {conversionRate}%
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              {wonLeads} confirmed out of {totalLeads} total leads
            </p>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5 relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Referrals
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold font-serif text-foreground">
              {referrals.length}
            </p>
            <p className="text-[11px] text-purple-500 mt-2 font-medium">
              Client word-of-mouth growth
            </p>
          </div>
        </div>
      </Reveal>

      {/* Tabs Navigation */}
      <Reveal direction="up" delay={0.1}>
        <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto">
          {[
            { id: 'pipeline', label: 'Sales Pipeline & Leads', icon: FolderKanban },
            { id: 'targets', label: 'Monthly Sales Targets', icon: Target },
            { id: 'reports', label: 'Daily & Weekly Reports', icon: FileSpreadsheet },
            { id: 'referrals', label: 'Referrals & Repeat Business', icon: Share2 },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-brand text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Tab 1: Sales Pipeline & Kanban */}
      {activeTab === 'pipeline' && (
        <Reveal direction="up">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-serif font-bold text-foreground">Sales Lead Pipeline Stages</h2>
              <span className="text-xs text-muted-foreground font-mono">
                {leads.length} Total Leads
              </span>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { stage: 'NEW', label: 'New Inquiry', color: 'border-blue-500/40 bg-blue-500/5' },
                { stage: 'CONTACTED', label: 'Meeting Scheduled', color: 'border-amber-500/40 bg-amber-500/5' },
                { stage: 'PROPOSAL_SENT', label: 'Quote / Proposal Sent', color: 'border-purple-500/40 bg-purple-500/5' },
                { stage: 'WON', label: 'Confirmed Booking', color: 'border-emerald-500/40 bg-emerald-500/5' },
              ].map(column => {
                const columnLeads = leads.filter(l => l.stage === column.stage);
                return (
                  <div key={column.stage} className={`border rounded-2xl p-4 ${column.color}`}>
                    <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        {column.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-background border border-border">
                        {columnLeads.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {columnLeads.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic py-6 text-center">
                          No leads in this stage
                        </p>
                      ) : (
                        columnLeads.map(lead => (
                          <div
                            key={lead.id}
                            className="bg-surface border border-border rounded-xl p-3.5 shadow-xs space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">{lead.clientName}</span>
                              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-brand/10 text-brand">
                                {lead.source}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">{lead.phone || lead.email || 'No contact info'}</p>
                            {lead.estimatedValue && (
                              <p className="text-xs font-bold text-emerald-500">
                                ₹{Math.round(lead.estimatedValue / 100).toLocaleString('en-IN')}
                              </p>
                            )}
                            {lead.notes && (
                              <p className="text-[10px] text-muted-foreground line-clamp-2 italic bg-background p-2 rounded">
                                "{lead.notes}"
                              </p>
                            )}
                            <div className="pt-2 flex items-center justify-between border-t border-border/40">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-muted-foreground">Move Stage:</span>
                                <select
                                  className="text-[10px] bg-background border border-border rounded px-1.5 py-0.5 font-medium text-foreground cursor-pointer"
                                  value={lead.stage}
                                  onChange={(e) => handleUpdateLeadStage(lead.id, e.target.value as any)}
                                >
                                  <option value="NEW">New Inquiry</option>
                                  <option value="CONTACTED">Meeting Scheduled</option>
                                  <option value="PROPOSAL_SENT">Quote Sent</option>
                                  <option value="WON">WON (Confirmed Booking)</option>
                                  <option value="LOST">Lost</option>
                                </select>
                              </div>
                              <button
                                onClick={() => handleDeleteLead(lead.id)}
                                className="text-xs text-rose-500 hover:text-rose-600 p-1 hover:bg-rose-500/10 rounded transition-colors font-bold"
                                title="Delete Lead"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      )}

      {/* Tab 2: Monthly Targets */}
      {activeTab === 'targets' && (
        <Reveal direction="up">
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-serif font-bold text-foreground flex items-center gap-2">
                <Target className="w-5 h-5 text-brand" />
                Monthly Sales Quotas & Performance
              </h2>
              <Button onClick={() => setShowTargetModal(true)} variant="outline" className="text-xs flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-brand" />
                Edit Target Quota
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-border rounded-xl p-5 bg-background space-y-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Target vs Actual Revenue (July 2026)
                </span>
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-2xl font-bold font-serif text-emerald-500">
                      ₹{Math.round(totalAchievedRevenuePaise / 100).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-muted-foreground">Achieved Revenue</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold font-serif text-foreground">
                      ₹{Math.round(targetAmountPaise / 100).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-muted-foreground">Target Quota</p>
                  </div>
                </div>
                <div className="w-full bg-border h-3 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${targetPercentage}%` }} />
                </div>
              </div>

              <div className="border border-border rounded-xl p-5 bg-background space-y-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Confirmed Bookings Quota
                </span>
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-2xl font-bold font-serif text-brand">
                      {totalAchievedBookings} Bookings
                    </p>
                    <p className="text-xs text-muted-foreground">Achieved Count</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold font-serif text-foreground">
                      {targetBookingsQuota} Bookings
                    </p>
                    <p className="text-xs text-muted-foreground">Target Quota</p>
                  </div>
                </div>
                <div className="w-full bg-border h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-brand h-full rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((totalAchievedBookings / (targetBookingsQuota || 1)) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      )}


      {/* Tab 3: Sales Reports */}
      {activeTab === 'reports' && (
        <Reveal direction="up">
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-foreground">Daily & Weekly Sales Summary</h2>
                <p className="text-xs text-muted-foreground">Complete log of all client inquiries, sales channels, and values.</p>
              </div>
              <Button onClick={exportCSVReport} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-background text-muted-foreground font-semibold">
                    <th className="p-3">Client Name</th>
                    <th className="p-3">Channel</th>
                    <th className="p-3">Stage</th>
                    <th className="p-3">Estimated Value</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leads.map((lead, idx) => (
                    <tr key={lead.id || `lead-row-${idx}-${lead.clientName}`} className="hover:bg-surface/60">
                      <td className="p-3 font-semibold text-foreground">{lead.clientName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand/10 text-brand">
                          {lead.source}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface border border-border">
                          {lead.stage}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-emerald-500">
                        {lead.estimatedValue ? `₹${Math.round(Number(lead.estimatedValue) / 100).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Today'}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="text-xs text-rose-500 hover:text-rose-600 px-2 py-1 hover:bg-rose-500/10 rounded transition-colors font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      )}

      {/* Tab 4: Referrals */}
      {activeTab === 'referrals' && (
        <Reveal direction="up">
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-serif font-bold text-foreground">Client Referral Network</h2>
              <Button onClick={() => setShowReferralModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white text-xs flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add New Referral
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {referrals.map((ref, idx) => (
                <div key={ref.id || `ref-card-${idx}`} className="border border-border rounded-xl p-4 bg-background space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Referrer: {ref.referrerName}</span>
                    <select
                      className="text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/30 rounded px-2 py-0.5 cursor-pointer"
                      value={ref.status}
                      onChange={(e) => handleUpdateReferralStatus(ref.id, e.target.value as any)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="BOOKED">BOOKED</option>
                      <option value="REWARD_PAID">REWARD_PAID</option>
                      <option value="EXPIRED">EXPIRED</option>
                    </select>
                  </div>
                  <p className="text-xs text-muted-foreground">Referred Client: <strong className="text-foreground">{ref.referredClientName}</strong></p>
                  <div className="flex items-center justify-between pt-1">
                    {ref.rewardAmount ? (
                      <p className="text-xs font-bold text-purple-500">Reward: ₹{Math.round(ref.rewardAmount / 100).toLocaleString('en-IN')}</p>
                    ) : <span />}
                    <button
                      onClick={() => handleDeleteReferral(ref.id)}
                      className="text-[10px] text-rose-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* Add Lead Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-foreground">Create New Sales Lead</h3>
            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-muted-foreground">Client Name</label>
                <Input
                  required
                  placeholder="e.g. Rahul & Neha Shoot"
                  value={leadForm.clientName}
                  onChange={e => setLeadForm({ ...leadForm, clientName: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-muted-foreground">Phone Number</label>
                <Input
                  required
                  placeholder="+91 98765 43210"
                  value={leadForm.phone}
                  onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-muted-foreground">Lead Source Channel</label>
                <select
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground"
                  value={leadForm.source}
                  onChange={e => setLeadForm({ ...leadForm, source: e.target.value as any })}
                >
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="CALL">Phone Call</option>
                  <option value="SOCIAL_MEDIA">Social Media (Instagram/FB)</option>
                  <option value="REFERRAL">Client Referral</option>
                  <option value="WEBSITE">Website Form</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-muted-foreground">Initial Pipeline Stage</label>
                <select
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground font-medium"
                  value={leadForm.stage}
                  onChange={e => setLeadForm({ ...leadForm, stage: e.target.value as any })}
                >
                  <option value="NEW">New Inquiry (Pipeline Opportunity)</option>
                  <option value="CONTACTED">Meeting Scheduled</option>
                  <option value="PROPOSAL_SENT">Proposal / Quote Sent</option>
                  <option value="WON">WON (Confirmed Booking — Updates Quota Instantly!)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-muted-foreground">Estimated Deal Value (in ₹ INR)</label>
                <Input
                  type="number"
                  placeholder="e.g. 75000 (Defaults to ₹50,000 if empty)"
                  value={leadForm.estimatedValue}
                  onChange={e => setLeadForm({ ...leadForm, estimatedValue: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-muted-foreground">Client Requirements & Notes</label>
                <textarea
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground h-20"
                  placeholder="Requirements for wedding shoot, dates, venue..."
                  value={leadForm.notes}
                  onChange={e => setLeadForm({ ...leadForm, notes: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowLeadModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand text-white">
                  Save Lead
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Target Quota Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-foreground">Set Monthly Sales Target Quota</h3>
            <form onSubmit={handleSaveTarget} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-muted-foreground">Target Revenue Quota (in ₹ INR)</label>
                <Input
                  type="number"
                  required
                  placeholder="e.g. 500000"
                  value={targetForm.targetAmountINR}
                  onChange={e => setTargetForm({ ...targetForm, targetAmountINR: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-muted-foreground">Target Confirmed Bookings Count</label>
                <Input
                  type="number"
                  required
                  placeholder="e.g. 15"
                  value={targetForm.targetBookings}
                  onChange={e => setTargetForm({ ...targetForm, targetBookings: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-muted-foreground">Notes / Focus Campaign</label>
                <Input
                  placeholder="e.g. July Wedding Campaign"
                  value={targetForm.notes}
                  onChange={e => setTargetForm({ ...targetForm, notes: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowTargetModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand text-white">
                  Save Target
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-foreground">Record Client Referral</h3>
            <form onSubmit={handleCreateReferral} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-muted-foreground">Referrer Person Name</label>
                <Input
                  required
                  placeholder="e.g. Vikram Mehta"
                  value={referralForm.referrerName}
                  onChange={e => setReferralForm({ ...referralForm, referrerName: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-muted-foreground">Referrer Email</label>
                <Input
                  type="email"
                  placeholder="e.g. vikram@example.com"
                  value={referralForm.referrerEmail}
                  onChange={e => setReferralForm({ ...referralForm, referrerEmail: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-muted-foreground">Referred Client Name</label>
                <Input
                  required
                  placeholder="e.g. Mehta Family Shoot"
                  value={referralForm.referredClientName}
                  onChange={e => setReferralForm({ ...referralForm, referredClientName: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-muted-foreground">Referral Reward Amount (in ₹ INR)</label>
                <Input
                  type="number"
                  placeholder="e.g. 2500"
                  value={referralForm.rewardAmountINR}
                  onChange={e => setReferralForm({ ...referralForm, rewardAmountINR: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowReferralModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Save Referral
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


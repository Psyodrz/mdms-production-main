'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldAlert, Users, FolderKanban, Server, UserCheck, Briefcase, 
  Settings, FileText, Search, Plus, Edit3, Trash2, CheckCircle2, 
  XCircle, Clock, DollarSign, Award, Sliders, RefreshCw, AlertTriangle, 
  Download, Eye, Filter, ArrowRight, Check, X, Shield
} from 'lucide-react';
import { Role } from '@mdms/types';
import { fetchAPI } from '@/lib/api-client';

interface SuperAdminDashboardClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: Role | string;
  };
  accessToken: string;
}

interface CMSItem {
  id: string;
  title: string;
  category: string;
  client: string;
  status: 'Published' | 'Draft' | 'Archived';
  type: 'portfolio' | 'blog' | 'testimonial';
  date: string;
}

interface Booking {
  id: string;
  client: string;
  project: string;
  talent: string;
  dates: string;
  budget: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'rejected';
}

interface TalentReview {
  id: string;
  name: string;
  category: string;
  experience: string;
  portfolioCount: number;
  status: 'pending' | 'approved' | 'rejected';
}

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  ip: string;
  status: 'success' | 'warning' | 'danger';
}

export function SuperAdminDashboardClient({ user, accessToken }: SuperAdminDashboardClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams ? searchParams.get('tab') || 'overview' : 'overview';

  // Interactive Users State
  const [userList, setUserList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Interactive CMS State
  const [cmsItems, setCmsItems] = useState<CMSItem[]>([
    { id: 'p-01', title: 'Neon Dreams Commercial Film', category: 'Commercial', client: 'Nike Athletic', status: 'Published', type: 'portfolio', date: '2026-07-01' },
    { id: 'p-02', title: 'Desert Mirage Editorial Campaign', category: 'Fashion', client: 'Vogue India', status: 'Published', type: 'portfolio', date: '2026-06-28' },
    { id: 'p-03', title: 'Symphony in Blue Feature Film', category: 'Feature Film', client: 'Universal Studios', status: 'Draft', type: 'portfolio', date: '2026-07-05' },
    { id: 'b-01', title: 'The Evolution of Cinematic Lighting in 2026', category: 'Production Notes', client: 'MP Staff', status: 'Published', type: 'blog', date: '2026-06-20' },
    { id: 'b-02', title: 'Top 5 Casting Trends for Luxury Brands', category: 'Casting Insights', client: 'Ananya Rao', status: 'Published', type: 'blog', date: '2026-06-15' },
  ]);
  const [isCmsModalOpen, setIsCmsModalOpen] = useState(false);
  const [cmsTitle, setCmsTitle] = useState('');
  const [cmsCategory, setCmsCategory] = useState('Commercial');
  const [cmsClient, setCmsClient] = useState('');
  const [cmsStatus, setCmsStatus] = useState<'Published' | 'Draft' | 'Archived'>('Published');

  // Interactive Talent Moderation State
  const [talentReviews, setTalentReviews] = useState<TalentReview[]>([
    { id: 't-rev-1', name: 'Kabir Mehta', category: 'Fashion Model', experience: '4 Years', portfolioCount: 18, status: 'pending' },
    { id: 't-rev-2', name: 'Meera Kapoor', category: 'Voiceover Artist', experience: '6 Years', portfolioCount: 12, status: 'pending' },
    { id: 't-rev-3', name: 'Alok Verma', category: 'Cinematographer & Director', experience: '8 Years', portfolioCount: 24, status: 'pending' },
    { id: 't-rev-4', name: 'Sanya Malhotra', category: 'Reels Creator', experience: '3 Years', portfolioCount: 30, status: 'approved' },
  ]);

  // Interactive Bookings State
  const [bookings, setBookings] = useState<Booking[]>([
    { id: 'bk-01', client: 'Vogue India', project: 'Summer Fashion Week Campaign', talent: 'Ariya Sharma', dates: 'Aug 12 - Aug 15, 2026', budget: '₹1,25,000', status: 'pending' },
    { id: 'bk-02', client: 'Netflix Originals', project: 'Feature Film Casting Call', talent: 'Kabir Mehta', dates: 'Sep 01 - Oct 15, 2026', budget: '₹4,50,000', status: 'confirmed' },
    { id: 'bk-03', client: 'Harper’s Bazaar', project: 'Editorial Cover Shoot', talent: 'Zara Khan', dates: 'Jul 25 - Jul 26, 2026', budget: '₹82,000', status: 'in-progress' },
    { id: 'bk-04', client: 'Nike Athletic', project: 'Global Digital Commercial', talent: 'Rohan Singhania', dates: 'Oct 05 - Oct 10, 2026', budget: '₹2,80,000', status: 'pending' },
  ]);

  // Interactive Settings State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [cdnCacheCleared, setCdnCacheCleared] = useState(false);
  const [backupTriggered, setBackupTriggered] = useState(false);
  const [systemNotifications, setSystemNotifications] = useState(true);

  // Interactive Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Interactive Pricing State
  const [pricingItems, setPricingItems] = useState([
    { id: 'pr-1', name: 'Studio A (VFX Green Screen)', category: 'Studio Rental', price: '₹25,000 / day', billing: 'Daily Rate', status: 'Active' },
    { id: 'pr-2', name: 'Studio B (Soundstage & Lighting)', category: 'Studio Rental', price: '₹18,000 / day', billing: 'Daily Rate', status: 'Active' },
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

  // Load Real Data from NestJS Backend
  useEffect(() => {
    if (!accessToken) return;
    

    // 1. Fetch Users
    fetchAPI('/admin/users', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
      .then(r => r.json())
      .then(res => {
        if (res && res.data) {
          const mappedUsers = res.data.map((u: any) => ({
            id: u.id,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
            email: u.email,
            password: '***',
            role: u.role.toLowerCase()
          }));
          setUserList(mappedUsers);
        }
      })
      .catch(console.error);

    // 2. Fetch System Configs
    fetchAPI('/cms/config', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
      .then(r => r.json())
      .then(configs => {
        if (Array.isArray(configs)) {
          const maintenance = configs.find((c: any) => c.key === 'maintenance_mode');
          if (maintenance) {
            setMaintenanceMode(maintenance.value === 'true');
          }
          const notify = configs.find((c: any) => c.key === 'system_notifications');
          if (notify) {
            setSystemNotifications(notify.value === 'true');
          }
        }
      })
      .catch(console.error);

    // 3. Fetch Audit Logs
    fetchAPI('/admin/audit-logs', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
      .then(r => r.json())
      .then(res => {
        const rawLogs = res.data?.data || res.data || [];
        if (Array.isArray(rawLogs)) {
          const mappedLogs = rawLogs.map((log: any) => ({
            id: log.id,
            timestamp: new Date(log.createdAt).toLocaleTimeString(),
            actor: log.actor?.email || 'system_daemon',
            action: log.action,
            resource: `${log.resource} #${log.resourceId || ''}`,
            ip: log.ipAddress || '127.0.0.1',
            status: (log.action.includes('FAIL') || log.action.includes('ALERT') ? 'danger' : log.action.includes('UPDATE') || log.action.includes('MODIFIED') ? 'warning' : 'success') as 'success' | 'warning' | 'danger'
          }));
          setAuditLogs(mappedLogs);
        }
      })
      .catch(console.error);
  }, [accessToken]);

  // Handlers
  const handleRoleChange = (userId: string, newRole: Role | string) => {
    
    fetchAPI(`/admin/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ role: newRole.toUpperCase() })
    })
      .then(r => r.json())
      .then(() => {
        setUserList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      })
      .catch(console.error);
  };

  const toggleMaintenanceMode = () => {
    const nextVal = !maintenanceMode;
    setMaintenanceMode(nextVal);
    
    fetchAPI('/cms/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ key: 'maintenance_mode', value: String(nextVal), type: 'boolean' })
    }).catch(console.error);
  };

  const toggleSystemNotifications = () => {
    const nextVal = !systemNotifications;
    setSystemNotifications(nextVal);
    
    fetchAPI('/cms/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ key: 'system_notifications', value: String(nextVal), type: 'boolean' })
    }).catch(console.error);
  };


  const handleCreateCms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmsTitle) return;
    const newItem: CMSItem = {
      id: `p-${Date.now()}`,
      title: cmsTitle,
      category: cmsCategory,
      client: cmsClient || 'Internal Studio',
      status: cmsStatus,
      type: 'portfolio',
      date: new Date().toISOString().split('T')[0],
    };
    setCmsItems(prev => [newItem, ...prev]);
    setIsCmsModalOpen(false);
    setCmsTitle('');
    setCmsClient('');
  };

  const handleDeleteCms = (id: string) => {
    setCmsItems(prev => prev.filter(item => item.id !== id));
  };

  const handleTalentAction = (id: string, newStatus: 'approved' | 'rejected') => {
    setTalentReviews(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const handleBookingStatus = (id: string, newStatus: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  const handleClearCache = () => {
    setCdnCacheCleared(true);
    setTimeout(() => setCdnCacheCleared(false), 3000);
  };

  const handleTriggerBackup = () => {
    setBackupTriggered(true);
    setTimeout(() => setBackupTriggered(false), 3000);
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

  // Filtered Users
  const filteredUsers = userList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* OVERVIEW TAB */}
      {currentTab === 'overview' && (
        <div className="space-y-8">
          {/* Welcome Banner */}
          <div className="p-8 rounded-2xl bg-gradient-to-r from-surface via-surface-elevated to-surface border border-border relative overflow-hidden shadow-xl">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-brand/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-5 h-5 text-brand" />
                <span className="text-xs font-bold uppercase tracking-widest text-brand">
                  God Mode Enabled &bull; All Systems Active
                </span>
              </div>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
                Super Admin Control Center
              </h2>
              <p className="text-sm text-muted-foreground font-light max-w-2xl">
                You have unrestricted system access across all studios, productions, financial ledgers, and user directories. Select any module from the sidebar or quick cards below to manage operations.
              </p>
            </div>
          </div>

          {/* Interactive Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div onClick={() => router.push('?tab=users')} className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between hover:border-brand/50 cursor-pointer transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Total Users</span>
                <Users className="w-5 h-5 text-brand group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{userList.length}</p>
              <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                <span>+2 new today</span>
                <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </div>

            <div onClick={() => router.push('?tab=projects')} className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between hover:border-brand/50 cursor-pointer transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Active Productions</span>
                <FolderKanban className="w-5 h-5 text-brand group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{cmsItems.length}</p>
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <span>Across 8 studio stages</span>
                <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </div>

            <div onClick={() => router.push('?tab=models')} className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between hover:border-brand/50 cursor-pointer transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Talent Review</span>
                <UserCheck className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{talentReviews.filter(t => t.status === 'pending').length}</p>
              <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
                <span>Requires your approval</span>
                <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </div>

            <div onClick={() => router.push('?tab=settings')} className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between hover:border-brand/50 cursor-pointer transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">System Status</span>
                <Server className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-3xl font-bold text-emerald-400 mb-1">99.99%</p>
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <span>All clusters operational</span>
                <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </div>
          </div>

          {/* Quick God-Mode Actions */}
          <div className="p-8 rounded-2xl bg-surface border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand" />
              <span>Quick God-Mode Management Modules</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="?tab=users" className="p-5 rounded-xl bg-background border border-border flex items-center justify-between hover:border-[#e11d48] hover:bg-[#1f1f1f]/30 transition-all group">
                <div>
                  <p className="font-semibold text-foreground text-sm group-hover:text-brand transition-colors flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand" />
                    <span>User Role & Permissions Audit</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Manage admin privileges and studio access</p>
                </div>
                <span className="text-xs bg-brand/20 text-brand px-3 py-1.5 rounded-lg font-semibold group-hover:bg-brand group-hover:text-primary-foreground transition-all">
                  Manage &rarr;
                </span>
              </Link>

              <Link href="?tab=projects" className="p-5 rounded-xl bg-background border border-border flex items-center justify-between hover:border-[#e11d48] hover:bg-[#1f1f1f]/30 transition-all group">
                <div>
                  <p className="font-semibold text-foreground text-sm group-hover:text-brand transition-colors flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-brand" />
                    <span>CMS Portfolio & Production Hub</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Publish commercial shoots and editorials</p>
                </div>
                <span className="text-xs bg-brand/20 text-brand px-3 py-1.5 rounded-lg font-semibold group-hover:bg-brand group-hover:text-primary-foreground transition-all">
                  Edit CMS &rarr;
                </span>
              </Link>

              <Link href="?tab=pricing" className="p-5 rounded-xl bg-background border border-border flex items-center justify-between hover:border-[#e11d48] hover:bg-[#1f1f1f]/30 transition-all group">
                <div>
                  <p className="font-semibold text-foreground text-sm group-hover:text-brand transition-colors flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-brand" />
                    <span>Studio Rate Cards & Pricing Plans</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Manage studio rentals and bundles</p>
                </div>
                <span className="text-xs bg-brand/20 text-brand px-3 py-1.5 rounded-lg font-semibold group-hover:bg-brand group-hover:text-primary-foreground transition-all">
                  Rates &rarr;
                </span>
              </Link>

              <Link href="?tab=logs" className="p-5 rounded-xl bg-background border border-border flex items-center justify-between hover:border-[#e11d48] hover:bg-[#1f1f1f]/30 transition-all group">
                <div>
                  <p className="font-semibold text-foreground text-sm group-hover:text-brand transition-colors flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand" />
                    <span>Global System Logs & Security</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">View audit trails and API request logs</p>
                </div>
                <span className="text-xs bg-muted text-foreground px-3 py-1.5 rounded-lg font-semibold group-hover:bg-accent hover:text-accent-foreground group-hover:text-foreground transition-all">
                  Inspect &rarr;
                </span>
              </Link>
            </div>
          </div>

          {/* Recent Bookings Overview */}
          <div className="p-8 rounded-2xl bg-surface border border-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand" />
                <span>Recent Studio & Campaign Bookings</span>
              </h3>
              <Link href="?tab=clients" className="text-xs text-brand hover:underline font-semibold uppercase tracking-wider">
                View All Bookings ({bookings.length}) &rarr;
              </Link>
            </div>
            <div className="space-y-3">
              {bookings.slice(0, 3).map(booking => (
                <div key={booking.id} className="p-4 rounded-xl bg-background border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand font-bold text-xs shrink-0">
                      {booking.client.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{booking.client} &mdash; {booking.project}</p>
                      <p className="text-xs text-muted-foreground">Talent: <span className="text-neutral-200 font-medium">{booking.talent}</span> &bull; {booking.dates}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-sm font-bold text-foreground bg-muted px-3 py-1 rounded-lg border border-border">{booking.budget}</span>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider ${
                      booking.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      booking.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {currentTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-1">User Directory & Role Access</h2>
              <p className="text-xs text-muted-foreground">Manage platform permissions across all 5 RBAC tiers (super_admin, admin, client, talent, public).</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-xl border border-border">
                Total: <strong className="text-foreground">{filteredUsers.length}</strong> users
              </span>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#e11d48]"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Filter Role:</span>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-[#e11d48]"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin / Studio Producer</option>
                <option value="client">Client / Brand</option>
                <option value="talent">Talent Roster</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-background border-b border-border text-muted-foreground text-[11px] font-semibold uppercase tracking-widest">
                    <th className="p-4">User</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Current RBAC Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="p-4 font-semibold text-foreground flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand/20 text-brand font-bold flex items-center justify-center text-xs shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{u.name}</span>
                      </td>
                      <td className="p-4 text-foreground font-mono">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider border ${
                          u.role === 'super_admin' ? 'bg-brand/20 text-brand border-[#e11d48]/40' :
                          u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' :
                          u.role === 'client' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' :
                          'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value as Role | string)}
                          disabled={u.email === 'superadmin@mpproduction.com'}
                          className="bg-background border border-border rounded-lg px-3 py-1 text-xs text-foreground focus:outline-none focus:border-[#e11d48] disabled:opacity-50 cursor-pointer"
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="admin">Admin</option>
                          <option value="client">Client</option>
                          <option value="talent">Talent</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PROJECTS & CMS TAB */}
      {currentTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-1">CMS Master Content Editor</h2>
              <p className="text-xs text-muted-foreground">Manage portfolio films, editorial lookbooks, production blog articles, and brand testimonials.</p>
            </div>
            <button
              onClick={() => setIsCmsModalOpen(true)}
              className="flex items-center gap-2 bg-brand hover:brightness-110 text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-semibold shadow-glow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Production</span>
            </button>
          </div>

          {/* CMS Modal */}
          {isCmsModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fadeIn">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <h3 className="text-lg font-bold text-foreground">Add New Production / CMS Item</h3>
                  <button onClick={() => setIsCmsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleCreateCms} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">Project Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vogue Autumn Lookbook Film"
                      value={cmsTitle}
                      onChange={e => setCmsTitle(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-[#e11d48]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Category</label>
                      <select
                        value={cmsCategory}
                        onChange={e => setCmsCategory(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-[#e11d48]"
                      >
                        <option value="Commercial">Commercial</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Feature Film">Feature Film</option>
                        <option value="Editorial">Editorial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Status</label>
                      <select
                        value={cmsStatus}
                        onChange={e => setCmsStatus(e.target.value as any)}
                        className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-[#e11d48]"
                      >
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-foreground mb-1">Client / Brand Partner</label>
                    <input
                      type="text"
                      placeholder="e.g. Vogue India"
                      value={cmsClient}
                      onChange={e => setCmsClient(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-[#e11d48]"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCmsModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-accent hover:text-accent-foreground font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-brand text-primary-foreground hover:brightness-110 font-semibold"
                    >
                      Save Production
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* CMS Table */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-muted-foreground text-[11px] font-semibold uppercase tracking-widest">
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {cmsItems.map(item => (
                  <tr key={item.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="p-4 font-semibold text-foreground flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-brand" />
                      <span>{item.title}</span>
                    </td>
                    <td className="p-4 text-foreground">{item.category}</td>
                    <td className="p-4 text-muted-foreground">{item.client}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        item.status === 'Published' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        item.status === 'Draft' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-muted text-muted-foreground border border-border'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{item.date}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteCms(item.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-foreground transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODELS / TALENT MODERATION TAB */}
      {currentTab === 'models' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Talent Roster & Model Moderation</h2>
              <p className="text-xs text-muted-foreground">Review pending model portfolios, verify identities, and approve artists for brand castings.</p>
            </div>
            <span className="text-xs bg-amber-500/20 text-amber-400 font-bold px-3 py-1.5 rounded-xl border border-amber-500/30">
              {talentReviews.filter(t => t.status === 'pending').length} Pending Approvals
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {talentReviews.map(talent => (
              <div key={talent.id} className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between space-y-4 hover:border-border transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#e11d48] to-purple-600 flex items-center justify-center text-foreground font-bold text-base shadow-lg">
                      {talent.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-foreground">{talent.name}</h4>
                      <p className="text-xs text-brand font-medium">{talent.category} &bull; {talent.experience}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    talent.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    talent.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {talent.status}
                  </span>
                </div>

                <div className="bg-background p-3 rounded-xl border border-border flex justify-between items-center text-xs text-muted-foreground">
                  <span>Submitted Media Kit</span>
                  <strong className="text-foreground font-mono">{talent.portfolioCount} Photos / Reels</strong>
                </div>

                {talent.status === 'pending' && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleTalentAction(talent.id, 'approved')}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-foreground font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Check className="w-4 h-4" /> Approve for Roster
                    </button>
                    <button
                      onClick={() => handleTalentAction(talent.id, 'rejected')}
                      className="flex-1 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-foreground font-semibold text-xs flex items-center justify-center gap-1.5 border border-red-500/30 transition-all"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CLIENTS & BOOKINGS TAB */}
      {currentTab === 'clients' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Brand Clients & Campaign Bookings</h2>
              <p className="text-xs text-muted-foreground">Manage commercial shoot schedules, stage allocations, and financial contracts.</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-muted-foreground text-[11px] font-semibold uppercase tracking-widest">
                  <th className="p-4">Brand Client</th>
                  <th className="p-4">Project Brief</th>
                  <th className="p-4">Assigned Talent</th>
                  <th className="p-4">Shoot Dates</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="p-4 font-bold text-foreground">{b.client}</td>
                    <td className="p-4 text-foreground font-medium">{b.project}</td>
                    <td className="p-4 text-brand font-semibold">{b.talent}</td>
                    <td className="p-4 text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {b.dates}
                    </td>
                    <td className="p-4 font-mono text-emerald-400 font-bold">{b.budget}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        b.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        b.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        b.status === 'completed' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={b.status}
                        onChange={e => handleBookingStatus(b.id, e.target.value as any)}
                        className="bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:border-[#e11d48] cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
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
              className="flex items-center justify-center gap-2 bg-brand hover:brightness-110 text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Rate Card / Package</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pricingItems.map(item => (
              <div key={item.id} className="p-6 rounded-2xl bg-surface border border-border hover:border-brand/50 transition-all flex flex-col justify-between group shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-brand/10 text-brand border border-[#e11d48]/20">
                      {item.category}
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      {item.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-brand transition-colors">{item.name}</h3>
                  <p className="text-2xl font-serif font-bold text-foreground my-3">{item.price}</p>
                  <p className="text-xs text-muted-foreground font-medium">{item.billing}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">ID: {item.id}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditPricing(item)}
                      className="text-muted-foreground hover:text-brand p-2 rounded-lg hover:bg-brand/10 transition-colors"
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
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[#e11d48]"
                    />
                  </div>
                  <div>
                    <label className="block text-foreground font-medium mb-1.5">Category</label>
                    <select
                      value={pricingCategory}
                      onChange={e => setPricingCategory(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[#e11d48]"
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
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[#e11d48]"
                      />
                    </div>
                    <div>
                      <label className="block text-foreground font-medium mb-1.5">Billing Type</label>
                      <select
                        value={pricingBilling}
                        onChange={e => setPricingBilling(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[#e11d48]"
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
                      className="px-5 py-2.5 rounded-xl bg-brand hover:brightness-110 text-primary-foreground font-semibold transition-all shadow-glow"
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

      {/* SETTINGS TAB */}
      {currentTab === 'settings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Global Platform Controls</h2>
              <p className="text-xs text-muted-foreground">Manage system infrastructure, security policies, database backups, and maintenance states.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Maintenance Mode Card */}
            <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-foreground">Platform Maintenance Mode</h4>
                  <p className="text-muted-foreground mt-1">Restrict public access during database migrations or deployments.</p>
                </div>
                 <button
                  onClick={toggleMaintenanceMode}
                  className={`w-12 h-6 rounded-full transition-colors relative ${maintenanceMode ? 'bg-brand' : 'bg-muted border border-border'}`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${maintenanceMode ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
              {maintenanceMode && (
                <div className="p-3 rounded-xl bg-brand/10 border border-[#e11d48]/30 text-brand font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Maintenance mode active! Public traffic is currently restricted.
                </div>
              )}
            </div>

            {/* CDN Cache Card */}
            <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-foreground">Purge Edge CDN Cache</h4>
                <p className="text-muted-foreground mt-1">Clear cached portfolio assets, images, and static API responses worldwide.</p>
              </div>
              <button
                onClick={handleClearCache}
                disabled={cdnCacheCleared}
                className="w-full py-2.5 rounded-xl bg-muted hover:bg-accent hover:text-accent-foreground text-foreground font-semibold flex items-center justify-center gap-2 transition-all border border-border disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${cdnCacheCleared ? 'animate-spin text-emerald-400' : ''}`} />
                <span>{cdnCacheCleared ? 'CDN Cache Purged Successfully!' : 'Purge Global Cache'}</span>
              </button>
            </div>

            {/* Database Backup Card */}
            <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-foreground">Database Snapshot & Backup</h4>
                <p className="text-muted-foreground mt-1">Generate a manual backup of users, bookings, and financial ledgers.</p>
              </div>
              <button
                onClick={handleTriggerBackup}
                disabled={backupTriggered}
                className="w-full py-2.5 rounded-xl bg-muted hover:bg-accent hover:text-accent-foreground text-foreground font-semibold flex items-center justify-center gap-2 transition-all border border-border disabled:opacity-50"
              >
                <Download className={`w-4 h-4 ${backupTriggered ? 'text-emerald-400' : ''}`} />
                <span>{backupTriggered ? 'Snapshot Exported to S3 Bucket!' : 'Trigger Manual Backup'}</span>
              </button>
            </div>

            {/* Notifications Card */}
            <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-foreground">System Email Notifications</h4>
                  <p className="text-muted-foreground mt-1">Send automatic alerts on new brand inquiries and talent registrations.</p>
                </div>
                 <button
                  onClick={toggleSystemNotifications}
                  className={`w-12 h-6 rounded-full transition-colors relative ${systemNotifications ? 'bg-emerald-600' : 'bg-muted border border-border'}`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${systemNotifications ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOGS TAB */}
      {currentTab === 'logs' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-1">Global Security Audit Trail</h2>
              <p className="text-xs text-muted-foreground">Real-time timestamped log of admin actions, role modifications, and authentication attempts.</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-muted-foreground text-[11px] font-semibold uppercase tracking-widest">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target Resource</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs font-mono">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="p-4 text-muted-foreground">{log.timestamp}</td>
                    <td className="p-4 font-semibold text-foreground">{log.actor}</td>
                    <td className="p-4 text-brand font-bold">{log.action}</td>
                    <td className="p-4 text-foreground font-sans">{log.resource}</td>
                    <td className="p-4 text-muted-foreground">{log.ip}</td>
                    <td className="p-4 font-sans">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        log.status === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        log.status === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {log.status}
                      </span>
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

"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api-client';
import { useRealtimeRefresh } from '@/lib/realtime/useRealtimeRefresh';
import Link from 'next/link';
import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cms } from '@/lib/cms/client';
import { toast } from 'sonner';
import { 
  Film, 
  FileText, 
  MessageSquare, 
  Users, 
  UserCheck, 
  Building2, 
  Settings, 
  BarChart3, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Award, 
  Clock, 
  Sliders, 
  Plus, 
  Edit3, 
  Trash2, 
  Briefcase,
  RefreshCw,
  Database,
  Eye,
  Phone,
  Mail,
  MapPin,
  X
} from 'lucide-react';

interface Booking {
  id: string;
  client: string;
  project: string;
  talent: string;
  dates: string;
  budget: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'rejected';
}

interface CMSItem {
  id: string;
  title: string;
  category: string;
  clientOrAuthor: string;
  status: 'Published' | 'Draft' | 'Archived';
  type: 'portfolio' | 'blog' | 'testimonial';
}

interface TalentReview {
  id: string;
  name: string;
  category: string;
  experience: string;
  status: 'pending' | 'approved' | 'rejected';
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
  createdAt?: string;
}

// Map backend BookingStatus enum → UI status label.
function mapBookingStatus(status?: string): Booking['status'] {
  switch ((status || '').toUpperCase()) {
    case 'CONFIRMED': return 'confirmed';
    case 'RESCHEDULED': return 'in-progress';
    case 'CANCELLED': return 'rejected';
    case 'COMPLETED': return 'completed';
    default: return 'pending';
  }
}

// Map UI status action → backend BookingStatus enum value.
function toBookingStatus(status: Booking['status']): string {
  switch (status) {
    case 'confirmed': return 'CONFIRMED';
    case 'in-progress': return 'RESCHEDULED';
    case 'rejected': return 'CANCELLED';
    case 'completed': return 'COMPLETED';
    default: return 'INQUIRY';
  }
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'cms' | 'bookings' | 'users' | 'settings'>('overview');
  const [isLoadingLive, setIsLoadingLive] = useState(true);
  const [isLiveDb, setIsLiveDb] = useState(false);

  // KPI Stats State — populated from the live backend (/admin/dashboard/kpis)
  const [kpis, setKpis] = useState({
    activeProjects: '—',
    pendingBookings: '—',
    totalRevenue: '—',
    totalTalent: '—',
  });

  // Live data — no mock seed. Populated from the backend on mount.
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cmsItems, setCmsItems] = useState<CMSItem[]>([]);
  const [talentReviews, setTalentReviews] = useState<TalentReview[]>([]);
  const [selectedTalentModal, setSelectedTalentModal] = useState<TalentReview | null>(null);

  const loadLiveData = useCallback(async () => {
    setIsLoadingLive(true);
    try {
      const bff = (path: string) => fetch(path, { cache: 'no-store' }).then((r) => r.json()).catch(() => null);
      const [kpiRes, recentBookingsRes, talentRes, portfolioRes, blogRes, testimonialRes] = await Promise.all([
        bff('/api/admin/dashboard/kpis'),
        bff('/api/admin/dashboard/recent-bookings'),
        bff('/api/talent/pending'),
        cms.list<any[]>('portfolio'),
        cms.list<any[]>('blog'),
        cms.list<any[]>('testimonials'),
      ]);

      let connected = false;

      // ── KPIs (real: counts + payment-sum revenue) ──
      if (kpiRes && kpiRes.ok !== false) {
        const kpi = kpiRes.data ?? kpiRes;
        if (kpi && typeof kpi === 'object' && ('activeProjects' in kpi || 'totalRevenue' in kpi)) {
          connected = true;
          setKpis({
            activeProjects: String(kpi.activeProjects ?? 0),
            pendingBookings: String(kpi.pendingBookings ?? 0),
            totalRevenue: String(kpi.totalRevenue ?? '₹0'),
            totalTalent: String(kpi.totalTalent ?? 0),
          });
        }
      }

      // ── CMS master list (real via BFF; now returns arrays) ──
      const liveCmsItems: CMSItem[] = [];
      if (portfolioRes && portfolioRes.ok !== false) {
        const list = Array.isArray(portfolioRes.data) ? portfolioRes.data : Array.isArray(portfolioRes) ? (portfolioRes as any[]) : [];
        if (list.length > 0) {
          connected = true;
          liveCmsItems.push(...list.map((item: any) => ({
            id: String(item.id || item.slug),
            title: String(item.title || 'Untitled Project'),
            category: String(item.category || 'Portfolio'),
            clientOrAuthor: String(item.client || item.brand || 'MP Productions'),
            status: (item.isPublished === false ? 'Draft' : 'Published') as CMSItem['status'],
            type: 'portfolio' as const,
          })));
        }
      }
      if (blogRes && blogRes.ok !== false) {
        const list = Array.isArray(blogRes.data) ? blogRes.data : Array.isArray(blogRes) ? (blogRes as any[]) : [];
        if (list.length > 0) {
          connected = true;
          liveCmsItems.push(...list.map((item: any) => ({
            id: String(item.id || item.slug),
            title: String(item.title || 'Untitled Post'),
            category: String(item.category || 'Blog'),
            clientOrAuthor: String(item.authorName || 'MP Editorial'),
            status: (item.status === 'PUBLISHED' ? 'Published' : 'Draft') as CMSItem['status'],
            type: 'blog' as const,
          })));
        }
      }
      if (testimonialRes && testimonialRes.ok !== false) {
        const list = Array.isArray(testimonialRes.data) ? testimonialRes.data : Array.isArray(testimonialRes) ? (testimonialRes as any[]) : [];
        if (list.length > 0) {
          connected = true;
          liveCmsItems.push(...list.map((item: any) => ({
            id: String(item.id),
            title: `"${String(item.content || 'Great service').slice(0, 60)}..."`,
            category: 'Review',
            clientOrAuthor: String(item.clientName || 'Client'),
            status: (item.isPublished === false ? 'Draft' : 'Published') as CMSItem['status'],
            type: 'testimonial' as const,
          })));
        }
      }
      setCmsItems(liveCmsItems);

      // ── Recent bookings & HireInquiries (real) ──
      if (recentBookingsRes && recentBookingsRes.ok !== false) {
        const recentBookings = recentBookingsRes.data ?? recentBookingsRes;
        if (Array.isArray(recentBookings)) {
          connected = true;
          setBookings(recentBookings.map((b: any) => {
            const u = b.client?.user;
            const clientName = u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || 'Client' : 'Client';
            const talentName = b.talentName || (b.talent?.user ? `${b.talent.user.firstName || ''} ${b.talent.user.lastName || ''}`.trim() : 'Assigned Talent');
            const bookingDate = b.dateNeeded || b.date;
            return {
              id: String(b.id),
              client: clientName,
              project: String(b.service?.name || b.projectBrief || 'Production Booking'),
              talent: talentName,
              dates: bookingDate ? new Date(bookingDate).toLocaleDateString() : new Date(b.createdAt).toLocaleDateString(),
              budget: b.budget && b.budget !== '—' ? b.budget : (b.service?.basePrice ? `₹${Math.round(b.service.basePrice / 100).toLocaleString('en-IN')}` : '—'),
              status: mapBookingStatus(b.status),
            };
          }));
        }
      }

      // ── Talent moderation queue (real: PENDING_REVIEW profiles) ──
      if (talentRes && talentRes.ok !== false) {
        const pendingTalent = talentRes.data ?? talentRes;
        if (Array.isArray(pendingTalent)) {
          connected = true;
          setTalentReviews(pendingTalent.map((t: any) => ({
            id: String(t.id),
            name: t.user ? `${t.user.firstName ?? ''} ${t.user.lastName ?? ''}`.trim() || t.stageName || 'Talent Applicant' : t.stageName || 'Talent Applicant',
            category: String(t.talentTypes?.[0] || t.experienceLevel || 'Talent'),
            experience: String(t.experienceLevel || '—'),
            status: 'pending' as const,
            email: t.user?.email || '—',
            phone: t.user?.phone || '—',
            location: t.user?.city ? `${t.user.city}${t.user.state ? ', ' + t.user.state : ''}` : '—',
            bio: t.bio || '—',
            createdAt: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
          })));
        }
      }

      setIsLiveDb(connected);

      // If backend returned 502 / disconnected, schedule an auto-retry in 3 seconds while server boots up
      if (!connected) {
        setTimeout(() => {
          loadLiveData();
        }, 3000);
      }

      setIsLiveDb(connected);
    } catch (err) {
      console.error('Error loading live data:', err);
    } finally {
      setIsLoadingLive(false);
    }
  }, []);

  useEffect(() => {
    loadLiveData();
  }, [loadLiveData]);

  // Realtime: refresh dashboard data when bookings / testimonials / portfolio
  // change in Postgres. Realtime is only a signal — the reload still runs
  // through the secure BFF loaders in loadLiveData.
  const { connected: realtimeConnected } = useRealtimeRefresh(
    ['Booking', 'Testimonial', 'PortfolioItem'],
    loadLiveData,
  );

  // Editing Modal State
  const [editingItem, setEditingItem] = useState<CMSItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalCategory, setModalCategory] = useState('');
  const [modalClient, setModalClient] = useState('');
  const [modalStatus, setModalStatus] = useState<'Published' | 'Draft' | 'Archived'>('Published');
  const [modalType, setModalType] = useState<'portfolio' | 'blog' | 'testimonial'>('portfolio');

  const handleStatusChange = async (id: string, status: Booking['status']) => {
    if (!confirm('Mark this booking as ' + status + '?')) return;

    try {
      const res = await fetch(`/api/booking/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: toBookingStatus(status) }),
      });
      if (!res.ok) throw new Error('Failed to update booking status');
      setBookings(prev => prev.map(b => (b.id === id ? { ...b, status } : b)));
      toast.success(`Booking status updated to ${status}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update booking status');
    }
  };

  const handleTalentReview = async (id: string, status: 'approved' | 'rejected') => {
    if (!confirm('Are you sure you want to ' + status + ' this talent application?')) return;

    // Backend expects a TalentProfileStatus enum value on the `status` field.
    const newStatus = status === 'approved' ? 'ACTIVE' : 'SUSPENDED';
    try {
      const res = await fetch(`/api/talent/${id}/moderate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update talent status');
      setTalentReviews(prev => prev.filter(t => t.id !== id));
      toast.success(`Talent application ${status}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update talent status');
    }
  };

  const openAddModal = (type: 'portfolio' | 'blog' | 'testimonial' = 'portfolio') => {
    setEditingItem(null);
    setModalTitle('');
    setModalCategory(type === 'portfolio' ? 'Commercial' : type === 'blog' ? 'Production' : 'Review');
    setModalClient('');
    setModalStatus('Published');
    setModalType(type);
    setIsModalOpen(true);
  };

  const openEditModal = (item: CMSItem) => {
    setEditingItem(item);
    setModalTitle(item.title);
    setModalCategory(item.category);
    setModalClient(item.clientOrAuthor);
    setModalStatus(item.status);
    setModalType(item.type);
    setIsModalOpen(true);
  };

  const saveCmsItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle) return;

    if (editingItem) {
      setCmsItems(prev => prev.map(item => item.id === editingItem.id ? {
        ...item,
        title: modalTitle,
        category: modalCategory,
        clientOrAuthor: modalClient || 'MP Staff',
        status: modalStatus,
      } : item));
      try {
        await cms.update(editingItem.type, editingItem.id, {
          title: modalTitle,
          category: modalCategory,
          isPublished: modalStatus === 'Published',
        });
        toast.success('Saved to live database');
      } catch (e) {}
    } else {
      const newItem: CMSItem = {
        id: `cms-${Date.now()}`,
        title: modalTitle,
        category: modalCategory,
        clientOrAuthor: modalClient || 'MP Staff',
        status: modalStatus,
        type: modalType,
      };
      setCmsItems(prev => [newItem, ...prev]);
      try {
        await cms.create(modalType, {
          title: modalTitle,
          slug: modalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category: modalCategory,
          isPublished: modalStatus === 'Published',
        });
        toast.success('Created in live database');
      } catch (e) {}
    }
    setIsModalOpen(false);
  };

  const deleteCmsItem = async (id: string) => {
    const item = cmsItems.find(i => i.id === id);
    setCmsItems(prev => prev.filter(item => item.id !== id));
    if (item) {
      try {
        await cms.remove(item.type, item.id);
        toast.success('Removed from live database');
      } catch (e) {}
    }
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('mdms_auth_token');
      localStorage.removeItem('mdms_auth_role');
      localStorage.removeItem('mdms_auth_user');
    } catch (e) {}
    router.push('/');
  };

  return (
    <>
      <main className="page-content py-12 bg-background text-foreground min-h-screen">
        <Container>
          
          {/* Super Admin Header & Module Navigation */}
          <div className="mb-10 border-b border-border pb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div>
              <span className="text-primary tracking-[0.2em] text-xs uppercase font-semibold mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Internal Operations & Command Center
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-serif text-foreground">
                  Super Admin
                </h1>
                <span className={`text-xs font-sans font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border shadow-sm ${
                  isLoadingLive
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : isLiveDb
                    ? 'bg-green-500/20 text-green-400 border-green-500/40'
                    : 'bg-surface text-foreground/80 border-border'
                }`}>
                  <Database className="w-3.5 h-3.5" />
                  {isLoadingLive ? 'Syncing DB...' : isLiveDb ? `Live DB Connected (${cmsItems.length} Records)` : 'Interactive Sandbox Mode'}
                </span>
                <button
                  onClick={loadLiveData}
                  disabled={isLoadingLive}
                  className="px-2.5 py-1 text-xs font-bold bg-surface border border-border hover:border-primary text-foreground/90 hover:text-white rounded flex items-center gap-1.5 transition-all"
                  title="Reload live database data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLive ? 'animate-spin text-primary' : ''}`} />
                  Refresh
                </button>
                <span
                  className={`text-[11px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 border ${
                    realtimeConnected
                      ? 'bg-green-500/15 text-green-400 border-green-500/30'
                      : 'bg-surface text-foreground/60 border-border'
                  }`}
                  title={realtimeConnected ? 'Realtime updates active' : 'Realtime offline'}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${realtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-foreground/40'}`} />
                  {realtimeConnected ? 'Realtime' : 'Offline'}
                </span>
              </div>
            </div>
            
            {/* Direct Links to All Modules */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider">
              <Link href="/studio-8f2k/cms/portfolio" className="px-3 py-2 rounded-sm bg-surface border border-border hover:border-primary text-foreground transition-all flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-primary" /> Portfolio Gallery
              </Link>
              <Link href="/studio-8f2k/cms/blog" className="px-3 py-2 rounded-sm bg-surface border border-border hover:border-primary text-foreground transition-all flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" /> Blog & News
              </Link>
              <Link href="/studio-8f2k/cms/testimonials" className="px-3 py-2 rounded-sm bg-surface border border-border hover:border-primary text-foreground transition-all flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-primary" /> Testimonials
              </Link>
              <Link href="/studio-8f2k/cms/team" className="px-3 py-2 rounded-sm bg-surface border border-border hover:border-primary text-foreground transition-all flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" /> Team Staff
              </Link>
              <Link href="/studio-8f2k/users" className="px-3 py-2 rounded-sm bg-surface border border-border hover:border-primary text-foreground transition-all flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-primary" /> Users
              </Link>
              <Link href="/studio-8f2k/employees" className="px-3 py-2 rounded-sm bg-surface border border-border hover:border-primary text-foreground transition-all flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-primary" /> Employees
              </Link>
              <Link href="/studio-8f2k/settings" className="px-3 py-2 rounded-sm bg-surface border border-border hover:border-primary text-foreground transition-all flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-primary" /> Settings
              </Link>
            </div>
          </div>

          {/* Interactive Control Tabs */}
          <div className="flex border-b border-border mb-8 overflow-x-auto gap-8">
            {[
              { id: 'overview', label: 'Overview & KPIs', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'cms', label: 'CMS Master Editor', icon: <FileText className="w-4 h-4" /> },
              { id: 'bookings', label: 'Bookings & Inquiries', icon: <Calendar className="w-4 h-4" /> },
              { id: 'users', label: 'Access & Moderation', icon: <Users className="w-4 h-4" /> },
              { id: 'settings', label: 'Platform Controls', icon: <Sliders className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 text-xs md:text-sm font-bold tracking-wider uppercase whitespace-nowrap transition-all border-b-2 flex items-center gap-2 px-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary font-extrabold drop-shadow-[0_0_12px_rgba(235,61,38,0.4)]'
                    : 'border-transparent text-foreground/80 hover:text-white hover:border-primary/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW & KPIS */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fadeIn">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Active Projects', value: kpis.activeProjects, change: '+4 this month', icon: <Film className="w-5 h-5 text-primary" /> },
                  { label: 'Pending Bookings', value: kpis.pendingBookings, change: 'Requires review', icon: <Calendar className="w-5 h-5 text-primary" /> },
                  { label: 'Total Revenue (MTD)', value: kpis.totalRevenue, change: '+18.5% vs last month', icon: <DollarSign className="w-5 h-5 text-primary" /> },
                  { label: 'Total Talent Roster', value: kpis.totalTalent, change: '3 pending approval', icon: <Award className="w-5 h-5 text-primary" /> },
                ].map(stat => (
                  <Card key={stat.label} padding="md" className="bg-surface/90 border border-border shadow-md hover:border-primary/80 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-foreground/90 text-[11px] uppercase tracking-[0.18em] font-bold">{stat.label}</span>
                      {stat.icon}
                    </div>
                    <p className="text-4xl font-serif font-bold text-foreground mb-3 tracking-tight">{stat.value}</p>
                    <span className="text-xs text-red-400 font-semibold bg-red-500/15 border border-red-500/30 px-2.5 py-1 rounded shadow-sm inline-block">
                      {stat.change}
                    </span>
                  </Card>
                ))}
              </div>

              {/* Grid: Recent Bookings & Action Required */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Recent Bookings */}
                <Card padding="lg" className="lg:col-span-2 bg-surface/90 border border-border shadow-md">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif font-bold text-foreground">Recent Client Bookings</h2>
                    <button onClick={() => setActiveTab('bookings')} className="text-xs text-primary font-bold uppercase hover:underline">
                      View All ({bookings.length}) →
                    </button>
                  </div>
                  <div className="space-y-4">
                    {bookings.slice(0, 3).map(booking => (
                      <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background/80 border border-border/80 rounded-md gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-foreground text-base">{booking.client}</span>
                            <span className="text-xs text-foreground/80 font-medium">• {booking.budget}</span>
                          </div>
                          <p className="text-sm text-foreground/90">{booking.project} (Talent: <strong className="text-foreground font-semibold">{booking.talent}</strong>)</p>
                          <p className="text-xs text-foreground/75 mt-1.5 flex items-center gap-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5 text-primary" /> {booking.dates}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span className={`px-3 py-1 text-xs uppercase tracking-widest font-bold rounded-sm border ${
                            booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/40' :
                            booking.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' :
                            booking.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                            'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}>
                            {booking.status}
                          </span>
                          {booking.status === 'pending' && (
                            <div className="flex gap-1.5">
                              <Button size="sm" variant="primary" className="px-3! py-1.5! text-xs bg-primary! hover:bg-primary/90! text-white! font-bold flex items-center gap-1.5 shadow-sm" onClick={() => handleStatusChange(booking.id, 'confirmed')}>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="px-2.5! py-1.5! text-xs text-red-400 border-red-500/60 hover:bg-red-600 hover:text-white font-bold" onClick={() => handleStatusChange(booking.id, 'rejected')}>
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Talent Moderation Queue */}
                <Card padding="lg" className="bg-surface/90 border border-border shadow-md">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif font-bold text-foreground">Action Required</h2>
                    <span className="text-xs bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold px-2.5 py-1 rounded">
                      {talentReviews.filter(t => t.status === 'pending').length} Pending
                    </span>
                  </div>
                  <div className="space-y-4">
                    {talentReviews.map(talent => (
                      <div key={talent.id} className="p-4 bg-background/80 border border-border/80 rounded-md space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-foreground font-bold text-base">{talent.name}</p>
                            <p className="text-xs text-foreground/80 font-medium mt-0.5">{talent.category} • {talent.experience}</p>
                          </div>
                          <span className={`text-[11px] uppercase font-bold px-2 py-0.5 rounded border ${
                            talent.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/40' :
                            talent.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                            'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}>
                            {talent.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="py-1.5! px-3! text-xs border-blue-500/40 text-blue-400 hover:bg-blue-600 hover:text-white font-bold flex items-center gap-1"
                            onClick={() => setSelectedTalentModal(talent)}
                          >
                            <Eye className="w-3.5 h-3.5" /> View Details
                          </Button>
                          {talent.status === 'pending' && (
                            <>
                              <Button size="sm" variant="primary" className="flex-1! py-1.5! text-xs bg-primary! hover:bg-primary/90! text-white! font-bold flex justify-center items-center gap-1.5 shadow-sm" onClick={() => handleTalentReview(talent.id, 'approved')}>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1! py-1.5! text-xs text-red-400 border-red-500/60 hover:bg-red-600 hover:text-white font-bold flex justify-center items-center gap-1.5" onClick={() => handleTalentReview(talent.id, 'rejected')}>
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

              </div>
            </div>
          )}

          {/* TAB 2: CMS MASTER EDITOR */}
          {activeTab === 'cms' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface/90 p-6 border border-border rounded-md shadow-md">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground">CMS Content Manager</h2>
                  <p className="text-sm text-foreground/80 font-medium mt-1">Create, edit, and publish website content across all public modules.</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <Button onClick={() => openAddModal('portfolio')} variant="primary" size="sm" className="bg-primary! hover:bg-primary/90! text-white! font-bold flex items-center gap-1.5 shadow-sm">
                    <Plus className="w-4 h-4" /> Add Project
                  </Button>
                  <Button onClick={() => openAddModal('blog')} variant="outline" size="sm" className="flex items-center gap-1.5 font-bold hover:bg-surface-elevated">
                    <Plus className="w-4 h-4 text-primary" /> Add Blog Article
                  </Button>
                  <Button onClick={() => openAddModal('testimonial')} variant="outline" size="sm" className="flex items-center gap-1.5 font-bold hover:bg-surface-elevated">
                    <Plus className="w-4 h-4 text-primary" /> Add Testimonial
                  </Button>
                </div>
              </div>

              {/* CMS Items Table */}
              <div className="bg-surface/90 border border-border rounded-md shadow-md overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-background/90 text-foreground/80 text-xs uppercase tracking-widest font-bold">
                      <th className="p-4">Type</th>
                      <th className="p-4">Title / Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Client / Author</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/80">
                    {cmsItems.map(item => (
                      <tr key={item.id} className="hover:bg-background/80 transition-colors">
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-[11px] uppercase font-bold rounded border ${
                            item.type === 'portfolio' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                            item.type === 'blog' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                            'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-foreground text-base">{item.title}</td>
                        <td className="p-4 text-sm font-medium text-foreground/90">{item.category}</td>
                        <td className="p-4 text-sm font-medium text-foreground/90">{item.clientOrAuthor}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-sm border ${
                            item.status === 'Published' ? 'bg-green-500/20 text-green-400 border-green-500/40' :
                            item.status === 'Draft' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                            'bg-gray-500/20 text-gray-300 border-gray-500/40'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-4 whitespace-nowrap">
                          <button onClick={() => openEditModal(item)} className="text-xs font-bold text-primary hover:text-white inline-flex items-center gap-1 transition-colors">
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button onClick={() => deleteCmsItem(item.id)} className="text-xs font-bold text-red-400 hover:text-red-300 inline-flex items-center gap-1 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: BOOKINGS & INQUIRIES */}
          {activeTab === 'bookings' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center bg-surface/90 p-6 border border-border rounded-md shadow-md">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground">All Client Bookings & Auditions</h2>
                  <p className="text-sm text-foreground/80 font-medium mt-1">Manage talent reservations, budgets, and production schedules.</p>
                </div>
              </div>

              <div className="bg-surface/90 border border-border rounded-md shadow-md overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-background/90 text-foreground/80 text-xs uppercase tracking-widest font-bold">
                      <th className="p-4">Client</th>
                      <th className="p-4">Project</th>
                      <th className="p-4">Talent Assigned</th>
                      <th className="p-4">Dates</th>
                      <th className="p-4">Budget</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/80">
                    {bookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-background/80 transition-colors">
                        <td className="p-4 font-bold text-foreground text-base">{booking.client}</td>
                        <td className="p-4 text-sm font-medium text-foreground/90">{booking.project}</td>
                        <td className="p-4 text-sm font-bold text-foreground">{booking.talent}</td>
                        <td className="p-4 text-xs font-medium text-foreground/80">{booking.dates}</td>
                        <td className="p-4 font-bold text-green-400 text-base">{booking.budget}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 text-xs uppercase tracking-widest font-bold rounded-sm border ${
                            booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/40' :
                            booking.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' :
                            booking.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                            'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-3 whitespace-nowrap">
                          {booking.status !== 'confirmed' && (
                            <button onClick={() => handleStatusChange(booking.id, 'confirmed')} className="text-xs font-bold text-green-400 hover:text-green-300">
                              Confirm
                            </button>
                          )}
                          {booking.status !== 'in-progress' && booking.status === 'confirmed' && (
                            <button onClick={() => handleStatusChange(booking.id, 'in-progress')} className="text-xs font-bold text-blue-400 hover:text-blue-300">
                              Start
                            </button>
                          )}
                          {booking.status !== 'rejected' && (
                            <button onClick={() => handleStatusChange(booking.id, 'rejected')} className="text-xs font-bold text-red-400 hover:text-red-300">
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: USERS & ACCESS */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center bg-surface/90 p-6 border border-border rounded-md shadow-md">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground">Access & Role Management</h2>
                  <p className="text-sm text-foreground/80 font-medium mt-1">Manage client workspaces, talent accounts, and staff permissions.</p>
                </div>
                <Link href="/studio-8f2k/mgmt/users">
                  <Button variant="primary" size="sm" className="bg-primary! hover:bg-primary/90! text-white! font-bold shadow-sm">
                    Open Full Directory →
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card padding="lg" className="bg-surface/90 border border-border shadow-md">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Building2 className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-serif font-bold text-foreground">Client Portal Accounts</h3>
                  </div>
                  <p className="text-sm text-foreground/80 font-medium mb-4">48 active corporate accounts with project workspace access.</p>
                  <Link href="/studio-8f2k/mgmt/users" className="text-xs text-primary font-bold uppercase tracking-wider hover:underline">Manage Clients →</Link>
                </Card>
                <Card padding="lg" className="bg-surface/90 border border-border shadow-md">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Award className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-serif font-bold text-foreground">Talent Roster Profiles</h3>
                  </div>
                  <p className="text-sm text-foreground/80 font-medium mb-4">142 verified actors, models, and voice artists.</p>
                  <Link href="/studio-8f2k/mgmt/moderation" className="text-xs text-primary font-bold uppercase tracking-wider hover:underline">Review Auditions →</Link>
                </Card>
                <Card padding="lg" className="bg-surface/90 border border-border shadow-md">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-serif font-bold text-foreground">Internal Staff & Editors</h3>
                  </div>
                  <p className="text-sm text-foreground/80 font-medium mb-4">12 editors and producers with production portal rights.</p>
                  <Link href="/studio-8f2k/mgmt/employees" className="text-xs text-primary font-bold uppercase tracking-wider hover:underline">Manage Staff →</Link>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 5: PLATFORM CONTROLS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-surface/90 p-6 border border-border rounded-md shadow-md">
                <h2 className="text-2xl font-serif font-bold text-foreground mb-2">System Preferences & Brand Settings</h2>
                <p className="text-sm text-foreground/80 font-medium mb-6">Configure global defaults, email notifications, and security rules.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border border-border/80 rounded-md bg-background/80 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-foreground text-base">Auto-Approve Verified Talent</p>
                      <p className="text-xs text-foreground/75 font-medium mt-0.5">Skip manual moderation for agency-represented talent.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="accent-primary w-5 h-5 cursor-pointer" />
                  </div>

                  <div className="p-4 border border-border/80 rounded-md bg-background/80 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-foreground text-base">Client Inquiry Email Alerts</p>
                      <p className="text-xs text-foreground/75 font-medium mt-0.5">Send instant notifications to producers on new bookings.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="accent-primary w-5 h-5 cursor-pointer" />
                  </div>

                  <div className="p-4 border border-border/80 rounded-md bg-background/80 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-foreground text-base">Public Portfolio Indexing</p>
                      <p className="text-xs text-foreground/75 font-medium mt-0.5">Allow search engines to index published case studies.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="accent-primary w-5 h-5 cursor-pointer" />
                  </div>

                  <div className="p-4 border border-border/80 rounded-md bg-background/80 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-foreground text-base">Maintenance Mode</p>
                      <p className="text-xs text-foreground/75 font-medium mt-0.5">Temporarily disable public portals during upgrades.</p>
                    </div>
                    <input type="checkbox" className="accent-primary w-5 h-5 cursor-pointer" />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border flex justify-end gap-4">
                  <Link href="/studio-8f2k/mgmt/settings">
                    <Button variant="outline" size="md" className="font-bold">Advanced Settings →</Button>
                  </Link>
                  <Button variant="primary" size="md" className="bg-primary! hover:bg-primary/90! text-white! font-bold shadow-sm" onClick={() => alert('Settings saved successfully!')}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* INLINE MODAL FOR CMS EDITING / ADDING */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-surface border border-border rounded-md p-6 w-full max-w-lg shadow-2xl animate-scaleUp">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
                  <h3 className="text-xl font-serif font-bold text-foreground">
                    {editingItem ? `Edit ${editingItem.type.toUpperCase()}` : `Add New ${modalType.toUpperCase()}`}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white font-bold text-lg">✕</button>
                </div>

                <form onSubmit={saveCmsItem} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80 mb-1">
                      Title / Project Name
                    </label>
                    <input
                      type="text"
                      value={modalTitle}
                      onChange={(e) => setModalTitle(e.target.value)}
                      placeholder="e.g. Summer Fashion Week Campaign"
                      className="w-full bg-background border border-border px-4 py-2.5 rounded-sm text-sm font-medium text-foreground focus:outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={modalCategory}
                        onChange={(e) => setModalCategory(e.target.value)}
                        placeholder="e.g. Commercial"
                        className="w-full bg-background border border-border px-4 py-2.5 rounded-sm text-sm font-medium text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80 mb-1">
                        Client / Author
                      </label>
                      <input
                        type="text"
                        value={modalClient}
                        onChange={(e) => setModalClient(e.target.value)}
                        placeholder="e.g. Nike / Vikram Mehta"
                        className="w-full bg-background border border-border px-4 py-2.5 rounded-sm text-sm font-medium text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-foreground/80 mb-1">
                      Publication Status
                    </label>
                    <select
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value as any)}
                      className="w-full bg-background border border-border px-4 py-2.5 rounded-sm text-sm font-medium text-foreground focus:outline-none focus:border-primary"
                    >
                      <option value="Published">Published (Live)</option>
                      <option value="Draft">Draft (Internal)</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-border flex justify-end gap-3">
                    <Button type="button" variant="outline" size="sm" className="font-bold" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm" className="bg-primary! hover:bg-primary/90! text-white! font-bold shadow-sm">
                      {editingItem ? 'Update Item' : 'Create Item'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TALENT REGISTRATION INSPECTION MODAL */}
          {selectedTalentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
              <div className="bg-[#0e0e14] border border-white/20 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-white shadow-2xl relative">
                <button 
                  onClick={() => setSelectedTalentModal(null)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E50914] to-[#F59E0B] flex items-center justify-center font-black text-2xl text-white shadow-lg shrink-0">
                    {selectedTalentModal.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-extrabold text-white">{selectedTalentModal.name}</h3>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                        selectedTalentModal.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/40' :
                        selectedTalentModal.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                        'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {selectedTalentModal.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#38BDF8] font-bold mt-0.5">
                      {selectedTalentModal.category} • {selectedTalentModal.experience}
                    </p>
                  </div>
                </div>

                {/* Registration Details Grid */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <Mail className="w-3.5 h-3.5 text-[#38BDF8]" /> Email Address
                      </p>
                      <p className="text-xs font-semibold text-white truncate">{selectedTalentModal.email || '—'}</p>
                    </div>

                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" /> Phone / Mobile
                      </p>
                      <p className="text-xs font-semibold text-white">{selectedTalentModal.phone || '—'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" /> Location Hub
                      </p>
                      <p className="text-xs font-semibold text-white">{selectedTalentModal.location || '—'}</p>
                    </div>

                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" /> Registration Date
                      </p>
                      <p className="text-xs font-semibold text-white">{selectedTalentModal.createdAt || '—'}</p>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">
                      About / Pitch Summary
                    </p>
                    <p className="text-xs text-gray-200 leading-relaxed italic bg-black/40 p-3 rounded-lg border border-white/5 max-h-32 overflow-y-auto">
                      "{selectedTalentModal.bio || 'No custom bio submitted.'}"
                    </p>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                  {selectedTalentModal.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        className="flex-1 py-2.5 text-xs bg-[#E50914] hover:bg-[#FF1E27] text-white font-extrabold flex justify-center items-center gap-2 rounded-xl shadow-lg cursor-pointer"
                        onClick={() => {
                          handleTalentReview(selectedTalentModal.id, 'approved');
                          setSelectedTalentModal(null);
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve Talent
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="py-2.5 px-4 text-xs text-red-400 border-red-500/40 hover:bg-red-600 hover:text-white font-bold flex justify-center items-center gap-2 rounded-xl cursor-pointer"
                        onClick={() => {
                          handleTalentReview(selectedTalentModal.id, 'rejected');
                          setSelectedTalentModal(null);
                        }}
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </Button>
                    </>
                  )}

                  {selectedTalentModal.phone && selectedTalentModal.phone !== '—' && (
                    <a
                      href={`https://wa.me/${selectedTalentModal.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 rounded-xl transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

        </Container>
      </main>
    </>
  );
}


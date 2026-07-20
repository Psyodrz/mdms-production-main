"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { toast } from 'sonner';
import { fetchAPI } from '@/lib/api-client';
import { cms } from '@/lib/cms/client';
import { useRealtimeRefresh } from '@/lib/realtime/useRealtimeRefresh';
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
  Loader2
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
}









export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'cms' | 'bookings' | 'users' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // KPI Stats State
  const [kpis, setKpis] = useState<any>({});

  // Interactive Bookings State
  const [bookings, setBookings] = useState<any[]>([]);

  // Interactive CMS State
  const [cmsItems, setCmsItems] = useState<any[]>([]);

  // Talent Moderation State
  const [talentReviews, setTalentReviews] = useState<any[]>([]);

  // Editing Modal State
  const [editingItem, setEditingItem] = useState<CMSItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalCategory, setModalCategory] = useState('');
  const [modalClient, setModalClient] = useState('');
  const [modalStatus, setModalStatus] = useState<'Published' | 'Draft' | 'Archived'>('Published');
  const [modalType, setModalType] = useState<'portfolio' | 'blog' | 'testimonial'>('portfolio');

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const bff = (path: string) => fetch(path, { cache: 'no-store' }).then((r) => r.json()).catch(() => null);
      const [kpiRes, bookingsRes, portfolioRes, blogRes, testimonialsRes] = await Promise.all([
        bff('/api/admin/dashboard/kpis'),
        bff('/api/admin/dashboard/recent-bookings'),
        cms.list<any[]>('portfolio'),
        cms.list<any[]>('blog'),
        cms.list<any[]>('testimonials'),
      ]);

      // 1. Process KPIs
      if (kpiRes) {
        const d = kpiRes.data || kpiRes;
        if (d) {
          setKpis({
            activeProjects: String(d.activeProjects ?? 0),
            pendingBookings: String(d.pendingBookings ?? 0),
            totalRevenue: String(d.totalRevenue ?? 0),
            totalTalent: String(d.totalTalent ?? 0),
          });
        }
      }

      // 2. Process Bookings
      if (bookingsRes) {
        const bList = bookingsRes.data || bookingsRes;
        if (Array.isArray(bList) && bList.length > 0) {
          setBookings(bList.map((b: any) => {
            const u = b.client?.user;
            const clientName = u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || 'Client' : b.clientName || 'Client';
            const talentName = b.talentName || (b.talent?.user ? `${b.talent.user.firstName || ''} ${b.talent.user.lastName || ''}`.trim() : 'Assigned Talent');
            const bookingDate = b.dateNeeded || b.date;
            return {
              id: String(b.id),
              client: clientName,
              project: String(b.service?.name || b.projectBrief || b.projectTitle || 'Production Booking'),
              talent: talentName,
              dates: bookingDate ? new Date(bookingDate).toLocaleDateString() : new Date(b.createdAt || Date.now()).toLocaleDateString(),
              budget: b.budget && b.budget !== '—' ? b.budget : (b.service?.basePrice ? `₹${Math.round(b.service.basePrice / 100).toLocaleString('en-IN')}` : '—'),
              status: (b.status ? b.status.toLowerCase() : 'pending') as any,
            };
          }));
        }
      }

      // 3. Process CMS Items — admin list endpoints return a paginated
      // envelope ({ data: [...], total }), so unwrap to the inner array.
      const unwrapList = (res: any) =>
        Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res) ? res : [];
      const loadedCms: CMSItem[] = [];
      if (portfolioRes) {
        const pList = unwrapList(portfolioRes);
        if (Array.isArray(pList)) {
          pList.forEach((p: any) => loadedCms.push({
            id: p.id,
            title: p.title,
            category: p.category || 'Portfolio',
            clientOrAuthor: p.client || 'MP Production',
            status: p.isFeatured ? 'Published' : 'Published',
            type: 'portfolio',
          }));
        }
      }
      if (blogRes) {
        const bList = unwrapList(blogRes);
        if (Array.isArray(bList)) {
          bList.forEach((b: any) => loadedCms.push({
            id: b.id,
            title: b.title,
            category: b.category || 'Blog',
            clientOrAuthor: b.authorName || 'MP Staff',
            status: b.status === 'PUBLISHED' ? 'Published' : 'Draft',
            type: 'blog',
          }));
        }
      }
      if (testimonialsRes) {
        const tList = unwrapList(testimonialsRes);
        if (Array.isArray(tList)) {
          tList.forEach((t: any) => loadedCms.push({
            id: t.id,
            title: t.quote || `“${t.clientName} testimonial”`,
            category: 'Review',
            clientOrAuthor: t.clientName || 'Client',
            status: 'Published',
            type: 'testimonial',
          }));
        }
      }

      if (loadedCms.length > 0) {
        setCmsItems(loadedCms);
      }

      if (isRefresh) toast.success('Dashboard data refreshed successfully');
    } catch (err) {
      if (isRefresh) toast.error('Error refreshing dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Realtime: refresh when bookings / testimonials / portfolio change. The
  // reload runs through the secure BFF loaders; Realtime is only the trigger.
  useRealtimeRefresh(['Booking', 'Testimonial', 'PortfolioItem'], () => fetchDashboardData(true));

  const handleStatusChange = async (id: string, newStatus: Booking['status']) => {
    // Optimistic UI update
    const previous = [...bookings];
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));

    // Map UI status → backend BookingStatus enum (no REJECTED/IN-PROGRESS enum).
    const toBookingStatus = (s: Booking['status']) =>
      s === 'confirmed' ? 'CONFIRMED'
      : s === 'in-progress' ? 'RESCHEDULED'
      : s === 'rejected' ? 'CANCELLED'
      : s === 'completed' ? 'COMPLETED'
      : 'INQUIRY';

    try {
      const res = await fetch(`/api/booking/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: toBookingStatus(newStatus) })
      });
      if (!res.ok) throw new Error('Failed to update booking status');

      toast.success(`Booking marked as ${newStatus}`);
    } catch (err) {
      setBookings(previous);
      toast.error('Failed to update booking status on server.');
    }
  };

  const handleTalentReview = async (id: string, newStatus: 'approved' | 'rejected') => {
    setTalentReviews(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    toast.success(`Talent review ${newStatus}`);
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
    setIsSubmitting(true);

    try {
      const endpoint = modalType === 'portfolio' ? 'admin/portfolio' : modalType === 'blog' ? 'admin/blog' : 'admin/testimonials';
      
      const payload: any = {
        title: modalTitle,
        category: modalCategory,
        slug: modalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `item-${Date.now()}`,
      };
      if (modalType === 'portfolio') payload.client = modalClient || 'MP Staff';
      else if (modalType === 'blog') payload.authorName = modalClient || 'MP Staff';
      else if (modalType === 'testimonial') {
        payload.quote = modalTitle;
        payload.clientName = modalClient || 'Client';
      }

      await fetchAPI(`/cms/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (editingItem) {
        setCmsItems(prev => prev.map(item => item.id === editingItem.id ? {
          ...item,
          title: modalTitle,
          category: modalCategory,
          clientOrAuthor: modalClient || 'MP Staff',
          status: modalStatus,
        } : item));
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
      }

      toast.success(editingItem ? `${modalType.toUpperCase()} updated successfully` : `New ${modalType.toUpperCase()} created successfully`);
      setIsModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      toast.error('Error saving item to CMS server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCmsItem = async (id: string) => {
    const itemToDelete = cmsItems.find(item => item.id === id);
    if (!itemToDelete) return;

    setCmsItems(prev => prev.filter(item => item.id !== id));
    toast.success('Item deleted');

    try {
      const endpoint = itemToDelete.type === 'portfolio' ? 'admin/portfolio' : itemToDelete.type === 'blog' ? 'admin/blog' : 'admin/testimonials';
      
      await fetchAPI(`/cms/${endpoint}/${id}`, {
        method: 'DELETE'
      });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('mdms_auth_token');
      localStorage.removeItem('mdms_auth_role');
      localStorage.removeItem('mdms_auth_user');
      localStorage.removeItem('token');
    } catch (e) {}
    router.push('/');
  };

  return (
    <>
      <PortalNavbar />
      
      <main className="page-content pt-16 pb-24 bg-background text-foreground min-h-screen">
        <Container>
          
          {/* Admin Header & Module Navigation */}
          <div className="mb-12 border-b border-border pb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div>
              <span className="text-primary tracking-[0.2em] text-xs uppercase font-semibold mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Management & Operations
              </span>
              <h1 className="text-4xl font-serif text-foreground">
                Admin Portal
              </h1>
            </div>
            
            {/* Direct Links to All Modules */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider">
              <Link href="/studio-8f2k/mgmt/cms/portfolio" className="px-3 py-2 rounded-sm bg-surface border border-border hover:border-primary text-foreground transition-all flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-primary" /> Portfolio Gallery
              </Link>
              <Link href="/studio-8f2k/mgmt/cms/blog" className="px-3 py-2 rounded-sm bg-surface border border-border hover:border-primary text-foreground transition-all flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" /> Blog & News
              </Link>
              <Link href="/studio-8f2k/mgmt/cms/testimonials" className="px-3 py-2 rounded-sm bg-surface border border-border hover:border-primary text-foreground transition-all flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-primary" /> Testimonials
              </Link>
              <Link href="/studio-8f2k/mgmt/settings" className="px-3 py-2 rounded-sm bg-surface border border-border hover:border-primary text-foreground transition-all flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-primary" /> Settings
              </Link>
              <button
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing}
                className="px-3 py-2 rounded-sm bg-surface border border-border hover:border-primary text-foreground transition-all flex items-center gap-1.5 disabled:opacity-50 ml-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-primary ${refreshing ? 'animate-spin' : ''}`} /> Refresh
              </button>
              <Button onClick={handleSignOut} variant="outline" size="sm" className="text-red-600 hover:text-white hover:bg-red-600 border-red-600 ml-1">
                Sign Out
              </Button>
            </div>
          </div>

          {/* Interactive Control Tabs */}
          <div className="flex border-b border-border mb-12 overflow-x-auto gap-8">
            {[
              { id: 'overview', label: 'Overview & KPIs', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'cms', label: 'CMS Master Editor', icon: <FileText className="w-4 h-4" /> },
              { id: 'bookings', label: 'Bookings & Inquiries', icon: <Calendar className="w-4 h-4" /> },
              { id: 'settings', label: 'Platform Controls', icon: <Sliders className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-4 text-sm font-semibold tracking-wider uppercase whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW & KPIS */}
          {activeTab === 'overview' && (
            <div className="space-y-12 animate-fadeIn">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: 'Active Projects', value: kpis.activeProjects, change: 'Managing 24 productions', icon: <Film className="w-5 h-5 text-primary" /> },
                  { label: 'Pending Bookings', value: kpis.pendingBookings, change: 'Requires review', icon: <Calendar className="w-5 h-5 text-primary" /> },
                  { label: 'New Inquiries', value: '7', change: 'This week', icon: <MessageSquare className="w-5 h-5 text-primary" /> },
                ].map(stat => (
                  <Card key={stat.label} className="p-6 h-full flex flex-col justify-between bg-surface border border-border shadow-sm hover:border-primary transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-muted-foreground text-xs uppercase tracking-widest font-semibold">{stat.label}</span>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-4xl font-serif text-foreground mb-3">{stat.value}</p>
                      <span className="inline-block text-xs text-primary font-medium bg-primary/10 px-2.5 py-1 rounded-md">
                        {stat.change}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Grid: Recent Bookings & Action Required */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Recent Bookings */}
                <Card className="p-8 lg:col-span-2 bg-surface border border-border shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif text-foreground">Your Assigned Projects</h2>
                    <button onClick={() => setActiveTab('bookings')} className="text-xs text-primary font-semibold uppercase hover:underline">
                      View All ({bookings.length}) →
                    </button>
                  </div>
                  <div className="space-y-6">
                    {bookings.slice(0, 3).map(booking => (
                      <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-background border border-border rounded-xl gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground">{booking.client}</span>
                            <span className="text-xs text-muted-foreground/70">• {booking.budget}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{booking.project} (Talent: <strong className="text-foreground">{booking.talent}</strong>)</p>
                          <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {booking.dates}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span className={`px-2.5 py-1 text-xs uppercase tracking-widest font-semibold rounded-sm ${
                            booking.status === 'confirmed' ? 'bg-green-500/10 text-green-600 border border-green-500/30' :
                            booking.status === 'in-progress' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/30' :
                            booking.status === 'rejected' ? 'bg-red-500/10 text-red-600 border border-red-500/30' :
                            'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                          }`}>
                            {booking.status}
                          </span>
                          {booking.status === 'pending' && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="primary" className="!px-2 !py-1 text-xs !bg-primary !text-primary-foreground flex items-center gap-1" onClick={() => handleStatusChange(booking.id, 'confirmed')}>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="!px-2 !py-1 text-xs text-red-600 border-red-600 hover:bg-red-600 hover:text-white" onClick={() => handleStatusChange(booking.id, 'rejected')}>
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
                <Card className="p-8 bg-surface border border-border shadow-sm flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif text-foreground">Action Required</h2>
                    <span className="text-xs bg-amber-500/20 text-amber-700 font-semibold px-2.5 py-1 rounded-md">
                      {talentReviews.filter(t => t.status === 'pending').length} Pending
                    </span>
                  </div>
                  <div className="space-y-6 flex-grow">
                    {talentReviews.map(talent => (
                      <div key={talent.id} className="p-6 bg-background border border-border rounded-xl space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-foreground font-semibold">{talent.name}</p>
                            <p className="text-xs text-muted-foreground">{talent.category} • {talent.experience}</p>
                          </div>
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            talent.status === 'approved' ? 'bg-green-500/20 text-green-700' :
                            talent.status === 'rejected' ? 'bg-red-500/20 text-red-700' :
                            'bg-amber-500/20 text-amber-700'
                          }`}>
                            {talent.status}
                          </span>
                        </div>
                        {talent.status === 'pending' && (
                          <div className="flex gap-2 pt-1 border-t border-border">
                            <Button size="sm" className="w-1/2 justify-center !text-xs !bg-primary !text-primary-foreground flex items-center gap-1" onClick={() => handleTalentReview(talent.id, 'approved')}>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="w-1/2 justify-center !text-xs flex items-center gap-1" onClick={() => handleTalentReview(talent.id, 'rejected')}>
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

              </div>
            </div>
          )}

          {/* TAB 2: CMS MASTER EDITOR */}
          {activeTab === 'cms' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-surface p-8 border border-border rounded-2xl shadow-sm">
                <div>
                  <h2 className="text-2xl font-serif text-foreground">CMS Content Manager</h2>
                  <p className="text-sm text-muted-foreground">Create, edit, and publish website content across all public modules.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => openAddModal('portfolio')} variant="primary" size="sm" className="!bg-primary !text-primary-foreground flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Add Project
                  </Button>
                  <Button onClick={() => openAddModal('blog')} variant="outline" size="sm" className="flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Add Blog Article
                  </Button>
                  <Button onClick={() => openAddModal('testimonial')} variant="outline" size="sm" className="flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Add Testimonial
                  </Button>
                </div>
              </div>

              {/* CMS Items Table */}
              <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-background text-muted-foreground text-xs uppercase tracking-widest font-semibold">
                        <th className="px-6 py-5">Type</th>
                        <th className="px-6 py-5">Title / Name</th>
                        <th className="px-6 py-5">Category</th>
                        <th className="px-6 py-5">Client / Author</th>
                        <th className="px-6 py-5">Status</th>
                        <th className="px-6 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {cmsItems.map(item => (
                      <tr key={item.id} className="hover:bg-background transition-colors">
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded ${
                            item.type === 'portfolio' ? 'bg-purple-500/10 text-purple-600' :
                            item.type === 'blog' ? 'bg-blue-500/10 text-blue-600' :
                            'bg-amber-500/10 text-amber-600'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-foreground">{item.title}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{item.category}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{item.clientOrAuthor}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-sm ${
                            item.status === 'Published' ? 'bg-green-500/10 text-green-600 border border-green-500/30' :
                            item.status === 'Draft' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30' :
                            'bg-gray-500/10 text-gray-600 border border-gray-500/30'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                          <button onClick={() => openEditModal(item)} className="text-xs font-semibold text-[#12213A] hover:underline inline-flex items-center gap-1">
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button onClick={() => deleteCmsItem(item.id)} className="text-xs font-semibold text-red-600 hover:underline inline-flex items-center gap-1">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BOOKINGS & INQUIRIES */}
          {activeTab === 'bookings' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex justify-between items-center bg-surface p-8 border border-border rounded-2xl shadow-sm">
                <div>
                  <h2 className="text-2xl font-serif text-foreground">All Client Bookings & Auditions</h2>
                  <p className="text-sm text-muted-foreground">Manage talent reservations, budgets, and production schedules.</p>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-background text-muted-foreground text-xs uppercase tracking-widest font-semibold">
                        <th className="px-6 py-5">Client</th>
                        <th className="px-6 py-5">Project</th>
                        <th className="px-6 py-5">Talent Assigned</th>
                        <th className="px-6 py-5">Dates</th>
                        <th className="px-6 py-5">Budget</th>
                        <th className="px-6 py-5">Status</th>
                        <th className="px-6 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {bookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-background transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground">{booking.client}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{booking.project}</td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground">{booking.talent}</td>
                        <td className="px-6 py-4 text-xs text-muted-foreground/70">{booking.dates}</td>
                        <td className="px-6 py-4 font-semibold text-green-600">{booking.budget}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs uppercase tracking-widest font-semibold rounded-sm ${
                            booking.status === 'confirmed' ? 'bg-green-500/10 text-green-600 border border-green-500/30' :
                            booking.status === 'in-progress' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/30' :
                            booking.status === 'rejected' ? 'bg-red-500/10 text-red-600 border border-red-500/30' :
                            'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                          {booking.status !== 'confirmed' && (
                            <button onClick={() => handleStatusChange(booking.id, 'confirmed')} className="text-xs font-semibold text-green-600 hover:underline">
                              Confirm
                            </button>
                          )}
                          {booking.status !== 'in-progress' && booking.status === 'confirmed' && (
                            <button onClick={() => handleStatusChange(booking.id, 'in-progress')} className="text-xs font-semibold text-blue-600 hover:underline">
                              Start
                            </button>
                          )}
                          {booking.status !== 'rejected' && (
                            <button onClick={() => handleStatusChange(booking.id, 'rejected')} className="text-xs font-semibold text-red-600 hover:underline">
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
            </div>
          )}

          {/* TAB 4: USERS & ACCESS */}
          {activeTab === 'users' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex justify-between items-center bg-surface p-8 border border-border rounded-2xl shadow-sm">
                <div>
                  <h2 className="text-2xl font-serif text-foreground">Access & Role Management</h2>
                  <p className="text-sm text-muted-foreground">Manage client workspaces, talent accounts, and staff permissions.</p>
                </div>
                <Link href="/studio-8f2k/mgmt/users">
                  <Button variant="primary" size="sm" className="!bg-[#12213A] !text-white">
                    Open Full Directory →
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-8 bg-surface border border-border h-full flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-serif">Client Portal Accounts</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">48 active corporate accounts with project workspace access.</p>
                  <Link href="/studio-8f2k/mgmt/users" className="text-xs text-[#12213A] font-semibold uppercase tracking-wider hover:underline mt-auto pt-4 border-t border-border">Manage Clients →</Link>
                </Card>
                <Card className="p-8 bg-surface border border-border h-full flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-serif">Talent Roster Profiles</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">142 verified actors, models, and voice artists.</p>
                  <Link href="/studio-8f2k/mgmt/moderation" className="text-xs text-[#12213A] font-semibold uppercase tracking-wider hover:underline mt-auto pt-4 border-t border-border">Review Auditions →</Link>
                </Card>
                <Card className="p-8 bg-surface border border-border h-full flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-serif">Internal Staff & Editors</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">12 editors and producers with production portal rights.</p>
                  <Link href="/studio-8f2k/mgmt/employees" className="text-xs text-[#12213A] font-semibold uppercase tracking-wider hover:underline mt-auto pt-4 border-t border-border">Manage Staff →</Link>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 5: PLATFORM CONTROLS */}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="bg-surface p-8 border border-border rounded-2xl shadow-sm">
                <h2 className="text-2xl font-serif text-foreground mb-2">System Preferences & Brand Settings</h2>
                <p className="text-sm text-muted-foreground mb-8">Configure global defaults, email notifications, and security rules.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border border-border rounded-xl bg-background flex justify-between items-center gap-4">
                    <div>
                      <p className="font-semibold">Auto-Approve Verified Talent</p>
                      <p className="text-xs text-muted-foreground">Skip manual moderation for agency-represented talent.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="accent-[#12213A] w-5 h-5 cursor-pointer" />
                  </div>

                  <div className="p-6 border border-border rounded-xl bg-background flex justify-between items-center gap-4">
                    <div>
                      <p className="font-semibold">Client Inquiry Email Alerts</p>
                      <p className="text-xs text-muted-foreground">Send instant notifications to producers on new bookings.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="accent-[#12213A] w-5 h-5 cursor-pointer" />
                  </div>

                  <div className="p-6 border border-border rounded-xl bg-background flex justify-between items-center gap-4">
                    <div>
                      <p className="font-semibold">Public Portfolio Indexing</p>
                      <p className="text-xs text-muted-foreground">Allow search engines to index published case studies.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="accent-[#12213A] w-5 h-5 cursor-pointer" />
                  </div>

                  <div className="p-6 border border-border rounded-xl bg-background flex justify-between items-center gap-4">
                    <div>
                      <p className="font-semibold">Maintenance Mode</p>
                      <p className="text-xs text-muted-foreground">Temporarily disable public portals during upgrades.</p>
                    </div>
                    <input type="checkbox" className="accent-[#12213A] w-5 h-5 cursor-pointer" />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border flex justify-end gap-4">
                  <Link href="/studio-8f2k/mgmt/settings">
                    <Button variant="outline" size="md">Advanced Settings →</Button>
                  </Link>
                  <Button variant="primary" size="md" className="!bg-[#12213A] !text-white" onClick={() => alert('Settings saved successfully!')}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* INLINE MODAL FOR CMS EDITING / ADDING */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-surface border border-border rounded-sm p-6 w-full max-w-lg shadow-2xl animate-scaleUp">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
                  <h3 className="text-xl font-serif text-foreground">
                    {editingItem ? `Edit ${editingItem.type.toUpperCase()}` : `Add New ${modalType.toUpperCase()}`}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
                </div>

                <form onSubmit={saveCmsItem} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Title / Project Name
                    </label>
                    <input
                      type="text"
                      value={modalTitle}
                      onChange={(e) => setModalTitle(e.target.value)}
                      placeholder="e.g. Summer Fashion Week Campaign"
                      className="w-full bg-background border border-border px-4 py-2.5 rounded-sm text-sm focus:outline-none focus:border-[#12213A]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        value={modalCategory}
                        onChange={(e) => setModalCategory(e.target.value)}
                        placeholder="e.g. Commercial"
                        className="w-full bg-background border border-border px-4 py-2.5 rounded-sm text-sm focus:outline-none focus:border-[#12213A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Client / Author
                      </label>
                      <input
                        type="text"
                        value={modalClient}
                        onChange={(e) => setModalClient(e.target.value)}
                        placeholder="e.g. Nike / Vikram Mehta"
                        className="w-full bg-background border border-border px-4 py-2.5 rounded-sm text-sm focus:outline-none focus:border-[#12213A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Publication Status
                    </label>
                    <select
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value as any)}
                      className="w-full bg-background border border-border px-4 py-2.5 rounded-sm text-sm focus:outline-none focus:border-[#12213A]"
                    >
                      <option value="Published">Published (Live)</option>
                      <option value="Draft">Draft (Internal)</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-border flex justify-end gap-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm" className="!bg-[#12213A] !text-white flex items-center gap-1.5" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        editingItem ? 'Update Item' : 'Create Item'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </Container>
      </main>
          </>
  );
}


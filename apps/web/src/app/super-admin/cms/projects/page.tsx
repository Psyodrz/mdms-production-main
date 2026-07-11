'use client';

import { useEffect, useState, useCallback } from 'react';
import { CmsShell } from '../_components/CmsShell';
import { toast } from 'sonner';
import { fetchAPI } from '@/lib/api-client';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  RefreshCw,
} from 'lucide-react';

const PROJECT_STATUSES = [
  'BOOKED',
  'PRE_PRODUCTION',
  'SHOOT',
  'EDITING',
  'REVIEW',
  'REVISION',
  'DELIVERED',
  'COMPLETED',
  'ON_HOLD',
  'CANCELLED',
];

const STATUS_COLORS: Record<string, string> = {
  BOOKED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PRE_PRODUCTION: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  SHOOT: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  EDITING: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  REVIEW: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  REVISION: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  DELIVERED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
  ON_HOLD: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function formatStatus(s: string) {
  return s.replace(/_/g, ' ');
}

function formatPrice(paise: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(paise / 100);
}

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ProjectsCmsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetchAPI(`/admin/projects?${params.toString()}`);
      if (res?.success) {
        setProjects(res.data || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const openDetail = async (projectId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetchAPI(`/admin/projects/${projectId}`);
      if (res?.success && res.data) {
        setSelectedProject(res.data);
      }
    } catch {
      toast.error('Failed to load project details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusUpdate = async (projectId: string, newStatus: string) => {
    setUpdatingStatus(projectId);
    try {
      const res = await fetchAPI(`/admin/projects/${projectId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res?.success) {
        toast.success(`Project status updated to ${formatStatus(newStatus)}`);
        loadProjects();
        if (selectedProject?.id === projectId) {
          setSelectedProject({ ...selectedProject, status: newStatus });
        }
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <CmsShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Client Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {total} total project{total !== 1 ? 's' : ''} across all clients
            </p>
          </div>
          <button
            onClick={() => { setPage(1); loadProjects(); }}
            className="flex items-center gap-2 px-4 py-2 bg-brand/10 border border-brand/30 rounded-lg text-brand text-sm hover:bg-brand/20 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="pl-10 pr-8 py-2.5 bg-surface border border-border rounded-lg text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-brand min-w-[180px]"
            >
              <option value="">All Statuses</option>
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>{formatStatus(s)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Projects Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No projects found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface/50 border-b border-border">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Project</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Client</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Service</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Shoot Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Delivery</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Amount</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p: any) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-surface/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground truncate max-w-[200px]">{p.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <MapPin className="inline w-3 h-3 mr-1" />{p.shootLocation || '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-foreground">{p.booking?.client?.user?.firstName} {p.booking?.client?.user?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{p.booking?.client?.user?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-foreground">{p.booking?.service?.name || '—'}</p>
                        <p className="text-xs text-muted-foreground">{p.booking?.service?.category}</p>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={p.status}
                          onChange={(e) => handleStatusUpdate(p.id, e.target.value)}
                          disabled={updatingStatus === p.id}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer bg-transparent ${STATUS_COLORS[p.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}
                        >
                          {PROJECT_STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-background text-foreground">{formatStatus(s)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        <Calendar className="inline w-3.5 h-3.5 mr-1.5" />{formatDate(p.shootDate)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        <Clock className="inline w-3.5 h-3.5 mr-1.5" />{formatDate(p.deliveryDate)}
                      </td>
                      <td className="px-4 py-3 text-foreground font-mono whitespace-nowrap">
                        {p.booking?.quoteAmount ? formatPrice(p.booking.quoteAmount) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openDetail(p.id)}
                          className="p-2 hover:bg-brand/10 rounded-lg transition-colors text-muted-foreground hover:text-brand"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages} ({total} projects)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-border rounded-lg hover:bg-surface disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-border rounded-lg hover:bg-surface disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {(selectedProject || detailLoading) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedProject(null)}>
            <div
              className="bg-background border border-border rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {detailLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-brand" />
                </div>
              ) : selectedProject && (
                <div className="p-6 space-y-6">
                  {/* Modal Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{selectedProject.name}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedProject.booking?.client?.user?.firstName} {selectedProject.booking?.client?.user?.lastName} — {selectedProject.booking?.client?.user?.email}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[selectedProject.status] || ''}`}>
                      {formatStatus(selectedProject.status)}
                    </span>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-surface/50 border border-border rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-1">Shoot Date</p>
                      <p className="text-sm font-medium text-foreground">{formatDate(selectedProject.shootDate)}</p>
                    </div>
                    <div className="bg-surface/50 border border-border rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-1">Location</p>
                      <p className="text-sm font-medium text-foreground truncate">{selectedProject.shootLocation || '—'}</p>
                    </div>
                    <div className="bg-surface/50 border border-border rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-1">Edit Deadline</p>
                      <p className="text-sm font-medium text-foreground">{formatDate(selectedProject.editDeadline)}</p>
                    </div>
                    <div className="bg-surface/50 border border-border rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-1">Delivery</p>
                      <p className="text-sm font-medium text-foreground">{formatDate(selectedProject.deliveryDate)}</p>
                    </div>
                  </div>

                  {/* Equipment & Notes */}
                  {selectedProject.equipmentNotes && (
                    <div className="bg-surface/30 border border-border rounded-xl p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Equipment</p>
                      <p className="text-sm text-foreground">{selectedProject.equipmentNotes}</p>
                    </div>
                  )}

                  {/* Milestones */}
                  {selectedProject.milestones?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Milestones</p>
                      <div className="space-y-2">
                        {selectedProject.milestones.map((m: any) => (
                          <div key={m.id} className="flex items-center gap-3 bg-surface/30 border border-border rounded-lg px-4 py-2.5">
                            {m.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                            )}
                            <span className={`text-sm flex-1 ${m.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                              {m.title}
                            </span>
                            <span className="text-xs text-muted-foreground">{formatDate(m.dueDate)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payments */}
                  {selectedProject.payments?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Payments</p>
                      <div className="space-y-2">
                        {selectedProject.payments.map((pay: any) => (
                          <div key={pay.id} className="flex items-center justify-between bg-surface/30 border border-border rounded-lg px-4 py-2.5">
                            <div className="flex items-center gap-3">
                              <DollarSign className="w-4 h-4 text-green-400" />
                              <span className="text-sm text-foreground">{pay.type}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-mono font-medium text-foreground">{formatPrice(pay.amount)}</span>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${pay.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                {pay.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Internal Notes */}
                  {selectedProject.internalNotes && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">Internal Notes</p>
                      <p className="text-sm text-foreground">{selectedProject.internalNotes}</p>
                    </div>
                  )}

                  {/* Close button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="px-5 py-2 bg-surface border border-border rounded-lg text-sm text-foreground hover:bg-surface/80 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </CmsShell>
  );
}

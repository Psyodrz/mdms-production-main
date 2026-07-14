"use client";

import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Reveal } from '@/components/ui/Reveal';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Trash2, Edit3, Loader2, Plus } from 'lucide-react';



export default function EmployeeRoster() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEmployees = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('mdms_auth_token') : null;
      const res = await fetch(`${apiUrl}/employee`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.ok) {
        const json = await res.json();
        const list = json.data || json;
        if (Array.isArray(list)) {
          setEmployees(list.length > 0 ? list : []);
        }
        if (isRefresh) toast.success('Employee roster refreshed');
      } else {
        if (isRefresh) toast.error('Failed to fetch employee roster');
      }
    } catch (err) {
      if (isRefresh) toast.error('Network error refreshing roster');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !designation.trim()) {
      toast.error('Please enter employee email and designation');
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('mdms_auth_token') : null;
      
      const res = await fetch(`${apiUrl}/employee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          email,
          designation,
          department,
          joiningDate
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || 'Failed to create employee');
      }
      toast.success('Employee record added successfully');
      setIsModalOpen(false);
      setEmail('');
      setDesignation('');
      setDepartment('');
      fetchEmployees(true);
    } catch (err: any) {
      toast.error(err.message || 'Error adding employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this employee record?')) return;
    setEmployees(prev => prev.filter(e => e.id !== id));
    toast.success('Employee record removed');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('mdms_auth_token') : null;
      await fetch(`${apiUrl}/employee/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      fetchEmployees();
    } catch (err) {
      toast.error('Failed to delete on server');
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
                  Internal Operations
                </span>
                <h1 className="text-4xl font-serif text-foreground">
                  Employee Roster
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchEmployees(true)}
                  disabled={refreshing}
                  className="px-4 py-3 bg-surface border border-border hover:border-primary rounded-sm text-sm font-semibold tracking-widest uppercase flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-primary ${refreshing ? 'animate-spin' : ''}`} /> Refresh
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 bg-primary text-white font-semibold tracking-widest text-sm uppercase hover:bg-primary/80 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Employee
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
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 overflow-x-auto rounded-xl shadow-sm">
                
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-muted-foreground text-xs tracking-widest uppercase font-semibold">
                      <th className="pb-4">Name & Email</th>
                      <th className="pb-4">Designation</th>
                      <th className="pb-4">Department</th>
                      <th className="pb-4">Joined Date</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {employees.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-muted-foreground">
                          No employees found. Add your first employee above.
                        </td>
                      </tr>
                    ) : (
                      employees.map((emp: any) => (
                        <tr key={emp.id} className="hover:bg-[var(--color-base)] transition-colors">
                          <td className="py-4 font-medium text-foreground">
                            {emp.user?.firstName || 'Employee'} {emp.user?.lastName || ''}
                            <span className="block text-xs text-muted-foreground font-normal mt-0.5">{emp.user?.email || emp.email || 'No email provided'}</span>
                          </td>
                          <td className="py-4 text-muted-foreground text-sm font-medium">{emp.designation || '-'}</td>
                          <td className="py-4 text-muted-foreground text-sm">
                            <span className="px-2 py-0.5 bg-surface border border-border rounded text-[11px] uppercase tracking-wider font-semibold">
                              {emp.department || 'General'}
                            </span>
                          </td>
                          <td className="py-4 text-muted-foreground text-sm">
                            {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleDelete(emp.id)}
                              className="text-red-500 hover:text-red-400 text-xs uppercase tracking-widest transition-colors font-semibold inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
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
                <h2 className="text-2xl font-serif text-foreground mb-6">Add Employee Profile</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">User Email Address</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none text-foreground" 
                      placeholder="e.g. s.roy@mpproduction.com"
                      required 
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">The user must exist or will be linked by email address.</p>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Designation / Job Title</label>
                    <input 
                      type="text" 
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none text-foreground" 
                      placeholder="e.g. Senior Producer"
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Department</label>
                      <input 
                        type="text" 
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none text-foreground" 
                        placeholder="e.g. Production"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Joining Date</label>
                      <input 
                        type="date" 
                        value={joiningDate}
                        onChange={(e) => setJoiningDate(e.target.value)}
                        className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none text-foreground" 
                      />
                    </div>
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
                      'Save Employee'
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


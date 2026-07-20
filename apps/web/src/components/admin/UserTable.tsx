'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, ShieldAlert, UserMinus, UserCheck, Key, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface UserTableProps {
  currentUserRole: 'ADMIN' | 'SUPER_ADMIN';
}

export function UserTable({ currentUserRole }: UserTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  
  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Modal / Confirmations
  const [confirmAction, setConfirmAction] = useState<{
    type: 'role' | 'deactivate' | 'reactivate' | 'reset-mfa';
    userId: string;
    userName: string;
    payload?: any;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(roleFilter && { role: roleFilter }),
      });

      const res = await fetch(`/api/admin/users?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }

      const json = await res.json();
      setUsers(json.data || []);
      setTotal(json.total || 0);
      setTotalPages(json.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load user directory.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearch, roleFilter]);

  // Executing Action API Calls
  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);

    const { type, userId, payload } = confirmAction;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      let endpoint = '';
      let method = 'PATCH';
      let body: string | undefined = undefined;

      if (type === 'role') {
        endpoint = `/api/admin/users/${userId}/role`;
        body = JSON.stringify({ role: payload.newRole });
      } else if (type === 'deactivate') {
        endpoint = `/api/admin/users/${userId}/deactivate`;
      } else if (type === 'reactivate') {
        endpoint = `/api/admin/users/${userId}/reactivate`;
      } else if (type === 'reset-mfa') {
        endpoint = `/api/admin/users/${userId}/reset-mfa`;
        method = 'POST';
      }

      const res = await fetch(endpoint, { method, headers, body });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || 'Operation failed');
      }

      toast.success(
        type === 'role' ? 'User role updated successfully.' :
        type === 'deactivate' ? 'User account suspended.' :
        type === 'reactivate' ? 'User account reactivated.' :
        'MFA reset completed successfully.'
      );
      
      setConfirmAction(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const rolesList = [
    'SUPER_ADMIN',
    'ADMIN',
    'PROJECT_MANAGER',
    'EDITOR',
    'EMPLOYEE',
    'TALENT',
    'CLIENT',
    'GUEST'
  ];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface p-4 border border-border rounded-xl shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-border rounded-lg bg-background text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          >
            <option value="">All Roles</option>
            {rolesList.map((r) => (
              <option key={r} value={r}>
                {r.replace('_', ' ')}
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchUsers()}
            disabled={loading}
            className="p-2 border border-border rounded-lg bg-background hover:bg-surface text-foreground transition-colors disabled:opacity-50"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground text-xs uppercase tracking-widest font-semibold">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4.5">
                      <div className="h-4 bg-muted/40 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No users found matching the criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => {
                          const newRole = e.target.value;
                          setConfirmAction({
                            type: 'role',
                            userId: user.id,
                            userName: `${user.firstName} ${user.lastName}`,
                            payload: { oldRole: user.role, newRole },
                          });
                        }}
                        className="px-2.5 py-1 border border-border rounded-lg bg-background text-xs font-semibold text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
                      >
                        {rolesList.map((r) => (
                          <option
                            key={r}
                            value={r}
                            disabled={r === 'SUPER_ADMIN' && currentUserRole !== 'SUPER_ADMIN'}
                          >
                            {r.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setConfirmAction({
                            type: user.isActive ? 'deactivate' : 'reactivate',
                            userId: user.id,
                            userName: `${user.firstName} ${user.lastName}`,
                          });
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider border cursor-pointer transition-all ${
                          user.isActive
                            ? 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20'
                            : 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20'
                        }`}
                      >
                        {user.isActive ? (
                          <>
                            <UserCheck className="w-3 h-3" /> Active
                          </>
                        ) : (
                          <>
                            <UserMinus className="w-3 h-3" /> Suspended
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {currentUserRole === 'SUPER_ADMIN' && (
                        <button
                          onClick={() => {
                            setConfirmAction({
                              type: 'reset-mfa',
                              userId: user.id,
                              userName: `${user.firstName} ${user.lastName}`,
                            });
                          }}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-semibold uppercase tracking-wider hover:underline"
                          title="Reset Multi-Factor Authentication"
                        >
                          <Key className="w-3.5 h-3.5" /> Reset MFA
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-border bg-muted/10">
            <span className="text-xs text-muted-foreground">
              Showing page <strong className="text-foreground">{page}</strong> of{' '}
              <strong className="text-foreground">{totalPages}</strong> ({total} total users)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-border rounded-lg bg-background text-xs font-semibold text-foreground hover:bg-surface disabled:opacity-50 disabled:hover:bg-background transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-border rounded-lg bg-background text-xs font-semibold text-foreground hover:bg-surface disabled:opacity-50 disabled:hover:bg-background transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full shadow-2xl p-6 space-y-6 animate-scaleIn">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-lg">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-serif text-foreground">Confirm Security Action</h3>
                <p className="text-sm text-muted-foreground">
                  {confirmAction.type === 'role' && (
                    <>
                      Are you sure you want to change the role of{' '}
                      <strong className="text-foreground">{confirmAction.userName}</strong> from{' '}
                      <strong className="text-foreground">{confirmAction.payload.oldRole}</strong> to{' '}
                      <strong className="text-primary font-bold">{confirmAction.payload.newRole}</strong>?
                    </>
                  )}
                  {confirmAction.type === 'deactivate' && (
                    <>
                      Are you sure you want to suspend{' '}
                      <strong className="text-foreground">{confirmAction.userName}</strong>? This user will immediately lose access to all portals and digital workspaces.
                    </>
                  )}
                  {confirmAction.type === 'reactivate' && (
                    <>
                      Are you sure you want to reactivate the account for{' '}
                      <strong className="text-foreground">{confirmAction.userName}</strong>? Access to their corresponding portals will be restored immediately.
                    </>
                  )}
                  {confirmAction.type === 'reset-mfa' && (
                    <>
                      Are you sure you want to reset Multi-Factor Authentication (MFA) for{' '}
                      <strong className="text-foreground">{confirmAction.userName}</strong>? They will be prompted to re-register their TOTP secret key on their next secure dashboard login.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={actionLoading}
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 border border-border hover:bg-muted/10 rounded-lg text-sm font-semibold text-foreground transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleConfirmAction}
                className="px-4 py-2 bg-primary text-white hover:bg-primary/90 font-bold rounded-lg text-sm transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

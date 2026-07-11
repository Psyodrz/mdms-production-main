'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/client';

const BASE_ROLES = [
  { value: 'CLIENT', label: 'Client' },
  { value: 'TALENT', label: 'Talent / Model' },
  { value: 'EDITOR', label: 'Editor' },
  { value: 'EMPLOYEE', label: 'Employee / Staff' },
  { value: 'PROJECT_MANAGER', label: 'Project Manager' },
];
const ELEVATED_ROLES = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
];

export default function CreateUserPage() {
  const router = useRouter();
  const [actorRole, setActorRole] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CLIENT' });

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        setActorRole((session?.user?.user_metadata?.role || '').toUpperCase());
      } catch { /* ignore */ }
    })();
  }, []);

  const isSuperAdmin = actorRole === 'SUPER_ADMIN';
  const roleOptions = isSuperAdmin ? [...BASE_ROLES, ...ELEVATED_ROLES] : BASE_ROLES;

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      toast.error('Enter a name, valid email, and a password of at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to create user');
      toast.success(`${form.role.replace('_', ' ')} account created for ${form.email}`);
      router.push('/studio-8f2k/mgmt/users');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PortalNavbar />
      <main className="page-content py-12">
        <Container size="md">
          <div className="mb-8 border-b border-border pb-6">
            <Button href="/studio-8f2k/mgmt/users" variant="ghost" size="sm" className="mb-4 -ml-4 text-muted-foreground hover:text-foreground">
              &larr; Back to Users
            </Button>
            <h1 className="text-4xl font-serif text-foreground">Create User</h1>
            <p className="text-muted-foreground mt-2">
              Provision a new account. {isSuperAdmin ? 'As Super Admin you can create any role, including Admin.' : 'Admins can create standard accounts.'}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-6 bg-surface border border-border rounded-2xl p-8">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Full Name</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary" placeholder="e.g. Aditya Sharma" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary" placeholder="user@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Temporary Password</label>
                <input type="text" value={form.password} onChange={(e) => set('password', e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary" placeholder="min 6 characters" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Role</label>
              <select value={form.role} onChange={(e) => set('role', e.target.value)} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-primary">
                {roleOptions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="pt-4 border-t border-border flex justify-end gap-3">
              <Button href="/studio-8f2k/mgmt/users" variant="outline" type="button">Cancel</Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create User'}
              </Button>
            </div>
          </form>
        </Container>
      </main>
    </>
  );
}

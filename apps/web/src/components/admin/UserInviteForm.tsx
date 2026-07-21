'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, UserPlus, Key, ShieldCheck, Mail, User, Sparkles, Loader2 } from 'lucide-react';

interface UserInviteFormProps {
  currentUserRole: 'ADMIN' | 'SUPER_ADMIN';
  backUrl: string;
}

const ALL_ROLES = [
  { value: 'CLIENT', label: 'Client / Brand Agency', desc: 'Can submit casting briefs & manage project deliverables' },
  { value: 'TALENT', label: 'Talent Roster', desc: 'Models, actors, voice artists & performance talent' },
  { value: 'EDITOR', label: 'Editor / Post-Production', desc: 'Access to editor portal & media asset upload tools' },
  { value: 'EMPLOYEE', label: 'Employee / Staff', desc: 'Internal studio operations & production staff' },
  { value: 'PROJECT_MANAGER', label: 'Project Manager', desc: 'Manages bookings, milestones & client projects' },
  { value: 'ADMIN', label: 'System Admin', desc: 'Full CMS, booking & user management access (Requires Super-Admin)', superOnly: true },
  { value: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Unrestricted system control, audit logs & security settings (Requires Super-Admin)', superOnly: true },
];

export function UserInviteForm({ currentUserRole, backUrl }: UserInviteFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CLIENT');
  const [loading, setLoading] = useState(false);

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 14; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    toast.success('Generated secure 14-character password');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    if (currentUserRole !== 'SUPER_ADMIN' && (role === 'ADMIN' || role === 'SUPER_ADMIN')) {
      toast.error('Only SUPER_ADMIN can assign ADMIN or SUPER_ADMIN roles.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        }),
      });

      const json = await res.json();

      if (res.ok && json.ok) {
        toast.success(`Account for ${name} (${role}) created successfully!`);
        router.push(backUrl);
        router.refresh();
      } else {
        toast.error(json.error || 'Failed to create user account.');
      }
    } catch (err) {
      toast.error('Network error creating user account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Reveal direction="up">
        <div className="mb-8 flex items-center justify-between">
          <Button href={backUrl} variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to User Directory
          </Button>
          <span className="text-xs font-mono tracking-widest text-primary uppercase font-bold px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
            {currentUserRole} Privileges Active
          </span>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-serif text-foreground mb-3 flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-brand" /> Provision New User
          </h1>
          <p className="text-muted-foreground font-light text-base">
            Create an authenticated user account, assign access roles, and initialize platform credentials.
          </p>
        </div>
      </Reveal>

      <Reveal direction="up" delay={0.1}>
        <Card className="p-8 sm:p-10 border border-border shadow-xl bg-card">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-brand" /> Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Vikram Malhotra"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-background border-border text-foreground h-12 text-base"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand" /> Corporate / Account Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="e.g. vikram@brand.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background border-border text-foreground h-12 text-base"
              />
            </div>

            {/* Initial Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Key className="w-4 h-4 text-brand" /> Initial Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateSecurePassword}
                  className="text-xs text-brand hover:underline font-mono inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Auto-Generate
                </button>
              </div>
              <Input
                type="text"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background border-border text-foreground font-mono h-12 text-base"
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-3 pt-4 border-t border-border">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand" /> Assign Access Role <span className="text-red-500">*</span>
              </label>
              
              <div className="grid grid-cols-1 gap-3">
                {ALL_ROLES.map((r) => {
                  const isDisabled = currentUserRole !== 'SUPER_ADMIN' && r.superOnly;
                  const isSelected = role === r.value;

                  return (
                    <label
                      key={r.value}
                      className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                        isDisabled
                          ? 'opacity-40 cursor-not-allowed bg-muted/20 border-border'
                          : isSelected
                            ? 'border-brand bg-brand/5 shadow-sm'
                            : 'border-border bg-background hover:bg-muted/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r.value}
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => setRole(r.value)}
                        className="mt-1 accent-brand"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground text-sm">{r.label}</span>
                          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border">
                            {r.value}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-light mt-1">{r.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-6 border-t border-border flex items-center justify-end gap-4">
              <Button href={backUrl} variant="outline" type="button">
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading} className="gap-2 px-8">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Provisioning Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Provision Account
                  </>
                )}
              </Button>
            </div>

          </form>
        </Card>
      </Reveal>
    </div>
  );
}
